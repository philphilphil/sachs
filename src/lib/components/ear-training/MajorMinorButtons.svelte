<script lang="ts">
  import type { KeyMode } from '$lib/utils/ear-training/music-theory';

  interface Props {
    locked: boolean;
    feedback: { mode: KeyMode; correct: boolean } | null;
    correctMode: KeyMode | null;
    onanswer: (mode: KeyMode) => void;
  }

  let { locked, feedback, correctMode, onanswer }: Props = $props();

  type ButtonState = 'idle' | 'right' | 'wrong' | 'revealed';

  function stateFor(mode: KeyMode): ButtonState {
    if (!feedback) return 'idle';
    if (feedback.mode === mode) return feedback.correct ? 'right' : 'wrong';
    if (!feedback.correct && correctMode === mode) return 'revealed';
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

<div class="flex gap-4 justify-center">
  {#each ['major', 'minor'] as const as m}
    {@const s = stateFor(m)}
    <button
      type="button"
      disabled={locked}
      class="px-8 py-4 rounded-xl border bg-transparent text-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed {btnClass(s)}"
      aria-label={m === 'major' ? 'Major' : 'Minor'}
      onclick={() => onanswer(m)}
    >
      {m === 'major' ? 'Major' : 'Minor'}
    </button>
  {/each}
</div>
