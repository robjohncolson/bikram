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
  /** spoken: a segment boundary — "Other side.", "Twenty-second savasana."… */
  | 'segment'
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
  /**
   * Rotates the coaching material so a different subset leads each
   * class (any integer — the view passes a day index). A posture's hold
   * only has room for a few of its lines; without rotation the same few
   * would play forever and the rest of the authored teaching never.
   */
  rotation?: number;
  /**
   * Rehearsal: hold the announcement (and the walk-in behind it) back by
   * this many beats after the hand-off, so the practitioner has to
   * recall what comes next before the voice says it. Clamped on short
   * holds so the announce still lands well before the next hand-off.
   */
  announceDelayBeats?: number;
}

/** Seconds into the hold where the setup walk-in starts. */
const WALK_IN_START_S = 4;
/** Spacing between walk-in steps — say it, then time to do it. */
const WALK_IN_GAP_S = 8;
/** Minimum silence between any two spoken lines. */
const SPEECH_GAP_S = 4;
/** Working segments shorter than this get no mid-hold coaching. */
const COACH_MIN_SEGMENT_S = 18;
/** Segments at least this long get two coaching lines instead of one. */
const COACH_DOUBLE_SEGMENT_S = 45;
/** Keep the final approach clear for the warning ticks and hand-off. */
const TAIL_CLEAR_S = 6;
/** Warning ticks fire on the last three beats, only for holds this long. */
const WARN_MIN_BEATS = 12;

/**
 * Which setup steps to speak when only `room` of them fit the walk-in:
 * the first steps (getting into position) and always the last one (the
 * full expression), dropping from the middle. Beats the old tail-drop,
 * which could leave a posture without its final instruction.
 */
export function walkInSteps(count: number, room: number): number[] {
  if (room <= 0 || count <= 0) return [];
  if (room >= count) return Array.from({ length: count }, (_, i) => i);
  const head = Array.from({ length: room - 1 }, (_, i) => i);
  return [...head, count - 1];
}

/** The coaching material for a posture, in the order it should be offered. */
export function coachingMaterial(pose: Pose, rotation = 0): string[] {
  const lines = [...pose.cues, pose.breath].filter((t) => t && t.length > 0);
  // Floor postures breathe first: their holds are short and the breath
  // line is the one instruction that changes what the body does.
  const ordered = pose.category === 'floor' && pose.breath ? [pose.breath, ...pose.cues] : lines;
  if (ordered.length === 0) return [];
  const r = ((rotation % ordered.length) + ordered.length) % ordered.length;
  return [...ordered.slice(r), ...ordered.slice(0, r)];
}

export function announceText(pose: Pose, sanskrit: boolean): string {
  const name = sanskrit ? `${pose.englishName} — ${pose.sanskritName}` : pose.englishName;
  return pose.category === 'breathing' ? `${name}.` : `Posture ${pose.order}. ${name}.`;
}

/** A segment's beat range on the track grid. */
interface SegSpan {
  startBeat: number;
  endBeat: number;
  kind: string;
}

/** Nearest free beat to `target` within [lo, hi], ≥ gap from taken beats. */
function findFreeBeat(
  target: number,
  lo: number,
  hi: number,
  taken: number[],
  gap: number,
): number | null {
  for (let offset = 0; offset <= hi - lo; offset++) {
    for (const candidate of offset === 0 ? [target] : [target + offset, target - offset]) {
      if (candidate < lo || candidate > hi) continue;
      if (taken.every((t) => Math.abs(t - candidate) >= gap)) return candidate;
    }
  }
  return null;
}

/**
 * Compile a posture into its full spoken class: the announcement, a
 * walk-in through every setup step, segment-boundary cues, mid-hold
 * coaching (alignment cues then the breath line) rotated through the
 * later working segments, and warning ticks before the hand-off.
 * Rests stay silent — that's what they're for.
 */
export function buildPoseTrack(pose: Pose, bpm: number, opts: CueOptions = {}): PoseTrack {
  const totalBeats = beatsForSeconds(pose.approxTotalSeconds, bpm);
  // beats per canonical second on this track's grid
  const s2b = totalBeats / pose.approxTotalSeconds;
  const beat = (seconds: number) => Math.round(seconds * s2b);

  // ——— segment spans (boundaries speak below, once the announce beat is known)
  const spans: SegSpan[] = [];
  const boundaryCues: { atBeat: number; text: string }[] = [];
  if (pose.segments && pose.segments.length > 0) {
    const totalSeconds = pose.segments.reduce((s, seg) => s + seg.seconds, 0);
    let elapsed = 0;
    for (let i = 0; i < pose.segments.length; i++) {
      const startBeat = Math.round((elapsed / totalSeconds) * totalBeats);
      elapsed += pose.segments[i].seconds;
      const endBeat =
        i === pose.segments.length - 1
          ? totalBeats
          : Math.round((elapsed / totalSeconds) * totalBeats);
      spans.push({ startBeat, endBeat, kind: pose.segments[i].kind });
      if (i > 0) boundaryCues.push({ atBeat: Math.min(totalBeats - 1, startBeat), text: pose.segments[i].cue });
    }
  } else {
    spans.push({ startBeat: 0, endBeat: totalBeats, kind: 'set' });
  }
  const firstBoundary = spans.length > 1 ? spans[1].startBeat : totalBeats;

  // ——— the announce: at the hand-off, or held back for rehearsal
  const maxDelay = Math.max(
    0,
    Math.min(totalBeats - beat(TAIL_CLEAR_S) - 1, firstBoundary - beat(SPEECH_GAP_S)),
  );
  const delay = Math.max(0, Math.min(Math.round(opts.announceDelayBeats ?? 0), maxDelay));
  const events: CueEvent[] = [{ atBeat: delay, kind: 'announce', text: announceText(pose, opts.sanskrit ?? false) }];
  const spoken: number[] = [delay];

  if (pose.segments && pose.segments.length > 0) {
    for (const b of boundaryCues) {
      events.push({ atBeat: b.atBeat, kind: 'segment', text: b.text });
      spoken.push(b.atBeat);
    }
  } else {
    for (let set = 1; set < pose.sets; set++) {
      const atBeat = Math.round((totalBeats * set) / pose.sets);
      events.push({ atBeat, kind: 'set', text: set === 1 ? 'Second set.' : `Set ${set + 1}.` });
      spoken.push(atBeat);
    }
  }

  if (opts.guides !== false) {
    // ——— walk-in: the setup steps, confined to the first segment, behind
    // the announce; when they do not all fit, drop from the middle
    const walkInLimit = Math.min(firstBoundary - beat(SPEECH_GAP_S), totalBeats - beat(TAIL_CLEAR_S));
    const slot = (i: number) => delay + beat(WALK_IN_START_S + i * WALK_IN_GAP_S);
    let room = 0;
    while (room < pose.setup.length && slot(room) <= walkInLimit) room++;
    let lastWalkIn = delay;
    walkInSteps(pose.setup.length, room).forEach((stepIdx, i) => {
      const atBeat = slot(i);
      events.push({ atBeat, kind: 'guide', text: pose.setup[stepIdx] });
      spoken.push(atBeat);
      lastWalkIn = atBeat;
    });

    // ——— coaching rotation: mid-segment in working segments, starting
    // with whatever room the walk-in leaves in the first one; rests stay
    // silent. `rotation` decides which lines lead today.
    const material = coachingMaterial(pose, opts.rotation ?? 0);
    let next = 0;
    const coach = (from: number, to: number) => {
      const len = to - from;
      if (len < beat(COACH_MIN_SEGMENT_S)) return;
      const slots = len >= beat(COACH_DOUBLE_SEGMENT_S) ? [0.35, 0.7] : [0.5];
      for (const frac of slots) {
        if (next >= material.length) break;
        const lo = from + beat(SPEECH_GAP_S);
        const hi = Math.min(to - beat(SPEECH_GAP_S), totalBeats - beat(TAIL_CLEAR_S));
        const place = findFreeBeat(from + Math.round(len * frac), lo, hi, spoken, beat(SPEECH_GAP_S));
        if (place !== null) {
          events.push({ atBeat: place, kind: 'guide', text: material[next] });
          spoken.push(place);
          next++;
        }
      }
    };
    for (let i = 0; i < spans.length && next < material.length; i++) {
      const span = spans[i];
      if (span.kind === 'rest' || span.kind === 'situp') continue;
      coach(i === 0 ? lastWalkIn : span.startBeat, span.endBeat);
    }
  }

  if (totalBeats >= WARN_MIN_BEATS) {
    for (let i = 3; i >= 1; i--) {
      events.push({ atBeat: totalBeats - i, kind: 'warn' });
    }
  }

  events.sort((a, b) => a.atBeat - b.atBeat);
  return { pose, totalBeats, events };
}

export interface SegmentPosition {
  /** index into pose.segments */
  index: number;
  label: string;
  kind: string;
  /** beats remaining in this segment (including the current one) */
  beatsLeft: number;
}

/**
 * Which segment a given 0-based track beat falls in, on the same scaled
 * beat grid buildPoseTrack uses. Null when the pose has no segments.
 */
export function segmentAtBeat(track: PoseTrack, beat: number): SegmentPosition | null {
  const segs = track.pose.segments;
  if (!segs || segs.length === 0) return null;
  const totalSeconds = segs.reduce((s, seg) => s + seg.seconds, 0);
  const clamped = Math.min(Math.max(beat, 0), track.totalBeats - 1);
  let elapsed = 0;
  for (let i = 0; i < segs.length; i++) {
    elapsed += segs[i].seconds;
    // the last segment always closes the track exactly
    const end = i === segs.length - 1 ? track.totalBeats : Math.round((elapsed / totalSeconds) * track.totalBeats);
    if (clamped < end) {
      return { index: i, label: segs[i].label, kind: segs[i].kind, beatsLeft: end - clamped };
    }
  }
  const last = segs.length - 1;
  return { index: last, label: segs[last].label, kind: segs[last].kind, beatsLeft: 1 };
}

/** Compile the whole class (from a starting posture) at a tempo. */
export function buildClassTrack(bpm: number, fromOrder = 1, opts: CueOptions = {}): PoseTrack[] {
  return poses.filter((p) => p.order >= fromOrder).map((p) => buildPoseTrack(p, bpm, opts));
}
