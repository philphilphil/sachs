<script lang="ts">
  import { KEYS } from '$lib/data/keys';
  import {
    harmonicDistance,
    distanceColor,
    defaultFill
  } from '$lib/utils/circle-math';
  import Wedge from './Wedge.svelte';
  import ConnectingArcs from './ConnectingArcs.svelte';

  interface Props {
    selectedKey: number | null;
    rotation: number;
    quizFeedback: { index: number; ring: 'major' | 'minor'; result: 'correct' | 'wrong' } | null;
    onselect: (index: number, ring: 'major' | 'minor') => void;
  }

  let { selectedKey, rotation, quizFeedback, onselect }: Props = $props();

  const CX = 300;
  const CY = 300;
  const OUTER_R2 = 280;
  const OUTER_R1 = 195;
  const INNER_R2 = 190;
  const INNER_R1 = 130;

  function majorFill(index: number): string {
    if (selectedKey === null) return defaultFill(false);
    return distanceColor(harmonicDistance(selectedKey, index), false);
  }

  function minorFill(index: number): string {
    if (selectedKey === null) return defaultFill(true);
    return distanceColor(harmonicDistance(selectedKey, index), true);
  }

  function feedbackClass(index: number, ring: 'major' | 'minor'): string {
    if (!quizFeedback) return '';
    if (quizFeedback.index === index && quizFeedback.ring === ring) {
      return `quiz-${quizFeedback.result}`;
    }
    return '';
  }

  function handleKeydown(index: number, ring: 'major' | 'minor', e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onselect(index, ring);
    }
  }
</script>

<svg
  viewBox="0 0 600 600"
  class="w-full max-w-[600px]"
  role="img"
  aria-label="Circle of fifths"
>
  <defs>
    <filter id="wedge-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15" />
    </filter>
  </defs>

  <g transform="rotate({rotation}, {CX}, {CY})">
    <!-- Outer ring (major keys) -->
    {#each KEYS as key}
      <Wedge
        cx={CX}
        cy={CY}
        innerRadius={OUTER_R1}
        outerRadius={OUTER_R2}
        index={key.index}
        label={key.name}
        fill={majorFill(key.index)}
        isSelected={selectedKey === key.index}
        feedbackClass={feedbackClass(key.index, 'major')}
        {rotation}
        onclick={() => onselect(key.index, 'major')}
        onkeydown={(e) => handleKeydown(key.index, 'major', e)}
      />
    {/each}

    <!-- Inner ring (minor keys) -->
    {#each KEYS as key}
      <Wedge
        cx={CX}
        cy={CY}
        innerRadius={INNER_R1}
        outerRadius={INNER_R2}
        index={key.index}
        label={key.minor}
        fill={minorFill(key.index)}
        isSelected={selectedKey === key.index}
        feedbackClass={feedbackClass(key.index, 'minor')}
        {rotation}
        onclick={() => onselect(key.index, 'minor')}
        onkeydown={(e) => handleKeydown(key.index, 'minor', e)}
      />
    {/each}

    <!-- Connecting arcs -->
    <ConnectingArcs
      {selectedKey}
      cx={CX}
      cy={CY}
      outerMidR={(OUTER_R1 + OUTER_R2) / 2}
      innerMidR={(INNER_R1 + INNER_R2) / 2}
      visible={selectedKey !== null}
    />
  </g>
</svg>

<style>
  svg {
    display: block;
    margin: 0 auto;
  }
</style>
