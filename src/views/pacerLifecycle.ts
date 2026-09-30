import { silenceVoice } from '../pacer';
import type { Metronome, WakeLock, PacerSettings, PoseTrack } from '../pacer';

/** Rehearsal: beats between the hand-off chime and the announce. */
const REHEARSAL_DELAY_BEATS = 4;

export function stopClassPlayback(
  metronome: Pick<Metronome, 'cue' | 'stop' | 'setQuiet'> | null,
  lock: Pick<WakeLock, 'release'> | null,
  clearPending: () => void,
  bell: boolean,
): void {
  silenceVoice();
  if (bell) metronome?.cue('end');
  metronome?.stop();
  lock?.release();
  metronome?.setQuiet(false);
  clearPending();
}

export function segmentSettings(settings: PacerSettings, override?: number): PacerSettings {
  return { ...settings, beatsPerBar: override ?? settings.beatsPerBar };
}

export function rehearsalDelay(rehearse: boolean, idx: number, from: number): number {
  return rehearse && idx !== from ? REHEARSAL_DELAY_BEATS : 0;
}

export function eligibleHandoff(track: PoseTrack, beat: number, previousOrder?: number): boolean {
  const announce = track.events.find((event) => event.kind === 'announce')?.atBeat ?? 0;
  return announce > 0 && beat > announce && previousOrder === track.pose.order - 1;
}

export function practicedSpan(orders: Set<number>): { fromOrder: number; toOrder: number } | null {
  return orders.size ? { fromOrder: Math.min(...orders), toOrder: Math.max(...orders) } : null;
}

export function guardClassUnload(target: EventTarget, onLeave: () => void): () => void {
  const beforeUnload = (event: Event) => {
    event.preventDefault();
    (event as BeforeUnloadEvent).returnValue = '';
  };
  // pagehide runs only after a confirmed departure, never on cancel.
  target.addEventListener('beforeunload', beforeUnload);
  target.addEventListener('pagehide', onLeave);
  return () => {
    target.removeEventListener('beforeunload', beforeUnload);
    target.removeEventListener('pagehide', onLeave);
  };
}

export function shouldReorient(handoff: boolean, beat: number, announceAt: number): boolean {
  return handoff && beat > announceAt;
}

export function practiceSaveMessage(saved: boolean): string {
  return saved ? 'Practice saved.' : 'Your practice could not be saved on this device.';
}
