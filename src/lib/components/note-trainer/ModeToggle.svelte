<script lang="ts">
  import type { QuizMode } from '$lib/utils/note-storage';

  interface Props {
    mode: QuizMode;
    onchange: (mode: QuizMode) => void;
  }

  let { mode, onchange }: Props = $props();

  const modes: { value: QuizMode; label: string }[] = [
    { value: 'note', label: 'Note ID' },
    { value: 'key', label: 'Key Signature' }
  ];
</script>

<div class="inline-flex gap-6 text-sm" role="radiogroup" aria-label="Mode">
  {#each modes as m}
    <button
      role="radio"
      aria-checked={mode === m.value}
      class="relative py-1 font-medium transition-colors duration-200
        {mode === m.value
        ? 'text-text-primary'
        : 'text-text-tertiary hover:text-text-secondary'}"
      onclick={() => onchange(m.value)}
    >
      {m.label}
      {#if mode === m.value}
        <span
          class="absolute left-0 right-0 -bottom-0.5 h-[2px]"
          style="background-color: var(--color-violet);"
        ></span>
      {/if}
    </button>
  {/each}
</div>
