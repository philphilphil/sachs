<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import {
    PRESETS,
    buildPianoPreset,
    type Preset,
    type PresetId,
    type KeySignature
  } from '$lib/data/notes';
  import {
    generateNoteQuestion,
    generateKeyQuestion,
    type NoteQuestion,
    type KeyQuestion
  } from '$lib/utils/note-quiz';
  import { loadBest, saveBest, type QuizMode } from '$lib/utils/note-storage';

  import ModeToggle from '$lib/components/note-trainer/ModeToggle.svelte';
  import PresetPicker from '$lib/components/note-trainer/PresetPicker.svelte';
  import StaffDisplay from '$lib/components/note-trainer/StaffDisplay.svelte';
  import AnswerGrid from '$lib/components/note-trainer/AnswerGrid.svelte';
  import KeyAnswerGrid from '$lib/components/note-trainer/KeyAnswerGrid.svelte';
  import ScoreStrip from '$lib/components/shared/ScoreStrip.svelte';

  let mode = $state<QuizMode>('note');
  let presetId = $state<PresetId>('violin-1st');
  let octaveRange = $state<{ min: number; max: number }>({ min: 3, max: 5 });
  let naturalsOnly = $state(false);

  let correct = $state(0);
  let total = $state(0);
  let streak = $state(0);
  let bestStreak = $state(0);

  let noteQuestion = $state<NoteQuestion | null>(null);
  let keyQuestion = $state<KeyQuestion | null>(null);
  let feedback = $state<{ answer: string; correct: boolean } | null>(null);

  let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
  let staffPulse = $state<'correct' | 'incorrect' | null>(null);

  function currentPreset(): Preset {
    const base =
      presetId === 'piano'
        ? buildPianoPreset(octaveRange)
        : PRESETS.find((p) => p.id === presetId)!;
    if (mode === 'note' && naturalsOnly) {
      const cMajor = base.keys.find((k) => k.tonic === 'C');
      if (cMajor) return { ...base, keys: [cMajor] };
    }
    return base;
  }

  function storageVariant(): string | undefined {
    return mode === 'note' && naturalsOnly ? 'naturals' : undefined;
  }

  function previousKeySig(): KeySignature | undefined {
    if (mode === 'note') return noteQuestion?.keySignature;
    return keyQuestion?.keySignature;
  }

  function nextQuestion() {
    const preset = currentPreset();
    if (mode === 'note') {
      noteQuestion = generateNoteQuestion(preset, previousKeySig());
      keyQuestion = null;
    } else {
      keyQuestion = generateKeyQuestion(preset, previousKeySig());
      noteQuestion = null;
    }
    feedback = null;
    staffPulse = null;
  }

  function resetSession() {
    correct = 0;
    total = 0;
    streak = 0;
    bestStreak = browser ? loadBest(presetId, mode, storageVariant()) : 0;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = null;
    nextQuestion();
  }

  function handleAnswer(answer: string) {
    if (feedback !== null) return;
    const target =
      mode === 'note' ? noteQuestion?.correctAnswer : keyQuestion?.correctAnswer;
    if (!target) return;

    const isCorrect = answer === target;
    feedback = { answer, correct: isCorrect };
    staffPulse = isCorrect ? 'correct' : 'incorrect';
    total += 1;
    if (isCorrect) {
      correct += 1;
      streak += 1;
      if (streak > bestStreak) {
        bestStreak = streak;
        if (browser) saveBest(presetId, mode, bestStreak, storageVariant());
      }
    } else {
      streak = 0;
    }

    feedbackTimer = setTimeout(() => {
      feedbackTimer = null;
      nextQuestion();
    }, 900);
  }

  function handleModeChange(newMode: QuizMode) {
    mode = newMode;
    resetSession();
  }

  function handlePresetChange(id: PresetId) {
    presetId = id;
    resetSession();
  }

  function handleNaturalsOnlyChange(value: boolean) {
    naturalsOnly = value;
    resetSession();
  }

  function handleRangeChange(range: { min: number; max: number }) {
    octaveRange = range;
    correct = 0;
    total = 0;
    streak = 0;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = null;
    nextQuestion();
  }

  const KEY_TO_LETTER: Record<string, string> = {
    c: 'C',
    d: 'D',
    e: 'E',
    f: 'F',
    g: 'G',
    a: 'A',
    b: 'B',
    h: 'B' // German B natural
  };

  function handleKeydown(event: KeyboardEvent) {
    if (mode !== 'note') return;
    if (event.metaKey || event.ctrlKey) return;
    const letter = KEY_TO_LETTER[event.key.toLowerCase()];
    if (!letter) return;
    event.preventDefault();
    // Only shift/alt act as modifiers — combined (e.g. Shift+Alt) → natural.
    const shift = event.shiftKey && !event.altKey;
    const alt = event.altKey && !event.shiftKey;
    if (naturalsOnly) {
      handleAnswer(letter);
    } else if (shift) {
      handleAnswer(`${letter}♯`);
    } else if (alt) {
      handleAnswer(`${letter}♭`);
    } else {
      handleAnswer(letter);
    }
  }

  function keyLabel(ks: KeySignature | undefined): string {
    if (!ks) return '';
    if (ks.type === 'natural') return `Key of ${ks.tonic} major · no accidentals`;
    const count = ks.accidentals.length;
    const symbol = ks.type === 'sharp' ? '♯' : '♭';
    const word = ks.type === 'sharp' ? 'sharp' : 'flat';
    return `Key of ${ks.tonic} major · ${count} ${word}${count > 1 ? 's' : ''} (${symbol})`;
  }

  onMount(() => {
    resetSession();
  });
</script>

<svelte:head>
  <title>Note Reading — Hans Sach's Musikschule</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
  <div class="animate-in">
    <!-- Top strip: title left, score right (stacks on mobile) -->
    <div class="flex flex-col items-start gap-5 sm:flex-row sm:justify-between sm:gap-6 mb-10">
      <div>
        <p class="eyebrow mb-2">Chapter II</p>
        <h1 class="text-3xl sm:text-[34px] font-semibold tracking-tight text-text-primary leading-tight">
          Note <span class="serif italic font-normal">Reading</span>
        </h1>
      </div>
      <ScoreStrip {correct} {total} {streak} {bestStreak} />
    </div>

    <!-- Controls -->
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 mb-10">
      <ModeToggle {mode} onchange={handleModeChange} />
      <PresetPicker
        {presetId}
        {octaveRange}
        {naturalsOnly}
        showNaturalsOnly={mode === 'note'}
        onpresetchange={handlePresetChange}
        onrangechange={handleRangeChange}
        onnaturalsonlychange={handleNaturalsOnlyChange}
      />
    </div>

    <!-- Staff area (no card — music breathes on the page) -->
    <div class="mb-12 pt-2">
      <p class="eyebrow text-center mb-5">
        {#if mode === 'note'}
          {keyLabel(noteQuestion?.keySignature)}
        {:else}
          Identify the key signature
        {/if}
      </p>

      <div
        class="flex justify-center min-h-[180px]"
        class:animate-pulse-glow={staffPulse === 'correct'}
        class:animate-shake-x={staffPulse === 'incorrect'}
      >
        {#if mode === 'note' && noteQuestion}
          <StaffDisplay
            keySignature={noteQuestion.keySignature}
            note={noteQuestion.note}
          />
        {:else if mode === 'key' && keyQuestion}
          <StaffDisplay keySignature={keyQuestion.keySignature} note={null} />
        {:else}
          <div class="h-[180px] flex items-center">
            <p class="text-sm text-text-tertiary">Loading…</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Answer -->
    <div class="mb-6">
      {#if mode === 'note' && noteQuestion}
        <AnswerGrid
          correctAnswer={noteQuestion.correctAnswer}
          {feedback}
          showAccidentals={!naturalsOnly}
          onanswer={handleAnswer}
        />
      {:else if mode === 'key' && keyQuestion}
        <KeyAnswerGrid
          correctAnswer={keyQuestion.correctAnswer}
          {feedback}
          onanswer={handleAnswer}
        />
      {/if}
    </div>

    <!-- Keyboard hint (desktop only) -->
    {#if mode === 'note'}
      <p class="hidden sm:block text-center text-xs text-text-tertiary">
        {#if naturalsOnly}
          Press <kbd class="kbd">C</kbd> <kbd class="kbd">D</kbd>
          <kbd class="kbd">E</kbd> <kbd class="kbd">F</kbd>
          <kbd class="kbd">G</kbd> <kbd class="kbd">A</kbd>
          <kbd class="kbd">B</kbd> — or <kbd class="kbd">H</kbd> for B
        {:else}
          Press a letter for the natural ·
          <kbd class="kbd">Shift</kbd> <span class="opacity-60">+</span> letter for ♯ ·
          <kbd class="kbd">Alt</kbd> <span class="opacity-60">+</span> letter for ♭
        {/if}
      </p>
    {/if}
  </div>
</div>

<style>
  :global(.kbd) {
    display: inline-block;
    padding: 1px 6px;
    font-family: var(--font-sans);
    font-size: 11px;
    line-height: 1.3;
    color: var(--color-text-secondary);
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    box-shadow: inset 0 -1px 0 var(--color-border);
  }
</style>
