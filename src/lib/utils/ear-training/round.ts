import {
  PITCH_CLASSES,
  degreeToPitch,
  type Pitch,
  type PitchClass,
  type KeyMode,
  type ScaleDegree
} from './music-theory';
import { getLevel, type ScaleDegreeLevel } from './levels';

export interface ScaleDegreeRound {
  tonic: PitchClass;
  mode: KeyMode;
  targets: ScaleDegree[];
  targetPitches: Pitch[];
}

const TONIC_OCTAVE = 4;

export function generateScaleDegreeRound(
  level: ScaleDegreeLevel,
  previousTonic?: PitchClass,
  rng: () => number = Math.random
): ScaleDegreeRound {
  const def = getLevel(level);

  const mode: KeyMode =
    def.mode === 'mixed' ? (rng() < 0.5 ? 'major' : 'minor') : def.mode;

  let tonic: PitchClass;
  do {
    tonic = PITCH_CLASSES[Math.floor(rng() * PITCH_CLASSES.length)];
  } while (tonic === previousTonic);

  const active = (mode === 'major' ? def.degreesMajor : def.degreesMinor) ?? [];
  if (active.length === 0) {
    throw new Error(`Level ${level} has no active degrees for mode ${mode}`);
  }

  const targets: ScaleDegree[] = [];
  for (let i = 0; i < def.phraseLength; i++) {
    targets.push(active[Math.floor(rng() * active.length)]);
  }

  const targetPitches = targets.map((d) => degreeToPitch(tonic, mode, d, TONIC_OCTAVE));
  return { tonic, mode, targets, targetPitches };
}
