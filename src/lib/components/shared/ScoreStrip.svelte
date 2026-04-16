<script lang="ts">
  interface Props {
    correct: number;
    total: number;
    streak: number;
    bestStreak: number;
  }

  let { correct, total, streak, bestStreak }: Props = $props();

  let prevStreak = $state(0);
  let streakPopKey = $state(0);
  let prevCorrect = $state(0);
  let correctPopKey = $state(0);

  $effect(() => {
    if (streak > prevStreak) streakPopKey++;
    prevStreak = streak;
  });

  $effect(() => {
    if (correct > prevCorrect) correctPopKey++;
    prevCorrect = correct;
  });

  const progress = $derived(
    bestStreak > 0 ? Math.min(streak / bestStreak, 1) : 0
  );
  const showFlame = $derived(streak >= 3);
  const accuracy = $derived(total > 0 ? Math.round((correct / total) * 100) : 0);
</script>

<div class="flex items-stretch divide-x divide-border-subtle text-right">
  <!-- Correct -->
  <div class="px-3 sm:px-4 first:pl-0">
    <p class="eyebrow mb-1">Correct</p>
    <p class="text-lg sm:text-xl font-semibold text-text-primary tnum leading-none">
      {#key correctPopKey}
        <span class="inline-block animate-number-bump">{correct}</span>
      {/key}<span class="text-text-tertiary">/{total}</span>
    </p>
    {#if total > 0}
      <p class="mt-1 text-[11px] text-text-tertiary tnum">{accuracy}%</p>
    {:else}
      <p class="mt-1 text-[11px] text-text-tertiary">&nbsp;</p>
    {/if}
  </div>

  <!-- Streak -->
  <div class="px-3 sm:px-4">
    <p class="eyebrow mb-1">Streak</p>
    <p class="text-lg sm:text-xl font-semibold text-text-primary tnum leading-none flex items-center justify-end gap-1">
      {#if showFlame}
        <svg class="w-4 h-4 text-accent" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 1.5c0 0-1.5 2.5-1.5 4.5 0 .8.3 1.4.7 1.9C8.6 6.7 7.5 5 7 3.5 5.4 5 4 7 4 9.5 4 13 6.7 16 10 16s6-3 6-6.5C16 6.5 13 5 12 1.5c-.3.8-1 2-1.5 3 .3-1 .5-2 .5-3H10z" />
        </svg>
      {/if}
      {#key streakPopKey}
        <span class="inline-block animate-number-bump">{streak}</span>
      {/key}
    </p>
    <!-- Progress toward best -->
    <div class="mt-1.5 h-[2px] w-10 sm:w-14 bg-border-subtle rounded-full overflow-hidden ml-auto">
      <div
        class="h-full bg-accent transition-all duration-500 ease-out"
        style="width: {progress * 100}%;"
      ></div>
    </div>
  </div>

  <!-- Best -->
  <div class="px-3 sm:px-4 pr-0">
    <p class="eyebrow mb-1">Best</p>
    <p class="text-lg sm:text-xl font-semibold text-text-primary tnum leading-none">
      {bestStreak}
    </p>
    <p class="mt-1 text-[11px] text-text-tertiary">streak</p>
  </div>
</div>
