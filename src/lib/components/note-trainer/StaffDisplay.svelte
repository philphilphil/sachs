<script lang="ts">
  import type { KeySignature, StaffNote } from '$lib/data/notes';
  import { theme } from '$lib/theme.svelte';

  interface Props {
    keySignature: KeySignature;
    note: StaffNote | null;
  }

  let { keySignature, note }: Props = $props();

  let container: HTMLDivElement;
  let isMobile = $state(false);

  async function render() {
    if (!container) return;
    container.innerHTML = '';

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import('vexflow');
      const { Factory, StaveNote, Voice, Formatter, Accidental } = mod;

      const w = isMobile ? 300 : 560;
      const h = isMobile ? 200 : 180;
      const staveW = w - 20;
      const formatW = isMobile ? 140 : 360;

      const factory = new Factory({
        renderer: { elementId: container, width: w, height: h }
      });

      const ctx = factory.getContext();
      const color =
        getComputedStyle(container).getPropertyValue('--color-text-primary').trim() || '#000';
      ctx.setFillStyle(color);
      ctx.setStrokeStyle(color);

      const system = factory.System({
        x: 10,
        y: isMobile ? 40 : 20,
        width: staveW,
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

        new Formatter().joinVoices([voice]).format([voice], formatW);
        stave.setContext(factory.getContext()).draw();
        voice.draw(factory.getContext(), stave);
      } else {
        factory.draw();
      }

      const svg = container.querySelector('svg');
      if (svg) {
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';

        // VexFlow bakes colors into attributes per-draw-call, so ctx.setStrokeStyle
        // doesn't reach every element (notably ledger lines). Force everything to
        // the theme's text color so the staff reads cleanly in both themes.
        svg.querySelectorAll<SVGElement>('[stroke]').forEach((el) => {
          const s = el.getAttribute('stroke');
          if (s && s !== 'none' && s !== 'transparent') el.setAttribute('stroke', color);
        });
        svg.querySelectorAll<SVGElement>('[fill]').forEach((el) => {
          const f = el.getAttribute('fill');
          if (f && f !== 'none' && f !== 'transparent') el.setAttribute('fill', color);
        });
      }
    } catch (err) {
      console.error('VexFlow render failed', err);
      container.innerHTML =
        '<p class="text-sm text-text-tertiary text-center">Could not render staff</p>';
    }
  }

  $effect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => {
      isMobile = mq.matches;
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  });

  $effect(() => {
    void keySignature;
    void note;
    void theme.isDark;
    void isMobile;
    render();
  });
</script>

<div class="flex justify-center w-full">
  <div
    bind:this={container}
    class="w-full max-w-[300px] sm:max-w-[560px]"
  ></div>
</div>
