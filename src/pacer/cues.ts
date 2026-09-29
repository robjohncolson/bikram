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
  /**
   * mid-hold coaching lines only: the teaching layer the class figure
   * lights for one breath after the line (see `cueLayer`)
   */
  layer?: CueLayer;
}

/** A teaching layer of the figure: the alignment guides or the common-mistake ghost. */
export type CueLayer = 'ghost' | 'guides';

/** Words that mark a coaching line as describing the mistake to avoid. */
const MISTAKE_WORDS = /\b(?:not|never|don't|do not|instead|rather than|mistake|avoid|stop|without)\b/i;

/**
 * Which teaching layer a coaching line lights: a line that names the
 * common mistake ("don't…", "never…", "instead of…") shows the ghost,
 * any other coaching line shows the alignment guides. Pass coaching text
 * only — setup steps, announces and segment cues light nothing, and
 * neither does an empty line.
 */
export function cueLayer(text: string): CueLayer | undefined {
  const t = text.replace(/[‘’]/g, "'").trim();
  if (!t) return undefined;
  return MISTAKE_WORDS.test(t) ? 'ghost' : 'guides';
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
  /**
   * beats at the start of the segment spent getting in — the announce
   * and the walk-in lines of a first set, one breath for a later set —
   * before the hold proper (the authored seconds) begins
   */
  entryBeats: number;
}

const SECOND_SET_LABEL = /^(second|third) set\b/i;

/** Lines per breath while walking in: a teacher's pace, one line a bar. */
const WALK_IN_LINES_PER_BREATH = 2;

/**
 * Which setup steps belong to which segment. Steps are read in order;
 * a step that names a later part of the posture (Half Moon's "for the
 * backbend…", Awkward's "part two:") moves the bucket to the first
 * segment about that part, and the steps after it follow until the next
 * named part. Steps naming nothing stay with the current bucket.
 */
const working = (sp: { kind: string }) => sp.kind !== 'rest' && sp.kind !== 'situp';

export function walkInBuckets(pose: Pose, spans: SegSpan[]): Map<number, string[]> {
  const buckets = new Map<number, string[]>();
  const firstOf = new Map<string, number>();
  spans.forEach((sp, i) => {
    if (sp.kind === 'rest' || sp.kind === 'situp') return;
    if (sp.phrase && !firstOf.has(sp.phrase)) firstOf.set(sp.phrase, i);
  });
  // a step that opens by naming the second side belongs to the first
  // segment about the left ("On the second side, everything mirrors…")
  const leftSeg = spans.findIndex((sp, i) => working(sp) && i > 0 && /\bleft\b/i.test(pose.segments?.[i]?.label ?? ''));
  let cur = 0;
  for (const step of pose.setup) {
    for (const [phrase, idx] of firstOf) {
      if (idx > cur && mentionsPhrase(step, phrase)) cur = Math.max(cur, idx);
    }
    let at = cur;
    if (leftSeg > cur && /^(on|for) the (second|other|left) side\b/i.test(step.trim())) at = leftSeg;
    const list = buckets.get(at) ?? [];
    list.push(step);
    buckets.set(at, list);
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

  // in pulse mode a "breath" is one beat, so spoken lines pace themselves
  // by a nominal breath instead (the default six-count's twelve beats)
  const stride = breath > 1 ? breath : breathBeats(DEFAULT_BAR_BEATS);
  const lineStride = stride / WALK_IN_LINES_PER_BREATH;
  /** whole strides covering `lines` spoken lines, one a bar */
  const entryFor = (lines: number) => (lines > 0 ? Math.ceil(lines / WALK_IN_LINES_PER_BREATH) * stride : 0);

  // ——— segment spans on the breath grid: each set's entry (its spoken
  // walk-in, or one breath to get in) comes BEFORE the authored hold
  const segs = pose.segments && pose.segments.length > 0 ? pose.segments : undefined;
  const shape: SegSpan[] = (segs ?? [{ kind: 'set', label: '', cue: '', seconds: pose.approxTotalSeconds }]).map(
    (seg) => ({ startBeat: 0, endBeat: 0, kind: seg.kind, phrase: segmentPhrase(seg.label), entryBeats: 0 }),
  );
  const buckets = opts.guides === false ? new Map<number, string[]>() : walkInBuckets(pose, shape);
  const spans: SegSpan[] = [];
  const boundaryCues: { atBeat: number; text: string }[] = [];
  let totalBeats = 0;
  shape.forEach((sh, i) => {
    const seconds = segs ? segs[i].seconds : pose.approxTotalSeconds;
    const label = segs ? segs[i].label : '';
    const steps = buckets.get(i)?.length ?? 0;
    let entryBeats = 0;
    if (working(sh)) {
      if (i === 0) entryBeats = entryFor(1 + steps); // the announce, then the walk-in
      else if (steps > 0) entryBeats = entryFor(steps);
      else if (SECOND_SET_LABEL.test(label) && !SECOND_SET_LABEL.test(segs?.[i - 1]?.label ?? '')) entryBeats = stride;
    }
    const beats = entryBeats + q(seconds);
    spans.push({ ...sh, startBeat: totalBeats, endBeat: totalBeats + beats, entryBeats });
    totalBeats += beats;
  });
  if (segs) {
    for (let i = 1; i < spans.length; i++) {
      boundaryCues.push({ atBeat: spans[i].startBeat - barBeats, text: segs[i].cue });
    }
  }
  const gap = Math.round(SPEECH_GAP_S * (bpm / 60));
  const breathsIn = (sp: SegSpan) => (sp.endBeat - sp.startBeat) / stride;
  const inhaleStart = (sp: SegSpan, k: number) => sp.startBeat + k * stride;
  const holdFromBreath = (sp: SegSpan) => sp.entryBeats / stride;

  // ——— the announce: at the hand-off, or held back for rehearsal (never
  // into the first change cue's silence gap, nor into the final approach)
  const firstCue = boundaryCues.length ? boundaryCues[0].atBeat : totalBeats;
  // (a walk-in line the delayed announce collides with is simply skipped)
  const maxDelay = Math.max(0, Math.min(totalBeats - breath, spans[0].entryBeats + stride - gap, firstCue - gap));
  const delay = Math.max(0, Math.min(Math.round(opts.announceDelayBeats ?? 0), maxDelay));
  const events: CueEvent[] = [
    { atBeat: delay, kind: 'announce', text: announceText(pose, opts.sanskrit ?? false) },
  ];
  const spoken: number[] = [delay];
  const free = (b: number) => b >= 0 && b < totalBeats && spoken.every((t) => Math.abs(t - b) >= gap);

  if (segs) {
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
    // ——— walk-in: each segment's own setup steps, one a bar, inside the
    // segment's entry (the first bar is the announce or the change itself);
    // when they do not all fit, drop from the middle
    for (const [segIdx, steps] of buckets) {
      const sp = spans[segIdx];
      const slots: number[] = [];
      for (let b = sp.startBeat + lineStride; b < sp.startBeat + sp.entryBeats; b += lineStride) {
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
      const h0 = holdFromBreath(sp); // coaching lives in the hold, not the entry
      const hold = n - h0;
      if (hold < COACH_MIN_BREATHS) continue;
      const fracs = hold >= COACH_DOUBLE_BREATHS ? [0.35, 0.7] : [0.5];
      for (const frac of fracs) {
        const line = material.find((l) => !used.has(l) && lineFitsSegment(l, sp, phrases));
        if (!line) break;
        const want = Math.min(n - 1, Math.max(h0, h0 + Math.round(hold * frac)));
        let place: number | null = null;
        for (let d = 0; d < hold && place === null; d++) {
          for (const k of d === 0 ? [want] : [want + d, want - d]) {
            if (k < h0 || k > n - 1) continue;
            const b = inhaleStart(sp, k);
            if (b > delay && free(b)) {
              place = b;
              break;
            }
          }
        }
        if (place === null) break;
        const layer = cueLayer(line);
        events.push({ atBeat: place, kind: 'guide', text: line, ...(layer ? { layer } : {}) });
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

/** Whole minutes a program's class takes at a tempo — the compiled tracks' honest length. */
export function classMinutes(program: ClassProgram, bpm = 60, beatsPerBar = DEFAULT_BAR_BEATS): number {
  const beats = programPoses(program).reduce((s, p) => s + buildPoseTrack(p, 60, { beatsPerBar }).totalBeats, 0);
  return Math.round((beats * (60 / bpm)) / 60);
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
  /** still getting into the posture (the set's entry); false once the hold proper runs */
  entering: boolean;
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
    entering: beatsIn < sp.entryBeats,
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
