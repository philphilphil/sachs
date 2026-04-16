import * as Tone from 'tone';
import { base } from '$app/paths';

let sampler: Tone.Sampler | null = null;
let loadPromise: Promise<Tone.Sampler> | null = null;

export async function getPianoSampler(): Promise<Tone.Sampler> {
  if (sampler) return sampler;
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<Tone.Sampler>((resolve, reject) => {
    const instance = new Tone.Sampler({
      urls: {
        C3: 'C3.mp3',
        'F#3': 'Fs3.mp3',
        C4: 'C4.mp3',
        'F#4': 'Fs4.mp3',
        C5: 'C5.mp3',
        'F#5': 'Fs5.mp3',
        C6: 'C6.mp3'
      },
      baseUrl: `${base}/audio/piano/`,
      release: 1,
      onload: () => {
        sampler = instance;
        resolve(instance);
      },
      onerror: (err) => reject(err)
    }).toDestination();
  });

  return loadPromise;
}

export async function unlockAudio(): Promise<void> {
  await Tone.start();
}
