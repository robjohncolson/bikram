import { describe, expect, it } from 'vitest';
import type { RigData, RigStagePose } from '../data/types';
import proof from '../data/rig/library/paschimottanasana.json';
import fixtures from './clearance-fixtures/library-from-python.json';
import { applyStage, breathe, solve, solvedSkeleton } from './pose';
import { blend } from './inbetween';
import { bodyRecipe, jointRadii, placeBone, placeJoint } from './body';
import { clashes, hullPoints } from './clearance';
import { groundedSheetPose, sheetPose, stageGhost } from './sheet';
import { skeletonOf } from './variants';
import { BONES, J } from './skeleton';
import { add, length, rotate, sub } from './math';
import { loadRigData, RIG_LIVE } from '../data/rig';

const sheet = proof as unknown as RigData;
describe('library skeleton', () => {
  it('loads per sheet without joining the class rollout', async () => {
    expect((await loadRigData(sheet.id)).skeleton).toBe('library');
    expect((await loadRigData('half-moon')).skeleton).toBeUndefined();
    expect(RIG_LIVE.has(sheet.id)).toBe(false);
  });

  it('lengthens only the library arms and keeps the rest pose clear', () => {
    const original = JSON.stringify(J);
    const s = solve(applyStage({}, 'library'));
    for (const [name, h, t] of BONES) {
      const expected = name.startsWith('upperarm') ? 0.315 : name.startsWith('forearm') ? 0.26 : name.startsWith('hand') ? 0.15 : undefined;
      if (expected) expect(length(sub(s[name].tail, s[name].head))).toBeCloseTo(expected, 5);
      else if (!name.startsWith('clavicle')) expect(length(sub(s[name].tail, s[name].head))).toBeCloseTo(length(sub(J[t], J[h])), 6);
    }
    expect(clashes(s)).toEqual([]);
    expect(JSON.stringify(J)).toBe(original);
    expect(skeletonOf('library').J['fingers.L'][2]).toBeLessThan(J['fingers.L'][2]);
  });

  for (const f of fixtures) it(`matches Python FK and clearance to 1e-4: ${f.case}`, () => {
    const s = solve(applyStage(f.pose as RigStagePose, 'library'));
    for (const [name, h, t] of BONES) {
      for (const [joint, actual] of [[h, s[name].head], [t, s[name].tail]] as const) {
        expect(length(sub(actual, (f.joints as Record<string, number[]>)[joint] as [number, number, number]))).toBeLessThan(1e-4);
      }
    }
    const actual = new Map(clashes(s, 0).map(c => [`${c.a}/${c.b}`, c.depth]));
    const expected = new Map(f.clashes.map(([a, b, d]) => [`${a}/${b}`, Number(d)]));
    // Numerical dust at tangency is not a clash.
    const significant = (m: Map<string, number>) => [...m].filter(([, d]) => d > 1e-4).map(([k]) => k).sort();
    expect(significant(actual)).toEqual(significant(expected));
    for (const [k, d] of expected) expect(Math.abs((actual.get(k) ?? 0) - d)).toBeLessThan(1e-4);
  });

  it('carries the variant through ghosts, blends, breath and grounding', () => {
    const ghostSheet: RigData = { ...sheet, stages: [{ ...sheet.stages[0], ghost: { head: [0, 1, 1] } }] };
    expect(stageGhost(ghostSheet, 0)?.skeleton).toBe('library');
    for (const p of [sheetPose(sheet, 0, 1, 0.5), breathe(sheetPose(sheet, 0, 1, 0.5), 1), groundedSheetPose(sheet, 0, 1, 0.5)]) {
      expect(p.skeleton).toBe('library');
      expect(solvedSkeleton(solve(p))).toBe('library');
    }
    expect(() => blend(applyStage({}), applyStage({}, 'library'), 0.5)).toThrow('different skeletons');
  });

  it('places the extended mesh at its own joints and fits every bent tube rim', () => {
    const recipe = bodyRecipe('library');
    const s = solve(sheetPose(sheet, 2, 3, 0.5));
    for (const j of recipe.joints) {
      const pl = placeJoint(s, j);
      const radii = jointRadii(s, j);
      expect(radii.every(Number.isFinite)).toBe(true);
      for (const rim of j.rims) {
        const b = placeBone(s, rim.bone);
        const qi = [pl.q[0], -pl.q[1], -pl.q[2], -pl.q[3]] as const;
        for (let i = 0; i < 32; i++) {
          const t = i * Math.PI / 16;
          const r = rim.centre.map((v, k) => v + rim.U[k] * Math.cos(t) + rim.V[k] * Math.sin(t)) as [number, number, number];
          const p = sub(rotate([...qi], sub(add(b.position, rotate(b.q, r)), pl.position)), j.at);
          expect(Math.hypot(...p.map((v, k) => v / radii[k]))).toBeLessThanOrEqual(1.001);
        }
      }
    }
    expect(hullPoints(s).length).toBeGreaterThan(100);
  });

  it('clasps beyond the soles and clears all proof transitions', () => {
    const held = solve(sheetPose(sheet, 3, 3, 1));
    for (const side of ['L', 'R']) expect(held[`hand.${side}`].head[1]).toBeLessThan(held[`foot.${side}`].tail[1]);
    // The right fingertip rests against the left wrist's hull (the rig has no fingers).
    expect(length(sub(held['hand.R'].tail, held['hand.L'].head))).toBeCloseTo(0.05, 3);
    for (let i = 0; i < sheet.stages.length; i++) {
      for (let k = 0; k <= 9; k++) {
        const s = solve(groundedSheetPose(sheet, i, (i + 1) % sheet.stages.length, k / 9));
        expect(clashes(s), `${i} at ${k}/9`).toEqual([]);
      }
    }
  }, 60_000);
});
