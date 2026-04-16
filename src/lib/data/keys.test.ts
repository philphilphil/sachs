import { describe, it, expect } from 'vitest';
import { KEYS, type KeyData } from './keys';

describe('KEYS', () => {
  it('has exactly 12 keys', () => {
    expect(KEYS).toHaveLength(12);
  });

  it('starts with C at index 0', () => {
    expect(KEYS[0].name).toBe('C');
    expect(KEYS[0].index).toBe(0);
  });

  it('follows circle of fifths order', () => {
    const names = KEYS.map((k) => k.name);
    expect(names).toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F']);
  });

  it('C has 0 sharps and 0 flats', () => {
    expect(KEYS[0].sharps).toBe(0);
    expect(KEYS[0].flats).toBe(0);
  });

  it('G has 1 sharp', () => {
    expect(KEYS[1].sharps).toBe(1);
    expect(KEYS[1].flats).toBe(0);
  });

  it('F has 1 flat', () => {
    expect(KEYS[11].sharps).toBe(0);
    expect(KEYS[11].flats).toBe(1);
  });

  it('F♯/G♭ has enharmonic equivalent', () => {
    expect(KEYS[6].enharmonic).toBe('G♭');
  });

  it('C has no enharmonic equivalent', () => {
    expect(KEYS[0].enharmonic).toBeNull();
  });

  it('each key has a relative minor', () => {
    expect(KEYS[0].minor).toBe('Am');
    expect(KEYS[1].minor).toBe('Em');
    expect(KEYS[11].minor).toBe('Dm');
  });

  it('each key has 7 diatonic chords', () => {
    for (const key of KEYS) {
      expect(key.chords).toHaveLength(7);
    }
  });

  it('C major diatonic chords are correct', () => {
    expect(KEYS[0].chords).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
  });

  it('each key has a signature description', () => {
    expect(KEYS[0].signatureNotes).toEqual([]);
    expect(KEYS[1].signatureNotes).toEqual(['F♯']);
    expect(KEYS[11].signatureNotes).toEqual(['B♭']);
  });

  it('every index is unique and sequential 0-11', () => {
    const indices = KEYS.map((k) => k.index);
    expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});
