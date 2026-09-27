import type { Pose } from '../data';
import { poses } from '../data';
import { beatsForSeconds } from './timing';
import type { ClassProgram } from './programs';
import { programPoses } from './programs';
import { DEFAULT_BAR_BEATS, breathBeats, mentionsPhrase, poseBarBeats, quantizeBeats, segmentPhrase } from './grid';

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
  /** hold length in beats at the track's tempo — always whole breaths */
  totalBeats: number;
  /** beats per bar (breath phase) on this track */
  barBeats: number;
  /** beats per full breath (two bars; one in pulse mode) */
  breathBeats: number;
  /** the segments' beat ranges, quantised to whole breaths */
  spans: SegSpan[];
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
  /** the user's beats per bar — sets the breath grid unless the posture overrides it */
  beatsPerBar?: number;
}

/** Minimum silence between any two spoken lines (beats at the 60 BPM grid). */
const SPEECH_GAP_S = 4;
/** Working segments shorter than this many breaths get no mid-hold coaching. */
const COACH_MIN_BREATHS = 2;
/** Segments at least this many breaths long get two coaching lines. */
const COACH_DOUBLE_BREATHS = 4;
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

/** Seconds of final savasana after the last posture, at the 60 BPM reference. */
export const CLOSING_SECONDS = 120;
/** The one line spoken as the class ends and the final savasana begins. */
export const CLOSING_LINE =
  'The class is complete. Lie back into savasana, let the breath go, and stay for two minutes.';

export function announceText(pose: Pose, sanskrit: boolean): string {
  const name = sanskrit ? `${pose.englishName} — ${pose.sanskritName}` : pose.englishName;
  return pose.category === 'breathing' ? `${name}.` : `Posture ${pose.order}. ${name}.`;
}

/** A segment's beat range on the track grid. */
export interface SegSpan {
  startBeat: number;
  endBeat: number;
  kind: string;
  /** what the segment is about (see grid.ts `segmentPhrase`) */
  phrase: string;
}

/**
 * Which setup steps belong to which segment. Steps are read in order;
 * a step that names a later part of the posture (Half Moon's "for the
 * backbend…", Awkward's "part two:") moves the bucket to the first
 * segment about that part, and the steps after it follow until the next
 * named part. Steps naming nothing stay with the current bucket.
 */
export function walkInBuckets(pose: Pose, spans: SegSpan[]): Map<number, string[]> {
  const buckets = new Map<number, string[]>();
  const firstOf = new Map<string, number>();
  spans.forEach((sp, i) => {
    if (sp.kind === 'rest' || sp.kind === 'situp') return;
    if (sp.phrase && !firstOf.has(sp.phrase)) firstOf.set(sp.phrase, i);
  });
  let cur = 0;
  for (const step of pose.setup) {
    for (const [phrase, idx] of firstOf) {
      if (idx > cur && mentionsPhrase(step, phrase)) cur = Math.max(cur, idx);
    }
    const list = buckets.get(cur) ?? [];
    list.push(step);
    buckets.set(cur, list);
  }
  return buckets;
}

/**
 * May a coaching line play in this segment? A line that names one part
 * of the posture ("in the backbend…") plays only in segments about that
 * part; a line naming nothing plays anywhere the work is happening.
 */
export function lineFitsSegment(line: string, span: SegSpan, phrases: string[]): boolean {
  const named = phrases.filter((p) => p && mentionsPhrase(line, p));
  if (named.length === 0) return true;
  return !span.phrase || named.includes(span.phrase);
}

/**
 * Compile a posture into its full spoken class on the breath grid. The
 * announcement lands on the first inhale; every other spoken line lands
 * on the START of an inhale — except a segment's change cue ("Other
 * side.", "Sit-up."), which lands on the start of the LAST EXHALE of the
 * segment it closes, so the move happens on that exhale and the new hold
 * begins with an inhale. Setup steps walk in through the segments they
 * describe, coaching lines only where they apply; rests stay silent.
 */
export function buildPoseTrack(pose: Pose, bpm: number, opts: CueOptions = {}): PoseTrack {
  const barBeats = poseBarBeats(pose, opts.beatsPerBar ?? DEFAULT_BAR_BEATS);
  const breath = breathBeats(barBeats);
  const q = (seconds: number) => quantizeBeats(beatsForSeconds(seconds, bpm), breath);

  // ——— segment spans on the breath grid
  const spans: SegSpan[] = [];
  const boundaryCues: { atBeat: number; text: string }[] = [];
  let totalBeats = 0;
  if (pose.segments && pose.segments.length > 0) {
    for (const seg of pose.segments) {
      const beats = q(seg.seconds);
      spans.push({
        startBeat: totalBeats,
        endBeat: totalBeats + beats,
        kind: seg.kind,
        phrase: segmentPhrase(seg.label),
      });
      totalBeats += beats;
    }
    for (let i = 1; i < spans.length; i++) {
      boundaryCues.push({ atBeat: spans[i].startBeat - barBeats, text: pose.segments[i].cue });
    }
  } else {
    totalBeats = q(pose.approxTotalSeconds);
    spans.push({ startBeat: 0, endBeat: totalBeats, kind: 'set', phrase: '' });
  }
  const gap = Math.round(SPEECH_GAP_S * (bpm / 60));
  // in pulse mode a "breath" is one beat, so spoken lines pace themselves
  // by a nominal breath instead (the default six-count's twelve beats)
  const stride = breath > 1 ? breath : breathBeats(DEFAULT_BAR_BEATS);
  const breathsIn = (sp: SegSpan) => (sp.endBeat - sp.startBeat) / stride;
  const inhaleStart = (sp: SegSpan, k: number) => sp.startBeat + k * stride;
  const working = (sp: SegSpan) => sp.kind !== 'rest' && sp.kind !== 'situp';

  // ——— the announce: at the hand-off, or held back for rehearsal (never
  // into the first change cue's silence gap, nor into the final approach)
  const firstCue = boundaryCues.length ? boundaryCues[0].atBeat : totalBeats;
  const maxDelay = Math.max(0, Math.min(totalBeats - breath, inhaleStart(spans[0], 1) - gap, firstCue - gap));
  const delay = Math.max(0, Math.min(Math.round(opts.announceDelayBeats ?? 0), maxDelay));
  const events: CueEvent[] = [
    { atBeat: delay, kind: 'announce', text: announceText(pose, opts.sanskrit ?? false) },
  ];
  const spoken: number[] = [delay];
  const free = (b: number) => b >= 0 && b < totalBeats && spoken.every((t) => Math.abs(t - b) >= gap);

  if (pose.segments && pose.segments.length > 0) {
    for (const b of boundaryCues) {
      events.push({ atBeat: b.atBeat, kind: 'segment', text: b.text });
      spoken.push(b.atBeat);
    }
  } else {
    for (let set = 1; set < pose.sets; set++) {
      // set changes sit on the grid too: the last exhale before the set's first breath
      const setStart = Math.round((breathsIn(spans[0]) * set) / pose.sets) * breath;
      const atBeat = Math.max(delay + gap, setStart - barBeats);
      events.push({ atBeat, kind: 'set', text: set === 1 ? 'Second set.' : `Set ${set + 1}.` });
      spoken.push(atBeat);
    }
  }

  if (opts.guides !== false) {
    // ——— walk-in: each segment's own setup steps on its inhales, from its
    // second breath (the first is for the announce or the change itself);
    // when they do not all fit, drop from the middle
    for (const [segIdx, steps] of walkInBuckets(pose, spans)) {
      const sp = spans[segIdx];
      const slots: number[] = [];
      for (let k = 1; k < breathsIn(sp); k++) {
        const b = inhaleStart(sp, k);
        if (b > delay && free(b) && slots.every((t) => b - t >= gap)) slots.push(b);
      }
      walkInSteps(steps.length, slots.length).forEach((stepIdx, i) => {
        events.push({ atBeat: slots[i], kind: 'guide', text: steps[stepIdx] });
        spoken.push(slots[i]);
      });
    }

    // ——— coaching rotation: mid-segment in working segments, on inhales,
    // only lines that fit the segment; `rotation` decides which lead today
    const material = coachingMaterial(pose, opts.rotation ?? 0);
    const phrases = [...new Set(spans.map((sp) => sp.phrase))];
    const used = new Set<string>();
    for (const sp of spans) {
      if (!working(sp)) continue;
      const n = breathsIn(sp);
      if (n < COACH_MIN_BREATHS) continue;
      const fracs = n >= COACH_DOUBLE_BREATHS ? [0.35, 0.7] : [0.5];
      for (const frac of fracs) {
        const line = material.find((l) => !used.has(l) && lineFitsSegment(l, sp, phrases));
        if (!line) break;
        const want = Math.min(n - 1, Math.max(1, Math.round(n * frac)));
        let place: number | null = null;
        for (let d = 0; d < n && place === null; d++) {
          for (const k of d === 0 ? [want] : [want + d, want - d]) {
            if (k < 1 || k > n - 1) continue;
            const b = inhaleStart(sp, k);
            if (b > delay && free(b)) {
              place = b;
              break;
            }
          }
        }
        if (place === null) break;
        events.push({ atBeat: place, kind: 'guide', text: line });
        spoken.push(place);
        used.add(line);
      }
    }
  }

  if (totalBeats >= WARN_MIN_BEATS) {
    for (let i = 3; i >= 1; i--) {
      events.push({ atBeat: totalBeats - i, kind: 'warn' });
    }
  }

  events.sort((a, b) => a.atBeat - b.atBeat);
  return { pose, totalBeats, barBeats, breathBeats: breath, spans, events };
}

export interface SegmentPosition {
  /** index into pose.segments */
  index: number;
  label: string;
  kind: string;
  /** beats remaining in this segment (including the current one) */
  beatsLeft: number;
  /** beats already elapsed in this segment (0 on its first beat) */
  beatsIn: number;
  /** the segment's full length in beats */
  beats: number;
  /** 0-based breath within the segment */
  breath: number;
  /** breaths in the segment */
  breaths: number;
  /** where in the breath this beat falls; pulse mode has no phases */
  phase: 'inhale' | 'exhale' | 'pulse';
  /** 0-based beat within the current bar (phase) */
  beatInBar: number;
  /** beats per bar on this track */
  barBeats: number;
}

/**
 * Which segment a given 0-based track beat falls in, with its place on
 * the breath grid. Null when the pose has no segments.
 */
export function segmentAtBeat(track: PoseTrack, beat: number): SegmentPosition | null {
  const segs = track.pose.segments;
  if (!segs || segs.length === 0) return null;
  const clamped = Math.min(Math.max(beat, 0), track.totalBeats - 1);
  const i = Math.max(
    0,
    track.spans.findIndex((sp) => clamped < sp.endBeat),
  );
  const sp = track.spans[i];
  const beatsIn = clamped - sp.startBeat;
  const inBreath = beatsIn % track.breathBeats;
  return {
    index: i,
    label: segs[i].label,
    kind: segs[i].kind,
    beatsLeft: sp.endBeat - clamped,
    beatsIn,
    beats: sp.endBeat - sp.startBeat,
    breath: Math.floor(beatsIn / track.breathBeats),
    breaths: (sp.endBeat - sp.startBeat) / track.breathBeats,
    phase: track.barBeats <= 1 ? 'pulse' : inBreath < track.barBeats ? 'inhale' : 'exhale',
    beatInBar: track.barBeats <= 1 ? 0 : inBreath % track.barBeats,
    barBeats: track.barBeats,
  };
}

/** The breath phase of any track beat, segments or not. */
export function phaseAtBeat(
  track: PoseTrack,
  beat: number,
): { phase: 'inhale' | 'exhale' | 'pulse'; beatInBar: number; bar: number } {
  const b = Math.max(0, beat);
  if (track.barBeats <= 1) return { phase: 'pulse', beatInBar: 0, bar: b };
  const bar = Math.floor(b / track.barBeats);
  return { phase: bar % 2 === 0 ? 'inhale' : 'exhale', beatInBar: b % track.barBeats, bar };
}

/** The next spoken cue after this beat (the one the practitioner is heading for). */
export function nextSpokenCue(track: PoseTrack, beat: number): CueEvent | undefined {
  return track.events.find((e) => e.atBeat > beat && e.text !== undefined);
}

const ORDINALS = [
  'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
  'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth',
];

/**
 * Where the next spoken cue lands, in words and without digits: "fourth
 * breath, on the exhale" within the current segment, "last breath, on the
 * exhale" for the change that closes it, "when <segment> begins" when it
 * belongs to a later one. Pulse mode counts pulses, not breaths, so it
 * only says "at the end of this set". Undefined when nothing more is said.
 */
export function cueWhen(track: PoseTrack, beat: number): string | undefined {
  const ev = nextSpokenCue(track, beat);
  if (!ev) return undefined;
  const here = segmentAtBeat(track, beat);
  const there = segmentAtBeat(track, ev.atBeat);
  if (!here || !there) return undefined;
  if (there.phase === 'pulse') return 'at the end of this set';
  const phase = `on the ${there.phase}`;
  if (there.index !== here.index) return `when ${track.pose.segments?.[there.index]?.label.toLowerCase() ?? 'the next part'} begins`;
  if (there.breath === there.breaths - 1) return `last breath, ${phase}`;
  if (there.breath === here.breath) return `this breath, ${phase}`;
  if (there.breath === here.breath + 1) return `next breath, ${phase}`;
  const ord = ORDINALS[there.breath] ?? `${there.breath + 1}th`;
  return `${ord} breath, ${phase}`;
}

/**
 * Compile a class at a tempo: the whole sequence from a starting posture
 * (`fromOrder`, as `/pace?from=` uses it), or a program — its postures,
 * trimmed at the segment level so a first-set-only posture never cues a
 * second set.
 */
export function buildClassTrack(
  bpm: number,
  from: number | ClassProgram = 1,
  opts: CueOptions = {},
): PoseTrack[] {
  const list = typeof from === 'number' ? poses.filter((p) => p.order >= from) : programPoses(from);
  return list.map((p) => buildPoseTrack(p, bpm, opts));
}
