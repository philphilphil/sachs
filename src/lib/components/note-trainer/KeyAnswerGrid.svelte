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
        return 'border-[color:var(--color-success)] text-[color:var(--color-success)] bg-[color:var(--color-success-light)]';
      case 'incorrect':
        return 'border-[color:var(--color-error)] text-[color:var(--color-error)] bg-[color:var(--color-error-light)]';
      case 'reveal':
        return 'border-[color:var(--color-success)]/60 text-[color:var(--color-success)] bg-[color:var(--color-success-light)]/60';
      default:
        return 'border-border text-text-primary hover:border-[color:var(--color-violet)] hover:text-[color:var(--color-violet-deep)] hover:bg-[color:var(--color-violet-light)]';
    }
  }

  const disabled = $derived(feedback !== null);
</script>

<div class="grid grid-cols-4 gap-2 max-w-md mx-auto">
  {#each KEYS as k}
    <button
      aria-label="{k} major"
      {disabled}
      class="h-12 rounded-lg border bg-transparent serif text-base font-medium transition-all duration-200 disabled:cursor-not-allowed {classFor(stateFor(k))}"
      onclick={() => onanswer(k)}
    >
      {k}
    </button>
  {/each}
</div>
