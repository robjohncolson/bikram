import { describe, expect, it } from 'vitest';
import skeleton from '../data/rig/skeleton.json';
import fromBlender from './fixtures/skeleton-from-blender.json';
import type { RigGuide } from '../data/types';
import { BIG_TURN_DEG, BONES, FPS, J, RADIUS, SKIN_EXTRA, VERTEX_BONE, VIEWS, restDirections } from './skeleton';
import { applyStage, solve } from './pose';
import { bodySegments, guideSegments } from './body';
import { cameraAt, orbitBetween, stageCamera } from './camera';
import { cubicBezier, smoothstep, unsmoothstep } from './math';
import { LOOP_REST, playAt, stageStartAt } from './sheet';

describe('skeleton', () => {
  it('is the rig render_motion.py builds (skeleton.json, exported from its tables)', () => {
    expect(J).toEqual(skeleton.J);
    expect(BONES).toEqual(skeleton.BONES);
    expect(RADIUS).toEqual(skeleton.RADIUS);
    expect(SKIN_EXTRA).toEqual(skeleton.SKIN_EXTRA);
    expect(VERTEX_BONE).toEqual(skeleton.VERTEX_BONE);
    expect(VIEWS).toEqual(skeleton.VIEWS);
    expect(BIG_TURN_DEG).toBe(skeleton.BIG_TURN_DEG);
    expect(FPS).toBe(skeleton.FPS);
  });

  it("is exactly render_motion.py's own tables (written inside Blender by export_fixtures.py)", () => {
    expect(J).toEqual(fromBlender.J);
    expect(BONES).toEqual(fromBlender.BONES);
    expect(RADIUS).toEqual(fromBlender.RADIUS);
    expect(SKIN_EXTRA).toEqual(fromBlender.SKIN_EXTRA);
    expect(VERTEX_BONE).toEqual(fromBlender.VERTEX_BONE);
    expect(VIEWS).toEqual(fromBlender.VIEWS);
    expect(BIG_TURN_DEG).toBe(fromBlender.BIG_TURN_DEG);
    expect(FPS).toBe(fromBlender.FPS);
    // and export_rig.py's hand copy agrees with the original
    expect(skeleton).toEqual(fromBlender);
  });

  it('lists parents before children and points every rest direction head → tail', () => {
    const seen = new Set<string>();
    for (const [name, , , parent] of BONES) {
      if (parent) expect(seen.has(parent), name).toBe(true);
      seen.add(name);
    }
    const rest = restDirections();
    expect(rest.pelvis).toEqual([0, 0, 1]);
    expect(rest['thigh.L']).toEqual([0, 0, -1]);
  });
});

describe('body recipe', () => {
  it('splits the hand at the palm and the foot at the ball, with a heel spur', () => {
    const segs = bodySegments(solve(applyStage({})));
    const keys = segs.map((s) => s.key);
    expect(keys).toContain('wrist.L>palm.L');
    expect(keys).toContain('palm.L>fingers.L');
    expect(keys).not.toContain('wrist.L>fingers.L');
    expect(keys).toContain('ankle.R>ball.R');
    expect(keys).toContain('ankle.R>heel.R');
    expect(segs).toHaveLength(BONES.length + 4 + 2);
    // at rest every tube sits on its rest joints, radius = mean of the skin's (rx, ry)
    const thigh = segs.find((s) => s.key === 'hip.L>knee.L')!;
    expect(thigh.from.map((c) => +c.toFixed(9))).toEqual(J['hip.L']);
    expect(thigh.r0).toBeCloseTo(0.085, 9);
    expect(segs.find((s) => s.key === 'pelvis>waist')!.r0).toBeCloseTo(0.12, 9);
  });

  it('keeps every tube its rest length in any pose (the meshes are built once)', () => {
    const len = (s: { from: number[]; to: number[] }) => Math.hypot(...s.to.map((c, i) => c - s.from[i]));
    const rest = bodySegments(solve(applyStage({})));
    const bent = bodySegments(
      solve(applyStage({ 'pelvis.location': [0, 0, -0.5], pelvis: [0, -1, 0.2], 'thigh.L': [0, -1, 0], 'hand.R': { dir: [1, 0, 0], roll: 30 } })),
    );
    bent.forEach((s, i) => expect(len(s)).toBeCloseTo(len(rest[i]), 9));
  });

  it('draws a line as itself and a pane as its four edges', () => {
    const guides: RigGuide[] = [
      { from: [0, 0, 0], to: [0, 0, 2.05] },
      { plane: 'y', at: -0.16, z: [0, 2.05], w: 1.5 },
      { plane: 'x', at: 0.2 },
    ];
    const segs = guideSegments(guides);
    expect(segs).toHaveLength(1 + 4 + 4);
    expect(segs[1]).toEqual([[-0.75, -0.16, 0], [0.75, -0.16, 0]]);
    expect(segs[5]).toEqual([[0.2, -0.5, 0], [0.2, 0.5, 0]]);
    expect(guideSegments(undefined)).toEqual([]);
  });
});

describe('camera', () => {
  it('maps the views and the renderer defaults', () => {
    expect(cameraAt('side', { center_z: 0.35, scale: 2.4 })).toEqual({ azimuth: -Math.PI / 2, centerZ: 0.35, scale: 2.4 });
    expect(cameraAt('front')).toEqual({ azimuth: 0, centerZ: 0.9, scale: 2 });
  });

  it("takes a stage's own view and framing over the sheet's", () => {
    const data = {
      id: 'x', view: 'front', frame: { center_z: 1.05, scale: 2.5 }, position: { start: 'standing', end: 'standing' },
      transition: 6,
      stages: [{ label: 'A', hold: 4, pose: {} }, { label: 'B', hold: 4, pose: {}, view: 'quarter', frame: { scale: 2 } }],
    } as const;
    const d = JSON.parse(JSON.stringify(data));
    expect(stageCamera(d, 0)).toEqual({ azimuth: 0, centerZ: 1.05, scale: 2.5 });
    expect(stageCamera(d, 1)).toEqual({ azimuth: (-35 * Math.PI) / 180, centerZ: 1.05, scale: 2 });
  });

  it('orbits the short way round, eased', () => {
    const back = cameraAt('back');
    const qb = cameraAt('quarter-back');
    const mid = orbitBetween(qb, back, 0.5);
    // -145° → 180° is 35° the short way (through -162.5°), not 325° round
    expect((mid.azimuth * 180) / Math.PI).toBeCloseTo(-162.5, 9);
    expect(orbitBetween(qb, back, 0.25).azimuth).toBeCloseTo(qb.azimuth + (-35 * Math.PI / 180) * smoothstep(0.25), 9);
    expect(orbitBetween(qb, back, 0)).toEqual(qb);
  });

  it('inverts smoothstep and eases like the CSS breath curve', () => {
    for (const x of [0, 0.1, 0.37, 0.5, 0.9, 1]) expect(unsmoothstep(smoothstep(x))).toBeCloseTo(x, 9);
    const ease = cubicBezier(0.45, 0.05, 0.35, 1);
    expect(ease(0)).toBeCloseTo(0, 6);
    expect(ease(1)).toBeCloseTo(1, 6);
    expect(ease(0.5)).toBeGreaterThan(0.5);
  });
});

describe('playAt (a sheet on its own clock)', () => {
  const data = {
    id: 'x', view: 'front', frame: { center_z: 1, scale: 2 }, position: { start: 'standing', end: 'standing' },
    transition: 6,
    stages: [{ label: 'A', hold: 4, pose: {} }, { label: 'B', hold: 7, pose: {} }],
  } as unknown as import('../data/types').RigData;

  it('holds, travels with smoothstep, rests, and blends back to the start', () => {
    expect(playAt(data, 12, 0)).toMatchObject({ from: 0, to: 0, t: 1 });
    // A holds 3 frame steps, then six frames to B
    const mid = playAt(data, 12, 3 / 12 + 3 / 12);
    expect(mid).toMatchObject({ from: 0, to: 1 });
    expect(mid.t).toBeCloseTo(0.5, 9);
    expect(playAt(data, 12, 3 / 12 + 6 / 12 + 0.01)).toMatchObject({ from: 1, to: 1, t: 1 });
    const { loop } = playAt(data, 12, 0);
    expect(loop).toBeCloseTo((3 + 6 + 6 + 6) / 12 + LOOP_REST, 9);
    expect(playAt(data, 12, loop - 0.25)).toMatchObject({ from: 1, to: 0 });
    expect(playAt(data, 12, loop + 0.01)).toMatchObject({ from: 0, to: 0, t: 1 });
  });

  it('seeks a chip to the start of its hold (the only seek the player makes)', () => {
    expect(stageStartAt(data, 12, 0)).toBe(0);
    expect(stageStartAt(data, 12, 1)).toBeCloseTo((3 + 6) / 12, 9);
    for (const i of [0, 1]) {
      expect(playAt(data, 12, stageStartAt(data, 12, i) + 1e-6)).toMatchObject({ from: i, to: i, t: 1 });
      // just before it is the travel in (or, for stage 0, the wrap back)
      expect(playAt(data, 12, stageStartAt(data, 12, i) - 1e-3).to).toBe(i);
    }
  });
});
