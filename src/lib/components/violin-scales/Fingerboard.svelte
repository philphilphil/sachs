<script lang="ts">
  import type { ScaleFingering, FingerStop } from '$lib/data/scales';
  import { pitchToMidi } from '$lib/utils/ear-training/music-theory';

  interface Props {
    fingering: ScaleFingering;
    /** When set, highlight stops whose MIDI matches. */
    highlightedMidi?: number | null;
    /** Cents deviation of the currently played note (-50..+50). Drives the tuning hint. */
    cents?: number | null;
    /** True when the user is "in tune" within the cents threshold. */
    inTune?: boolean;
    /** Blind mode: hide every finger stop until the player uncovers it by playing it. */
    blind?: boolean;
    /** MIDI numbers the player has already revealed (only used in blind mode). */
    revealedMidis?: Set<number>;
  }

  let {
    fingering,
    highlightedMidi = null,
    cents = null,
    inTune = false,
    blind = false,
    revealedMidis
  }: Props = $props();

  function isRevealed(stop: FingerStop): boolean {
    if (!blind) return true;
    return revealedMidis?.has(pitchToMidi(stop.pitch)) ?? false;
  }

  // Visual parameters.
  const NECK_WIDTH = 280; // px (includes side label gutters)
  const NECK_HEIGHT = 380; // px (excludes labels)
  const TOP_PAD = 36; // space above the nut for open-string labels
  const BOTTOM_PAD = 16;
  const SCALE_LENGTH_SEMITONES = 7; // first-position visual span
  const SIDE_PAD = 60; // gutter for note-name labels next to outer strings

  const stringCount = $derived(fingering.strings.length);

  /** Compute x position for a string index, with G at left, E at right. */
  function stringX(idx: number): number {
    const inner = NECK_WIDTH - 2 * SIDE_PAD;
    return SIDE_PAD + (idx * inner) / (stringCount - 1);
  }

  /** Compute y position for a given semitone offset using logarithmic fret spacing. */
  function semitoneY(semitones: number): number {
    const t = 1 - Math.pow(2, -semitones / 12);
    const tMax = 1 - Math.pow(2, -SCALE_LENGTH_SEMITONES / 12);
    return TOP_PAD + (t / tMax) * NECK_HEIGHT;
  }

  const fingerColors = [
    'var(--color-text-tertiary)', // 0 (open)
    'var(--color-teal)',
    'var(--color-cyan)',
    'var(--color-violet)',
    'var(--color-magenta)'
  ];

  function isHighlighted(stop: FingerStop): boolean {
    if (highlightedMidi == null) return false;
    return pitchToMidi(stop.pitch) === highlightedMidi;
  }

  const totalWidth = NECK_WIDTH;
  const totalHeight = TOP_PAD + NECK_HEIGHT + BOTTOM_PAD;
</script>

<div class="flex flex-col items-center">
  <svg
    viewBox="0 0 {totalWidth} {totalHeight}"
    class="w-full max-w-[320px] h-auto"
    role="img"
    aria-label="Violin fingerboard showing {fingering.scale.label} in first position"
  >
    <!-- Fingerboard background -->
    <rect
      x={SIDE_PAD - 14}
      y={TOP_PAD}
      width={NECK_WIDTH - 2 * (SIDE_PAD - 14)}
      height={NECK_HEIGHT}
      rx="6"
      fill="var(--color-paper)"
      stroke="var(--color-border)"
      stroke-width="1"
    />

    <!-- Semitone reference lines (very subtle, every semitone in first position) -->
    {#each Array(SCALE_LENGTH_SEMITONES) as _, st}
      {@const semitone = st + 1}
      <line
        x1={SIDE_PAD - 10}
        y1={semitoneY(semitone)}
        x2={NECK_WIDTH - SIDE_PAD + 10}
        y2={semitoneY(semitone)}
        stroke="var(--color-border)"
        stroke-width="1"
        opacity="0.55"
      />
    {/each}

    <!-- Nut -->
    <line
      x1={SIDE_PAD - 14}
      y1={TOP_PAD}
      x2={NECK_WIDTH - SIDE_PAD + 14}
      y2={TOP_PAD}
      stroke="var(--color-text-primary)"
      stroke-width="3"
      stroke-linecap="round"
    />

    <!-- Strings -->
    {#each fingering.strings as s, i}
      {@const x = stringX(i)}
      <line
        x1={x}
        y1={TOP_PAD}
        x2={x}
        y2={TOP_PAD + NECK_HEIGHT}
        stroke="var(--color-text-secondary)"
        stroke-width={1.2 + (stringCount - 1 - i) * 0.4}
        stroke-linecap="round"
        opacity="0.8"
      />

      <!-- Open-string label -->
      <text
        x={x}
        y={TOP_PAD - 14}
        text-anchor="middle"
        font-size="13"
        font-weight="600"
        fill="var(--color-text-primary)"
        class="serif"
      >
        {s.stringName}
      </text>
      <text
        x={x}
        y={TOP_PAD - 2}
        text-anchor="middle"
        font-size="9"
        fill="var(--color-text-tertiary)"
        letter-spacing="0.05em"
      >
        OPEN
      </text>
    {/each}

    <!-- Finger stops -->
    {#each fingering.strings as s, i}
      {@const x = stringX(i)}
      {#each s.stops as stop}
        {@const y = semitoneY(stop.semitonesFromOpen)}
        {@const isOpen = stop.finger === 0}
        {@const highlight = isHighlighted(stop)}
        {@const color = fingerColors[stop.finger]}

        {#if !isOpen && isRevealed(stop)}
          <!-- Halo when highlighted -->
          {#if highlight}
            <circle
              cx={x}
              cy={y}
              r="18"
              fill={inTune ? 'var(--color-success-light)' : 'var(--color-accent-light)'}
              stroke={inTune ? 'var(--color-success)' : 'var(--color-accent)'}
              stroke-width="1.5"
              opacity="0.9"
            />
          {/if}
          <!-- Dot -->
          <circle
            cx={x}
            cy={y}
            r="13"
            fill={highlight ? (inTune ? 'var(--color-success)' : 'var(--color-accent)') : color}
            stroke="var(--color-bg-card)"
            stroke-width="2"
          />
          <!-- Finger number -->
          <text
            x={x}
            y={y + 1}
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="11"
            font-weight="700"
            fill="white"
          >
            {stop.finger}
          </text>
          <!-- Note name (to the side) -->
          <text
            x={x + (i === stringCount - 1 ? 22 : -22)}
            y={y + 1}
            text-anchor={i === stringCount - 1 ? 'start' : 'end'}
            dominant-baseline="middle"
            font-size="11"
            font-weight="500"
            fill="var(--color-text-secondary)"
            class="tnum"
          >
            {stop.spelling}
          </text>
        {/if}
      {/each}
    {/each}
  </svg>

  <!-- Finger legend -->
  <div class="flex items-center gap-3 mt-4 text-[11px] text-text-tertiary">
    {#each [1, 2, 3, 4] as f}
      <div class="flex items-center gap-1.5">
        <span
          class="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white"
          style="background-color: {fingerColors[f]};"
        >
          {f}
        </span>
        <span>finger</span>
      </div>
    {/each}
  </div>

  <!-- Tuning indicator -->
  {#if cents != null}
    <div class="mt-5 w-full max-w-[320px]">
      <div class="relative h-2 rounded-full bg-bg-hover overflow-hidden">
        <div class="absolute inset-y-0 left-1/2 w-px bg-border"></div>
        <!-- needle -->
        <div
          class="absolute top-1/2 -translate-y-1/2 w-1.5 h-3.5 rounded-sm transition-all duration-100"
          class:bg-success={inTune}
          class:bg-accent={!inTune}
          style="left: calc({50 + Math.max(-50, Math.min(50, cents))}% - 3px);"
        ></div>
      </div>
      <div class="flex justify-between mt-1 text-[10px] text-text-tertiary tabular-nums">
        <span>−50¢</span>
        <span class="font-medium" class:text-success={inTune} class:text-accent={!inTune}>
          {cents > 0 ? '+' : ''}{cents.toFixed(0)}¢
        </span>
        <span>+50¢</span>
      </div>
    </div>
  {/if}
</div>

<style>
  text {
    user-select: none;
  }
</style>
