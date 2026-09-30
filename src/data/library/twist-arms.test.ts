import { expect, it } from 'vitest';
import { anchorToContacts, applyStage, clashes, CLEARANCE_TOL, groundedSheetPose, smoothstep, solve } from '../../rig';
import type { RigData } from '../types';
import ardha from '../rig/library/ardha-matsyendrasana.json';
import bharadvaja from '../rig/library/bharadvajasana.json';
import jatara from '../rig/library/jatara-parivartanasana.json';
import marichi from '../rig/library/marichyasana-ii.json';
import supta from '../rig/library/supta-padangusthasana.json';

const sheets = [ardha, bharadvaja, jatara, marichi, supta] as unknown as RigData[];
for (const sheet of sheets) {
  it(`${sheet.id}: library arms clear the held poses and both-side transitions`, () => {
    expect(sheet.skeleton).toBe('library');
    expect(sheet.stages.length).toBeLessThanOrEqual(12);
    const second = sheet.id === 'library:jatara-parivartanasana' ? 5 : 9;
    const firstHold = solve(applyStage(sheet.stages[3].pose, sheet.skeleton));
    const secondHold = solve(applyStage(sheet.stages[second].pose, sheet.skeleton));
    for (const bone of ['forearm', 'hand', 'thigh', 'foot']) {
      for (const side of ['L', 'R']) {
        const a = firstHold[`${bone}.${side}`].tail;
        const b = secondHold[`${bone}.${side === 'L' ? 'R' : 'L'}`].tail;
        expect(b[0]).toBeCloseTo(-a[0], 5);
        expect(b[1]).toBeCloseTo(a[1], 5);
        expect(b[2]).toBeCloseTo(a[2], 5);
      }
    }
    const failures: string[] = [];
    sheet.stages.forEach((stage, i) => {
      const held = clashes(solve(applyStage(stage.pose, sheet.skeleton)), CLEARANCE_TOL);
      held.forEach(c => failures.push(`${i} held: ${c.a}/${c.b} ${(c.depth * 100).toFixed(2)} cm`));
      for (const t of [0.25, 0.5, 0.75]) {
        const next = (i + 1) % sheet.stages.length;
        const anchored = anchorToContacts(sheet, i, next, smoothstep(t));
        const drawn = groundedSheetPose(sheet, i, next, smoothstep(t));
        const lift = drawn.pelvisLocation[2] - anchored.pelvisLocation[2];
        if (lift > 0.03) {
          const low = Object.entries(solve(anchored)).sort((a,b) => a[1].tail[2] - b[1].tail[2])[0];
          failures.push(`${i}->${next} @${t}: floor lift ${(lift*100).toFixed(2)} cm; lowest ${low[0]}`);
        }
      }
      for (let k = 1; k <= 8; k++) {
        const next = (i + 1) % sheet.stages.length;
        const collisions = clashes(solve(groundedSheetPose(sheet, i, next, smoothstep(k / 9))), CLEARANCE_TOL);
        collisions.forEach(c => failures.push(`${i}->${next} @${k}/9: ${c.a}/${c.b} ${(c.depth * 100).toFixed(2)} cm`));
      }
    });
    expect(failures).toEqual([]);
  }, 120_000);
}
