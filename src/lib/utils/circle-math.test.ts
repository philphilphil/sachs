import { describe, it, expect } from 'vitest';
import {
  harmonicDistance,
  keyAngle,
  wedgePath,
  distanceColor,
  arcPath,
  wedgeMidpoint,
  shortestRotationTo
} from './circle-math';

describe('harmonicDistance', () => {
  it('same key is distance 0', () => {
    expect(harmonicDistance(0, 0)).toBe(0);
  });

  it('adjacent keys are distance 1', () => {
    expect(harmonicDistance(0, 1)).toBe(1);
    expect(harmonicDistance(1, 0)).toBe(1);
  });

  it('wraps around the short way', () => {
    expect(harmonicDistance(0, 11)).toBe(1);
    expect(harmonicDistance(11, 0)).toBe(1);
  });

  it('maximum distance is 6 (tritone)', () => {
    expect(harmonicDistance(0, 6)).toBe(6);
    expect(harmonicDistance(3, 9)).toBe(6);
  });

  it('distance is symmetric', () => {
    expect(harmonicDistance(2, 7)).toBe(harmonicDistance(7, 2));
  });
});

describe('keyAngle', () => {
  it('index 0 (C) is at -90 degrees (top)', () => {
    expect(keyAngle(0)).toBeCloseTo(-Math.PI / 2);
  });

  it('index 3 is 90 degrees clockwise from top', () => {
    expect(keyAngle(3)).toBeCloseTo(0);
  });

  it('index 6 is at bottom (90 degrees)', () => {
    expect(keyAngle(6)).toBeCloseTo(Math.PI / 2);
  });

  it('each step is 30 degrees (PI/6)', () => {
    const step = keyAngle(1) - keyAngle(0);
    expect(step).toBeCloseTo(Math.PI / 6);
  });
});

describe('wedgePath', () => {
  it('returns a valid SVG path string', () => {
    const path = wedgePath(300, 300, 200, 280, 0);
    expect(path).toMatch(/^M[\d.\s,-]+A[\d.\s,-]+L[\d.\s,-]+A[\d.\s,-]+Z$/);
  });

  it('different indices produce different paths', () => {
    const path0 = wedgePath(300, 300, 200, 280, 0);
    const path1 = wedgePath(300, 300, 200, 280, 1);
    expect(path0).not.toBe(path1);
  });
});

describe('distanceColor', () => {
  it('distance 0 returns the accent color', () => {
    expect(distanceColor(0)).toBe('#e8654a');
  });

  it('distance 6 returns the most muted color', () => {
    const color = distanceColor(6);
    expect(color).toBe('#b0b0b0');
  });

  it('returns a valid hex color for all distances', () => {
    for (let d = 0; d <= 6; d++) {
      expect(distanceColor(d)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('distanceColor with minor flag', () => {
  it('minor colors are lighter than major', () => {
    const major = distanceColor(0, false);
    const minor = distanceColor(0, true);
    expect(major).not.toBe(minor);
  });
});

describe('wedgeMidpoint', () => {
  it('returns x,y coordinates', () => {
    const point = wedgeMidpoint(300, 300, 250, 0);
    expect(point).toHaveProperty('x');
    expect(point).toHaveProperty('y');
  });

  it('index 0 midpoint is above center (top)', () => {
    const point = wedgeMidpoint(300, 300, 250, 0);
    expect(point.y).toBeLessThan(300);
  });

  it('index 6 midpoint is below center (bottom)', () => {
    const point = wedgeMidpoint(300, 300, 250, 6);
    expect(point.y).toBeGreaterThan(300);
  });
});

describe('arcPath', () => {
  it('returns a valid SVG path for a quadratic bezier', () => {
    const from = { x: 300, y: 50 };
    const to = { x: 550, y: 300 };
    const path = arcPath(from, to, 300, 300);
    expect(path).toMatch(/^M[\d.\s,-]+Q[\d.\s,-]+$/);
  });
});

describe('shortestRotationTo', () => {
  it('no rotation needed for same angle', () => {
    expect(shortestRotationTo(0, 0)).toBe(0);
  });

  it('prefers short clockwise', () => {
    expect(shortestRotationTo(0, 30)).toBe(30);
  });

  it('prefers short counter-clockwise', () => {
    expect(shortestRotationTo(0, 330)).toBe(-30);
  });

  it('handles wrapping from 350 to 10', () => {
    expect(shortestRotationTo(350, 10)).toBe(20);
  });
});
