<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  import ScoreStrip from '$lib/components/shared/ScoreStrip.svelte';
  import ModeToggle, { type EarMode } from '$lib/components/ear-training/ModeToggle.svelte';
  import LevelIndicator from '$lib/components/ear-training/LevelIndicator.svelte';
  import DegreeGrid from '$lib/components/ear-training/DegreeGrid.svelte';
  import ReplayControls from '$lib/components/ear-training/ReplayControls.svelte';
  import RevealStaff from '$lib/components/ear-training/RevealStaff.svelte';

  import {
    generateScaleDegreeRound,
    type ScaleDegreeRound
  } from '$lib/utils/ear-training/round';
  import { getLevel, type ScaleDegreeLevel } from '$lib/utils/ear-training/levels';
  import type { ScaleDegree } from '$lib/utils/ear-training/music-theory';
  import { degreeToPitch } from '$lib/utils/ear-training/music-theory';
  import { ProgressionTracker } from '$lib/utils/ear-training/progression';
  import {
    loadLevel, saveLevel,
    loadBestStreak, saveBestStreak
  } from '$lib/utils/ear-training/storage';

  import { unlockAudio } from '$lib/audio/sampler';
  import { playCadence } from '$lib/audio/cadence';
  import { playNote } from '$lib/audio/phrase';

  // ---- state ----
  let mode = $state<EarMode>('scale-degree');
  let audioUnlocked = $state(false);
  let samplesLoading = $state(false);

  let level = $state<ScaleDegreeLevel>(1);
  let round = $state<ScaleDegreeRound | null>(null);
  let answers = $state<ScaleDegree[]>([]);  // user's sequence of answers this round
  let locked = $state(false);                // true once fully answered (awaits Next)
  let busy = $state(false);                  // playback in flight
  let feedbackLast = $state<{ degree: ScaleDegree; correct: boolean } | null>(null);
  let levelUpToast = $state(false);

  let correct = $state(0);
  let total = $state(0);
  let streak = $state(0);
  let bestStreak = $state(0);
  const tracker = new ProgressionTracker();

  const levelDef = $derived(getLevel(level));
  const showFlats = $derived(
    levelDef.mode === 'minor' ||
    levelDef.mode === 'mixed' ||
    (round?.mode === 'minor')
  );

  const expectedDegrees = $derived<ScaleDegree[]>(round?.targets ?? []);
  const currentIndex = $derived(answers.length);

  const revealLabels = $derived<string[]>(
    round
      ? round.targets.map((d) =>
          d === 'b3' ? '♭3̂' : d === 'b6' ? '♭6̂' : d === 'b7' ? '♭7̂' : `${d}̂`
        )
      : []
  );
  const revealTonic = $derived(
    round ? degreeToPitch(round.tonic, round.mode, 1, 3) : null
  );

  // ---- lifecycle ----
  onMount(() => {
    if (!browser) return;
    level = loadLevel();
    bestStreak = loadBestStreak('mode-a', level);
  });

  // ---- audio gate ----
  async function handleStart() {
    if (audioUnlocked) return;
    samplesLoading = true;
    await unlockAudio();
    audioUnlocked = true;
    samplesLoading = false;
    await nextRound();
  }

  // ---- round flow ----
  async function nextRound() {
    feedbackLast = null;
    locked = false;
    answers = [];
    const prev = round?.tonic;
    round = generateScaleDegreeRound(level, prev);
    await playRound();
  }

  async function playRound() {
    if (!round) return;
    busy = true;
    try {
      await playCadence(round.tonic, round.mode);
      for (const pitch of round.targetPitches) {
        await playNote(pitch);
      }
    } finally {
      busy = false;
    }
  }

  async function handleReplay() {
    if (!round) return;
    await playRound();
  }

  async function handlePlayTarget() {
    if (!round) return;
    busy = true;
    try {
      for (const pitch of round.targetPitches) await playNote(pitch);
    } finally {
      busy = false;
    }
  }

  // ---- answer handling ----
  function handleAnswer(degree: ScaleDegree) {
    if (locked || !round) return;
    const expected = expectedDegrees[currentIndex];
    const isCorrect = degree === expected;
    feedbackLast = { degree, correct: isCorrect };

    if (!isCorrect) {
      answers = [...answers, degree];
      recordRound(false);
      locked = true;
      return;
    }

    const newAnswers = [...answers, degree];
    answers = newAnswers;

    if (newAnswers.length === expectedDegrees.length) {
      recordRound(true);
      locked = true;
    } else {
      setTimeout(() => {
        feedbackLast = null;
      }, 350);
    }
  }

  function recordRound(isCorrect: boolean) {
    total += 1;
    if (isCorrect) {
      correct += 1;
      streak += 1;
      if (streak > bestStreak) {
        bestStreak = streak;
        if (browser) saveBestStreak('mode-a', bestStreak, level);
      }
    } else {
      streak = 0;
    }
    tracker.record(isCorrect);
  }

  async function handleNext() {
    if (tracker.shouldAdvance() && level < 5) {
      level = (level + 1) as ScaleDegreeLevel;
      if (browser) saveLevel(level);
      tracker.reset();
      streak = 0;
      bestStreak = browser ? loadBestStreak('mode-a', level) : 0;
      levelUpToast = true;
      setTimeout(() => (levelUpToast = false), 1600);
    }
    await nextRound();
  }

  function handleLevelJump(newLevel: ScaleDegreeLevel) {
    if (newLevel <= level) return;
    level = newLevel;
    if (browser) saveLevel(level);
    tracker.reset();
    correct = 0;
    total = 0;
    streak = 0;
    bestStreak = browser ? loadBestStreak('mode-a', level) : 0;
    nextRound();
  }

  // ---- keyboard ----
  function handleKey(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (mode !== 'scale-degree') return;
    if (!audioUnlocked) return;

    if (e.key === ' ') {
      e.preventDefault();
      if (locked) handleNext(); else handleReplay();
      return;
    }
    if (e.key === 'Enter' && locked) {
      e.preventDefault();
      handleNext();
      return;
    }

    if (locked) return;
    const digit = parseInt(e.key, 10);
    if (!Number.isInteger(digit) || digit < 1 || digit > 7) return;
    if (e.shiftKey && (digit === 3 || digit === 6 || digit === 7) && showFlats) {
      e.preventDefault();
      handleAnswer((`b${digit}` as ScaleDegree));
    } else if (!e.shiftKey) {
      e.preventDefault();
      handleAnswer(digit as ScaleDegree);
    }
  }
</script>

<svelte:head>
  <title>Ear Training — Hans Sach's Musikschule</title>
</svelte:head>
<svelte:window onkeydown={handleKey} />

<div class="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
  <div class="animate-in">
    <div class="flex items-start justify-between gap-6 mb-8">
      <div>
        <p class="eyebrow mb-2">Chapter III</p>
        <h1 class="text-3xl sm:text-[34px] font-semibold tracking-tight text-text-primary leading-tight">
          Ear <span class="serif italic font-normal">Training</span>
        </h1>
      </div>
      <ScoreStrip {correct} {total} {streak} {bestStreak} />
    </div>

    <div class="flex items-center justify-between gap-4 mb-10">
      <ModeToggle {mode} onchange={(m) => (mode = m)} />
      {#if mode === 'scale-degree'}
        <LevelIndicator {level} onchange={handleLevelJump} />
      {/if}
    </div>

    {#if !audioUnlocked}
      <div class="flex flex-col items-center gap-4 py-16">
        <p class="text-text-secondary">
          Audio practice needs a single click to begin.
        </p>
        <button
          type="button"
          class="px-6 py-3 rounded-lg bg-bg-card border border-border-subtle text-text-primary hover:bg-bg-hover"
          onclick={handleStart}
          disabled={samplesLoading}
        >
          {samplesLoading ? 'Loading piano…' : 'Start'}
        </button>
      </div>
    {:else if mode === 'scale-degree'}
      <div class="flex flex-col gap-8 items-center">
        {#if levelUpToast}
          <div class="px-3 py-1 rounded-full bg-bg-card text-text-primary text-sm border border-border-subtle">
            Level up! → {level}
          </div>
        {/if}

        <p class="eyebrow text-center">
          {#if round}
            Key of {round.tonic}{round.mode === 'minor' ? ' minor' : ' major'}
            {#if expectedDegrees.length > 1}· {currentIndex + 1} of {expectedDegrees.length}{/if}
          {:else}
            …
          {/if}
        </p>

        <DegreeGrid
          showFlats={showFlats}
          locked={locked && currentIndex >= expectedDegrees.length}
          feedback={feedbackLast}
          correctDegree={!feedbackLast?.correct && locked ? expectedDegrees[currentIndex] ?? null : null}
          onanswer={handleAnswer}
        />

        <ReplayControls
          busy={busy}
          onReplay={handleReplay}
          onPlayTarget={handlePlayTarget}
        />

        {#if locked && round}
          <div class="flex flex-col items-center gap-3">
            <RevealStaff
              pitches={round.targetPitches}
              labels={revealLabels}
              showTonic={revealTonic}
            />
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-text-primary text-bg-primary text-sm font-medium hover:opacity-90"
              onclick={handleNext}
            >
              Next — Enter
            </button>
          </div>
        {/if}

        <p class="text-center text-xs text-text-tertiary">
          Press <kbd class="kbd">1</kbd>…<kbd class="kbd">7</kbd>
          {#if showFlats}· <kbd class="kbd">Shift</kbd> + number for ♭{/if}
          · <kbd class="kbd">Space</kbd> replay
          · <kbd class="kbd">Enter</kbd> next
        </p>
      </div>
    {:else}
      <p class="text-center text-text-tertiary py-16">Mode B coming in Task 20.</p>
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
