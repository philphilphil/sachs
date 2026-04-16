<script lang="ts">
  import { KEYS } from '$lib/data/keys';
  import { wedgeMidpoint, arcPath } from '$lib/utils/circle-math';

  interface Props {
    selectedKey: number | null;
    cx: number;
    cy: number;
    outerMidR: number;
    innerMidR: number;
    visible: boolean;
  }

  let { selectedKey, cx, cy, outerMidR, innerMidR, visible }: Props = $props();

  let arcs = $derived.by(() => {
    if (selectedKey === null) return [];

    const selected = wedgeMidpoint(cx, cy, outerMidR, selectedKey);
    const relMinor = wedgeMidpoint(cx, cy, innerMidR, selectedKey);
    const dominant = wedgeMidpoint(cx, cy, outerMidR, (selectedKey + 1) % 12);
    const subdominant = wedgeMidpoint(cx, cy, outerMidR, (selectedKey + 11) % 12);

    return [
      {
        id: 'relative-minor',
        path: `M${selected.x},${selected.y} L${relMinor.x},${relMinor.y}`,
        color: '#e8654a',
        label: `Relative minor: ${KEYS[selectedKey].minor}`
      },
      {
        id: 'dominant',
        path: arcPath(selected, dominant, cx, cy),
        color: '#0d9488',
        label: `Dominant: ${KEYS[(selectedKey + 1) % 12].name}`
      },
      {
        id: 'subdominant',
        path: arcPath(selected, subdominant, cx, cy),
        color: '#7c3aed',
        label: `Subdominant: ${KEYS[(selectedKey + 11) % 12].name}`
      }
    ];
  });
</script>

{#each arcs as arc}
  <path
    d={arc.path}
    stroke={arc.color}
    stroke-width="2.5"
    fill="none"
    stroke-linecap="round"
    class="connecting-arc"
    class:visible
    aria-label={arc.label}
  >
    <title>{arc.label}</title>
  </path>
{/each}

<style>
  .connecting-arc {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    opacity: 0;
    transition: stroke-dashoffset 400ms ease, opacity 300ms ease;
  }

  .connecting-arc.visible {
    stroke-dashoffset: 0;
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .connecting-arc {
      transition: none;
    }
    .connecting-arc.visible {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }
</style>
