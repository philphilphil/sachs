import { describe, it, expect } from 'vitest';
import {
  PITCH_CLASSES,
  degreeToPitch,
  pitchToToneString,
  pitchToMidi,
  addSemitones,
  type Pitch
} from './music-theory';

describe('music-theory', () => {
  describe('degreeToPitch', () => {
    it('resolves C major scale degrees to the right pitch classes', () => {
      expect(degreeToPitch('C', 'major', 1, 4).pitchClass).toBe('C');
      expect(degreeToPitch('C', 'major', 3, 4).pitchClass).toBe('E');
      expect(degreeToPitch('C', 'major', 5, 4).pitchClass).toBe('G');
      expect(degreeToPitch('C', 'major', 7, 4).pitchClass).toBe('B');
    });

    it('resolves natural minor degrees correctly (A minor)', () => {
      expect(degreeToPitch('A', 'minor', 1, 4).pitchClass).toBe('A');
      expect(degreeToPitch('A', 'minor', 'b3', 4).pitchClass).toBe('C');
      expect(degreeToPitch('A', 'minor', 5, 4).pitchClass).toBe('E');
      expect(degreeToPitch('A', 'minor', 'b6', 4).pitchClass).toBe('F');
      expect(degreeToPitch('A', 'minor', 'b7', 4).pitchClass).toBe('G');
    });

    it('wraps octaves when the tonic is high', () => {
      const p = degreeToPitch('F', 'major', 5, 4);
      expect(p.pitchClass).toBe('C');
      expect(p.octave).toBe(5);
    });

    it('wraps octaves for flat degrees that cross C', () => {
      const bm6 = degreeToPitch('G', 'minor', 'b6', 4);
      expect(bm6.pitchClass).toBe('D#');
      expect(bm6.octave).toBe(5);
    });
  });

  describe('pitchToToneString', () => {
    it('formats a pitch for Tone.js', () => {
      expect(pitchToToneString({ pitchClass: 'C', octave: 4 })).toBe('C4');
      expect(pitchToToneString({ pitchClass: 'F#', octave: 5 })).toBe('F#5');
    });
  });

  describe('pitchToMidi', () => {
    it('maps C4 to 60 (middle C)', () => {
      expect(pitchToMidi({ pitchClass: 'C', octave: 4 })).toBe(60);
    });
    it('maps A4 to 69', () => {
      expect(pitchToMidi({ pitchClass: 'A', octave: 4 })).toBe(69);
    });
  });

  describe('addSemitones', () => {
    it('adds positive semitones across octave boundaries', () => {
      expect(addSemitones({ pitchClass: 'G', octave: 3 }, 5)).toEqual({
        pitchClass: 'C',
        octave: 4
      });
    });
  });

  it('PITCH_CLASSES has all 12 chromatic tones', () => {
    expect(PITCH_CLASSES).toHaveLength(12);
    expect(PITCH_CLASSES[0]).toBe('C');
  });
});
