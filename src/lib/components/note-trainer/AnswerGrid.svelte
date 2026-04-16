<script lang="ts">
  type Feedback = { answer: string; correct: boolean } | null;

  interface Props {
    correctAnswer: string;
    feedback: Feedback;
    showAccidentals?: boolean;
    onanswer: (answer: string) => void;
  }

  let { correctAnswer, feedback, showAccidentals = true, onanswer }: Props = $props();

  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

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

  function pillClassFor(state: ReturnType<typeof stateFor>): string {
    switch (state) {
      case 'correct':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'incorrect':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'reveal':
        return 'bg-green-50 border-green-300 text-green-700';
      default:
        return 'bg-bg-card border-border text-text-tertiary hover:text-text-primary hover:border-border-hover';
    }
  }

  const disabled = $derived(feedback !== null);
</script>

<div class="flex justify-center gap-2">
  {#each LETTERS as letter}
    {@const sharpAnswer = `${letter}♯`}
    {@const flatAnswer = `${letter}♭`}
    <div class="flex flex-col items-center gap-1">
      {#if showAccidentals}
        <button
          aria-label={sharpAnswer}
          {disabled}
          class="w-10 h-6 text-xs rounded-md border font-medium transition-colors {pillClassFor(stateFor(sharpAnswer))} disabled:cursor-not-allowed"
          onclick={() => onanswer(sharpAnswer)}
        >
          ♯
        </button>
      {/if}
      <button
        aria-label={letter}
        {disabled}
        class="w-14 h-14 rounded-lg border text-lg font-semibold transition-colors {classFor(stateFor(letter))} disabled:cursor-not-allowed"
        onclick={() => onanswer(letter)}
      >
        {letter}
      </button>
      {#if showAccidentals}
        <button
          aria-label={flatAnswer}
          {disabled}
          class="w-10 h-6 text-xs rounded-md border font-medium transition-colors {pillClassFor(stateFor(flatAnswer))} disabled:cursor-not-allowed"
          onclick={() => onanswer(flatAnswer)}
        >
          ♭
        </button>
      {/if}
    </div>
  {/each}
</div>
