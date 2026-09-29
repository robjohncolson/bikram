/**
 * A rig sheet's poses, cached: each stage (and ghost) is solved once per
 * sheet, and each stage pair's steered midpoints once per pair — a blend
 * frame is then one slerp per bone. Caches hang off the sheet object
 * (WeakMap), so an unloaded sheet takes its poses with it.
 */
import type { RigData } from '../data/types';
import type { Midpoints } from './inbetween';
import { blend, midpoints } from './inbetween';
import type { Vec3 } from './math';
import type { RigPose } from './pose';
import { applyStage, ghostPose, solve } from './pose';

interface SheetCache {
  stages: (RigPose | undefined)[];
  ghosts: (RigPose | null | undefined)[];
  mids: Map<string, Midpoints>;
}

const caches = new WeakMap<RigData, SheetCache>();

function cacheOf(data: RigData): SheetCache {
  let c = caches.get(data);
  if (!c) {
    c = { stages: [], ghosts: [], mids: new Map() };
    caches.set(data, c);
  }
  return c;
}

const clampStage = (data: RigData, i: number) => Math.min(data.stages.length - 1, Math.max(0, Math.round(i)));

/** The posed rig of one held stage. */
export function stagePose(data: RigData, i: number): RigPose {
  const c = cacheOf(data);
  const k = clampStage(data, i);
  return (c.stages[k] ??= applyStage(data.stages[k].pose));
}

/** The ghost (common-mistake) pose of a stage, or undefined when it has none. */
export function stageGhost(data: RigData, i: number): RigPose | undefined {
  const c = cacheOf(data);
  const k = clampStage(data, i);
  if (c.ghosts[k] === undefined) c.ghosts[k] = data.stages[k].ghost ? ghostPose(data.stages[k]) : null;
  return c.ghosts[k] ?? undefined;
}

/** The pose `t` (eased) of the way from stage `from` to stage `to`. */
export function sheetPose(data: RigData, from: number, to: number, t: number): RigPose {
  const a = clampStage(data, from);
  const b = clampStage(data, to);
  if (a === b || t >= 1) return stagePose(data, b);
  if (t <= 0) return stagePose(data, a);
  const c = cacheOf(data);
  const key = `${a}>${b}`;
  let m = c.mids.get(key);
  if (!m) {
    m = midpoints(stagePose(data, a), stagePose(data, b));
    c.mids.set(key, m);
  }
  return blend(stagePose(data, a), stagePose(data, b), t, m);
}

/**
 * A pose kept out of the floor: when any joint lies below z = 0, the whole
 * figure rises by that much (else the same object comes back). The library's
 * inversions need it — a blend is rooted at the pelvis, so between two
 * stages that both rest on the crown or the shoulders the slerped chain
 * dips the head a centimetre or two into the mat; a lift of that size reads
 * as the body rolling over its contact, a dip reads as a bug. Only the
 * library's live figure asks for it (FigureRig `grounded`); the 26 & 2's
 * sheets are drawn exactly as authored.
 */
export function liftToFloor(pose: RigPose): RigPose {
  let low = 0;
  for (const b of Object.values(solve(pose))) low = Math.min(low, b.head[2], b.tail[2]);
  if (low >= 0) return pose;
  const [x, y, z] = pose.pelvisLocation;
  return { ...pose, pelvisLocation: [x, y, z - low] };
}

/** Every joint of a solved pose, as the list of bone ends. */
function jointsOf(pose: RigPose): Vec3[] {
  const out: Vec3[] = [];
  for (const b of Object.values(solve(pose))) out.push(b.head, b.tail);
  return out;
}

/** Joints on the mat (within this of the floor) and staying put (within this across) count as a shared contact. */
const CONTACT_Z = 0.03;
const CONTACT_XY = 0.03;

/**
 * A blend that keeps its footing: the joints both stages rest on (the
 * crown and forearms of a headstand, the shoulders of a shoulderstand) are
 * carried straight from one stage's place to the other's, rather than
 * swung on the pelvis-rooted chain.
 */
export function anchorToContacts(data: RigData, from: number, to: number, t: number): RigPose {
  const blended = sheetPose(data, from, to, t);
  if (from === to || t <= 0 || t >= 1) return blended;
  const ja = jointsOf(stagePose(data, from));
  const jb = jointsOf(stagePose(data, to));
  const shared: number[] = [];
  ja.forEach((a, i) => {
    const b = jb[i];
    if (a[2] < CONTACT_Z && b[2] < CONTACT_Z && Math.hypot(a[0] - b[0], a[1] - b[1]) < CONTACT_XY) shared.push(i);
  });
  if (!shared.length) return blended;
  const jt = jointsOf(blended);
  const off: Vec3 = [0, 0, 0];
  for (const i of shared) for (let k = 0; k < 3; k++) off[k] += (ja[i][k] + (jb[i][k] - ja[i][k]) * t - jt[i][k]) / shared.length;
  const [x, y, z] = blended.pelvisLocation;
  return { ...blended, pelvisLocation: [x + off[0], y + off[1], z + off[2]] };
}

/**
 * What the library's live figure draws (FigureRig `grounded`): the blend
 * kept on its shared contacts, then `liftToFloor` as the last guard. The
 * 26 & 2 draws `sheetPose` exactly.
 */
export function groundedSheetPose(data: RigData, from: number, to: number, t: number): RigPose {
  return liftToFloor(anchorToContacts(data, from, to, t));
}

/** A stage blend, as the renderer takes it. */
export interface SheetBlend {
  from: number;
  to: number;
  /** eased, 0–1 */
  t: number;
}

/** Seconds the rest on the last stage lasts before a demonstration loops (the sprite's 1.2 s). */
export const LOOP_REST = 1.2;

/**
 * The sheet played on its own clock, as the sprite plays its frames:
 * each stage held for its hold, each transition over its frames at `fps`
 * (smoothstep, as the sheets ease), a rest on the last stage, then back to
 * the first over one transition — where the sprite cuts, the rig blends.
 * Returns the blend at `seconds` into the loop, and the loop's length.
 */
export function playAt(data: RigData, fps: number, seconds: number): SheetBlend & { loop: number } {
  const n = data.stages.length;
  const trans = Math.max(1, data.transition) / fps;
  // a hold of h frames shows h - 1 frame steps before its transition starts (the sprite's timing)
  const spans = data.stages.map((s) => Math.max(0, s.hold - 1) / fps);
  const loop = spans.reduce((a, b) => a + b, 0) + trans * n + LOOP_REST;
  let x = ((seconds % loop) + loop) % loop;
  for (let i = 0; i < n; i++) {
    const hold = spans[i] + (i === n - 1 ? LOOP_REST : 0);
    if (x < hold) return { from: i, to: i, t: 1, loop };
    x -= hold;
    const next = (i + 1) % n;
    if (x < trans) {
      const u = x / trans;
      return { from: i, to: next, t: u * u * (3 - 2 * u), loop };
    }
    x -= trans;
  }
  return { from: 0, to: 0, t: 1, loop };
}

/** Seconds into `playAt`'s loop where stage `i`'s hold begins (a chip seeks the demonstration here). */
export function stageStartAt(data: RigData, fps: number, i: number): number {
  const trans = Math.max(1, data.transition) / fps;
  let x = 0;
  for (let k = 0; k < Math.min(i, data.stages.length - 1); k++) x += Math.max(0, data.stages[k].hold - 1) / fps + trans;
  return x;
}
