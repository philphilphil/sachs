import * as Tone from 'tone';
import {
  addSemitones,
  degreeToPitch,
  pitchToToneString,
  type KeyMode,
  type Pitch,
  type PitchClass
} from '../utils/ear-training/music-theory';
import { getPianoSampler } from './sampler';

export const CADENCE_CHORD_MS = 450;
export const CADENCE_GAP_MS = 300;
const CHORD_OCTAVE = 3;

export interface CadenceChord {
  root: Pitch;
  notes: Pitch[]; // 3-note triad
}

function triadOffsets(mode: KeyMode): [number, number, number] {
  // Major mode: all three chords are major (0, 4, 7).
  // Natural minor mode: i, iv, v all minor (0, 3, 7).
  return [0, mode === 'minor' ? 3 : 4, 7];
}

function rootFor(tonic: PitchClass, mode: KeyMode, degree: 1 | 4 | 5): Pitch {
  return degreeToPitch(tonic, mode, degree, CHORD_OCTAVE);
}

export function buildCadenceChords(tonic: PitchClass, mode: KeyMode): CadenceChord[] {
  return ([1, 4, 5, 1] as const).map((deg) => {
    const root = rootFor(tonic, mode, deg);
    const [o0, o1, o2] = triadOffsets(mode);
    return {
      root,
      notes: [o0, o1, o2].map((o) => addSemitones(root, o))
    };
  });
}

export async function playCadence(tonic: PitchClass, mode: KeyMode): Promise<void> {
  const sampler = await getPianoSampler();
  const chords = buildCadenceChords(tonic, mode);
  const durSec = CADENCE_CHORD_MS / 1000;
  const now = Tone.now();

  chords.forEach((chord, i) => {
    const notes = chord.notes.map(pitchToToneString);
    sampler.triggerAttackRelease(notes, durSec, now + i * durSec);
  });

  const totalMs = chords.length * CADENCE_CHORD_MS + CADENCE_GAP_MS;
  await new Promise((r) => setTimeout(r, totalMs));
}
