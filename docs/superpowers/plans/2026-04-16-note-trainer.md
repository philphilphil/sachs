# Note Reading Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an instrument-agnostic treble-clef Note Reading Trainer at `/note-trainer` with two modes (Note Identification, Key Signature Identification), preset-driven difficulty (Staff basics / Violin 1st / Violin 3rd / Piano custom range), per-preset-and-mode best-streak persistence in localStorage, and VexFlow notation rendering.

**Architecture:** Mirrors the existing `circle-of-fifths` feature split — static data under `src/lib/data/`, pure functions under `src/lib/utils/` (unit-tested with Vitest), presentational components under `src/lib/components/note-trainer/`, and orchestration in `src/routes/note-trainer/+page.svelte`. VexFlow is dynamically imported and rendered inside a browser-only `$effect` so the static adapter keeps working.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes — `$state`, `$props`, `$effect`), TypeScript, Tailwind 4, VexFlow 4, Vitest.

**Reference spec:** `docs/superpowers/specs/2026-04-16-note-trainer-design.md`

---

## Conventions

- Unicode accidentals `♯`, `♭` (U+266F, U+266D) appear in user-facing strings and in equality checks. Never use ASCII `#` / `b` for answer strings.
- VexFlow uses ASCII names internally (`F#`, `Bb`); those live only inside `StaffDisplay.svelte` and the `vexflowKey` field.
- All files end with a trailing newline.
- Commit after each task with a conventional-commit message; never `git add -A`.

---

## Task 1: Install VexFlow

**Files:**
- Modify: `package.json` (dependencies section added)
- Modify: `package-lock.json`

- [ ] **Step 1: Install vexflow as a runtime dependency**

Run: `npm install vexflow@^4.2.0`

Expected: `package.json` gains a top-level `dependencies` block with `"vexflow": "^4.2.0"` (or similar 4.x version).

- [ ] **Step 2: Verify the app still type-checks**

Run: `npm run check`

Expected: Exits 0 with no errors. (A deprecation warning is OK.)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install vexflow for note trainer"
```

---

## Task 2: Define key-signature and note data

**Files:**
- Create: `src/lib/data/notes.ts`
- Create: `src/lib/data/notes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/data/notes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  KEY_SIGNATURES,
  PRESETS,
  buildPianoPreset,
  type KeySignature,
  type Preset,
  type StaffNote
} from './notes';

describe('KEY_SIGNATURES', () => {
  it('includes all 12 major keys', () => {
    expect(KEY_SIGNATURES).toHaveLength(12);
    const tonics = KEY_SIGNATURES.map((k) => k.tonic);
    expect(tonics).toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F']);
  });

  it('C major has no accidentals and type "natural"', () => {
    const c = KEY_SIGNATURES.find((k) => k.tonic === 'C')!;
    expect(c.accidentals).toEqual([]);
    expect(c.type).toBe('natural');
    expect(c.vexflowKey).toBe('C');
  });

  it('G major has F♯ and type "sharp"', () => {
    const g = KEY_SIGNATURES.find((k) => k.tonic === 'G')!;
    expect(g.accidentals).toEqual(['F♯']);
    expect(g.type).toBe('sharp');
    expect(g.vexflowKey).toBe('G');
  });

  it('D major has F♯ and C♯ in order', () => {
    const d = KEY_SIGNATURES.find((k) => k.tonic === 'D')!;
    expect(d.accidentals).toEqual(['F♯', 'C♯']);
  });

  it('F major has B♭ and type "flat"', () => {
    const f = KEY_SIGNATURES.find((k) => k.tonic === 'F')!;
    expect(f.accidentals).toEqual(['B♭']);
    expect(f.type).toBe('flat');
    expect(f.vexflowKey).toBe('F');
  });

  it('E♭ major has three flats in order', () => {
    const eb = KEY_SIGNATURES.find((k) => k.tonic === 'E♭')!;
    expect(eb.accidentals).toEqual(['B♭', 'E♭', 'A♭']);
    expect(eb.vexflowKey).toBe('Eb');
  });

  it('F♯ major uses "F#" for vexflow and has six sharps', () => {
    const fs = KEY_SIGNATURES.find((k) => k.tonic === 'F♯')!;
    expect(fs.accidentals).toHaveLength(6);
    expect(fs.vexflowKey).toBe('F#');
  });

  it('accidental count matches type for every key', () => {
    for (const k of KEY_SIGNATURES) {
      if (k.type === 'natural') expect(k.accidentals).toHaveLength(0);
      if (k.type === 'sharp') {
        expect(k.accidentals.length).toBeGreaterThan(0);
        k.accidentals.forEach((a) => expect(a).toContain('♯'));
      }
      if (k.type === 'flat') {
        expect(k.accidentals.length).toBeGreaterThan(0);
        k.accidentals.forEach((a) => expect(a).toContain('♭'));
      }
    }
  });
});

describe('PRESETS', () => {
  it('exposes the four fixed presets', () => {
    const ids = PRESETS.map((p) => p.id);
    expect(ids).toEqual(['staff-basics', 'violin-1st', 'violin-3rd', 'piano']);
  });

  it('staff-basics has 9 on-staff notes and C major only', () => {
    const p = PRESETS.find((p) => p.id === 'staff-basics')!;
    expect(p.notes).toHaveLength(9);
    expect(p.keys.map((k) => k.tonic)).toEqual(['C']);
    expect(p.notes![0]).toEqual({ letter: 'E', octave: 4 });
    expect(p.notes![8]).toEqual({ letter: 'F', octave: 5 });
  });

  it('violin-1st has 17 letter positions from G3 to B5', () => {
    const p = PRESETS.find((p) => p.id === 'violin-1st')!;
    expect(p.notes).toHaveLength(17);
    expect(p.notes![0]).toEqual({ letter: 'G', octave: 3 });
    expect(p.notes![16]).toEqual({ letter: 'B', octave: 5 });
    expect(p.keys.map((k) => k.tonic)).toEqual(['C', 'G', 'D', 'A']);
  });

  it('violin-3rd has 20 letter positions from G3 to E6', () => {
    const p = PRESETS.find((p) => p.id === 'violin-3rd')!;
    expect(p.notes).toHaveLength(20);
    expect(p.notes![0]).toEqual({ letter: 'G', octave: 3 });
    expect(p.notes![19]).toEqual({ letter: 'E', octave: 6 });
    expect(p.keys.map((k) => k.tonic)).toEqual(['C', 'G', 'D', 'A', 'F', 'B♭', 'E♭']);
  });

  it('piano preset has an octaveRange and all 12 keys', () => {
    const p = PRESETS.find((p) => p.id === 'piano')!;
    expect(p.octaveRange).toEqual({ min: 3, max: 5 });
    expect(p.keys).toHaveLength(12);
  });
});

describe('buildPianoPreset', () => {
  it('generates C{min} through B{max} notes', () => {
    const p = buildPianoPreset({ min: 4, max: 4 });
    expect(p.notes).toHaveLength(7);
    expect(p.notes![0]).toEqual({ letter: 'C', octave: 4 });
    expect(p.notes![6]).toEqual({ letter: 'B', octave: 4 });
  });

  it('spans multiple octaves', () => {
    const p = buildPianoPreset({ min: 3, max: 5 });
    expect(p.notes).toHaveLength(21);
    expect(p.octaveRange).toEqual({ min: 3, max: 5 });
  });
});
```

- [ ] **Step 2: Run the test — it should fail because `./notes` doesn't exist**

Run: `npm test -- src/lib/data/notes.test.ts`

Expected: FAIL with a module-resolution or missing-export error.

- [ ] **Step 3: Implement the data file**

Create `src/lib/data/notes.ts`:

```typescript
export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface StaffNote {
  letter: Letter;
  octave: number;
}

export interface KeySignature {
  tonic: string;
  type: 'sharp' | 'flat' | 'natural';
  accidentals: string[];
  vexflowKey: string;
}

export type PresetId = 'staff-basics' | 'violin-1st' | 'violin-3rd' | 'piano';

export interface Preset {
  id: PresetId;
  label: string;
  keys: KeySignature[];
  notes?: StaffNote[];
  octaveRange?: { min: number; max: number };
}

const SHARP_ORDER = ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'] as const;
const FLAT_ORDER = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭'] as const;

function makeSharpKey(tonic: string, count: number, vexflowKey: string): KeySignature {
  return {
    tonic,
    type: 'sharp',
    accidentals: SHARP_ORDER.slice(0, count),
    vexflowKey
  };
}

function makeFlatKey(tonic: string, count: number, vexflowKey: string): KeySignature {
  return {
    tonic,
    type: 'flat',
    accidentals: FLAT_ORDER.slice(0, count),
    vexflowKey
  };
}

export const KEY_SIGNATURES: KeySignature[] = [
  { tonic: 'C', type: 'natural', accidentals: [], vexflowKey: 'C' },
  makeSharpKey('G', 1, 'G'),
  makeSharpKey('D', 2, 'D'),
  makeSharpKey('A', 3, 'A'),
  makeSharpKey('E', 4, 'E'),
  makeSharpKey('B', 5, 'B'),
  makeSharpKey('F♯', 6, 'F#'),
  makeFlatKey('D♭', 5, 'Db'),
  makeFlatKey('A♭', 4, 'Ab'),
  makeFlatKey('E♭', 3, 'Eb'),
  makeFlatKey('B♭', 2, 'Bb'),
  makeFlatKey('F', 1, 'F')
];

function keyByTonic(tonic: string): KeySignature {
  const k = KEY_SIGNATURES.find((k) => k.tonic === tonic);
  if (!k) throw new Error(`Unknown tonic: ${tonic}`);
  return k;
}

const LETTERS: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function lettersFrom(start: StaffNote, end: StaffNote): StaffNote[] {
  const result: StaffNote[] = [];
  let octave = start.octave;
  let idx = LETTERS.indexOf(start.letter);

  while (octave < end.octave || (octave === end.octave && idx <= LETTERS.indexOf(end.letter))) {
    result.push({ letter: LETTERS[idx], octave });
    idx++;
    if (idx === LETTERS.length) {
      idx = 0;
      octave++;
    }
  }
  return result;
}

const STAFF_BASICS_NOTES = lettersFrom({ letter: 'E', octave: 4 }, { letter: 'F', octave: 5 });
const VIOLIN_1ST_NOTES = lettersFrom({ letter: 'G', octave: 3 }, { letter: 'B', octave: 5 });
const VIOLIN_3RD_NOTES = lettersFrom({ letter: 'G', octave: 3 }, { letter: 'E', octave: 6 });

export function buildPianoPreset(octaveRange: { min: number; max: number }): Preset {
  const notes = lettersFrom(
    { letter: 'C', octave: octaveRange.min },
    { letter: 'B', octave: octaveRange.max }
  );
  return {
    id: 'piano',
    label: 'Piano',
    keys: KEY_SIGNATURES,
    notes,
    octaveRange
  };
}

export const PRESETS: Preset[] = [
  {
    id: 'staff-basics',
    label: 'Staff basics',
    keys: [keyByTonic('C')],
    notes: STAFF_BASICS_NOTES
  },
  {
    id: 'violin-1st',
    label: 'Violin 1st position',
    keys: ['C', 'G', 'D', 'A'].map(keyByTonic),
    notes: VIOLIN_1ST_NOTES
  },
  {
    id: 'violin-3rd',
    label: 'Violin 3rd position',
    keys: ['C', 'G', 'D', 'A', 'F', 'B♭', 'E♭'].map(keyByTonic),
    notes: VIOLIN_3RD_NOTES
  },
  buildPianoPreset({ min: 3, max: 5 })
];
```

- [ ] **Step 4: Run the test — it should pass**

Run: `npm test -- src/lib/data/notes.test.ts`

Expected: PASS, all cases green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/notes.ts src/lib/data/notes.test.ts
git commit -m "feat: add note-trainer key signatures and preset data"
```

---

## Task 3: Implement `soundingPitch`

**Files:**
- Create: `src/lib/utils/note-quiz.ts`
- Create: `src/lib/utils/note-quiz.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/utils/note-quiz.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { soundingPitch } from './note-quiz';
import { KEY_SIGNATURES } from '$lib/data/notes';

function keyOf(tonic: string) {
  return KEY_SIGNATURES.find((k) => k.tonic === tonic)!;
}

describe('soundingPitch', () => {
  it('returns the bare letter in C major', () => {
    expect(soundingPitch({ letter: 'F', octave: 4 }, keyOf('C'))).toBe('F');
    expect(soundingPitch({ letter: 'B', octave: 4 }, keyOf('C'))).toBe('B');
  });

  it('applies sharp in G major for F only', () => {
    expect(soundingPitch({ letter: 'F', octave: 4 }, keyOf('G'))).toBe('F♯');
    expect(soundingPitch({ letter: 'G', octave: 4 }, keyOf('G'))).toBe('G');
    expect(soundingPitch({ letter: 'C', octave: 4 }, keyOf('G'))).toBe('C');
  });

  it('applies sharps for F and C in D major', () => {
    expect(soundingPitch({ letter: 'F', octave: 4 }, keyOf('D'))).toBe('F♯');
    expect(soundingPitch({ letter: 'C', octave: 4 }, keyOf('D'))).toBe('C♯');
    expect(soundingPitch({ letter: 'D', octave: 4 }, keyOf('D'))).toBe('D');
  });

  it('applies flat for B only in F major', () => {
    expect(soundingPitch({ letter: 'B', octave: 4 }, keyOf('F'))).toBe('B♭');
    expect(soundingPitch({ letter: 'E', octave: 4 }, keyOf('F'))).toBe('E');
  });

  it('applies all three flats in E♭ major', () => {
    expect(soundingPitch({ letter: 'B', octave: 4 }, keyOf('E♭'))).toBe('B♭');
    expect(soundingPitch({ letter: 'E', octave: 4 }, keyOf('E♭'))).toBe('E♭');
    expect(soundingPitch({ letter: 'A', octave: 4 }, keyOf('E♭'))).toBe('A♭');
    expect(soundingPitch({ letter: 'D', octave: 4 }, keyOf('E♭'))).toBe('D');
  });

  it('applies 6 sharps in F♯ major (including E♯)', () => {
    expect(soundingPitch({ letter: 'E', octave: 4 }, keyOf('F♯'))).toBe('E♯');
    expect(soundingPitch({ letter: 'F', octave: 4 }, keyOf('F♯'))).toBe('F♯');
    expect(soundingPitch({ letter: 'B', octave: 4 }, keyOf('F♯'))).toBe('B');
  });
});
```

- [ ] **Step 2: Run the test — it should fail**

Run: `npm test -- src/lib/utils/note-quiz.test.ts`

Expected: FAIL — `soundingPitch` not defined.

- [ ] **Step 3: Implement `soundingPitch`**

Create `src/lib/utils/note-quiz.ts`:

```typescript
import type { KeySignature, StaffNote } from '$lib/data/notes';

export function soundingPitch(note: StaffNote, signature: KeySignature): string {
  const match = signature.accidentals.find((a) => a.startsWith(note.letter));
  return match ?? note.letter;
}
```

- [ ] **Step 4: Run the test — it should pass**

Run: `npm test -- src/lib/utils/note-quiz.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/note-quiz.ts src/lib/utils/note-quiz.test.ts
git commit -m "feat: add soundingPitch utility for key-signature-aware notes"
```

---

## Task 4: Implement `generateNoteQuestion`

**Files:**
- Modify: `src/lib/utils/note-quiz.ts`
- Modify: `src/lib/utils/note-quiz.test.ts`

- [ ] **Step 1: Append failing tests**

Append to `src/lib/utils/note-quiz.test.ts`:

```typescript
import { generateNoteQuestion, type NoteQuestion } from './note-quiz';
import { PRESETS, buildPianoPreset, type Preset } from '$lib/data/notes';

const violin1st = PRESETS.find((p) => p.id === 'violin-1st')!;
const staffBasics = PRESETS.find((p) => p.id === 'staff-basics')!;

describe('generateNoteQuestion', () => {
  it('returns a NoteQuestion with note, keySignature, correctAnswer, mode', () => {
    const q = generateNoteQuestion(staffBasics);
    expect(q.mode).toBe('note');
    expect(q).toHaveProperty('keySignature');
    expect(q).toHaveProperty('note');
    expect(q).toHaveProperty('correctAnswer');
  });

  it('only uses notes from the preset list', () => {
    const allowed = new Set(violin1st.notes!.map((n) => `${n.letter}${n.octave}`));
    for (let i = 0; i < 50; i++) {
      const q = generateNoteQuestion(violin1st);
      expect(allowed.has(`${q.note.letter}${q.note.octave}`)).toBe(true);
    }
  });

  it('only uses keys from the preset list', () => {
    const allowedTonics = new Set(violin1st.keys.map((k) => k.tonic));
    for (let i = 0; i < 50; i++) {
      const q = generateNoteQuestion(violin1st);
      expect(allowedTonics.has(q.keySignature.tonic)).toBe(true);
    }
  });

  it('correctAnswer matches soundingPitch', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateNoteQuestion(violin1st);
      expect(q.correctAnswer).toBe(soundingPitch(q.note, q.keySignature));
    }
  });

  it('does not reuse the same key signature twice in a row', () => {
    const preset = PRESETS.find((p) => p.id === 'violin-3rd')!;
    let prev: NoteQuestion | undefined;
    for (let i = 0; i < 30; i++) {
      const q = generateNoteQuestion(preset, prev?.keySignature);
      if (prev) expect(q.keySignature.tonic).not.toBe(prev.keySignature.tonic);
      prev = q;
    }
  });

  it('piano preset with custom range respects octave bounds', () => {
    const piano = buildPianoPreset({ min: 4, max: 4 });
    for (let i = 0; i < 30; i++) {
      const q = generateNoteQuestion(piano);
      expect(q.note.octave).toBe(4);
    }
  });
});
```

- [ ] **Step 2: Run the tests — new ones fail**

Run: `npm test -- src/lib/utils/note-quiz.test.ts`

Expected: FAIL — `generateNoteQuestion` and `NoteQuestion` not exported.

- [ ] **Step 3: Implement `generateNoteQuestion`**

Append to `src/lib/utils/note-quiz.ts`:

```typescript
import type { Preset } from '$lib/data/notes';

export interface NoteQuestion {
  mode: 'note';
  keySignature: KeySignature;
  note: StaffNote;
  correctAnswer: string;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateNoteQuestion(
  preset: Preset,
  previousKeySig?: KeySignature
): NoteQuestion {
  const notes = preset.notes ?? [];
  if (notes.length === 0) {
    throw new Error(`Preset ${preset.id} has no notes`);
  }

  const allowedKeys =
    previousKeySig && preset.keys.length > 1
      ? preset.keys.filter((k) => k.tonic !== previousKeySig.tonic)
      : preset.keys;

  const keySignature = pickRandom(allowedKeys);
  const note = pickRandom(notes);

  return {
    mode: 'note',
    keySignature,
    note,
    correctAnswer: soundingPitch(note, keySignature)
  };
}
```

(Merge imports at the top of the file — no duplicate import lines.)

- [ ] **Step 4: Run the tests — they should pass**

Run: `npm test -- src/lib/utils/note-quiz.test.ts`

Expected: PASS for all `generateNoteQuestion` cases.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/note-quiz.ts src/lib/utils/note-quiz.test.ts
git commit -m "feat: add generateNoteQuestion for mode A"
```

---

## Task 5: Implement `generateKeyQuestion`

**Files:**
- Modify: `src/lib/utils/note-quiz.ts`
- Modify: `src/lib/utils/note-quiz.test.ts`

- [ ] **Step 1: Append failing tests**

Append to `src/lib/utils/note-quiz.test.ts`:

```typescript
import { generateKeyQuestion } from './note-quiz';

describe('generateKeyQuestion', () => {
  it('returns a KeyQuestion with mode, keySignature, correctAnswer', () => {
    const q = generateKeyQuestion(PRESETS.find((p) => p.id === 'piano')!);
    expect(q.mode).toBe('key');
    expect(q.correctAnswer).toBe(q.keySignature.tonic);
  });

  it('only uses keys from the preset', () => {
    const preset = PRESETS.find((p) => p.id === 'violin-1st')!;
    const allowed = new Set(preset.keys.map((k) => k.tonic));
    for (let i = 0; i < 50; i++) {
      const q = generateKeyQuestion(preset);
      expect(allowed.has(q.keySignature.tonic)).toBe(true);
    }
  });

  it('does not reuse the same key signature twice in a row when multiple keys exist', () => {
    const preset = PRESETS.find((p) => p.id === 'piano')!;
    let prev: { keySignature: KeySignature } | undefined;
    for (let i = 0; i < 30; i++) {
      const q = generateKeyQuestion(preset, prev?.keySignature);
      if (prev) expect(q.keySignature.tonic).not.toBe(prev.keySignature.tonic);
      prev = q;
    }
  });

  it('returns the only available key when the preset has just one', () => {
    const preset = PRESETS.find((p) => p.id === 'staff-basics')!;
    const q = generateKeyQuestion(preset);
    expect(q.keySignature.tonic).toBe('C');
  });
});
```

- [ ] **Step 2: Run tests — they fail**

Run: `npm test -- src/lib/utils/note-quiz.test.ts`

Expected: FAIL — `generateKeyQuestion` not defined.

- [ ] **Step 3: Implement `generateKeyQuestion`**

Append to `src/lib/utils/note-quiz.ts`:

```typescript
export interface KeyQuestion {
  mode: 'key';
  keySignature: KeySignature;
  correctAnswer: string;
}

export type Question = NoteQuestion | KeyQuestion;

export function generateKeyQuestion(
  preset: Preset,
  previousKeySig?: KeySignature
): KeyQuestion {
  const allowedKeys =
    previousKeySig && preset.keys.length > 1
      ? preset.keys.filter((k) => k.tonic !== previousKeySig.tonic)
      : preset.keys;

  const keySignature = pickRandom(allowedKeys);

  return {
    mode: 'key',
    keySignature,
    correctAnswer: keySignature.tonic
  };
}
```

- [ ] **Step 4: Run tests — they pass**

Run: `npm test`

Expected: PASS for all note-quiz and notes tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/note-quiz.ts src/lib/utils/note-quiz.test.ts
git commit -m "feat: add generateKeyQuestion for mode B"
```

---

## Task 6: Implement best-streak localStorage persistence

**Files:**
- Create: `src/lib/utils/note-storage.ts`
- Create: `src/lib/utils/note-storage.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/utils/note-storage.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
```

- [ ] **Step 2: Run — tests fail (module missing)**

Run: `npm test -- src/lib/utils/note-storage.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement `note-storage.ts`**

Create `src/lib/utils/note-storage.ts`:

```typescript
export type QuizMode = 'note' | 'key';

function keyFor(presetId: string, mode: QuizMode): string {
  return `note-trainer:best:${presetId}:${mode}`;
}

export function loadBest(presetId: string, mode: QuizMode): number {
  try {
    const raw = localStorage.getItem(keyFor(presetId, mode));
    if (raw === null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function saveBest(presetId: string, mode: QuizMode, best: number): void {
  try {
    localStorage.setItem(keyFor(presetId, mode), String(best));
  } catch {
    // localStorage disabled — silently ignore.
  }
}
```

- [ ] **Step 4: Run — tests pass**

Run: `npm test -- src/lib/utils/note-storage.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/note-storage.ts src/lib/utils/note-storage.test.ts
git commit -m "feat: add note-trainer best-streak localStorage persistence"
```

---

## Task 7: Build `ModeToggle.svelte`

**Files:**
- Create: `src/lib/components/note-trainer/ModeToggle.svelte`

- [ ] **Step 1: Create the component**

Create `src/lib/components/note-trainer/ModeToggle.svelte`:

```svelte
<script lang="ts">
  import type { QuizMode } from '$lib/utils/note-storage';

  interface Props {
    mode: QuizMode;
    onchange: (mode: QuizMode) => void;
  }

  let { mode, onchange }: Props = $props();

  const modes: { value: QuizMode; label: string }[] = [
    { value: 'note', label: 'Note Identification' },
    { value: 'key', label: 'Key Signature' }
  ];
</script>

<div
  class="inline-flex rounded-lg border border-border bg-bg-card p-0.5"
  role="radiogroup"
  aria-label="Mode"
>
  {#each modes as m}
    <button
      role="radio"
      aria-checked={mode === m.value}
      class="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        {mode === m.value
        ? 'text-white shadow-sm'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'}"
      style={mode === m.value ? 'background-color: #7c3aed;' : ''}
      onclick={() => onchange(m.value)}
    >
      {m.label}
    </button>
  {/each}
</div>
```

- [ ] **Step 2: Type-check**

Run: `npm run check`

Expected: Exits 0. (Tailwind classes are not type-checked; svelte-check validates the script block.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/note-trainer/ModeToggle.svelte
git commit -m "feat: add note-trainer mode toggle component"
```

---

## Task 8: Build `PresetPicker.svelte`

**Files:**
- Create: `src/lib/components/note-trainer/PresetPicker.svelte`

- [ ] **Step 1: Create the component**

Create `src/lib/components/note-trainer/PresetPicker.svelte`:

```svelte
<script lang="ts">
  import { PRESETS, type PresetId } from '$lib/data/notes';

  interface Props {
    presetId: PresetId;
    octaveRange: { min: number; max: number };
    onpresetchange: (id: PresetId) => void;
    onrangechange: (range: { min: number; max: number }) => void;
  }

  let { presetId, octaveRange, onpresetchange, onrangechange }: Props = $props();

  const OCTAVE_OPTIONS = [2, 3, 4, 5, 6, 7];

  function handlePresetSelect(e: Event) {
    const id = (e.target as HTMLSelectElement).value as PresetId;
    onpresetchange(id);
  }

  function handleMinChange(e: Event) {
    const min = Number((e.target as HTMLSelectElement).value);
    const max = Math.max(min, octaveRange.max);
    onrangechange({ min, max });
  }

  function handleMaxChange(e: Event) {
    const max = Number((e.target as HTMLSelectElement).value);
    const min = Math.min(max, octaveRange.min);
    onrangechange({ min, max });
  }
</script>

<div class="flex flex-wrap items-center gap-3">
  <label class="flex items-center gap-2 text-sm">
    <span class="text-text-secondary">Preset</span>
    <select
      class="px-3 py-1.5 rounded-lg border border-border bg-bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
      value={presetId}
      onchange={handlePresetSelect}
    >
      {#each PRESETS as p}
        <option value={p.id}>{p.label}</option>
      {/each}
    </select>
  </label>

  {#if presetId === 'piano'}
    <label class="flex items-center gap-2 text-sm">
      <span class="text-text-secondary">Range</span>
      <select
        class="px-2 py-1.5 rounded-lg border border-border bg-bg-card text-text-primary text-sm"
        value={octaveRange.min}
        onchange={handleMinChange}
        aria-label="Lowest octave"
      >
        {#each OCTAVE_OPTIONS as o}
          <option value={o}>C{o}</option>
        {/each}
      </select>
      <span class="text-text-tertiary">to</span>
      <select
        class="px-2 py-1.5 rounded-lg border border-border bg-bg-card text-text-primary text-sm"
        value={octaveRange.max}
        onchange={handleMaxChange}
        aria-label="Highest octave"
      >
        {#each OCTAVE_OPTIONS as o}
          <option value={o}>B{o}</option>
        {/each}
      </select>
    </label>
  {/if}
</div>
```

- [ ] **Step 2: Type-check**

Run: `npm run check`

Expected: Exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/note-trainer/PresetPicker.svelte
git commit -m "feat: add note-trainer preset picker with piano octave range"
```

---

## Task 9: Build `StaffDisplay.svelte` (VexFlow wrapper)

**Files:**
- Create: `src/lib/components/note-trainer/StaffDisplay.svelte`

- [ ] **Step 1: Create the component**

Create `src/lib/components/note-trainer/StaffDisplay.svelte`:

```svelte
<script lang="ts">
  import type { KeySignature, StaffNote } from '$lib/data/notes';

  interface Props {
    keySignature: KeySignature;
    note: StaffNote | null;
  }

  let { keySignature, note }: Props = $props();

  let container: HTMLDivElement;

  async function render() {
    if (!container) return;
    container.innerHTML = '';

    try {
      const vexflow = await import('vexflow');
      const { Factory, StaveNote, Voice, Formatter, Accidental } = vexflow;

      const factory = new Factory({
        renderer: { elementId: container, width: 480, height: 160 }
      });

      const system = factory.System({
        x: 10,
        y: 10,
        width: 460,
        spaceBetweenStaves: 10
      });

      const stave = system
        .addStave({ voices: [] })
        .addClef('treble')
        .addKeySignature(keySignature.vexflowKey);

      if (note) {
        const staveNote = new StaveNote({
          clef: 'treble',
          keys: [`${note.letter.toLowerCase()}/${note.octave}`],
          duration: 'w'
        });

        // VexFlow handles key-signature accidentals automatically when the
        // stave's key is set and Accidental.applyAccidentals is called on
        // a voice-by-voice basis.
        const voice = new Voice({ numBeats: 4, beatValue: 4 })
          .setStrict(false)
          .addTickables([staveNote]);

        Accidental.applyAccidentals([voice], keySignature.vexflowKey);

        new Formatter().joinVoices([voice]).format([voice], 360);
        stave.setContext(factory.getContext()).draw();
        voice.draw(factory.getContext(), stave);
      } else {
        factory.draw();
      }
    } catch (err) {
      console.error('VexFlow render failed', err);
      container.innerHTML =
        '<p class="text-sm text-text-tertiary text-center">Could not render staff</p>';
    }
  }

  $effect(() => {
    // Re-run whenever keySignature or note changes.
    void keySignature;
    void note;
    render();
  });
</script>

<div class="flex justify-center">
  <div bind:this={container} class="inline-block"></div>
</div>
```

- [ ] **Step 2: Type-check**

Run: `npm run check`

Expected: Exits 0. If svelte-check reports type errors from the vexflow import (it may — vexflow's types sometimes diverge by minor version), widen the import to `const mod: any = await import('vexflow')` and destructure from `mod`. Commit only after a clean `npm run check`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/note-trainer/StaffDisplay.svelte
git commit -m "feat: add VexFlow staff display component"
```

---

## Task 10: Build `AnswerGrid.svelte` (Mode A)

**Files:**
- Create: `src/lib/components/note-trainer/AnswerGrid.svelte`

- [ ] **Step 1: Create the component**

Create `src/lib/components/note-trainer/AnswerGrid.svelte`:

```svelte
<script lang="ts">
  type Feedback = { answer: string; correct: boolean } | null;

  interface Props {
    correctAnswer: string;
    feedback: Feedback;
    onanswer: (answer: string) => void;
  }

  let { correctAnswer, feedback, onanswer }: Props = $props();

  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  function stateFor(answer: string): 'neutral' | 'correct' | 'incorrect' | 'reveal' {
    if (!feedback) return 'neutral';
    if (feedback.answer === answer) return feedback.correct ? 'correct' : 'incorrect';
    if (!feedback.correct && answer === correctAnswer) return 'reveal';
    return 'neutral';
  }

  function classFor(state: ReturnType<typeof stateFor>): string {
    switch (state) {
      case 'correct':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'incorrect':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'reveal':
        return 'bg-green-50 border-green-300 text-green-700';
      default:
        return 'bg-bg-card border-border text-text-primary hover:border-border-hover';
    }
  }

  function pillClassFor(state: ReturnType<typeof stateFor>): string {
    switch (state) {
      case 'correct':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'incorrect':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'reveal':
        return 'bg-green-50 border-green-300 text-green-700';
      default:
        return 'bg-bg-card border-border text-text-tertiary hover:text-text-primary hover:border-border-hover';
    }
  }

  const disabled = $derived(feedback !== null);
</script>

<div class="flex justify-center gap-2">
  {#each LETTERS as letter}
    {@const sharpAnswer = `${letter}♯`}
    {@const flatAnswer = `${letter}♭`}
    <div class="flex flex-col items-center gap-1">
      <button
        aria-label={sharpAnswer}
        {disabled}
        class="w-10 h-6 text-xs rounded-md border font-medium transition-colors {pillClassFor(stateFor(sharpAnswer))} disabled:cursor-not-allowed"
        onclick={() => onanswer(sharpAnswer)}
      >
        ♯
      </button>
      <button
        aria-label={letter}
        {disabled}
        class="w-14 h-14 rounded-lg border text-lg font-semibold transition-colors {classFor(stateFor(letter))} disabled:cursor-not-allowed"
        onclick={() => onanswer(letter)}
      >
        {letter}
      </button>
      <button
        aria-label={flatAnswer}
        {disabled}
        class="w-10 h-6 text-xs rounded-md border font-medium transition-colors {pillClassFor(stateFor(flatAnswer))} disabled:cursor-not-allowed"
        onclick={() => onanswer(flatAnswer)}
      >
        ♭
      </button>
    </div>
  {/each}
</div>
```

- [ ] **Step 2: Type-check**

Run: `npm run check`

Expected: Exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/note-trainer/AnswerGrid.svelte
git commit -m "feat: add mode A answer grid with sharp/flat pills"
```

---

## Task 11: Build `KeyAnswerGrid.svelte` (Mode B)

**Files:**
- Create: `src/lib/components/note-trainer/KeyAnswerGrid.svelte`

- [ ] **Step 1: Create the component**

Create `src/lib/components/note-trainer/KeyAnswerGrid.svelte`:

```svelte
<script lang="ts">
  type Feedback = { answer: string; correct: boolean } | null;

  interface Props {
    correctAnswer: string;
    feedback: Feedback;
    onanswer: (answer: string) => void;
  }

  let { correctAnswer, feedback, onanswer }: Props = $props();

  const KEYS = [
    'C', 'G', 'D', 'A',
    'E', 'B', 'F♯', 'D♭',
    'A♭', 'E♭', 'B♭', 'F'
  ];

  function stateFor(answer: string): 'neutral' | 'correct' | 'incorrect' | 'reveal' {
    if (!feedback) return 'neutral';
    if (feedback.answer === answer) return feedback.correct ? 'correct' : 'incorrect';
    if (!feedback.correct && answer === correctAnswer) return 'reveal';
    return 'neutral';
  }

  function classFor(state: ReturnType<typeof stateFor>): string {
    switch (state) {
      case 'correct':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'incorrect':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'reveal':
        return 'bg-green-50 border-green-300 text-green-700';
      default:
        return 'bg-bg-card border-border text-text-primary hover:border-border-hover';
    }
  }

  const disabled = $derived(feedback !== null);
</script>

<div class="grid grid-cols-4 gap-2 max-w-md mx-auto">
  {#each KEYS as k}
    <button
      {disabled}
      class="h-14 rounded-lg border text-base font-semibold transition-colors {classFor(stateFor(k))} disabled:cursor-not-allowed"
      onclick={() => onanswer(k)}
    >
      {k}
    </button>
  {/each}
</div>
```

- [ ] **Step 2: Type-check**

Run: `npm run check`

Expected: Exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/note-trainer/KeyAnswerGrid.svelte
git commit -m "feat: add mode B key-signature answer grid"
```

---

## Task 12: Build `ScoreBar.svelte`

**Files:**
- Create: `src/lib/components/note-trainer/ScoreBar.svelte`

- [ ] **Step 1: Create the component**

Create `src/lib/components/note-trainer/ScoreBar.svelte`:

```svelte
<script lang="ts">
  interface Props {
    correct: number;
    total: number;
    streak: number;
    bestStreak: number;
  }

  let { correct, total, streak, bestStreak }: Props = $props();
</script>

<div class="flex items-center justify-center gap-4 text-sm text-text-secondary">
  <span>Correct: <strong class="text-text-primary font-semibold">{correct} / {total}</strong></span>
  <span class="text-text-tertiary">·</span>
  <span>Streak: <strong class="text-text-primary font-semibold">{streak}</strong></span>
  <span class="text-text-tertiary">·</span>
  <span>Best: <strong class="text-text-primary font-semibold">{bestStreak}</strong></span>
</div>
```

- [ ] **Step 2: Type-check**

Run: `npm run check`

Expected: Exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/note-trainer/ScoreBar.svelte
git commit -m "feat: add note-trainer score bar"
```

---

## Task 13: Wire up `+page.svelte`

**Files:**
- Modify: `src/routes/note-trainer/+page.svelte` (full rewrite — the current file is just a placeholder)

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `src/routes/note-trainer/+page.svelte` with:

```svelte
<script lang="ts">
  import { browser } from '$app/environment';
  import {
    PRESETS,
    buildPianoPreset,
    type Preset,
    type PresetId,
    type KeySignature,
    type StaffNote
  } from '$lib/data/notes';
  import {
    generateNoteQuestion,
    generateKeyQuestion,
    type NoteQuestion,
    type KeyQuestion
  } from '$lib/utils/note-quiz';
  import { loadBest, saveBest, type QuizMode } from '$lib/utils/note-storage';

  import ModeToggle from '$lib/components/note-trainer/ModeToggle.svelte';
  import PresetPicker from '$lib/components/note-trainer/PresetPicker.svelte';
  import StaffDisplay from '$lib/components/note-trainer/StaffDisplay.svelte';
  import AnswerGrid from '$lib/components/note-trainer/AnswerGrid.svelte';
  import KeyAnswerGrid from '$lib/components/note-trainer/KeyAnswerGrid.svelte';
  import ScoreBar from '$lib/components/note-trainer/ScoreBar.svelte';

  let mode = $state<QuizMode>('note');
  let presetId = $state<PresetId>('violin-1st');
  let octaveRange = $state<{ min: number; max: number }>({ min: 3, max: 5 });

  let correct = $state(0);
  let total = $state(0);
  let streak = $state(0);
  let bestStreak = $state(0);

  let noteQuestion = $state<NoteQuestion | null>(null);
  let keyQuestion = $state<KeyQuestion | null>(null);
  let feedback = $state<{ answer: string; correct: boolean } | null>(null);

  let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  function currentPreset(): Preset {
    if (presetId === 'piano') return buildPianoPreset(octaveRange);
    return PRESETS.find((p) => p.id === presetId)!;
  }

  function previousKeySig(): KeySignature | undefined {
    if (mode === 'note') return noteQuestion?.keySignature;
    return keyQuestion?.keySignature;
  }

  function nextQuestion() {
    const preset = currentPreset();
    if (mode === 'note') {
      noteQuestion = generateNoteQuestion(preset, previousKeySig());
      keyQuestion = null;
    } else {
      keyQuestion = generateKeyQuestion(preset, previousKeySig());
      noteQuestion = null;
    }
    feedback = null;
  }

  function resetSession() {
    correct = 0;
    total = 0;
    streak = 0;
    bestStreak = browser ? loadBest(presetId, mode) : 0;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = null;
    nextQuestion();
  }

  function handleAnswer(answer: string) {
    if (feedback !== null) return;
    const target =
      mode === 'note' ? noteQuestion?.correctAnswer : keyQuestion?.correctAnswer;
    if (!target) return;

    const isCorrect = answer === target;
    feedback = { answer, correct: isCorrect };
    total += 1;
    if (isCorrect) {
      correct += 1;
      streak += 1;
      if (streak > bestStreak) {
        bestStreak = streak;
        if (browser) saveBest(presetId, mode, bestStreak);
      }
    } else {
      streak = 0;
    }

    feedbackTimer = setTimeout(() => {
      feedbackTimer = null;
      nextQuestion();
    }, 800);
  }

  function handleModeChange(newMode: QuizMode) {
    mode = newMode;
    resetSession();
  }

  function handlePresetChange(id: PresetId) {
    presetId = id;
    resetSession();
  }

  function handleRangeChange(range: { min: number; max: number }) {
    octaveRange = range;
    // Keep the best streak for "piano" mode; only restart the counter.
    correct = 0;
    total = 0;
    streak = 0;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = null;
    nextQuestion();
  }

  $effect(() => {
    if (browser && noteQuestion === null && keyQuestion === null) {
      resetSession();
    }
  });
</script>

<svelte:head>
  <title>Note Reading — Hans Sach's Musikschule</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
  <div class="animate-in">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center"
        style="background-color: #f5f3ff; color: #7c3aed;"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path d="M13 3v10.27a2.5 2.5 0 1 1-2-2.45V5.5L13 3z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-text-primary">
        Note Reading
      </h1>
    </div>

    <!-- Mode toggle -->
    <div class="flex justify-center mb-4">
      <ModeToggle {mode} onchange={handleModeChange} />
    </div>

    <!-- Preset picker -->
    <div class="flex justify-center mb-6">
      <PresetPicker
        {presetId}
        {octaveRange}
        onpresetchange={handlePresetChange}
        onrangechange={handleRangeChange}
      />
    </div>

    <!-- Staff -->
    <div class="bg-bg-card rounded-xl border border-border p-4 mb-6 min-h-[180px] flex items-center justify-center">
      {#if mode === 'note' && noteQuestion}
        <StaffDisplay
          keySignature={noteQuestion.keySignature}
          note={noteQuestion.note}
        />
      {:else if mode === 'key' && keyQuestion}
        <StaffDisplay
          keySignature={keyQuestion.keySignature}
          note={null}
        />
      {:else}
        <p class="text-sm text-text-tertiary">Loading…</p>
      {/if}
    </div>

    <!-- Answer grid -->
    <div class="mb-6">
      {#if mode === 'note' && noteQuestion}
        <AnswerGrid
          correctAnswer={noteQuestion.correctAnswer}
          {feedback}
          onanswer={handleAnswer}
        />
      {:else if mode === 'key' && keyQuestion}
        <KeyAnswerGrid
          correctAnswer={keyQuestion.correctAnswer}
          {feedback}
          onanswer={handleAnswer}
        />
      {/if}
    </div>

    <!-- Score -->
    <ScoreBar {correct} {total} {streak} {bestStreak} />
  </div>
</div>
```

- [ ] **Step 2: Type-check**

Run: `npm run check`

Expected: Exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/routes/note-trainer/+page.svelte
git commit -m "feat: wire up note-trainer page with modes, presets, scoring"
```

---

## Task 14: Manual verification

**Files:** (no code changes)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Open the page**

Visit `http://localhost:5173/note-trainer`.

Expected:
- Header "Note Reading" renders with violet icon.
- Two-option mode toggle (Note Identification / Key Signature).
- Preset dropdown defaults to "Violin 1st position".
- Staff panel renders a treble clef with a random key signature from {C, G, D, A} and a single whole-note.

- [ ] **Step 3: Exercise Mode A**

Click letter / ♯ / ♭ buttons. Verify:
- Correct click flashes green; wrong click flashes red and highlights the correct button in green.
- ~800ms later, a new question appears.
- Correct count, streak, best all update as expected.
- Reloading the page preserves Best across reloads (but resets correct/total/streak).

- [ ] **Step 4: Exercise Mode B**

Switch to "Key Signature". Verify:
- Staff shows a key signature only (no note).
- 12-button grid renders.
- Answering works; feedback + advance work as in Mode A.
- Best streak for Mode B is tracked separately from Mode A.

- [ ] **Step 5: Exercise presets**

Switch to "Piano". Verify:
- Octave range selectors appear.
- Changing min/max updates the notes shown over several questions.
- Questions draw from all 12 keys over time (sample 15+ questions).

Switch to "Staff basics" and "Violin 3rd position" briefly; verify the staff renders for each.

- [ ] **Step 6: Run the full test suite**

Stop the dev server. Run:
```
npm run check
npm test
```

Expected: both exit 0.

- [ ] **Step 7: Commit manual-verification nothing-to-commit check**

Run `git status` — there should be no changes. If there are, investigate before proceeding.

---

## Self-Review Checklist

- [x] Every spec section is covered:
  - Layout → Task 13 (+page.svelte)
  - Data model → Task 2 (notes.ts)
  - Question generation + `soundingPitch` → Tasks 3, 4, 5
  - Mode A answer UI with ♯/♭ pills → Task 10
  - Mode B 12-key grid → Task 11
  - Feedback + auto-advance → Task 13 (handleAnswer + setTimeout)
  - Score + persistence → Tasks 6, 12, 13
  - VexFlow integration → Task 9
  - Error handling (localStorage / VexFlow fallback) → Tasks 6, 9
  - Testing → Tasks 2, 3, 4, 5, 6 (unit tests), 14 (manual)
  - Scope / non-goals → no tasks needed (exclusions)
- [x] No "TBD" / "TODO" / "handle edge cases" style placeholders.
- [x] Types align across tasks: `QuizMode`, `PresetId`, `KeySignature`, `StaffNote`, `Preset`, `NoteQuestion`, `KeyQuestion` are all defined once and imported consistently.
- [x] Every code step contains the actual code (no "similar to Task N" handwaves).
- [x] Commit messages are conventional-commit style, matching the repo history.
