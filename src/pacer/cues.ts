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

  const events: CueEvent[] = [{ atBeat: 0, kind: 'announce', text: announceText(pose, opts.sanskrit ?? false) }];
  const spoken: number[] = [0];

  // ——— segment boundaries (spoken) and spans
  const spans: SegSpan[] = [];
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
      if (i > 0) {
        const atBeat = Math.min(totalBeats - 1, startBeat);
        events.push({ atBeat, kind: 'segment', text: pose.segments[i].cue });
        spoken.push(atBeat);
      }
    }
  } else {
    for (let set = 1; set < pose.sets; set++) {
      const atBeat = Math.round((totalBeats * set) / pose.sets);
      events.push({ atBeat, kind: 'set', text: set === 1 ? 'Second set.' : `Set ${set + 1}.` });
      spoken.push(atBeat);
    }
    spans.push({ startBeat: 0, endBeat: totalBeats, kind: 'set' });
  }

  if (opts.guides !== false) {
    // ——— walk-in: every setup step, confined to the first segment
    const firstBoundary = spans.length > 1 ? spans[1].startBeat : totalBeats;
    const walkInLimit = Math.min(firstBoundary - beat(SPEECH_GAP_S), totalBeats - beat(TAIL_CLEAR_S));
    for (let i = 0; i < pose.setup.length; i++) {
      const atBeat = beat(WALK_IN_START_S + i * WALK_IN_GAP_S);
      if (atBeat > walkInLimit) break;
      events.push({ atBeat, kind: 'guide', text: pose.setup[i] });
      spoken.push(atBeat);
    }

    // ——— coaching rotation: alignment cues then breath, mid-segment in
    // working segments after the walk-in's segment; rests stay silent
    const material = [...pose.cues, pose.breath].filter((t) => t && t.length > 0);
    let next = 0;
    for (let i = 1; i < spans.length && next < material.length; i++) {
      const span = spans[i];
      if (span.kind === 'rest' || span.kind === 'situp') continue;
      const len = span.endBeat - span.startBeat;
      if (len < beat(COACH_MIN_SEGMENT_S)) continue;
      const slots = len >= beat(COACH_DOUBLE_SEGMENT_S) ? [0.35, 0.7] : [0.5];
      for (const frac of slots) {
        if (next >= material.length) break;
        const lo = span.startBeat + beat(SPEECH_GAP_S);
        const hi = Math.min(span.endBeat - beat(SPEECH_GAP_S), totalBeats - beat(TAIL_CLEAR_S));
        const place = findFreeBeat(span.startBeat + Math.round(len * frac), lo, hi, spoken, beat(SPEECH_GAP_S));
        if (place !== null) {
          events.push({ atBeat: place, kind: 'guide', text: material[next] });
          spoken.push(place);
          next++;
        }
      }
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
