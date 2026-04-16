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
  import ScoreBar from '$lib/components/note-trainer/ScoreBar.svelte';

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
    }, 800);
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

  const KEY_TO_LETTER: Record<string, string> = {
    c: 'C',
    d: 'D',
    e: 'E',
    f: 'F',
    g: 'G',
    a: 'A',
    b: 'B',
    // H = German B natural
    h: 'B'
  };

  function handleKeydown(event: KeyboardEvent) {
    if (mode !== 'note') return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const letter = KEY_TO_LETTER[event.key.toLowerCase()];
    if (!letter) return;
    event.preventDefault();
    handleAnswer(letter);
  }

  function handleRangeChange(range: { min: number; max: number }) {
    octaveRange = range;
    // Keep the best streak for "piano" mode; only restart the counter.
    correct = 0;
    total = 0;
    streak = 0;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = null;
    nextQuestion();
  }

  onMount(() => {
    resetSession();
  });
</script>

<svelte:head>
  <title>Note Reading — Hans Sach's Musikschule</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
  <div class="animate-in">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center"
        style="background-color: #f5f3ff; color: #7c3aed;"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path d="M13 3v10.27a2.5 2.5 0 1 1-2-2.45V5.5L13 3z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-text-primary">
        Note Reading
      </h1>
    </div>

    <!-- Mode toggle -->
    <div class="flex justify-center mb-4">
      <ModeToggle {mode} onchange={handleModeChange} />
    </div>

    <!-- Preset picker -->
    <div class="flex justify-center mb-6">
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

    <!-- Staff -->
    <div class="bg-bg-card rounded-xl border border-border p-4 mb-6 min-h-[180px] flex items-center justify-center">
      {#if mode === 'note' && noteQuestion}
        <StaffDisplay
          keySignature={noteQuestion.keySignature}
          note={noteQuestion.note}
        />
      {:else if mode === 'key' && keyQuestion}
        <StaffDisplay
          keySignature={keyQuestion.keySignature}
          note={null}
        />
      {:else}
        <p class="text-sm text-text-tertiary">Loading…</p>
      {/if}
    </div>

    <!-- Answer grid -->
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

    <!-- Score -->
    <ScoreBar {correct} {total} {streak} {bestStreak} />
  </div>
</div>
