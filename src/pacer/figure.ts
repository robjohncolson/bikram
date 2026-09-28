/**
 * Class-synchronised figure: maps each posture's class-time segments onto
 * its sprite-sheet stages so the animated figure moves WITH the class — it
 * gets into the posture when the cue says so, holds while the class holds,
 * changes side when the side changes, lies down for the savasana between
 * sets and sits up for the sit-up. Pure: a plan is compiled once per
 * posture (`figurePlan`), then `figureFrameAt` answers "which sprite
 * frame now?" from seconds into the segment.
 *
 * Sheets (see scripts/blender/render_motion.py) are a chain of held stages
 * joined by short transitions; `stage.frame` is the first frame of a hold,
 * and the transition INTO a stage is the handful of frames just before it.
 * The sheet has no path back from its last stage to its first, so that hop
 * is a cut — every posture's last stage is a rise/release, so it is small.
 *
 * Segment → stages, by label (no authoring needed; `figure.test.ts` checks
 * every authored segment resolves to a real stage):
 * - `rest` segments show the savasana sheet, `situp` ones the sit-up sheet
 *   (its whole cycle spread across the segment);
 * - `breath` segments follow the breath: Pranayama's Inhale/Exhale stages
 *   scrub with the metronome's phase, Kapalbhati's Pump/Release cycle once
 *   per beat;
 * - "right …"/"left …"/"both …" pick that side's deepest stage (the last
 *   non-neutral stage of its run — "Face the right foot → Head to knee"
 *   lands on Head to knee); when a sheet names no "right" stage the
 *   right side is everything before the first "left" one;
 * - "all three parts" walks each side in turn; a label naming a stage
 *   ("backbend", "part two") picks it; anything else ("First set") lands
 *   on the climax — the last non-neutral stage of the sheet.
 * Stages passed on the way in are setup steps and get a brief hold each
 * (a fraction of the segment, 1.5–8 s), so the entry reads as the dialogue
 * does: hold the foot, kick out, elbows down… then the hold proper.
 */
import type { Pose, PoseMotion, PoseSegment } from '../data';
import { getPose } from '../data';
import { segmentKey } from './grid';
import type { PoseTrack } from './cues';
import { mapSteps } from './stagematch';

/** frames a stage-to-stage transition takes in the sheets (6–8 by posture);
 *  the larger value so a hop never misses motion — at worst a still hold
 *  frame or two lead it */
export const TRANSITION_FRAMES = 8;
const NEUTRAL = /^(release|centre|center|rise|lower|change|stand)$/i;
const SIDE_WORDS = ['right', 'left', 'both'] as const;
type Side = (typeof SIDE_WORDS)[number];

/** A movement the spoken class asks for: reach `stage` at `seconds` into the segment. */
export interface FigureMove {
  seconds: number;
  stage: number;
}

export type FigureSegment =
  | {
      kind: 'stages';
      motion: PoseMotion;
      /** stage the segment starts from (where the previous one left the figure) */
      from: number;
      /** stages to reach in turn, sharing the segment's time evenly */
      targets: number[];
      /**
       * when the class's own spoken walk-in drives the entry: each setup
       * line that names a stage moves the figure there as the line ends
       * (figure seconds, i.e. with the figure's lead over the class)
       */
      moves?: FigureMove[];
      /** figure seconds when the last spoken walk-in line ends: the entry completes after it */
      settle?: number;
    }
  | { kind: 'breath'; motion: PoseMotion; inhale: number; exhale: number }
  | { kind: 'pulse'; motion: PoseMotion; from: number; to: number };

export interface FigurePlan {
  segments: FigureSegment[];
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const hasWord = (label: string, w: string) => new RegExp(`\\b${w}\\b`, 'i').test(label);
const isNeutral = (m: PoseMotion, i: number) => NEUTRAL.test(m.stages[i].label.trim());
const sideOf = (label: string): Side | undefined => SIDE_WORDS.find((w) => hasWord(label, w));

/** The last non-neutral stage of the sheet (stage 0 if nothing else). */
export function climaxStage(m: PoseMotion): number {
  for (let i = m.stages.length - 1; i >= 0; i--) if (!isNeutral(m, i)) return i;
  return 0;
}

/** Extend from stage i through following non-neutral stages of the same side. */
function extendRun(m: PoseMotion, i: number, side?: Side): number {
  while (i + 1 < m.stages.length) {
    const next = m.stages[i + 1].label;
    if (isNeutral(m, i + 1)) break;
    const s = sideOf(next);
    if (s && s !== side) break;
    i++;
  }
  return i;
}

/** First stage whose label names the side, searching forward (cyclic) from the cursor. */
function findSide(m: PoseMotion, side: Side, cursor: number): number | undefined {
  const n = m.stages.length;
  for (let k = 1; k <= n; k++) {
    const i = (cursor + k) % n;
    if (hasWord(m.stages[i].label, side)) return i;
  }
  return undefined;
}

/** The deepest stage of one side, or undefined when the sheet has no such side. */
export function sideStage(m: PoseMotion, side: Side, cursor: number): number | undefined {
  const i = findSide(m, side, cursor);
  if (i !== undefined) return extendRun(m, i, side);
  if (side !== 'right') return undefined;
  // a sheet whose first half is the right side without saying so
  const left = findSide(m, 'left', -1);
  if (left === undefined) return undefined;
  for (let j = left - 1; j >= 0; j--) if (!isNeutral(m, j)) return j;
  return undefined;
}

/** Stage indices a segment label resolves to on this sheet. */
export function stagesForLabel(m: PoseMotion, label: string, cursor: number): number[] {
  const key = segmentKey(label);
  if (/\ball\b/.test(key)) {
    const runs = SIDE_WORDS.map((s) => sideStage(m, s, cursor)).filter((i): i is number => i !== undefined);
    if (runs.length) return runs;
  }
  const side = sideOf(key);
  if (side) {
    const i = sideStage(m, side, cursor);
    if (i !== undefined) return [i];
  }
  if (/\bstretch/.test(key)) {
    const i = sideStage(m, 'both', cursor);
    if (i !== undefined) return [i];
  }
  if (key) {
    const n = m.stages.length;
    for (let k = 1; k <= n; k++) {
      const i = (cursor + k) % n;
      if (norm(m.stages[i].label) === key) return [extendRun(m, i)];
    }
  }
  return [climaxStage(m)];
}

function breathSegment(m: PoseMotion): FigureSegment | undefined {
  const idx = (w: string, after = -1) => m.stages.findIndex((s, i) => i > after && hasWord(s.label, w));
  const in1 = idx('inhale');
  if (in1 >= 0) {
    const ex = idx('exhale', in1);
    if (ex >= 0) {
      const in2 = idx('inhale', ex);
      return { kind: 'breath', motion: m, inhale: in2 >= 0 ? in2 : in1, exhale: ex };
    }
  }
  const p1 = idx('pump');
  if (p1 >= 0) {
    const p2 = idx('pump', p1);
    return { kind: 'pulse', motion: m, from: m.stages[p1].frame, to: p2 >= 0 ? m.stages[p2].frame : m.frames };
  }
  return undefined;
}

/** How the spoken class reaches the figure: its track and the timing to place lines. */
export interface FigurePlanOptions {
  /** the compiled cue track of the posture — its walk-in lines move the figure */
  track?: PoseTrack;
  /** real seconds per beat at the live tempo */
  beatSeconds?: number;
  /** how many beats the figure runs ahead of the class clock (one bar) */
  leadBeats?: number;
  /** how long a spoken line takes — the move starts when it ends */
  clipSeconds?: (text: string) => number;
}

/**
 * Compile a posture's segments into figure segments. Undefined when the
 * posture has no sheet. A posture without segments gets one segment
 * landing on its climax (the closing savasana uses this). With a track,
 * every walk-in line that names a stage becomes a move: the figure gets
 * there as the line finishes, so what is said is what is shown.
 */
export function figurePlan(pose: Pose, opts: FigurePlanOptions = {}): FigurePlan | undefined {
  const own = pose.motion;
  if (!own) return undefined;
  const savasana = getPose('savasana')?.motion;
  const situp = getPose('situp')?.motion;
  const cursors = new Map<PoseMotion, number>();
  const cursor = (m: PoseMotion) => cursors.get(m) ?? 0;
  const segs: PoseSegment[] = pose.segments?.length
    ? pose.segments
    : [{ kind: 'set', label: '', cue: '', seconds: pose.approxTotalSeconds }];
  const out: FigureSegment[] = [];
  for (const seg of segs) {
    if (seg.kind === 'breath') {
      const b = breathSegment(own);
      if (b) {
        out.push(b);
        continue;
      }
    }
    let m = own;
    let targets: number[];
    if (seg.kind === 'rest' && savasana) {
      m = savasana;
      targets = [climaxStage(m)];
    } else if (seg.kind === 'situp' && situp) {
      m = situp;
      targets = m.stages.map((_, i) => i);
    } else {
      targets = stagesForLabel(m, seg.label, cursor(m));
    }
    const from = cursor(m);
    // only a working segment on the posture's own sheet, entering one target,
    // is walked in by the voice (rests and sit-ups borrow other sheets)
    const spoken =
      m === own && targets.length === 1 && seg.kind !== 'rest' && seg.kind !== 'situp'
        ? walkInMoves(pose, opts, out.length, from, targets[0])
        : undefined;
    out.push({
      kind: 'stages',
      motion: m,
      from,
      targets,
      ...(spoken && spoken.moves.length ? { moves: spoken.moves, settle: spoken.settle } : {}),
    });
    // leaving a sheet (a rest, a sit-up) puts the figure down: the next set
    // on the posture's own sheet re-enters from its first stage
    cursors.clear();
    cursors.set(m, targets[targets.length - 1]);
  }
  return { segments: out };
}

/** The moves the segment's spoken setup lines ask for, in figure seconds, and when the last line ends. */
function walkInMoves(
  pose: Pose,
  opts: FigurePlanOptions,
  segIndex: number,
  from: number,
  target: number,
): { moves: FigureMove[]; settle: number } | undefined {
  const { track, beatSeconds = 1, leadBeats = 0, clipSeconds = () => 0 } = opts;
  const span = track?.spans[segIndex];
  if (!track || !span || !pose.motion) return undefined;
  const lines = track.events.filter(
    (e) =>
      e.kind === 'guide' &&
      e.text !== undefined &&
      pose.setup.includes(e.text) &&
      e.atBeat >= span.startBeat &&
      e.atBeat < span.endBeat,
  );
  if (lines.length === 0) return undefined;
  const labels = pose.motion.stages.map((s) => s.label);
  const texts = lines.map((e) => e.text ?? '');
  const stages = mapSteps(texts, labels, from, target);
  const moves: FigureMove[] = [];
  let settle = 0;
  lines.forEach((e, i) => {
    const ends = (e.atBeat - span.startBeat + leadBeats) * beatSeconds + clipSeconds(texts[i]);
    settle = Math.max(settle, ends);
    const stage = stages[i];
    if (stage === undefined) return;
    moves.push({ seconds: ends, stage });
  });
  return { moves, settle };
}

/** One step of a compiled segment: show `frame` until `until` seconds. */
export interface FrameStep {
  frame: number;
  until: number;
}

/** Frames of the transition into stage b (empty for the cut back to stage 0). */
function hopFrames(m: PoseMotion, b: number): number[] {
  if (b === 0) return [];
  const mark = m.stages[b].frame;
  const start = Math.max(m.stages[b - 1].frame + 1, mark - TRANSITION_FRAMES);
  const out: number[] = [];
  for (let f = start; f < mark; f++) out.push(f);
  return out;
}

/**
 * Lay a 'stages' segment out in real seconds: each target gets an even
 * slice; on the way in, setup stages are held briefly (12% of the slice,
 * 1.5–8 s, scaled down so setup never eats more than 60% of it) and the
 * target holds until the slice ends.
 */
export function segmentTimeline(seg: Extract<FigureSegment, { kind: 'stages' }>, seconds: number): FrameStep[] {
  if (seg.moves && seg.moves.length) return spokenTimeline(seg, seconds, seg.moves);
  const m = seg.motion;
  const n = m.stages.length;
  const dt = 1 / m.fps;
  const slice = seconds / Math.max(1, seg.targets.length);
  const steps: FrameStep[] = [];
  let t = 0;
  let cur = seg.from;
  for (const target of seg.targets) {
    const end = t + slice;
    // the path of stages from cur (exclusive) to target (inclusive), cyclic
    const path: number[] = [];
    for (let i = cur; i !== target; ) {
      i = (i + 1) % n;
      path.push(i);
    }
    const setups = path.filter((i) => i !== target && !isNeutral(m, i));
    const transitionSeconds = path.reduce((s, i) => s + hopFrames(m, i).length * dt, 0);
    let hold = Math.min(8, Math.max(1.5, slice * 0.12));
    const budget = slice * 0.6 - transitionSeconds;
    if (setups.length && hold * setups.length > budget) hold = Math.max(0, budget / setups.length);
    for (const i of path) {
      for (const f of hopFrames(m, i)) {
        t += dt;
        steps.push({ frame: f, until: t });
      }
      if (i !== target && !isNeutral(m, i)) {
        t += hold;
        steps.push({ frame: m.stages[i].frame, until: t });
      }
    }
    t = Math.max(t, end);
    steps.push({ frame: m.stages[target].frame, until: t });
    cur = target;
  }
  return steps;
}

/** Seconds after the last spoken walk-in line before the figure completes the entry on its own. */
const SETTLE_SECONDS = 1.5;

/**
 * Lay a segment out around its spoken moves: hold where the figure is
 * until each line ends, then travel (transition frames only, no setup
 * holds) to the stage the line named; if the lines never reach the
 * target, finish the entry a few seconds after the last one.
 */
function spokenTimeline(
  seg: Extract<FigureSegment, { kind: 'stages' }>,
  seconds: number,
  moves: FigureMove[],
): FrameStep[] {
  const m = seg.motion;
  const n = m.stages.length;
  const dt = 1 / m.fps;
  const target = seg.targets[seg.targets.length - 1];
  const steps: FrameStep[] = [];
  let t = 0;
  let cur = seg.from;
  const travel = (to: number, at: number) => {
    if (at > t) {
      t = at;
      steps.push({ frame: m.stages[cur].frame, until: t });
    }
    for (let i = cur; i !== to; ) {
      i = (i + 1) % n;
      for (const f of hopFrames(m, i)) {
        t += dt;
        steps.push({ frame: f, until: t });
      }
    }
    cur = to;
  };
  const sorted = [...moves].sort((a, b) => a.seconds - b.seconds);
  for (const mv of sorted) {
    if (mv.stage === cur) continue;
    travel(mv.stage, Math.min(mv.seconds, Math.max(0, seconds - 1)));
  }
  if (cur !== target) travel(target, Math.min(Math.max(t, seg.settle ?? 0) + SETTLE_SECONDS, Math.max(0, seconds - 1)));
  t = Math.max(t, seconds);
  steps.push({ frame: m.stages[target].frame, until: t });
  return steps;
}

/** The frame a timeline shows at `t` seconds (its last frame past the end). */
export function frameAt(steps: FrameStep[], t: number): number {
  for (const s of steps) if (t < s.until) return s.frame;
  return steps.length ? steps[steps.length - 1].frame : 0;
}

const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

/** Breath segment: scrub the transition into the phase's stage over the phase. */
export function breathFrame(
  seg: Extract<FigureSegment, { kind: 'breath' }>,
  phase: 'inhale' | 'exhale' | undefined,
  progress: number,
): number {
  const m = seg.motion;
  if (!phase) return m.stages[seg.inhale].frame;
  const b = phase === 'inhale' ? seg.inhale : seg.exhale;
  const mark = m.stages[b].frame;
  const frames = hopFrames(m, b);
  if (!frames.length) return mark;
  const p = Math.min(1, Math.max(0, progress));
  const k = Math.round(easeInOut(p) * frames.length);
  return k >= frames.length ? mark : frames[k];
}

/** Pulse segment: one Pump→Release→Pump cycle per beat, the pump on the beat. */
export function pulseFrame(seg: Extract<FigureSegment, { kind: 'pulse' }>, beatProgress: number): number {
  const span = seg.to - seg.from;
  if (span <= 0) return seg.from;
  const p = Math.min(0.999, Math.max(0, beatProgress));
  return seg.from + Math.floor(p * span);
}

/** Where the live class is inside one figure segment, in real seconds. */
export interface FigureClock {
  /** real seconds into the segment */
  seconds: number;
  /** the segment's real length in seconds */
  total: number;
  /** progress through the current metronome beat, 0–1 */
  beatProgress: number;
  /** the metronome's breath phase and progress through it, when breathing */
  breath?: { phase: 'inhale' | 'exhale'; progress: number };
}

/** The sprite frame a figure segment shows at this moment of the class. */
export function figureFrameAt(seg: FigureSegment, clock: FigureClock, steps?: FrameStep[]): number {
  switch (seg.kind) {
    case 'breath':
      return breathFrame(seg, clock.breath?.phase, clock.breath?.progress ?? 0);
    case 'pulse':
      return pulseFrame(seg, clock.beatProgress);
    case 'stages':
      return frameAt(steps ?? segmentTimeline(seg, clock.total), clock.seconds);
  }
}
