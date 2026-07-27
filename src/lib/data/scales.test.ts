import { describe, it, expect } from 'vitest';
import {
  computeScaleFingering,
  makeScale,
  fingeringForString,
  CIRCLE_SCALES
} from './scales';

describe('makeScale', () => {
  it('builds C major as 7 natural notes', () => {
    const s = makeScale('C', 'C', 'C', 'major');
    expect(s.noteSpelling).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(s.pitchClasses).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  it('builds A major with 3 sharps spelled correctly', () => {
    const s = makeScale('A', 'A', 'A', 'major');
    expect(s.noteSpelling).toEqual(['A', 'B', 'C♯', 'D', 'E', 'F♯', 'G♯']);
    expect(s.pitchClasses).toEqual(['A', 'B', 'C#', 'D', 'E', 'F#', 'G#']);
  });

  it('builds G major with one sharp', () => {
    const s = makeScale('G', 'G', 'G', 'major');
    expect(s.noteSpelling).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F♯']);
  });

  it('builds D major with two sharps', () => {
    const s = makeScale('D', 'D', 'D', 'major');
    expect(s.noteSpelling).toEqual(['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯']);
  });

  it('spells flat major keys with flats, not enharmonic sharps', () => {
    expect(makeScale('B♭', 'B♭', 'B♭', 'major').noteSpelling).toEqual([
      'B♭', 'C', 'D', 'E♭', 'F', 'G', 'A'
    ]);
    expect(makeScale('E♭', 'E♭', 'E♭', 'major').noteSpelling).toEqual([
      'E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D'
    ]);
    expect(makeScale('D♭', 'D♭', 'D♭', 'major').noteSpelling).toEqual([
      'D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭', 'C'
    ]);
    expect(makeScale('F', 'F', 'F', 'major').noteSpelling).toEqual([
      'F', 'G', 'A', 'B♭', 'C', 'D', 'E'
    ]);
  });

  it('spells F♯ major with six sharps including E♯', () => {
    expect(makeScale('F♯', 'F♯', 'F♯', 'major').noteSpelling).toEqual([
      'F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯'
    ]);
  });

  it('accepts ASCII accidentals too', () => {
    expect(makeScale('Bb', 'Bb', 'Bb', 'major').noteSpelling).toEqual([
      'B♭', 'C', 'D', 'E♭', 'F', 'G', 'A'
    ]);
  });

  it('builds natural minor keys with correct spelling', () => {
    expect(makeScale('A', 'A', 'A', 'minor').noteSpelling).toEqual([
      'A', 'B', 'C', 'D', 'E', 'F', 'G'
    ]);
    expect(makeScale('B♭', 'B♭', 'B♭', 'minor').noteSpelling).toEqual([
      'B♭', 'C', 'D♭', 'E♭', 'F', 'G♭', 'A♭'
    ]);
    expect(makeScale('D♯', 'D♯', 'D♯', 'minor').noteSpelling).toEqual([
      'D♯', 'E♯', 'F♯', 'G♯', 'A♯', 'B', 'C♯'
    ]);
  });
});

describe('CIRCLE_SCALES', () => {
  it('has all 12 circle-of-fifths positions', () => {
    expect(CIRCLE_SCALES).toHaveLength(12);
    expect(CIRCLE_SCALES.map((c) => c.majorName)).toEqual([
      'C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F'
    ]);
  });

  it('pairs each major with its relative minor', () => {
    expect(CIRCLE_SCALES.map((c) => c.minorName)).toEqual([
      'A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'D♯', 'B♭', 'F', 'C', 'G', 'D'
    ]);
  });

  it('gives every scale a unique id', () => {
    const ids = CIRCLE_SCALES.flatMap((c) => [c.major.id, c.minor.id]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('fingeringForString — G major', () => {
  const gMaj = makeScale('G', 'G', 'G', 'major');

  it('G string (open in scale): 0G, 1A, 2B, 3C, 4D', () => {
    const stops = fingeringForString(gMaj, { pitchClass: 'G', octave: 3 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'G'], [1, 'A'], [2, 'B'], [3, 'C'], [4, 'D']
    ]);
  });

  it('E string (open in scale): 0E, 1F♯, 2G, 3A, 4B', () => {
    const stops = fingeringForString(gMaj, { pitchClass: 'E', octave: 5 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'E'], [1, 'F♯'], [2, 'G'], [3, 'A'], [4, 'B']
    ]);
  });
});

describe('fingeringForString — D major', () => {
  const dMaj = makeScale('D', 'D', 'D', 'major');

  it('G string (open in scale): 0G, 1A, 2B, 3C♯, 4D', () => {
    const stops = fingeringForString(dMaj, { pitchClass: 'G', octave: 3 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'G'], [1, 'A'], [2, 'B'], [3, 'C♯'], [4, 'D']
    ]);
  });

  it('D string (open in scale): 0D, 1E, 2F♯, 3G, 4A', () => {
    const stops = fingeringForString(dMaj, { pitchClass: 'D', octave: 4 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'D'], [1, 'E'], [2, 'F♯'], [3, 'G'], [4, 'A']
    ]);
  });

  it('A string (open in scale): 0A, 1B, 2C♯, 3D, 4E', () => {
    const stops = fingeringForString(dMaj, { pitchClass: 'A', octave: 4 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'A'], [1, 'B'], [2, 'C♯'], [3, 'D'], [4, 'E']
    ]);
  });
});

describe('fingeringForString — C major', () => {
  const cMaj = makeScale('C', 'C', 'C', 'major');

  it('G string: open, A, B, C, D as 0–4', () => {
    const stops = fingeringForString(cMaj, { pitchClass: 'G', octave: 3 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'G'],
      [1, 'A'],
      [2, 'B'],
      [3, 'C'],
      [4, 'D']
    ]);
    expect(stops[3].semitonesFromOpen).toBe(5);
  });

  it('D string: open, E, F, G, A as 0–4', () => {
    const stops = fingeringForString(cMaj, { pitchClass: 'D', octave: 4 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'D'],
      [1, 'E'],
      [2, 'F'],
      [3, 'G'],
      [4, 'A']
    ]);
    expect(stops[2].semitonesFromOpen).toBe(3); // low 2nd (E→F = half step)
  });

  it('A string: open, B, C, D, E as 0–4', () => {
    const stops = fingeringForString(cMaj, { pitchClass: 'A', octave: 4 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'A'],
      [1, 'B'],
      [2, 'C'],
      [3, 'D'],
      [4, 'E']
    ]);
  });
});

describe('fingeringForString — A major', () => {
  const aMaj = makeScale('A', 'A', 'A', 'major');

  it('A string (open is in scale): open, B, C♯, D, E', () => {
    const stops = fingeringForString(aMaj, { pitchClass: 'A', octave: 4 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'A'],
      [1, 'B'],
      [2, 'C♯'],
      [3, 'D'],
      [4, 'E']
    ]);
  });

  it('D string (open is in scale): D, E, F♯, G♯, A', () => {
    const stops = fingeringForString(aMaj, { pitchClass: 'D', octave: 4 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'D'],
      [1, 'E'],
      [2, 'F♯'],
      [3, 'G♯'],
      [4, 'A']
    ]);
  });

  it('E string (open is in scale): E, F♯, G♯, A, B', () => {
    const stops = fingeringForString(aMaj, { pitchClass: 'E', octave: 5 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [0, 'E'],
      [1, 'F♯'],
      [2, 'G♯'],
      [3, 'A'],
      [4, 'B']
    ]);
  });

  it('G string (open is NOT in scale): A, B, C♯, D as 1–4', () => {
    const stops = fingeringForString(aMaj, { pitchClass: 'G', octave: 3 });
    expect(stops.map((s) => [s.finger, s.spelling])).toEqual([
      [1, 'A'],
      [2, 'B'],
      [3, 'C♯'],
      [4, 'D']
    ]);
  });
});

describe('computeScaleFingering', () => {
  it('returns all 4 strings in order G, D, A, E', () => {
    const f = computeScaleFingering(makeScale('C', 'C', 'C', 'major'));
    expect(f.strings.map((s) => s.stringName)).toEqual(['G', 'D', 'A', 'E']);
  });
});
