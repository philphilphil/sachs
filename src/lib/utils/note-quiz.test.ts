import { describe, it, expect } from 'vitest';
import { soundingPitch } from './note-quiz';
import { KEY_SIGNATURES } from '$lib/data/notes';

function keyOf(tonic: string) {
  return KEY_SIGNATURES.find((k) => k.tonic === tonic)!;
}

describe('soundingPitch', () => {
  it('returns the bare letter in C major', () => {
    expect(soundingPitch({ letter: 'F', octave: 4 }, keyOf('C'))).toBe('F');
    expect(soundingPitch({ letter: 'B', octave: 4 }, keyOf('C'))).toBe('B');
  });

  it('applies sharp in G major for F only', () => {
    expect(soundingPitch({ letter: 'F', octave: 4 }, keyOf('G'))).toBe('F♯');
    expect(soundingPitch({ letter: 'G', octave: 4 }, keyOf('G'))).toBe('G');
    expect(soundingPitch({ letter: 'C', octave: 4 }, keyOf('G'))).toBe('C');
  });

  it('applies sharps for F and C in D major', () => {
    expect(soundingPitch({ letter: 'F', octave: 4 }, keyOf('D'))).toBe('F♯');
    expect(soundingPitch({ letter: 'C', octave: 4 }, keyOf('D'))).toBe('C♯');
    expect(soundingPitch({ letter: 'D', octave: 4 }, keyOf('D'))).toBe('D');
  });

  it('applies flat for B only in F major', () => {
    expect(soundingPitch({ letter: 'B', octave: 4 }, keyOf('F'))).toBe('B♭');
    expect(soundingPitch({ letter: 'E', octave: 4 }, keyOf('F'))).toBe('E');
  });

  it('applies all three flats in E♭ major', () => {
    expect(soundingPitch({ letter: 'B', octave: 4 }, keyOf('E♭'))).toBe('B♭');
    expect(soundingPitch({ letter: 'E', octave: 4 }, keyOf('E♭'))).toBe('E♭');
    expect(soundingPitch({ letter: 'A', octave: 4 }, keyOf('E♭'))).toBe('A♭');
    expect(soundingPitch({ letter: 'D', octave: 4 }, keyOf('E♭'))).toBe('D');
  });

  it('applies 6 sharps in F♯ major (including E♯)', () => {
    expect(soundingPitch({ letter: 'E', octave: 4 }, keyOf('F♯'))).toBe('E♯');
    expect(soundingPitch({ letter: 'F', octave: 4 }, keyOf('F♯'))).toBe('F♯');
    expect(soundingPitch({ letter: 'B', octave: 4 }, keyOf('F♯'))).toBe('B');
  });
});

import { generateNoteQuestion, type NoteQuestion } from './note-quiz';
import { PRESETS, buildPianoPreset, type Preset } from '$lib/data/notes';

const violin1st = PRESETS.find((p) => p.id === 'violin-1st')!;
const staffBasics = PRESETS.find((p) => p.id === 'staff-basics')!;

describe('generateNoteQuestion', () => {
  it('returns a NoteQuestion with note, keySignature, correctAnswer, mode', () => {
    const q = generateNoteQuestion(staffBasics);
    expect(q.mode).toBe('note');
    expect(q).toHaveProperty('keySignature');
    expect(q).toHaveProperty('note');
    expect(q).toHaveProperty('correctAnswer');
  });

  it('only uses notes from the preset list', () => {
    const allowed = new Set(violin1st.notes!.map((n) => `${n.letter}${n.octave}`));
    for (let i = 0; i < 50; i++) {
      const q = generateNoteQuestion(violin1st);
      expect(allowed.has(`${q.note.letter}${q.note.octave}`)).toBe(true);
    }
  });

  it('only uses keys from the preset list', () => {
    const allowedTonics = new Set(violin1st.keys.map((k) => k.tonic));
    for (let i = 0; i < 50; i++) {
      const q = generateNoteQuestion(violin1st);
      expect(allowedTonics.has(q.keySignature.tonic)).toBe(true);
    }
  });

  it('correctAnswer matches soundingPitch', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateNoteQuestion(violin1st);
      expect(q.correctAnswer).toBe(soundingPitch(q.note, q.keySignature));
    }
  });

  it('does not reuse the same key signature twice in a row', () => {
    const preset = PRESETS.find((p) => p.id === 'violin-3rd')!;
    let prev: NoteQuestion | undefined;
    for (let i = 0; i < 30; i++) {
      const q = generateNoteQuestion(preset, prev?.keySignature);
      if (prev) expect(q.keySignature.tonic).not.toBe(prev.keySignature.tonic);
      prev = q;
    }
  });

  it('piano preset with custom range respects octave bounds', () => {
    const piano = buildPianoPreset({ min: 4, max: 4 });
    for (let i = 0; i < 30; i++) {
      const q = generateNoteQuestion(piano);
      expect(q.note.octave).toBe(4);
    }
  });
});
