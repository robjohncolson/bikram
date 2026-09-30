import { describe, expect, it } from 'vitest';
import { applyStage, anchorToContacts, hullPoints, liftToFloor, stageCamera, clashes, CLEARANCE_TOL, groundedSheetPose, smoothstep, solve } from '../../rig';
import type { RigData } from '../types';
import { getLibraryAsana, libraryStageCap } from './index';
const ids = ['padmasana', 'siddhasana', 'parvatasana', 'baddha-padmasana', 'yoga-mudrasana', 'ardha-baddha-padma-paschimottanasana', 'matsyasana'];
const all = import.meta.glob<RigData>('../rig/library/*.json', { eager: true, import: 'default' });
describe('lotus library arm migration', () => {
  for (const id of ids) it(id + ' uses the library skeleton with clear held poses and transitions', () => {
    const d = all[`../rig/library/${id}.json`];
    expect(d.skeleton).toBe('library');
    expect(d.stages.length).toBeLessThanOrEqual(libraryStageCap(id));
    const errors: string[] = [];
    for (let i = 0; i < d.stages.length; i++) {
      const st = d.stages[i];
      const cam = stageCamera(d, i);
      for (const point of hullPoints(solve(applyStage(st.pose, d.skeleton)))) {
        const a = Math.abs(point[0] * Math.cos(cam.azimuth) + point[1] * Math.sin(cam.azimuth)) / (cam.scale / 2);
        const b = Math.abs(point[2] - cam.centerZ) / (cam.scale / 2);
        const overflow = a <= 0.81 || b <= 0.81 ? Math.max(a, b) - 0.96 : Math.hypot(a - 0.81, b - 0.81) - 0.15;
        expect(overflow, `${id} ${st.label} framing`).toBeLessThanOrEqual(0);
      }
      for (const pose of [st.pose, ...(st.ghost ? [{ ...st.pose, ...st.ghost }] : [])]) {
        const held = applyStage(pose, d.skeleton);
        expect(liftToFloor(held), `${id} ${st.label} authored floor`).toBe(held);
        for (const c of clashes(solve(applyStage(pose, d.skeleton)), CLEARANCE_TOL, { laced: st.hands === 'laced' })) errors.push(`${i} held: ${c.a}/${c.b} ${c.depth}`);
      }
      const j = (i + 1) % d.stages.length;
      for (let k = 1; k <= 8; k++) {
        const t = smoothstep(k / 9);
        const anchored = anchorToContacts(d, i, j, t);
        const drawn = groundedSheetPose(d, i, j, t);
        const lift = drawn.pelvisLocation[2] - anchored.pelvisLocation[2];
        if (lift > 0.03) errors.push(`${i}->${j} @${k} floor lift ${lift}`);
        const solved = solve(drawn);
        for (const [bone, b] of Object.entries(solved)) {
          if (Math.min(b.head[2], b.tail[2]) < -0.005) errors.push(`${i}->${j} @${k}: ${bone} below floor`);
        }
        const c = clashes(solved, CLEARANCE_TOL, { laced: st.hands === 'laced' || d.stages[j].hands === 'laced' });
        for (const hit of c) errors.push(`${i}->${j} @${k}: ${hit.a}/${hit.b} ${hit.depth}`);
      }
    }
    expect(errors).toEqual([]);
  }, 180000);
  it.each(['siddhasana', 'padmasana', 'ardha-baddha-padma-paschimottanasana'])('%s holds both sides for the same time', (id) => {
    const d = all[`../rig/library/${id}.json`];
    expect(d.stages).toHaveLength(12);
    expect(d.stages[3].hold).toBe(d.stages[9].hold);
    expect(d.stages[3].pose['shin.L']).toEqual(d.stages[9].pose['shin.R'] && (d.stages[9].pose['shin.R'] as number[]).map((n, i) => i === 0 ? -n : n));
  });
  it.each([
    ['parvatasana', 'Arms up'],
    ['baddha-padmasana', 'Head back'],
    ['yoga-mudrasana', 'Fold'],
    ['matsyasana', 'Arch onto the crown'],
  ])('%s demonstrates both crossings through a straight-leg rest', (id, held) => {
    const d = all[`../rig/library/${id}.json`];
    const a = d.stages.find((st) => st.label === held)!;
    const b = d.stages.find((st) => st.label === `${held} (other crossing)`)!;
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(a.hold).toBe(b.hold);
    expect(a.hold).toBe(Math.max(...d.stages.map((st) => st.hold)));
    for (const side of ['L', 'R']) {
      const opposite = side === 'L' ? 'R' : 'L';
      expect(a.pose[`shin.${side}`]).toEqual((b.pose[`shin.${opposite}`] as number[]).map((n, i) => i === 0 ? -n : n));
    }
    for (const suffix of ['', ' (other crossing)']) {
      const rest = d.stages.findIndex((st) => st.label === `Legs long${suffix}`);
      expect(rest).toBeGreaterThan(2);
      expect(d.stages[rest - 2].label).toContain('Extend');
      expect(d.stages[rest - 1].label).toContain('clear');
      expect(d.stages[rest + 1].label).toContain('Lift');
      expect(d.stages[rest + 2].label).toContain('Set');
      expect(d.stages[rest + 3].label).toContain('Carry');
    }
    const steps = getLibraryAsana(id)!.steps;
    expect(steps.some((step) => step.stage === d.stages.indexOf(b))).toBe(true);
    expect(d.stages[steps.at(-1)!.stage!].label).toBe('Legs long (other crossing)');
  });
});
