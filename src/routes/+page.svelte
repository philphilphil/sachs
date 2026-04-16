<script lang="ts">
  import FeatureCard from '$lib/components/FeatureCard.svelte';
  import { base } from '$app/paths';

  const features = [
    {
      title: 'Circle of Fifths',
      description: 'Trace how keys relate through the twelve-spoked map of tonal space.',
      href: `${base}/circle-of-fifths`,
      chapter: 'I',
      icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="2.5" r="1" fill="currentColor" stroke="none"/><circle cx="17.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="10" cy="17.5" r="1" fill="currentColor" stroke="none"/><circle cx="2.5" cy="10" r="1" fill="currentColor" stroke="none"/></svg>`,
      color: 'var(--color-teal)',
      colorLight: 'var(--color-teal-light)',
      delay: 0
    },
    {
      title: 'Note Reading',
      description: 'Read the treble clef by sight — violin, piano, or a preset of your own.',
      href: `${base}/note-trainer`,
      chapter: 'II',
      icon: `<svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M13 3v10.27a2.5 2.5 0 1 1-2-2.45V5.5L13 3z"/></svg>`,
      color: 'var(--color-violet)',
      colorLight: 'var(--color-violet-light)',
      delay: 60
    },
    {
      title: 'Ear Training',
      description: 'Recognise intervals and keys by sound alone.',
      href: `${base}/ear-training`,
      chapter: 'III',
      icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><path d="M4 10a6 6 0 0 1 12 0"/><path d="M6.5 10a3.5 3.5 0 0 1 7 0"/><circle cx="10" cy="10" r="1" fill="currentColor"/><path d="M10 11v4"/><circle cx="10" cy="16" r="1.5"/></svg>`,
      color: 'var(--color-cyan)',
      colorLight: 'var(--color-cyan-light)',
      delay: 120
    },
    {
      title: 'Finger Patterns',
      description: 'Map violin fingerings across the board, one position at a time.',
      href: `${base}/finger-patterns`,
      chapter: 'IV',
      icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><rect x="3" y="2" width="14" height="16" rx="1.5"/><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="14" x2="17" y2="14"/><circle cx="8" cy="4" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="7" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="13" cy="16" r="1" fill="currentColor" stroke="none"/></svg>`,
      color: 'var(--color-magenta)',
      colorLight: 'var(--color-magenta-light)',
      delay: 180
    }
  ];
</script>

<svelte:head>
  <title>Hans Sach's Musikschule</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
  <!-- Hero -->
  <div class="mb-14 animate-in">
    <p class="eyebrow mb-4">A music school on the web</p>
    <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight text-text-primary leading-[1.05]">
      Hans Sach's <span class="serif italic font-normal">Musikschule</span>
    </h1>
    <p class="mt-5 text-lg text-text-secondary max-w-xl leading-relaxed">
      A small collection of practice tools for reading, hearing, and playing music —
      built for violin and piano students, useful to anyone.
    </p>
  </div>

  <!-- Table of contents -->
  <div class="mb-4 flex items-end justify-between">
    <p class="eyebrow">Trainers</p>
    <p class="eyebrow">4 chapters</p>
  </div>
  <hr class="hairline mb-5" />

  <!-- Feature Cards -->
  <div class="grid grid-cols-1 gap-3">
    {#each features as feature}
      <FeatureCard {...feature} />
    {/each}
  </div>
</div>
