import { describe, it, expect } from 'vitest';
import {
  KEY_SIGNATURES,
  PRESETS,
  buildPianoPreset,
  type KeySignature,
  type Preset,
  type StaffNote
} from './notes';

describe('KEY_SIGNATURES', () => {
  it('includes all 12 major keys', () => {
    expect(KEY_SIGNATURES).toHaveLength(12);
    const tonics = KEY_SIGNATURES.map((k) => k.tonic);
    expect(tonics).toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F']);
  });

  it('C major has no accidentals and type "natural"', () => {
    const c = KEY_SIGNATURES.find((k) => k.tonic === 'C')!;
    expect(c.accidentals).toEqual([]);
    expect(c.type).toBe('natural');
    expect(c.vexflowKey).toBe('C');
  });

  it('G major has F♯ and type "sharp"', () => {
    const g = KEY_SIGNATURES.find((k) => k.tonic === 'G')!;
    expect(g.accidentals).toEqual(['F♯']);
    expect(g.type).toBe('sharp');
    expect(g.vexflowKey).toBe('G');
  });

  it('D major has F♯ and C♯ in order', () => {
    const d = KEY_SIGNATURES.find((k) => k.tonic === 'D')!;
    expect(d.accidentals).toEqual(['F♯', 'C♯']);
  });

  it('F major has B♭ and type "flat"', () => {
    const f = KEY_SIGNATURES.find((k) => k.tonic === 'F')!;
    expect(f.accidentals).toEqual(['B♭']);
    expect(f.type).toBe('flat');
    expect(f.vexflowKey).toBe('F');
  });

  it('E♭ major has three flats in order', () => {
    const eb = KEY_SIGNATURES.find((k) => k.tonic === 'E♭')!;
    expect(eb.accidentals).toEqual(['B♭', 'E♭', 'A♭']);
    expect(eb.vexflowKey).toBe('Eb');
  });

  it('F♯ major uses "F#" for vexflow and has six sharps', () => {
    const fs = KEY_SIGNATURES.find((k) => k.tonic === 'F♯')!;
    expect(fs.accidentals).toHaveLength(6);
    expect(fs.vexflowKey).toBe('F#');
  });

  it('accidental count matches type for every key', () => {
    for (const k of KEY_SIGNATURES) {
      if (k.type === 'natural') expect(k.accidentals).toHaveLength(0);
      if (k.type === 'sharp') {
        expect(k.accidentals.length).toBeGreaterThan(0);
        k.accidentals.forEach((a) => expect(a).toContain('♯'));
      }
      if (k.type === 'flat') {
        expect(k.accidentals.length).toBeGreaterThan(0);
        k.accidentals.forEach((a) => expect(a).toContain('♭'));
      }
    }
  });
});

describe('PRESETS', () => {
  it('exposes the four fixed presets', () => {
    const ids = PRESETS.map((p) => p.id);
    expect(ids).toEqual(['staff-basics', 'violin-1st', 'violin-3rd', 'piano']);
  });

  it('staff-basics has 9 on-staff notes and C major only', () => {
    const p = PRESETS.find((p) => p.id === 'staff-basics')!;
    expect(p.notes).toHaveLength(9);
    expect(p.keys.map((k) => k.tonic)).toEqual(['C']);
    expect(p.notes![0]).toEqual({ letter: 'E', octave: 4 });
    expect(p.notes![8]).toEqual({ letter: 'F', octave: 5 });
  });

  it('violin-1st has 17 letter positions from G3 to B5', () => {
    const p = PRESETS.find((p) => p.id === 'violin-1st')!;
    expect(p.notes).toHaveLength(17);
    expect(p.notes![0]).toEqual({ letter: 'G', octave: 3 });
    expect(p.notes![16]).toEqual({ letter: 'B', octave: 5 });
    expect(p.keys.map((k) => k.tonic)).toEqual(['C', 'G', 'D', 'A']);
  });

  it('violin-3rd has 20 letter positions from G3 to E6', () => {
    const p = PRESETS.find((p) => p.id === 'violin-3rd')!;
    expect(p.notes).toHaveLength(20);
    expect(p.notes![0]).toEqual({ letter: 'G', octave: 3 });
    expect(p.notes![19]).toEqual({ letter: 'E', octave: 6 });
    expect(p.keys.map((k) => k.tonic)).toEqual(['C', 'G', 'D', 'A', 'F', 'B♭', 'E♭']);
  });

  it('piano preset has an octaveRange and all 12 keys', () => {
    const p = PRESETS.find((p) => p.id === 'piano')!;
    expect(p.octaveRange).toEqual({ min: 3, max: 5 });
    expect(p.keys).toHaveLength(12);
  });
});

describe('buildPianoPreset', () => {
  it('generates C{min} through B{max} notes', () => {
    const p = buildPianoPreset({ min: 4, max: 4 });
    expect(p.notes).toHaveLength(7);
    expect(p.notes![0]).toEqual({ letter: 'C', octave: 4 });
    expect(p.notes![6]).toEqual({ letter: 'B', octave: 4 });
  });

  it('spans multiple octaves', () => {
    const p = buildPianoPreset({ min: 3, max: 5 });
    expect(p.notes).toHaveLength(21);
    expect(p.octaveRange).toEqual({ min: 3, max: 5 });
  });
});
