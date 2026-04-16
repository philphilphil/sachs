import { describe, it, expect } from 'vitest';
import { generateScaleDegreeRound } from './round';
import type { ScaleDegree } from './music-theory';

function makeRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('generateScaleDegreeRound', () => {
  it('picks targets only from the active set for level 1', () => {
    const activeSet: ScaleDegree[] = [1, 3, 5];
    for (let i = 0; i < 200; i++) {
      const round = generateScaleDegreeRound(1);
      expect(round.targets).toHaveLength(1);
      expect(activeSet).toContain(round.targets[0]);
    }
  });

  it('level 5 generates two targets', () => {
    const round = generateScaleDegreeRound(5);
    expect(round.targets).toHaveLength(2);
  });

  it('avoids repeating the previous tonic', () => {
    for (let i = 0; i < 50; i++) {
      const round = generateScaleDegreeRound(3, 'C');
      expect(round.tonic).not.toBe('C');
    }
  });

  it('level 4 mode is always minor', () => {
    for (let i = 0; i < 30; i++) {
      expect(generateScaleDegreeRound(4).mode).toBe('minor');
    }
  });

  it('level 5 mode is major or minor (mixed)', () => {
    const modes = new Set<string>();
    for (let i = 0; i < 80; i++) {
      modes.add(generateScaleDegreeRound(5).mode);
    }
    expect(modes.has('major')).toBe(true);
    expect(modes.has('minor')).toBe(true);
  });

  it('computes target pitches consistently with degree+mode', () => {
    const round = generateScaleDegreeRound(1, undefined, makeRng([0, 0]));
    expect(round.tonic).toBe('C');
    expect(round.mode).toBe('major');
    expect(round.targets).toEqual([1]);
    expect(round.targetPitches[0]).toMatchObject({ pitchClass: 'C' });
  });
});
