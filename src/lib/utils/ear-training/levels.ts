import type { ScaleDegree } from './music-theory';

export type ScaleDegreeLevel = 1 | 2 | 3 | 4 | 5;
export type LevelMode = 'major' | 'minor' | 'mixed';

export interface LevelDef {
  level: ScaleDegreeLevel;
  mode: LevelMode;
  degreesMajor?: ScaleDegree[];
  degreesMinor?: ScaleDegree[];
  phraseLength: 1 | 2;
  label: string;
}

export const LEVELS: LevelDef[] = [
  { level: 1, mode: 'major', degreesMajor: [1, 3, 5], phraseLength: 1, label: '1̂ 3̂ 5̂' },
  { level: 2, mode: 'major', degreesMajor: [1, 2, 3, 4, 5], phraseLength: 1, label: '1̂–5̂' },
  { level: 3, mode: 'major', degreesMajor: [1, 2, 3, 4, 5, 6, 7], phraseLength: 1, label: 'Major 1̂–7̂' },
  { level: 4, mode: 'minor', degreesMinor: [1, 2, 'b3', 4, 5, 'b6', 'b7'], phraseLength: 1, label: 'Minor 1̂–♭7̂' },
  {
    level: 5,
    mode: 'mixed',
    degreesMajor: [1, 2, 3, 4, 5, 6, 7],
    degreesMinor: [1, 2, 'b3', 4, 5, 'b6', 'b7'],
    phraseLength: 2,
    label: 'Phrases'
  }
];

export function getLevel(level: ScaleDegreeLevel): LevelDef {
  const def = LEVELS.find((l) => l.level === level);
  if (!def) throw new Error(`Unknown level: ${level}`);
  return def;
}
