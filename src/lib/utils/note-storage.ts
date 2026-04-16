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
