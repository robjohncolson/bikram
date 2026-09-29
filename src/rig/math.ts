/**
 * Minimal vector and quaternion math for the rig — no dependency, so the
 * posing model stays pure and testable without three.js. Quaternions are
 * `[w, x, y, z]` like Blender's mathutils, and every operation that the
 * renderer's posing relies on (`rotation_difference`, `slerp`) follows
 * mathutils' own semantics so the port reproduces its joint positions.
 */
export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

export const IDENTITY: Quat = [1, 0, 0, 0];

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const length = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const lerp3 = (a: Vec3, b: Vec3, s: number): Vec3 => [
  a[0] + (b[0] - a[0]) * s,
  a[1] + (b[1] - a[1]) * s,
  a[2] + (b[2] - a[2]) * s,
];

export function normalize(a: Vec3): Vec3 {
  const l = length(a);
  return l > 0 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0];
}

/** Angle between two vectors in radians (mathutils `Vector.angle`: a clamped acos). */
export function angle(a: Vec3, b: Vec3): number {
  const d = dot(a, b) / (length(a) * length(b));
  return Math.acos(Math.min(1, Math.max(-1, d)));
}

/** Angle between two UNIT vectors, the numerically robust way Blender computes it. */
function angleNormalized(a: Vec3, b: Vec3): number {
  if (dot(a, b) >= 0) return 2 * Math.asin(Math.min(1, length(sub(a, b)) / 2));
  return Math.PI - 2 * Math.asin(Math.min(1, length(add(a, b)) / 2));
}

/** Rotation of `angle` radians about `axis` (normalised for you; a zero axis gives identity). */
export function axisAngle(axis: Vec3, rad: number): Quat {
  const n = normalize(axis);
  if (n[0] === 0 && n[1] === 0 && n[2] === 0) return [...IDENTITY];
  const s = Math.sin(rad / 2);
  return [Math.cos(rad / 2), n[0] * s, n[1] * s, n[2] * s];
}

/**
 * Blender's `ortho_v3_v3`: a vector perpendicular to `v`, built from its
 * dominant axis. mathutils uses it for the axis of a 180° turn, so the
 * antiparallel case below picks exactly the rotation Blender picks.
 */
function orthoOf(v: Vec3): Vec3 {
  const x = Math.abs(v[0]);
  const y = Math.abs(v[1]);
  const z = Math.abs(v[2]);
  const axis = x > y ? (x > z ? 0 : 2) : y > z ? 1 : 2;
  if (axis === 0) return [-v[1] - v[2], v[0], v[0]];
  if (axis === 1) return [v[1], -v[0] - v[2], v[1]];
  return [v[2], v[2], -v[0] - v[1]];
}

/** float32 epsilon — the threshold Blender's `rotation_between_vecs_to_quat` uses */
const FLT_EPSILON = 1.1920929e-7;

/**
 * The shortest-arc rotation taking direction `a` to direction `b`
 * (mathutils `Vector.rotation_difference`). Parallel → identity;
 * antiparallel → a half turn about Blender's perpendicular of `a`.
 */
export function rotationDifference(a: Vec3, b: Vec3): Quat {
  const na = normalize(a);
  const nb = normalize(b);
  const c = cross(na, nb);
  const cl = length(c);
  if (cl > FLT_EPSILON) {
    const ang = angleNormalized(na, nb);
    const s = Math.sin(ang / 2) / cl;
    return [Math.cos(ang / 2), c[0] * s, c[1] * s, c[2] * s];
  }
  if (dot(na, nb) > 0) return [...IDENTITY];
  return axisAngle(orthoOf(na), Math.PI);
}

/** `a ∘ b`: apply `b`, then `a` (Hamilton product, mathutils `a @ b`). */
export function mul(a: Quat, b: Quat): Quat {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
}

export const conj = (q: Quat): Quat => [q[0], -q[1], -q[2], -q[3]];
export const qdot = (a: Quat, b: Quat): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
export const neg = (q: Quat): Quat => [-q[0], -q[1], -q[2], -q[3]];

export function qnormalize(q: Quat): Quat {
  const l = Math.hypot(q[0], q[1], q[2], q[3]);
  return l > 0 ? [q[0] / l, q[1] / l, q[2] / l, q[3] / l] : [...IDENTITY];
}

/** Rotate vector `v` by unit quaternion `q`. */
export function rotate(q: Quat, v: Vec3): Vec3 {
  const [w, x, y, z] = q;
  // t = 2 * (q.xyz × v); v' = v + w t + q.xyz × t
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  return [
    v[0] + w * tx + (y * tz - z * ty),
    v[1] + w * ty + (z * tx - x * tz),
    v[2] + w * tz + (x * ty - y * tx),
  ];
}

/**
 * Spherical interpolation (Blender's `interp_qt_qtqt`: shortest way round,
 * linear when the two are within 1e-4 of each other). The result is
 * normalised, as Blender normalises a pose quaternion before using it.
 */
export function slerp(a: Quat, b: Quat, t: number): Quat {
  let cosom = qdot(a, b);
  let from = a;
  if (cosom < 0) {
    cosom = -cosom;
    from = neg(a);
  }
  let s1: number;
  let s2: number;
  if (1 - cosom > 0.0001) {
    const omega = Math.acos(Math.min(1, cosom));
    const sinom = Math.sin(omega);
    s1 = Math.sin((1 - t) * omega) / sinom;
    s2 = Math.sin(t * omega) / sinom;
  } else {
    s1 = 1 - t;
    s2 = t;
  }
  return qnormalize([
    s1 * from[0] + s2 * b[0],
    s1 * from[1] + s2 * b[1],
    s1 * from[2] + s2 * b[2],
    s1 * from[3] + s2 * b[3],
  ]);
}

/** `q` or `-q`, whichever is nearer `ref` (the same rotation either way). */
export const compatible = (q: Quat, ref: Quat): Quat => (qdot(q, ref) < 0 ? neg(q) : q);

export function smoothstep(x: number): number {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
}

/** The inverse of `smoothstep` on [0, 1] (closed form). */
export function unsmoothstep(y: number): number {
  const c = Math.min(1, Math.max(0, y));
  return 0.5 - Math.sin(Math.asin(1 - 2 * c) / 3);
}

/**
 * A CSS `cubic-bezier(x1, y1, x2, y2)` timing function, so the rig's breath
 * eases exactly like the sprite's CSS breath transition.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const bx = (t: number) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const by = (t: number) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    const c = Math.min(1, Math.max(0, x));
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (bx(mid) < c) lo = mid;
      else hi = mid;
    }
    return by((lo + hi) / 2);
  };
}
