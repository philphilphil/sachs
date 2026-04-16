import * as Tone from 'tone';
import { pitchToToneString, type Pitch } from '../utils/ear-training/music-theory';
import { getPianoSampler } from './sampler';

export const NOTE_DURATION_MS = 900;
export const PHRASE_NOTE_MS = 380;

export interface ScheduledNote {
  pitch: Pitch;
  onsetMs: number;
  durationMs: number;
}

export function buildPhraseSchedule(pitches: Pitch[]): ScheduledNote[] {
  return pitches.map((pitch, i) => ({
    pitch,
    onsetMs: i * PHRASE_NOTE_MS,
    durationMs: PHRASE_NOTE_MS
  }));
}

export async function playNote(pitch: Pitch): Promise<void> {
  const sampler = await getPianoSampler();
  sampler.triggerAttackRelease(pitchToToneString(pitch), NOTE_DURATION_MS / 1000);
  await new Promise((r) => setTimeout(r, NOTE_DURATION_MS + 100));
}

export async function playPhrase(pitches: Pitch[]): Promise<void> {
  const sampler = await getPianoSampler();
  const now = Tone.now();
  const schedule = buildPhraseSchedule(pitches);
  schedule.forEach((n) => {
    sampler.triggerAttackRelease(
      pitchToToneString(n.pitch),
      n.durationMs / 1000,
      now + n.onsetMs / 1000
    );
  });
  const totalMs = schedule.length * PHRASE_NOTE_MS + 200;
  await new Promise((r) => setTimeout(r, totalMs));
}
