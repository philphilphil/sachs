<script lang="ts">
  import type { ScaleDegree } from '$lib/utils/ear-training/music-theory';

  interface Props {
    activeDegrees: ScaleDegree[];
    locked: boolean;
    feedback: { degree: ScaleDegree; correct: boolean } | null;
    correctDegree: ScaleDegree | null;
    onanswer: (degree: ScaleDegree) => void;
  }

  let { activeDegrees, locked, feedback, correctDegree, onanswer }: Props = $props();

  interface Button {
    degree: ScaleDegree;
    label: string;
  }

  const NATURALS: Button[] = [
    { degree: 1, label: '1̂' },
    { degree: 2, label: '2̂' },
    { degree: 3, label: '3̂' },
    { degree: 4, label: '4̂' },
    { degree: 5, label: '5̂' },
    { degree: 6, label: '6̂' },
    { degree: 7, label: '7̂' }
  ];

  const FLATS: Button[] = [
    { degree: 'b3', label: '♭3̂' },
    { degree: 'b6', label: '♭6̂' },
    { degree: 'b7', label: '♭7̂' }
  ];

  const activeNaturals = $derived(NATURALS.filter((b) => activeDegrees.includes(b.degree)));
  const activeFlats = $derived(FLATS.filter((b) => activeDegrees.includes(b.degree)));

  type ButtonState = 'idle' | 'right' | 'wrong' | 'revealed';

  function stateFor(btn: Button): ButtonState {
    if (!feedback) return 'idle';
    if (feedback.degree === btn.degree) return feedback.correct ? 'right' : 'wrong';
    if (!feedback.correct && correctDegree === btn.degree) return 'revealed';
    return 'idle';
  }

  function btnClass(state: ButtonState): string {
    switch (state) {
      case 'right':
        return 'border-2 border-[color:var(--color-success)] text-[color:var(--color-success)] bg-[color:var(--color-success-light)] shadow-[0_0_0_6px_rgba(5,150,105,0.14)] animate-pop-correct';
      case 'wrong':
        return 'border-2 border-[color:var(--color-error)] text-[color:var(--color-error)] bg-[color:var(--color-error-light)] shadow-[0_0_0_6px_rgba(220,38,38,0.12)] animate-pop-wrong';
      case 'revealed':
        return 'border-2 border-dashed border-[color:var(--color-success)] text-[color:var(--color-success)] bg-[color:var(--color-success-light)]/70';
      default:
        return 'border border-border text-text-primary hover:border-[color:var(--color-violet)] hover:text-[color:var(--color-violet-deep)] hover:bg-[color:var(--color-violet-light)]';
    }
  }
</script>

<div class="flex flex-col items-center gap-3">
  {#if activeNaturals.length > 0}
    <div class="flex gap-2">
      {#each activeNaturals as btn}
        {@const s = stateFor(btn)}
        <button
          type="button"
          aria-label="Scale degree {btn.label}"
          disabled={locked}
          class="w-12 h-12 rounded-lg border bg-transparent text-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed {btnClass(s)}"
          onclick={() => onanswer(btn.degree)}
        >
          {btn.label}
        </button>
      {/each}
    </div>
  {/if}
  {#if activeFlats.length > 0}
    <div class="flex gap-2">
      {#each activeFlats as btn}
        {@const s = stateFor(btn)}
        <button
          type="button"
          aria-label="Scale degree {btn.label}"
          disabled={locked}
          class="w-12 h-12 rounded-lg border bg-transparent text-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed {btnClass(s)}"
          onclick={() => onanswer(btn.degree)}
        >
          {btn.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
