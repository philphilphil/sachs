import {
  PITCH_CLASSES,
  type PitchClass,
  type Pitch,
  pitchToMidi
} from '$lib/utils/ear-training/music-theory';

export type ScaleMode = 'major' | 'minor';

export interface ScaleDef {
  id: string;
  /** Display name shown in the picker, e.g. "A Major". */
  label: string;
  tonic: PitchClass;
  mode: ScaleMode;
  /** Diatonic spelling of each scale degree (e.g. "F♯"). 7 entries, starting on the tonic. */
  noteSpelling: string[];
  /** Pitch class of each scale degree, parallel to `noteSpelling`. */
  pitchClasses: PitchClass[];
}

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const NATURAL_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

/** Letter names of the 7 natural notes. */
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
type Letter = (typeof LETTERS)[number];

const LETTER_TO_SEMITONE: Record<Letter, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
};

function pcIndex(pc: PitchClass): number {
  return PITCH_CLASSES.indexOf(pc);
}

/** Spell a pitch class using the supplied letter, adding sharps/flats as needed. */
function spellWithLetter(pcIdx: number, letter: Letter): string {
  const naturalSemitone = LETTER_TO_SEMITONE[letter];
  const diff = ((pcIdx - naturalSemitone + 18) % 12) - 6; // -6..+5
  if (diff === 0) return letter;
  if (diff === 1) return `${letter}♯`;
  if (diff === -1) return `${letter}♭`;
  if (diff === 2) return `${letter}𝄪`;
  if (diff === -2) return `${letter}𝄫`;
  return letter;
}

/** Pick a sensible starting letter for a tonic. */
function tonicLetter(tonic: PitchClass): Letter {
  // PitchClass uses sharp spelling. Map to the most common letter for that key.
  // (For MVP we only use C and A; this also handles other naturals correctly.)
  const naturals: Record<string, Letter> = {
    C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', A: 'A', B: 'B'
  };
  if (naturals[tonic]) return naturals[tonic];
  // Sharp tonics: prefer the sharp letter (e.g. F# → F).
  const map: Record<string, Letter> = {
    'C#': 'C', 'D#': 'D', 'F#': 'F', 'G#': 'G', 'A#': 'A'
  };
  return map[tonic] ?? 'C';
}

function buildScaleData(
  tonic: PitchClass,
  mode: ScaleMode
): { pitchClasses: PitchClass[]; spelling: string[] } {
  const intervals = mode === 'major' ? MAJOR_INTERVALS : NATURAL_MINOR_INTERVALS;
  const start = pcIndex(tonic);
  const startLetter = tonicLetter(tonic);
  const startLetterIdx = LETTERS.indexOf(startLetter);

  const pitchClasses: PitchClass[] = [];
  const spelling: string[] = [];
  for (let i = 0; i < 7; i++) {
    const pcIdx = (start + intervals[i]) % 12;
    pitchClasses.push(PITCH_CLASSES[pcIdx]);
    const letter = LETTERS[(startLetterIdx + i) % 7];
    spelling.push(spellWithLetter(pcIdx, letter));
  }
  return { pitchClasses, spelling };
}

export function makeScale(id: string, label: string, tonic: PitchClass, mode: ScaleMode): ScaleDef {
  const { pitchClasses, spelling } = buildScaleData(tonic, mode);
  return { id, label, tonic, mode, pitchClasses, noteSpelling: spelling };
}

/** MVP scales. */
export const SCALES: ScaleDef[] = [
  makeScale('C-major', 'C Major (C-Dur)', 'C', 'major'),
  makeScale('G-major', 'G Major (G-Dur)', 'G', 'major'),
  makeScale('D-major', 'D Major (D-Dur)', 'D', 'major'),
  makeScale('A-major', 'A Major (A-Dur)', 'A', 'major')
];

/** Open strings of the violin in first position (lowest to highest). */
export const VIOLIN_STRINGS: { name: string; pitch: Pitch }[] = [
  { name: 'G', pitch: { pitchClass: 'G', octave: 3 } },
  { name: 'D', pitch: { pitchClass: 'D', octave: 4 } },
  { name: 'A', pitch: { pitchClass: 'A', octave: 4 } },
  { name: 'E', pitch: { pitchClass: 'E', octave: 5 } }
];

export interface FingerStop {
  /** 0 = open string, 1–4 = fingers. */
  finger: 0 | 1 | 2 | 3 | 4;
  pitch: Pitch;
  spelling: string;
  /** Semitones above the open string (0 for open). */
  semitonesFromOpen: number;
}

/**
 * Convert a MIDI number back to a Pitch using the sharp-spelled `PITCH_CLASSES`.
 */
function midiToPitch(midi: number): Pitch {
  const pcIdx = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { pitchClass: PITCH_CLASSES[pcIdx], octave };
}

/**
 * First-position fingering for a single violin string and a given scale.
 *
 * Walks the scale ascending starting from the open string pitch (or the next
 * scale note above it if the open string is not in the scale). Returns up to
 * 5 stops (open + 4 fingers), all within 6 semitones of the open string.
 */
export function fingeringForString(scale: ScaleDef, openPitch: Pitch): FingerStop[] {
  const openMidi = pitchToMidi(openPitch);
  const openInScale = scale.pitchClasses.includes(openPitch.pitchClass);

  // When the open string is in the scale, fingers 0–4 walk 5 ascending scale notes.
  // Otherwise, skip the half-step leading tone above the open and start fingers at 1.
  const minMidi = openInScale ? openMidi : openMidi + 2;
  const maxMidi = openMidi + 7;

  const tonicMidi = pitchToMidi({ pitchClass: scale.tonic, octave: openPitch.octave - 1 });
  const intervals = scale.mode === 'major' ? MAJOR_INTERVALS : NATURAL_MINOR_INTERVALS;

  type Walk = { midi: number; spelling: string };
  const walk: Walk[] = [];
  for (let oct = 0; oct < 4; oct++) {
    for (let i = 0; i < 7; i++) {
      walk.push({
        midi: tonicMidi + oct * 12 + intervals[i],
        spelling: scale.noteSpelling[i]
      });
    }
  }

  const inRange = walk
    .filter((n) => n.midi >= minMidi && n.midi <= maxMidi)
    .sort((a, b) => a.midi - b.midi);

  const maxStops = openInScale ? 5 : 4;
  const picked = inRange.slice(0, maxStops);
  const fingerStart = openInScale ? 0 : 1;

  return picked.map((note, idx) => {
    const finger = (fingerStart + idx) as 0 | 1 | 2 | 3 | 4;
    return {
      finger,
      pitch: midiToPitch(note.midi),
      spelling: note.spelling,
      semitonesFromOpen: note.midi - openMidi
    };
  });
}

export interface ScaleFingering {
  scale: ScaleDef;
  strings: { stringName: string; openPitch: Pitch; stops: FingerStop[] }[];
}

export function computeScaleFingering(scale: ScaleDef): ScaleFingering {
  return {
    scale,
    strings: VIOLIN_STRINGS.map((s) => ({
      stringName: s.name,
      openPitch: s.pitch,
      stops: fingeringForString(scale, s.pitch)
    }))
  };
}
