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

  function stateFor(answer: string): 'neutral' | 'correct' | 'incorrect' | 'reveal' {
    if (!feedback) return 'neutral';
    if (feedback.answer === answer) return feedback.correct ? 'correct' : 'incorrect';
    if (!feedback.correct && answer === correctAnswer) return 'reveal';
    return 'neutral';
  }

  function classFor(state: ReturnType<typeof stateFor>): string {
    switch (state) {
      case 'correct':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'incorrect':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'reveal':
        return 'bg-green-50 border-green-300 text-green-700';
      default:
        return 'bg-bg-card border-border text-text-primary hover:border-border-hover';
    }
  }

  const disabled = $derived(feedback !== null);
</script>

<div class="grid grid-cols-4 gap-2 max-w-md mx-auto">
  {#each KEYS as k}
    <button
      {disabled}
      class="h-14 rounded-lg border text-base font-semibold transition-colors {classFor(stateFor(k))} disabled:cursor-not-allowed"
      onclick={() => onanswer(k)}
    >
      {k}
    </button>
  {/each}
</div>
