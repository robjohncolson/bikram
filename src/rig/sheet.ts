/**
 * A rig sheet's poses, cached: each stage (and ghost) is solved once per
 * sheet, and each stage pair's steered midpoints once per pair — a blend
 * frame is then one slerp per bone. Caches hang off the sheet object
 * (WeakMap), so an unloaded sheet takes its poses with it.
 */
import type { RigData } from '../data/types';
import type { Midpoints } from './inbetween';
import { blend, midpoints } from './inbetween';
import type { RigPose } from './pose';
import { applyStage, ghostPose } from './pose';

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
