import { describe, it, expect } from 'vitest';
import { LEVELS, getLevel, type ScaleDegreeLevel } from './levels';

describe('levels', () => {
  it('has exactly 5 levels', () => {
    expect(LEVELS).toHaveLength(5);
  });

  it('level 1 = 1, 3, 5 major', () => {
    const def = getLevel(1);
    expect(def.mode).toBe('major');
    expect(def.degreesMajor).toEqual([1, 3, 5]);
    expect(def.phraseLength).toBe(1);
  });

  it('level 4 = natural minor 1–b7', () => {
    const def = getLevel(4);
    expect(def.mode).toBe('minor');
    expect(def.degreesMinor).toEqual([1, 2, 'b3', 4, 5, 'b6', 'b7']);
  });

  it('level 5 is mixed and has phraseLength 2', () => {
    const def = getLevel(5);
    expect(def.mode).toBe('mixed');
    expect(def.phraseLength).toBe(2);
    expect(def.degreesMajor).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(def.degreesMinor).toEqual([1, 2, 'b3', 4, 5, 'b6', 'b7']);
  });

  it('getLevel throws for out-of-range input', () => {
    expect(() => getLevel(0 as ScaleDegreeLevel)).toThrow();
    expect(() => getLevel(6 as ScaleDegreeLevel)).toThrow();
  });
});
