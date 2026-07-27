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

/**
 * Parse a display tonic (e.g. "F♯", "B♭", "C") into its starting letter and
 * sharp-spelled pitch class. The letter is what fixes diatonic spelling — a key
 * named "B♭" must spell its scale off the letter B (B♭ C D E♭ …), never off the
 * enharmonic A♯. Accepts unicode (♯/♭) or ASCII (#/b) accidentals.
 */
function parseTonic(name: string): { letter: Letter; pitchClass: PitchClass } {
  const letter = name[0].toUpperCase() as Letter;
  const accidental = name.slice(1);
  let semitone = LETTER_TO_SEMITONE[letter];
  if (accidental === '♯' || accidental === '#') semitone += 1;
  else if (accidental === '♭' || accidental === 'b') semitone -= 1;
  const pcIdx = ((semitone % 12) + 12) % 12;
  return { letter, pitchClass: PITCH_CLASSES[pcIdx] };
}

function buildScaleData(
  startLetter: Letter,
  tonicPcIdx: number,
  mode: ScaleMode
): { pitchClasses: PitchClass[]; spelling: string[] } {
  const intervals = mode === 'major' ? MAJOR_INTERVALS : NATURAL_MINOR_INTERVALS;
  const startLetterIdx = LETTERS.indexOf(startLetter);

  const pitchClasses: PitchClass[] = [];
  const spelling: string[] = [];
  for (let i = 0; i < 7; i++) {
    const pcIdx = (tonicPcIdx + intervals[i]) % 12;
    pitchClasses.push(PITCH_CLASSES[pcIdx]);
    const letter = LETTERS[(startLetterIdx + i) % 7];
    spelling.push(spellWithLetter(pcIdx, letter));
  }
  return { pitchClasses, spelling };
}

/**
 * Build a scale definition. `tonic` is a display key name (e.g. "C", "F♯",
 * "B♭") — its letter drives the diatonic spelling so both sharp and flat keys
 * are spelled correctly.
 */
export function makeScale(id: string, label: string, tonic: string, mode: ScaleMode): ScaleDef {
  const { letter, pitchClass } = parseTonic(tonic);
  const { pitchClasses, spelling } = buildScaleData(letter, PITCH_CLASSES.indexOf(pitchClass), mode);
  return { id, label, tonic: pitchClass, mode, pitchClasses, noteSpelling: spelling };
}

/**
 * The twelve positions of the circle of fifths, each with its major key and
 * relative (natural) minor. Position 0 (C / A minor) sits at the top; each step
 * clockwise adds a sharp (or removes a flat). Enharmonic positions use the
 * spellings shared with the Circle of Fifths view (F♯ and D♭).
 */
const CIRCLE_OF_FIFTHS: { major: string; minor: string }[] = [
  { major: 'C', minor: 'A' },
  { major: 'G', minor: 'E' },
  { major: 'D', minor: 'B' },
  { major: 'A', minor: 'F♯' },
  { major: 'E', minor: 'C♯' },
  { major: 'B', minor: 'G♯' },
  { major: 'F♯', minor: 'D♯' },
  { major: 'D♭', minor: 'B♭' },
  { major: 'A♭', minor: 'F' },
  { major: 'E♭', minor: 'C' },
  { major: 'B♭', minor: 'G' },
  { major: 'F', minor: 'D' }
];

export interface CircleScale {
  /** Position 0–11 around the circle of fifths (0 = C major / A minor at top). */
  index: number;
  /** Display name of the major key, e.g. "B♭". */
  majorName: string;
  /** Display name of the relative-minor tonic (without the trailing "m"). */
  minorName: string;
  major: ScaleDef;
  minor: ScaleDef;
}

function scaleId(name: string, mode: ScaleMode): string {
  // e.g. "F♯" + major → "f-sharp-major"; "B♭" + minor → "b-flat-minor".
  const slug = name
    .replace(/♯/g, '-sharp')
    .replace(/♭/g, '-flat')
    .toLowerCase();
  return `${slug}-${mode}`;
}

/** All 24 major/minor scales, laid out by circle-of-fifths position. */
export const CIRCLE_SCALES: CircleScale[] = CIRCLE_OF_FIFTHS.map((pos, index) => ({
  index,
  majorName: pos.major,
  minorName: pos.minor,
  major: makeScale(scaleId(pos.major, 'major'), `${pos.major} Major`, pos.major, 'major'),
  minor: makeScale(scaleId(pos.minor, 'minor'), `${pos.minor} Minor`, pos.minor, 'minor')
}));

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
