import { describe, it, expect } from 'vitest';
import { buildCadenceChords, CADENCE_CHORD_MS } from './cadence';

describe('buildCadenceChords', () => {
  it('C major: I-IV-V-I = C, F, G, C', () => {
    const chords = buildCadenceChords('C', 'major');
    expect(chords).toHaveLength(4);
    expect(chords[0].root.pitchClass).toBe('C');
    expect(chords[1].root.pitchClass).toBe('F');
    expect(chords[2].root.pitchClass).toBe('G');
    expect(chords[3].root.pitchClass).toBe('C');
  });

  it('C major I chord = C-E-G', () => {
    const [i] = buildCadenceChords('C', 'major');
    expect(i.notes.map((n) => n.pitchClass)).toEqual(['C', 'E', 'G']);
  });

  it('A minor: i-iv-v-i has natural-minor qualities (A-C-E, D-F-A, E-G-B)', () => {
    const chords = buildCadenceChords('A', 'minor');
    expect(chords[0].notes.map((n) => n.pitchClass)).toEqual(['A', 'C', 'E']);
    expect(chords[1].notes.map((n) => n.pitchClass)).toEqual(['D', 'F', 'A']);
    expect(chords[2].notes.map((n) => n.pitchClass)).toEqual(['E', 'G', 'B']);
  });

  it('chord duration is a positive number', () => {
    expect(CADENCE_CHORD_MS).toBeGreaterThan(0);
  });
});
