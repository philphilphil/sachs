import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createScheduler } from './scheduler';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('createScheduler', () => {
  it('runs steps in order with the given delays', async () => {
    const calls: string[] = [];
    const s = createScheduler();
    const p = s.run([
      { delayMs: 0, action: () => calls.push('a') },
      { delayMs: 100, action: () => calls.push('b') },
      { delayMs: 100, action: () => calls.push('c') }
    ]);
    await vi.advanceTimersByTimeAsync(250);
    await p;
    expect(calls).toEqual(['a', 'b', 'c']);
  });

  it('cancel() stops further steps and resolves the pending promise', async () => {
    const calls: string[] = [];
    const s = createScheduler();
    const p = s.run([
      { delayMs: 0, action: () => calls.push('a') },
      { delayMs: 100, action: () => calls.push('b') },
      { delayMs: 100, action: () => calls.push('c') }
    ]);
    await vi.advanceTimersByTimeAsync(50);
    s.cancel();
    await vi.advanceTimersByTimeAsync(500);
    await p;
    expect(calls).toEqual(['a']);
  });

  it('a new run() cancels the previous one', async () => {
    const calls: string[] = [];
    const s = createScheduler();
    const p1 = s.run([
      { delayMs: 100, action: () => calls.push('x') },
      { delayMs: 100, action: () => calls.push('y') }
    ]);
    await vi.advanceTimersByTimeAsync(50);
    const p2 = s.run([{ delayMs: 100, action: () => calls.push('z') }]);
    await vi.advanceTimersByTimeAsync(200);
    await Promise.all([p1, p2]);
    expect(calls).toEqual(['z']);
  });
});
