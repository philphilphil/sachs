# Circle of Fifths Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive circle of fifths with three modes (explore, reference, learn/quiz) rendered as pure SVG with Svelte 5 reactivity.

**Architecture:** Pure SVG wedge segments generated from a 12-key data array. Svelte 5 runes (`$state`, `$derived`) manage selection, mode, and rotation. A `tweened` store drives smooth rotation animations. Components are small and focused — one per visual concern.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS 4, SVG, Vitest (new)

---

## File Structure

```
src/lib/data/
  keys.ts                          — key data array, types, diatonic chords

src/lib/utils/
  circle-math.ts                   — wedge path, harmonic distance, color, angle math
  quiz.ts                          — question generation + answer checking

src/lib/components/circle-of-fifths/
  ModeToggle.svelte                — segmented Explore/Reference/Learn toggle
  Wedge.svelte                     — single SVG wedge (path + label)
  ConnectingArcs.svelte            — relationship arc overlays
  CircleOfFifths.svelte            — main SVG circle (assembles wedges + arcs)
  DetailPanel.svelte               — sidebar info (reference + explore modes)
  QuizPanel.svelte                 — quiz UI (question, feedback, score)

src/routes/circle-of-fifths/
  +page.svelte                     — page shell, layout, state, wiring (modify existing)

src/lib/data/keys.test.ts          — data model tests
src/lib/utils/circle-math.test.ts  — circle math tests
src/lib/utils/quiz.test.ts         — quiz logic tests
```

---

### Task 1: Data Model & Test Setup

**Files:**
- Create: `src/lib/data/keys.ts`
- Create: `src/lib/data/keys.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feat/circle-of-fifths
```

All subsequent commits go on this branch.

- [ ] **Step 2: Install vitest**

```bash
npm install -D vitest
```

- [ ] **Step 3: Add test script to package.json**

Add to the `"scripts"` object in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write failing tests for key data**

Create `src/lib/data/keys.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { KEYS, type KeyData } from './keys';

describe('KEYS', () => {
  it('has exactly 12 keys', () => {
    expect(KEYS).toHaveLength(12);
  });

  it('starts with C at index 0', () => {
    expect(KEYS[0].name).toBe('C');
    expect(KEYS[0].index).toBe(0);
  });

  it('follows circle of fifths order', () => {
    const names = KEYS.map((k) => k.name);
    expect(names).toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F']);
  });

  it('C has 0 sharps and 0 flats', () => {
    expect(KEYS[0].sharps).toBe(0);
    expect(KEYS[0].flats).toBe(0);
  });

  it('G has 1 sharp', () => {
    expect(KEYS[1].sharps).toBe(1);
    expect(KEYS[1].flats).toBe(0);
  });

  it('F has 1 flat', () => {
    expect(KEYS[11].sharps).toBe(0);
    expect(KEYS[11].flats).toBe(1);
  });

  it('F♯/G♭ has enharmonic equivalent', () => {
    expect(KEYS[6].enharmonic).toBe('G♭');
  });

  it('C has no enharmonic equivalent', () => {
    expect(KEYS[0].enharmonic).toBeNull();
  });

  it('each key has a relative minor', () => {
    expect(KEYS[0].minor).toBe('Am');
    expect(KEYS[1].minor).toBe('Em');
    expect(KEYS[11].minor).toBe('Dm');
  });

  it('each key has 7 diatonic chords', () => {
    for (const key of KEYS) {
      expect(key.chords).toHaveLength(7);
    }
  });

  it('C major diatonic chords are correct', () => {
    expect(KEYS[0].chords).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
  });

  it('each key has a signature description', () => {
    expect(KEYS[0].signatureNotes).toEqual([]);
    expect(KEYS[1].signatureNotes).toEqual(['F♯']);
    expect(KEYS[11].signatureNotes).toEqual(['B♭']);
  });

  it('every index is unique and sequential 0-11', () => {
    const indices = KEYS.map((k) => k.index);
    expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});
```

- [ ] **Step 5: Run tests to verify they fail**

```bash
npx vitest run src/lib/data/keys.test.ts
```

Expected: FAIL — cannot find module `./keys`

- [ ] **Step 6: Implement key data**

Create `src/lib/data/keys.ts`:

```typescript
export interface KeyData {
  name: string;
  minor: string;
  enharmonic: string | null;
  sharps: number;
  flats: number;
  index: number;
  chords: string[];
  signatureNotes: string[];
}

export const KEYS: KeyData[] = [
  {
    name: 'C',
    minor: 'Am',
    enharmonic: null,
    sharps: 0,
    flats: 0,
    index: 0,
    chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°'],
    signatureNotes: []
  },
  {
    name: 'G',
    minor: 'Em',
    enharmonic: null,
    sharps: 1,
    flats: 0,
    index: 1,
    chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F♯°'],
    signatureNotes: ['F♯']
  },
  {
    name: 'D',
    minor: 'Bm',
    enharmonic: null,
    sharps: 2,
    flats: 0,
    index: 2,
    chords: ['D', 'Em', 'F♯m', 'G', 'A', 'Bm', 'C♯°'],
    signatureNotes: ['F♯', 'C♯']
  },
  {
    name: 'A',
    minor: 'F♯m',
    enharmonic: null,
    sharps: 3,
    flats: 0,
    index: 3,
    chords: ['A', 'Bm', 'C♯m', 'D', 'E', 'F♯m', 'G♯°'],
    signatureNotes: ['F♯', 'C♯', 'G♯']
  },
  {
    name: 'E',
    minor: 'C♯m',
    enharmonic: null,
    sharps: 4,
    flats: 0,
    index: 4,
    chords: ['E', 'F♯m', 'G♯m', 'A', 'B', 'C♯m', 'D♯°'],
    signatureNotes: ['F♯', 'C♯', 'G♯', 'D♯']
  },
  {
    name: 'B',
    minor: 'G♯m',
    enharmonic: 'C♭',
    sharps: 5,
    flats: 0,
    index: 5,
    chords: ['B', 'C♯m', 'D♯m', 'E', 'F♯', 'G♯m', 'A♯°'],
    signatureNotes: ['F♯', 'C♯', 'G♯', 'D♯', 'A♯']
  },
  {
    name: 'F♯',
    minor: 'D♯m',
    enharmonic: 'G♭',
    sharps: 6,
    flats: 0,
    index: 6,
    chords: ['F♯', 'G♯m', 'A♯m', 'B', 'C♯', 'D♯m', 'E♯°'],
    signatureNotes: ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯']
  },
  {
    name: 'D♭',
    minor: 'B♭m',
    enharmonic: 'C♯',
    sharps: 0,
    flats: 5,
    index: 7,
    chords: ['D♭', 'E♭m', 'Fm', 'G♭', 'A♭', 'B♭m', 'C°'],
    signatureNotes: ['B♭', 'E♭', 'A♭', 'D♭', 'G♭']
  },
  {
    name: 'A♭',
    minor: 'Fm',
    enharmonic: null,
    sharps: 0,
    flats: 4,
    index: 8,
    chords: ['A♭', 'B♭m', 'Cm', 'D♭', 'E♭', 'Fm', 'G°'],
    signatureNotes: ['B♭', 'E♭', 'A♭', 'D♭']
  },
  {
    name: 'E♭',
    minor: 'Cm',
    enharmonic: null,
    sharps: 0,
    flats: 3,
    index: 9,
    chords: ['E♭', 'Fm', 'Gm', 'A♭', 'B♭', 'Cm', 'D°'],
    signatureNotes: ['B♭', 'E♭', 'A♭']
  },
  {
    name: 'B♭',
    minor: 'Gm',
    enharmonic: null,
    sharps: 0,
    flats: 2,
    index: 10,
    chords: ['B♭', 'Cm', 'Dm', 'E♭', 'F', 'Gm', 'A°'],
    signatureNotes: ['B♭', 'E♭']
  },
  {
    name: 'F',
    minor: 'Dm',
    enharmonic: null,
    sharps: 0,
    flats: 1,
    index: 11,
    chords: ['F', 'Gm', 'Am', 'B♭', 'C', 'Dm', 'E°'],
    signatureNotes: ['B♭']
  }
];
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npx vitest run src/lib/data/keys.test.ts
```

Expected: all 12 tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/data/keys.ts src/lib/data/keys.test.ts package.json package-lock.json
git commit -m "feat: add circle of fifths key data model with tests"
```

---

### Task 2: Circle Math Utilities

**Files:**
- Create: `src/lib/utils/circle-math.ts`
- Create: `src/lib/utils/circle-math.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/utils/circle-math.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/utils/circle-math.test.ts
```

Expected: FAIL — cannot find module `./circle-math`

- [ ] **Step 3: Implement circle math utilities**

Create `src/lib/utils/circle-math.ts`:

```typescript
const GAP_DEGREES = 1.5;
const GAP_RAD = (GAP_DEGREES * Math.PI) / 180;
const SLICE_RAD = (2 * Math.PI) / 12;

const DISTANCE_COLORS = [
  '#e8654a', // 0 - selected (accent)
  '#ef8c6e', // 1 - warm coral
  '#d4a574', // 2 - amber
  '#9ab086', // 3 - sage
  '#7baaa2', // 4 - teal-gray
  '#8b9ab8', // 5 - steel blue
  '#b0b0b0'  // 6 - neutral gray (tritone)
];

const DISTANCE_COLORS_MINOR = [
  '#f4a593', // 0
  '#f5b89e', // 1
  '#e5c9a8', // 2
  '#c0d1b4', // 3
  '#a8ccc6', // 4
  '#b3bfd0', // 5
  '#c8c8c8'  // 6
];

const DEFAULT_FILL = '#f0eeeb';
const DEFAULT_FILL_MINOR = '#e8e6e2';

export function harmonicDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 12 - diff);
}

export function keyAngle(index: number): number {
  return -Math.PI / 2 + index * SLICE_RAD;
}

export function wedgePath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  index: number
): string {
  const startAngle = keyAngle(index) - SLICE_RAD / 2 + GAP_RAD / 2;
  const endAngle = keyAngle(index) + SLICE_RAD / 2 - GAP_RAD / 2;

  const outerX1 = cx + outerR * Math.cos(startAngle);
  const outerY1 = cy + outerR * Math.sin(startAngle);
  const outerX2 = cx + outerR * Math.cos(endAngle);
  const outerY2 = cy + outerR * Math.sin(endAngle);
  const innerX1 = cx + innerR * Math.cos(endAngle);
  const innerY1 = cy + innerR * Math.sin(endAngle);
  const innerX2 = cx + innerR * Math.cos(startAngle);
  const innerY2 = cy + innerR * Math.sin(startAngle);

  return [
    `M${outerX1},${outerY1}`,
    `A${outerR},${outerR} 0 0,1 ${outerX2},${outerY2}`,
    `L${innerX1},${innerY1}`,
    `A${innerR},${innerR} 0 0,0 ${innerX2},${innerY2}`,
    'Z'
  ].join(' ');
}

export function distanceColor(
  distance: number,
  isMinor: boolean = false
): string {
  const clamped = Math.max(0, Math.min(6, distance));
  return isMinor ? DISTANCE_COLORS_MINOR[clamped] : DISTANCE_COLORS[clamped];
}

export function defaultFill(isMinor: boolean = false): string {
  return isMinor ? DEFAULT_FILL_MINOR : DEFAULT_FILL;
}

export function wedgeMidpoint(
  cx: number,
  cy: number,
  radius: number,
  index: number
): { x: number; y: number } {
  const angle = keyAngle(index);
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}

export function arcPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  cx: number,
  cy: number
): string {
  const controlX = cx + (cx - (from.x + to.x) / 2) * 0.3;
  const controlY = cy + (cy - (from.y + to.y) / 2) * 0.3;
  return `M${from.x},${from.y} Q${controlX},${controlY} ${to.x},${to.y}`;
}

export function shortestRotationTo(
  currentDeg: number,
  targetDeg: number
): number {
  let diff = targetDeg - currentDeg;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/utils/circle-math.test.ts
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/circle-math.ts src/lib/utils/circle-math.test.ts
git commit -m "feat: add circle math utilities for wedge paths and harmonic distance"
```

---

### Task 3: Quiz Logic

**Files:**
- Create: `src/lib/utils/quiz.ts`
- Create: `src/lib/utils/quiz.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/utils/quiz.test.ts`:

```typescript
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
    // Generate many questions, find a relative minor one
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion();
      if (q.text.includes('relative minor')) {
        expect(q.answerRing).toBe('minor');
        // Verify correctness: relative minor of C is Am (index 0)
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/utils/quiz.test.ts
```

Expected: FAIL — cannot find module `./quiz`

- [ ] **Step 3: Implement quiz logic**

Create `src/lib/utils/quiz.ts`:

```typescript
import { KEYS } from '../data/keys';

export interface QuizQuestion {
  text: string;
  answerIndex: number;
  answerRing: 'major' | 'minor';
}

type QuestionGenerator = (keyIndex: number) => QuizQuestion;

const generators: QuestionGenerator[] = [
  // "What is the relative minor of [key]?"
  (i) => ({
    text: `What is the relative minor of ${KEYS[i].name}?`,
    answerIndex: i,
    answerRing: 'minor'
  }),

  // "What is the dominant of [key]?"
  (i) => ({
    text: `What is the dominant of ${KEYS[i].name}?`,
    answerIndex: (i + 1) % 12,
    answerRing: 'major'
  }),

  // "What is the subdominant of [key]?"
  (i) => ({
    text: `What is the subdominant of ${KEYS[i].name}?`,
    answerIndex: (i + 11) % 12,
    answerRing: 'major'
  }),

  // "What key has N sharps/flats?"
  (i) => {
    const key = KEYS[i];
    const desc =
      key.sharps > 0
        ? `${key.sharps} sharp${key.sharps > 1 ? 's' : ''}`
        : key.flats > 0
          ? `${key.flats} flat${key.flats > 1 ? 's' : ''}`
          : 'no sharps or flats';
    return {
      text: `Which major key has ${desc}?`,
      answerIndex: i,
      answerRing: 'major'
    };
  },

  // "[minor] is the relative minor of which major key?"
  (i) => ({
    text: `${KEYS[i].minor} is the relative minor of which major key?`,
    answerIndex: i,
    answerRing: 'major'
  })
];

export function generateQuestion(
  excludeAnswerIndex?: number
): QuizQuestion {
  const genIndex = Math.floor(Math.random() * generators.length);
  let keyIndex: number;

  do {
    keyIndex = Math.floor(Math.random() * 12);
  } while (excludeAnswerIndex !== undefined && keyIndex === excludeAnswerIndex);

  return generators[genIndex](keyIndex);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/utils/quiz.test.ts
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/quiz.ts src/lib/utils/quiz.test.ts
git commit -m "feat: add quiz question generation with 5 question types"
```

---

### Task 4: ModeToggle Component

**Files:**
- Create: `src/lib/components/circle-of-fifths/ModeToggle.svelte`

- [ ] **Step 1: Create ModeToggle component**

Create `src/lib/components/circle-of-fifths/ModeToggle.svelte`:

```svelte
<script lang="ts">
  type Mode = 'explore' | 'reference' | 'learn';

  interface Props {
    mode: Mode;
    onchange: (mode: Mode) => void;
  }

  let { mode, onchange }: Props = $props();

  const modes: { value: Mode; label: string }[] = [
    { value: 'explore', label: 'Explore' },
    { value: 'reference', label: 'Reference' },
    { value: 'learn', label: 'Learn' }
  ];
</script>

<div class="inline-flex rounded-lg border border-border bg-bg-card p-0.5" role="radiogroup" aria-label="Mode">
  {#each modes as m}
    <button
      role="radio"
      aria-checked={mode === m.value}
      class="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        {mode === m.value
        ? 'bg-accent text-white shadow-sm'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'}"
      onclick={() => onchange(m.value)}
    >
      {m.label}
    </button>
  {/each}
</div>
```

- [ ] **Step 2: Verify component renders in dev**

```bash
npm run dev
```

Open browser, temporarily import ModeToggle in the circle-of-fifths page to verify it renders. (This visual check will be formalized when we build the page shell in Task 10.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/circle-of-fifths/ModeToggle.svelte
git commit -m "feat: add mode toggle component for explore/reference/learn"
```

---

### Task 5: Wedge & CircleOfFifths Components (Static Rendering)

**Files:**
- Create: `src/lib/components/circle-of-fifths/Wedge.svelte`
- Create: `src/lib/components/circle-of-fifths/CircleOfFifths.svelte`

- [ ] **Step 1: Create Wedge component**

Create `src/lib/components/circle-of-fifths/Wedge.svelte`:

```svelte
<script lang="ts">
  import { wedgePath } from '$lib/utils/circle-math';

  interface Props {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    index: number;
    label: string;
    fill: string;
    isSelected: boolean;
    feedbackClass: string;
    rotation: number;
    onclick: () => void;
    onkeydown: (e: KeyboardEvent) => void;
  }

  let {
    cx,
    cy,
    innerRadius,
    outerRadius,
    index,
    label,
    fill,
    isSelected,
    feedbackClass = '',
    rotation,
    onclick,
    onkeydown
  }: Props = $props();

  const SLICE_DEG = 360 / 12;

  let path = $derived(wedgePath(cx, cy, innerRadius, outerRadius, index));

  let labelRadius = $derived((innerRadius + outerRadius) / 2);
  let labelAngle = $derived(-Math.PI / 2 + index * ((2 * Math.PI) / 12));
  let labelX = $derived(cx + labelRadius * Math.cos(labelAngle));
  let labelY = $derived(cy + labelRadius * Math.sin(labelAngle));
</script>

<g
  class="wedge {feedbackClass}"
  class:selected={isSelected}
  role="button"
  tabindex="0"
  aria-label="{label}"
  {onclick}
  {onkeydown}
>
  <path
    d={path}
    {fill}
    stroke="white"
    stroke-width="1"
    class="wedge-path"
  />
  <text
    x={labelX}
    y={labelY}
    text-anchor="middle"
    dominant-baseline="central"
    class="wedge-label"
    transform="rotate({-rotation}, {labelX}, {labelY})"
    fill="#1a1a1a"
    font-size={outerRadius > 200 ? 15 : 11}
    font-weight={isSelected ? 700 : 500}
    font-family="'Outfit', sans-serif"
  >
    {label}
  </text>
</g>

<style>
  .wedge {
    cursor: pointer;
    outline: none;
  }

  .wedge-path {
    transition: fill 300ms ease, transform 200ms ease;
  }

  .wedge:hover .wedge-path,
  .wedge:focus-visible .wedge-path {
    filter: brightness(0.95);
  }

  .wedge:focus-visible {
    outline: none;
  }

  .wedge:focus-visible .wedge-path {
    stroke: #e8654a;
    stroke-width: 2;
  }

  .wedge.selected .wedge-path {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  }

  .wedge-label {
    pointer-events: none;
    user-select: none;
  }

  .wedge.quiz-correct .wedge-path {
    animation: flash-correct 1.5s ease;
  }

  .wedge.quiz-wrong .wedge-path {
    animation: flash-wrong 1.5s ease;
  }

  @keyframes flash-correct {
    0%, 100% { fill: inherit; }
    20% { fill: #22c55e; }
    60% { fill: #22c55e; }
  }

  @keyframes flash-wrong {
    0%, 100% { fill: inherit; }
    20% { fill: #ef4444; }
    60% { fill: #ef4444; }
  }

  @media (prefers-reduced-motion: reduce) {
    .wedge-path {
      transition: none;
    }
    .wedge.quiz-correct .wedge-path,
    .wedge.quiz-wrong .wedge-path {
      animation: none;
    }
  }
</style>
```

- [ ] **Step 2: Create CircleOfFifths component (static rendering only)**

Create `src/lib/components/circle-of-fifths/CircleOfFifths.svelte`:

```svelte
<script lang="ts">
  import { KEYS } from '$lib/data/keys';
  import {
    harmonicDistance,
    distanceColor,
    defaultFill
  } from '$lib/utils/circle-math';
  import Wedge from './Wedge.svelte';

  interface Props {
    selectedKey: number | null;
    rotation: number;
    quizFeedback: { index: number; ring: 'major' | 'minor'; result: 'correct' | 'wrong' } | null;
    onselect: (index: number, ring: 'major' | 'minor') => void;
  }

  let { selectedKey, rotation, quizFeedback, onselect }: Props = $props();

  const CX = 300;
  const CY = 300;
  const OUTER_R2 = 280;
  const OUTER_R1 = 195;
  const INNER_R2 = 190;
  const INNER_R1 = 130;

  function majorFill(index: number): string {
    if (selectedKey === null) return defaultFill(false);
    return distanceColor(harmonicDistance(selectedKey, index), false);
  }

  function minorFill(index: number): string {
    if (selectedKey === null) return defaultFill(true);
    return distanceColor(harmonicDistance(selectedKey, index), true);
  }

  function feedbackClass(index: number, ring: 'major' | 'minor'): string {
    if (!quizFeedback) return '';
    if (quizFeedback.index === index && quizFeedback.ring === ring) {
      return `quiz-${quizFeedback.result}`;
    }
    return '';
  }

  function handleKeydown(index: number, ring: 'major' | 'minor', e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onselect(index, ring);
    }
  }
</script>

<svg
  viewBox="0 0 600 600"
  class="w-full max-w-[600px]"
  role="img"
  aria-label="Circle of fifths"
>
  <defs>
    <filter id="wedge-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15" />
    </filter>
  </defs>

  <g transform="rotate({rotation}, {CX}, {CY})">
    <!-- Outer ring (major keys) -->
    {#each KEYS as key}
      <Wedge
        cx={CX}
        cy={CY}
        innerRadius={OUTER_R1}
        outerRadius={OUTER_R2}
        index={key.index}
        label={key.name}
        fill={majorFill(key.index)}
        isSelected={selectedKey === key.index}
        feedbackClass={feedbackClass(key.index, 'major')}
        {rotation}
        onclick={() => onselect(key.index, 'major')}
        onkeydown={(e) => handleKeydown(key.index, 'major', e)}
      />
    {/each}

    <!-- Inner ring (minor keys) -->
    {#each KEYS as key}
      <Wedge
        cx={CX}
        cy={CY}
        innerRadius={INNER_R1}
        outerRadius={INNER_R2}
        index={key.index}
        label={key.minor}
        fill={minorFill(key.index)}
        isSelected={selectedKey === key.index}
        feedbackClass={feedbackClass(key.index, 'minor')}
        {rotation}
        onclick={() => onselect(key.index, 'minor')}
        onkeydown={(e) => handleKeydown(key.index, 'minor', e)}
      />
    {/each}
  </g>
</svg>

<style>
  svg {
    display: block;
    margin: 0 auto;
  }
</style>
```

- [ ] **Step 3: Verify rendering in dev**

Temporarily wire `CircleOfFifths` into the page to verify the SVG renders correctly:

In `src/routes/circle-of-fifths/+page.svelte`, temporarily add:

```svelte
<script lang="ts">
  import CircleOfFifths from '$lib/components/circle-of-fifths/CircleOfFifths.svelte';
</script>

<div class="p-8">
  <CircleOfFifths
    selectedKey={null}
    rotation={0}
    quizFeedback={null}
    onselect={(i, r) => console.log(i, r)}
  />
</div>
```

Open `http://localhost:5173/circle-of-fifths` and verify:
- 12 outer wedges with major key labels (C at top)
- 12 inner wedges with minor key labels
- Wedges are clickable (console logs on click)
- Labels are legible and centered in wedges

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/circle-of-fifths/Wedge.svelte src/lib/components/circle-of-fifths/CircleOfFifths.svelte
git commit -m "feat: add Wedge and CircleOfFifths SVG components with static rendering"
```

---

### Task 6: Selection Highlighting & Connecting Arcs

**Files:**
- Create: `src/lib/components/circle-of-fifths/ConnectingArcs.svelte`

- [ ] **Step 1: Create ConnectingArcs component**

Create `src/lib/components/circle-of-fifths/ConnectingArcs.svelte`:

```svelte
<script lang="ts">
  import { KEYS } from '$lib/data/keys';
  import { wedgeMidpoint, arcPath } from '$lib/utils/circle-math';

  interface Props {
    selectedKey: number | null;
    cx: number;
    cy: number;
    outerMidR: number;
    innerMidR: number;
    visible: boolean;
  }

  let { selectedKey, cx, cy, outerMidR, innerMidR, visible }: Props = $props();

  let arcs = $derived.by(() => {
    if (selectedKey === null) return [];

    const selected = wedgeMidpoint(cx, cy, outerMidR, selectedKey);
    const relMinor = wedgeMidpoint(cx, cy, innerMidR, selectedKey);
    const dominant = wedgeMidpoint(cx, cy, outerMidR, (selectedKey + 1) % 12);
    const subdominant = wedgeMidpoint(cx, cy, outerMidR, (selectedKey + 11) % 12);

    return [
      {
        id: 'relative-minor',
        path: `M${selected.x},${selected.y} L${relMinor.x},${relMinor.y}`,
        color: '#e8654a',
        label: `Relative minor: ${KEYS[selectedKey].minor}`
      },
      {
        id: 'dominant',
        path: arcPath(selected, dominant, cx, cy),
        color: '#0d9488',
        label: `Dominant: ${KEYS[(selectedKey + 1) % 12].name}`
      },
      {
        id: 'subdominant',
        path: arcPath(selected, subdominant, cx, cy),
        color: '#7c3aed',
        label: `Subdominant: ${KEYS[(selectedKey + 11) % 12].name}`
      }
    ];
  });
</script>

{#each arcs as arc}
  <path
    d={arc.path}
    stroke={arc.color}
    stroke-width="2.5"
    fill="none"
    stroke-linecap="round"
    class="connecting-arc"
    class:visible
    aria-label={arc.label}
  >
    <title>{arc.label}</title>
  </path>
{/each}

<style>
  .connecting-arc {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    opacity: 0;
    transition: stroke-dashoffset 400ms ease, opacity 300ms ease;
  }

  .connecting-arc.visible {
    stroke-dashoffset: 0;
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .connecting-arc {
      transition: none;
    }
    .connecting-arc.visible {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }
</style>
```

- [ ] **Step 2: Wire ConnectingArcs into CircleOfFifths**

In `src/lib/components/circle-of-fifths/CircleOfFifths.svelte`, add the import and render ConnectingArcs inside the SVG, after the wedge rings but still inside the rotating `<g>`:

Add to the imports:

```typescript
import ConnectingArcs from './ConnectingArcs.svelte';
```

Add after the inner ring `{#each}` block, still inside the `<g transform="rotate(...)">`:

```svelte
    <!-- Connecting arcs -->
    <ConnectingArcs
      {selectedKey}
      cx={CX}
      cy={CY}
      outerMidR={(OUTER_R1 + OUTER_R2) / 2}
      innerMidR={(INNER_R1 + INNER_R2) / 2}
      visible={selectedKey !== null}
    />
```

- [ ] **Step 3: Verify in dev**

Open browser and click a key. Verify:
- All wedges recolor based on harmonic distance (warm near selected, cool far away)
- Three connecting arcs animate in (coral to minor, teal to dominant, violet to subdominant)
- Clicking a different key smoothly transitions colors and arcs
- Clicking the same key again (or empty space) could deselect — this is handled at page level in Task 10

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/circle-of-fifths/ConnectingArcs.svelte src/lib/components/circle-of-fifths/CircleOfFifths.svelte
git commit -m "feat: add connecting arcs and harmonic distance coloring on selection"
```

---

### Task 7: DetailPanel Component

**Files:**
- Create: `src/lib/components/circle-of-fifths/DetailPanel.svelte`

- [ ] **Step 1: Create DetailPanel component**

Create `src/lib/components/circle-of-fifths/DetailPanel.svelte`:

```svelte
<script lang="ts">
  import { KEYS, type KeyData } from '$lib/data/keys';

  interface Props {
    selectedKey: number | null;
    onnavigate: (index: number) => void;
  }

  let { selectedKey, onnavigate }: Props = $props();

  let key = $derived<KeyData | null>(selectedKey !== null ? KEYS[selectedKey] : null);
  let dominant = $derived(selectedKey !== null ? KEYS[(selectedKey + 1) % 12] : null);
  let subdominant = $derived(selectedKey !== null ? KEYS[(selectedKey + 11) % 12] : null);

  const chordNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
</script>

<div class="bg-bg-card rounded-xl border border-border p-6" aria-live="polite">
  {#if key}
    <div class="space-y-5">
      <!-- Key name -->
      <div>
        <h2 class="text-2xl font-bold text-text-primary">
          {key.name} Major
        </h2>
        {#if key.enharmonic}
          <p class="text-sm text-text-tertiary mt-0.5">
            Enharmonic: {key.enharmonic} Major
          </p>
        {/if}
      </div>

      <!-- Key signature -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
          Key Signature
        </h3>
        <p class="text-sm text-text-secondary">
          {#if key.sharps > 0}
            {key.sharps} sharp{key.sharps > 1 ? 's' : ''}: {key.signatureNotes.join(', ')}
          {:else if key.flats > 0}
            {key.flats} flat{key.flats > 1 ? 's' : ''}: {key.signatureNotes.join(', ')}
          {:else}
            No sharps or flats
          {/if}
        </p>
      </div>

      <!-- Relationships -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
          Relationships
        </h3>
        <div class="space-y-1">
          <button
            class="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors w-full text-left"
            onclick={() => onnavigate(key!.index)}
          >
            <span class="w-2 h-2 rounded-full" style="background-color: #e8654a;"></span>
            Relative minor: {key.minor}
          </button>
          {#if dominant}
            <button
              class="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors w-full text-left"
              onclick={() => onnavigate(dominant!.index)}
            >
              <span class="w-2 h-2 rounded-full" style="background-color: #0d9488;"></span>
              Dominant: {dominant.name}
            </button>
          {/if}
          {#if subdominant}
            <button
              class="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors w-full text-left"
              onclick={() => onnavigate(subdominant!.index)}
            >
              <span class="w-2 h-2 rounded-full" style="background-color: #7c3aed;"></span>
              Subdominant: {subdominant.name}
            </button>
          {/if}
        </div>
      </div>

      <!-- Diatonic chords -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
          Diatonic Chords
        </h3>
        <div class="grid grid-cols-7 gap-1">
          {#each key.chords as chord, i}
            <div class="text-center">
              <div class="text-[10px] text-text-tertiary">{chordNumerals[i]}</div>
              <div class="text-sm font-medium text-text-primary">{chord}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-8">
      <p class="text-sm text-text-tertiary">Click a key to explore</p>
    </div>
  {/if}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/circle-of-fifths/DetailPanel.svelte
git commit -m "feat: add detail panel with key info, relationships, and diatonic chords"
```

---

### Task 8: Explore Mode (Rotation & Drag)

**Files:**
- Modify: `src/lib/components/circle-of-fifths/CircleOfFifths.svelte`

This task adds drag-to-rotate and click-to-center-rotate in explore mode. The rotation value and mode are passed in as props from the page; the component emits rotation deltas.

- [ ] **Step 1: Add drag interaction props and logic to CircleOfFifths**

In `src/lib/components/circle-of-fifths/CircleOfFifths.svelte`, update the Props interface and add drag handling:

Replace the existing `<script>` block entirely:

```svelte
<script lang="ts">
  import { KEYS } from '$lib/data/keys';
  import {
    harmonicDistance,
    distanceColor,
    defaultFill
  } from '$lib/utils/circle-math';
  import Wedge from './Wedge.svelte';
  import ConnectingArcs from './ConnectingArcs.svelte';

  type Mode = 'explore' | 'reference' | 'learn';

  interface Props {
    selectedKey: number | null;
    rotation: number;
    mode: Mode;
    quizFeedback: { index: number; ring: 'major' | 'minor'; result: 'correct' | 'wrong' } | null;
    onselect: (index: number, ring: 'major' | 'minor') => void;
    ondragrotate: (angleDelta: number) => void;
    ondragend: (velocity: number) => void;
  }

  let {
    selectedKey,
    rotation,
    mode,
    quizFeedback,
    onselect,
    ondragrotate,
    ondragend
  }: Props = $props();

  const CX = 300;
  const CY = 300;
  const OUTER_R2 = 280;
  const OUTER_R1 = 195;
  const INNER_R2 = 190;
  const INNER_R1 = 130;

  let svgEl: SVGSVGElement;
  let dragging = $state(false);
  let lastAngle = 0;
  let lastTime = 0;
  let velocity = 0;

  function getAngleFromEvent(e: MouseEvent | Touch): number {
    const rect = svgEl.getBoundingClientRect();
    const scaleX = 600 / rect.width;
    const scaleY = 600 / rect.height;
    const x = (e.clientX - rect.left) * scaleX - CX;
    const y = (e.clientY - rect.top) * scaleY - CY;
    return Math.atan2(y, x) * (180 / Math.PI);
  }

  function handlePointerDown(e: MouseEvent) {
    if (mode !== 'explore') return;
    dragging = true;
    lastAngle = getAngleFromEvent(e);
    lastTime = performance.now();
    velocity = 0;
  }

  function handlePointerMove(e: MouseEvent) {
    if (!dragging) return;
    const currentAngle = getAngleFromEvent(e);
    let delta = currentAngle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) velocity = delta / dt;

    lastAngle = currentAngle;
    lastTime = now;
    ondragrotate(delta);
  }

  function handlePointerUp() {
    if (!dragging) return;
    dragging = false;
    ondragend(velocity * 100);
  }

  function handleTouchStart(e: TouchEvent) {
    if (mode !== 'explore' || e.touches.length !== 1) return;
    dragging = true;
    lastAngle = getAngleFromEvent(e.touches[0]);
    lastTime = performance.now();
    velocity = 0;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!dragging || e.touches.length !== 1) return;
    e.preventDefault();
    const currentAngle = getAngleFromEvent(e.touches[0]);
    let delta = currentAngle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) velocity = delta / dt;

    lastAngle = currentAngle;
    lastTime = now;
    ondragrotate(delta);
  }

  function handleTouchEnd() {
    if (!dragging) return;
    dragging = false;
    ondragend(velocity * 100);
  }

  function majorFill(index: number): string {
    if (selectedKey === null) return defaultFill(false);
    return distanceColor(harmonicDistance(selectedKey, index), false);
  }

  function minorFill(index: number): string {
    if (selectedKey === null) return defaultFill(true);
    return distanceColor(harmonicDistance(selectedKey, index), true);
  }

  function feedbackClass(index: number, ring: 'major' | 'minor'): string {
    if (!quizFeedback) return '';
    if (quizFeedback.index === index && quizFeedback.ring === ring) {
      return `quiz-${quizFeedback.result}`;
    }
    return '';
  }

  function handleKeydown(index: number, ring: 'major' | 'minor', e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onselect(index, ring);
    }
  }
</script>
```

Replace the existing `<svg>` element:

```svelte
<svg
  viewBox="0 0 600 600"
  class="w-full max-w-[600px]"
  class:cursor-grab={mode === 'explore' && !dragging}
  class:cursor-grabbing={mode === 'explore' && dragging}
  role="img"
  aria-label="Circle of fifths"
  bind:this={svgEl}
  onmousedown={handlePointerDown}
  onmousemove={handlePointerMove}
  onmouseup={handlePointerUp}
  onmouseleave={handlePointerUp}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
>
  <defs>
    <filter id="wedge-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15" />
    </filter>
  </defs>

  <g transform="rotate({rotation}, {CX}, {CY})">
    <!-- Outer ring (major keys) -->
    {#each KEYS as key}
      <Wedge
        cx={CX}
        cy={CY}
        innerRadius={OUTER_R1}
        outerRadius={OUTER_R2}
        index={key.index}
        label={key.name}
        fill={majorFill(key.index)}
        isSelected={selectedKey === key.index}
        feedbackClass={feedbackClass(key.index, 'major')}
        {rotation}
        onclick={() => onselect(key.index, 'major')}
        onkeydown={(e) => handleKeydown(key.index, 'major', e)}
      />
    {/each}

    <!-- Inner ring (minor keys) -->
    {#each KEYS as key}
      <Wedge
        cx={CX}
        cy={CY}
        innerRadius={INNER_R1}
        outerRadius={INNER_R2}
        index={key.index}
        label={key.minor}
        fill={minorFill(key.index)}
        isSelected={selectedKey === key.index}
        feedbackClass={feedbackClass(key.index, 'minor')}
        {rotation}
        onclick={() => onselect(key.index, 'minor')}
        onkeydown={(e) => handleKeydown(key.index, 'minor', e)}
      />
    {/each}

    <!-- Connecting arcs -->
    <ConnectingArcs
      {selectedKey}
      cx={CX}
      cy={CY}
      outerMidR={(OUTER_R1 + OUTER_R2) / 2}
      innerMidR={(INNER_R1 + INNER_R2) / 2}
      visible={selectedKey !== null}
    />
  </g>
</svg>
```

Update the `<style>` block:

```svelte
<style>
  svg {
    display: block;
    margin: 0 auto;
    touch-action: none;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/circle-of-fifths/CircleOfFifths.svelte
git commit -m "feat: add drag-to-rotate and touch interaction for explore mode"
```

---

### Task 9: QuizPanel Component

**Files:**
- Create: `src/lib/components/circle-of-fifths/QuizPanel.svelte`

- [ ] **Step 1: Create QuizPanel component**

Create `src/lib/components/circle-of-fifths/QuizPanel.svelte`:

```svelte
<script lang="ts">
  import type { QuizQuestion } from '$lib/utils/quiz';

  interface Props {
    question: QuizQuestion | null;
    score: number;
    total: number;
    feedback: 'correct' | 'wrong' | null;
    onreset: () => void;
  }

  let { question, score, total, feedback, onreset }: Props = $props();
</script>

<div class="bg-bg-card rounded-xl border border-border p-6" aria-live="assertive">
  {#if question}
    <div class="space-y-5">
      <!-- Score -->
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Quiz
        </h3>
        <div class="text-sm font-medium text-text-secondary">
          {score} / {total}
        </div>
      </div>

      <!-- Question -->
      <div>
        <p class="text-lg font-semibold text-text-primary">
          {question.text}
        </p>
        <p class="text-sm text-text-tertiary mt-1">
          Click the answer on the circle
        </p>
      </div>

      <!-- Feedback -->
      {#if feedback}
        <div
          class="text-sm font-medium px-3 py-2 rounded-lg text-center
            {feedback === 'correct'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'}"
        >
          {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong — see the highlighted answer'}
        </div>
      {/if}

      <!-- Reset button -->
      <button
        class="w-full text-sm font-medium text-text-tertiary hover:text-accent
          border border-border rounded-lg px-4 py-2 hover:border-border-hover
          transition-colors"
        onclick={onreset}
      >
        Reset score
      </button>
    </div>
  {:else}
    <div class="text-center py-8">
      <p class="text-sm text-text-tertiary">Starting quiz...</p>
    </div>
  {/if}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/circle-of-fifths/QuizPanel.svelte
git commit -m "feat: add quiz panel with question display, feedback, and score"
```

---

### Task 10: Page Shell, Layout & Wiring

**Files:**
- Modify: `src/routes/circle-of-fifths/+page.svelte`

This task replaces the placeholder page with the full interactive layout, wiring all components together with state management.

- [ ] **Step 1: Replace the placeholder page**

Overwrite `src/routes/circle-of-fifths/+page.svelte` with:

```svelte
<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { KEYS } from '$lib/data/keys';
  import { shortestRotationTo } from '$lib/utils/circle-math';
  import { generateQuestion, type QuizQuestion } from '$lib/utils/quiz';
  import CircleOfFifths from '$lib/components/circle-of-fifths/CircleOfFifths.svelte';
  import DetailPanel from '$lib/components/circle-of-fifths/DetailPanel.svelte';
  import QuizPanel from '$lib/components/circle-of-fifths/QuizPanel.svelte';
  import ModeToggle from '$lib/components/circle-of-fifths/ModeToggle.svelte';

  type Mode = 'explore' | 'reference' | 'learn';

  let selectedKey = $state<number | null>(null);
  let mode = $state<Mode>('reference');

  // Rotation
  const rotation = tweened(0, { duration: 400, easing: cubicOut });
  let rawRotation = 0;

  // Quiz state
  let quizScore = $state(0);
  let quizTotal = $state(0);
  let currentQuestion = $state<QuizQuestion | null>(null);
  let quizFeedback = $state<{
    index: number;
    ring: 'major' | 'minor';
    result: 'correct' | 'wrong';
  } | null>(null);
  let feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  function handleSelect(index: number, ring: 'major' | 'minor') {
    if (mode === 'learn') {
      handleQuizAnswer(index, ring);
      return;
    }

    // Toggle selection: click same key to deselect
    if (selectedKey === index) {
      selectedKey = null;
      return;
    }

    selectedKey = index;

    if (mode === 'explore') {
      // Rotate to put selected key at top
      const targetDeg = -index * 30;
      const delta = shortestRotationTo(rawRotation % 360, targetDeg % 360);
      rawRotation += delta;
      rotation.set(rawRotation);
    }
  }

  function handleNavigate(index: number) {
    selectedKey = index;
    if (mode === 'explore') {
      const targetDeg = -index * 30;
      const delta = shortestRotationTo(rawRotation % 360, targetDeg % 360);
      rawRotation += delta;
      rotation.set(rawRotation);
    }
  }

  function handleDragRotate(delta: number) {
    rawRotation += delta;
    rotation.set(rawRotation, { duration: 0 });
  }

  function handleDragEnd(velocity: number) {
    // Apply momentum
    rawRotation += velocity;
    rotation.set(rawRotation, { duration: 500 });
  }

  function handleModeChange(newMode: Mode) {
    mode = newMode;
    quizFeedback = null;

    if (newMode === 'learn') {
      selectedKey = null;
      quizScore = 0;
      quizTotal = 0;
      currentQuestion = generateQuestion();
    } else if (newMode === 'reference') {
      // Reset rotation for static reference view
      rawRotation = 0;
      rotation.set(0);
      currentQuestion = null;
    } else {
      currentQuestion = null;
    }
  }

  function handleQuizAnswer(index: number, ring: 'major' | 'minor') {
    if (!currentQuestion || quizFeedback) return;

    quizTotal++;
    const isCorrect =
      index === currentQuestion.answerIndex && ring === currentQuestion.answerRing;

    if (isCorrect) quizScore++;

    quizFeedback = { index, ring, result: isCorrect ? 'correct' : 'wrong' };
    selectedKey = currentQuestion.answerIndex;

    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
      quizFeedback = null;
      selectedKey = null;
      currentQuestion = generateQuestion(currentQuestion?.answerIndex);
    }, 1500);
  }

  function handleQuizReset() {
    quizScore = 0;
    quizTotal = 0;
    quizFeedback = null;
    selectedKey = null;
    currentQuestion = generateQuestion();
  }

  function handleKeyboardNav(e: KeyboardEvent) {
    if (mode !== 'explore') return;
    if (e.key === 'ArrowLeft') {
      rawRotation += 30;
      rotation.set(rawRotation);
    } else if (e.key === 'ArrowRight') {
      rawRotation -= 30;
      rotation.set(rawRotation);
    }
  }
</script>

<svelte:head>
  <title>Circle of Fifths — Hans Sach's Musikschule</title>
</svelte:head>

<svelte:window onkeydown={handleKeyboardNav} />

<div class="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
  <div class="animate-in">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center"
        style="background-color: #f0fdfa; color: #0d9488;"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="w-5 h-5"
        >
          <circle cx="10" cy="10" r="7.5" />
          <circle cx="10" cy="10" r="4" />
          <circle cx="10" cy="2.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="10" cy="17.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="2.5" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-text-primary">
        Circle of Fifths
      </h1>
    </div>

    <!-- Mode Toggle -->
    <div class="flex justify-center mb-6">
      <ModeToggle {mode} onchange={handleModeChange} />
    </div>

    <!-- Main layout: circle + panel -->
    <div class="flex flex-col md:flex-row gap-6 items-start">
      <!-- Circle -->
      <div class="w-full md:w-[60%] flex-shrink-0">
        <CircleOfFifths
          {selectedKey}
          rotation={$rotation}
          {mode}
          {quizFeedback}
          onselect={handleSelect}
          ondragrotate={handleDragRotate}
          ondragend={handleDragEnd}
        />
      </div>

      <!-- Side panel -->
      <div class="w-full md:w-[40%]">
        {#if mode === 'learn'}
          <QuizPanel
            question={currentQuestion}
            score={quizScore}
            total={quizTotal}
            feedback={quizFeedback ? quizFeedback.result : null}
            onreset={handleQuizReset}
          />
        {:else}
          <DetailPanel {selectedKey} onnavigate={handleNavigate} />
        {/if}
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Run the dev server and verify all modes**

```bash
npm run dev
```

Open `http://localhost:5173/circle-of-fifths` and verify:

**Reference mode (default):**
- Circle renders statically, no rotation on click
- Click a key → wedges recolor by harmonic distance, arcs animate in, detail panel shows info
- Click relationship buttons in panel → navigates to that key
- Click same key → deselects

**Explore mode:**
- Click a key → circle rotates to center it at top
- Drag the circle → rotates freely with momentum on release
- Left/Right arrow keys → rotate by one key (30°)
- Detail panel updates as keys are selected

**Learn mode:**
- Quiz question appears in panel
- Click correct answer → green flash, score increments
- Click wrong answer → red flash, correct answer highlights
- Auto-advances to next question after 1.5s
- Reset button works

- [ ] **Step 3: Run type check**

```bash
npm run check
```

Expected: no errors

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/circle-of-fifths/+page.svelte
git commit -m "feat: wire up circle of fifths page with all three modes"
```

---

### Task 11: Final Polish — Accessibility & Reduced Motion

**Files:**
- Modify: `src/routes/circle-of-fifths/+page.svelte`
- Modify: `src/lib/components/circle-of-fifths/CircleOfFifths.svelte`

- [ ] **Step 1: Add reduced motion support to page rotation**

In `src/routes/circle-of-fifths/+page.svelte`, update the tweened store creation to respect reduced motion. Add this at the top of the `<script>` block, after imports:

```typescript
import { browser } from '$app/environment';

const prefersReducedMotion = browser
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const rotation = tweened(0, {
  duration: prefersReducedMotion ? 0 : 400,
  easing: cubicOut
});
```

Remove the existing `const rotation = tweened(...)` line (the one without the reduced motion check).

- [ ] **Step 2: Update momentum in handleDragEnd**

In the same file, update `handleDragEnd` to skip momentum when reduced motion is preferred:

```typescript
function handleDragEnd(velocity: number) {
  if (prefersReducedMotion) {
    rotation.set(rawRotation, { duration: 0 });
    return;
  }
  rawRotation += velocity;
  rotation.set(rawRotation, { duration: 500 });
}
```

- [ ] **Step 3: Run type check and tests**

```bash
npm run check && npx vitest run
```

Expected: no errors, all tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/routes/circle-of-fifths/+page.svelte src/lib/components/circle-of-fifths/CircleOfFifths.svelte
git commit -m "feat: add reduced motion support and accessibility polish"
```

---

### Task 12: Build Verification

**Files:** none (verification only)

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: build completes successfully with no errors

- [ ] **Step 2: Preview the built site**

```bash
npm run preview
```

Open the preview URL and verify the circle of fifths page works in the production build (static prerendered).

- [ ] **Step 3: Run all checks one final time**

```bash
npm run check && npx vitest run
```

Expected: all pass

- [ ] **Step 4: Final commit if any fixes were needed**

If any fixes were required during verification, commit them:

```bash
git add -u
git commit -m "fix: address build verification issues"
```
