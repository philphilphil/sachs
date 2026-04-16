# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Hans Sach's Musikschule — a small SvelteKit app of browser-based music practice
tools (Circle of Fifths, Note Reading, Ear Training, Finger Patterns). Package
is named `music-trainer`; deployed name is `sachs`.

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # Production build (SvelteKit -> Cloudflare adapter)
npm run preview      # Run the built worker locally via wrangler dev
npm run deploy       # vite build && wrangler deploy
npm run check        # svelte-kit sync + svelte-check (TS + Svelte type check)
npm run cf-typegen   # Generate Cloudflare binding types (worker-configuration.d.ts)
npm run test         # vitest run (single pass)
npm run test:watch   # vitest watch mode
```

Run a single test file: `npx vitest run src/lib/audio/scheduler.test.ts`
Run tests matching a name: `npx vitest run -t "cancel"`

There is no linter configured — `svelte-check` is the type/lint gate.

## Deployment target

Deployed as a Cloudflare Worker via `@sveltejs/adapter-cloudflare`
(`wrangler.jsonc`). **The root layout sets `export const prerender = true`
(`src/routes/+layout.ts`)**, so every page is prerendered at build time and
served as static assets. Any code that touches `localStorage`, `window`, or
`document` must guard with `if (browser)` / `onMount` (import from
`$app/environment` and `svelte`), otherwise SSG will break.

`$app/paths`'s `base` is used throughout for links and static asset URLs (see
`Nav.svelte`, `+page.svelte`, `sampler.ts`). Prefix new internal links and
static asset fetches with `base` — don't hardcode `/`.

## Svelte 5 runes

The whole project is Svelte 5 with runes mode. Use `$state`, `$derived`,
`$derived.by`, `$effect`, `$props`; do not use stores unless using `tweened`
from `svelte/motion` (see `circle-of-fifths/+page.svelte`). Shared reactive
state lives in `.svelte.ts` files (see `src/lib/theme.svelte.ts`) and is
exported as a singleton object with getter properties — import and use it
directly, don't wrap it.

## Architecture

### Route shape
Each of the four trainers is a single route under `src/routes/<feature>/+page.svelte`.
The route file owns all per-trainer orchestration state (mode, current round,
score, keyboard handlers, localStorage sync) and composes presentational
components from `src/lib/components/<feature>/`. Shared components
(`ScoreStrip`, `Nav`, `ThemeToggle`, `FeatureCard`) live in
`src/lib/components/` or `src/lib/components/shared/`.

### Two music-theory models, intentionally separate
There are **two independent representations of keys/pitches** — don't
collapse them:

- `src/lib/data/keys.ts` — `KeyData` for the **Circle of Fifths** view:
  human-facing names with unicode `♯`/`♭`, enharmonic partners, diatonic
  chord lists, position index 0–11 around the circle. Consumed by circle-
  of-fifths components and `src/lib/utils/quiz.ts`.
- `src/lib/data/notes.ts` — `KeySignature`, `StaffNote`, `Preset` for the
  **Note Reading** trainer, including VexFlow-compatible key strings
  (`vexflowKey: 'F#'`) and presets (`violin-1st`, `violin-3rd`, `piano`,
  `staff-basics`) that define which keys and note ranges appear.
- `src/lib/utils/ear-training/music-theory.ts` — `Pitch`, `PitchClass`,
  `KeyMode`, `ScaleDegree` (including flat degrees `b3`/`b6`/`b7`) for
  **Ear Training** and the drone. Pitches here use ASCII sharps (`C#`), not
  unicode, because they feed Tone.js / the sampler directly via
  `pitchToToneString`.

Convert between representations at module boundaries; don't try to unify them.

### Audio pipeline (`src/lib/audio/`)
- `sampler.ts` — single lazy-loaded `Tone.Sampler` for piano, sampling
  `C3/F#3/C4/F#4/C5/F#5/C6` from `static/audio/piano/`. Tone interpolates
  intermediate pitches. `getPianoSampler()` and `unlockAudio()` are the
  only entry points — don't instantiate `Tone.Sampler` elsewhere.
  `unlockAudio()` **must** be called from a user gesture before any playback
  (browsers block AudioContext otherwise); trainers gate playback behind a
  "Start" button for this reason.
- `cadence.ts` — plays I–IV–V–I cadence to establish a key before ear-training
  rounds. Triad quality depends on `KeyMode` (major vs. natural minor).
- `phrase.ts` — sequential note/phrase playback with fixed `PHRASE_NOTE_MS`
  timing; onsets scheduled via `Tone.now()`.
- `drone.ts` — separate `Tone.PolySynth` (FM + lowpass) for the finger-
  patterns drone; maintains its own `currentNotes` state, not the sampler.
- `scheduler.ts` — generic cancellable setTimeout-chain runner used for
  non-audio-accurate UI pacing (e.g. cadence phase indicator).

### Ear-training progression
`src/lib/utils/ear-training/levels.ts` defines five fixed `LevelDef`s (1–5).
`ProgressionTracker` (`progression.ts`) watches a rolling window (default 20
rounds, 0.85 threshold) and exposes `shouldAdvance()`; the route calls this
after each answer and bumps `level` + persists via `storage.ts`. Levels can
only be advanced (not regressed) except via explicit reset. Storage keys are
namespaced `ear-training:mode-a:*` and `ear-training:mode-b:*`; Mode A best
streak is **per-level**, Mode B is a single value.

### Staff rendering (VexFlow)
`src/lib/components/note-trainer/StaffDisplay.svelte` and
`src/lib/components/ear-training/RevealStaff.svelte` lazy-import `vexflow`
inside an `$effect` and re-render on every prop change. They read
`--color-text-primary` off the container to theme the staff. If you add a
new staff surface, mirror this pattern — VexFlow is not SSR-safe and
importing it at the top of a module will break prerendering.

### Theme system (`src/lib/theme.svelte.ts`)
Three modes: `system` / `light` / `dark`, persisted in `localStorage` under
`theme`. `src/app.html` has an inline script that applies the `.dark` class
before first paint to avoid a flash. Tailwind v4 dark variant is customised
as `@custom-variant dark (&:where(.dark, .dark *))` in `app.css`, so use
`dark:` on elements normally but rely on the `--color-*` CSS variables
(both light and dark blocks in `app.css`) for themed colours rather than
hardcoding hex.

### Styling
Tailwind CSS v4 via `@tailwindcss/vite`. All design tokens are declared in
`@theme { ... }` in `src/app.css` (colors, fonts). Reusable classes
(`.eyebrow`, `.serif`, `.tnum`, `.hairline`, `.animate-*`) are also defined
there. Prefer these over ad-hoc utility stacks for consistency. Animations
respect `prefers-reduced-motion` (handled globally at the bottom of
`app.css`) — don't reintroduce motion that ignores it.

## Testing conventions

- Vitest with tests colocated next to source (`foo.ts` + `foo.test.ts`).
- Pure logic modules (`data/`, `utils/`, `audio/scheduler`, `audio/cadence`,
  `audio/phrase`) are unit-tested; Svelte components and the sampler/drone
  are not.
- For time-based code, use `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync`
  (see `scheduler.test.ts`).
- RNG-dependent generators (`round.ts`, `phrase-gen.ts`, `note-quiz.ts`)
  accept an optional `rng: () => number` parameter — pass a seeded function
  in tests rather than mocking `Math.random`.
