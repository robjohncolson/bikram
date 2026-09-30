/**
 * The posing model: a port of `apply_stage` / `aim_bone` from
 * `scripts/blender/render_motion.py`, plus forward kinematics.
 *
 * A posed rig is each bone's WORLD-space delta rotation from rest (rest =
 * identity) and the pelvis's world offset. That is all Blender's pose
 * matrices amount to for this rig: the bones are un-connected, so a
 * child's head rides its parent's pose matrix (`solve`), and an un-posed
 * child carries its parent's world rotation — which is exactly where
 * `aim_bone` finds it (`pb.matrix`) before turning it to its target.
 */
import type { RigBoneEntry, RigStagePose, RigStage } from '../data/types';
import type { Quat, Vec3 } from './math';
import { IDENTITY, add, axisAngle, conj, cross, length, mul, normalize, rotate, rotationDifference, sub } from './math';
import { BONE, BONES, PARENT } from './skeleton';

import type { SkeletonName } from './variants';
import { directionsOf, skeletonOf } from './variants';

export type BoneName = string;

export interface RigPose {
  skeleton?: SkeletonName;
  bones: Record<BoneName, { q: Quat }>;
  /** world offset of the pelvis head from rest (`pelvis.location`) */
  pelvisLocation: Vec3;
}

export interface SolvedBone {
  head: Vec3;
  tail: Vec3;
  q: Quat;
}

export type Solved = Record<BoneName, SolvedBone>;

const solvedVariants = new WeakMap<Solved, SkeletonName>();
export const solvedSkeleton = (s: Solved) => solvedVariants.get(s);

function entryOf(value: RigBoneEntry): { dir: Vec3; roll: number } {
  if (Array.isArray(value)) return { dir: value as Vec3, roll: 0 };
  return { dir: value.dir as Vec3, roll: value.roll ?? 0 };
}

/** Turn a bone from world rotation `q` so it points along `target`, then roll it about that axis. */
function aim(q: Quat, name: BoneName, target: Vec3, roll: number, REST: Record<string, Vec3>): Quat {
  const t = normalize(target);
  const current = normalize(rotate(q, REST[name]));
  let d = rotationDifference(current, t);
  if (roll) d = mul(axisAngle(t, (roll * Math.PI) / 180), d);
  return mul(d, q);
}

/**
 * Pose the rig from a stage dict, parents first. A listed bone is aimed
 * at its direction (shortest arc from where its parent left it) and then
 * rolled; an omitted bone whose parent is rolled — or riding a roll —
 * keeps its pose relative to that parent; any other omitted bone is aimed
 * back at its REST direction. Without rolls every bone just points where
 * it is told.
 */
export function applyStage(stage: RigStagePose, skeleton?: SkeletonName): RigPose {
  const REST = directionsOf(skeleton);
  const bones: Record<BoneName, { q: Quat }> = {};
  const riding = new Set<BoneName>();
  for (const [name, , , parent] of BONES) {
    const q0: Quat = parent ? bones[parent].q : [...IDENTITY];
    const entry = stage[name];
    if (entry === undefined && parent && riding.has(parent)) {
      riding.add(name);
      bones[name] = { q: q0 };
      continue;
    }
    const { dir, roll } = entry !== undefined ? entryOf(entry) : { dir: REST[name], roll: 0 };
    bones[name] = { q: aim(q0, name, dir, roll, REST) };
    if (roll) riding.add(name);
  }
  const loc = stage['pelvis.location'];
  return { ...(skeleton ? { skeleton } : {}), bones, pelvisLocation: Array.isArray(loc) ? [loc[0], loc[1], loc[2]] : [0, 0, 0] };
}

/** The ghost's pose: the stage pose with the mistake's bones laid over it. */
export function ghostPose(stage: RigStage, skeleton?: SkeletonName): RigPose {
  return applyStage({ ...stage.pose, ...(stage.ghost ?? {}) }, skeleton);
}

/**
 * Forward kinematics: every bone's world head, tail and rotation. A
 * child's head is its rest offset from the parent's head, carried by the
 * parent's rotation (Blender's un-connected child bones).
 */
export function solve(pose: RigPose): Solved {
  const { J } = skeletonOf(pose.skeleton);
  const out: Solved = {};
  if (pose.skeleton) solvedVariants.set(out, pose.skeleton);
  for (const [name, h, t, parent] of BONES) {
    const q = pose.bones[name].q;
    let head: Vec3;
    if (parent) {
      const p = out[parent];
      const ph = BONE[parent][1];
      head = add(p.head, rotate(p.q, sub(J[h], J[ph])));
    } else {
      head = add(J[h], pose.pelvisLocation);
    }
    out[name] = { head, tail: add(head, rotate(q, sub(J[t], J[h]))), q };
  }
  return out;
}

/** Each bone's rotation relative to its parent's (the pelvis relative to identity). */
export function relative(pose: RigPose): Record<BoneName, Quat> {
  const rel: Record<BoneName, Quat> = {};
  for (const [name, , , parent] of BONES) {
    const q = pose.bones[name].q;
    rel[name] = parent ? mul(conj(pose.bones[parent].q), q) : q;
  }
  return rel;
}

/** Rebuild world rotations from a parent-relative chain. */
export function fromRelative(rel: Record<BoneName, Quat>, pelvisLocation: Vec3, skeleton?: SkeletonName): RigPose {
  const bones: Record<BoneName, { q: Quat }> = {};
  for (const [name, , , parent] of BONES) {
    bones[name] = { q: parent ? mul(bones[parent].q, rel[name]) : rel[name] };
  }
  return { ...(skeleton ? { skeleton } : {}), bones, pelvisLocation };
}

/** A bone's current world direction (head → tail). */
export function boneDir(pose: RigPose, name: BoneName): Vec3 {
  return normalize(rotate(pose.bones[name].q, directionsOf(pose.skeleton)[name]));
}

/**
 * Turn one bone (and everything it carries) by an extra world rotation
 * `r` about its head — for small decorative motion such as the breath,
 * applied AFTER a blend and never to the authored stages.
 */
export function turnBone(pose: RigPose, name: BoneName, r: Quat): RigPose {
  const rel = relative(pose);
  const parent = PARENT[name];
  const pq = parent ? pose.bones[parent].q : IDENTITY;
  rel[name] = mul(conj(pq), mul(r, pose.bones[name].q));
  return fromRelative(rel, pose.pelvisLocation, pose.skeleton);
}

/** Degrees the breath opens the chest at a full inhale (spine.upper and neck, toward +Y). */
export const BREATH_CHEST_DEG = 3;
/** Degrees the clavicles lift at a full inhale. */
export const BREATH_CLAVICLE_DEG = 4;

/**
 * The breath on a posed rig: `amount` 0 (exhaled) … 1 (full inhale) eases
 * the upper spine and neck a few degrees toward +Y (the chest opens) and
 * lifts both clavicles toward the head. Bones pointing along ±Y (lying
 * down) have no "toward +Y" and are left to the clavicles.
 */
export function breathe(pose: RigPose, amount: number): RigPose {
  if (!(amount > 0)) return pose;
  let p = pose;
  const toward = (name: BoneName, goal: Vec3, deg: number) => {
    const d = boneDir(p, name);
    const axis = cross(d, goal);
    if (length(axis) < 1e-3) return;
    p = turnBone(p, name, axisAngle(axis, ((deg * Math.PI) / 180) * amount));
  };
  toward('spine.upper', [0, 1, 0], BREATH_CHEST_DEG);
  toward('neck', [0, 1, 0], BREATH_CHEST_DEG);
  const up = boneDir(p, 'spine.upper');
  toward('clavicle.L', up, BREATH_CLAVICLE_DEG);
  toward('clavicle.R', up, BREATH_CLAVICLE_DEG);
  return p;
}
