export interface KeyData {
  name: string;
  minor: string;
  enharmonic: string | null;
  sharps: number;
  flats: number;
  index: number;
  chords: string[];
  signatureNotes: string[];
}

export const KEYS: KeyData[] = [
  {
    name: 'C',
    minor: 'Am',
    enharmonic: null,
    sharps: 0,
    flats: 0,
    index: 0,
    chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°'],
    signatureNotes: []
  },
  {
    name: 'G',
    minor: 'Em',
    enharmonic: null,
    sharps: 1,
    flats: 0,
    index: 1,
    chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F♯°'],
    signatureNotes: ['F♯']
  },
  {
    name: 'D',
    minor: 'Bm',
    enharmonic: null,
    sharps: 2,
    flats: 0,
    index: 2,
    chords: ['D', 'Em', 'F♯m', 'G', 'A', 'Bm', 'C♯°'],
    signatureNotes: ['F♯', 'C♯']
  },
  {
    name: 'A',
    minor: 'F♯m',
    enharmonic: null,
    sharps: 3,
    flats: 0,
    index: 3,
    chords: ['A', 'Bm', 'C♯m', 'D', 'E', 'F♯m', 'G♯°'],
    signatureNotes: ['F♯', 'C♯', 'G♯']
  },
  {
    name: 'E',
    minor: 'C♯m',
    enharmonic: null,
    sharps: 4,
    flats: 0,
    index: 4,
    chords: ['E', 'F♯m', 'G♯m', 'A', 'B', 'C♯m', 'D♯°'],
    signatureNotes: ['F♯', 'C♯', 'G♯', 'D♯']
  },
  {
    name: 'B',
    minor: 'G♯m',
    enharmonic: 'C♭',
    sharps: 5,
    flats: 0,
    index: 5,
    chords: ['B', 'C♯m', 'D♯m', 'E', 'F♯', 'G♯m', 'A♯°'],
    signatureNotes: ['F♯', 'C♯', 'G♯', 'D♯', 'A♯']
  },
  {
    name: 'F♯',
    minor: 'D♯m',
    enharmonic: 'G♭',
    sharps: 6,
    flats: 0,
    index: 6,
    chords: ['F♯', 'G♯m', 'A♯m', 'B', 'C♯', 'D♯m', 'E♯°'],
    signatureNotes: ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯']
  },
  {
    name: 'D♭',
    minor: 'B♭m',
    enharmonic: 'C♯',
    sharps: 0,
    flats: 5,
    index: 7,
    chords: ['D♭', 'E♭m', 'Fm', 'G♭', 'A♭', 'B♭m', 'C°'],
    signatureNotes: ['B♭', 'E♭', 'A♭', 'D♭', 'G♭']
  },
  {
    name: 'A♭',
    minor: 'Fm',
    enharmonic: null,
    sharps: 0,
    flats: 4,
    index: 8,
    chords: ['A♭', 'B♭m', 'Cm', 'D♭', 'E♭', 'Fm', 'G°'],
    signatureNotes: ['B♭', 'E♭', 'A♭', 'D♭']
  },
  {
    name: 'E♭',
    minor: 'Cm',
    enharmonic: null,
    sharps: 0,
    flats: 3,
    index: 9,
    chords: ['E♭', 'Fm', 'Gm', 'A♭', 'B♭', 'Cm', 'D°'],
    signatureNotes: ['B♭', 'E♭', 'A♭']
  },
  {
    name: 'B♭',
    minor: 'Gm',
    enharmonic: null,
    sharps: 0,
    flats: 2,
    index: 10,
    chords: ['B♭', 'Cm', 'Dm', 'E♭', 'F', 'Gm', 'A°'],
    signatureNotes: ['B♭', 'E♭']
  },
  {
    name: 'F',
    minor: 'Dm',
    enharmonic: null,
    sharps: 0,
    flats: 1,
    index: 11,
    chords: ['F', 'Gm', 'Am', 'B♭', 'C', 'Dm', 'E°'],
    signatureNotes: ['B♭']
  }
];
