import { expect, it } from 'vitest';
import type { RigData } from '../types';
import { anchorToContacts, clashes, groundedSheetPose, smoothstep, solve } from '../../rig';

const ids = ['adho-mukha-svanasana', 'bhujangasana-i', 'chaturanga-dandasana', 'dhanurasana',
  'purvottanasana', 'salabhasana', 'urdhva-dhanurasana', 'urdhva-mukha-svanasana', 'ustrasana'];
const files = import.meta.glob<RigData>('../rig/library/*.json', { eager: true, import: 'default' });

// Separate cases keep a regression in one family member from hiding another.
for (const id of ids) it(`${id}: library arms clear the complete path, including the loop`, () => {
  const d = files[`../rig/library/${id}.json`];
  expect(d.skeleton).toBe('library');
  const failures: string[] = [];
  for (let i = 0; i < d.stages.length; i++) {
    const j = (i + 1) % d.stages.length;
    for (let k = 1; k <= 8; k++) {
      const t = smoothstep(k / 9);
      const pose = groundedSheetPose(d, i, j, t);
      const anchored = anchorToContacts(d, i, j, t);
      const where = `${d.stages[i].label} -> ${d.stages[j].label} @${k}/9`;
      const lift = pose.pelvisLocation[2] - anchored.pelvisLocation[2];
      if (lift > 0.03) failures.push(`${where}: floor lift ${(lift * 100).toFixed(2)} cm`);
      for (const c of clashes(solve(pose))) {
        failures.push(`${where}: ${c.a}/${c.b} ${(c.depth * 100).toFixed(2)} cm`);
      }
    }
  }
  expect(failures).toEqual([]);
}, 180_000);
