<script lang="ts">
  import { page } from '$app/state';

  let menuOpen = $state(false);

  const links = [
    { href: '/circle-of-fifths', label: 'Circle of Fifths' },
    { href: '/note-trainer', label: 'Note Trainer' },
    { href: '/ear-training', label: 'Ear Training' },
    { href: '/finger-patterns', label: 'Finger Patterns' }
  ];
</script>

<nav class="bg-white shadow-sm sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
        Music Trainer
      </a>

      <button
        class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        onclick={() => (menuOpen = !menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if menuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          {/if}
        </svg>
      </button>

      <div class="hidden md:flex items-center gap-1">
        {#each links as link}
          <a
            href={link.href}
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
              {page.url.pathname === link.href
              ? 'bg-primary-50 text-primary-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
          >
            {link.label}
          </a>
        {/each}
      </div>
    </div>

    {#if menuOpen}
      <div class="md:hidden pb-3 border-t border-slate-100 mt-1 space-y-1">
        {#each links as link}
          <a
            href={link.href}
            class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors
              {page.url.pathname === link.href
              ? 'bg-primary-50 text-primary-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
            onclick={() => (menuOpen = false)}
          >
            {link.label}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</nav>
