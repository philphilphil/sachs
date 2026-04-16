<script lang="ts">
  import { PRESETS, type PresetId } from '$lib/data/notes';

  interface Props {
    presetId: PresetId;
    octaveRange: { min: number; max: number };
    onpresetchange: (id: PresetId) => void;
    onrangechange: (range: { min: number; max: number }) => void;
  }

  let { presetId, octaveRange, onpresetchange, onrangechange }: Props = $props();

  const OCTAVE_OPTIONS = [2, 3, 4, 5, 6, 7];

  function handlePresetSelect(e: Event) {
    const id = (e.target as HTMLSelectElement).value as PresetId;
    onpresetchange(id);
  }

  function handleMinChange(e: Event) {
    const min = Number((e.target as HTMLSelectElement).value);
    const max = Math.max(min, octaveRange.max);
    onrangechange({ min, max });
  }

  function handleMaxChange(e: Event) {
    const max = Number((e.target as HTMLSelectElement).value);
    const min = Math.min(max, octaveRange.min);
    onrangechange({ min, max });
  }
</script>

<div class="flex flex-wrap items-center gap-3">
  <label class="flex items-center gap-2 text-sm">
    <span class="text-text-secondary">Preset</span>
    <select
      class="px-3 py-1.5 rounded-lg border border-border bg-bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
      value={presetId}
      onchange={handlePresetSelect}
    >
      {#each PRESETS as p}
        <option value={p.id}>{p.label}</option>
      {/each}
    </select>
  </label>

  {#if presetId === 'piano'}
    <label class="flex items-center gap-2 text-sm">
      <span class="text-text-secondary">Range</span>
      <select
        class="px-2 py-1.5 rounded-lg border border-border bg-bg-card text-text-primary text-sm"
        value={octaveRange.min}
        onchange={handleMinChange}
        aria-label="Lowest octave"
      >
        {#each OCTAVE_OPTIONS as o}
          <option value={o}>C{o}</option>
        {/each}
      </select>
      <span class="text-text-tertiary">to</span>
      <select
        class="px-2 py-1.5 rounded-lg border border-border bg-bg-card text-text-primary text-sm"
        value={octaveRange.max}
        onchange={handleMaxChange}
        aria-label="Highest octave"
      >
        {#each OCTAVE_OPTIONS as o}
          <option value={o}>B{o}</option>
        {/each}
      </select>
    </label>
  {/if}
</div>
