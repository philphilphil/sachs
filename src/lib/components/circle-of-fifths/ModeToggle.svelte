<script lang="ts">
  type Mode = 'explore' | 'reference' | 'learn';

  interface Props {
    mode: Mode;
    onchange: (mode: Mode) => void;
  }

  let { mode, onchange }: Props = $props();

  const modes: { value: Mode; label: string }[] = [
    { value: 'explore', label: 'Explore' },
    { value: 'reference', label: 'Reference' },
    { value: 'learn', label: 'Learn' }
  ];
</script>

<div class="inline-flex rounded-lg border border-border bg-bg-card p-0.5" role="radiogroup" aria-label="Mode">
  {#each modes as m}
    <button
      role="radio"
      aria-checked={mode === m.value}
      class="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        {mode === m.value
        ? 'bg-accent text-white shadow-sm'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'}"
      onclick={() => onchange(m.value)}
    >
      {m.label}
    </button>
  {/each}
</div>
