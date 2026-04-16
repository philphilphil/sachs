import { KEYS } from '../data/keys';

export interface QuizQuestion {
  text: string;
  answerIndex: number;
  answerRing: 'major' | 'minor';
}

type QuestionGenerator = (keyIndex: number) => QuizQuestion;

const generators: QuestionGenerator[] = [
  // "What is the relative minor of [key]?"
  (i) => ({
    text: `What is the relative minor of ${KEYS[i].name}?`,
    answerIndex: i,
    answerRing: 'minor'
  }),

  // "What is the dominant of [key]?"
  (i) => ({
    text: `What is the dominant of ${KEYS[i].name}?`,
    answerIndex: (i + 1) % 12,
    answerRing: 'major'
  }),

  // "What is the subdominant of [key]?"
  (i) => ({
    text: `What is the subdominant of ${KEYS[i].name}?`,
    answerIndex: (i + 11) % 12,
    answerRing: 'major'
  }),

  // "What key has N sharps/flats?"
  (i) => {
    const key = KEYS[i];
    const desc =
      key.sharps > 0
        ? `${key.sharps} sharp${key.sharps > 1 ? 's' : ''}`
        : key.flats > 0
          ? `${key.flats} flat${key.flats > 1 ? 's' : ''}`
          : 'no sharps or flats';
    return {
      text: `Which major key has ${desc}?`,
      answerIndex: i,
      answerRing: 'major'
    };
  },

  // "[minor] is the relative minor of which major key?"
  (i) => ({
    text: `${KEYS[i].minor} is the relative minor of which major key?`,
    answerIndex: i,
    answerRing: 'major'
  })
];

export function generateQuestion(
  excludeAnswerIndex?: number
): QuizQuestion {
  const genIndex = Math.floor(Math.random() * generators.length);
  let keyIndex: number;

  do {
    keyIndex = Math.floor(Math.random() * 12);
  } while (excludeAnswerIndex !== undefined && keyIndex === excludeAnswerIndex);

  return generators[genIndex](keyIndex);
}
