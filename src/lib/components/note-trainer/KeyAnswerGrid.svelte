<script lang="ts">
  type Feedback = { answer: string; correct: boolean } | null;

  interface Props {
    correctAnswer: string;
    feedback: Feedback;
    onanswer: (answer: string) => void;
  }

  let { correctAnswer, feedback, onanswer }: Props = $props();

  const KEYS = [
    'C', 'G', 'D', 'A',
    'E', 'B', 'F♯', 'D♭',
    'A♭', 'E♭', 'B♭', 'F'
  ];

  type ButtonState = 'neutral' | 'correct' | 'incorrect' | 'reveal';

  function stateFor(answer: string): ButtonState {
    if (!feedback) return 'neutral';
    if (feedback.answer === answer) return feedback.correct ? 'correct' : 'incorrect';
    if (!feedback.correct && answer === correctAnswer) return 'reveal';
    return 'neutral';
  }

  function classFor(state: ButtonState): string {
    switch (state) {
      case 'correct':
        return 'border-[color:var(--color-success)] text-white bg-[color:var(--color-success)] shadow-[0_0_0_5px_rgba(5,150,105,0.18)] animate-pop-correct';
      case 'incorrect':
        return 'border-[color:var(--color-error)] text-white bg-[color:var(--color-error)] shadow-[0_0_0_5px_rgba(220,38,38,0.16)] animate-pop-wrong';
      case 'reveal':
        return 'border-[color:var(--color-success)] text-[color:var(--color-success)] bg-[color:var(--color-success-light)] border-dashed';
      default:
        return 'border-border text-text-primary hover:border-[color:var(--color-violet)] hover:text-[color:var(--color-violet-deep)] hover:bg-[color:var(--color-violet-light)]';
    }
  }

  const disabled = $derived(feedback !== null);
</script>

<div class="grid grid-cols-4 gap-2 max-w-md mx-auto">
  {#each KEYS as k}
    {@const s = stateFor(k)}
    <button
      aria-label="{k} major"
      {disabled}
      class="relative h-12 rounded-lg border bg-transparent serif text-base font-medium transition-all duration-200 disabled:cursor-not-allowed {classFor(s)}"
      onclick={() => onanswer(k)}
    >
      {k}
      {#if s === 'correct'}
        <span
          class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[color:var(--color-success)] flex items-center justify-center shadow-sm"
          aria-hidden="true"
        >
          <svg class="w-3 h-3" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7l3 3 5-6" />
          </svg>
        </span>
        <span
          class="absolute -top-7 left-1/2 -translate-x-1/2 text-[color:var(--color-success)] font-semibold text-sm serif italic pointer-events-none animate-rise-fade"
          aria-hidden="true"
        >
          +1
        </span>
      {/if}
    </button>
  {/each}
</div>
