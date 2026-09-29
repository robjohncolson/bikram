/**
 * The mannequin's body as pure geometry data for the three.js layer: the
 * same tube graph the Blender skin modifier wraps (one edge per bone, the
 * palm splitting the hand, the ball splitting the foot, the heel a spur),
 * each edge a tapered tube from the radius at one end to the radius at
 * the other (the mean of the skin's (rx, ry) at that joint; the renderer
 * meshes `bodyRecipe` below instead, which keeps the ellipses). The skin's
 * vertices ride their bones rigidly, so every edge keeps its rest length:
 * the renderer builds each tube's mesh once and only moves it.
 */
import type { RigGuide } from '../data/types';
import type { Quat, Vec3 } from './math';
import { add, cross, dot, normalize, rotate, scale, slerp, sub } from './math';
import type { Solved } from './pose';
import { BONE, BONES, J, RADIUS, SKIN_EXTRA, VERTEX_BONE } from './skeleton';

export interface BodySegment {
  /** stable id of the tube edge (`a>b`), the same in every pose */
  key: string;
  from: Vec3;
  to: Vec3;
  /** radius at `from` / `to` */
  r0: number;
  r1: number;
  /** the bone the edge belongs to */
  bone: string;
}

const meanRadius = (vertex: string) => {
  const [rx, ry] = RADIUS[vertex.split('.')[0]];
  return (rx + ry) / 2;
};

interface Edge {
  a: string;
  b: string;
  bone: string;
}

/** The tube graph: bone edges, with the skin extras splitting or spurring off them. */
const EDGES: Edge[] = (() => {
  const edges: Edge[] = BONES.map(([name, h, t]) => ({ a: h, b: t, bone: name }));
  for (const [name, [, a, b, bone]] of Object.entries(SKIN_EXTRA)) {
    if (b !== null) {
      const i = edges.findIndex((e) => e.a === a && e.b === b);
      edges.splice(i, 1, { a, b: name, bone }, { a: name, b, bone });
    } else {
      edges.push({ a, b: name, bone });
    }
  }
  return edges;
})();

/** Where a skin vertex (joint or extra) sits in a solved pose. */
function vertexAt(solved: Solved, v: string): Vec3 {
  const extra = SKIN_EXTRA[v];
  const bone = extra ? extra[3] : VERTEX_BONE[v];
  const rest = extra ? extra[0] : J[v];
  const b = solved[bone];
  return add(b.head, rotate(b.q, sub(rest, J[BONE[bone][1]])));
}

/** Every tube of the body in a solved pose. */
export function bodySegments(solved: Solved): BodySegment[] {
  const at = new Map<string, Vec3>();
  const pos = (v: string) => {
    let p = at.get(v);
    if (!p) {
      p = vertexAt(solved, v);
      at.set(v, p);
    }
    return p;
  };
  return EDGES.map((e) => ({
    key: `${e.a}>${e.b}`,
    from: pos(e.a),
    to: pos(e.b),
    r0: meanRadius(e.a),
    r1: meanRadius(e.b),
    bone: e.bone,
  }));
}

/**
 * A stage's guides as world-space line segments: a line as itself, a
 * plane as its four edges (a frontal `y` pane or a sagittal `x` pane,
 * `z` its bottom/top, `w` its width centred on the midline — the
 * renderer's defaults (0, 2) and 1.0).
 */
export function guideSegments(guides: RigGuide[] | undefined): [Vec3, Vec3][] {
  const out: [Vec3, Vec3][] = [];
  for (const g of guides ?? []) {
    if ('plane' in g) {
      const [lo, hi] = g.z ?? [0, 2];
      const w = (g.w ?? 1) / 2;
      const c: Vec3[] =
        g.plane === 'y'
          ? [[-w, g.at, lo], [w, g.at, lo], [w, g.at, hi], [-w, g.at, hi]]
          : [[g.at, -w, lo], [g.at, w, lo], [g.at, w, hi], [g.at, -w, hi]];
      for (let i = 0; i < 4; i++) out.push([c[i], c[(i + 1) % 4]]);
    } else {
      out.push([[...g.from], [...g.to]]);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// The mesh recipe. The sheets are drawn from Blender's skin AFTER its
// subdivision surface, and that hull is not the skin radii: subdivision
// rounds every ring in by ~8 %, averages the torso (the chest comes in,
// the waist fills out), merges the neck into the shoulders, and ends a
// limb AT its last vertex instead of a radius beyond it. So the mesh is
// built from `SKIN_FIT` — the hull's own cross-sections at rest — as
// elliptical tubes and joint ellipsoids in the REST pose, rigid with their
// bones (`placeBone` gives the transform), so posing only moves them.
// ---------------------------------------------------------------------------

/** An ellipsoid's three radii along world X, Y, Z at rest. */
export type Radii3 = [number, number, number];

/**
 * The subdivided skin's half-widths at each joint stem, at rest: [across
 * the body (world X), front–back (world Y)] — for the foot's vertices
 * (which lie along Y) [across, sole thickness (world Z)]. MEASURED, not
 * tuned: `scripts/blender/measure_skin_fit.py` sections Blender's evaluated
 * body (Skin + Subdivision level 2, `build_body` in render_motion.py) by a
 * rule per stem — the ring through the joint; a leaf's widest ring over its
 * end cap; the ankle's first round ring up the shin (clear of the heel);
 * the shoulder's and hip's first ring clear of the torso; the neck's first
 * ring up no wider than the chest (the base of the neck, where the
 * shoulders' slope comes in); the heel spur, buried in the
 * foot, its skin radius rounded in — and writes
 * `src/rig/fixtures/skin-fit-from-blender.json`. These are those values to
 * 3 decimals; `body.test.ts` holds them to the fixture (and checks every
 * `RADIUS` stem has one). Rerun the script if the skin changes.
 */
export const SKIN_FIT: Record<string, [number, number]> = {
  pelvis: [0.155, 0.083],
  waist: [0.119, 0.086],
  chest: [0.129, 0.092],
  neck: [0.125, 0.094],
  head: [0.084, 0.091],
  crown: [0.07, 0.079],
  shoulder: [0.047, 0.052],
  elbow: [0.042, 0.041],
  wrist: [0.032, 0.035],
  fingers: [0.019, 0.028],
  palm: [0.03, 0.04],
  hip: [0.077, 0.074],
  knee: [0.055, 0.055],
  ankle: [0.045, 0.047],
  toes: [0.036, 0.024],
  ball: [0.04, 0.028],
  heel: [0.035, 0.035],
};

/** How far subdivision rounds a skin ring in (the knee: 0.055 of 0.06) — for the rings `SKIN_FIT` does not describe. */
export const SUBSURF_SHRINK = 0.92;

const isFoot = (vertex: string) => /^(toes|ball|heel)\./.test(vertex);
const stem = (vertex: string) => vertex.split('.')[0];

/** Radius of an ellipsoid along a unit direction. */
export function radiusAlong(r: Radii3, w: Vec3): number {
  return 1 / Math.hypot(w[0] / r[0], w[1] / r[1], w[2] / r[2]);
}

export interface TubeRecipe {
  key: string;
  bone: string;
  /** rest positions of the two ends */
  from: Vec3;
  to: Vec3;
  /** unit cross-section axes (perpendicular to the edge) */
  u: Vec3;
  v: Vec3;
  /** radii along u / v at each end */
  ru: [number, number];
  rv: [number, number];
}

/** A tube's end ring at a joint, in the rest pose, riding `bone`: centre + U·cos θ + V·sin θ. */
export interface RimRecipe {
  bone: string;
  centre: Vec3;
  U: Vec3;
  V: Vec3;
}

export interface JointRecipe {
  vertex: string;
  bone: string;
  at: Vec3;
  radii: Radii3;
  /** the end rings of the tubes that meet here (side branches excluded) — the joint must enclose them */
  rims: RimRecipe[];
}

const restOf = (v: string): Vec3 => (SKIN_EXTRA[v] ? SKIN_EXTRA[v][0] : J[v]);
const boneOf = (v: string): string => (SKIN_EXTRA[v] ? SKIN_EXTRA[v][3] : VERTEX_BONE[v]);
const BONE_TAIL: Record<string, string> = Object.fromEntries(BONES.map(([n, , t]) => [n, t]));

/** Every tube edge meeting at each skin vertex. */
const EDGES_AT: Map<string, Edge[]> = (() => {
  const m = new Map<string, Edge[]>();
  for (const e of EDGES) for (const v of [e.a, e.b]) m.set(v, [...(m.get(v) ?? []), e]);
  return m;
})();

/** A skin vertex with a single tube: the crown, fingertips, toes and heels. */
export const isLeaf = (vertex: string) => (EDGES_AT.get(vertex)?.length ?? 0) === 1;

/**
 * A tube that leaves a joint SIDEWAYS: a bone other than the joint's own
 * that starts there (the clavicles at the neck, the hip bones at the
 * pelvis). The skin's branch hull swallows its end, so that end keeps the
 * plain skin radius (rounded in) rather than the joint's fitted section.
 */
function isSideEnd(e: Edge, vertex: string): boolean {
  return e.bone !== boneOf(vertex) && BONE_TAIL[e.bone] !== vertex && e.a === vertex;
}

/** The skin's own ring at a vertex, rounded in (`SUBSURF_SHRINK`), as an ellipsoid. */
function skinRadii(vertex: string): Radii3 {
  const [rx, ry] = RADIUS[stem(vertex)];
  const s = SUBSURF_SHRINK;
  return isFoot(vertex) ? [rx * s, rx * s, ry * s] : [rx * s, ry * s, ry * s];
}

/** The cross-section axes of a rest edge. */
function crossAxes(from: Vec3, to: Vec3): { d: Vec3; u: Vec3; v: Vec3 } {
  const d = normalize(sub(to, from));
  const ref: Vec3 = Math.abs(d[0]) > 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = normalize(sub(ref, scale(d, dot(ref, d))));
  return { d, u, v: cross(d, u) };
}

/** The ring (radii along u, v) an edge's end has at a vertex. */
function ringAt(e: Edge, vertex: string, u: Vec3, v: Vec3): [number, number] {
  const r = isSideEnd(e, vertex) ? skinRadii(vertex) : crossRadii(vertex);
  return [radiusAlong(r, u), radiusAlong(r, v)];
}

/** A joint's fitted section as an ellipsoid with the along-the-limb radius left at the smaller cross radius. */
function crossRadii(vertex: string): Radii3 {
  const [a, b] = SKIN_FIT[stem(vertex)];
  const m = Math.min(a, b);
  return isFoot(vertex) ? [a, m, b] : [a, b, m];
}

/**
 * Rest-space ellipsoid of a skin vertex (`SKIN_FIT`). Its radius ALONG the
 * limb is the smaller cross radius — a limb end is as round as it is thin
 * — raised to cover the rings of other bones' tubes that end there (the
 * pelvis tube's top ring at the waist, the forearm's at the wrist), so a
 * hinge that bends never shows the tube's rim past the joint.
 */
export function vertexRadii(vertex: string): Radii3 {
  const r = crossRadii(vertex);
  const along = isFoot(vertex) ? 1 : 2;
  const [a, b] = SKIN_FIT[stem(vertex)];
  let need = r[along];
  for (const e of EDGES_AT.get(vertex) ?? []) {
    if (e.bone === boneOf(vertex)) continue;
    const { u, v } = crossAxes(restOf(e.a), restOf(e.b));
    need = Math.max(need, ...ringAt(e, vertex, u, v));
  }
  r[along] = Math.min(Math.max(a, b), Math.max(r[along], need));
  return r;
}

/**
 * Where a vertex's ellipsoid (and its tube's end) sits at rest. A leaf's
 * is pulled back along its tube by its own radius there, so the rounded
 * end reaches the vertex and stops — as the subdivided skin does (the
 * crown's top is at 1.713 for a vertex at 1.72, not a radius above it).
 */
export function jointCenter(vertex: string): Vec3 {
  const at = restOf(vertex);
  if (!isLeaf(vertex)) return at;
  const e = EDGES_AT.get(vertex)![0];
  const other = e.a === vertex ? e.b : e.a;
  const w = normalize(sub(at, restOf(other)));
  return sub(at, scale(w, radiusAlong(vertexRadii(vertex), w)));
}

/** Every tube and joint of the body, in the rest pose, with the bone it rides. */
export function bodyRecipe(): { tubes: TubeRecipe[]; joints: JointRecipe[] } {
  const tubes = EDGES.map((e): TubeRecipe => {
    const from = jointCenter(e.a);
    const to = jointCenter(e.b);
    const { u, v } = crossAxes(from, to);
    const ra = ringAt(e, e.a, u, v);
    const rb = ringAt(e, e.b, u, v);
    return { key: `${e.a}>${e.b}`, bone: e.bone, from, to, u, v, ru: [ra[0], rb[0]], rv: [ra[1], rb[1]] };
  });
  const seen = new Set<string>();
  const joints: JointRecipe[] = [];
  const rimsAt = (v: string): RimRecipe[] =>
    tubes.flatMap((t, i) => {
      const e = EDGES[i];
      if ((e.a !== v && e.b !== v) || isSideEnd(e, v)) return [];
      const end = e.a === v ? 0 : 1;
      return [{ bone: t.bone, centre: end === 0 ? t.from : t.to, U: scale(t.u, t.ru[end]), V: scale(t.v, t.rv[end]) }];
    });
  for (const e of EDGES) {
    for (const v of [e.a, e.b]) {
      if (seen.has(v)) continue;
      seen.add(v);
      joints.push({ vertex: v, bone: boneOf(v), at: jointCenter(v), radii: vertexRadii(v), rims: rimsAt(v) });
    }
  }
  return { tubes, joints };
}

/**
 * The rigid transform carrying a bone's rest-space geometry to its pose:
 * rotate by the bone's world rotation, then translate by `position`
 * (world = position + rotate(q, rest)).
 */
export function placeBone(solved: Solved, bone: string): { position: Vec3; q: Solved[string]['q'] } {
  const b = solved[bone];
  return { position: sub(b.head, rotate(b.q, J[BONE[bone][1]])), q: b.q };
}

/**
 * The bone on the far side of a hinge: the one whose tube ENDS at the
 * joint while the joint rides the next bone (the thigh at the knee, the
 * pelvis at the waist). Undefined where only one bone meets the joint.
 */
export function hingeBone(vertex: string): string | undefined {
  const own = boneOf(vertex);
  return (EDGES_AT.get(vertex) ?? []).find((e) => e.bone !== own && BONE_TAIL[e.bone] === vertex)?.bone;
}

/**
 * The rigid transform of a joint's ellipsoid (rest centre `at`): it sits
 * on its own bone, but a hinge joint turns HALFWAY between the two bones
 * that meet there, as the skin's ring at a bend lies across the bisector.
 * Riding one side, an elliptical joint shows its long axis past the other
 * side's surface (a lumpy back in a deep arch); halfway, each tube's rim
 * is turned only half the bend from it.
 */
export function placeJoint(solved: Solved, joint: JointRecipe): { position: Vec3; q: Quat } {
  const own = placeBone(solved, joint.bone);
  const h = hingeBone(joint.vertex);
  if (!h) return own;
  const centre = add(own.position, rotate(own.q, joint.at));
  const q = slerp(solved[h].q, own.q, 0.5);
  return { position: sub(centre, rotate(q, joint.at)), q };
}

/**
 * The radii a joint's ellipsoid takes in a pose (in its own frame, as
 * `placeJoint` turns it) so it encloses every tube rim that meets it. At
 * rest the fitted joint already does (its along-the-limb radius covers the
 * rims, `vertexRadii`), so the measured silhouette stands; but once the
 * rims turn against the halfway-turned ellipsoid — a relative ROLL between
 * the two bones (a twisting spine: the lower spine rolled 25° off the
 * pelvis), or a bend that swings a wide rim into a narrow axis — a rim's
 * wide side would poke through. Two candidates, the one that grows the
 * joint least wins:
 * (a) the fit grown uniformly just enough;
 * (b) each axis first grown to the rims' reach along it (a rim c + U cos θ
 *     + V sin θ reaches |c_k| + √(U_k² + V_k²) along axis k) — the joint
 *     takes a rolled rim's width where it went, not everywhere — then
 *     uniformly for what still leans out between the axes.
 * "Just enough" is exact: with D = diag(1/radii) and the rim centred on
 * the joint (as every tube end is), a rim's largest norm² is the top
 * eigenvalue of the 2×2 Gram matrix of DU, DV (an off-centre rim, never in
 * the recipe, is sampled). The result is ≥ `joint.radii` on every axis and
 * equals it at rest.
 */
export function jointRadii(solved: Solved, joint: JointRecipe): Radii3 {
  const { position, q } = placeJoint(solved, joint);
  const qi: Quat = [q[0], -q[1], -q[2], -q[3]];
  const rims = joint.rims.map((rim) => {
    const b = placeBone(solved, rim.bone);
    const toJoint = (w: Vec3) => rotate(qi, rotate(b.q, w));
    const c = sub(rotate(qi, sub(add(b.position, rotate(b.q, rim.centre)), position)), joint.at);
    return { c, U: toJoint(rim.U), V: toJoint(rim.V) };
  });
  // the uniform growth radii `r` still need to hold every rim
  const excess = (r: Radii3): number => {
    const d = (w: Vec3): Vec3 => [w[0] / r[0], w[1] / r[1], w[2] / r[2]];
    let worst = 1;
    for (const rim of rims) {
      const U = d(rim.U);
      const V = d(rim.V);
      const C = d(rim.c);
      let n2: number;
      if (Math.hypot(...C) < 1e-9) {
        const a = dot(U, U);
        const e = dot(V, V);
        const f = dot(U, V);
        n2 = (a + e) / 2 + Math.sqrt(((a - e) / 2) ** 2 + f * f);
      } else {
        n2 = 0;
        for (let k = 0; k < 96; k++) {
          const t = (k / 96) * Math.PI * 2;
          const p = add(C, add(scale(U, Math.cos(t)), scale(V, Math.sin(t))));
          n2 = Math.max(n2, dot(p, p));
        }
      }
      worst = Math.max(worst, Math.sqrt(n2));
    }
    return worst;
  };
  const fit = joint.radii;
  // (a) grow uniformly from the fit; (b) grow each axis to the rims' reach, then uniformly
  const reach: Radii3 = [...fit];
  for (const { c, U, V } of rims) {
    for (let k = 0; k < 3; k++) reach[k] = Math.max(reach[k], Math.abs(c[k]) + Math.hypot(U[k], V[k]));
  }
  const ua = excess(fit);
  const ub = excess(reach);
  const a: Radii3 = [fit[0] * ua, fit[1] * ua, fit[2] * ua];
  const b: Radii3 = [reach[0] * ub, reach[1] * ub, reach[2] * ub];
  const growth = (r: Radii3) => Math.max(r[0] / fit[0], r[1] / fit[1], r[2] / fit[2]);
  // whichever grows the joint least
  return growth(a) <= growth(b) ? a : b;
}
