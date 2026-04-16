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
        return 'border-2 border-[color:var(--color-success)] text-[color:var(--color-success)] bg-[color:var(--color-success-light)] shadow-[0_0_0_6px_rgba(5,150,105,0.14)] animate-pop-correct';
      case 'incorrect':
        return 'border-2 border-[color:var(--color-error)] text-[color:var(--color-error)] bg-[color:var(--color-error-light)] shadow-[0_0_0_6px_rgba(220,38,38,0.12)] animate-pop-wrong';
      case 'reveal':
        return 'border-2 border-dashed border-[color:var(--color-success)] text-[color:var(--color-success)] bg-[color:var(--color-success-light)]/70';
      default:
        return 'border border-border text-text-primary hover:border-[color:var(--color-violet)] hover:text-[color:var(--color-violet-deep)] hover:bg-[color:var(--color-violet-light)]';
    }
  }

  function pillClass(state: ButtonState): string {
    switch (state) {
      case 'correct':
        return 'border-2 border-[color:var(--color-success)] text-[color:var(--color-success)] bg-[color:var(--color-success-light)] shadow-[0_0_0_4px_rgba(5,150,105,0.12)] animate-pop-correct';
      case 'incorrect':
        return 'border-2 border-[color:var(--color-error)] text-[color:var(--color-error)] bg-[color:var(--color-error-light)] shadow-[0_0_0_4px_rgba(220,38,38,0.10)] animate-pop-wrong';
      case 'reveal':
        return 'border-2 border-dashed border-[color:var(--color-success)] text-[color:var(--color-success)]';
      default:
        return 'border border-border-subtle text-text-tertiary hover:border-[color:var(--color-violet)] hover:text-[color:var(--color-violet-deep)]';
    }
  }

  const disabled = $derived(feedback !== null);
</script>

<div
  class="flex flex-wrap justify-center gap-2 sm:gap-2 mx-auto max-w-[288px] sm:max-w-none"
>
  {#each LETTERS as letter}
    {@const sharpAnswer = `${letter}♯`}
    {@const flatAnswer = `${letter}♭`}
    {@const sharpState = stateFor(sharpAnswer)}
    {@const letterState = stateFor(letter)}
    {@const flatState = stateFor(flatAnswer)}
    <div class="relative flex flex-col items-stretch gap-1.5 w-16 sm:w-14">
      {#if showAccidentals}
        <button
          aria-label={sharpAnswer}
          {disabled}
          class="h-6 sm:h-5 text-xs sm:text-[11px] rounded-md border bg-transparent font-medium transition-all duration-200 disabled:cursor-not-allowed {pillClass(sharpState)}"
          onclick={() => onanswer(sharpAnswer)}
        >
          ♯
        </button>
      {/if}
      <button
        aria-label={letter}
        {disabled}
        class="relative h-14 sm:h-14 rounded-lg border bg-transparent text-xl sm:text-lg serif font-medium transition-all duration-200 disabled:cursor-not-allowed {letterClass(letterState)}"
        onclick={() => onanswer(letter)}
      >
        {letter}
        {#if letterState === 'correct'}
          <span
            class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[color:var(--color-success)] flex items-center justify-center shadow-sm"
            aria-hidden="true"
          >
            <svg class="w-3 h-3" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7l3 3 5-6" />
            </svg>
          </span>
          <span
            class="absolute -top-8 left-1/2 -translate-x-1/2 text-[color:var(--color-success)] font-semibold text-sm serif italic pointer-events-none animate-rise-fade"
            aria-hidden="true"
          >
            +1
          </span>
        {/if}
      </button>
      {#if showAccidentals}
        <button
          aria-label={flatAnswer}
          {disabled}
          class="h-6 sm:h-5 text-xs sm:text-[11px] rounded-md border bg-transparent font-medium transition-all duration-200 disabled:cursor-not-allowed {pillClass(flatState)}"
          onclick={() => onanswer(flatAnswer)}
        >
          ♭
        </button>
      {/if}
    </div>
  {/each}
</div>
