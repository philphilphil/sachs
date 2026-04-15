# Music Trainer Scaffold & Layout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a SvelteKit project with Tailwind CSS, create the app shell with navigation and placeholder pages for all four features, then create GitHub issues for each feature.

**Architecture:** Static SvelteKit app with file-based routing. Root layout provides a sticky nav bar. Home page shows a grid of feature cards linking to individual placeholder pages. View Transitions API for smooth page navigation.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes), TypeScript, Tailwind CSS 4 (Vite plugin), `@sveltejs/adapter-static`

---

### Task 1: Initialize SvelteKit Project

**Files:**
- Create: `package.json`
- Create: `svelte.config.js`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "music-trainer",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
  },
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^5.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0"
  },
  "type": "module"
}
```

- [ ] **Step 2: Create `svelte.config.js`**

```js
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true
    })
  }
};

export default config;
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()]
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules
.svelte-kit
build
.env
.env.*
!.env.example
vite.config.ts.timestamp-*
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: `node_modules` created, `package-lock.json` generated, no errors.

- [ ] **Step 7: Sync SvelteKit types**

Run: `npx svelte-kit sync`
Expected: `.svelte-kit` directory created with generated types.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json svelte.config.js vite.config.ts tsconfig.json .gitignore
git commit -m "feat: initialize SvelteKit project with TypeScript and Tailwind CSS 4"
```

---

### Task 2: Create App Shell (HTML + CSS)

**Files:**
- Create: `src/app.html`
- Create: `src/app.css`

- [ ] **Step 1: Create `src/app.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Music Trainer</title>
    %sveltekit.head%
  </head>
  <body>
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

- [ ] **Step 2: Create `src/app.css`**

Tailwind v4 uses CSS-based configuration. Import Tailwind and define custom theme tokens for the app's color palette.

```css
@import 'tailwindcss';

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --color-primary-50: oklch(0.962 0.023 175.12);
  --color-primary-100: oklch(0.905 0.058 175.12);
  --color-primary-500: oklch(0.637 0.163 175.12);
  --color-primary-600: oklch(0.532 0.157 175.12);
  --color-primary-700: oklch(0.443 0.127 175.12);
  --color-accent-500: oklch(0.606 0.25 292.72);
  --color-accent-600: oklch(0.541 0.281 292.72);
}
```

- [ ] **Step 3: Create placeholder `static/favicon.png`**

Run: `mkdir -p static && convert -size 32x32 xc:'#0d9488' static/favicon.png 2>/dev/null || printf '\x89PNG\r\n\x1a\n' > static/favicon.png`

This creates a minimal placeholder file. A proper favicon can be added later.

- [ ] **Step 4: Commit**

```bash
git add src/app.html src/app.css static/favicon.png
git commit -m "feat: add app shell with Tailwind CSS theme"
```

---

### Task 3: Create Nav Component

**Files:**
- Create: `src/lib/components/Nav.svelte`

- [ ] **Step 1: Create `src/lib/components/Nav.svelte`**

Uses Svelte 5 runes (`$state`, `$props`). `page` from `$app/state` provides the current URL for active link highlighting. Responsive: horizontal links on desktop, hamburger menu on mobile.

```svelte
<script lang="ts">
  import { page } from '$app/state';

  let menuOpen = $state(false);

  const links = [
    { href: '/circle-of-fifths', label: 'Circle of Fifths' },
    { href: '/note-trainer', label: 'Note Trainer' },
    { href: '/ear-training', label: 'Ear Training' },
    { href: '/finger-patterns', label: 'Finger Patterns' }
  ];
</script>

<nav class="bg-white shadow-sm sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
        Music Trainer
      </a>

      <button
        class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        onclick={() => (menuOpen = !menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if menuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          {/if}
        </svg>
      </button>

      <div class="hidden md:flex items-center gap-1">
        {#each links as link}
          <a
            href={link.href}
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
              {page.url.pathname === link.href
              ? 'bg-primary-50 text-primary-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
          >
            {link.label}
          </a>
        {/each}
      </div>
    </div>

    {#if menuOpen}
      <div class="md:hidden pb-3 border-t border-slate-100 mt-1 space-y-1">
        {#each links as link}
          <a
            href={link.href}
            class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors
              {page.url.pathname === link.href
              ? 'bg-primary-50 text-primary-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
            onclick={() => (menuOpen = false)}
          >
            {link.label}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</nav>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/Nav.svelte
git commit -m "feat: add responsive Nav component"
```

---

### Task 4: Create FeatureCard Component

**Files:**
- Create: `src/lib/components/FeatureCard.svelte`

- [ ] **Step 1: Create `src/lib/components/FeatureCard.svelte`**

Reusable card used on both the home grid and individual placeholder pages. Uses `$props()` with a TypeScript interface. The `iconColor` prop accepts a CSS color value (inline style avoids Tailwind dynamic class issues).

```svelte
<script lang="ts">
  interface Props {
    title: string;
    description: string;
    href?: string;
    iconLabel: string;
    iconColor: string;
  }

  let { title, description, href, iconLabel, iconColor }: Props = $props();
</script>

{#if href}
  <a
    {href}
    class="group block bg-white rounded-2xl p-6 shadow-sm border border-slate-100
      hover:shadow-md hover:border-primary-200 transition-all duration-200 hover:-translate-y-1"
  >
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-lg shadow-sm"
      style="background-color: {iconColor}"
    >
      {iconLabel}
    </div>
    <h2 class="text-lg font-semibold text-slate-800 group-hover:text-primary-700 transition-colors">
      {title}
    </h2>
    <p class="mt-2 text-sm text-slate-500">{description}</p>
  </a>
{:else}
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-lg shadow-sm"
      style="background-color: {iconColor}"
    >
      {iconLabel}
    </div>
    <h2 class="text-lg font-semibold text-slate-800">{title}</h2>
    <p class="mt-2 text-sm text-slate-500">{description}</p>
  </div>
{/if}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/FeatureCard.svelte
git commit -m "feat: add FeatureCard component"
```

---

### Task 5: Create Root Layout

**Files:**
- Create: `src/routes/+layout.svelte`
- Create: `src/routes/+layout.ts`

- [ ] **Step 1: Create `src/routes/+layout.ts`**

Enable prerendering for all pages (required by the static adapter).

```ts
export const prerender = true;
```

- [ ] **Step 2: Create `src/routes/+layout.svelte`**

Root layout imports the global CSS, renders the Nav, and enables the View Transitions API for smooth page navigation. In Svelte 5, child content is passed via `children` prop (not `<slot />`).

```svelte
<script lang="ts">
  import { onNavigate } from '$app/navigation';
  import Nav from '$lib/components/Nav.svelte';
  import '../app.css';

  let { children } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<div class="min-h-screen bg-slate-50">
  <Nav />
  <main>
    {@render children()}
  </main>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/+layout.svelte src/routes/+layout.ts
git commit -m "feat: add root layout with Nav and view transitions"
```

---

### Task 6: Create Home Page

**Files:**
- Create: `src/routes/+page.svelte`

- [ ] **Step 1: Create `src/routes/+page.svelte`**

Displays the four feature cards in a responsive grid. Each card links to its feature route.

```svelte
<script lang="ts">
  import FeatureCard from '$lib/components/FeatureCard.svelte';

  const features = [
    {
      title: 'Circle of Fifths',
      description: 'Explore keys and their relationships',
      href: '/circle-of-fifths',
      iconLabel: 'V',
      iconColor: '#0d9488'
    },
    {
      title: 'Note Reading Trainer',
      description: 'Identify notes on the treble clef',
      href: '/note-trainer',
      iconLabel: 'N',
      iconColor: '#7c3aed'
    },
    {
      title: 'Ear Training',
      description: 'Recognize notes and keys by ear',
      href: '/ear-training',
      iconLabel: 'E',
      iconColor: '#0891b2'
    },
    {
      title: 'Violin Finger Patterns',
      description: 'Learn finger positions for every key',
      href: '/finger-patterns',
      iconLabel: 'F',
      iconColor: '#c026d3'
    }
  ];
</script>

<svelte:head>
  <title>Music Trainer</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
  <div class="text-center mb-10">
    <h1 class="text-4xl font-bold text-slate-900">Music Trainer</h1>
    <p class="mt-3 text-lg text-slate-500">Learn music theory and violin, one step at a time</p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {#each features as feature}
      <FeatureCard {...feature} />
    {/each}
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat: add home page with feature card grid"
```

---

### Task 7: Create Placeholder Pages

**Files:**
- Create: `src/routes/circle-of-fifths/+page.svelte`
- Create: `src/routes/note-trainer/+page.svelte`
- Create: `src/routes/ear-training/+page.svelte`
- Create: `src/routes/finger-patterns/+page.svelte`

Each placeholder page shows a centered card with the feature title, a short description, and a "Coming soon" label. The styling is consistent with the home page cards.

- [ ] **Step 1: Create `src/routes/circle-of-fifths/+page.svelte`**

```svelte
<svelte:head>
  <title>Circle of Fifths - Music Trainer</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
  <div class="bg-white rounded-2xl p-10 shadow-sm border border-slate-100">
    <div
      class="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-sm"
      style="background-color: #0d9488"
    >
      V
    </div>
    <h1 class="text-2xl font-bold text-slate-900">Circle of Fifths</h1>
    <p class="mt-3 text-slate-500">Explore keys and their relationships</p>
    <span class="inline-block mt-6 px-4 py-1.5 bg-slate-100 text-slate-500 text-sm font-medium rounded-full">
      Coming soon
    </span>
  </div>
</div>
```

- [ ] **Step 2: Create `src/routes/note-trainer/+page.svelte`**

```svelte
<svelte:head>
  <title>Note Reading Trainer - Music Trainer</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
  <div class="bg-white rounded-2xl p-10 shadow-sm border border-slate-100">
    <div
      class="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-sm"
      style="background-color: #7c3aed"
    >
      N
    </div>
    <h1 class="text-2xl font-bold text-slate-900">Note Reading Trainer</h1>
    <p class="mt-3 text-slate-500">Identify notes on the treble clef</p>
    <span class="inline-block mt-6 px-4 py-1.5 bg-slate-100 text-slate-500 text-sm font-medium rounded-full">
      Coming soon
    </span>
  </div>
</div>
```

- [ ] **Step 3: Create `src/routes/ear-training/+page.svelte`**

```svelte
<svelte:head>
  <title>Ear Training - Music Trainer</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
  <div class="bg-white rounded-2xl p-10 shadow-sm border border-slate-100">
    <div
      class="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-sm"
      style="background-color: #0891b2"
    >
      E
    </div>
    <h1 class="text-2xl font-bold text-slate-900">Ear Training</h1>
    <p class="mt-3 text-slate-500">Recognize notes and keys by ear</p>
    <span class="inline-block mt-6 px-4 py-1.5 bg-slate-100 text-slate-500 text-sm font-medium rounded-full">
      Coming soon
    </span>
  </div>
</div>
```

- [ ] **Step 4: Create `src/routes/finger-patterns/+page.svelte`**

```svelte
<svelte:head>
  <title>Violin Finger Patterns - Music Trainer</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
  <div class="bg-white rounded-2xl p-10 shadow-sm border border-slate-100">
    <div
      class="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-sm"
      style="background-color: #c026d3"
    >
      F
    </div>
    <h1 class="text-2xl font-bold text-slate-900">Violin Finger Patterns</h1>
    <p class="mt-3 text-slate-500">Learn finger positions for every key</p>
    <span class="inline-block mt-6 px-4 py-1.5 bg-slate-100 text-slate-500 text-sm font-medium rounded-full">
      Coming soon
    </span>
  </div>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/circle-of-fifths/+page.svelte src/routes/note-trainer/+page.svelte src/routes/ear-training/+page.svelte src/routes/finger-patterns/+page.svelte
git commit -m "feat: add placeholder pages for all four features"
```

---

### Task 8: Verify Dev Server

- [ ] **Step 1: Start dev server and verify it compiles**

Run: `npm run dev -- --port 5173 &`
Expected: Vite dev server starts without errors, output includes a local URL like `http://localhost:5173`.

- [ ] **Step 2: Verify the home page loads**

Run: `curl -s http://localhost:5173 | head -20`
Expected: HTML output containing "Music Trainer" and the feature card content.

- [ ] **Step 3: Verify a placeholder page loads**

Run: `curl -s http://localhost:5173/circle-of-fifths | head -20`
Expected: HTML output containing "Circle of Fifths" and "Coming soon".

- [ ] **Step 4: Stop dev server**

Run: `kill %1 2>/dev/null; kill $(lsof -ti:5173) 2>/dev/null`

- [ ] **Step 5: Run type checking**

Run: `npm run check`
Expected: No errors. Output shows "svelte-check found 0 errors".

- [ ] **Step 6: Run production build**

Run: `npm run build`
Expected: Build completes. `build/` directory created with static HTML files.

- [ ] **Step 7: Commit build verification (if any config adjustments were needed)**

Only commit if files were changed during verification. Otherwise skip.

---

### Task 9: Create GitHub Issues

- [ ] **Step 1: Create issue for Circle of Fifths**

```bash
gh issue create --title "Interactive Circle of Fifths" --body "$(cat <<'ISSUE'
## Description

Build an interactive circle of fifths visualization.

## Requirements

- Clickable/rotatable circle showing all 12 major keys arranged in fifths
- Inner ring showing relative minor keys
- Highlight relationships when a key is selected (relative minor/major, enharmonic equivalents)
- Animated transitions when selecting or rotating
- Responsive sizing

## Tech Notes

- Render as SVG for crisp scaling and animation control
- Use Svelte transitions/tweened stores for smooth animations
- Route: `/circle-of-fifths`
ISSUE
)"
```

- [ ] **Step 2: Create issue for Note Reading Trainer**

```bash
gh issue create --title "Note Reading Trainer" --body "$(cat <<'ISSUE'
## Description

A practice tool for reading notes on the treble clef.

## Requirements

### Mode A: Note Identification
- Display a random note on the treble clef staff
- User clicks the correct note name from a button grid (C, D, E, F, G, A, B + sharps/flats)
- Immediate visual feedback (correct/incorrect)
- Generate a new random note after each answer

### Mode B: Key Signature Identification
- Display a key signature on the treble clef (sharps or flats)
- User guesses which major key it represents
- Circle of fifths must be hidden during this mode to prevent cheating

## Tech Notes

- Use VexFlow for notation rendering (`npm install vexflow`)
- Route: `/note-trainer`
- Mode toggle (A/B) in the page header
ISSUE
)"
```

- [ ] **Step 3: Create issue for Ear Training**

```bash
gh issue create --title "Ear Training" --body "$(cat <<'ISSUE'
## Description

Train your ear to recognize notes and keys.

## Requirements

### Mode A: Single Note
- Play a single note using Web Audio (Tone.js)
- User guesses which note it is from a button grid
- Immediate feedback and option to replay

### Mode B: Key Identification
- Play a sequence of notes or a chord
- User guesses which key the sequence belongs to
- Option to replay the sequence

## Tech Notes

- Use Tone.js for audio synthesis (`npm install tone`)
- Route: `/ear-training`
- Mode toggle (A/B) in the page header
- User must interact with the page before audio can play (Web Audio autoplay policy)
ISSUE
)"
```

- [ ] **Step 4: Create issue for Violin Finger Pattern Learner**

```bash
gh issue create --title "Violin Finger Pattern Learner" --body "$(cat <<'ISSUE'
## Description

Learn and practice violin finger patterns for different keys.

## Requirements

- Display a key name (e.g., "G Major")
- Show a visual representation of the violin fingerboard (four strings: G, D, A, E)
- User identifies or places correct finger positions for first position in the given key
- Visual feedback showing correct/incorrect placements
- Cover all standard first-position finger patterns across all four strings

## Tech Notes

- Render fingerboard as SVG for interactive finger placement
- Route: `/finger-patterns`
- Finger patterns follow standard Suzuki/classical first-position fingerings
ISSUE
)"
```

- [ ] **Step 5: Verify issues were created**

Run: `gh issue list`
Expected: Four issues listed with titles matching the features above.
