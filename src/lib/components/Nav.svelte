<script lang="ts">
  import { page } from '$app/state';
  import { base } from '$app/paths';

  let menuOpen = $state(false);

  const links = [
    { href: '/circle-of-fifths', label: 'Circle of Fifths' },
    { href: '/note-trainer', label: 'Note Trainer' },
    { href: '/ear-training', label: 'Ear Training' },
    { href: '/finger-patterns', label: 'Finger Patterns' }
  ];
</script>

<nav class="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
  <div class="max-w-5xl mx-auto px-5 sm:px-8">
    <div class="flex items-center justify-between h-14">
      <!-- Logo -->
      <a href="{base}/" class="flex items-center gap-2.5 group">
        <div class="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <svg viewBox="0 0 16 16" class="w-4 h-4 text-white" fill="currentColor">
            <path d="M11 1v10.268A2 2 0 1 1 9 9.268V3h0V1h2zM5 5v6.268A2 2 0 1 1 3 9.268V7h0V5h2z" />
          </svg>
        </div>
        <span class="text-[15px] font-semibold text-text-primary">
          Hans Sach's Musikschule
        </span>
      </a>

      <!-- Mobile menu button -->
      <button
        class="md:hidden p-2 -mr-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        onclick={() => (menuOpen = !menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          {#if menuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6h16.5" />
          {/if}
        </svg>
      </button>

      <!-- Desktop nav -->
      <div class="hidden md:flex items-center gap-0.5">
        {#each links as link}
          {@const isActive = page.url.pathname === base + link.href}
          <a
            href="{base}{link.href}"
            class="px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors
              {isActive
              ? 'text-accent bg-accent-light'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'}"
          >
            {link.label}
          </a>
        {/each}
      </div>
    </div>

    <!-- Mobile menu -->
    {#if menuOpen}
      <div class="md:hidden pb-3 space-y-0.5">
        {#each links as link}
          {@const isActive = page.url.pathname === base + link.href}
          <a
            href="{base}{link.href}"
            class="block px-3 py-2 rounded-md text-sm font-medium transition-colors
              {isActive
              ? 'text-accent bg-accent-light'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'}"
            onclick={() => (menuOpen = false)}
          >
            {link.label}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</nav>
