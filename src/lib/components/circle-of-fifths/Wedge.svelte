<script lang="ts">
  import { wedgePath } from '$lib/utils/circle-math';

  interface Props {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    index: number;
    label: string;
    fill: string;
    isSelected: boolean;
    feedbackClass: string;
    rotation: number;
    onclick: () => void;
    onkeydown: (e: KeyboardEvent) => void;
  }

  let {
    cx,
    cy,
    innerRadius,
    outerRadius,
    index,
    label,
    fill,
    isSelected,
    feedbackClass = '',
    rotation,
    onclick,
    onkeydown
  }: Props = $props();

  let path = $derived(wedgePath(cx, cy, innerRadius, outerRadius, index));

  let labelRadius = $derived((innerRadius + outerRadius) / 2);
  let labelAngle = $derived(-Math.PI / 2 + index * ((2 * Math.PI) / 12));
  let labelX = $derived(cx + labelRadius * Math.cos(labelAngle));
  let labelY = $derived(cy + labelRadius * Math.sin(labelAngle));
</script>

<g
  class="wedge {feedbackClass}"
  class:selected={isSelected}
  role="button"
  tabindex="0"
  aria-label="{label}"
  {onclick}
  {onkeydown}
>
  <path
    d={path}
    {fill}
    stroke="white"
    stroke-width="1"
    class="wedge-path"
  />
  <text
    x={labelX}
    y={labelY}
    text-anchor="middle"
    dominant-baseline="central"
    class="wedge-label"
    transform="rotate({-rotation}, {labelX}, {labelY})"
    fill="#1a1a1a"
    font-size={outerRadius > 200 ? 15 : 11}
    font-weight={isSelected ? 700 : 500}
    font-family="'Outfit', sans-serif"
  >
    {label}
  </text>
</g>

<style>
  .wedge {
    cursor: pointer;
    outline: none;
  }

  .wedge-path {
    transition: fill 300ms ease, transform 200ms ease;
  }

  .wedge:hover .wedge-path,
  .wedge:focus-visible .wedge-path {
    filter: brightness(0.95);
  }

  .wedge:focus-visible {
    outline: none;
  }

  .wedge:focus-visible .wedge-path {
    stroke: #e8654a;
    stroke-width: 2;
  }

  .wedge.selected .wedge-path {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  }

  .wedge-label {
    pointer-events: none;
    user-select: none;
  }

  .wedge.quiz-correct .wedge-path {
    animation: flash-correct 1.5s ease;
  }

  .wedge.quiz-wrong .wedge-path {
    animation: flash-wrong 1.5s ease;
  }

  @keyframes flash-correct {
    0%, 100% { fill: inherit; }
    20% { fill: #22c55e; }
    60% { fill: #22c55e; }
  }

  @keyframes flash-wrong {
    0%, 100% { fill: inherit; }
    20% { fill: #ef4444; }
    60% { fill: #ef4444; }
  }

  @media (prefers-reduced-motion: reduce) {
    .wedge-path {
      transition: none;
    }
    .wedge.quiz-correct .wedge-path,
    .wedge.quiz-wrong .wedge-path {
      animation: none;
    }
  }
</style>
