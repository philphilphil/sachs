<script lang="ts">
  import type { QuizQuestion } from '$lib/utils/quiz';

  interface Props {
    question: QuizQuestion | null;
    score: number;
    total: number;
    feedback: 'correct' | 'wrong' | null;
    onreset: () => void;
  }

  let { question, score, total, feedback, onreset }: Props = $props();
</script>

<div class="bg-bg-card rounded-xl border border-border p-6" aria-live="assertive">
  {#if question}
    <div class="space-y-5">
      <!-- Score -->
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Quiz
        </h3>
        <div class="text-sm font-medium text-text-secondary">
          {score} / {total}
        </div>
      </div>

      <!-- Question -->
      <div>
        <p class="text-lg font-semibold text-text-primary">
          {question.text}
        </p>
        <p class="text-sm text-text-tertiary mt-1">
          Click the answer on the circle
        </p>
      </div>

      <!-- Feedback -->
      {#if feedback}
        <div
          class="text-sm font-medium px-3 py-2 rounded-lg text-center
            {feedback === 'correct'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'}"
        >
          {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong — see the highlighted answer'}
        </div>
      {/if}

      <!-- Reset button -->
      <button
        class="w-full text-sm font-medium text-text-tertiary hover:text-accent
          border border-border rounded-lg px-4 py-2 hover:border-border-hover
          transition-colors"
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
