<script lang="ts">
  import { KEYS, type KeyData } from '$lib/data/keys';

  interface Props {
    selectedKey: number | null;
    onnavigate: (index: number) => void;
  }

  let { selectedKey, onnavigate }: Props = $props();

  let key = $derived<KeyData | null>(selectedKey !== null ? KEYS[selectedKey] : null);
  let dominant = $derived(selectedKey !== null ? KEYS[(selectedKey + 1) % 12] : null);
  let subdominant = $derived(selectedKey !== null ? KEYS[(selectedKey + 11) % 12] : null);

  const chordNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
</script>

<div class="bg-bg-card rounded-xl border border-border p-6" aria-live="polite">
  {#if key}
    <div class="space-y-5">
      <!-- Key name -->
      <div>
        <h2 class="text-2xl font-bold text-text-primary">
          {key.name} Major
        </h2>
        {#if key.enharmonic}
          <p class="text-sm text-text-tertiary mt-0.5">
            Enharmonic: {key.enharmonic} Major
          </p>
        {/if}
      </div>

      <!-- Key signature -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
          Key Signature
        </h3>
        <p class="text-sm text-text-secondary">
          {#if key.sharps > 0}
            {key.sharps} sharp{key.sharps > 1 ? 's' : ''}: {key.signatureNotes.join(', ')}
          {:else if key.flats > 0}
            {key.flats} flat{key.flats > 1 ? 's' : ''}: {key.signatureNotes.join(', ')}
          {:else}
            No sharps or flats
          {/if}
        </p>
      </div>

      <!-- Relationships -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
          Relationships
        </h3>
        <div class="space-y-1">
          <button
            class="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors w-full text-left"
            onclick={() => onnavigate(key!.index)}
          >
            <span class="w-2 h-2 rounded-full" style="background-color: #e8654a;"></span>
            Relative minor: {key.minor}
          </button>
          {#if dominant}
            <button
              class="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors w-full text-left"
              onclick={() => onnavigate(dominant!.index)}
            >
              <span class="w-2 h-2 rounded-full" style="background-color: #0d9488;"></span>
              Dominant: {dominant.name}
            </button>
          {/if}
          {#if subdominant}
            <button
              class="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors w-full text-left"
              onclick={() => onnavigate(subdominant!.index)}
            >
              <span class="w-2 h-2 rounded-full" style="background-color: #7c3aed;"></span>
              Subdominant: {subdominant.name}
            </button>
          {/if}
        </div>
      </div>

      <!-- Diatonic chords -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
          Diatonic Chords
        </h3>
        <div class="grid grid-cols-7 gap-1">
          {#each key.chords as chord, i}
            <div class="text-center">
              <div class="text-[10px] text-text-tertiary">{chordNumerals[i]}</div>
              <div class="text-sm font-medium text-text-primary">{chord}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-8">
      <p class="text-sm text-text-tertiary">Click a key to explore</p>
    </div>
  {/if}
</div>
