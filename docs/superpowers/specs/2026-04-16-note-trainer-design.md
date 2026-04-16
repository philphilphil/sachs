# Note Reading Trainer — Design Spec

## Overview

Practice tool for reading notes on the treble clef. Instrument-agnostic with presets for "Staff basics", "Violin 1st position", "Violin 3rd position", and "Piano (custom octave range)". Two modes: Note Identification and Key Signature Identification. VexFlow renders the staff; the rest of the feature follows the existing circle-of-fifths pattern (data / utils / components split).

Route: `/note-trainer` (placeholder page already exists). GitHub issue: #2.

## Layout

```
┌────────────────────────────────────────┐
│  [icon] Note Reading                   │  header
│                                        │
│       [ Note ID | Key Signature ]      │  mode toggle
│                                        │
│   Preset: [Violin 1st position ▼]      │  preset picker
│                                        │
│   ┌──────────────────────────────────┐ │
│   │   VexFlow staff (treble clef)    │ │  staff display
│   │   with key signature + note      │ │
│   └──────────────────────────────────┘ │
│                                        │
│   [answer grid — mode-dependent]       │  answer area
│                                        │
│   Correct: 4/6 · Streak: 2 · Best: 7   │  score bar
└────────────────────────────────────────┘
```

Single-column layout on all widths (the centerpiece is the staff, not a big circle — no sidebar needed). Max content width matches the existing pages (~`max-w-2xl` for narrower variants, extending if required by the staff width).

The preset picker is a compact dropdown. When "Piano" is selected, a small inline control appears next to it with two octave selectors (min / max, clamped 2–7, min ≤ max).

Accent color: violet (`#7c3aed` / `#f5f3ff`) — matches the home page feature card for Note Reading.

## Modes

### Mode A — Note Identification

1. A random key signature is chosen from the preset's `keys` list.
2. A random note is chosen from the preset's `notes` list that is diatonic to that signature (notes on a staff position altered by the signature carry the implied accidental; no per-note accidentals are drawn).
3. VexFlow renders: clef + key signature + the single note.
4. User answers via the letter/accidental grid (see Answer UI below).
5. Instant red/green feedback; auto-advance after ~800ms.

### Mode B — Key Signature Identification

1. A random key signature is chosen from the preset's `keys` list (in the "Staff basics" preset this is only C major, so Mode B is essentially trivial there — acceptable).
2. VexFlow renders: clef + key signature only (no note).
3. User answers via a 12-button grid of all major tonics (C, G, D, A, E, B, F♯, D♭, A♭, E♭, B♭, F).
4. Instant red/green feedback; auto-advance after ~800ms.

Note on the "circle of fifths must be hidden during this mode" requirement from the issue: the note-trainer page does not show the circle of fifths. The requirement is implicitly satisfied. We also avoid textual hints like "2 sharps" that would trivialize the quiz.

## Data Model

File: `src/lib/data/notes.ts`

```typescript
export interface StaffNote {
  letter: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
  octave: number;            // 3..7
}

export interface KeySignature {
  tonic: string;             // "C", "G", "D", "A", "E", "B", "F♯", "D♭", "A♭", "E♭", "B♭", "F"
  type: 'sharp' | 'flat' | 'natural';
  accidentals: string[];     // e.g. ["F♯"], ["B♭", "E♭"]; empty for C major
  vexflowKey: string;        // "C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"
}

export interface Preset {
  id: 'staff-basics' | 'violin-1st' | 'violin-3rd' | 'piano';
  label: string;
  keys: KeySignature[];
  // For fixed presets: a concrete list of notes. For "piano": derived at runtime
  // from the user-selected octave range.
  notes?: StaffNote[];
  octaveRange?: { min: number; max: number };  // piano only
}
```

Preset definitions:

| Preset ID | Label | Note range | Keys |
|---|---|---|---|
| `staff-basics` | Staff basics | E4, F4, G4, A4, B4, C5, D5, E5, F5 (9 on-staff letter positions) | C major |
| `violin-1st` | Violin 1st position | G3–B5 (17 diatonic letter positions; accidentals come from the signature, not drawn per-note) | C, G, D, A |
| `violin-3rd` | Violin 3rd position | G3–E6 (23 diatonic letter positions) | C, G, D, A, F, B♭, E♭ |
| `piano` | Piano | C{min}–B{max} (all 7 letter positions per octave in the selected range) | all 12 major |

The 12 major key signatures follow the standard order of sharps (F♯ C♯ G♯ D♯ A♯ E♯ B♯) and flats (B♭ E♭ A♭ D♭ G♭ C♭ F♭).

## Question Generation

File: `src/lib/utils/note-quiz.ts` (pure functions, unit-tested).

```typescript
export type NoteQuestion = {
  mode: 'note';
  keySignature: KeySignature;
  note: StaffNote;
  correctAnswer: string;    // e.g. "F♯" (sounding pitch given signature)
};

export type KeyQuestion = {
  mode: 'key';
  keySignature: KeySignature;
  correctAnswer: string;    // e.g. "G"
};

export type Question = NoteQuestion | KeyQuestion;

export function generateNoteQuestion(
  preset: Preset,
  previousKeySig?: KeySignature
): NoteQuestion;

export function generateKeyQuestion(
  preset: Preset,
  previousKeySig?: KeySignature
): KeyQuestion;

export function soundingPitch(
  note: StaffNote,
  signature: KeySignature
): string;
```

`soundingPitch` returns the letter plus any implied accidental from the signature (e.g., note F in G major → "F♯"). Natural letters with no matching signature accidental return just the letter.

Question generators should avoid repeating the exact same `(keySignature, note)` pair (or same `keySignature` for Mode B) twice in a row — hence the optional `previousKeySig` parameter and tracking of the previous note in page state.

For the "piano" preset, `generateNoteQuestion` derives `notes` on the fly from `octaveRange` each call (cheap; ~60 notes max).

## Answer UI

### Mode A — Letter grid with accidental pills

```
    ♯    ♯         ♯    ♯    ♯
  ┌───┬───┬───┬───┬───┬───┬───┐
  │ C │ D │ E │ F │ G │ A │ B │
  └───┴───┴───┴───┴───┴───┴───┘
    ♭    ♭         ♭    ♭    ♭
```

- Seven primary letter buttons (equal width) in a row: C, D, E, F, G, A, B.
- A small ♯ pill sits above each letter; a small ♭ pill sits below each letter. Pills are shown on all 7 letters (consistent UI), even though some are musically unusual (e.g., E♯, B♯, C♭, F♭) — clicking a "wrong spelling" pill simply submits that spelling and is marked incorrect.
- Clicking a letter submits that natural (answer string = letter, e.g., "F"); clicking a ♯ pill submits "<letter>♯" (e.g., "F♯"); clicking a ♭ pill submits "<letter>♭" (e.g., "G♭").
- Correct answer strings for a question use the enharmonic convention of the current signature: sharp-key spellings (F♯, C♯, G♯, D♯, A♯) in sharp keys, flat-key spellings (B♭, E♭, A♭, D♭, G♭) in flat keys, naturals only in C major.
- Keyboard shortcuts: `C D E F G A B` answer naturals; holding `Shift` while pressing a letter submits the sharp (e.g., `Shift+F` → F♯); holding `Alt` submits the flat. (Optional for MVP — implement if cheap.)

### Mode B — Major-key grid

A 4×3 grid of 12 buttons, labeled by tonic: `C`, `G`, `D`, `A`, `E`, `B`, `F♯`, `D♭`, `A♭`, `E♭`, `B♭`, `F`. Order follows the circle of fifths clockwise from C. Click submits.

## Feedback

- On click, the selected button gets a green (correct) or red (incorrect) flash, and the correct answer (if wrong) highlights in green for the feedback window.
- Score updates immediately (correct count, streak, best).
- After ~800ms, a new question is generated and the staff + grid reset to the default state.

No explanation text for MVP (chosen approach 6a).

## Score & Persistence

File: `src/lib/utils/note-storage.ts`.

```typescript
export interface ScoreState {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

export function loadBest(presetId: string, mode: 'note' | 'key'): number;
export function saveBest(presetId: string, mode: 'note' | 'key', best: number): void;
```

- Running `correct`, `total`, `streak` live in page state only; they reset when the user changes preset or mode.
- `bestStreak` is persisted to `localStorage` under keys like `note-trainer:best:violin-1st:note`. Only the numeric best is stored (no history, no timestamps).
- Reads are guarded by `if (browser)` to stay compatible with the static adapter.

Piano preset: the persisted best is keyed on the preset id alone (`piano`), not on the chosen octave range. If the user changes the octave range, the score counters reset but the best streak carries. (Simpler and consistent; revisit only if this proves unsatisfying.)

## Component Structure

```
src/lib/components/note-trainer/
  ModeToggle.svelte         — two-option segmented control
  PresetPicker.svelte       — dropdown + octave-range control for piano
  StaffDisplay.svelte       — VexFlow wrapper
  AnswerGrid.svelte         — Mode A letter grid with ♯/♭ pills
  KeyAnswerGrid.svelte      — Mode B 4×3 major-key grid
  ScoreBar.svelte           — correct / streak / best display
  FeedbackFlash.svelte      — small banner or inline state for correct/incorrect

src/lib/data/
  notes.ts                  — presets, key signatures, note lists

src/lib/utils/
  note-quiz.ts              — pure question generation + soundingPitch
  note-storage.ts           — localStorage best-streak persistence

src/routes/note-trainer/
  +page.svelte              — orchestrates state, mode, preset, feedback, scoring
```

Each component takes props + callbacks; no global stores. Matches the existing circle-of-fifths pattern.

## VexFlow Integration

- Package: `vexflow` (install via `npm install vexflow`). Use the v4+ API.
- `StaffDisplay.svelte` owns a `<div>` ref; on prop change it clears the div and re-renders.
- Renders: a single measure with `TrebleClef`, the key signature via `KeySignature`, and either one note (Mode A) or nothing (Mode B).
- SSR safety: VexFlow touches the DOM — all rendering happens inside an `onMount` or `$effect` that is browser-only. Component should render a skeleton placeholder on server.
- Size: staff fits a width of ~480px, centered.

## Error Handling

- If `localStorage` is unavailable (private mode / disabled), `loadBest`/`saveBest` are no-ops and the app runs without persistence. No user-visible error.
- VexFlow errors during render are caught and logged; the staff displays a "Could not render note" fallback. (Unlikely in practice; included for safety.)
- Invalid octave range input (e.g., min > max) is prevented at the UI level (the max select's options clamp to ≥ min).

## Testing

Unit tests (Vitest) mirroring the existing pattern:

- `src/lib/utils/note-quiz.test.ts`
  - `soundingPitch` returns correct accidental for each signature × letter combo.
  - `generateNoteQuestion` only returns notes in the preset's list.
  - `generateNoteQuestion` only uses keys in the preset's list.
  - Generator does not return the same `(keySignature, note)` twice in a row.
  - Piano preset: generator respects octave range.
- `src/lib/data/notes.test.ts`
  - Every `KeySignature.accidentals` is consistent with `type` and `vexflowKey`.
  - Every preset's key list is a subset of the 12-key catalog.
- `src/lib/utils/note-storage.test.ts`
  - `saveBest` / `loadBest` round-trip.
  - Missing key returns 0.
  - Unavailable `localStorage` does not throw.

No component-level tests for MVP (matches existing pattern — circle-of-fifths has none either).

Manual verification checklist (run before merging):
- Dev server starts and `/note-trainer` loads.
- Preset picker shows all four presets; switching updates the staff.
- Piano preset shows octave-range selectors; adjusting them updates the allowed notes.
- Mode A: answer grid present with ♯/♭ pills; clicking a correct letter/pill flashes green and advances.
- Mode B: 12-button major-key grid; clicking the correct key flashes green and advances.
- Score bar updates correctly; best streak persists across reloads.
- No console errors during normal play.
- `npm run check` passes (svelte-check).
- `npm test` passes.

## Scope / Non-Goals

- No audio playback (that is the separate Ear Training issue).
- No bass clef (treble only, matching the issue).
- No minor keys in Mode B.
- No per-note accidentals drawn on the staff (only signature-implied accidentals).
- No user profiles / multi-device sync. Persistence is localStorage only.
- No timing-based scoring (no "beat the clock").
- No difficulty curves / adaptive generation. Random within the preset.

## Open Questions

None remaining for MVP. Anything surfaced above is a deliberate simplification.
