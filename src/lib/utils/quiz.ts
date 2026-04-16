import { KEYS } from '../data/keys';

export type QuizCategory = 'order' | 'signatures' | 'both';

export interface QuizQuestion {
  text: string;
  answer: string;
  keyIndex: number;
  category: 'order' | 'signatures';
}

type QuestionGenerator = (keyIndex: number) => QuizQuestion;

const orderGenerators: QuestionGenerator[] = [
  // "What key comes after [key] on the circle of fifths?"
  (i) => ({
    text: `What key comes after ${KEYS[i].name} on the circle of fifths?`,
    answer: KEYS[(i + 1) % 12].name,
    keyIndex: i,
    category: 'order'
  }),

  // "What key comes before [key] on the circle of fifths?"
  (i) => ({
    text: `What key comes before ${KEYS[i].name} on the circle of fifths?`,
    answer: KEYS[(i + 11) % 12].name,
    keyIndex: i,
    category: 'order'
  }),

  // "What is the relative minor of [key]?"
  (i) => ({
    text: `What is the relative minor of ${KEYS[i].name} major?`,
    answer: KEYS[i].minor,
    keyIndex: i,
    category: 'order'
  }),

  // "[minor] is the relative minor of which major key?"
  (i) => ({
    text: `${KEYS[i].minor} is the relative minor of which major key?`,
    answer: KEYS[i].name,
    keyIndex: i,
    category: 'order'
  })
];

const signatureGenerators: QuestionGenerator[] = [
  // "How many sharps/flats does [key] major have?"
  (i) => {
    const key = KEYS[i];
    const answer =
      key.sharps > 0
        ? `${key.sharps} sharp${key.sharps > 1 ? 's' : ''}`
        : key.flats > 0
          ? `${key.flats} flat${key.flats > 1 ? 's' : ''}`
          : 'No sharps or flats';
    return {
      text: `How many sharps or flats does ${key.name} major have?`,
      answer,
      keyIndex: i,
      category: 'signatures'
    };
  },

  // "What are the sharps/flats in [key] major?"
  (i) => {
    const key = KEYS[i];
    const answer =
      key.signatureNotes.length > 0
        ? key.signatureNotes.join(', ')
        : 'None';
    const type =
      key.sharps > 0 ? 'sharps' : key.flats > 0 ? 'flats' : 'sharps or flats';
    return {
      text: `Name the ${type} in ${key.name} major.`,
      answer,
      keyIndex: i,
      category: 'signatures'
    };
  },

  // "Which major key has N sharps/flats?"
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
      answer: key.name,
      keyIndex: i,
      category: 'signatures'
    };
  }
];

function getGenerators(category: QuizCategory): QuestionGenerator[] {
  if (category === 'order') return orderGenerators;
  if (category === 'signatures') return signatureGenerators;
  return [...orderGenerators, ...signatureGenerators];
}

export function generateQuestion(
  category: QuizCategory,
  excludeKeyIndex?: number
): QuizQuestion {
  const gens = getGenerators(category);
  const genIndex = Math.floor(Math.random() * gens.length);
  let keyIndex: number;

  do {
    keyIndex = Math.floor(Math.random() * 12);
  } while (excludeKeyIndex !== undefined && keyIndex === excludeKeyIndex);

  return gens[genIndex](keyIndex);
}
