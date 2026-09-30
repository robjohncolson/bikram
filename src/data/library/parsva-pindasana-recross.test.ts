import { expect, it } from 'vitest';
import { anchorToContacts, applyStage, clashes, CLEARANCE_TOL, groundedSheetPose, hullPoints, smoothstep, solve } from '../../rig';
import type { RigData } from '../types';
import data from '../rig/library/parsva-pindasana-in-sarvangasana.json';
import { parsvaPindasanaInSarvangasana } from './parsva-pindasana-in-sarvangasana';

const sheet = data as unknown as RigData;

it('uncrosses into straight shoulderstand between the two lateral pairs and at the finish', () => {
  expect(sheet.stages).toHaveLength(21);
  expect(sheet.stages[10].pose).toEqual(sheet.stages[0].pose);
  expect(sheet.stages[20].pose).toEqual(sheet.stages[0].pose);
  expect(sheet.stages[12].pose).not.toEqual(sheet.stages[2].pose);
  expect(parsvaPindasanaInSarvangasana.steps.at(-1)?.stage).toBe(20);
  expect(parsvaPindasanaInSarvangasana.steps.find(s => s.text.includes('repeat to the right'))?.stage).toBe(16);
});

it('clears the hull and floor throughout both crossings, including the loop', () => {
  const failures: string[] = [];
  for (let i = 0; i < sheet.stages.length; i++) {
    const next = (i + 1) % sheet.stages.length;
    for (let k = 0; k <= 8; k++) {
      const t = smoothstep(k / 9);
      const pose = k === 0 ? applyStage(sheet.stages[i].pose, sheet.skeleton) : groundedSheetPose(sheet, i, next, t);
      const solved = solve(pose);
      const overlaps = clashes(solved, CLEARANCE_TOL);
      for (const overlap of overlaps) failures.push(`${i}->${next} @${k}/9: ${overlap.a}/${overlap.b} ${overlap.depth}`);
      expect(Math.min(...hullPoints(solved).map(p => p[2])), `${i}->${next} @${k}/9 floor`).toBeGreaterThanOrEqual(-0.01);
      if (k > 0) expect(pose.pelvisLocation[2] - anchorToContacts(sheet, i, next, t).pelvisLocation[2]).toBeLessThanOrEqual(0.03);
    }
  }
  expect(failures).toEqual([]);
}, 180_000);
