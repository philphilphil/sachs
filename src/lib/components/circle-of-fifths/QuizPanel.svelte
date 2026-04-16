<script lang="ts">
  import type { QuizQuestion, QuizCategory } from '$lib/utils/quiz';

  interface Props {
    question: QuizQuestion | null;
    score: number;
    total: number;
    category: QuizCategory;
    oncategorychange: (category: QuizCategory) => void;
    onrate: (correct: boolean) => void;
    onreset: () => void;
  }

  let { question, score, total, category, oncategorychange, onrate, onreset }: Props = $props();

  let revealed = $state(false);

  const categories: { value: QuizCategory; label: string }[] = [
    { value: 'order', label: 'Order' },
    { value: 'signatures', label: 'Key Signatures' },
    { value: 'both', label: 'Both' }
  ];

  function showAnswer() {
    revealed = true;
  }

  function rate(correct: boolean) {
    revealed = false;
    onrate(correct);
  }

  // Reset revealed state when question changes
  $effect(() => {
    if (question) {
      revealed = false;
    }
  });
</script>

<div class="bg-bg-card rounded-xl border border-border p-6" aria-live="polite">
  {#if question}
    <div class="space-y-5">
      <!-- Header: category + score -->
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Learn
        </h3>
        <div class="text-sm font-medium text-text-secondary">
          {score} / {total}
        </div>
      </div>

      <!-- Category toggle -->
      <div class="flex rounded-lg border border-border bg-bg p-0.5 gap-0.5">
        {#each categories as cat}
          <button
            class="flex-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 text-center
              {category === cat.value
              ? 'bg-bg-card text-text-primary shadow-sm'
              : 'text-text-tertiary hover:text-text-secondary'}"
            onclick={() => oncategorychange(cat.value)}
          >
            {cat.label}
          </button>
        {/each}
      </div>

      <!-- Flashcard -->
      <div class="min-h-[120px] flex flex-col justify-center">
        <!-- Question -->
        <p class="text-lg font-semibold text-text-primary">
          {question.text}
        </p>

        {#if revealed}
          <!-- Answer -->
          <div class="mt-4 px-4 py-3 rounded-lg bg-accent-light border border-accent/20">
            <p class="text-base font-bold text-accent-dark">
              {question.answer}
            </p>
          </div>

          <!-- Self-rating -->
          <div class="mt-4 flex gap-2">
            <button
              class="flex-1 px-4 py-2 rounded-lg text-sm font-medium
                bg-green-50 text-green-700 border border-green-200
                hover:bg-green-100 transition-colors"
              onclick={() => rate(true)}
            >
              Got it
            </button>
            <button
              class="flex-1 px-4 py-2 rounded-lg text-sm font-medium
                bg-red-50 text-red-700 border border-red-200
                hover:bg-red-100 transition-colors"
              onclick={() => rate(false)}
            >
              Missed it
            </button>
          </div>
        {:else}
          <!-- Show answer button -->
          <button
            class="mt-4 w-full px-4 py-2.5 rounded-lg text-sm font-medium
              text-text-secondary border border-border
              hover:border-border-hover hover:text-text-primary
              transition-colors"
            onclick={showAnswer}
          >
            Show answer
          </button>
        {/if}
      </div>

      <!-- Reset -->
      <button
        class="w-full text-xs font-medium text-text-tertiary hover:text-accent transition-colors"
        onclick={onreset}
      >
        Reset score
      </button>
    </div>
  {:else}
    <div class="text-center py-8">
      <p class="text-sm text-text-tertiary">Starting quiz...</p>
    </div>
  {/if}
</div>
