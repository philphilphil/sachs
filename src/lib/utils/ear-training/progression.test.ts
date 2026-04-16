import { describe, it, expect } from 'vitest';
import { ProgressionTracker } from './progression';

describe('ProgressionTracker', () => {
  it('does not advance before the window is full', () => {
    const t = new ProgressionTracker();
    for (let i = 0; i < 19; i++) t.record(true);
    expect(t.shouldAdvance()).toBe(false);
  });

  it('advances at exactly 17 correct out of 20 (85%)', () => {
    const t = new ProgressionTracker();
    for (let i = 0; i < 17; i++) t.record(true);
    for (let i = 0; i < 3; i++) t.record(false);
    expect(t.shouldAdvance()).toBe(true);
  });

  it('does not advance at 16 correct out of 20 (80%)', () => {
    const t = new ProgressionTracker();
    for (let i = 0; i < 16; i++) t.record(true);
    for (let i = 0; i < 4; i++) t.record(false);
    expect(t.shouldAdvance()).toBe(false);
  });

  it('uses a rolling window — old answers age out', () => {
    const t = new ProgressionTracker();
    for (let i = 0; i < 20; i++) t.record(false);
    expect(t.shouldAdvance()).toBe(false);
    for (let i = 0; i < 20; i++) t.record(true);
    expect(t.shouldAdvance()).toBe(true);
  });

  it('reset clears history', () => {
    const t = new ProgressionTracker();
    for (let i = 0; i < 20; i++) t.record(true);
    expect(t.shouldAdvance()).toBe(true);
    t.reset();
    expect(t.shouldAdvance()).toBe(false);
  });
});
