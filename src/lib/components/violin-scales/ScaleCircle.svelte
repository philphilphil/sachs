<script lang="ts">
  import type { CircleScale } from '$lib/data/scales';
  import { wedgePath, wedgeMidpoint } from '$lib/utils/circle-math';

  interface Props {
    scales: CircleScale[];
    selectedIndex: number;
    selectedMode: 'major' | 'minor';
    onselect: (index: number, mode: 'major' | 'minor') => void;
  }

  let { scales, selectedIndex, selectedMode, onselect }: Props = $props();

  const CX = 150;
  const CY = 150;
  const OUTER_R2 = 138; // major ring outer
  const OUTER_R1 = 96; // major ring inner
  const INNER_R2 = 90; // minor ring outer
  const INNER_R1 = 52; // minor ring inner

  function isSelected(index: number, mode: 'major' | 'minor'): boolean {
    return selectedIndex === index && selectedMode === mode;
  }

  function handleKeydown(index: number, mode: 'major' | 'minor', e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onselect(index, mode);
    }
  }

  const selectedName = $derived(
    selectedMode === 'major'
      ? scales[selectedIndex].majorName
      : scales[selectedIndex].minorName
  );
</script>

<div class="flex flex-col items-center">
  <svg
    viewBox="0 0 300 300"
    class="w-full max-w-[260px] h-auto"
    role="group"
    aria-label="Circle of fifths scale selector"
  >
    <!-- Major keys (outer ring) -->
    {#each scales as s}
      {@const sel = isSelected(s.index, 'major')}
      {@const mid = wedgeMidpoint(CX, CY, (OUTER_R1 + OUTER_R2) / 2, s.index)}
      <g
        role="button"
        tabindex="0"
        aria-label="{s.majorName} major"
        aria-pressed={sel}
        class="wedge"
        onclick={() => onselect(s.index, 'major')}
        onkeydown={(e) => handleKeydown(s.index, 'major', e)}
      >
        <path
          d={wedgePath(CX, CY, OUTER_R1, OUTER_R2, s.index)}
          fill={sel ? 'var(--color-violet)' : 'var(--color-bg-card)'}
          stroke="var(--color-border)"
          stroke-width="1"
          class="wedge-path"
        />
        <text
          x={mid.x}
          y={mid.y}
          text-anchor="middle"
          dominant-baseline="central"
          font-size="13"
          font-weight={sel ? 700 : 500}
          fill={sel ? 'white' : 'var(--color-text-primary)'}
          class="tnum"
        >
          {s.majorName}
        </text>
      </g>
    {/each}

    <!-- Relative minor keys (inner ring) -->
    {#each scales as s}
      {@const sel = isSelected(s.index, 'minor')}
      {@const mid = wedgeMidpoint(CX, CY, (INNER_R1 + INNER_R2) / 2, s.index)}
      <g
        role="button"
        tabindex="0"
        aria-label="{s.minorName} minor"
        aria-pressed={sel}
        class="wedge"
        onclick={() => onselect(s.index, 'minor')}
        onkeydown={(e) => handleKeydown(s.index, 'minor', e)}
      >
        <path
          d={wedgePath(CX, CY, INNER_R1, INNER_R2, s.index)}
          fill={sel ? 'var(--color-violet)' : 'var(--color-bg-hover)'}
          stroke="var(--color-border)"
          stroke-width="1"
          class="wedge-path"
        />
        <text
          x={mid.x}
          y={mid.y}
          text-anchor="middle"
          dominant-baseline="central"
          font-size="10"
          font-weight={sel ? 700 : 500}
          fill={sel ? 'white' : 'var(--color-text-secondary)'}
          class="tnum"
        >
          {s.minorName}m
        </text>
      </g>
    {/each}

    <!-- Center label: current selection -->
    <circle cx={CX} cy={CY} r={INNER_R1 - 4} fill="var(--color-paper)" stroke="var(--color-border)" stroke-width="1" />
    <text
      x={CX}
      y={CY - 6}
      text-anchor="middle"
      dominant-baseline="central"
      font-size="16"
      font-weight="700"
      fill="var(--color-text-primary)"
      class="tnum"
    >
      {selectedName}
    </text>
    <text
      x={CX}
      y={CY + 12}
      text-anchor="middle"
      dominant-baseline="central"
      font-size="10"
      letter-spacing="0.08em"
      fill="var(--color-text-tertiary)"
    >
      {selectedMode === 'major' ? 'MAJOR' : 'MINOR'}
    </text>
  </svg>
</div>

<style>
  svg {
    display: block;
    margin: 0 auto;
    touch-action: manipulation;
  }

  text {
    pointer-events: none;
    user-select: none;
  }

  .wedge {
    cursor: pointer;
    outline: none;
  }

  .wedge-path {
    transition: fill 200ms ease;
  }

  .wedge:hover .wedge-path {
    filter: brightness(0.97);
  }

  .wedge:focus-visible .wedge-path {
    stroke: var(--color-violet);
    stroke-width: 2;
  }

  @media (prefers-reduced-motion: reduce) {
    .wedge-path {
      transition: none;
    }
  }
</style>
