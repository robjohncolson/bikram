import { describe, expect, it } from 'vitest';
import { CLEARANCE_TOL, J, SKIN_EXTRA, SKIN_FIT, anchorToContacts, bodyRecipe, clashes, hullPoints, jointRadii, pairRule, pieceNames, placeBone, placeJoint, applyStage, groundedSheetPose, liftToFloor, sheetPose, smoothstep, solve, stageCamera } from '../../rig';
import type { Solved, Vec3 } from '../../rig';
import { rotate } from '../../rig/math';
import illustrated from '../classical/illustrated-index.json';
import sutras from '../classical/sutras-index.json';
import { getPose } from '../index';
import type { RigData, RigStagePose } from '../types';
import { NOTICE_REGIONS, getLibraryAsana, libraryAsanas, libraryFamilies, libraryRigId, resolveLink, sourceLine, sutraInfo } from './index';

/**
 * The library's contract: every exported sheet has its content and vice
 * versa; every id is the illustrated index's; steps point at real stages;
 * notices use the fixed vocabulary; sutras resolve and every entry cites
 * II.46 and II.47; links resolve; cautions are there; and no stage puts a
 * joint through the floor (the real forward kinematics, not the Blender
 * helper's direction chain).
 */
const sheets = Object.fromEntries(
  Object.entries(import.meta.glob<RigData>('../rig/library/*.json', { eager: true, import: 'default' })).map(([k, d]) => [
    k.slice('../rig/library/'.length, -'.json'.length),
    d,
  ]),
);
const bookIds = new Set((illustrated as { romanised: string }[]).map((r) => r.romanised));
const sutraIds = new Set((sutras as { id: string }[]).map((s) => s.id));
// the Blender helper's vocabulary, read from its source so the two cannot drift
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a);
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** The palm swelling's centre: 0.035 m down the hand bone (the rig's palm vertex), and its half-thickness. */
const PALM_AT = 0.035;
const PALM_R = 0.035;

/**
 * How far a point lies outside the trunk's skin: the nearest point on the
 * pelvis–waist–chest–neck line, the measured elliptical section there
 * (SKIN_FIT half-widths, interpolated), axes square to that segment.
 */
function trunkGap(s: Solved, p: Vec3): number {
  const joints: [string, Vec3][] = [
    ['pelvis', s.pelvis.head],
    ['waist', s.pelvis.tail],
    ['chest', s['spine.lower'].tail],
    ['neck', s['spine.upper'].tail],
  ];
  const side0 = unit(sub(s['clavicle.L'].tail, s['clavicle.R'].tail));
  let best = { d: Infinity, gap: Infinity };
  for (let i = 0; i < 3; i++) {
    const [na, a] = joints[i];
    const [nb, b] = joints[i + 1];
    const seg = sub(b, a);
    const k = Math.min(1, Math.max(0, dot(sub(p, a), seg) / dot(seg, seg)));
    const c: Vec3 = [a[0] + seg[0] * k, a[1] + seg[1] * k, a[2] + seg[2] * k];
    const r = sub(p, c);
    const d = Math.hypot(...r);
    if (d >= best.d) continue;
    const u = unit(seg);
    const side = unit(sub(side0, u.map((x) => x * dot(side0, u)) as Vec3));
    const front = cross(side, u);
    const [wa, wb] = [0, 1].map((j) => SKIN_FIT[na][j] + (SKIN_FIT[nb][j] - SKIN_FIT[na][j]) * k);
    const rs = dot(r, side);
    const rf = dot(r, front);
    const rho = Math.hypot(rs, rf);
    const surface = 1 / Math.hypot(rs / rho / wa, rf / rho / wb);
    best = { d, gap: rho - surface };
  }
  return best.gap;
}

/**
 * The rendered hull's lowest point: every joint ellipsoid and every tube end
 * of the live figure's body recipe (what FigureRig draws), not the bones.
 */
function hullLow(s: Solved): number {
  const { tubes, joints } = bodyRecipe();
  const axes: Vec3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  let low = Infinity;
  for (const j of joints) {
    const { position, q } = placeJoint(s, j);
    const c = rotate(q, j.at);
    const r = jointRadii(s, j);
    low = Math.min(low, position[2] + c[2] - Math.hypot(...axes.map((e, i) => r[i] * rotate(q, e)[2])));
  }
  for (const t of tubes) {
    const b = placeBone(s, t.bone);
    for (const k of [0, 1]) {
      const c = rotate(b.q, k ? t.to : t.from);
      low = Math.min(low, b.position[2] + c[2] - Math.hypot(t.ru[k] * rotate(b.q, t.u)[2], t.rv[k] * rotate(b.q, t.v)[2]));
    }
  }
  return low;
}

const helper = import.meta.glob<string>('../../../scripts/blender/library/_lib.py', { eager: true, query: '?raw', import: 'default' });
const hullPy = import.meta.glob<string>('../../../scripts/blender/library/_hull.py', { eager: true, query: '?raw', import: 'default' });
/** Clashes the Python port (`_hull.py`) finds for a few poses (`_selftest.py --write`). */
const clashFixtures = Object.values(
  import.meta.glob<{ case: string; laced: boolean; pose: RigStagePose; clashes: [string, string, number][] }[]>(
    '../../rig/clearance-fixtures/clashes-from-python.json',
    { eager: true, import: 'default' },
  ),
)[0];

/**
 * The spec's step 1, for teeth: the old two-bone `leg()` with a knee hint,
 * each ankle sent to the other groin (knees up and forward, the feet in the
 * thighs). Directions as `_lib.leg` solved them.
 */
const NAIVE_LOTUS: RigStagePose = {
  'pelvis.location': [0, 0.05, -0.86],
  pelvis: [0, 0, 1],
  'spine.lower': [0, 0, 1],
  'spine.upper': [0, 0, 1],
  'thigh.R': [-0.3297, -0.6251, 0.7075],
  'shin.R': [0.7842, 0.3296, -0.5257],
  'foot.R': [0.9535, 0.0953, 0.286],
  'thigh.L': [0.449, -0.6205, 0.643],
  'shin.L': [-0.9035, 0.2796, -0.3248],
  'foot.L': [-0.9535, 0.0953, 0.286],
};

/** A foot swelling's world position in a solved pose (it rides the foot bone rigidly). */
function footExtraAt(s: Solved, v: string, side: 'L' | 'R'): Vec3 {
  const b = s[`foot.${side}`];
  const r = rotate(b.q, sub(SKIN_EXTRA[v][0], J[`ankle.${side}`]));
  return [b.head[0] + r[0], b.head[1] + r[1], b.head[2] + r[2]];
}

/** How far the heel spur and the ball swelling sit off the foot's axis along `facing` (both > 0: the sole faces it). */
function soleSide(s: Solved, side: 'L' | 'R', facing: Vec3): [number, number] {
  const f = s[`foot.${side}`];
  const axis = unit(sub(f.tail, f.head));
  const off = (k: string) => {
    const p = sub(footExtraAt(s, `${k}.${side}`, side), f.head);
    const d = dot(p, axis);
    return dot(sub(p, [axis[0] * d, axis[1] * d, axis[2] * d]), facing);
  };
  return [off('heel'), off('ball')];
}

describe('the posture library', () => {
  it('pairs every library sheet with an entry, and every entry with a sheet', () => {
    expect(Object.keys(sheets).sort()).toEqual(libraryAsanas.map((a) => a.id).sort());
    for (const a of libraryAsanas) expect(sheets[a.id].id).toBe(libraryRigId(a.id));
  });

  it('uses the illustrated index ids and takes the book facts from it', () => {
    for (const a of libraryAsanas) {
      expect(bookIds.has(a.id), a.id).toBe(true);
      expect(a.sanskrit.length).toBeGreaterThan(0);
      expect(a.figures.length).toBeGreaterThan(0);
      expect(sourceLine(a)).toMatch(/^The Illustrated Light on Yoga, p\. \d+, figs?\. /);
    }
    expect(getLibraryAsana('halasana')?.page).toBe(95);
  });

  it('keeps the library out of the 26 & 2 (no shared ids)', () => {
    for (const a of libraryAsanas) expect(getPose(a.id), a.id).toBeUndefined();
  });

  it('writes 5–9 steps, each stage a real stage of the sheet', () => {
    for (const a of libraryAsanas) {
      expect(a.steps.length, a.id).toBeGreaterThanOrEqual(5);
      expect(a.steps.length, a.id).toBeLessThanOrEqual(9);
      const n = sheets[a.id].stages.length;
      for (const s of a.steps) {
        if (s.stage === undefined) continue;
        expect(Number.isInteger(s.stage) && s.stage >= 0 && s.stage < n, `${a.id}: stage ${s.stage}`).toBe(true);
      }
    }
  });

  it('never sends a later step back to an earlier stage (steps walk the sheet forward)', () => {
    for (const a of libraryAsanas) {
      const st = a.steps.flatMap((s) => (s.stage === undefined ? [] : [s.stage]));
      st.forEach((v, i) => {
        if (i > 0) expect(v, `${a.id}: step ${i + 1} goes back from stage ${st[i - 1]} to ${v}`).toBeGreaterThanOrEqual(st[i - 1]);
      });
    }
  });

  it('puts every supporting palm on the back: within 2 cm of the trunk skin', () => {
    let checked = 0;
    for (const [id, d] of Object.entries(sheets)) {
      for (const st of d.stages) {
        if (st.palms !== 'back') continue;
        const s = solve(applyStage(st.pose));
        for (const side of ['L', 'R']) {
          const h = s[`hand.${side}`];
          const dir = unit(sub(h.tail, h.head));
          const palm: Vec3 = [h.head[0] + dir[0] * PALM_AT, h.head[1] + dir[1] * PALM_AT, h.head[2] + dir[2] * PALM_AT];
          const gap = trunkGap(s, palm) - PALM_R;
          expect(Math.abs(gap), `${id} ${st.label} palm.${side}: ${(gap * 100).toFixed(1)} cm`).toBeLessThanOrEqual(0.02);
          // and the elbow is grounded: its joint on the mat
          expect(s[`upperarm.${side}`].tail[2], `${id} ${st.label} elbow.${side}`).toBeLessThan(0.06);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(40);
  });

  it('keeps the hips and chest across the body (no trunk aimed exactly upside down)', () => {
    // exactly opposite its rest a bone turns about a diagonal and the trunk's width swings front to back
    for (const [id, d] of Object.entries(sheets)) {
      for (const st of d.stages) {
        const p = applyStage(st.pose);
        for (const b of ['pelvis', 'spine.lower', 'spine.upper']) {
          expect(Math.abs(rotate(p.bones[b].q, [1, 0, 0])[0]), `${id} ${st.label} ${b}`).toBeGreaterThan(0.9);
        }
      }
    }
  });

  it('never puts a joint through the floor on the way between stages (the loop back included)', () => {
    // what LiveFigure draws: the production blend kept on its shared contacts, then grounded (FigureRig `grounded`).
    // The lift may only cover the pelvis-rooted dip at a shared contact —
    // a limb swinging through the mat would need far more, and fails here
    const MAX_LIFT = 0.03;
    let worst = 0;
    for (const [id, d] of Object.entries(sheets)) {
      const n = d.stages.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        for (const s of [0.25, 0.5, 0.75]) {
          // how far the guard had to lift what the anchored blend left in the mat
          const anchored = anchorToContacts(d, i, j, smoothstep(s));
          const drawn = groundedSheetPose(d, i, j, smoothstep(s));
          const lift = drawn.pelvisLocation[2] - anchored.pelvisLocation[2];
          worst = Math.max(worst, lift);
          expect(lift, `${id} ${d.stages[i].label} → ${d.stages[j].label} @${s}: lifted ${(lift * 100).toFixed(1)} cm`).toBeLessThanOrEqual(MAX_LIFT);
          const solved = solve(drawn);
          for (const [bone, b] of Object.entries(solved)) {
            expect(Math.min(b.head[2], b.tail[2]), `${id} ${d.stages[i].label} → ${d.stages[j].label} @${s} ${bone}`).toBeGreaterThanOrEqual(-0.005);
          }
        }
      }
    }
    expect(worst).toBeLessThanOrEqual(MAX_LIFT);
    // and the check has teeth: the raw pelvis-rooted blend of the headstand's
    // walk-in does sink the crown — the anchoring is what keeps it out
    const hs = sheets['salamba-sirsasana-i'];
    const low = (p: ReturnType<typeof sheetPose>) => Math.min(...Object.values(solve(p)).flatMap((b) => [b.head[2], b.tail[2]]));
    expect(low(sheetPose(hs, 0, 1, smoothstep(0.5)))).toBeLessThan(-0.005);
    expect(low(groundedSheetPose(hs, 0, 1, smoothstep(0.5)))).toBeGreaterThanOrEqual(-0.005);
  });

  it('never grounds a held stage: every authored stage already clears the floor', () => {
    for (const [id, d] of Object.entries(sheets)) {
      for (const st of d.stages) {
        const pose = applyStage(st.pose);
        expect(liftToFloor(pose), `${id} ${st.label}`).toBe(pose);
      }
    }
  });

  it('rests the drawn body ON the floor: the rendered hull never more than 1 cm through it', () => {
    for (const [id, d] of Object.entries(sheets)) {
      for (const st of d.stages) {
        expect(hullLow(solve(applyStage(st.pose))), `${id} ${st.label}`).toBeGreaterThanOrEqual(-0.01);
      }
    }
    // the headstand's crown and forearms and the shoulderstand's upper back touch it (within 1 cm), not hover
    for (const [id, label] of [['salamba-sirsasana-i', 'Headstand'], ['urdhva-dandasana', 'Legs level'], ['salamba-sarvangasana-i', 'Shoulderstand'], ['halasana', 'Arms long']]) {
      const st = sheets[id].stages.find((x) => x.label === label)!;
      expect(Math.abs(hullLow(solve(applyStage(st.pose)))), `${id} ${label}`).toBeLessThanOrEqual(0.01);
    }
  });

  it('gives 4–8 stages per sheet and names only vocabulary regions in `notice`', () => {
    const vocab = new Set<string>(NOTICE_REGIONS);
    for (const [id, d] of Object.entries(sheets)) {
      expect(d.stages.length, id).toBeGreaterThanOrEqual(4);
      expect(d.stages.length, id).toBeLessThanOrEqual(8);
      for (const st of d.stages) for (const r of st.notice ?? []) expect(vocab.has(r), `${id} ${st.label}: ${r}`).toBe(true);
    }
  });

  it('shares the notice vocabulary with the Blender helper', () => {
    const src = Object.values(helper)[0];
    const m = /NOTICE = \(([^)]*)\)/.exec(src);
    expect(m).not.toBeNull();
    const terms = [...m![1].matchAll(/'([a-z-]+)'/g)].map((x) => x[1]);
    expect(terms).toEqual([...NOTICE_REGIONS]);
  });

  it('links sutras honestly: known ids, II.46 and II.47 always, one-sentence notes', () => {
    // II.46–48 are Patanjali's account of posture; II.49 on is breath practice, which follows it
    const allowed = new Set(['II.46', 'II.47', 'II.48']);
    for (const a of libraryAsanas) {
      const ids = a.sutras.map((s) => s.id);
      expect(ids, a.id).toContain('II.46');
      expect(ids, a.id).toContain('II.47');
      expect(new Set(ids).size, a.id).toBe(ids.length);
      for (const s of a.sutras) {
        expect(sutraIds.has(s.id), s.id).toBe(true);
        expect(allowed.has(s.id), `${a.id}: ${s.id} is not a posture/breath sutra`).toBe(true);
        expect(sutraInfo(s.id)?.topic.length).toBeGreaterThan(0);
        // one sentence: a single full stop, at the end
        expect(s.note.trim().endsWith('.') && s.note.trim().slice(0, -1).includes('. ') === false, `${a.id} ${s.id}`).toBe(true);
      }
    }
  });

  it('resolves every prepares / counter / related id (library or 26 & 2)', () => {
    for (const a of libraryAsanas) {
      for (const id of [...(a.prepares ?? []), ...(a.counter ?? []), ...(a.related ?? [])]) {
        expect(resolveLink(id), `${a.id} → ${id}`).toBeDefined();
      }
      for (const id of a.related ?? []) expect(getPose(id), `${a.id} related ${id} must be a 26 & 2 posture`).toBeDefined();
    }
  });

  it('takes every caution from the lineage: attributed to a printed page of the book', () => {
    // The Illustrated Light on Yoga: printed page 1 is PDF page 18 of the 179-page scan, so the last is 162
    const FIRST = 1;
    const LAST = 162;
    for (const a of libraryAsanas) {
      expect(a.cautions.length, a.id).toBeGreaterThan(0);
      for (const c of a.cautions) {
        expect(Number.isInteger(c.page) && c.page >= FIRST && c.page <= LAST, `${a.id}: p. ${c.page} — ${c.text}`).toBe(true);
        expect(c.text.trim().length, a.id).toBeGreaterThan(10);
      }
      expect(new Set(a.cautions.map((c) => c.text)).size, `${a.id}: a caution repeats`).toBe(a.cautions.length);
    }
  });

  it('lists every family in its order, only when it has postures, each in the book’s order', () => {
    const ORDER = ['standing', 'backbend', 'seated', 'lotus', 'inversion', 'twist'];
    expect(libraryFamilies.map((f) => f.id)).toEqual(ORDER.filter((f) => libraryAsanas.some((a) => a.family === f)));
    for (const f of libraryFamilies) {
      expect(f.asanas.length, f.id).toBeGreaterThan(0);
      expect(f.title.length, f.id).toBeGreaterThan(0);
      expect(f.blurb.length, f.id).toBeGreaterThan(0);
      const nums = f.asanas.map((a) => a.bookNumber);
      expect(nums, f.id).toEqual([...nums].sort((a, b) => a - b));
      for (const a of f.asanas) expect(a.family).toBe(f.id);
    }
    // every entry sits in exactly one family section
    expect(libraryFamilies.flatMap((f) => f.asanas).length).toBe(libraryAsanas.length);
    // the inversions are exactly the book's headstand-and-shoulderstand run (nos. 38–50),
    // the lotus shoulderstands included, as the book groups them
    for (const a of libraryAsanas) {
      expect(a.family === 'inversion', `${a.id} (no. ${a.bookNumber})`).toBe(a.bookNumber >= 38 && a.bookNumber <= 50);
    }
    const inv = libraryFamilies.find((f) => f.id === 'inversion')!.asanas.map((a) => a.id);
    expect(inv).toEqual(expect.arrayContaining(['salamba-sirsasana-i', 'salamba-sarvangasana-i', 'urdhva-padmasana-in-sarvangasana']));
    expect(libraryFamilies.find((f) => f.id === 'lotus')!.asanas.map((a) => a.id)).toEqual(expect.arrayContaining(['siddhasana', 'padmasana']));
  });

  it('discovers the posture files and orders them by the book’s numbering', () => {
    const nums = libraryAsanas.map((a) => a.bookNumber);
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
    expect(new Set(libraryAsanas.map((a) => a.id)).size).toBe(libraryAsanas.length);
    expect(libraryAsanas.map((a) => a.id)).toEqual(expect.arrayContaining(['padmasana', 'siddhasana', 'halasana']));
  });

  it('never puts a joint through the floor, ghosts included', () => {
    for (const [id, d] of Object.entries(sheets)) {
      d.stages.forEach((st, i) => {
        for (const [what, pose] of [['pose', st.pose], ['ghost', st.ghost && { ...st.pose, ...st.ghost }]] as const) {
          if (!pose) continue;
          const s = solve(applyStage(pose));
          for (const [bone, b] of Object.entries(s)) {
            expect(Math.min(b.head[2], b.tail[2]), `${id} #${i} ${st.label} ${what} ${bone}`).toBeGreaterThanOrEqual(-0.005);
          }
        }
      });
    }
  });

  it('keeps every limb out of every other in every held stage and ghost (the rendered hull)', () => {
    let checked = 0;
    for (const [id, d] of Object.entries(sheets)) {
      d.stages.forEach((st, i) => {
        for (const [what, pose] of [['pose', st.pose], ['ghost', st.ghost && { ...st.pose, ...st.ghost }]] as const) {
          if (!pose) continue;
          const c = clashes(solve(applyStage(pose)), CLEARANCE_TOL, { laced: st.hands === 'laced' });
          expect(c.map((x) => `${x.a} / ${x.b} ${(x.depth * 100).toFixed(1)} cm`), `${id} #${i} ${st.label} ${what}`).toEqual([]);
          checked++;
        }
      });
    }
    expect(checked).toBeGreaterThan(90);
  });

  it('keeps every limb out of every other on the way between stages (8 samples a transition, the path the library draws)', () => {
    let worst = 0;
    for (const [id, d] of Object.entries(sheets)) {
      const n = d.stages.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        for (let k = 1; k <= 8; k++) {
          // a blend into or out of a laced stage keeps the fingers' exemption
          const laced = d.stages[i].hands === 'laced' || d.stages[j].hands === 'laced';
          const c = clashes(solve(groundedSheetPose(d, i, j, smoothstep(k / 9))), 0, { laced });
          worst = Math.max(worst, c[0]?.depth ?? 0);
          const deep = c.filter((x) => x.depth > CLEARANCE_TOL);
          expect(deep.map((x) => `${x.a} / ${x.b} ${(x.depth * 100).toFixed(1)} cm`), `${id} ${d.stages[i].label} → ${d.stages[j].label} @${k}/9`).toEqual([]);
        }
      }
    }
    expect(worst).toBeLessThanOrEqual(CLEARANCE_TOL);
  }, 180_000);

  it('has teeth: the naive lotus (two-bone legs, each ankle sent to the other groin) fails the clearance check', () => {
    const c = clashes(solve(applyStage(NAIVE_LOTUS)));
    expect(c.length).toBeGreaterThan(0);
    expect(c[0].depth).toBeGreaterThan(0.04);
    expect(c.some((x) => x.a.startsWith('hip.') || x.b.startsWith('hip.'))).toBe(true);
  });

  it('exempts only by its named rules, and the rest pose is clean', () => {
    expect(clashes(solve(applyStage({})), 0)).toEqual([]);
    expect(pieceNames()).toContain('knee.L>ankle.L');
    expect(pairRule('hip.L>knee.L', 'knee.L>ankle.L')).toBe('shared joint');
    expect(pairRule('knee.L>ankle.L', 'heel.L')).toBe('shared joint');
    expect(pairRule('pelvis>waist', 'chest>neck')).toBe('trunk neighbours');
    expect(pairRule('head', 'chest')).toBe('trunk neighbours');
    expect(pairRule('hip.L>knee.L', 'pelvis>waist')).toBe('hip socket');
    expect(pairRule('hip.L', 'pelvis>hip.L')).toBe('shared joint');
    expect(pairRule('fingers.L', 'palm.R>fingers.R')).toBe('laced hands');
    // compared: trunk pieces far apart, the opposite hip, wrists and proximal palms, the other leg,
    // the trunk above the pelvis, a heel against its own hip, a hand against a foot, two forearms
    expect(pairRule('head', 'pelvis>waist')).toBeUndefined();
    expect(pairRule('crown', 'waist>chest')).toBeUndefined();
    expect(pairRule('hip.R', 'pelvis>hip.L')).toBeUndefined();
    expect(pairRule('hip.R>knee.R', 'pelvis>hip.L')).toBeUndefined();
    expect(pairRule('wrist.L', 'wrist.R')).toBeUndefined();
    expect(pairRule('palm.L', 'fingers.R')).toBeUndefined();
    expect(pairRule('wrist.L>palm.L', 'palm.R>fingers.R')).toBeUndefined();
    expect(pairRule('knee.L>ankle.L', 'knee.R>ankle.R')).toBeUndefined();
    expect(pairRule('hip.L>knee.L', 'waist>chest')).toBeUndefined();
    expect(pairRule('hip.L', 'heel.L')).toBeUndefined();
    expect(pairRule('palm.L', 'ankle.R')).toBeUndefined();
    expect(pairRule('elbow.L>wrist.L', 'elbow.R>wrist.R')).toBeUndefined();
  });

  it('turns the crossed feet sole up: the heel spur and ball lie on the side the sole should face', () => {
    const lotus = sheets['padmasana'].stages.find((x) => x.label === 'Lotus')!;
    const up = solve(applyStage(lotus.pose));
    for (const side of ['L', 'R'] as const) {
      const [heel, ball] = soleSide(up, side, [0, 0, 1]);
      expect(heel, `lotus ${side} heel`).toBeGreaterThan(0.02);
      expect(ball, `lotus ${side} ball`).toBeGreaterThan(0.004);
      const entry = lotus.pose[`foot.${side}`];
      expect(typeof entry === 'object' && !Array.isArray(entry) && typeof entry.roll === 'number', `foot.${side} is rolled`).toBe(true);
    }
    // upside down the same crossing turns the soles to the chest's side (-Y)
    const inv = sheets['urdhva-padmasana-in-sarvangasana'].stages.find((x) => x.label === 'Lotus up')!;
    const s = solve(applyStage(inv.pose));
    for (const side of ['L', 'R'] as const) {
      const [heel, ball] = soleSide(s, side, [0, -1, 0]);
      expect(heel, `inverted ${side} heel`).toBeGreaterThan(0.02);
      expect(ball, `inverted ${side} ball`).toBeGreaterThan(0.004);
    }
    // the roll is what turns it: the same feet unrolled keep the sole elsewhere
    const bare = { ...lotus.pose };
    for (const side of ['L', 'R']) {
      const e = bare[`foot.${side}`];
      if (typeof e === 'object' && !Array.isArray(e)) bare[`foot.${side}`] = e.dir;
    }
    const flat = solve(applyStage(bare));
    expect(Math.min(...soleSide(flat, 'L', [0, 0, 1]), ...soleSide(flat, 'R', [0, 0, 1]))).toBeLessThan(0);
  });

  it('keeps the Blender hull port on the measured skin (SKIN_FIT in _hull.py is the TypeScript one)', () => {
    const src = Object.values(hullPy)[0];
    const block = /SKIN_FIT = \{([\s\S]*?)\n\}/.exec(src);
    expect(block).not.toBeNull();
    const py = Object.fromEntries([...block![1].matchAll(/'([a-z]+)': \(([\d.]+), ([\d.]+)\)/g)].map((m) => [m[1], [Number(m[2]), Number(m[3])]]));
    expect(py).toEqual(SKIN_FIT);
  });

  it('fails what the rules must not excuse: the head through the pelvis, a distal thigh through it, crossed wrists (laced or not)', () => {
    const head = clashes(solve(applyStage({ 'spine.upper': [0, 0.02, -1], neck: [0, 0, -1], head: [0, 0, -1] })));
    expect(head.some((c) => /head|crown/.test(c.a + c.b) && /pelvis|waist/.test(c.a + c.b)), 'head through the pelvis').toBe(true);
    const thigh = clashes(solve(applyStage({ 'thigh.L': [-1, 0, 0.05], 'shin.L': [-1, 0, 0.05], 'foot.L': [-1, 0, 0.3] })));
    const own = ['pelvis', 'pelvis>waist', 'pelvis>hip.L', 'waist'];
    expect(thigh.some((c) => [c.a, c.b].includes('hip.L>knee.L') && (own.includes(c.a) || own.includes(c.b))), 'distal thigh through its own pelvis').toBe(true);
    expect(thigh.some((c) => [c.a, c.b].includes('hip.L>knee.L') && [c.a, c.b].includes('hip.R')), 'thigh through the opposite socket').toBe(true);
    const crossed: RigStagePose = {
      'upperarm.L': [0, -1, 0], 'forearm.L': [-0.8, -0.6, 0], 'hand.L': [-0.8, -0.6, 0],
      'upperarm.R': [0, -1, 0], 'forearm.R': [0.8, -0.6, 0], 'hand.R': [0.8, -0.6, 0],
    };
    for (const laced of [false, true]) {
      const c = clashes(solve(applyStage(crossed)), CLEARANCE_TOL, { laced });
      expect(c.some((x) => /wrist/.test(x.a) && /wrist/.test(x.b)), `crossed wrists, laced ${laced}`).toBe(true);
    }
  });

  it('matches the Blender port: the Python clash fixtures, pair for pair, within 1 mm', () => {
    expect(clashFixtures.length).toBeGreaterThanOrEqual(6);
    expect(clashFixtures.some((f) => f.clashes.length === 0)).toBe(true);
    expect(clashFixtures.some((f) => f.clashes.some((c) => c[2] > 0.03))).toBe(true);
    for (const f of clashFixtures) {
      const ts = clashes(solve(applyStage(f.pose)), 0, { laced: f.laced });
      const key = (a: string, b: string) => [a, b].sort().join(' / ');
      const got = new Map(ts.map((c) => [key(c.a, c.b), c.depth]));
      const want = new Map(f.clashes.map(([a, b, d]) => [key(a, b), d]));
      for (const [k, d] of want) {
        expect(got.has(k), `${f.case}: ${k} (python ${d})`).toBe(true);
        expect(Math.abs((got.get(k) ?? 0) - d), `${f.case}: ${k}`).toBeLessThanOrEqual(0.001);
      }
      for (const [k, d] of got) if (d > 0.002) expect(want.has(k), `${f.case}: TS only ${k} ${d}`).toBe(true);
    }
  });

  it('frames every held stage: the whole hull inside its camera square, clear of the disc’s rounded corners', () => {
    // the page's disc is a rounded square (22 px corners on a ~300 px disc): every hull point must sit
    // inside the frame with a 4 % margin, and in the corners inside a quarter circle of 15 % of the half-size
    const M = 0.04;
    const C = 0.15;
    const lim = 1 - M;
    for (const [id, d] of Object.entries(sheets)) {
      d.stages.forEach((st, i) => {
        const cam = stageCamera(d, i);
        const half = cam.scale / 2;
        let worst = -Infinity;
        for (const p of hullPoints(solve(applyStage(st.pose)))) {
          const a = Math.abs(p[0] * Math.cos(cam.azimuth) + p[1] * Math.sin(cam.azimuth)) / half;
          const b = Math.abs(p[2] - cam.centerZ) / half;
          const e = a <= lim - C || b <= lim - C ? Math.max(a, b) - lim : Math.hypot(a - (lim - C), b - (lim - C)) - C;
          worst = Math.max(worst, e);
        }
        expect(worst, `${id} #${i} ${st.label}: ${(worst * 100).toFixed(1)} % of the half-frame outside`).toBeLessThanOrEqual(0);
      });
    }
  });
});
