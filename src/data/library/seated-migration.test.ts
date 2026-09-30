import { expect, it } from 'vitest';
import { applyStage, clashes, CLEARANCE_TOL, groundedSheetPose, liftToFloor, smoothstep, solve } from '../../rig';
import type { RigData } from '../types';
const sheets = import.meta.glob<RigData>('../rig/library/*.json', { eager: true, import: 'default' });
const ids = 'ardha-navasana baddha-konasana dandasana janu-sirsasana maha-mudra marichyasana-i paripurna-navasana paschimottanasana supta-virasana trianga-mukhaikapada-paschimottanasana upavistha-konasana virasana'.split(' ');
for (const id of ids) {
  const d = sheets[`../rig/library/${id}.json`];
  it(`${id}: library skeleton and collision-free held poses and transitions`, () => {
    expect(d.skeleton).toBe('library');
    const errors: string[] = [];
    for (let i = 0; i < d.stages.length; i++) {
      const a = d.stages[i], j = (i + 1) % d.stages.length, b = d.stages[j];
      const held = applyStage(a.pose, d.skeleton);
      if (liftToFloor(held) !== held) errors.push(`#${i} ${a.label}: requires floor lift`);
      for (const p of [a.pose, ...(a.ghost ? [{ ...a.pose, ...a.ghost }] : [])]) {
        const c = clashes(solve(applyStage(p, d.skeleton)), CLEARANCE_TOL, { laced: a.hands === 'laced' });
        if (c.length) errors.push(`#${i} ${a.label}: ${c.slice(0, 2).map(x => `${x.a}/${x.b} ${(x.depth * 100).toFixed(1)}cm`)}`);
      }
      for (let k = 1; k <= 8; k++) {
        const c = clashes(solve(groundedSheetPose(d, i, j, smoothstep(k / 9))), CLEARANCE_TOL, { laced: a.hands === 'laced' || b.hands === 'laced' });
        if (c.length) { errors.push(`${i}->${j} @${k}: ${c.slice(0, 2).map(x => `${x.a}/${x.b} ${(x.depth * 100).toFixed(1)}cm`)}`); break; }
      }
    }
    expect(errors).toEqual([]);
  }, 180000);
}
