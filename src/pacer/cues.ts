import type { Pose } from '../data';
import { poses } from '../data';
import { beatsForSeconds } from './timing';

/**
 * The class-cue sequencer: compiles the sequence into a per-posture
 * timeline of instruction events addressed in BEATS, so everything
 * rides the same metronome clock as the pacer. Pure and testable —
 * rendering (speech, tones) happens elsewhere.
 */

export type CueKind =
  /** spoken: "Posture N. <name>." at the top of the hold */
  | 'announce'
  /** spoken: the pose's first setup step, shortly after the announce */
  | 'guide'
  /** spoken: "Second set" (and beyond) at set boundaries */
  | 'set'
  /** tone only: short pre-change warning ticks in the final beats */
  | 'warn';

export interface CueEvent {
  /** 0-based beat within the posture's hold when this fires */
  atBeat: number;
  kind: CueKind;
  /** text for spoken kinds; absent for tones */
  text?: string;
}

export interface PoseTrack {
  pose: Pose;
  /** hold length in beats at the track's tempo */
  totalBeats: number;
  /** events sorted by atBeat */
  events: CueEvent[];
}

export interface CueOptions {
  /** speak the Sanskrit name after the English one */
  sanskrit?: boolean;
  /** include the opening technique cue */
  guides?: boolean;
}

/** Guides start here so they don't talk over the announcement. */
const GUIDE_BEAT = 3;
/** Warning ticks fire on the last three beats, only for holds this long. */
const WARN_MIN_BEATS = 12;

export function announceText(pose: Pose, sanskrit: boolean): string {
  const name = sanskrit ? `${pose.englishName} — ${pose.sanskritName}` : pose.englishName;
  return pose.category === 'breathing' ? `${name}.` : `Posture ${pose.order}. ${name}.`;
}

export function buildPoseTrack(pose: Pose, bpm: number, opts: CueOptions = {}): PoseTrack {
  const totalBeats = beatsForSeconds(pose.approxTotalSeconds, bpm);
  const events: CueEvent[] = [{ atBeat: 0, kind: 'announce', text: announceText(pose, opts.sanskrit ?? false) }];

  if (opts.guides !== false && pose.setup.length > 0 && totalBeats > GUIDE_BEAT + 4) {
    events.push({ atBeat: GUIDE_BEAT, kind: 'guide', text: pose.setup[0] });
  }

  for (let set = 1; set < pose.sets; set++) {
    const atBeat = Math.round((totalBeats * set) / pose.sets);
    events.push({
      atBeat,
      kind: 'set',
      text: set === 1 ? 'Second set.' : `Set ${set + 1}.`,
    });
  }

  if (totalBeats >= WARN_MIN_BEATS) {
    for (let i = 3; i >= 1; i--) {
      events.push({ atBeat: totalBeats - i, kind: 'warn' });
    }
  }

  events.sort((a, b) => a.atBeat - b.atBeat);
  return { pose, totalBeats, events };
}

/** Compile the whole class (from a starting posture) at a tempo. */
export function buildClassTrack(bpm: number, fromOrder = 1, opts: CueOptions = {}): PoseTrack[] {
  return poses.filter((p) => p.order >= fromOrder).map((p) => buildPoseTrack(p, bpm, opts));
}
