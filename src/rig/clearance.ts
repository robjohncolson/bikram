/**
 * CLEARANCE: limbs never pass through each other. Measured on the RENDERED
 * hull — the tubes and joint ellipsoids of `bodyRecipe`, placed exactly as
 * FigureRig places them (`placeBone`, `placeJoint`, `jointRadii`) — not on
 * the bones.
 *
 * Every pair of hull pieces is compared unless a named rule exempts it:
 * - SHARED JOINT: the two pieces meet at a skin vertex (a tube and the
 *   ellipsoid at its end, two tubes through one joint, the two ends of one
 *   tube). A deep knee bend folds the calf into the hamstring; that is the
 *   joint's own business. The heel, ball and palm swellings count as their
 *   bone's own joint.
 * - TRUNK NEIGHBOURS: two trunk pieces (pelvis, spine, neck, head,
 *   clavicles, hip bones) at most `TRUNK_HOPS` (two) skin edges apart along
 *   the trunk — the pelvis and the chest across the waist, the head and the
 *   chest across the neck (the chin on the breastbone), a clavicle and the
 *   spine — are one skin: the subdivided torso merges them. Trunk pieces
 *   further apart (the head and the waist or pelvis, the crown and the
 *   chest) ARE compared.
 * - HIP SOCKET: a thigh's root sits inside the pelvis's hull at rest. Its
 *   hip ellipsoid and thigh tube, against ITS OWN side's pelvis pieces (the
 *   pelvis and waist ellipsoids, the pelvis tube, its own hip bone), are
 *   compared only outside `SOCKET_R` of its hip joint: the proximal overlap
 *   is the socket, the distal thigh is not. The opposite hip bone is
 *   compared in full.
 * - LACED HANDS: only in a stage that says `hands: 'laced'` (and a blend
 *   into or out of one): the rig has no fingers, so interlaced fingers are
 *   two hands in one place. Only the finger regions (the palm → fingers
 *   tube and the fingertip ellipsoid) of the two hands are exempt from each
 *   other; the wrists and the proximal palms are compared.
 * Nothing else is exempt and the tolerance is one number for every sheet.
 *
 * A pair's depth is how far the surface of one piece reaches inside the
 * other (radially, along the section's own ellipse), sampled every ~1.5 cm
 * along a tube and all round it; pieces whose bounding spheres do not
 * touch are skipped.
 */
import type { JointRecipe, TubeRecipe } from './body';
import { bodyRecipe, jointRadii, placeBone, placeJoint } from './body';
import { SKIN_EXTRA } from './skeleton';
import type { Quat, Vec3 } from './math';
import { add, dot, length, rotate, scale, sub } from './math';
import type { Solved } from './pose';

/** Interpenetration allowed between two pieces (m): one number, never per posture. */
export const CLEARANCE_TOL = 0.01;

const TRUNK_BONES = new Set(['pelvis', 'spine.lower', 'spine.upper', 'neck', 'head', 'clavicle.L', 'clavicle.R', 'hipbone.L', 'hipbone.R']);
/** A socket pair counts only sample points further than this from the thigh's own hip joint (m). */
export const SOCKET_R = 0.13;
/** the finger region of a hand: the palm → fingers tube and the fingertip ellipsoid */
const FINGER_PIECE = /^(palm\.[LR]>fingers\.[LR]|fingers\.[LR])$/;

interface Piece {
  name: string;
  /** skin vertices this piece touches (a tube's two ends, a joint's own) */
  verts: string[];
  bone: string;
  tube?: TubeRecipe;
  joint?: JointRecipe;
}

const RECIPE = bodyRecipe();

const PIECES: Piece[] = [
  ...RECIPE.tubes.map((t): Piece => ({ name: t.key, verts: t.key.split('>'), bone: t.bone, tube: t })),
  ...RECIPE.joints.map((j): Piece => ({ name: j.vertex, verts: [j.vertex], bone: j.bone, joint: j })),
];

/** A swelling (palm, ball, heel) counts as its bone's own joint: it is a bulge on the bone, not a joint. */
const canon = (v: string): string => (SKIN_EXTRA[v] ? SKIN_EXTRA[v][1] : v);
const EDGE_SET = new Set(RECIPE.tubes.flatMap((t) => [t.key, t.key.split('>').reverse().join('>')]));
const sideOf = (name: string) => (name.endsWith('.L') ? 'L' : name.endsWith('.R') ? 'R' : undefined);
const thighSide = (p: Piece) => (/^thigh\.[LR]$/.test(p.bone) ? sideOf(p.bone) : undefined);
/** a side's own pelvis pieces: the pelvis tube and ellipsoid, the waist ellipsoid on top, its own hip bone */
const isOwnPelvisPiece = (p: Piece, side: string) =>
  p.bone === 'pelvis' || p.bone === `hipbone.${side}` || (p.joint !== undefined && p.name === 'waist');
/** skin vertices joined by a trunk bone's tube (the trunk's own graph: spine, neck, head, clavicles, hip bones) */
const TRUNK_EDGES = RECIPE.tubes.filter((t) => TRUNK_BONES.has(t.bone)).map((t) => t.key.split('>'));
/** trunk skin-graph distance between two vertices (Infinity off the trunk graph) */
const trunkHops = (() => {
  const nb = new Map<string, string[]>();
  for (const [x, y] of TRUNK_EDGES) {
    nb.set(x, [...(nb.get(x) ?? []), y]);
    nb.set(y, [...(nb.get(y) ?? []), x]);
  }
  return (from: string, to: string): number => {
    const seen = new Map([[from, 0]]);
    const queue = [from];
    while (queue.length) {
      const v = queue.shift()!;
      if (v === to) return seen.get(v)!;
      for (const w of nb.get(v) ?? []) {
        if (seen.has(w)) continue;
        seen.set(w, seen.get(v)! + 1);
        queue.push(w);
      }
    }
    return Infinity;
  };
})();
/** Trunk pieces within two trunk edges of each other (the neck between the head and the chest; the waist between the pelvis and the chest). */
export const TRUNK_HOPS = 2;
const trunkNeighbours = (a: Piece, b: Piece) => a.verts.some((v) => b.verts.some((w) => trunkHops(v, w) <= TRUNK_HOPS));

/** How a pair is treated. */
type Mode = 'shared joint' | 'trunk neighbours' | 'hip socket' | 'laced hands' | undefined;

/** The named rule that governs a pair, or undefined when the pair is compared in full. */
function ruleOf(a: Piece, b: Piece): Mode {
  const ca = a.verts.map(canon);
  const cb = b.verts.map(canon);
  if (ca.some((v) => cb.includes(v))) return 'shared joint';
  if (a.joint && b.joint && EDGE_SET.has(`${a.name}>${b.name}`)) return 'shared joint';
  if (TRUNK_BONES.has(a.bone) && TRUNK_BONES.has(b.bone) && trunkNeighbours(a, b)) return 'trunk neighbours';
  const ta = thighSide(a);
  const tb = thighSide(b);
  if ((ta && isOwnPelvisPiece(b, ta)) || (tb && isOwnPelvisPiece(a, tb))) return 'hip socket';
  if (FINGER_PIECE.test(a.name) && FINGER_PIECE.test(b.name) && sideOf(a.name) !== sideOf(b.name)) return 'laced hands';
  return undefined;
}

interface Pair {
  i: number;
  k: number;
  mode: Mode;
  /** a socket pair: the thigh's hip joint */
  hip?: string;
}

/** Every pair the check looks at (fully, or under a conditional rule), fixed for the rig. */
const PAIRS: Pair[] = [];
for (let i = 0; i < PIECES.length; i++) {
  for (let k = i + 1; k < PIECES.length; k++) {
    const mode = ruleOf(PIECES[i], PIECES[k]);
    if (mode === 'shared joint' || mode === 'trunk neighbours') continue;
    const side = thighSide(PIECES[i]) ?? thighSide(PIECES[k]);
    PAIRS.push({ i, k, mode, hip: mode === 'hip socket' ? `hip.${side}` : undefined });
  }
}

interface Placed {
  position: Vec3;
  q: Quat;
  qi: Quat;
  /** joint radii in this pose */
  radii?: [number, number, number];
  centre: Vec3;
  bound: number;
}

const conjQ = (q: Quat): Quat => [q[0], -q[1], -q[2], -q[3]];

function place(s: Solved, p: Piece): Placed {
  if (p.tube) {
    const t = p.tube;
    const { position, q } = placeBone(s, t.bone);
    const mid = scale(add(t.from, t.to), 0.5);
    const r = Math.max(...t.ru, ...t.rv);
    return { position, q, qi: conjQ(q), centre: add(position, rotate(q, mid)), bound: length(sub(t.to, t.from)) / 2 + r };
  }
  const j = p.joint!;
  const { position, q } = placeJoint(s, j);
  const radii = jointRadii(s, j);
  return { position, q, qi: conjQ(q), radii, centre: add(position, rotate(q, j.at)), bound: Math.max(...radii) };
}

/** How deep world point `w` lies inside piece `p` (0 when outside). */
function depthInside(p: Piece, pl: Placed, w: Vec3): number {
  const r = rotate(pl.qi, sub(w, pl.position));
  if (p.tube) {
    const t = p.tube;
    const axis = sub(t.to, t.from);
    const L = length(axis);
    const d = scale(axis, 1 / L);
    const k = dot(sub(r, t.from), d) / L;
    if (k < 0 || k > 1) return 0;
    const ru = t.ru[0] + (t.ru[1] - t.ru[0]) * k;
    const rv = t.rv[0] + (t.rv[1] - t.rv[0]) * k;
    const off = sub(r, add(t.from, scale(d, k * L)));
    const rho = Math.hypot(dot(off, t.u) / ru, dot(off, t.v) / rv);
    if (rho >= 1) return 0;
    return rho < 1e-9 ? Math.min(ru, rv) : length(off) * (1 / rho - 1);
  }
  const j = p.joint!;
  const [rx, ry, rz] = pl.radii!;
  const off = sub(r, j.at);
  const rho = Math.hypot(off[0] / rx, off[1] / ry, off[2] / rz);
  if (rho >= 1) return 0;
  return rho < 1e-9 ? Math.min(rx, ry, rz) : length(off) * (1 / rho - 1);
}

const ANGLES = 16;
const STEP = 0.015;
/** unit directions for sampling an ellipsoid's surface */
const SPHERE: Vec3[] = (() => {
  const out: Vec3[] = [
    [0, 0, 1],
    [0, 0, -1],
  ];
  for (let i = 1; i < 8; i++) {
    const th = (i / 8) * Math.PI;
    for (let k = 0; k < ANGLES; k++) {
      const ph = (k / ANGLES) * 2 * Math.PI;
      out.push([Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]);
    }
  }
  return out;
})();

/** Surface sample points of a piece, in world space. */
function samples(p: Piece, pl: Placed): Vec3[] {
  const out: Vec3[] = [];
  if (p.tube) {
    const t = p.tube;
    const axis = sub(t.to, t.from);
    const n = Math.max(2, Math.ceil(length(axis) / STEP));
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      const c = add(t.from, scale(axis, k));
      const ru = t.ru[0] + (t.ru[1] - t.ru[0]) * k;
      const rv = t.rv[0] + (t.rv[1] - t.rv[0]) * k;
      for (let a = 0; a < ANGLES; a++) {
        const th = (a / ANGLES) * 2 * Math.PI;
        const r = add(c, add(scale(t.u, ru * Math.cos(th)), scale(t.v, rv * Math.sin(th))));
        out.push(add(pl.position, rotate(pl.q, r)));
      }
    }
    return out;
  }
  const j = p.joint!;
  const [rx, ry, rz] = pl.radii!;
  for (const e of SPHERE) out.push(add(pl.position, rotate(pl.q, add(j.at, [e[0] * rx, e[1] * ry, e[2] * rz]))));
  return out;
}

export interface Clash {
  a: string;
  b: string;
  /** metres of interpenetration */
  depth: number;
}

export interface ClearanceOptions {
  /** the stage laces the fingers (`hands: 'laced'`): the finger regions of the two hands are exempt */
  laced?: boolean;
}

/** A hip joint's world position (the thigh's head). */
const hipAt = (s: Solved, hip: string): Vec3 => s[`thigh.${hip.slice(-1)}`].head;

/** Every compared pair that interpenetrates by more than `tol`, deepest first. */
export function clashes(s: Solved, tol = CLEARANCE_TOL, opts: ClearanceOptions = {}): Clash[] {
  const placed = PIECES.map((p) => place(s, p));
  const pts: (Vec3[] | undefined)[] = [];
  const pointsOf = (i: number) => (pts[i] ??= samples(PIECES[i], placed[i]));
  const out: Clash[] = [];
  for (const { i, k, mode, hip } of PAIRS) {
    if (mode === 'laced hands' && opts.laced) continue;
    const A = placed[i];
    const B = placed[k];
    if (length(sub(A.centre, B.centre)) > A.bound + B.bound) continue;
    // a socket pair: the proximal overlap round the thigh's own hip joint is the socket
    const h = hip ? hipAt(s, hip) : undefined;
    const counts = (w: Vec3) => !h || length(sub(w, h)) > SOCKET_R;
    let depth = 0;
    for (const w of pointsOf(i)) if (counts(w)) depth = Math.max(depth, depthInside(PIECES[k], B, w));
    for (const w of pointsOf(k)) if (counts(w)) depth = Math.max(depth, depthInside(PIECES[i], A, w));
    if (depth > tol) out.push({ a: PIECES[i].name, b: PIECES[k].name, depth });
  }
  return out.sort((x, y) => y.depth - x.depth);
}

/** Every hull surface sample point in a pose (for framing checks). */
export function hullPoints(s: Solved): Vec3[] {
  return PIECES.flatMap((p) => samples(p, place(s, p)));
}

/** The deepest interpenetration over compared pairs (0 when clear). */
export function worstClash(s: Solved): Clash | undefined {
  return clashes(s, 0)[0];
}

/** For tests: every piece name and the rule (if any) exempting a pair of them. */
export function pieceNames(): string[] {
  return PIECES.map((p) => p.name);
}

export function pairRule(a: string, b: string): string | undefined {
  const pa = PIECES.find((p) => p.name === a);
  const pb = PIECES.find((p) => p.name === b);
  if (!pa || !pb) throw new Error(`clearance: no piece ${pa ? b : a}`);
  return ruleOf(pa, pb);
}

