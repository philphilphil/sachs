# Circle of Fifths — Design Spec

## Overview

Interactive circle of fifths visualization for Hans Sach's Musikschule. Three modes in one view: explore (rotate and discover), reference (click to see relationships), and learn (quiz). Rendered as pure SVG with Svelte 5 reactivity.

Route: `/circle-of-fifths` (placeholder page already exists).

## Layout

Large immersive circle as centerpiece with a detail sidebar (desktop: side-by-side, mobile: stacked). A segmented toggle above the circle switches between Explore / Reference / Learn modes.

- **Desktop**: Circle takes ~60% width, detail panel ~40% on the right
- **Mobile**: Circle fills width, detail panel stacks below
- Segmented toggle sits above the circle, centered

## Data Model

### Key Data

A single array of 12 keys in circle-of-fifths order. Each entry:

```typescript
interface KeyData {
  name: string;           // "C", "G", "D", etc.
  minor: string;          // "Am", "Em", "Bm", etc.
  enharmonic: string | null; // "G♭" for F♯, null if none
  sharps: number;         // 0–6 positive = sharps
  flats: number;          // 0–6 positive = flats
  index: number;          // 0–11 position on circle
}
```

Order: C (0), G (1), D (2), A (3), E (4), B (5), F♯/G♭ (6), D♭/C♯ (7), A♭ (8), E♭ (9), B♭ (10), F (11).

### Harmonic Distance

Shortest path around the circle between two keys:

```
distance(a, b) = Math.min(Math.abs(a - b), 12 - Math.abs(a - b))
```

Returns 0–6. Drives the color gradient: 0 = full accent, 6 = coolest/most distant.

### Derived Relationships

From any selected key (index `i`):
- **Relative minor**: inner ring partner at same index
- **Dominant**: index `(i + 1) % 12`
- **Subdominant**: index `(i + 11) % 12`
- **Enharmonic equivalent**: from the key's `enharmonic` field

## SVG Circle Structure

### Rings

Two concentric rings of 12 wedge segments each, drawn as SVG `<path>` arcs:

- **Outer ring** (major keys): radius 200–300, 30° per wedge, text label centered in each wedge
- **Inner ring** (minor keys): radius 130–200, 30° per wedge, smaller text labels

C major sits at 12 o'clock (top, -90° offset from standard math angles).

### ViewBox and Sizing

- SVG `viewBox="0 0 600 600"`, center at (300, 300)
- CSS: `width: 100%; max-width: 600px` — scales responsively, always crisp

### Wedge Path Generation

Each wedge computed from `startAngle` and `endAngle` using standard SVG arc commands. Small gap (1–2°) between wedges for visual separation.

## Visual Behavior

### Selection Highlighting

When a key is selected:

1. **Harmonic distance coloring** — every wedge recolors based on its distance from the selected key. Close keys get warm accent tones (using the project's coral/teal palette), distant keys fade to cool muted tones. This creates an at-a-glance map of harmonic relationships.

2. **Connecting arcs** — SVG `<path>` arcs draw between:
   - Selected key ↔ relative minor (short arc, accent color)
   - Selected key ↔ dominant (clockwise arc, teal)
   - Selected key ↔ subdominant (counter-clockwise arc, violet)

3. **Inner ring sync** — the relative minor wedge highlights with a matched accent color.

4. **Selected wedge** — scale up slightly (1.05x), full accent color, elevated with a subtle drop shadow filter.

### Connecting Arc Animation

Arcs animate in using CSS `stroke-dasharray` / `stroke-dashoffset` transitions (~300ms). On deselection, arcs fade out with opacity transition.

### Rotation

The entire circle `<g>` group rotates via `transform: rotate()` driven by a Svelte `tweened` store (eased, ~400ms). When a key is selected, the circle rotates to place it at the top (12 o'clock). The rotation takes the shortest path (clockwise or counter-clockwise).

### Color Palette

Built on the existing design tokens:
- Distance 0 (selected): `--color-accent` (#e8654a)
- Distance 1: warm coral light
- Distance 2–3: transition through `--color-teal`, `--color-violet`
- Distance 4–5: muted cool tones
- Distance 6 (tritone): `--color-text-tertiary` level muted

Exact gradient values computed at runtime from distance, using HSL interpolation.

## Detail Panel

Shows information about the currently selected key. Content changes based on mode.

### Reference Mode (default)

Click a wedge to select it. The circle does NOT rotate — the selection highlights in place so the user can study spatial relationships on the static circle.

When a key is selected:
- **Key name** and enharmonic equivalent (large heading)
- **Key signature**: number of sharps/flats with their note names
- **Relationships**: relative minor, dominant, subdominant — each clickable to navigate to that key
- **Diatonic chords**: I, ii, iii, IV, V, vi, vii° with chord names

When nothing is selected: prompt text ("Click a key to explore").

### Explore Mode

Click a wedge OR drag to rotate the circle freely. When a key is clicked, the circle auto-rotates to center that key at 12 o'clock. The detail panel updates live as the circle rotates and different keys pass through the 12 o'clock position. This mode is about playful discovery — spinning the circle and seeing how relationships shift.

Rotation interaction:
- **Mouse**: click-and-drag rotates the circle. Momentum/inertia on release (deceleration over ~500ms via tweened store).
- **Touch**: same as mouse via touch events.
- **Keyboard**: left/right arrow keys rotate by one key (30°).

### Learn Mode (Quiz)

The detail panel transforms into a quiz interface:
- **Question text**: "What is the relative minor of D major?", "What key is the dominant of A♭?", etc.
- **Instruction**: "Click the answer on the circle"
- **Feedback**: on click, the selected wedge flashes green (correct) or red (wrong) with a brief animation. Correct answer highlights if wrong.
- **Running score**: "7 / 10" displayed below the question
- **Next question**: auto-advances after ~1.5s feedback, or a "Next" button
- **Reset**: button to restart score to 0

Question types (randomly selected):
1. "What is the relative minor of [key]?"
2. "What is the dominant of [key]?"
3. "What is the subdominant of [key]?"
4. "What key has N sharps/flats?"
5. "[minor key] is the relative minor of which major key?"

## Component Architecture

```
src/routes/circle-of-fifths/
  +page.svelte              — page shell, layout, mode toggle

src/lib/components/circle-of-fifths/
  CircleOfFifths.svelte     — main SVG circle (outer + inner rings, arcs)
  Wedge.svelte              — single wedge segment (path + label)
  ConnectingArcs.svelte     — relationship arc overlays
  DetailPanel.svelte        — sidebar info panel (switches content by mode)
  QuizPanel.svelte          — quiz UI (question, feedback, score)
  ModeToggle.svelte         — segmented Explore/Reference/Learn toggle
```

### State Management

All state lives in the page component and flows down as props. No global stores needed.

```typescript
// Page-level state (Svelte 5 runes)
let selectedKey = $state<number | null>(null);  // index 0–11
let mode = $state<'explore' | 'reference' | 'learn'>('reference');
let rotation = tweened(0, { duration: 400, easing: cubicOut });

// Quiz state
let quizScore = $state(0);
let quizTotal = $state(0);
let currentQuestion = $state<QuizQuestion | null>(null);
let quizFeedback = $state<'correct' | 'wrong' | null>(null);
```

### Data Flow

1. User clicks wedge → `selectedKey` updates → circle recolors, arcs draw, panel updates
2. User drags circle (explore mode) → `rotation` updates → labels counter-rotate to stay upright
3. User clicks wedge in learn mode → answer checked → feedback animation → score updates

## Animations

All animations use CSS transitions on SVG elements or Svelte `tweened` stores:

- **Wedge color**: CSS `transition: fill 300ms ease`
- **Wedge scale**: CSS `transition: transform 200ms ease`
- **Connecting arcs**: `stroke-dashoffset` transition, 300ms
- **Rotation**: Svelte `tweened` store, 400ms, `cubicOut` easing
- **Quiz feedback flash**: CSS keyframe animation, 1.5s (green/red pulse then fade)
- **Detail panel content**: crossfade transition when switching modes or keys

## Accessibility

- Each wedge is a focusable `<g>` with `role="button"`, `tabindex="0"`, and `aria-label` ("C major", "A minor")
- Arrow keys navigate between wedges (left/right = adjacent keys)
- Enter/Space selects the focused wedge
- Detail panel uses `aria-live="polite"` to announce selection changes
- Quiz feedback announced via `aria-live="assertive"`
- Sufficient color contrast — text labels remain dark on all harmonic distance colors
- Respects `prefers-reduced-motion`: skip rotation animation, use instant transitions

## Responsive Behavior

- **Desktop (≥768px)**: side-by-side layout, circle ~60% width, panel ~40%
- **Mobile (<768px)**: stacked, circle full width (max 400px centered), panel below
- SVG viewBox ensures the circle is always sharp regardless of rendered size
- Touch events for drag-to-rotate on mobile
- Mode toggle wraps gracefully at narrow widths
