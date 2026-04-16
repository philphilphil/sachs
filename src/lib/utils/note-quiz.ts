import type { KeySignature, StaffNote } from '$lib/data/notes';

export function soundingPitch(note: StaffNote, signature: KeySignature): string {
  const match = signature.accidentals.find((a) => a.startsWith(note.letter));
  return match ?? note.letter;
}
