<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { type Mode } from '$lib/data/keys';
  import { shortestRotationTo } from '$lib/utils/circle-math';
  import { generateQuestion, type QuizQuestion, type QuizCategory } from '$lib/utils/quiz';
  import { browser } from '$app/environment';
  import CircleOfFifths from '$lib/components/circle-of-fifths/CircleOfFifths.svelte';
  import DetailPanel from '$lib/components/circle-of-fifths/DetailPanel.svelte';
  import QuizPanel from '$lib/components/circle-of-fifths/QuizPanel.svelte';
  import ModeToggle from '$lib/components/circle-of-fifths/ModeToggle.svelte';

  let selectedKey = $state<number | null>(null);
  let mode = $state<Mode>('explore');

  // Rotation
  const prefersReducedMotion = browser
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const rotation = tweened(0, {
    duration: prefersReducedMotion ? 0 : 400,
    easing: cubicOut
  });
  let rawRotation = 0;

  // Quiz state
  let quizScore = $state(0);
  let quizTotal = $state(0);
  let quizCategory = $state<QuizCategory>('order');
  let currentQuestion = $state<QuizQuestion | null>(null);
  let quizRevealed = $state(false);

  function rotateToKey(index: number) {
    const targetDeg = -index * 30;
    const delta = shortestRotationTo(rawRotation % 360, targetDeg % 360);
    rawRotation += delta;
    rotation.set(rawRotation);
  }

  function handleSelect(index: number, _ring: 'major' | 'minor') {
    // Toggle selection: click same key to deselect
    if (selectedKey === index) {
      selectedKey = null;
      return;
    }

    selectedKey = index;
    rotateToKey(index);
  }

  function handleNavigate(index: number) {
    selectedKey = index;
    rotateToKey(index);
  }

  function handleDragRotate(delta: number) {
    rawRotation += delta;
    rotation.set(rawRotation, { duration: 0 });
  }

  function handleDragEnd(velocity: number) {
    if (prefersReducedMotion) {
      rotation.set(rawRotation, { duration: 0 });
      return;
    }
    rawRotation += velocity;
    rotation.set(rawRotation, { duration: 500 });
  }

  function handleModeChange(newMode: Mode) {
    mode = newMode;

    if (newMode === 'learn') {
      selectedKey = null;
      quizScore = 0;
      quizTotal = 0;
      currentQuestion = generateQuestion(quizCategory);
    } else {
      currentQuestion = null;
    }
  }

  function handleCategoryChange(cat: QuizCategory) {
    quizCategory = cat;
    quizScore = 0;
    quizTotal = 0;
    quizRevealed = false;
    selectedKey = null;
    currentQuestion = generateQuestion(cat);
  }

  function handleQuizReveal() {
    // Show the key on the circle and rotate to it
    selectedKey = currentQuestion?.keyIndex ?? null;
    if (selectedKey !== null) rotateToKey(selectedKey);
    quizRevealed = true;
  }

  function handleQuizRate(correct: boolean) {
    quizTotal++;
    if (correct) quizScore++;
    quizRevealed = false;
    selectedKey = null;
    currentQuestion = generateQuestion(quizCategory, currentQuestion?.keyIndex);
  }

  function handleQuizReset() {
    quizScore = 0;
    quizTotal = 0;
    quizRevealed = false;
    selectedKey = null;
    currentQuestion = generateQuestion(quizCategory);
  }

  function handleKeyboardNav(e: KeyboardEvent) {
    if (mode !== 'explore') return;
    if (e.key === 'ArrowLeft') {
      rawRotation += 30;
      rotation.set(rawRotation);
    } else if (e.key === 'ArrowRight') {
      rawRotation -= 30;
      rotation.set(rawRotation);
    }
  }
</script>

<svelte:head>
  <title>Circle of Fifths — Hans Sach's Musikschule</title>
</svelte:head>

<svelte:window onkeydown={handleKeyboardNav} />

<div class="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
  <div class="animate-in">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center"
        style="background-color: #f0fdfa; color: #0d9488;"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="w-5 h-5"
        >
          <circle cx="10" cy="10" r="7.5" />
          <circle cx="10" cy="10" r="4" />
          <circle cx="10" cy="2.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="10" cy="17.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="2.5" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-text-primary">
        Circle of Fifths
      </h1>
    </div>

    <!-- Mode Toggle -->
    <div class="flex justify-center mb-6">
      <ModeToggle {mode} onchange={handleModeChange} />
    </div>

    <!-- Main layout: circle + panel -->
    <div class="flex flex-col md:flex-row gap-6 items-start">
      <!-- Circle -->
      <div class="w-full md:w-[60%] flex-shrink-0">
        <CircleOfFifths
          {selectedKey}
          rotation={$rotation}
          {mode}
          hideLabels={mode === 'learn' && currentQuestion?.category === 'order' && !quizRevealed}
          quizFeedback={null}
          onselect={handleSelect}
          ondragrotate={handleDragRotate}
          ondragend={handleDragEnd}
        />
      </div>

      <!-- Side panel -->
      <div class="w-full md:w-[40%]">
        {#if mode === 'learn'}
          <QuizPanel
            question={currentQuestion}
            score={quizScore}
            total={quizTotal}
            category={quizCategory}
            oncategorychange={handleCategoryChange}
            onreveal={handleQuizReveal}
            onrate={handleQuizRate}
            onreset={handleQuizReset}
          />
        {:else}
          <DetailPanel {selectedKey} onnavigate={handleNavigate} />
        {/if}
      </div>
    </div>
  </div>
</div>
