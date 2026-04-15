<script lang="ts">
  import FeatureCard from '$lib/components/FeatureCard.svelte';

  const features = [
    {
      title: 'Circle of Fifths',
      description: 'Explore keys and their relationships',
      href: '/circle-of-fifths',
      iconLabel: 'V',
      iconColor: '#0d9488'
    },
    {
      title: 'Note Reading Trainer',
      description: 'Identify notes on the treble clef',
      href: '/note-trainer',
      iconLabel: 'N',
      iconColor: '#7c3aed'
    },
    {
      title: 'Ear Training',
      description: 'Recognize notes and keys by ear',
      href: '/ear-training',
      iconLabel: 'E',
      iconColor: '#0891b2'
    },
    {
      title: 'Violin Finger Patterns',
      description: 'Learn finger positions for every key',
      href: '/finger-patterns',
      iconLabel: 'F',
      iconColor: '#c026d3'
    }
  ];
</script>

<svelte:head>
  <title>Music Trainer</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
  <div class="text-center mb-10">
    <h1 class="text-4xl font-bold text-slate-900">Music Trainer</h1>
    <p class="mt-3 text-lg text-slate-500">Learn music theory and violin, one step at a time</p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {#each features as feature}
      <FeatureCard {...feature} />
    {/each}
  </div>
</div>
