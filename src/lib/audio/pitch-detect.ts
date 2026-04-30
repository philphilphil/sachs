/**
 * Microphone-based pitch detection for violin practice.
 *
 * Uses the Normalized Square Difference Function (NSDF) from McLeod's MPM
 * algorithm, which is robust against the strong overtones of a bowed violin
 * and against amplitude variation. Tuned for monophonic violin tones in
 * roughly G3..E6.
 */

import { PITCH_CLASSES, type PitchClass } from '$lib/utils/ear-training/music-theory';

export interface PitchReading {
  /** Detected fundamental frequency in Hz, or null if no clear pitch. */
  frequency: number | null;
  /** Detected MIDI note (rounded), or null. */
  midi: number | null;
  /** Detected pitch class, or null. */
  pitchClass: PitchClass | null;
  /** Cents deviation from the nearest semitone (-50..+50), or null. */
  cents: number | null;
  /** Signal level (RMS), 0..~1. */
  rms: number;
  /** NSDF clarity score (0..1). >0.7 is a confident pitch. */
  clarity: number;
}

const MIN_FREQ = 70;   // ~D2, well below G3
const MAX_FREQ = 1500; // ~F#6, well above E5
const SILENCE_RMS = 0.003; // be permissive — iPad mic with a damped violin is quiet
const CLARITY_THRESHOLD = 0.6;
const PEAK_PICK_RATIO = 0.85; // accept first peak ≥ 85% of max peak

/**
 * Detect pitch in a buffer using NSDF.
 */
export function detectPitch(buf: Float32Array, sampleRate: number): PitchReading {
  const n = buf.length;

  // RMS (always returned — useful for level meters even when no pitch is found).
  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += buf[i] * buf[i];
  const rms = Math.sqrt(sumSq / n);

  if (rms < SILENCE_RMS) {
    return { frequency: null, midi: null, pitchClass: null, cents: null, rms, clarity: 0 };
  }

  const minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQ));
  const maxLag = Math.min(Math.floor(sampleRate / MIN_FREQ), Math.floor(n / 2));

  // Compute NSDF: nsdf[t] = 2 * Σ x[i]·x[i+t] / Σ (x[i]² + x[i+t]²)
  const nsdf = new Float32Array(maxLag + 1);
  for (let tau = minLag; tau <= maxLag; tau++) {
    let acf = 0;
    let m = 0;
    const limit = n - tau;
    for (let i = 0; i < limit; i++) {
      const a = buf[i];
      const b = buf[i + tau];
      acf += a * b;
      m += a * a + b * b;
    }
    nsdf[tau] = m > 0 ? (2 * acf) / m : 0;
  }

  // Collect positive-going peaks: each "peak" is the local max within a region
  // bounded by zero crossings of nsdf.
  const peaks: { tau: number; value: number }[] = [];
  let inPositive = false;
  let localMax = -Infinity;
  let localMaxTau = -1;

  for (let tau = minLag; tau <= maxLag; tau++) {
    const v = nsdf[tau];
    if (!inPositive) {
      if (v > 0) {
        inPositive = true;
        localMax = v;
        localMaxTau = tau;
      }
    } else {
      if (v > localMax) {
        localMax = v;
        localMaxTau = tau;
      }
      if (v <= 0) {
        if (localMaxTau > 0) peaks.push({ tau: localMaxTau, value: localMax });
        inPositive = false;
        localMax = -Infinity;
        localMaxTau = -1;
      }
    }
  }
  if (inPositive && localMaxTau > 0) {
    peaks.push({ tau: localMaxTau, value: localMax });
  }

  if (peaks.length === 0) {
    return { frequency: null, midi: null, pitchClass: null, cents: null, rms, clarity: 0 };
  }

  // Choose the first peak whose value is at least PEAK_PICK_RATIO × the highest
  // peak value (defends against sub-octave errors from strong upper partials).
  let highest = 0;
  for (const p of peaks) if (p.value > highest) highest = p.value;
  const threshold = highest * PEAK_PICK_RATIO;
  const chosen = peaks.find((p) => p.value >= threshold) ?? peaks[0];

  if (chosen.value < CLARITY_THRESHOLD) {
    return {
      frequency: null,
      midi: null,
      pitchClass: null,
      cents: null,
      rms,
      clarity: chosen.value
    };
  }

  // Parabolic interpolation around the chosen peak.
  const t = chosen.tau;
  const y1 = t > 0 ? nsdf[t - 1] : chosen.value;
  const y2 = chosen.value;
  const y3 = t < maxLag ? nsdf[t + 1] : chosen.value;
  const denom = y1 - 2 * y2 + y3;
  const offset = denom !== 0 ? (0.5 * (y1 - y3)) / denom : 0;
  const refinedTau = t + offset;
  const frequency = sampleRate / refinedTau;

  return frequencyToReading(frequency, rms, chosen.value);
}

export function frequencyToReading(frequency: number, rms = 0, clarity = 0): PitchReading {
  if (!isFinite(frequency) || frequency <= 0) {
    return { frequency: null, midi: null, pitchClass: null, cents: null, rms, clarity };
  }
  // MIDI 69 = A4 = 440Hz
  const midiFloat = 69 + 12 * Math.log2(frequency / 440);
  const midi = Math.round(midiFloat);
  const cents = (midiFloat - midi) * 100;
  const pcIdx = ((midi % 12) + 12) % 12;
  return {
    frequency,
    midi,
    pitchClass: PITCH_CLASSES[pcIdx],
    cents,
    rms,
    clarity
  };
}

export interface PitchAnalyserOptions {
  /** Buffer size used for analysis. Larger = lower frequencies / more stable, but more latency. */
  bufferSize?: number;
  /**
   * Pre-analyser gain. iOS Safari attenuates getUserMedia audio heavily
   * (WebKit bug 230902) so we amplify before the analyser. Default: 8x.
   */
  gain?: number;
  /** Called on each analysis frame (~20–40ms). */
  onPitch: (reading: PitchReading) => void;
}

export interface PitchAnalyserHandle {
  stop: () => Promise<void>;
}

async function requestMicStream(): Promise<MediaStream> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone API not available in this environment.');
  }
  // Try with processing disabled (best for instrument detection). iOS Safari
  // often ignores these flags but won't fail the call.
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1
      }
    });
  } catch (err) {
    // Some browsers/devices reject specific constraints — fall back to plain audio.
    if (err instanceof Error && err.name === 'OverconstrainedError') {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    throw err;
  }
}

/**
 * Try to disable on-device audio processing on the active mic track. iOS
 * Safari will silently ignore this; on browsers that honour it, this is a
 * second chance after the initial getUserMedia constraints.
 */
async function tryDisableProcessing(stream: MediaStream): Promise<void> {
  const track = stream.getAudioTracks()[0];
  if (!track || typeof track.applyConstraints !== 'function') return;
  try {
    await track.applyConstraints({
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    });
  } catch {
    // not all UAs support post-hoc constraint changes — that's fine.
  }
}

/**
 * Start microphone-based pitch detection. Returns a handle to stop it.
 *
 * Throws if mic permission is denied or the API is unavailable.
 */
export async function startPitchAnalyser(
  opts: PitchAnalyserOptions
): Promise<PitchAnalyserHandle> {
  const stream = await requestMicStream();
  await tryDisableProcessing(stream);

  const AC = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) throw new Error('AudioContext not available.');

  // iOS Safari runs WebAudio more reliably at 44100 than at the 48000 default
  // some devices report. Try to pin the rate; fall back to no-arg constructor.
  let ctx: AudioContext;
  try {
    ctx = new AC({ sampleRate: 44100 });
  } catch {
    ctx = new AC();
  }
  await ctx.resume();

  const source = ctx.createMediaStreamSource(stream);

  // Workaround for WebKit bug 230902 — iOS Safari delivers getUserMedia audio
  // at a very low level. Boost it before analysis. Doesn't affect the
  // user-audible output (we never connect to ctx.destination).
  const gainNode = ctx.createGain();
  gainNode.gain.value = opts.gain ?? 8;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = opts.bufferSize ?? 4096;
  analyser.smoothingTimeConstant = 0;

  source.connect(gainNode);
  gainNode.connect(analyser);

  const buf = new Float32Array(analyser.fftSize);
  let raf = 0;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    analyser.getFloatTimeDomainData(buf);
    const reading = detectPitch(buf, ctx.sampleRate);
    opts.onPitch(reading);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    stop: async () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((t) => t.stop());
      source.disconnect();
      gainNode.disconnect();
      try {
        await ctx.close();
      } catch {
        // ignore
      }
    }
  };
}
