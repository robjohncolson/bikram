/**
 * The Moon-days lens — an OPTIONAL, opt-in reading of today's sky for a
 * fixed sequence: which postures the day leans toward, and one thing to
 * notice. Views import only from here. Nothing in this module changes
 * the class, the trainer, or a posture's cautions; the trainer's own
 * weak-node choice always wins over anything the lens suggests.
 */
import { poses } from '../data';
import type { Pose } from '../data';
import {
  localDayIndex,
  luminaryLongitudes,
  moonPhase,
  planetaryDay,
  tropicalSign,
} from './ephemeris';
import type { MoonPhase, ZodiacPosition } from './ephemeris';
import { DAY_NOTES, PHASE_NOTES } from './notes';
import type { SkyNote } from './notes';

export {
  SYNODIC_DAYS,
  PHASE_NAMES,
  SIGN_NAMES,
  WEEKDAY_PLANETS,
  daysSinceJ2000,
  luminaryLongitudes,
  moonPhase,
  tropicalSign,
  planetaryDay,
  localDayIndex,
} from './ephemeris';
export type { MoonPhase, ZodiacPosition } from './ephemeris';
export { PHASE_NOTES, DAY_NOTES } from './notes';
export type { SkyNote } from './notes';

export const SKY_STORAGE_KEY = 'yoga-sky-v1';

/** The lens is off until the practitioner turns it on. */
export function skyEnabled(): boolean {
  try {
    const raw = window.localStorage.getItem(SKY_STORAGE_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    return Boolean(parsed && typeof parsed === 'object' && (parsed as { enabled?: unknown }).enabled === true);
  } catch {
    return false;
  }
}

export function setSkyEnabled(enabled: boolean): void {
  try {
    if (enabled) window.localStorage.setItem(SKY_STORAGE_KEY, JSON.stringify({ enabled: true }));
    else window.localStorage.removeItem(SKY_STORAGE_KEY);
  } catch {
    /* storage unavailable — the lens simply stays off */
  }
}

export interface TodayLens {
  phase: MoonPhase;
  moonSign: ZodiacPosition;
  sunSign: ZodiacPosition;
  weekday: { index: number; day: string; planet: string };
  phaseNote: SkyNote;
  dayNote: SkyNote;
  /**
   * One posture per local day, walking the sequence in order — so every
   * posture is the day's posture exactly once every 26 days, whatever the
   * phase and weekday notes happen to name.
   */
  postureOfTheDay: Pose;
  /** postures named by today's notes, resolved and de-duplicated, in sequence order */
  leaning: Pose[];
}

/** Resolve pose ids to poses, dropping unknown ids, in sequence order. */
export function resolvePostures(ids: string[]): Pose[] {
  const wanted = new Set(ids);
  return poses.filter((p) => wanted.has(p.id));
}

export function todayLens(now: number): TodayLens {
  const phase = moonPhase(now);
  const { sun, moon } = luminaryLongitudes(now);
  const weekday = planetaryDay(now);
  const phaseNote = PHASE_NOTES[phase.bucket];
  const dayNote = DAY_NOTES[weekday.index];
  const day = localDayIndex(now);
  return {
    phase,
    moonSign: tropicalSign(moon),
    sunSign: tropicalSign(sun),
    weekday,
    phaseNote,
    dayNote,
    postureOfTheDay: poses[((day % poses.length) + poses.length) % poses.length],
    leaning: resolvePostures([...phaseNote.postures, ...dayNote.postures]),
  };
}
