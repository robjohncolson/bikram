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
 * - `rest` segments show the savasana sheet or stage zero of a prone sheet;
 *   `situp` ones show the sit-up sheet (its whole cycle across the segment);
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
 *
 * Bridges: every sheet opens in its own body position (standing, lying on
 * the back or front, kneeling, seated — `PoseMotion.position`). When the
 * figure changes sheet between two positions (into a posture, or inside
 * one when a rest borrows the savasana sheet) the segment carries the
 * hand-off `bridge` sheet (`bridgeFor`), which plays through once before
 * the segment's own steps: the figure rolls over, sits up, kneels… so a
 * line such as "lie on your stomach" never lands on a figure already there.
 */
import type { Pose, PoseMotion, PoseSegment } from '../data';
import { bridgeFor, getPose } from '../data';
import { segmentKey } from './grid';
import type { PoseTrack } from './cues';
import { mapSteps } from './stagematch';
import { tempoOf } from './tempo';

/** frames a stage-to-stage transition takes in the sheets (6–8 by posture);
 *  the larger value so a hop never misses motion — at worst a still hold
 *  frame or two lead it */
export const TRANSITION_FRAMES = 8;
const NEUTRAL = /^(release|centre|center|rise|lower|change|stand)$/i;
const SIDE_WORDS = ['right', 'left', 'both'] as const;
type Side = (typeof SIDE_WORDS)[number];

/** A movement the spoken class asks for: start for `stage` at `seconds` into the segment. */
export interface FigureMove {
  seconds: number;
  stage: number;
  /**
   * how long the travel takes, when the line sets a tempo ("slowly", "in
   * one motion", "on an inhale"); undefined = the sheet's own fps
   */
  over?: number;
}

/** A hand-off bridge a segment plays before its own frames. */
export interface FigureBridge {
  /** the bridge sheet from the previous sheet's end position to this sheet's start */
  bridge?: PoseMotion;
  /**
   * where the previous sheet left the figure: its held stage. The release
   * from there to that sheet's last stage (its own frames) plays before
   * the bridge, so a Cobra held in Lift lowers before it rolls over.
   */
  bridgeFrom?: { motion: PoseMotion; stage: number };
  /**
   * figure seconds when the bridge starts (default 0). A posture's first
   * segment is first shown `leadBeats` into its figure clock (the figure
   * runs a bar ahead of the class), so its bridge starts there.
   */
  bridgeAt?: number;
}

export type FigureSegment = FigureBridge &
  (
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
      /**
       * seconds the entry travel takes when the segment's own change cue
       * sets a tempo ("Come up slowly — and over to the left side"):
       * the lead bar, so the move rides the exhale it is spoken on
       */
      entryOver?: number;
    }
  | { kind: 'breath'; motion: PoseMotion; inhale: number; exhale: number }
  | { kind: 'pulse'; motion: PoseMotion; from: number; to: number }
  );

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
  /**
   * the sheet the figure was last on before this posture (the previous
   * posture's plan's last segment motion — see `planEndMotion`): the
   * first segment bridges from its end position
   */
  previous?: PoseMotion;
  /** the stage `previous` was holding (see `planEnd`); its release plays before the bridge */
  previousStage?: number;
}

/** The hand-off bridge from sheet `a` to sheet `b`, when their positions differ. */
function bridgeBetween(a: PoseMotion | undefined, b: PoseMotion): PoseMotion | undefined {
  const from = a?.position?.end;
  const to = b.position?.start;
  return from && to && from !== to ? bridgeFor(from, to) : undefined;
}

/**
 * Compile a posture's segments into figure segments. Undefined when the
 * posture has no sheet. A posture without segments gets one segment
 * landing on its climax (the closing savasana uses this). With a track,
 * every walk-in line that names a stage becomes a move: the figure gets
 * there as the line finishes, so what is said is what is shown. A segment
 * whose sheet opens in another body position than the last one closed in
 * carries the bridge between them.
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
  const lead = (opts.leadBeats ?? 0) * (opts.beatSeconds ?? 1);
  /** the stage the last figure segment holds at its end (undefined for a breath/pulse sheet) */
  let lastStage: number | undefined = opts.previousStage;
  /** the bridge into sheet m from wherever the figure last was */
  const bridgeInto = (m: PoseMotion): FigureBridge => {
    const last = out.length ? out[out.length - 1].motion : opts.previous;
    const bridge = bridgeBetween(last, m);
    if (!bridge || !last) return {};
    const from = lastStage !== undefined ? { bridgeFrom: { motion: last, stage: lastStage } } : {};
    return out.length === 0 && lead > 0 ? { bridge, bridgeAt: lead, ...from } : { bridge, ...from };
  };
  for (const seg of segs) {
    if (seg.kind === 'breath') {
      const b = breathSegment(own);
      if (b) {
        out.push({ ...b, ...bridgeInto(b.motion) });
        lastStage = undefined;
        continue;
      }
    }
    let m = own;
    let targets: number[];
    if (seg.kind === 'rest' && seg.orientation === 'prone') {
      m = own.position?.start === 'prone' ? own : getPose('cobra')!.motion!;
      targets = [0];
    } else if (seg.kind === 'rest' && savasana) {
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
    // a change cue that says "slowly" stretches the entry over the bar it is spoken on
    const barSeconds = (opts.track?.barBeats ?? 0) * (opts.beatSeconds ?? 1);
    const entryOver = out.length > 0 && tempoOf(seg.cue).kind === 'slow' && barSeconds > 0 ? barSeconds : undefined;
    out.push({
      kind: 'stages',
      motion: m,
      from,
      targets,
      ...(spoken && spoken.moves.length ? { moves: spoken.moves, settle: spoken.settle } : {}),
      ...(entryOver ? { entryOver } : {}),
      ...bridgeInto(m),
    });
    // leaving a sheet (a rest, a sit-up) puts the figure down: the next set
    // on the posture's own sheet re-enters from its first stage
    cursors.clear();
    cursors.set(m, targets[targets.length - 1]);
    lastStage = targets[targets.length - 1];
  }
  return { segments: out };
}

/**
 * The sheet a posture leaves the figure on: its plan's last segment motion
 * (a borrowed sheet when it ends on a rest or a sit-up). The next
 * posture's `previous`.
 */
export function planEndMotion(pose: Pose | undefined): PoseMotion | undefined {
  return planEnd(pose)?.motion;
}

/** The sheet AND the held stage a posture leaves the figure on (stage undefined after a breath sheet). */
export function planEnd(pose: Pose | undefined): { motion: PoseMotion; stage?: number } | undefined {
  if (!pose) return undefined;
  const plan = figurePlan(pose);
  const last = plan?.segments[plan.segments.length - 1];
  if (!last) return undefined;
  return { motion: last.motion, stage: last.kind === 'stages' ? last.targets[last.targets.length - 1] : undefined };
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
  const barSeconds = track.barBeats * beatSeconds;
  const breathSeconds = track.breathBeats * beatSeconds;
  /** figure seconds of the next inhale start at or after `t` (segments open on an inhale) */
  const nextInhale = (t: number) => {
    if (track.barBeats <= 1) return t;
    const inClass = t - leadBeats * beatSeconds; // class seconds into the segment
    const k = Math.max(0, Math.ceil(inClass / breathSeconds - 1e-9));
    return k * breathSeconds + leadBeats * beatSeconds;
  };
  lines.forEach((e, i) => {
    const clip = clipSeconds(texts[i]);
    const ends = (e.atBeat - span.startBeat + leadBeats) * beatSeconds + clip;
    settle = Math.max(settle, ends);
    const stage = stages[i];
    if (stage === undefined) return;
    const tempo = tempoOf(texts[i]);
    const starts = tempo.starts === 'line-start' ? ends - clip : tempo.starts === 'next-inhale' ? nextInhale(ends) : ends;
    const over = tempo.over?.({ clipSeconds: clip, barSeconds });
    moves.push({ seconds: starts, stage, ...(over !== undefined ? { over } : {}) });
  });
  return { moves, settle };
}

/** One step of a compiled segment: show `frame` of `motion`'s sheet until `until` seconds. */
export interface FrameStep {
  /** the sheet the frame belongs to — the segment's own, or its bridge's */
  motion: PoseMotion;
  frame: number;
  until: number;
  /**
   * the stage-to-stage travel this hop frame belongs to: from stage `from`
   * to stage `to`, begun at `start` seconds (the live rig blends the two
   * poses over ALL the travel's steps; the sprite just shows the frame).
   * Every hop step of one travel shares the same object. A hold has none.
   */
  blend?: StepBlend;
  /**
   * a zero-length marker where the sheet CUTS back to stage 0 (the sprite
   * has no frames for it and never shows the marker): the live rig blends
   * from stage `from` to stage 0 over `seconds` instead of jumping
   */
  cut?: { from: number; seconds: number };
}

/** The travel a hop step belongs to (see `FrameStep.blend`). */
export interface StepBlend {
  from: number;
  to: number;
  start: number;
}

/** The hop steps of the travel into stage `i` from `t` seconds, `dt` apart; a cut marker when the hop is the cut to stage 0. */
function hopSteps(m: PoseMotion, i: number, t: number, dt: number): FrameStep[] {
  const frames = hopFrames(m, i);
  if (frames.length === 0) {
    if (i !== 0) return [];
    const from = m.stages.length - 1;
    return [{ motion: m, frame: m.stages[0].frame, until: t, cut: { from, seconds: TRANSITION_FRAMES / m.fps } }];
  }
  const blend: StepBlend = { from: i - 1, to: i, start: t };
  let until = t;
  // accumulated frame by frame, exactly as the sprite timeline always has
  return frames.map((frame) => ({ motion: m, frame, until: (until += dt), blend }));
}

/**
 * The bridge a segment plays first: its opening pose until `bridgeAt`,
 * then every frame at the bridge's fps. Empty (ending at 0) without one.
 */
export function bridgeSteps(seg: FigureSegment): { steps: FrameStep[]; end: number } {
  const b = seg.bridge;
  if (!b) return { steps: [], end: 0 };
  const steps: FrameStep[] = [];
  let t = Math.max(0, seg.bridgeAt ?? 0);
  const from = seg.bridgeFrom;
  if (t > 0) {
    // waiting for the lead: the held stage of the sheet we are leaving, else the bridge's opening pose
    steps.push(from ? { motion: from.motion, frame: from.motion.stages[from.stage].frame, until: t } : { motion: b, frame: 0, until: t });
  }
  if (from) {
    // the release: from the held stage through the source sheet's remaining stages (transition frames only)
    for (let i = from.stage + 1; i < from.motion.stages.length; i++) {
      const hop = hopSteps(from.motion, i, t, 1 / from.motion.fps);
      steps.push(...hop);
      if (hop.length) t = hop[hop.length - 1].until;
    }
  }
  // the bridge's own frames: its holds, and between them blends from one
  // stage to the next (the frames `hopFrames` gives each stage)
  const travelOf = new Map<number, number>();
  for (let k = 1; k < b.stages.length; k++) for (const f of hopFrames(b, k)) travelOf.set(f, k);
  let blend: StepBlend | undefined;
  for (let f = 0; f < b.frames; f++) {
    const k = travelOf.get(f);
    if (k === undefined) blend = undefined;
    else if (!blend || blend.to !== k) blend = { from: k - 1, to: k, start: t };
    t += 1 / b.fps;
    steps.push(blend ? { motion: b, frame: f, until: t, blend } : { motion: b, frame: f, until: t });
  }
  return { steps, end: t };
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
 * target holds until the slice ends. A bridge plays first; the segment's
 * own steps share what is left of it.
 */
export function segmentTimeline(seg: Extract<FigureSegment, { kind: 'stages' }>, seconds: number): FrameStep[] {
  const bridge = bridgeSteps(seg);
  const own =
    seg.moves && seg.moves.length
      ? spokenTimeline(seg, seconds, seg.moves, bridge.end)
      : stagedTimeline(seg, seconds, bridge.end);
  return [...bridge.steps, ...own];
}

function stagedTimeline(seg: Extract<FigureSegment, { kind: 'stages' }>, seconds: number, t0: number): FrameStep[] {
  const m = seg.motion;
  const n = m.stages.length;
  const dt = 1 / m.fps;
  const slice = Math.max(0, seconds - t0) / Math.max(1, seg.targets.length);
  const steps: FrameStep[] = [];
  let t = t0;
  let cur = seg.from;
  seg.targets.forEach((target, ti) => {
    const end = t + slice;
    // the path of stages from cur (exclusive) to target (inclusive), cyclic
    const path: number[] = [];
    for (let i = cur; i !== target; ) {
      i = (i + 1) % n;
      path.push(i);
    }
    const setups = path.filter((i) => i !== target && !isNeutral(m, i));
    const hopCount = path.reduce((s, i) => s + hopFrames(m, i).length, 0);
    // a "slowly" change cue: the first entry's travel rides the whole bar
    const frameDt = ti === 0 && seg.entryOver && hopCount > 0 ? seg.entryOver / hopCount : dt;
    const transitionSeconds = hopCount * frameDt;
    let hold = Math.min(8, Math.max(1.5, slice * 0.12));
    const budget = slice * 0.6 - transitionSeconds;
    if (setups.length && hold * setups.length > budget) hold = Math.max(0, budget / setups.length);
    for (const i of path) {
      const hop = hopSteps(m, i, t, frameDt);
      steps.push(...hop);
      if (hop.length) t = hop[hop.length - 1].until;
      if (i !== target && !isNeutral(m, i)) {
        t += hold;
        steps.push({ motion: m, frame: m.stages[i].frame, until: t });
      }
    }
    t = Math.max(t, end);
    steps.push({ motion: m, frame: m.stages[target].frame, until: t });
    cur = target;
  });
  return steps;
}

/** Seconds after the last spoken walk-in line before the figure completes the entry on its own. */
const SETTLE_SECONDS = 1.5;

/**
 * Lay a segment out around its spoken moves: hold where the figure is
 * until each line ends, then travel (transition frames only, no setup
 * holds) to the stage the line named; if the lines never reach the
 * target, finish the entry a few seconds after the last one. Starts at
 * `t0` (after a bridge): a line that ends while the bridge is still
 * playing moves the figure the moment the bridge is done.
 */
function spokenTimeline(
  seg: Extract<FigureSegment, { kind: 'stages' }>,
  seconds: number,
  moves: FigureMove[],
  t0: number,
): FrameStep[] {
  const m = seg.motion;
  const n = m.stages.length;
  const dt = 1 / m.fps;
  const target = seg.targets[seg.targets.length - 1];
  const steps: FrameStep[] = [];
  let t = t0;
  let cur = seg.from;
  /** travel to `to` starting at `at`, over `over` seconds (else at sheet speed) */
  const travel = (to: number, at: number, over?: number) => {
    if (at > t) {
      t = at;
      steps.push({ motion: m, frame: m.stages[cur].frame, until: t });
    }
    const path: number[] = [];
    for (let i = cur; i !== to; ) {
      i = (i + 1) % n;
      path.push(i);
    }
    const hopCount = path.reduce((s, i) => s + hopFrames(m, i).length, 0);
    const frameDt = over !== undefined && hopCount > 0 ? over / hopCount : dt;
    for (const i of path) {
      const hop = hopSteps(m, i, t, frameDt);
      steps.push(...hop);
      if (hop.length) t = hop[hop.length - 1].until;
    }
    cur = to;
  };
  const sorted = [...moves].sort((a, b) => a.seconds - b.seconds);
  for (const mv of sorted) {
    if (mv.stage === cur) continue;
    travel(mv.stage, Math.min(mv.seconds, Math.max(0, seconds - 1)), mv.over);
  }
  if (cur !== target) travel(target, Math.min(Math.max(t, seg.settle ?? 0) + SETTLE_SECONDS, Math.max(0, seconds - 1)));
  t = Math.max(t, seconds);
  steps.push({ motion: m, frame: m.stages[target].frame, until: t });
  return steps;
}

/** The step a timeline shows at `t` seconds (its last step past the end). */
export function stepAt(steps: FrameStep[], t: number): FrameStep | undefined {
  for (const s of steps) if (t < s.until) return s;
  return steps[steps.length - 1];
}

/** The frame a timeline shows at `t` seconds (its last frame past the end). */
export function frameAt(steps: FrameStep[], t: number): number {
  return stepAt(steps, t)?.frame ?? 0;
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

/** Which sheet the figure draws and its frame. */
export interface FigureFrame {
  motion: PoseMotion;
  frame: number;
}

/**
 * The sprite frame a figure segment shows at this moment of the class —
 * on the bridge's sheet while a bridge plays, else on the segment's own.
 */
export function figureFrameAt(seg: FigureSegment, clock: FigureClock, steps?: FrameStep[]): FigureFrame {
  if (seg.kind === 'stages') {
    const s = stepAt(steps ?? segmentTimeline(seg, clock.total), clock.seconds);
    return s ? { motion: s.motion, frame: s.frame } : { motion: seg.motion, frame: 0 };
  }
  if (seg.bridge) {
    const b = bridgeSteps(seg);
    if (clock.seconds < b.end) {
      const s = stepAt(b.steps, clock.seconds);
      if (s) return { motion: s.motion, frame: s.frame };
    }
  }
  return seg.kind === 'breath'
    ? { motion: seg.motion, frame: breathFrame(seg, clock.breath?.phase, clock.breath?.progress ?? 0) }
    : { motion: seg.motion, frame: pulseFrame(seg, clock.beatProgress) };
}

// ---------------------------------------------------------------------------
// Continuous poses for the live rig. The sprite shows discrete frames; the
// rig blends two stage poses. Same timelines, read continuously: a hop
// step's `blend` says which travel it is part of, and the travel's eased
// fraction replaces the frame index.
// ---------------------------------------------------------------------------

/** Where the live figure is: `t` (eased, 0–1) of the way from stage `from` to stage `to` of `motion`'s sheet. */
export interface FigurePose {
  motion: PoseMotion;
  from: number;
  to: number;
  t: number;
}

const smoothstep = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

/** The held stage a frame belongs to: the last stage starting at or before it. */
function stageOfFrame(m: PoseMotion, frame: number): number {
  let k = 0;
  m.stages.forEach((s, i) => {
    if (s.frame <= frame) k = i;
  });
  return k;
}

const hold = (motion: PoseMotion, stage: number): FigurePose => ({ motion, from: stage, to: stage, t: 1 });

/**
 * The rig's pose at `t` seconds of a timeline. Inside a travel the blend
 * runs smoothstep over the WHOLE travel (all its hop steps), which is how
 * the sheets ease each transition; on a hold `from === to`, `t = 1`. Just
 * after a cut marker (the sheet's jump back to stage 0) the rig blends
 * from the stage it left to stage 0 over the marker's window; when a
 * travel follows the marker at once, that window is carved out of the
 * travel's own time (see above), never skipped.
 */
export function poseAt(steps: FrameStep[], t: number): FigurePose | undefined {
  let i = steps.findIndex((s) => t < s.until);
  if (i < 0) i = steps.length - 1;
  const s = steps[i];
  if (!s) return undefined;
  if (s.blend) {
    const b = s.blend;
    let first = i;
    while (first > 0 && steps[first - 1].blend === b) first--;
    let end = s.until;
    for (let j = i + 1; j < steps.length && steps[j].blend === b; j++) end = steps[j].until;
    // a cut marker right before this travel (the sheet wrapped to stage 0
    // and went straight on): the rig spends the start of the travel's own
    // time on the wrap — its full window, or half the travel if shorter —
    // then makes the travel in what remains, so rig time runs continuously
    // through stage 0 while the sprite's frames stay exactly as they were
    const cut = steps[first - 1];
    let start = b.start;
    if (cut?.cut && cut.motion === s.motion && cut.until === b.start) {
      const wrapEnd = b.start + Math.min(cut.cut.seconds, (end - b.start) / 2);
      if (t < wrapEnd) {
        return { motion: s.motion, from: cut.cut.from, to: 0, t: smoothstep((t - b.start) / (wrapEnd - b.start)) };
      }
      start = wrapEnd;
    }
    const span = end - start;
    return { motion: s.motion, from: b.from, to: b.to, t: span > 0 ? smoothstep((t - start) / span) : 1 };
  }
  const prev = steps[i - 1];
  if (prev?.cut && prev.motion === s.motion && t >= prev.until && t < prev.until + prev.cut.seconds) {
    return { motion: s.motion, from: prev.cut.from, to: 0, t: smoothstep((t - prev.until) / prev.cut.seconds) };
  }
  return hold(s.motion, stageOfFrame(s.motion, s.frame));
}

/**
 * The continuous counterpart of `figureFrameAt`: where the live rig is at
 * this moment of the class. Stages (and any bridge) through `poseAt`; a
 * breath segment blends exhale → inhale over the inhale (and back over the
 * exhale) with the same easing the sprite scrubs with; a pulse goes
 * Pump → Release → Pump within each beat.
 */
export function figurePoseAt(seg: FigureSegment, clock: FigureClock, steps?: FrameStep[]): FigurePose {
  if (seg.kind === 'stages') {
    return poseAt(steps ?? segmentTimeline(seg, clock.total), clock.seconds) ?? hold(seg.motion, seg.from);
  }
  if (seg.bridge) {
    const b = bridgeSteps(seg);
    if (clock.seconds < b.end) {
      const p = poseAt(b.steps, clock.seconds);
      if (p) return p;
    }
  }
  const m = seg.motion;
  if (seg.kind === 'breath') {
    const phase = clock.breath?.phase;
    if (!phase) return hold(m, seg.inhale);
    const e = easeInOut(Math.min(1, Math.max(0, clock.breath?.progress ?? 0)));
    return phase === 'inhale'
      ? { motion: m, from: seg.exhale, to: seg.inhale, t: e }
      : { motion: m, from: seg.inhale, to: seg.exhale, t: e };
  }
  const pump = stageOfFrame(m, seg.from);
  const release = Math.min(m.stages.length - 1, pump + 1);
  const p = Math.min(1, Math.max(0, clock.beatProgress));
  return p < 0.5
    ? { motion: m, from: pump, to: release, t: smoothstep(p * 2) }
    : { motion: m, from: release, to: pump, t: smoothstep(p * 2 - 1) };
}

/**
 * The sprite frame nearest a rig pose — for handing a figure from the live
 * rig back to the sprite mid-motion: a hold is its stage's first frame, a
 * travel into stage b the hop frame `t` of the way through (`hopFrames`),
 * and the cut back to stage 0 whichever side of it `t` is nearer.
 */
export function frameForPose(m: PoseMotion, from: number, to: number, t: number): number {
  const n = m.stages.length;
  const a = Math.min(n - 1, Math.max(0, from));
  const b = Math.min(n - 1, Math.max(0, to));
  if (a === b || t >= 1) return m.stages[b].frame;
  if (t <= 0) return m.stages[a].frame;
  const frames = b === a + 1 ? hopFrames(m, b) : [];
  if (frames.length === 0) return m.stages[t < 0.5 ? a : b].frame;
  return frames[Math.min(frames.length - 1, Math.floor(t * frames.length))];
}
