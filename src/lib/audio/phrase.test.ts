import { describe, it, expect } from 'vitest';
import { NOTE_DURATION_MS, PHRASE_NOTE_MS, buildPhraseSchedule } from './phrase';
import type { Pitch } from '../utils/ear-training/music-theory';

describe('phrase scheduling', () => {
  it('NOTE_DURATION_MS > PHRASE_NOTE_MS (target note is held longer than phrase notes)', () => {
    expect(NOTE_DURATION_MS).toBeGreaterThan(PHRASE_NOTE_MS);
  });

  it('buildPhraseSchedule produces one entry per pitch with correct onsets', () => {
    const pitches: Pitch[] = [
      { pitchClass: 'C', octave: 4 },
      { pitchClass: 'E', octave: 4 },
      { pitchClass: 'G', octave: 4 }
    ];
    const sched = buildPhraseSchedule(pitches);
    expect(sched).toHaveLength(3);
    expect(sched[0].onsetMs).toBe(0);
    expect(sched[1].onsetMs).toBe(PHRASE_NOTE_MS);
    expect(sched[2].onsetMs).toBe(PHRASE_NOTE_MS * 2);
  });
});
