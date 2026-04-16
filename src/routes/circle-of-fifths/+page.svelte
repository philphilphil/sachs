<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { KEYS } from '$lib/data/keys';
  import { shortestRotationTo } from '$lib/utils/circle-math';
  import { generateQuestion, type QuizQuestion } from '$lib/utils/quiz';
  import CircleOfFifths from '$lib/components/circle-of-fifths/CircleOfFifths.svelte';
  import DetailPanel from '$lib/components/circle-of-fifths/DetailPanel.svelte';
  import QuizPanel from '$lib/components/circle-of-fifths/QuizPanel.svelte';
  import ModeToggle from '$lib/components/circle-of-fifths/ModeToggle.svelte';

  type Mode = 'explore' | 'reference' | 'learn';

  let selectedKey = $state<number | null>(null);
  let mode = $state<Mode>('reference');

  // Rotation
  const rotation = tweened(0, { duration: 400, easing: cubicOut });
  let rawRotation = 0;

  // Quiz state
  let quizScore = $state(0);
  let quizTotal = $state(0);
  let currentQuestion = $state<QuizQuestion | null>(null);
  let quizFeedback = $state<{
    index: number;
    ring: 'major' | 'minor';
    result: 'correct' | 'wrong';
  } | null>(null);
  let feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  function handleSelect(index: number, ring: 'major' | 'minor') {
    if (mode === 'learn') {
      handleQuizAnswer(index, ring);
      return;
    }

    // Toggle selection: click same key to deselect
    if (selectedKey === index) {
      selectedKey = null;
      return;
    }

    selectedKey = index;

    if (mode === 'explore') {
      // Rotate to put selected key at top
      const targetDeg = -index * 30;
      const delta = shortestRotationTo(rawRotation % 360, targetDeg % 360);
      rawRotation += delta;
      rotation.set(rawRotation);
    }
  }

  function handleNavigate(index: number) {
    selectedKey = index;
    if (mode === 'explore') {
      const targetDeg = -index * 30;
      const delta = shortestRotationTo(rawRotation % 360, targetDeg % 360);
      rawRotation += delta;
      rotation.set(rawRotation);
    }
  }

  function handleDragRotate(delta: number) {
    rawRotation += delta;
    rotation.set(rawRotation, { duration: 0 });
  }

  function handleDragEnd(velocity: number) {
    // Apply momentum
    rawRotation += velocity;
    rotation.set(rawRotation, { duration: 500 });
  }

  function handleModeChange(newMode: Mode) {
    mode = newMode;
    quizFeedback = null;

    if (newMode === 'learn') {
      selectedKey = null;
      quizScore = 0;
      quizTotal = 0;
      currentQuestion = generateQuestion();
    } else if (newMode === 'reference') {
      // Reset rotation for static reference view
      rawRotation = 0;
      rotation.set(0);
      currentQuestion = null;
    } else {
      currentQuestion = null;
    }
  }

  function handleQuizAnswer(index: number, ring: 'major' | 'minor') {
    if (!currentQuestion || quizFeedback) return;

    quizTotal++;
    const isCorrect =
      index === currentQuestion.answerIndex && ring === currentQuestion.answerRing;

    if (isCorrect) quizScore++;

    quizFeedback = { index, ring, result: isCorrect ? 'correct' : 'wrong' };
    selectedKey = currentQuestion.answerIndex;

    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
      quizFeedback = null;
      selectedKey = null;
      currentQuestion = generateQuestion(currentQuestion?.answerIndex);
    }, 1500);
  }

  function handleQuizReset() {
    quizScore = 0;
    quizTotal = 0;
    quizFeedback = null;
    selectedKey = null;
    currentQuestion = generateQuestion();
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
          {quizFeedback}
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
            feedback={quizFeedback ? quizFeedback.result : null}
            onreset={handleQuizReset}
          />
        {:else}
          <DetailPanel {selectedKey} onnavigate={handleNavigate} />
        {/if}
      </div>
    </div>
  </div>
</div>
