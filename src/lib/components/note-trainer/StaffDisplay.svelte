<script lang="ts">
  import type { KeySignature, StaffNote } from '$lib/data/notes';

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
        renderer: { elementId: container, width: 480, height: 160 }
      });

      const system = factory.System({
        x: 10,
        y: 10,
        width: 460,
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
    } catch (err) {
      console.error('VexFlow render failed', err);
      container.innerHTML =
        '<p class="text-sm text-text-tertiary text-center">Could not render staff</p>';
    }
  }

  $effect(() => {
    // Re-run whenever keySignature or note changes.
    void keySignature;
    void note;
    render();
  });
</script>

<div class="flex justify-center">
  <div bind:this={container} class="inline-block"></div>
</div>
