<script lang="ts" module>
  export type PlayPhase =
    | 'idle'
    | 'cadence-1'
    | 'cadence-2'
    | 'cadence-3'
    | 'cadence-4'
    | 'target';
</script>

<script lang="ts">
  import type { KeyMode } from '$lib/utils/ear-training/music-theory';

  interface Props {
    mode: KeyMode;
    phase: PlayPhase;
  }

  let { mode, phase }: Props = $props();

  const chordLabels = $derived(
    mode === 'major' ? ['I', 'IV', 'V', 'I'] : ['i', 'iv', 'v', 'i']
  );

  function chordActive(index: number): boolean {
    return phase === (`cadence-${index + 1}` as PlayPhase);
  }

  const targetActive = $derived(phase === 'target');
</script>

<div class="flex items-center gap-1.5 text-sm tabular-nums select-none">
  {#each chordLabels as lbl, i}
    {@const active = chordActive(i)}
    <span
      class="pill"
      class:pill--active={active}
      class:pill--idle={!active}
    >
      {lbl}
    </span>
  {/each}
  <span class="text-text-tertiary text-xs mx-1">→</span>
  <span
    class="pill pill--target"
    class:pill--active={targetActive}
    class:pill--idle={!targetActive}
  >
    target
  </span>
</div>

<style>
  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.9rem;
    height: 1.6rem;
    padding: 0 0.5rem;
    border: 1px solid var(--color-border-subtle);
    border-radius: 0.375rem;
    font-weight: 500;
    transition: background-color 120ms ease, border-color 120ms ease,
      color 120ms ease;
  }

  .pill--target {
    font-size: 0.75rem;
    min-width: 3rem;
  }

  .pill--idle {
    color: var(--color-text-secondary);
    background-color: transparent;
  }

  .pill--active {
    border-color: var(--color-violet);
    background-color: var(--color-violet-light);
    color: var(--color-violet-deep);
  }
</style>
