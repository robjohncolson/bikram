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
import type { Vec3 } from './math';
import { add, cross, dot, normalize, rotate, scale, sub } from './math';
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
// The mesh recipe. The skin's radii are ELLIPTICAL — (rx, ry): wide across
// the body (world X), shallow front to back — and a round tube of their
// mean reads right from the front but fat from the side. So the renderer
// builds each tube and joint as an ellipse in the REST pose, rigid with
// its bone, and only moves it: `placeBone` gives the rigid transform.
// ---------------------------------------------------------------------------

/** An ellipsoid's three radii along world X, Y, Z at rest. */
export type Radii3 = [number, number, number];

/** Rest-space ellipsoid of a skin vertex: across the body rx; front–back ry, except the feet, which lie along Y (their ry is the sole's thickness). */
export function vertexRadii(vertex: string): Radii3 {
  const [rx, ry] = RADIUS[vertex.split('.')[0]];
  const foot = /^(toes|ball|heel)\./.test(vertex);
  return foot ? [rx, rx, ry] : [rx, ry, ry];
}

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

export interface JointRecipe {
  vertex: string;
  bone: string;
  at: Vec3;
  radii: Radii3;
}

const restOf = (v: string): Vec3 => (SKIN_EXTRA[v] ? SKIN_EXTRA[v][0] : J[v]);
const boneOf = (v: string): string => (SKIN_EXTRA[v] ? SKIN_EXTRA[v][3] : VERTEX_BONE[v]);

/** Every tube and joint of the body, in the rest pose, with the bone it rides. */
export function bodyRecipe(): { tubes: TubeRecipe[]; joints: JointRecipe[] } {
  const tubes = EDGES.map((e): TubeRecipe => {
    const from = restOf(e.a);
    const to = restOf(e.b);
    const d = normalize(sub(to, from));
    const ref: Vec3 = Math.abs(d[0]) > 0.9 ? [0, 1, 0] : [1, 0, 0];
    const u = normalize(sub(ref, scale(d, dot(ref, d))));
    const v = cross(d, u);
    const ra = vertexRadii(e.a);
    const rb = vertexRadii(e.b);
    return {
      key: `${e.a}>${e.b}`,
      bone: e.bone,
      from,
      to,
      u,
      v,
      ru: [radiusAlong(ra, u), radiusAlong(rb, u)],
      rv: [radiusAlong(ra, v), radiusAlong(rb, v)],
    };
  });
  const seen = new Set<string>();
  const joints: JointRecipe[] = [];
  for (const e of EDGES) {
    for (const v of [e.a, e.b]) {
      if (seen.has(v)) continue;
      seen.add(v);
      joints.push({ vertex: v, bone: boneOf(v), at: restOf(v), radii: vertexRadii(v) });
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
