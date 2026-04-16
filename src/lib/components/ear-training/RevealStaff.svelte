<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Pitch } from '$lib/utils/ear-training/music-theory';

  interface Props {
    pitches: Pitch[];
    labels?: string[];
    showTonic?: Pitch | null;
  }

  let { pitches, labels, showTonic }: Props = $props();
  let container: HTMLDivElement;

  function toVexKey(p: Pitch): string {
    return `${p.pitchClass.toLowerCase().replace('#', '#')}/${p.octave}`;
  }

  function hasAccidental(pc: string): boolean {
    return pc.includes('#');
  }

  async function render() {
    if (!container) return;
    container.innerHTML = '';

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import('vexflow');
      const { Factory, StaveNote, Voice, Formatter, Accidental } = mod;

      const sources: Pitch[] = [];
      if (showTonic) sources.push(showTonic);
      sources.push(...pitches);

      if (sources.length === 0) return;

      const factory = new Factory({
        renderer: { elementId: container, width: 360, height: 140 }
      });

      const system = factory.System({
        x: 10,
        y: 10,
        width: 340,
        spaceBetweenStaves: 10
      });

      const staveNotes = sources.map((p) => {
        const n = new StaveNote({
          clef: 'treble',
          keys: [toVexKey(p)],
          duration: 'q'
        });
        if (hasAccidental(p.pitchClass)) n.addModifier(new Accidental('#'), 0);
        return n;
      });

      const voice = new Voice({ numBeats: sources.length, beatValue: 4 })
        .setStrict(false)
        .addTickables(staveNotes);

      // No key signature context — sharps-only chromatic spelling is intentional here.
      new Formatter().joinVoices([voice]).format([voice], 280);

      const stave = system.addStave({ voices: [] }).addClef('treble');
      stave.setContext(factory.getContext()).draw();
      voice.draw(factory.getContext(), stave);
    } catch (err) {
      console.error('VexFlow render failed', err);
      if (container) {
        container.innerHTML =
          '<p class="text-sm text-text-tertiary text-center">Could not render staff</p>';
      }
    }
  }

  $effect(() => {
    // Re-run whenever any input changes.
    void pitches;
    void labels;
    void showTonic;
    render();
  });

  onDestroy(() => {
    if (container) container.innerHTML = '';
  });
</script>

<div class="flex flex-col items-center gap-2">
  <div bind:this={container} class="inline-block"></div>
  {#if labels && labels.length > 0}
    <div class="flex gap-4 text-sm text-text-secondary tabular-nums">
      {#each labels as lbl}
        <span>{lbl}</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  div :global(svg) {
    display: block;
  }
</style>
