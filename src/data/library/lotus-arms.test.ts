import { describe, expect, it } from 'vitest';
import { applyStage, anchorToContacts, hullPoints, stageCamera, clashes, CLEARANCE_TOL, groundedSheetPose, smoothstep, solve } from '../../rig';
import type { RigData } from '../types';
import { libraryStageCap } from './index';
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
        for (const c of clashes(solve(applyStage(pose, d.skeleton)), CLEARANCE_TOL, { laced: st.hands === 'laced' })) errors.push(`${i} held: ${c.a}/${c.b} ${c.depth}`);
      }
      const j = (i + 1) % d.stages.length;
      for (let k = 1; k <= 8; k++) {
        const t = smoothstep(k / 9);
        const anchored = anchorToContacts(d, i, j, t);
        const drawn = groundedSheetPose(d, i, j, t);
        const lift = drawn.pelvisLocation[2] - anchored.pelvisLocation[2];
        if (lift > 0.03) errors.push(`${i}->${j} @${k} floor lift ${lift}`);
        const c = clashes(solve(drawn), CLEARANCE_TOL, { laced: st.hands === 'laced' || d.stages[j].hands === 'laced' });
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
});
