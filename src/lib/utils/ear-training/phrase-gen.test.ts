import { describe, it, expect } from 'vitest';
import { generateKeyModeRound } from './phrase-gen';

describe('generateKeyModeRound', () => {
  it('returns a phrase of length 4 to 6', () => {
    for (let i = 0; i < 50; i++) {
      const round = generateKeyModeRound();
      expect(round.phrase.length).toBeGreaterThanOrEqual(4);
      expect(round.phrase.length).toBeLessThanOrEqual(6);
    }
  });

  it('phrase ends on the tonic', () => {
    for (let i = 0; i < 50; i++) {
      const round = generateKeyModeRound();
      const last = round.phrase[round.phrase.length - 1];
      expect(last.pitchClass).toBe(round.tonic);
    }
  });

  it('generates both major and minor rounds over samples', () => {
    const modes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      modes.add(generateKeyModeRound().mode);
    }
    expect(modes.has('major')).toBe(true);
    expect(modes.has('minor')).toBe(true);
  });

  it('major phrases contain the natural 3rd (not flat 3rd)', () => {
    const round = generateKeyModeRound(undefined, () => 0);
    expect(round.mode).toBe('major');
    expect(round.phraseDegrees).not.toContain('b3');
  });

  it('minor phrases that contain a 3rd-flavour degree include b3 (not 3)', () => {
    const round = generateKeyModeRound(undefined, () => 0.99);
    expect(round.mode).toBe('minor');
    expect(round.phraseDegrees).not.toContain(3);
  });

  it('avoids repeating the previous tonic', () => {
    for (let i = 0; i < 30; i++) {
      const round = generateKeyModeRound('G');
      expect(round.tonic).not.toBe('G');
    }
  });
});
