<script lang="ts">
  import FeatureCard from '$lib/components/FeatureCard.svelte';
  import { base } from '$app/paths';

  const features = [
    {
      title: 'Circle of Fifths',
      description: 'Explore how major and minor keys connect through an interactive circle.',
      href: `${base}/circle-of-fifths`,
      icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="2.5" r="1" fill="currentColor" stroke="none"/><circle cx="17.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="10" cy="17.5" r="1" fill="currentColor" stroke="none"/><circle cx="2.5" cy="10" r="1" fill="currentColor" stroke="none"/></svg>`,
      color: '#0d9488',
      colorLight: '#f0fdfa',
      delay: 0
    },
    {
      title: 'Note Reading',
      description: 'Train yourself to instantly recognise notes on the treble clef.',
      href: `${base}/note-trainer`,
      icon: `<svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M13 3v10.27a2.5 2.5 0 1 1-2-2.45V5.5L13 3z"/></svg>`,
      color: '#7c3aed',
      colorLight: '#f5f3ff',
      delay: 60
    },
    {
      title: 'Ear Training',
      description: 'Sharpen your ear to recognise intervals and keys by sound.',
      href: `${base}/ear-training`,
      icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><path d="M4 10a6 6 0 0 1 12 0"/><path d="M6.5 10a3.5 3.5 0 0 1 7 0"/><circle cx="10" cy="10" r="1" fill="currentColor"/><path d="M10 11v4"/><circle cx="10" cy="16" r="1.5"/></svg>`,
      color: '#0891b2',
      colorLight: '#ecfeff',
      delay: 120
    },
    {
      title: 'Finger Patterns',
      description: 'Visualise violin finger positions across the fingerboard.',
      href: `${base}/finger-patterns`,
      icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><rect x="3" y="2" width="14" height="16" rx="1.5"/><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="14" x2="17" y2="14"/><circle cx="8" cy="4" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="7" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="13" cy="16" r="1" fill="currentColor" stroke="none"/></svg>`,
      color: '#d946ef',
      colorLight: '#fdf4ff',
      delay: 180
    }
  ];
</script>

<svelte:head>
  <title>Hans Sach's Musikschule</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
  <!-- Hero -->
  <div class="mb-12 animate-in">
    <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
      Hans Sach's Musikschule
    </h1>
    <p class="mt-2 text-base text-text-secondary">
      Learn music theory and violin, one step at a time.
    </p>
  </div>

  <!-- Feature Cards -->
  <div class="grid grid-cols-1 gap-3">
    {#each features as feature}
      <FeatureCard {...feature} />
    {/each}
  </div>
</div>
