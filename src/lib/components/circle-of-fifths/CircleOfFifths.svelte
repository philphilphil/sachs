<script lang="ts">
  import { KEYS } from '$lib/data/keys';
  import {
    harmonicDistance,
    distanceColor,
    defaultFill
  } from '$lib/utils/circle-math';
  import Wedge from './Wedge.svelte';
  import ConnectingArcs from './ConnectingArcs.svelte';

  type Mode = 'explore' | 'reference' | 'learn';

  interface Props {
    selectedKey: number | null;
    rotation: number;
    mode: Mode;
    quizFeedback: { index: number; ring: 'major' | 'minor'; result: 'correct' | 'wrong' } | null;
    onselect: (index: number, ring: 'major' | 'minor') => void;
    ondragrotate: (angleDelta: number) => void;
    ondragend: (velocity: number) => void;
  }

  let {
    selectedKey,
    rotation,
    mode,
    quizFeedback,
    onselect,
    ondragrotate,
    ondragend
  }: Props = $props();

  const CX = 300;
  const CY = 300;
  const OUTER_R2 = 280;
  const OUTER_R1 = 195;
  const INNER_R2 = 190;
  const INNER_R1 = 130;

  let svgEl: SVGSVGElement;
  let dragging = $state(false);
  let lastAngle = 0;
  let lastTime = 0;
  let velocity = 0;

  function getAngleFromEvent(e: MouseEvent | Touch): number {
    const rect = svgEl.getBoundingClientRect();
    const scaleX = 600 / rect.width;
    const scaleY = 600 / rect.height;
    const x = (e.clientX - rect.left) * scaleX - CX;
    const y = (e.clientY - rect.top) * scaleY - CY;
    return Math.atan2(y, x) * (180 / Math.PI);
  }

  function handlePointerDown(e: MouseEvent) {
    if (mode !== 'explore') return;
    dragging = true;
    lastAngle = getAngleFromEvent(e);
    lastTime = performance.now();
    velocity = 0;
  }

  function handlePointerMove(e: MouseEvent) {
    if (!dragging) return;
    const currentAngle = getAngleFromEvent(e);
    let delta = currentAngle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) velocity = delta / dt;

    lastAngle = currentAngle;
    lastTime = now;
    ondragrotate(delta);
  }

  function handlePointerUp() {
    if (!dragging) return;
    dragging = false;
    ondragend(velocity * 100);
  }

  function handleTouchStart(e: TouchEvent) {
    if (mode !== 'explore' || e.touches.length !== 1) return;
    dragging = true;
    lastAngle = getAngleFromEvent(e.touches[0]);
    lastTime = performance.now();
    velocity = 0;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!dragging || e.touches.length !== 1) return;
    e.preventDefault();
    const currentAngle = getAngleFromEvent(e.touches[0]);
    let delta = currentAngle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) velocity = delta / dt;

    lastAngle = currentAngle;
    lastTime = now;
    ondragrotate(delta);
  }

  function handleTouchEnd() {
    if (!dragging) return;
    dragging = false;
    ondragend(velocity * 100);
  }

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
  class:cursor-grab={mode === 'explore' && !dragging}
  class:cursor-grabbing={mode === 'explore' && dragging}
  role="img"
  aria-label="Circle of fifths"
  bind:this={svgEl}
  onmousedown={handlePointerDown}
  onmousemove={handlePointerMove}
  onmouseup={handlePointerUp}
  onmouseleave={handlePointerUp}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
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
    touch-action: none;
  }
</style>
