import type { KeySignature, Preset, StaffNote } from '$lib/data/notes';

export function soundingPitch(note: StaffNote, signature: KeySignature): string {
  const match = signature.accidentals.find((a) => a.startsWith(note.letter));
  return match ?? note.letter;
}

export interface NoteQuestion {
  mode: 'note';
  keySignature: KeySignature;
  note: StaffNote;
  correctAnswer: string;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateNoteQuestion(
  preset: Preset,
  previousKeySig?: KeySignature
): NoteQuestion {
  const notes = preset.notes ?? [];
  if (notes.length === 0) {
    throw new Error(`Preset ${preset.id} has no notes`);
  }

  const allowedKeys =
    previousKeySig && preset.keys.length > 1
      ? preset.keys.filter((k) => k.tonic !== previousKeySig.tonic)
      : preset.keys;

  const keySignature = pickRandom(allowedKeys);
  const note = pickRandom(notes);

  return {
    mode: 'note',
    keySignature,
    note,
    correctAnswer: soundingPitch(note, keySignature)
  };
}
