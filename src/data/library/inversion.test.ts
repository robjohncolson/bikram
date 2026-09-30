import { expect, it } from 'vitest';
import { anchorToContacts, clashes, CLEARANCE_TOL, groundedSheetPose, smoothstep, solve } from '../../rig';
import type { RigData } from '../types';

const ids = new Set('eka-pada-sarvangasana halasana karnapidasana parsva-halasana parsva-pindasana-in-sarvangasana parsvaika-pada-sarvangasana pindasana-in-sarvangasana salamba-sarvangasana-i salamba-sirsasana-i setu-bandha-sarvangasana supta-konasana urdhva-dandasana urdhva-padmasana-in-sarvangasana'.split(' '));
const sheets = Object.values(import.meta.glob<RigData>('../rig/library/*.json', { eager: true, import: 'default' })).filter(d => ids.has(d.id.replace('library:', '')));

it('includes all thirteen inversion sheets', () => { expect(sheets).toHaveLength(13); });

for (const d of sheets) it(`${d.id}: skeleton and every transition`, () => {
  const errors: string[] = [];
    expect(d.skeleton, d.id).toBe('library');
    for (let i = 0; i < d.stages.length; i++) {
      const j = (i + 1) % d.stages.length;
      let maxLift = 0;
      let worst = '';
      let depth = 0;
      for (let k = 1; k <= 8; k++) {
        const t = smoothstep(k / 9);
        const drawn = groundedSheetPose(d, i, j, t);
        const anchored = anchorToContacts(d, i, j, t);
        maxLift = Math.max(maxLift, drawn.pelvisLocation[2] - anchored.pelvisLocation[2]);
        const c = clashes(solve(drawn), CLEARANCE_TOL, { laced: d.stages[i].hands === 'laced' || d.stages[j].hands === 'laced' });
        if (c[0] && c[0].depth > depth) { depth = c[0].depth; worst = `${c[0].a}/${c[0].b} @${k}/9`; }
      }
      const label = `${d.id} ${i} ${d.stages[i].label} -> ${j} ${d.stages[j].label}`;
      if (maxLift > 0.03) errors.push(`${label}: floor lift ${(maxLift * 100).toFixed(1)} cm`);
      if (depth > CLEARANCE_TOL) errors.push(`${label}: ${worst} ${(depth * 100).toFixed(1)} cm`);
    }
  expect(errors).toEqual([]);
}, 180_000);
