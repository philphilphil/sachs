<script lang="ts">
  import { onDestroy } from 'svelte';
  import Fingerboard from '$lib/components/violin-scales/Fingerboard.svelte';
  import ScaleCircle from '$lib/components/violin-scales/ScaleCircle.svelte';
  import { CIRCLE_SCALES, computeScaleFingering } from '$lib/data/scales';
  import {
    startPitchAnalyser,
    type PitchAnalyserHandle,
    type PitchReading
  } from '$lib/audio/pitch-detect';
  import { pitchToMidi, PITCH_CLASSES } from '$lib/utils/ear-training/music-theory';

  let selectedIndex = $state(0);
  let selectedMode = $state<'major' | 'minor'>('major');
  const currentScale = $derived(
    selectedMode === 'major'
      ? CIRCLE_SCALES[selectedIndex].major
      : CIRCLE_SCALES[selectedIndex].minor
  );
  const fingering = $derived(computeScaleFingering(currentScale));

  // Blind mode: the diagram starts empty and each note appears only after the
  // player finds it. `revealedMidis` holds every stop the player has uncovered.
  let blind = $state(false);
  let revealedMidis = $state<Set<number>>(new Set());

  function selectScale(index: number, mode: 'major' | 'minor') {
    selectedIndex = index;
    selectedMode = mode;
    revealedMidis = new Set();
  }

  function toggleBlind() {
    blind = !blind;
    revealedMidis = new Set();
  }

  function revealAll() {
    revealedMidis = new Set(scaleMidiSet);
  }

  // Pitch-class indices (0–11) the player has revealed, so the "Scale notes"
  // list fills in alongside the diagram once any octave of a degree is played.
  const revealedPcIndices = $derived.by(() => {
    const set = new Set<number>();
    for (const midi of revealedMidis) set.add(((midi % 12) + 12) % 12);
    return set;
  });

  function noteRevealed(degreeIndex: number): boolean {
    if (!blind) return true;
    return revealedPcIndices.has(PITCH_CLASSES.indexOf(currentScale.pitchClasses[degreeIndex]));
  }

  // Listening mode state
  let listening = $state(false);
  let micError = $state<string | null>(null);
  let analyserHandle: PitchAnalyserHandle | null = null;

  let detectedMidi = $state<number | null>(null);
  let detectedSpelling = $state<string | null>(null);
  let cents = $state<number | null>(null);
  let rms = $state(0);
  let peakRms = $state(0);
  let clarity = $state(0);

  // Track the highlighted fingerboard MIDI separately so it persists briefly when
  // the player's bow stops between notes.
  let highlightedMidi = $state<number | null>(null);
  let lastSeenAt = 0;
  const HIGHLIGHT_HOLD_MS = 600;
  const IN_TUNE_CENTS = 25;

  const inTune = $derived(cents != null && Math.abs(cents) <= IN_TUNE_CENTS);

  // Logarithmic signal level: -60 dB → 0%, 0 dB → 100%.
  const signalPct = $derived.by(() => {
    const db = rms > 0 ? 20 * Math.log10(rms) : -80;
    return Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
  });

  // Build a set of MIDI numbers belonging to the current scale fingering for highlighting only those.
  const scaleMidiSet = $derived.by(() => {
    const set = new Set<number>();
    for (const s of fingering.strings) {
      for (const stop of s.stops) {
        set.add(pitchToMidi(stop.pitch));
      }
    }
    return set;
  });

  function handleReading(r: PitchReading) {
    rms = r.rms;
    if (r.rms > peakRms) peakRms = r.rms;
    clarity = r.clarity;
    if (r.midi == null || r.frequency == null) {
      // If we haven't seen a confident pitch in HIGHLIGHT_HOLD_MS, clear the display.
      if (Date.now() - lastSeenAt > HIGHLIGHT_HOLD_MS) {
        detectedMidi = null;
        detectedSpelling = null;
        cents = null;
        highlightedMidi = null;
      }
      return;
    }
    lastSeenAt = Date.now();
    detectedMidi = r.midi;
    detectedSpelling = spellMidi(r.midi);
    cents = r.cents;

    // Highlight only when the detected note matches a scale note on the fingerboard.
    if (scaleMidiSet.has(r.midi)) {
      highlightedMidi = r.midi;
      // In blind mode, playing a scale note uncovers it on the diagram for good.
      if (blind && !revealedMidis.has(r.midi)) {
        revealedMidis = new Set(revealedMidis).add(r.midi);
      }
    } else {
      highlightedMidi = null;
    }
  }

  function spellMidi(midi: number): string {
    const PCS = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
    const pcIdx = ((midi % 12) + 12) % 12;
    const oct = Math.floor(midi / 12) - 1;
    return `${PCS[pcIdx]}${oct}`;
  }

  async function startListening() {
    micError = null;
    try {
      analyserHandle = await startPitchAnalyser({
        bufferSize: 4096,
        onPitch: handleReading
      });
      listening = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
        micError = 'Microphone permission denied. Allow access in your browser to use listen mode.';
      } else {
        micError = `Microphone error: ${msg}`;
      }
    }
  }

  async function stopListening() {
    listening = false;
    if (analyserHandle) {
      await analyserHandle.stop();
      analyserHandle = null;
    }
    detectedMidi = null;
    detectedSpelling = null;
    cents = null;
    highlightedMidi = null;
    rms = 0;
    peakRms = 0;
    clarity = 0;
  }

  async function toggleListening() {
    if (listening) {
      await stopListening();
    } else {
      await startListening();
    }
  }

  onDestroy(() => {
    if (analyserHandle) analyserHandle.stop();
  });
</script>

<svelte:head>
  <title>Violin Scales — Hans Sach's Musikschule</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
  <div class="animate-in">
    <p class="eyebrow mb-3">Chapter IV</p>
    <h1
      class="text-3xl sm:text-[34px] font-semibold tracking-tight text-text-primary leading-tight"
    >
      Violin <span class="serif italic font-normal">Scales</span>
    </h1>
    <p class="mt-4 text-text-secondary leading-relaxed max-w-xl">
      Pick a scale from the circle of fifths, see where each finger lands on the
      violin in first position. Turn on listen mode and play slowly — the diagram
      lights up as you hit each note, with a needle showing how true your
      intonation is. Switch on blind mode to hide the notes and test your memory.
    </p>

    <hr class="hairline my-8" />

    <!-- Scale picker: circle of fifths -->
    <p class="eyebrow mb-3">Scale</p>
    <p class="text-[13px] text-text-secondary leading-relaxed mb-4 max-w-xl">
      Outer ring is major keys, inner ring their relative minors. Clockwise adds a
      sharp, counter-clockwise a flat.
    </p>
    <div class="mb-8">
      <ScaleCircle
        scales={CIRCLE_SCALES}
        {selectedIndex}
        {selectedMode}
        onselect={selectScale}
      />
      <p class="text-center text-sm text-text-secondary mt-3">
        Selected: <span class="font-semibold text-text-primary">{currentScale.label}</span>
      </p>
    </div>

    <!-- Two-column layout on desktop -->
    <div class="grid md:grid-cols-[auto_1fr] gap-10 items-start">
      <!-- Fingerboard -->
      <div>
        <Fingerboard
          {fingering}
          {highlightedMidi}
          {cents}
          {inTune}
          {blind}
          {revealedMidis}
        />
      </div>

      <!-- Right column: scale notes + listen controls -->
      <div class="min-w-0">
        <p class="eyebrow mb-3">Scale notes</p>
        <div class="flex flex-wrap gap-1.5 mb-8">
          {#each fingering.scale.noteSpelling as note, i}
            {@const shown = noteRevealed(i)}
            <span
              class="px-2.5 py-1 rounded-md text-sm font-medium border tabular-nums"
              class:border-border-subtle={shown}
              class:bg-bg-card={shown}
              class:text-text-primary={shown}
              class:border-dashed={!shown}
              class:border-border={!shown}
              class:text-text-tertiary={!shown}
            >
              <span class="text-text-tertiary text-[10px] mr-1 font-normal">{i + 1}</span>{shown ? note : '·'}
            </span>
          {/each}
        </div>

        {#if !blind}
          <p class="eyebrow mb-3">String fingerings</p>
          <ul class="space-y-2 mb-8">
            {#each fingering.strings as s}
              <li class="text-sm text-text-secondary flex gap-3 items-baseline">
                <span class="serif italic text-text-primary text-base w-6 shrink-0">{s.stringName}</span>
                <span class="text-text-tertiary text-[11px] w-14 shrink-0">string</span>
                <span class="font-medium text-text-primary tabular-nums">
                  {#if s.stops.length === 0}
                    <span class="text-text-tertiary italic">— not used —</span>
                  {:else}
                    {#each s.stops as stop, idx}{idx > 0 ? ' · ' : ''}{stop.finger}<span class="text-text-tertiary">·</span>{stop.spelling}{/each}
                  {/if}
                </span>
              </li>
            {/each}
          </ul>
        {/if}

        <hr class="hairline my-6" />

        <!-- Blind mode -->
        <div class="flex items-start justify-between gap-4 mb-6">
          <div class="min-w-0">
            <p class="eyebrow mb-1.5">Blind mode</p>
            <p class="text-[13px] text-text-secondary leading-relaxed">
              Hide the fingering and recall the scale yourself. Each note appears
              only once you play it.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={blind}
            aria-label="Toggle blind mode"
            class="relative shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors duration-200"
            class:bg-[color:var(--color-violet)]={blind}
            class:bg-bg-hover={!blind}
            onclick={toggleBlind}
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
              class:translate-x-5={blind}
            ></span>
          </button>
        </div>

        {#if blind}
          {#if !listening}
            <p class="text-xs text-text-tertiary leading-relaxed mb-3">
              Start listening below so the diagram can uncover notes as you play.
            </p>
          {/if}
          <button
            type="button"
            class="w-full mb-6 px-4 py-2 rounded-lg border border-border-subtle text-sm text-text-secondary hover:border-[color:var(--color-violet)] hover:text-[color:var(--color-violet-deep)] transition-all duration-200"
            onclick={revealAll}
          >
            Reveal the whole scale
          </button>
        {/if}

        <!-- Listen mode -->
        <p class="eyebrow mb-3">Listen mode</p>
        <p class="text-[13px] text-text-secondary leading-relaxed mb-4">
          Play the scale slowly on your violin. The matching note lights up on
          the fingerboard, and the needle shows whether you're sharp or flat.
        </p>

        <button
          type="button"
          class="w-full px-5 py-3 rounded-xl border text-[15px] font-semibold transition-all duration-200"
          class:bg-[color:var(--color-violet)]={listening}
          class:text-white={listening}
          class:border-[color:var(--color-violet)]={listening}
          class:bg-bg-card={!listening}
          class:text-text-primary={!listening}
          class:border-border-subtle={!listening}
          class:hover:border-[color:var(--color-violet)]={!listening}
          onclick={toggleListening}
        >
          {listening ? 'Stop listening' : 'Start listening'}
        </button>

        {#if micError}
          <p class="mt-3 text-xs text-error bg-error-light border border-error/20 rounded-md p-2.5 leading-relaxed">
            {micError}
          </p>
        {/if}

        {#if listening}
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="bg-bg-card border border-border-subtle rounded-lg px-3 py-2">
              <div class="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Detected</div>
              <div class="text-text-primary font-semibold tabular-nums mt-0.5">
                {detectedSpelling ?? '—'}
              </div>
            </div>
            <div class="bg-bg-card border border-border-subtle rounded-lg px-3 py-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Signal</span>
                <span class="text-[10px] text-text-tertiary tabular-nums">peak {(peakRms * 100).toFixed(1)}</span>
              </div>
              <div class="mt-1.5 h-1.5 rounded-full bg-bg-hover overflow-hidden">
                <div
                  class="h-full transition-all duration-100"
                  class:bg-violet={clarity >= 0.6}
                  class:bg-text-tertiary={clarity < 0.6}
                  style="width: {signalPct}%;"
                ></div>
              </div>
              <div class="mt-1 text-[10px] text-text-tertiary tabular-nums">
                clarity {(clarity * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {#if peakRms > 0 && peakRms < 0.01}
            <p class="mt-3 text-xs text-text-secondary bg-bg-card border border-border-subtle rounded-md p-2.5 leading-relaxed">
              Signal is very low. Move closer to the mic, remove the practice mute,
              or check that the right input is selected in your browser/system.
            </p>
          {/if}
        {/if}
      </div>
    </div>

    <hr class="hairline my-10" />

    <p class="text-xs text-text-tertiary leading-relaxed max-w-xl">
      First position only. Finger numbers follow standard violin notation (1 = index, 4 = pinky).
      Open strings (0) are shown above the nut. When the open string isn't part of the
      scale, the first finger sits a whole step above instead.
    </p>
  </div>
</div>
