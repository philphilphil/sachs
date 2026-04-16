<script lang="ts">
  interface Props {
    onReplay: () => void;
    onPlayTarget?: () => void;
    busy: boolean;
  }

  let { onReplay, onPlayTarget, busy }: Props = $props();
</script>

<div class="flex gap-3 justify-center">
  <button
    type="button"
    onclick={onReplay}
    disabled={busy}
    class="px-4 py-2 rounded-lg border border-border-subtle text-sm
           text-text-primary bg-bg-card
           hover:border-[color:var(--color-violet)] hover:text-[color:var(--color-violet-deep)] hover:bg-[color:var(--color-violet-light)]
           transition-all duration-200
           disabled:opacity-40 disabled:cursor-not-allowed"
    aria-label="Replay"
  >
    Replay
  </button>
  {#if onPlayTarget}
    <button
      type="button"
      onclick={onPlayTarget}
      disabled={busy}
      class="px-4 py-2 rounded-lg border border-border-subtle text-sm
             text-text-secondary bg-bg-card
             hover:border-[color:var(--color-violet)] hover:text-[color:var(--color-violet-deep)] hover:bg-[color:var(--color-violet-light)]
             transition-all duration-200
             disabled:opacity-40 disabled:cursor-not-allowed"
      aria-label="Play target note"
    >
      Play target
    </button>
  {/if}
</div>
