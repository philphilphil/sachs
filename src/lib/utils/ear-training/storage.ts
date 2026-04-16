import type { ScaleDegreeLevel } from './levels';

const PREFIX = 'ear-training:';

export type StorageMode = 'mode-a' | 'mode-b';

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

export function loadLevel(): ScaleDegreeLevel {
  const raw = safeGet(`${PREFIX}mode-a:current-level`);
  const n = raw === null ? NaN : Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 5) return 1;
  return n as ScaleDegreeLevel;
}

export function saveLevel(level: ScaleDegreeLevel): void {
  safeSet(`${PREFIX}mode-a:current-level`, String(level));
}

function streakKey(mode: StorageMode, level?: ScaleDegreeLevel): string {
  return mode === 'mode-a'
    ? `${PREFIX}mode-a:best-streak:level-${level}`
    : `${PREFIX}mode-b:best-streak`;
}

export function loadBestStreak(mode: StorageMode, level?: ScaleDegreeLevel): number {
  const raw = safeGet(streakKey(mode, level));
  const n = raw === null ? 0 : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function saveBestStreak(
  mode: StorageMode,
  streak: number,
  level?: ScaleDegreeLevel
): void {
  safeSet(streakKey(mode, level), String(streak));
}
