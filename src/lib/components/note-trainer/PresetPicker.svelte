<script lang="ts">
  import { PRESETS, type PresetId } from '$lib/data/notes';

  interface Props {
    presetId: PresetId;
    octaveRange: { min: number; max: number };
    showNaturalsOnly: boolean;
    naturalsOnly: boolean;
    onpresetchange: (id: PresetId) => void;
    onrangechange: (range: { min: number; max: number }) => void;
    onnaturalsonlychange: (value: boolean) => void;
  }

  let {
    presetId,
    octaveRange,
    showNaturalsOnly,
    naturalsOnly,
    onpresetchange,
    onrangechange,
    onnaturalsonlychange
  }: Props = $props();

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

<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
  <label class="flex items-center gap-2">
    <span class="eyebrow">Preset</span>
    <select
      class="py-1 pr-5 pl-0 bg-transparent text-text-primary font-medium appearance-none border-0 focus:outline-none focus:ring-0 cursor-pointer"
      style="background-image: url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 20 20\' fill=\'%239a9a9a\'%3E%3Cpath d=\'M5 7l5 5 5-5\' stroke=\'%239a9a9a\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E'); background-position: right center; background-repeat: no-repeat;"
      value={presetId}
      onchange={handlePresetSelect}
    >
      {#each PRESETS as p}
        <option value={p.id}>{p.label}</option>
      {/each}
    </select>
  </label>

  {#if presetId === 'piano'}
    <label class="flex items-center gap-2">
      <span class="eyebrow">Range</span>
      <select
        class="py-1 bg-transparent text-text-primary font-medium border-0 focus:outline-none cursor-pointer"
        value={octaveRange.min}
        onchange={handleMinChange}
        aria-label="Lowest octave"
      >
        {#each OCTAVE_OPTIONS as o}
          <option value={o}>C{o}</option>
        {/each}
      </select>
      <span class="text-text-tertiary">–</span>
      <select
        class="py-1 bg-transparent text-text-primary font-medium border-0 focus:outline-none cursor-pointer"
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

  {#if showNaturalsOnly}
    <label class="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        class="w-3.5 h-3.5 rounded-sm border-border"
        style="accent-color: var(--color-violet);"
        checked={naturalsOnly}
        onchange={(e) => onnaturalsonlychange((e.target as HTMLInputElement).checked)}
      />
      <span class="text-text-secondary">Naturals only</span>
    </label>
  {/if}
</div>
