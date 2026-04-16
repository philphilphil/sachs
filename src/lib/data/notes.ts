export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface StaffNote {
  letter: Letter;
  octave: number;
}

export interface KeySignature {
  tonic: string;
  type: 'sharp' | 'flat' | 'natural';
  accidentals: string[];
  vexflowKey: string;
}

export type PresetId = 'staff-basics' | 'violin-1st' | 'violin-3rd' | 'piano';

export interface Preset {
  id: PresetId;
  label: string;
  keys: KeySignature[];
  notes?: StaffNote[];
  octaveRange?: { min: number; max: number };
}

const SHARP_ORDER = ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'] as const;
const FLAT_ORDER = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭'] as const;

function makeSharpKey(tonic: string, count: number, vexflowKey: string): KeySignature {
  return {
    tonic,
    type: 'sharp',
    accidentals: SHARP_ORDER.slice(0, count),
    vexflowKey
  };
}

function makeFlatKey(tonic: string, count: number, vexflowKey: string): KeySignature {
  return {
    tonic,
    type: 'flat',
    accidentals: FLAT_ORDER.slice(0, count),
    vexflowKey
  };
}

export const KEY_SIGNATURES: KeySignature[] = [
  { tonic: 'C', type: 'natural', accidentals: [], vexflowKey: 'C' },
  makeSharpKey('G', 1, 'G'),
  makeSharpKey('D', 2, 'D'),
  makeSharpKey('A', 3, 'A'),
  makeSharpKey('E', 4, 'E'),
  makeSharpKey('B', 5, 'B'),
  makeSharpKey('F♯', 6, 'F#'),
  makeFlatKey('D♭', 5, 'Db'),
  makeFlatKey('A♭', 4, 'Ab'),
  makeFlatKey('E♭', 3, 'Eb'),
  makeFlatKey('B♭', 2, 'Bb'),
  makeFlatKey('F', 1, 'F')
];

function keyByTonic(tonic: string): KeySignature {
  const k = KEY_SIGNATURES.find((k) => k.tonic === tonic);
  if (!k) throw new Error(`Unknown tonic: ${tonic}`);
  return k;
}

const LETTERS: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function lettersFrom(start: StaffNote, end: StaffNote): StaffNote[] {
  const result: StaffNote[] = [];
  let octave = start.octave;
  let idx = LETTERS.indexOf(start.letter);

  while (octave < end.octave || (octave === end.octave && idx <= LETTERS.indexOf(end.letter))) {
    result.push({ letter: LETTERS[idx], octave });
    idx++;
    if (idx === LETTERS.length) {
      idx = 0;
      octave++;
    }
  }
  return result;
}

const STAFF_BASICS_NOTES = lettersFrom({ letter: 'E', octave: 4 }, { letter: 'F', octave: 5 });
const VIOLIN_1ST_NOTES = lettersFrom({ letter: 'G', octave: 3 }, { letter: 'B', octave: 5 });
const VIOLIN_3RD_NOTES = lettersFrom({ letter: 'G', octave: 3 }, { letter: 'E', octave: 6 });

export function buildPianoPreset(octaveRange: { min: number; max: number }): Preset {
  const notes = lettersFrom(
    { letter: 'C', octave: octaveRange.min },
    { letter: 'B', octave: octaveRange.max }
  );
  return {
    id: 'piano',
    label: 'Piano',
    keys: KEY_SIGNATURES,
    notes,
    octaveRange
  };
}

export const PRESETS: Preset[] = [
  {
    id: 'staff-basics',
    label: 'Staff basics',
    keys: [keyByTonic('C')],
    notes: STAFF_BASICS_NOTES
  },
  {
    id: 'violin-1st',
    label: 'Violin 1st position',
    keys: ['C', 'G', 'D', 'A'].map(keyByTonic),
    notes: VIOLIN_1ST_NOTES
  },
  {
    id: 'violin-3rd',
    label: 'Violin 3rd position',
    keys: ['C', 'G', 'D', 'A', 'F', 'B♭', 'E♭'].map(keyByTonic),
    notes: VIOLIN_3RD_NOTES
  },
  buildPianoPreset({ min: 3, max: 5 })
];
