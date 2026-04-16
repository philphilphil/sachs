export const PITCH_CLASSES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
] as const;

export type PitchClass = (typeof PITCH_CLASSES)[number];

export interface Pitch {
  pitchClass: PitchClass;
  octave: number;
}

export type KeyMode = 'major' | 'minor';
export type NaturalDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type FlatDegree = 'b3' | 'b6' | 'b7';
export type ScaleDegree = NaturalDegree | FlatDegree;

const MAJOR_SEMITONES: Record<NaturalDegree, number> = {
  1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11
};

const MINOR_SEMITONES: Record<ScaleDegree, number> = {
  1: 0, 2: 2, b3: 3, 3: 4, 4: 5, 5: 7, b6: 8, 6: 9, b7: 10, 7: 11
};

export function degreeSemitones(mode: KeyMode, degree: ScaleDegree): number {
  if (mode === 'major') {
    if (typeof degree !== 'number') {
      throw new Error(`Flat degree ${degree} is not valid in major mode`);
    }
    return MAJOR_SEMITONES[degree];
  }
  return MINOR_SEMITONES[degree];
}

export function degreeToPitch(
  tonic: PitchClass,
  mode: KeyMode,
  degree: ScaleDegree,
  tonicOctave: number
): Pitch {
  return addSemitones(
    { pitchClass: tonic, octave: tonicOctave },
    degreeSemitones(mode, degree)
  );
}

export function addSemitones(pitch: Pitch, semitones: number): Pitch {
  const idx = PITCH_CLASSES.indexOf(pitch.pitchClass);
  const total = idx + semitones;
  const pitchClassIndex = ((total % 12) + 12) % 12;
  const octaveOffset = Math.floor(total / 12);
  return { pitchClass: PITCH_CLASSES[pitchClassIndex], octave: pitch.octave + octaveOffset };
}

export function pitchToToneString(pitch: Pitch): string {
  return `${pitch.pitchClass}${pitch.octave}`;
}

export function pitchToMidi(pitch: Pitch): number {
  return (pitch.octave + 1) * 12 + PITCH_CLASSES.indexOf(pitch.pitchClass);
}
