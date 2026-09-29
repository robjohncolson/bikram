import { describe, expect, it } from 'vitest';
import spineTwisting from '../data/rig/spine-twisting.json';
import type { RigData } from '../data/types';
import { SKIN_FIT, bodyRecipe, hingeBone, isLeaf, jointCenter, jointRadii, placeBone, placeJoint, radiusAlong, vertexRadii } from './body';
import type { JointRecipe, Radii3, TubeRecipe } from './body';
import skinFit from './fixtures/skin-fit-from-blender.json';
import type { Quat, Vec3 } from './math';
import { add, axisAngle, normalize, rotate, scale, sub } from './math';
import type { Solved } from './pose';
import { applyStage, solve } from './pose';
import { sheetPose, stagePose } from './sheet';
import { J, RADIUS, SKIN_EXTRA, restDirections } from './skeleton';

const { tubes, joints } = bodyRecipe();
const restOf = (v: string): Vec3 => (SKIN_EXTRA[v] ? SKIN_EXTRA[v][0] : J[v]);
const jointOf = (v: string) => joints.find((j) => j.vertex === v)!;
const close = (a: Vec3, b: Vec3, eps = 1e-9) => a.forEach((c, i) => expect(c).toBeCloseTo(b[i], -Math.log10(eps)));

/** ellipsoid norm of a point relative to an axis-aligned rest ellipsoid (≤ 1 inside) */
const ellNorm = (p: Vec3, c: Vec3, r: Radii3) => Math.hypot((p[0] - c[0]) / r[0], (p[1] - c[1]) / r[1], (p[2] - c[2]) / r[2]);

describe('mesh recipe (the subdivided skin)', () => {
  it('has a fitted section for every skin radius', () => {
    expect(Object.keys(SKIN_FIT).sort()).toEqual(Object.keys(RADIUS).sort());
    for (const [a, b] of Object.values(SKIN_FIT)) {
      expect(a).toBeGreaterThan(0);
      expect(b).toBeGreaterThan(0);
    }
  });

  it("holds SKIN_FIT to Blender's own sections (scripts/blender/measure_skin_fit.py → fixtures/skin-fit-from-blender.json)", () => {
    const fit = skinFit as unknown as Record<string, { fit: [number, number]; rule: string }>;
    expect(Object.keys(fit).sort()).toEqual(Object.keys(SKIN_FIT).sort());
    for (const [stem, [a, b]] of Object.entries(SKIN_FIT)) {
      // SKIN_FIT is the fixture to 3 decimals
      expect(Math.abs(a - fit[stem].fit[0]), `${stem} across`).toBeLessThanOrEqual(0.0005 + 1e-12);
      expect(Math.abs(b - fit[stem].fit[1]), `${stem} front-back`).toBeLessThanOrEqual(0.0005 + 1e-12);
    }
    // and the joints are built from them
    const at = (v: string) => jointOf(v).radii;
    expect(at('chest').slice(0, 2)).toEqual(SKIN_FIT.chest);
    expect(at('waist').slice(0, 2)).toEqual(SKIN_FIT.waist);
    expect(at('knee.L')[0]).toBe(SKIN_FIT.knee[0]);
    // the palm is thin across and wide front to back
    expect(at('palm.L')[0]).toBeLessThan(at('palm.L')[1]);
  });

  it('ends every leaf AT its vertex, not a radius beyond it', () => {
    const leaves = ['crown', 'fingers.L', 'fingers.R', 'toes.L', 'toes.R', 'heel.L', 'heel.R'];
    expect(joints.filter((j) => isLeaf(j.vertex)).map((j) => j.vertex).sort()).toEqual([...leaves].sort());
    for (const v of leaves) {
      const tube = tubes.find((t) => t.key.endsWith(`>${v}`))!;
      const w = normalize(sub(restOf(v), tube.from));
      const tip = add(jointCenter(v), scale(w, radiusAlong(vertexRadii(v), w)));
      close(tip, restOf(v));
      // and the tube stops at the pulled-back centre
      close(tube.to, jointCenter(v));
    }
    // the head's top: the crown vertex (1.72), where Blender's skin tops out at 1.713
    expect(jointCenter('crown')[2] + jointOf('crown').radii[2]).toBeCloseTo(1.72, 9);
  });

  it('covers the tube rims at every hinge, bent either way about either cross axis — and a plain bend of an in-line hinge needs no real growth (no kinks)', () => {
    const hinges = joints.filter((j) => hingeBone(j.vertex));
    expect(hinges.map((j) => j.vertex)).toEqual(
      expect.arrayContaining(['waist', 'chest', 'neck', 'knee.L', 'elbow.R', 'wrist.L', 'ankle.R', 'shoulder.L', 'hip.R']),
    );
    const rest = restDirections();
    const growth: Record<string, number> = {};
    for (const j of hinges) {
      const ends = tubes.flatMap((t) => {
        const out: [TubeRecipe, 0 | 1][] = [];
        if (t.key.startsWith(`${j.vertex}>`) && t.bone === j.bone) out.push([t, 0]);
        if (t.key.endsWith(`>${j.vertex}`) && t.bone === hingeBone(j.vertex)) out.push([t, 1]);
        return out;
      });
      expect(ends.filter(([, e]) => e === 1).length, j.vertex).toBe(1);
      expect(ends.length, j.vertex).toBeGreaterThanOrEqual(2);
      for (const [t] of ends) {
        for (const axis of [t.u, t.v]) {
          for (const deg of [-75, -40, -15, 15, 40, 75]) {
            // the joint turns half the bend: bend the joint's own bone by twice the angle, as a real pose
            const dir = rotate(axisAngle(axis, (2 * deg * Math.PI) / 180), rest[j.bone]);
            const solved = solve(applyStage({ [j.bone]: dir }));
            const r = jointRadii(solved, j);
            expect(worstRim(solved, j, r), `${j.vertex} ${t.key} ${deg}°`).toBeLessThanOrEqual(1 + 1e-9);
            growth[j.vertex] = Math.max(growth[j.vertex] ?? 1, ...r.map((x, k) => x / j.radii[k]));
          }
        }
      }
    }
    // an in-line hinge (its two tubes continue each other at rest) needs no growth through a
    // plain bend beyond 1 % — its fitted joint already holds both rims (the worst, 0.9 % ≈ 0.3 mm,
    // is the wrist: forearm and hand are not quite collinear at rest);
    // a CORNER (the shoulder, the hip, the ankle: the clavicle / hip bone / foot meets the
    // limb at 90° at rest)
    // grows by the ratio of its measured section's axes, and never more
    const corner = (v: string) => /^(shoulder|hip|ankle)\./.test(v);
    for (const [v, g] of Object.entries(growth)) {
      if (!corner(v)) expect(g, v).toBeLessThanOrEqual(1.01);
      else {
        const [a, b] = SKIN_FIT[v.split('.')[0]];
        expect(g, v).toBeLessThanOrEqual(Math.max(a, b) / Math.min(a, b) + 1e-9);
      }
    }
  });

  it('turns a hinge joint halfway between its two bones', () => {
    const rest = solve(applyStage({}));
    const knee = jointOf('knee.L');
    expect(placeJoint(rest, knee)).toEqual(placeBone(rest, 'shin.L'));
    const bent = solve(applyStage({ 'thigh.L': [0, -1, 0], 'shin.L': [0, 0, -1] }));
    const { position, q } = placeJoint(bent, knee);
    const qAngle = (a: Quat, b: Quat) => 2 * Math.acos(Math.min(1, Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3])));
    expect(qAngle(q, bent['thigh.L'].q)).toBeCloseTo(Math.PI / 4, 6);
    expect(qAngle(q, bent['shin.L'].q)).toBeCloseTo(Math.PI / 4, 6);
    // the ellipsoid's centre stays on the knee
    close(add(position, rotate(q, knee.at)), bent['shin.L'].head, 1e-9);
    // a joint with one bone rides it
    const palm: JointRecipe = jointOf('palm.L');
    expect(placeJoint(bent, palm)).toEqual(placeBone(bent, 'hand.L'));
  });
});

// ---------------------------------------------------------------------------
// Coverage on the PRODUCTION path: rims placed by `placeBone`, the joint by
// `placeJoint`, sized by `jointRadii` — sampled independently of
// `jointRadii`'s closed form.
// ---------------------------------------------------------------------------

const conjQ = (q: Quat): Quat => [q[0], -q[1], -q[2], -q[3]];

/** Largest ellipsoid norm of any rim point of a joint in a solved pose, the joint's radii `r` (its rest radii by default). */
function worstRim(solved: Solved, j: JointRecipe, r: Radii3 = j.radii, n = 96): number {
  const { position, q } = placeJoint(solved, j);
  let worst = 0;
  for (const rim of j.rims) {
    const b = placeBone(solved, rim.bone);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const rest = add(rim.centre, add(scale(rim.U, Math.cos(a)), scale(rim.V, Math.sin(a))));
      const world = add(b.position, rotate(b.q, rest));
      const local = rotate(conjQ(q), sub(world, position));
      worst = Math.max(worst, ellNorm(local, j.at, r));
    }
  }
  return worst;
}

/** Every joint encloses every rim at the radii the renderer gives it (`jointRadii`), never smaller than its fit. */
function expectCovered(solved: Solved, label: string) {
  for (const j of joints) {
    const r = jointRadii(solved, j);
    r.forEach((x, k) => expect(x, `${label} ${j.vertex}`).toBeGreaterThanOrEqual(j.radii[k]));
    expect(worstRim(solved, j, r), `${label} ${j.vertex}`).toBeLessThanOrEqual(1 + 1e-9);
  }
}

const twist = spineTwisting as unknown as RigData;
const stageIndex = (label: string) => twist.stages.findIndex((s) => s.label === label);

describe('joint coverage under bend AND roll (placeBone + placeJoint + jointRadii)', () => {
  it('every joint holds its rims at rest without growing (the measured silhouette stands)', () => {
    const rest = solve(applyStage({}));
    for (const j of joints) {
      expect(j.rims.length, j.vertex).toBeGreaterThanOrEqual(1);
      jointRadii(rest, j).forEach((x, k) => expect(x, j.vertex).toBeCloseTo(j.radii[k], 12));
      expect(worstRim(rest, j), j.vertex).toBeLessThanOrEqual(1 + 1e-9);
    }
  });

  it('covers both sides of Spine Twisting, where the rolled lower spine would poke the pelvis rim through the waist', () => {
    const right = stageIndex('Right side');
    const left = stageIndex('Left side');
    expect(right).toBeGreaterThan(0);
    expect(left).toBeGreaterThan(0);
    for (const i of [right, left]) {
      const solved = solve(stagePose(twist, i));
      // the case bites: unscaled, the incoming rim leaves the waist ellipsoid
      const waist = jointOf('waist');
      expect(worstRim(solved, waist), twist.stages[i].label).toBeGreaterThan(1.01);
      expect(Math.max(...jointRadii(solved, waist).map((x, k) => x / waist.radii[k]))).toBeGreaterThan(1.01);
      expectCovered(solved, twist.stages[i].label);
    }
  });

  it('covers every Spine Twisting stage and the blends between them (both sides, the change between)', () => {
    for (let i = 0; i < twist.stages.length; i++) {
      expectCovered(solve(stagePose(twist, i)), `stage ${i}`);
      if (i + 1 < twist.stages.length) {
        for (const t of [0.25, 0.5, 0.75]) expectCovered(solve(sheetPose(twist, i, i + 1, t)), `blend ${i}>${i + 1} @${t}`);
      }
    }
    const right = stageIndex('Right side');
    const left = stageIndex('Left side');
    for (const t of [0.2, 0.4, 0.6, 0.8]) expectCovered(solve(sheetPose(twist, right, left, t)), `right>left @${t}`);
  });

  it('covers synthetic longitudinal rolls, plain bends and compound bend + roll at every hinge', () => {
    const rest = restDirections();
    const hinges = joints.filter((j) => hingeBone(j.vertex));
    expect(hinges.map((j) => j.vertex)).toEqual(
      expect.arrayContaining(['waist', 'chest', 'neck', 'knee.L', 'elbow.R', 'wrist.L', 'ankle.R', 'shoulder.L', 'hip.R']),
    );
    for (const j of hinges) {
      const bone = j.bone;
      const d = rest[bone];
      const ref: Vec3 = Math.abs(d[0]) > 0.9 ? [0, 1, 0] : [1, 0, 0];
      const u = normalize(sub(ref, scale(d, d[0] * ref[0] + d[1] * ref[1] + d[2] * ref[2])));
      const v: Vec3 = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
      const cases: [string, Vec3, number][] = [];
      for (const roll of [-60, -25, 25, 60]) cases.push([`roll ${roll}°`, d, roll]); // longitudinal only
      for (const axis of [u, v]) {
        for (const deg of [-80, -30, 30, 80]) {
          const dir = rotate(axisAngle(axis, (deg * Math.PI) / 180), d);
          cases.push([`bend ${deg}°`, dir, 0]); // plain bend
          for (const roll of [-45, 35]) cases.push([`bend ${deg}° + roll ${roll}°`, dir, roll]); // compound
        }
      }
      for (const [label, dir, roll] of cases) {
        const solved = solve(applyStage({ [bone]: roll ? { dir, roll } : dir }));
        expect(worstRim(solved, j, jointRadii(solved, j)), `${j.vertex} ${label}`).toBeLessThanOrEqual(1 + 1e-9);
      }
    }
  });
});
