import { describe, expect, it } from 'vitest';
import type { RigData, RigStagePose } from '../data/types';
import { applyStage, blend, breathe, ghostPose, midpoints, mirrorStage, sheetPose, smoothstep, solve } from './index';
import type { Solved } from './index';
import { rotate, rotationDifference, type Vec3 } from './math';
import { BONES, BONE_NAMES } from './skeleton';

/**
 * PARITY with the Blender renderer: `src/rig/fixtures/*.json` are the
 * joint positions `render_motion.py` itself produces for these poses
 * (`scripts/blender/export_fixtures.py`, run inside Blender). The TS port
 * must land every bone's head and tail on them.
 */
interface Fixture {
  case: string;
  kind: 'stage' | 'ghost' | 'inbetween';
  id: string;
  stage?: number;
  from?: number;
  to?: number;
  s?: number;
  eased?: number;
  steered?: string[];
  bones: Record<string, { head: Vec3; tail: Vec3 }>;
}

const fixtures = Object.values(
  import.meta.glob<Fixture>(['./fixtures/*.json', '!./fixtures/skeleton-from-blender.json', '!./fixtures/skin-fit-from-blender.json'], { eager: true, import: 'default' }),
);
const sheets = Object.fromEntries(
  Object.values(import.meta.glob<RigData>(['../data/rig/*.json', '../data/rig/library/*.json'], { eager: true, import: 'default' }))
    .filter((d) => 'stages' in d)
    .map((d) => [d.id, d]),
);
/**
 * The library sheets move on (the longer-arm skeleton, both sides); the
 * Blender fixtures were rendered from the ORIGINAL sheets, frozen here as
 * their inputs. Migrated sheets have geometry coverage in library.test.ts and Python/TS
 * variant fixtures in library-variant.test.ts, not Blender parity.
 */
const frozen = Object.fromEntries(
  Object.values(import.meta.glob<RigData>('./fixtures/inputs/*.json', { eager: true, import: 'default' })).map((d) => [d.id, d]),
);

/**
 * The pose the PRODUCTION path gives: held stages and ghosts through
 * `applyStage`/`ghostPose`, in-betweens through `sheetPose` — the cached
 * `midpoints` + `blend` the renderer draws with — eased as build_timeline
 * eases a frame.
 */
function posed(f: Fixture): Solved {
  const d = frozen[f.id] ?? sheets[f.id];
  if (f.kind === 'stage') return solve(applyStage(d.stages[f.stage!].pose));
  if (f.kind === 'ghost') return solve(ghostPose(d.stages[f.stage!]));
  return solve(sheetPose(d, f.from!, f.to!, smoothstep(f.s!)));
}

function maxError(f: Fixture): number {
  const got = posed(f);
  let err = 0;
  for (const [name, want] of Object.entries(f.bones)) {
    for (const k of ['head', 'tail'] as const) {
      for (let i = 0; i < 3; i++) err = Math.max(err, Math.abs(got[name][k][i] - want[k][i]));
    }
  }
  return err;
}

/** Stages that roll non-leaf bones, with the Python helpers' joint positions (`_selftest.py --write`). */
const rolledFk = Object.values(
  import.meta.glob<{ case: string; pose: RigStagePose; joints: Record<string, Vec3> }[]>('./clearance-fixtures/rolled-fk-from-python.json', {
    eager: true,
    import: 'default',
  }),
)[0];

// computed up front so each test's NAME reports the measured error
const results = fixtures.map((f) => ({ f, err: maxError(f) })).sort((a, b) => a.f.case.localeCompare(b.f.case));

describe('parity with render_motion.py', () => {
  it('has the fixture cases the spec asks for', () => {
    const cases = new Set(fixtures.map((f) => f.case));
    for (const c of [
      'half-moon--stand',
      'half-moon--arms-up',
      'half-moon--right-side',
      'half-moon--hands-to-feet',
      'spine-twisting--right-side',
      'savasana--stillness',
      'cobra--lift',
      'camel--kneel',
      'half-moon--right-side--ghost',
      'half-moon--arms-up--right-side--25',
      'half-moon--arms-up--right-side--50',
      'half-moon--arms-up--right-side--75',
      'half-moon--stand--arms-up--50',
      // the library's upside-down held stages (antiparallel aims)
      'library.salamba-sirsasana-i--headstand',
      'library.salamba-sarvangasana-i--shoulderstand',
      // the lotus: rolled feet at the ends of crossed leg chains
      'library.padmasana--lotus',
    ]) {
      expect(cases.has(c), c).toBe(true);
    }
    // every fixture names every bone
    for (const f of fixtures) expect(Object.keys(f.bones).sort()).toEqual([...BONE_NAMES].sort());
  });

  // every bone of every fixture, no exclusions
  for (const { f, err } of results) {
    const tol = f.kind === 'inbetween' ? 1e-3 : 1e-4;
    it(`${f.case} (${f.kind}) — max joint error ${err.toExponential(2)} m (tolerance ${tol})`, () => {
      expect(err).toBeLessThan(tol);
    });
  }

  it('matches the direct blend with fresh midpoints (the cache changes nothing)', () => {
    for (const f of fixtures.filter((x) => x.kind === 'inbetween')) {
      const d = sheets[f.id];
      const a = applyStage(d.stages[f.from!].pose);
      const b = applyStage(d.stages[f.to!].pose);
      const direct = solve(blend(a, b, smoothstep(f.s!), midpoints(a, b)));
      const cached = posed(f);
      for (const n of BONE_NAMES) direct[n].tail.forEach((c, i) => expect(c).toBeCloseTo(cached[n].tail[i], 12));
    }
  });

  it('steers exactly the bones Blender steers', () => {
    for (const f of fixtures.filter((x) => x.kind === 'inbetween')) {
      const d = sheets[f.id];
      const mids = midpoints(applyStage(d.stages[f.from!].pose), applyStage(d.stages[f.to!].pose));
      expect(Object.keys(mids).sort(), f.case).toEqual([...(f.steered ?? [])].sort());
    }
  });
});

describe('posing details', () => {
  it('turns antiparallel vectors half way round a perpendicular, as mathutils does', () => {
    const cases: [Vec3, Vec3][] = [
      [[0, 0, -1], [0, 0, 1]],
      [[1, 0, 0], [-1, 0, 0]],
      [[0.1, -0.16, -0.08], [-0.1, 0.16, 0.08]],
    ];
    for (const [a, b] of cases) {
      const q = rotationDifference(a, b);
      expect(Math.abs(q[0])).toBeLessThan(1e-9); // a half turn
      const r = rotate(q, a);
      const n = Math.hypot(...b) / Math.hypot(...a);
      r.forEach((c, i) => expect(c * n).toBeCloseTo(b[i], 9));
    }
    // Blender's ortho_v3_v3 for (0,0,-1) is (-1,-1,0)/√2
    const q = rotationDifference([0, 0, -1], [0, 0, 1]);
    expect(q[1]).toBeCloseTo(-Math.SQRT1_2, 9);
    expect(q[2]).toBeCloseTo(-Math.SQRT1_2, 9);
  });

  it('rolls a trunk as the library’s Python helpers do: omitted children ride, within 1e-4 (the rolled-FK fixture)', () => {
    // `_selftest.py --write` writes `_lib.fk` for stages that roll non-leaf bones
    expect(rolledFk.length).toBeGreaterThanOrEqual(5);
    for (const f of rolledFk) {
      const s = solve(applyStage(f.pose));
      let err = 0;
      for (const [name, h, t] of BONES) {
        for (const [joint, got] of [[h, s[name].head], [t, s[name].tail]] as const) {
          const want = f.joints[joint];
          for (let i = 0; i < 3; i++) err = Math.max(err, Math.abs(got[i] - want[i]));
        }
      }
      expect(err, f.case).toBeLessThan(1e-4);
    }
    // the fixture exercises riding: at least one case rolls a bone whose child it omits
    expect(rolledFk.some((f) => Object.entries(f.pose).some(([b, e]) => !Array.isArray(e) && typeof e === 'object' && e.roll && BONES.some(([c, , , parent]) => parent === b && !(c in f.pose))))).toBe(true);
  });

  it('keeps the bone lengths in every pose', () => {
    const rest = solve(applyStage({}));
    for (const d of Object.values(sheets)) {
      for (const st of d.stages) {
        const s = solve(applyStage(st.pose));
        for (const n of BONE_NAMES) {
          const len = (x: Solved) => Math.hypot(...x[n].tail.map((c, i) => c - x[n].head[i]));
          expect(len(s)).toBeCloseTo(len(rest), 9);
        }
      }
    }
  }, 60_000);

  it('mirrors half moon right onto half moon left, and mirroring twice is the identity', () => {
    const hm = sheets['half-moon'];
    const right = hm.stages.find((s) => s.label === 'Right side')!.pose;
    const left = hm.stages.find((s) => s.label === 'Left side')!.pose;
    const a = solve(applyStage(mirrorStage(right)));
    const b = solve(applyStage(left));
    for (const n of BONE_NAMES) {
      for (const k of ['head', 'tail'] as const) a[n][k].forEach((c, i) => expect(c).toBeCloseTo(b[n][k][i], 6));
    }
    expect(mirrorStage(mirrorStage(right))).toEqual(right);
    // rolls flip with the mirror
    const twist = sheets['spine-twisting'].stages.find((s) => s.label === 'Right side')!.pose;
    const m = mirrorStage(twist)['spine.upper'];
    const o = twist['spine.upper'];
    expect(!Array.isArray(m) && !Array.isArray(o) && m.roll).toBe(!Array.isArray(o) && -(o.roll ?? 0));
  });

  it('breathes the chest open a few degrees and settles back to the pose', () => {
    const hm = sheets['half-moon'];
    const stand = applyStage(hm.stages[0].pose);
    expect(breathe(stand, 0)).toBe(stand);
    const full = solve(breathe(stand, 1));
    const still = solve(stand);
    // the neck tips toward +Y (back), a centimetre or so at the crown
    const dy = full.head.tail[1] - still.head.tail[1];
    expect(dy).toBeGreaterThan(0.005);
    expect(dy).toBeLessThan(0.05);
    // the legs never move
    full['foot.L'].tail.forEach((c, i) => expect(c).toBeCloseTo(still['foot.L'].tail[i], 12));
  });
});
