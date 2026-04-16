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

  type ButtonState = 'neutral' | 'correct' | 'incorrect' | 'reveal';

  function stateFor(answer: string): ButtonState {
    if (!feedback) return 'neutral';
    if (feedback.answer === answer) return feedback.correct ? 'correct' : 'incorrect';
    if (!feedback.correct && answer === correctAnswer) return 'reveal';
    return 'neutral';
  }

  function letterClass(state: ButtonState): string {
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

  function pillClass(state: ButtonState): string {
    switch (state) {
      case 'correct':
        return 'border-[color:var(--color-success)] text-[color:var(--color-success)] bg-[color:var(--color-success-light)]';
      case 'incorrect':
        return 'border-[color:var(--color-error)] text-[color:var(--color-error)] bg-[color:var(--color-error-light)]';
      case 'reveal':
        return 'border-[color:var(--color-success)]/50 text-[color:var(--color-success)]/80';
      default:
        return 'border-border-subtle text-text-tertiary hover:border-[color:var(--color-violet)] hover:text-[color:var(--color-violet-deep)]';
    }
  }

  const disabled = $derived(feedback !== null);
</script>

<div class="flex justify-center gap-1.5 sm:gap-2">
  {#each LETTERS as letter}
    {@const sharpAnswer = `${letter}♯`}
    {@const flatAnswer = `${letter}♭`}
    <div class="flex flex-col items-center gap-1.5">
      {#if showAccidentals}
        <button
          aria-label={sharpAnswer}
          {disabled}
          class="w-9 h-5 text-[11px] rounded-md border bg-transparent font-medium transition-all duration-200 disabled:cursor-not-allowed {pillClass(stateFor(sharpAnswer))}"
          onclick={() => onanswer(sharpAnswer)}
        >
          ♯
        </button>
      {/if}
      <button
        aria-label={letter}
        {disabled}
        class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border bg-transparent text-lg serif font-medium transition-all duration-200 disabled:cursor-not-allowed {letterClass(stateFor(letter))}"
        onclick={() => onanswer(letter)}
      >
        {letter}
      </button>
      {#if showAccidentals}
        <button
          aria-label={flatAnswer}
          {disabled}
          class="w-9 h-5 text-[11px] rounded-md border bg-transparent font-medium transition-all duration-200 disabled:cursor-not-allowed {pillClass(stateFor(flatAnswer))}"
          onclick={() => onanswer(flatAnswer)}
        >
          ♭
        </button>
      {/if}
    </div>
  {/each}
</div>
