import { describe, it, expect } from 'vitest';
import { generateQuestion, type QuizQuestion, type QuizCategory } from './quiz';
import { KEYS } from '../data/keys';

describe('generateQuestion', () => {
  it('returns a question with text, answer, keyIndex, and category', () => {
    const q = generateQuestion('both');
    expect(q).toHaveProperty('text');
    expect(q).toHaveProperty('answer');
    expect(q).toHaveProperty('keyIndex');
    expect(q).toHaveProperty('category');
    expect(typeof q.text).toBe('string');
    expect(typeof q.answer).toBe('string');
    expect(q.keyIndex).toBeGreaterThanOrEqual(0);
    expect(q.keyIndex).toBeLessThan(12);
    expect(['order', 'signatures']).toContain(q.category);
  });

  it('generates different questions over multiple calls', () => {
    const questions = new Set<string>();
    for (let i = 0; i < 50; i++) {
      questions.add(generateQuestion('both').text);
    }
    expect(questions.size).toBeGreaterThan(1);
  });

  it('order category only produces order questions', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('order');
      expect(q.category).toBe('order');
    }
  });

  it('signatures category only produces signatures questions', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('signatures');
      expect(q.category).toBe('signatures');
    }
  });

  it('both category produces both types', () => {
    const categories = new Set<string>();
    for (let i = 0; i < 100; i++) {
      categories.add(generateQuestion('both').category);
    }
    expect(categories.has('order')).toBe(true);
    expect(categories.has('signatures')).toBe(true);
  });

  it('order questions about next key have correct answers', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion('order');
      if (q.text.startsWith('What key comes after')) {
        const keyName = q.text.match(/after (\S+) on/)?.[1];
        if (keyName) {
          const key = KEYS.find((k) => k.name === keyName);
          if (key) {
            expect(q.answer).toBe(KEYS[(key.index + 1) % 12].name);
          }
        }
        return;
      }
    }
  });

  it('signature questions about sharp/flat count have correct answers', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion('signatures');
      if (q.text.startsWith('How many sharps')) {
        const key = KEYS[q.keyIndex];
        if (key.sharps > 0) {
          expect(q.answer).toContain('sharp');
        } else if (key.flats > 0) {
          expect(q.answer).toContain('flat');
        } else {
          expect(q.answer).toBe('No sharps or flats');
        }
        return;
      }
    }
  });

  it('excludes the previous keyIndex when provided', () => {
    const indices = new Set<number>();
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion('both', 0);
      indices.add(q.keyIndex);
    }
    expect(indices.has(0)).toBe(false);
  });
});
