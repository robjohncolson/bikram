/**
 * In-between poses: a port of `inbetween`, `steered_midpoints` and
 * `midpoint_dir` from `scripts/blender/render_motion.py`.
 *
 * Blender slerps each bone's LOCAL `rotation_quaternion`. Here the
 * interpolated quantity is the parent-relative rotation
 * `rel(b) = conj(q(parent)) ∘ q(b)`; the two differ only by a fixed
 * conjugation with the bone's rest matrix (`rel = R · basis · R⁻¹`), and a
 * fixed conjugation preserves quaternion dot products and commutes with
 * slerp — so the sign choices and the interpolated poses are identical.
 */
import type { Quat, Vec3 } from './math';
import { angle, compatible, conj, lerp3, mul, rotate, rotationDifference, slerp } from './math';
import type { BoneName, RigPose } from './pose';
import { boneDir, fromRelative, relative } from './pose';
import { BIG_TURN_DEG, BONES } from './skeleton';

import { directionsOf } from './variants';
/** two ways round a big turn scoring within this of each other are a tie (render_motion.py MIDPOINT_TIE) */
const MIDPOINT_TIE = 1e-6;

/** The two candidate halfway directions of a big turn and their scores (see `midpointDir`). */
function midpointCandidates(name: BoneName, a: Vec3, b: Vec3): { m: Vec3; score: number }[] {
  const axis: Vec3 = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const ab = angle(a, b);
  const half = ab > 1e-3 ? ab / 2 : 0;
  const side = name.endsWith('.L') ? 1 : name.endsWith('.R') ? -1 : 0;
  return [1, -1].map((sign) => {
    const s = Math.sin((sign * half) / 2);
    const m = rotate([Math.cos((sign * half) / 2), axis[0] * s, axis[1] * s, axis[2] * s], a);
    return { m, score: m[0] * b[0] + m[1] * b[1] + m[2] * b[2] + 0.05 * side * m[0] };
  });
}

/**
 * Halfway direction for a big turn from `a` to `b`: swept round the body's
 * forward axis (a limb goes out to the side, not through the body), on
 * the limb's own side when the two ways are equal.
 *
 * Exactly `midpoint_dir` in render_motion.py, including its tie rule: two
 * ways scoring within MIDPOINT_TIE are a tie (the side term is blind when
 * the sweep axis is X — both ways keep the same x — and in Blender such a
 * tie used to come down to float32 noise), so the higher way round wins,
 * then the one further back, the same pick on both sides.
 */
export function midpointDir(name: BoneName, a: Vec3, b: Vec3): Vec3 {
  const [first, second] = midpointCandidates(name, a, b);
  if (second.score > first.score + MIDPOINT_TIE) return second.m;
  if (Math.abs(second.score - first.score) <= MIDPOINT_TIE) {
    const [f, s] = [first.m, second.m];
    if (s[2] > f[2] || (s[2] === f[2] && s[1] > f[1])) return s;
  }
  return first.m;
}

/** Steered midpoints: bone → parent-relative rotation, for the bones that turn more than BIG_TURN_DEG. */
export type Midpoints = Record<BoneName, Quat>;

/**
 * The midpoint rotations of the bones that turn more than BIG_TURN_DEG in
 * world space between `a` and `b`. Parents first, each aimed with its
 * ancestors already at THEIR midpoints (the bones in between keep their
 * pose-A relative rotation), so a whole arm sweeps out straight instead
 * of folding. Memoise per stage pair: it only depends on the two poses.
 */
export function midpoints(a: RigPose, b: RigPose): Midpoints {
  const REST = directionsOf(a.skeleton);
  const mids: Midpoints = {};
  const rel = relative(a);
  let world = a;
  for (const [name, , , parent] of BONES) {
    const da = boneDir(a, name);
    const db = boneDir(b, name);
    if ((angle(da, db) * 180) / Math.PI <= BIG_TURN_DEG) continue;
    // this bone's world rotation with its ancestors at their midpoints
    const q = world.bones[name].q;
    const current = rotate(q, REST[name]);
    const aimed = mul(rotationDifference(current, midpointDir(name, da, db)), q);
    rel[name] = parent ? mul(conj(world.bones[parent].q), aimed) : aimed;
    mids[name] = rel[name];
    world = fromRelative(rel, a.pelvisLocation, a.skeleton);
  }
  return mids;
}

/**
 * The pose `s` of the way from `a` to `b` (`s` already eased — the renderer
 * applies `smoothstep` to the frame fraction first): per bone a
 * shortest-arc slerp of sign-compatible parent-relative rotations, through
 * the steered midpoint for a big turn; the pelvis offset lerped.
 */
export function blend(a: RigPose, b: RigPose, s: number, mids: Midpoints = midpoints(a, b)): RigPose {
  if (a.skeleton !== b.skeleton) throw new Error('Cannot blend different skeletons');
  if (s <= 0) return a;
  if (s >= 1) return b;
  const ra = relative(a);
  const rb = relative(b);
  const out: Record<BoneName, Quat> = {};
  for (const [name] of BONES) {
    const qa = ra[name];
    const qb = compatible(rb[name], qa);
    const m = mids[name];
    if (m) {
      const qm = compatible(m, qa);
      out[name] = s < 0.5 ? slerp(qa, qm, s * 2) : slerp(compatible(qm, qb), qb, s * 2 - 1);
    } else {
      out[name] = slerp(qa, qb, s);
    }
  }
  return fromRelative(out, lerp3(a.pelvisLocation, b.pelvisLocation, s), a.skeleton);
}
