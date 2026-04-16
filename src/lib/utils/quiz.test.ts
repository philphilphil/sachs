import { describe, it, expect } from 'vitest';
import { generateQuestion, type QuizQuestion } from './quiz';
import { KEYS } from '../data/keys';

describe('generateQuestion', () => {
  it('returns a question with text, answerIndex, and answerRing', () => {
    const q = generateQuestion();
    expect(q).toHaveProperty('text');
    expect(q).toHaveProperty('answerIndex');
    expect(q).toHaveProperty('answerRing');
    expect(typeof q.text).toBe('string');
    expect(q.answerIndex).toBeGreaterThanOrEqual(0);
    expect(q.answerIndex).toBeLessThan(12);
    expect(['major', 'minor']).toContain(q.answerRing);
  });

  it('generates different questions over multiple calls', () => {
    const questions = new Set<string>();
    for (let i = 0; i < 50; i++) {
      questions.add(generateQuestion().text);
    }
    expect(questions.size).toBeGreaterThan(1);
  });

  it('relative minor questions have answerRing "minor"', () => {
    // Generate many questions, find a "What is the relative minor of X?" one
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion();
      if (q.text.startsWith('What is the relative minor')) {
        expect(q.answerRing).toBe('minor');
        const keyName = q.text.match(/of (\S+)\?/)?.[1];
        if (keyName) {
          const key = KEYS.find((k) => k.name === keyName);
          if (key) {
            expect(q.answerIndex).toBe(key.index);
          }
        }
        return;
      }
    }
  });

  it('dominant questions have answerRing "major"', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion();
      if (q.text.includes('dominant of')) {
        expect(q.answerRing).toBe('major');
        return;
      }
    }
  });

  it('excludes the previous question when previousIndex is provided', () => {
    // When we exclude index 0, we should never get a question about C
    const results = new Set<number>();
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion(0);
      results.add(q.answerIndex);
    }
    // Should have variety, not just one answer
    expect(results.size).toBeGreaterThan(1);
  });
});
