<script lang="ts">
  import { theme, type ThemeMode } from '$lib/theme.svelte';

  const labels: Record<ThemeMode, string> = {
    system: 'System theme (click for light)',
    light: 'Light theme (click for dark)',
    dark: 'Dark theme (click for system)'
  };
</script>

<button
  type="button"
  onclick={() => theme.cycle()}
  aria-label={labels[theme.mode]}
  title={labels[theme.mode]}
  class="fixed bottom-4 right-4 z-50 w-9 h-9 rounded-full bg-bg-card/85 backdrop-blur-md
         border border-border text-text-secondary hover:text-text-primary hover:border-border-hover
         shadow-sm transition-all duration-200 flex items-center justify-center
         hover:scale-105 active:scale-95"
>
  {#if theme.mode === 'system'}
    <!-- Monitor icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-[17px] h-[17px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="1.6"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path stroke-linecap="round" d="M8 20h8M12 16v4" />
    </svg>
  {:else if theme.mode === 'light'}
    <!-- Sun icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-[17px] h-[17px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="1.6"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        stroke-linecap="round"
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"
      />
    </svg>
  {:else}
    <!-- Moon icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-[17px] h-[17px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="1.6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M20.5 14.5A8 8 0 1 1 9.5 3.5a6.5 6.5 0 0 0 11 11z"
      />
    </svg>
  {/if}
</button>
