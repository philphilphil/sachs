<script lang="ts">
  import type { KeySignature, StaffNote } from '$lib/data/notes';
  import { theme } from '$lib/theme.svelte';

  interface Props {
    keySignature: KeySignature;
    note: StaffNote | null;
  }

  let { keySignature, note }: Props = $props();

  let container: HTMLDivElement;

  async function render() {
    if (!container) return;
    container.innerHTML = '';

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import('vexflow');
      const { Factory, StaveNote, Voice, Formatter, Accidental } = mod;

      const factory = new Factory({
        renderer: { elementId: container, width: 560, height: 180 }
      });

      const ctx = factory.getContext();
      const color =
        getComputedStyle(container).getPropertyValue('--color-text-primary').trim() || '#000';
      ctx.setFillStyle(color);
      ctx.setStrokeStyle(color);

      const system = factory.System({
        x: 10,
        y: 20,
        width: 540,
        spaceBetweenStaves: 10
      });

      const stave = system
        .addStave({ voices: [] })
        .addClef('treble')
        .addKeySignature(keySignature.vexflowKey);

      if (note) {
        const staveNote = new StaveNote({
          clef: 'treble',
          keys: [`${note.letter.toLowerCase()}/${note.octave}`],
          duration: 'w'
        });

        // VexFlow handles key-signature accidentals automatically when the
        // stave's key is set and Accidental.applyAccidentals is called on
        // a voice-by-voice basis.
        const voice = new Voice({ numBeats: 4, beatValue: 4 })
          .setStrict(false)
          .addTickables([staveNote]);

        Accidental.applyAccidentals([voice], keySignature.vexflowKey);

        new Formatter().joinVoices([voice]).format([voice], 360);
        stave.setContext(factory.getContext()).draw();
        voice.draw(factory.getContext(), stave);
      } else {
        factory.draw();
      }

      const svg = container.querySelector('svg');
      if (svg) {
        svg.setAttribute('viewBox', '0 0 560 180');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.maxWidth = '560px';
        svg.style.display = 'block';
      }
    } catch (err) {
      console.error('VexFlow render failed', err);
      container.innerHTML =
        '<p class="text-sm text-text-tertiary text-center">Could not render staff</p>';
    }
  }

  $effect(() => {
    void keySignature;
    void note;
    void theme.isDark;
    render();
  });
</script>

<div class="flex justify-center min-h-[180px] w-full">
  <div bind:this={container} class="min-h-[180px] w-full max-w-[560px]"></div>
</div>
