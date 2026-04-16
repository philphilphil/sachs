<script lang="ts">
  import { onDestroy } from 'svelte';
  import { unlockAudio } from '$lib/audio/sampler';
  import { startDrone, stopDrone } from '$lib/audio/drone';
  import type { PitchClass } from '$lib/utils/ear-training/music-theory';

  const KEYS: { value: PitchClass; label: string }[] = [
    { value: 'C', label: 'C' },
    { value: 'G', label: 'G' },
    { value: 'D', label: 'D' },
    { value: 'A', label: 'A' },
    { value: 'E', label: 'E' },
    { value: 'F', label: 'F' },
    { value: 'A#', label: 'B♭' },
    { value: 'D#', label: 'E♭' },
    { value: 'G#', label: 'A♭' },
    { value: 'C#', label: 'D♭' },
    { value: 'F#', label: 'F♯' },
    { value: 'B', label: 'B' }
  ];

  let selectedKey = $state<PitchClass>('D');
  let playing = $state(false);

  async function handleToggle() {
    if (!playing) {
      await unlockAudio();
      startDrone({ pitchClass: selectedKey, octave: 3 });
      playing = true;
    } else {
      stopDrone();
      playing = false;
    }
  }

  function handleKeyChange(k: PitchClass) {
    selectedKey = k;
    if (playing) {
      startDrone({ pitchClass: k, octave: 3 });
    }
  }

  onDestroy(() => {
    stopDrone();
  });

  const currentLabel = $derived(KEYS.find((k) => k.value === selectedKey)?.label ?? selectedKey);
</script>

<svelte:head>
  <title>Finger Patterns — Hans Sach's Musikschule</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
  <div class="animate-in">
    <p class="eyebrow mb-3">Chapter IV</p>
    <h1
      class="text-3xl sm:text-[34px] font-semibold tracking-tight text-text-primary leading-tight"
    >
      Finger <span class="serif italic font-normal">Patterns</span>
    </h1>
    <p class="mt-4 text-text-secondary leading-relaxed max-w-xl">
      Drone practice for intonation. Pick a key, start the drone, play a scale
      on your violin alongside it. Listen for when each note locks — the wobble
      stops and the tone rings cleanly.
    </p>

    <hr class="hairline my-8" />

    <p class="eyebrow mb-3">Key</p>
    <div class="flex flex-wrap gap-2 mb-10">
      {#each KEYS as key}
        {@const active = selectedKey === key.value}
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg border text-sm transition-all duration-200 bg-transparent"
          class:border-[color:var(--color-violet)]={active}
          class:bg-[color:var(--color-violet-light)]={active}
          class:text-[color:var(--color-violet-deep)]={active}
          class:border-border-subtle={!active}
          class:text-text-secondary={!active}
          class:hover:border-[color:var(--color-violet)]={!active}
          class:hover:text-[color:var(--color-violet-deep)]={!active}
          onclick={() => handleKeyChange(key.value)}
        >
          {key.label}
        </button>
      {/each}
    </div>

    <button
      type="button"
      class="px-8 py-4 rounded-xl border text-lg font-semibold transition-all duration-200"
      class:bg-[color:var(--color-violet)]={playing}
      class:text-white={playing}
      class:border-[color:var(--color-violet)]={playing}
      class:bg-bg-card={!playing}
      class:text-text-primary={!playing}
      class:border-border-subtle={!playing}
      class:hover:border-[color:var(--color-violet)]={!playing}
      onclick={handleToggle}
    >
      {playing ? `Stop drone · ${currentLabel}` : `Start drone · ${currentLabel}`}
    </button>

    <p class="mt-5 text-xs text-text-tertiary max-w-md leading-relaxed">
      The drone plays continuously at a low volume. Play a scale in the same
      key on your violin and adjust your fingers until each note rings cleanly
      against it. Changing the key while playing restarts the drone.
    </p>

    <hr class="hairline my-10" />

    <p class="eyebrow">Coming later</p>
    <ul class="mt-3 text-sm text-text-tertiary space-y-2 list-none">
      <li class="flex gap-3"><span class="text-text-tertiary tabular-nums">A.</span>
        Fingerboard map — which finger for which note in every position.</li>
      <li class="flex gap-3"><span class="text-text-tertiary tabular-nums">B.</span>
        Scale reference tones — tap a degree, hear the exact pitch against the drone.</li>
    </ul>
  </div>
</div>
