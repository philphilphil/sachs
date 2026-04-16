import { describe, it, expect, beforeEach } from 'vitest';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.has(key) ? (this.data.get(key) as string) : null; }
  key(i: number) { return Array.from(this.data.keys())[i] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, String(value)); }
}
Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
  writable: true
});

import {
  loadLevel,
  saveLevel,
  loadBestStreak,
  saveBestStreak
} from './storage';

describe('ear-training storage', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to level 1 when nothing is stored', () => {
    expect(loadLevel()).toBe(1);
  });

  it('round-trips a level', () => {
    saveLevel(3);
    expect(loadLevel()).toBe(3);
  });

  it('clamps out-of-range stored level to 1', () => {
    localStorage.setItem('ear-training:mode-a:current-level', '99');
    expect(loadLevel()).toBe(1);
  });

  it('best streak is per-mode-per-level', () => {
    saveBestStreak('mode-a', 5, 1);
    saveBestStreak('mode-a', 12, 2);
    saveBestStreak('mode-b', 7);
    expect(loadBestStreak('mode-a', 1)).toBe(5);
    expect(loadBestStreak('mode-a', 2)).toBe(12);
    expect(loadBestStreak('mode-a', 3)).toBe(0);
    expect(loadBestStreak('mode-b')).toBe(7);
  });

  it('tolerates localStorage throwing', () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem() { throw new Error('denied'); },
        setItem() { throw new Error('denied'); },
        removeItem() {}, clear() {}, key() { return null; }, length: 0
      } as Storage,
      configurable: true
    });
    expect(() => saveBestStreak('mode-a', 3, 1)).not.toThrow();
    expect(loadBestStreak('mode-a', 1)).toBe(0);
    expect(loadLevel()).toBe(1);
    Object.defineProperty(globalThis, 'localStorage', {
      value: original,
      configurable: true
    });
  });
});
