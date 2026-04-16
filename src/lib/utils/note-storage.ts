export type QuizMode = 'note' | 'key';

function keyFor(presetId: string, mode: QuizMode, variant?: string): string {
  const suffix = variant ? `:${variant}` : '';
  return `note-trainer:best:${presetId}:${mode}${suffix}`;
}

export function loadBest(presetId: string, mode: QuizMode, variant?: string): number {
  try {
    const raw = localStorage.getItem(keyFor(presetId, mode, variant));
    if (raw === null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function saveBest(
  presetId: string,
  mode: QuizMode,
  best: number,
  variant?: string
): void {
  try {
    localStorage.setItem(keyFor(presetId, mode, variant), String(best));
  } catch {
    // localStorage disabled — silently ignore.
  }
}
