<script lang="ts">
  import { getLevel, type ScaleDegreeLevel } from '$lib/utils/ear-training/levels';
  import type { ScaleDegree } from '$lib/utils/ear-training/music-theory';

  interface Props {
    level: ScaleDegreeLevel;
    onchange: (level: ScaleDegreeLevel) => void;
    onreset: () => void;
  }

  let { level, onchange, onreset }: Props = $props();

  const def = $derived(getLevel(level));
  const degreeList = $derived<ScaleDegree[]>(
    def.mode === 'mixed'
      ? [...(def.degreesMajor ?? []), ...(def.degreesMinor ?? [])].filter(
          (v, i, a) => a.indexOf(v) === i
        )
      : (def.mode === 'major' ? def.degreesMajor : def.degreesMinor) ?? []
  );

  function formatDegree(d: ScaleDegree): string {
    if (d === 'b3') return '♭3̂';
    if (d === 'b6') return '♭6̂';
    if (d === 'b7') return '♭7̂';
    return `${d}̂`;
  }

  function canStepUp(): boolean {
    return level < 5;
  }

  function stepUp(): void {
    if (canStepUp()) onchange((level + 1) as ScaleDegreeLevel);
  }
</script>

<div class="flex items-center gap-3 text-sm">
  <p class="eyebrow">Level {level} / 5</p>
  <div class="flex flex-wrap gap-1">
    {#each degreeList as d}
      <span class="px-2 py-0.5 rounded bg-bg-card text-text-secondary tabular-nums">
        {formatDegree(d)}
      </span>
    {/each}
  </div>
  {#if canStepUp()}
    <button
      type="button"
      class="text-xs text-text-tertiary hover:text-text-primary underline underline-offset-2"
      onclick={stepUp}
    >
      Skip ahead →
    </button>
  {/if}
  {#if level > 1}
    <button
      type="button"
      class="text-xs text-text-tertiary hover:text-text-primary underline underline-offset-2"
      onclick={onreset}
    >
      ← Reset to level 1
    </button>
  {/if}
</div>
