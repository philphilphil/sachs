/**
 * Microphone-based pitch detection for violin practice.
 *
 * Uses an autocorrelation algorithm (ACF) over a buffer of recent samples.
 * Tuned for sustained, monophonic violin tones in roughly G3..E6.
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
  /** Signal level (RMS), 0..~1. Below ~0.005 we treat as silence. */
  rms: number;
}

const MIN_FREQ = 70;   // ~D2, well below G3
const MAX_FREQ = 1500; // ~F#6, well above E5
const SILENCE_RMS = 0.01;

/**
 * Autocorrelation pitch detection (basic ACF with parabolic peak refinement).
 *
 * Returns the detected frequency in Hz, or null if no confident pitch.
 */
export function detectPitch(buf: Float32Array, sampleRate: number): PitchReading {
  const n = buf.length;

  // RMS for silence gating.
  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += buf[i] * buf[i];
  const rms = Math.sqrt(sumSq / n);

  if (rms < SILENCE_RMS) {
    return { frequency: null, midi: null, pitchClass: null, cents: null, rms };
  }

  // Trim buffer to first zero-crossing region to reduce edge artefacts.
  // (Keep simple: use full buffer.)

  const minLag = Math.floor(sampleRate / MAX_FREQ);
  const maxLag = Math.min(Math.floor(sampleRate / MIN_FREQ), Math.floor(n / 2));

  // ACF: r[lag] = sum_{i=0..N-lag-1} buf[i] * buf[i+lag]
  let bestLag = -1;
  let bestCorr = 0;

  // Track previous correlation for peak detection.
  let prevCorr = 0;
  let inDip = true;
  let foundPeak = false;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    const limit = n - lag;
    for (let i = 0; i < limit; i++) {
      corr += buf[i] * buf[i + lag];
    }
    corr /= limit; // normalize by window length

    // Wait until correlation dips below zero (out of the lag-0 hump),
    // then take the first significant peak.
    if (inDip) {
      if (corr < 0) inDip = false;
      prevCorr = corr;
      continue;
    }

    if (!foundPeak) {
      if (corr > bestCorr) {
        bestCorr = corr;
        bestLag = lag;
      } else if (bestLag > 0 && corr < bestCorr * 0.85) {
        // Past the peak — stop searching for the *first* peak.
        foundPeak = true;
        break;
      }
    }
    prevCorr = corr;
  }

  if (bestLag < 0 || bestCorr < 0.1) {
    return { frequency: null, midi: null, pitchClass: null, cents: null, rms };
  }

  // Parabolic interpolation around bestLag for sub-sample precision.
  const r = (lag: number): number => {
    if (lag < 1 || lag >= n / 2) return 0;
    let s = 0;
    const lim = n - lag;
    for (let i = 0; i < lim; i++) s += buf[i] * buf[i + lag];
    return s / lim;
  };
  const rm = r(bestLag - 1);
  const r0 = bestCorr;
  const rp = r(bestLag + 1);
  const denom = rm - 2 * r0 + rp;
  const offset = denom !== 0 ? 0.5 * (rm - rp) / denom : 0;
  const refinedLag = bestLag + offset;

  const frequency = sampleRate / refinedLag;

  return frequencyToReading(frequency, rms);
}

export function frequencyToReading(frequency: number, rms = 0): PitchReading {
  if (!isFinite(frequency) || frequency <= 0) {
    return { frequency: null, midi: null, pitchClass: null, cents: null, rms };
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
    rms
  };
}

export interface PitchAnalyserOptions {
  /** FFT/buffer size used for analysis. Larger = lower frequencies but more latency. */
  bufferSize?: number;
  /** Called on each analysis frame (~20–40ms). */
  onPitch: (reading: PitchReading) => void;
}

export interface PitchAnalyserHandle {
  stop: () => Promise<void>;
}

/**
 * Start microphone-based pitch detection. Returns a handle to stop it.
 *
 * Throws if mic permission is denied or the API is unavailable.
 */
export async function startPitchAnalyser(
  opts: PitchAnalyserOptions
): Promise<PitchAnalyserHandle> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone API not available in this environment.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }
  });

  const AC = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) throw new Error('AudioContext not available.');
  const ctx = new AC();
  await ctx.resume();

  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = opts.bufferSize ?? 4096;
  analyser.smoothingTimeConstant = 0;
  source.connect(analyser);

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
      try {
        await ctx.close();
      } catch {
        // ignore
      }
    }
  };
}
