# Music Theory & Violin Trainer — Scaffold & Layout Design

## Overview

A personal music theory and violin learning tool built as a web app. Clean, modern, playful aesthetic with smooth animations. Published for public use but designed for single-user sessions — no accounts, no authentication, no progress persistence.

This spec covers the **initial scaffold only**: project setup, layout structure, placeholder pages, and GitHub issue creation for the four core features.

## Tech Stack

- **SvelteKit** — static adapter for deployment as a static site
- **TypeScript** — strict mode
- **Tailwind CSS** — utility-first styling
- **VexFlow** — music notation rendering (added per-feature, not in scaffold)
- **Tone.js** — audio synthesis for ear training (added per-feature, not in scaffold)

## Layout

### Navigation

Top navigation bar with:
- App name/logo on the left
- Feature links on the right: Circle of Fifths, Note Trainer, Ear Training, Finger Patterns
- Active route highlighted
- Responsive: collapses to a hamburger menu on mobile

### Color Palette

Clean and playful with musical energy:
- Background: near-white (`slate-50` / `slate-100`)
- Primary accent: teal (`teal-500` / `teal-600`)
- Secondary accent: purple (`violet-500` / `violet-600`)
- Text: dark slate (`slate-800` / `slate-900`)
- Cards: white with soft shadows and rounded corners

### Page Transitions

Smooth crossfade or slide transitions between routes using Svelte's built-in `transition:` directives.

## Routes & Pages

### `/` — Home

Grid of four feature cards, each with:
- An icon or illustration placeholder
- Feature title
- One-line description
- Click navigates to the feature page

Cards:
1. **Circle of Fifths** — "Explore keys and their relationships"
2. **Note Reading Trainer** — "Identify notes on the treble clef"
3. **Ear Training** — "Recognize notes and keys by ear"
4. **Violin Finger Patterns** — "Learn finger positions for every key"

### `/circle-of-fifths` — Placeholder

Centered placeholder card: icon, title, "Coming soon" message. Styled consistently with the home cards.

### `/note-trainer` — Placeholder

Same placeholder pattern.

### `/ear-training` — Placeholder

Same placeholder pattern.

### `/finger-patterns` — Placeholder

Same placeholder pattern.

## Project Structure

```
src/
  lib/
    components/
      Nav.svelte            — top navigation bar
      FeatureCard.svelte    — reusable card for home grid + placeholders
    styles/
      app.css               — Tailwind imports + any custom base styles
  routes/
    +layout.svelte          — root layout with Nav
    +page.svelte            — home page with feature card grid
    circle-of-fifths/
      +page.svelte          — placeholder
    note-trainer/
      +page.svelte          — placeholder
    ear-training/
      +page.svelte          — placeholder
    finger-patterns/
      +page.svelte          — placeholder
static/
  favicon.png               — placeholder favicon
```

## GitHub Issues to Create

After the scaffold is built, create four GitHub issues:

### Issue 1: Interactive Circle of Fifths
Clickable/rotatable circle of fifths visualization. Shows all major and minor keys arranged in the circle. Highlights relationships between keys (relative minor/major, enharmonic equivalents). Animated transitions when selecting keys.

### Issue 2: Note Reading Trainer
**Mode A — Note identification:** Display a random note on the treble clef (rendered with VexFlow). User clicks the correct note name from a set of buttons. Immediate feedback (correct/incorrect).

**Mode B — Key signature identification:** Display a key signature on the treble clef. User guesses which key it represents. Circle of fifths is hidden during this mode to prevent cheating.

### Issue 3: Ear Training
**Mode A — Single note:** Play a note using Tone.js. User guesses which note it is.

**Mode B — Key identification:** Play a sequence of notes or chord. User guesses which key it belongs to.

### Issue 4: Violin Finger Pattern Learner
Display a key name. User identifies the correct finger positions/patterns on a visual representation of the violin fingerboard. Covers first position patterns across all four strings.

## What This Spec Does NOT Cover

- Feature implementation (each feature has its own GitHub issue)
- Progress tracking / persistence
- LLM integration
- Audio playback
- Deployment configuration beyond static adapter
