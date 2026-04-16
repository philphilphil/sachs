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
