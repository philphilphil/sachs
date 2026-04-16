<script lang="ts">
  import type { QuizMode } from '$lib/utils/note-storage';

  interface Props {
    mode: QuizMode;
    onchange: (mode: QuizMode) => void;
  }

  let { mode, onchange }: Props = $props();

  const modes: { value: QuizMode; label: string }[] = [
    { value: 'note', label: 'Note Identification' },
    { value: 'key', label: 'Key Signature' }
  ];
</script>

<div
  class="inline-flex rounded-lg border border-border bg-bg-card p-0.5"
  role="radiogroup"
  aria-label="Mode"
>
  {#each modes as m}
    <button
      role="radio"
      aria-checked={mode === m.value}
      class="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        {mode === m.value
        ? 'text-white shadow-sm'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'}"
      style={mode === m.value ? 'background-color: #7c3aed;' : ''}
      onclick={() => onchange(m.value)}
    >
      {m.label}
    </button>
  {/each}
</div>
