<script lang="ts" module>
  export type EarMode = 'scale-degree' | 'major-minor';
</script>

<script lang="ts">
  interface Props {
    mode: EarMode;
    onchange: (mode: EarMode) => void;
  }

  let { mode, onchange }: Props = $props();

  const options: { value: EarMode; label: string }[] = [
    { value: 'scale-degree', label: 'Scale Degrees' },
    { value: 'major-minor', label: 'Major vs Minor' }
  ];
</script>

<div class="inline-flex gap-6 text-sm" role="radiogroup" aria-label="Mode">
  {#each options as opt}
    <button
      role="radio"
      aria-checked={mode === opt.value}
      class="relative py-1 font-medium transition-colors duration-200
        {mode === opt.value
        ? 'text-text-primary'
        : 'text-text-tertiary hover:text-text-secondary'}"
      onclick={() => onchange(opt.value)}
    >
      {opt.label}
      {#if mode === opt.value}
        <span
          class="absolute left-0 right-0 -bottom-0.5 h-[2px]"
          style="background-color: var(--color-violet);"
        ></span>
      {/if}
    </button>
  {/each}
</div>
