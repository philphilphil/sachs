<script lang="ts">
  interface Props {
    correct: number;
    total: number;
    streak: number;
    bestStreak: number;
  }

  let { correct, total, streak, bestStreak }: Props = $props();
</script>

<div class="flex items-center justify-center gap-4 text-sm text-text-secondary">
  <span>Correct: <strong class="text-text-primary font-semibold">{correct} / {total}</strong></span>
  <span class="text-text-tertiary">·</span>
  <span>Streak: <strong class="text-text-primary font-semibold">{streak}</strong></span>
  <span class="text-text-tertiary">·</span>
  <span>Best: <strong class="text-text-primary font-semibold">{bestStreak}</strong></span>
</div>
