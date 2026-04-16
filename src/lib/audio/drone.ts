import * as Tone from 'tone';
import { pitchToToneString, type Pitch } from '../utils/ear-training/music-theory';

let synth: Tone.PolySynth | null = null;
let filter: Tone.Filter | null = null;
let currentNotes: string[] = [];

function getSynth(): Tone.PolySynth {
  if (synth) return synth;
  synth = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 0.5,
    modulationIndex: 2,
    oscillator: { type: 'sine' },
    modulation: { type: 'sine' },
    envelope: {
      attack: 0.8,
      decay: 0.3,
      sustain: 1,
      release: 1.6
    }
  });
  filter = new Tone.Filter({ type: 'lowpass', frequency: 1400, Q: 0.6 });
  synth.chain(filter, Tone.getDestination());
  synth.volume.value = -14;
  return synth;
}

export function startDrone(pitch: Pitch): void {
  stopDrone();
  const s = getSynth();
  const low: Pitch = { pitchClass: pitch.pitchClass, octave: pitch.octave - 1 };
  const notes = [pitchToToneString(low), pitchToToneString(pitch)];
  s.triggerAttack(notes);
  currentNotes = notes;
}

export function stopDrone(): void {
  if (!synth || currentNotes.length === 0) return;
  synth.triggerRelease(currentNotes);
  currentNotes = [];
}

export function isDronePlaying(): boolean {
  return currentNotes.length > 0;
}
