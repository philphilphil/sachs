<script lang="ts">
  import { onDestroy } from 'svelte';
  import Fingerboard from '$lib/components/violin-scales/Fingerboard.svelte';
  import { SCALES, computeScaleFingering } from '$lib/data/scales';
  import {
    startPitchAnalyser,
    type PitchAnalyserHandle,
    type PitchReading
  } from '$lib/audio/pitch-detect';
  import { pitchToMidi } from '$lib/utils/ear-training/music-theory';

  let selectedId = $state(SCALES[0].id);
  const fingering = $derived(
    computeScaleFingering(SCALES.find((s) => s.id === selectedId) ?? SCALES[0])
  );

  // Listening mode state
  let listening = $state(false);
  let micError = $state<string | null>(null);
  let analyserHandle: PitchAnalyserHandle | null = null;

  let detectedMidi = $state<number | null>(null);
  let detectedSpelling = $state<string | null>(null);
  let cents = $state<number | null>(null);
  let rms = $state(0);

  // Track the highlighted fingerboard MIDI separately so it persists briefly when
  // the player's bow stops between notes.
  let highlightedMidi = $state<number | null>(null);
  let lastSeenAt = 0;
  const HIGHLIGHT_HOLD_MS = 600;
  const IN_TUNE_CENTS = 25;

  const inTune = $derived(cents != null && Math.abs(cents) <= IN_TUNE_CENTS);

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
      Pick a scale, see where each finger lands on the violin in first position.
      Turn on listen mode and play slowly — the diagram lights up as you hit each
      note, with a needle showing how true your intonation is.
    </p>

    <hr class="hairline my-8" />

    <!-- Scale picker -->
    <p class="eyebrow mb-3">Scale</p>
    <div class="flex flex-wrap gap-2 mb-8">
      {#each SCALES as scale}
        {@const active = selectedId === scale.id}
        <button
          type="button"
          class="px-4 py-2 rounded-lg border text-sm transition-all duration-200 bg-transparent"
          class:border-[color:var(--color-violet)]={active}
          class:bg-[color:var(--color-violet-light)]={active}
          class:text-[color:var(--color-violet-deep)]={active}
          class:border-border-subtle={!active}
          class:text-text-secondary={!active}
          class:hover:border-[color:var(--color-violet)]={!active}
          class:hover:text-[color:var(--color-violet-deep)]={!active}
          onclick={() => (selectedId = scale.id)}
        >
          {scale.label}
        </button>
      {/each}
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
        />
      </div>

      <!-- Right column: scale notes + listen controls -->
      <div class="min-w-0">
        <p class="eyebrow mb-3">Scale notes</p>
        <div class="flex flex-wrap gap-1.5 mb-8">
          {#each fingering.scale.noteSpelling as note, i}
            <span
              class="px-2.5 py-1 rounded-md text-sm font-medium border border-border-subtle bg-bg-card text-text-primary tabular-nums"
            >
              <span class="text-text-tertiary text-[10px] mr-1 font-normal">{i + 1}</span>{note}
            </span>
          {/each}
        </div>

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

        <hr class="hairline my-6" />

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
              <div class="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Signal</div>
              <div class="mt-1.5 h-1.5 rounded-full bg-bg-hover overflow-hidden">
                <div
                  class="h-full bg-violet transition-all duration-100"
                  style="width: {Math.min(100, rms * 800)}%;"
                ></div>
              </div>
            </div>
          </div>
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
