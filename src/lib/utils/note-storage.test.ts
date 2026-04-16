import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Node 25 provides an empty `localStorage` stub by default (behind
// `--localstorage-file`). Install a working in-memory polyfill before the
// module under test imports, so the tests can exercise the real contract.
class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }
  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
}
Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
  writable: true
});

import { loadBest, saveBest } from './note-storage';

describe('note-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns 0 for a missing key', () => {
    expect(loadBest('violin-1st', 'note')).toBe(0);
  });

  it('round-trips a saved value', () => {
    saveBest('violin-1st', 'note', 7);
    expect(loadBest('violin-1st', 'note')).toBe(7);
  });

  it('keeps separate values per (preset, mode) pair', () => {
    saveBest('violin-1st', 'note', 7);
    saveBest('violin-1st', 'key', 3);
    saveBest('piano', 'note', 15);
    expect(loadBest('violin-1st', 'note')).toBe(7);
    expect(loadBest('violin-1st', 'key')).toBe(3);
    expect(loadBest('piano', 'note')).toBe(15);
    expect(loadBest('piano', 'key')).toBe(0);
  });

  it('returns 0 when the stored value is not a number', () => {
    localStorage.setItem('note-trainer:best:violin-1st:note', 'garbage');
    expect(loadBest('violin-1st', 'note')).toBe(0);
  });

  describe('when localStorage throws', () => {
    let original: Storage;
    beforeEach(() => {
      original = globalThis.localStorage;
      const stub: Partial<Storage> = {
        getItem: vi.fn(() => {
          throw new Error('denied');
        }),
        setItem: vi.fn(() => {
          throw new Error('denied');
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      };
      Object.defineProperty(globalThis, 'localStorage', {
        value: stub,
        configurable: true
      });
    });
    afterEach(() => {
      Object.defineProperty(globalThis, 'localStorage', {
        value: original,
        configurable: true
      });
    });

    it('loadBest returns 0', () => {
      expect(loadBest('violin-1st', 'note')).toBe(0);
    });

    it('saveBest does not throw', () => {
      expect(() => saveBest('violin-1st', 'note', 5)).not.toThrow();
    });
  });
});
