import { describe, expect, it } from 'vitest';
import { anchorToContacts, applyStage, clashes, groundedSheetPose, smoothstep, solve } from '../../rig';
import type { RigData } from '../types';
import { getLibraryAsana } from './index';

const ids = ['padahastasana', 'padangusthasana', 'parsvottanasana', 'prasarita-padottanasana', 'tadasana', 'uttanasana', 'utthita-parsvakonasana', 'utthita-trikonasana', 'virabhadrasana-i', 'virabhadrasana-ii'];
const files = import.meta.glob<RigData>('../rig/library/*.json', { eager: true, import: 'default' });

describe('standing family migration', () => {
  it('demonstrates the second side and binds its instruction to that hold', () => {
    for (const [id, label] of [['virabhadrasana-i', 'Warrior left'], ['parsvottanasana', 'Fold left']]) {
      const sheet = files[`../rig/library/${id}.json`];
      const stage = sheet.stages.findIndex((s) => s.label === label);
      expect(stage).toBeGreaterThan(0);
      expect(getLibraryAsana(id)?.steps.some((s) => s.stage === stage)).toBe(true);
    }
  });

  it('takes both toes in both held folds and releases them before rising', () => {
    const sheet = files['../rig/library/padangusthasana.json'];
    for (const label of ['Concave back', 'Head down']) {
      const stage = sheet.stages.find((s) => s.label === label)!;
      const pose = solve(applyStage(stage.pose, sheet.skeleton));
      for (const side of ['L', 'R']) {
        const toe = pose[`foot.${side}`].tail;
        const tip = pose[`hand.${side}`].tail;
        // Joint centres stay apart; the sampled hull contact proves the grip.
        expect(Math.hypot(...tip.map((v, i) => v - toe[i]))).toBeLessThan(0.027);
        expect(clashes(pose, 0).some((c) =>
          c.a === `fingers.${side}` && c.b === `toes.${side}` ||
          c.b === `fingers.${side}` && c.a === `toes.${side}`)).toBe(true);
      }
    }
    expect(sheet.stages.at(-2)?.label).toBe('Release toes');
  });

  for (const id of ids) {
    it(`${id} uses the longer arms along a clear, grounded loop`, () => {
      const sheet = files[`../rig/library/${id}.json`];
      expect(sheet.skeleton).toBe('library');
      const failures: string[] = [];
      for (let i = 0; i < sheet.stages.length; i++) {
        const j = (i + 1) % sheet.stages.length;
        for (let k = 1; k < 9; k++) {
          const t = smoothstep(k / 9);
          const pose = groundedSheetPose(sheet, i, j, t);
          const anchored = anchorToContacts(sheet, i, j, t);
          const lift = pose.pelvisLocation[2] - anchored.pelvisLocation[2];
          if (lift > 0.03) failures.push(`${i}->${j} @${k}/9 lift ${(lift * 100).toFixed(1)} cm`);
          for (const c of clashes(solve(pose), 0.01)) {
            failures.push(`${i}->${j} @${k}/9 ${c.a}/${c.b} ${(c.depth * 100).toFixed(1)} cm`);
          }
        }
      }
      expect(failures).toEqual([]);
    }, 60000);
  }
});
