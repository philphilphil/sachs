import {
  PITCH_CLASSES,
  degreeToPitch,
  type KeyMode,
  type PitchClass,
  type Pitch,
  type ScaleDegree
} from './music-theory';

export interface KeyModeRound {
  tonic: PitchClass;
  mode: KeyMode;
  phrase: Pitch[];
  phraseDegrees: ScaleDegree[];
}

const THIRD = Symbol('third-family');
const SIXTH = Symbol('sixth-family');
const SEVENTH = Symbol('seventh-family');

type TemplateToken = number | typeof THIRD | typeof SIXTH | typeof SEVENTH;

const TEMPLATES: TemplateToken[][] = [
  [5, THIRD, 2, 1],
  [THIRD, 2, SEVENTH, 1],
  [1, THIRD, 5, THIRD, 2, 1],
  [5, SIXTH, 5, THIRD, 2, 1],
  [1, 2, THIRD, 5, 2, 1],
  [5, THIRD, 4, 2, 1]
];

function resolveTemplate(template: TemplateToken[], mode: KeyMode): ScaleDegree[] {
  return template.map((tok) => {
    if (tok === THIRD) return mode === 'major' ? 3 : 'b3';
    if (tok === SIXTH) return mode === 'major' ? 6 : 'b6';
    if (tok === SEVENTH) return mode === 'major' ? 7 : 'b7';
    return tok as ScaleDegree;
  });
}

const TONIC_OCTAVE = 4;

export function generateKeyModeRound(
  previousTonic?: PitchClass,
  rng: () => number = Math.random
): KeyModeRound {
  const mode: KeyMode = rng() < 0.5 ? 'major' : 'minor';

  let tonic: PitchClass;
  do {
    tonic = PITCH_CLASSES[Math.floor(rng() * PITCH_CLASSES.length)];
  } while (tonic === previousTonic);

  const template = TEMPLATES[Math.floor(rng() * TEMPLATES.length)];
  const phraseDegrees = resolveTemplate(template, mode);
  const phrase = phraseDegrees.map((d) => degreeToPitch(tonic, mode, d, TONIC_OCTAVE));

  return { tonic, mode, phrase, phraseDegrees };
}
