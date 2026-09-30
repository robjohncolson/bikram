import { expect, it } from 'vitest';
import { CLEARANCE_TOL, J, SKIN_EXTRA, anchorToContacts, clashes, groundedSheetPose, smoothstep, applyStage, solve } from '../../rig';
import { add, rotate, sub } from '../../rig/math';
import type { RigData } from '../types';
import mahaMudra from '../rig/library/maha-mudra.json';
import januSirsasana from '../rig/library/janu-sirsasana.json';

it.each([
  ['maha-mudra', mahaMudra, 90],
  ['janu-sirsasana', januSirsasana, 95],
] as const)('%s opens the bent thigh with the knee down and heel drawn in', (_id, json, minimum) => {
  const sheet = json as unknown as RigData;
  for (let i = 1; i < sheet.stages.length; i++) {
    const stage = sheet.stages[i];
    const pose = solve(applyStage(stage.pose));
    const straight = i < 5 ? 'R' : 'L';
    const bent = straight === 'R' ? 'L' : 'R';
    const thigh = (side: string) => {
      const { head, tail } = pose[`thigh.${side}`];
      return [tail[0] - head[0], tail[1] - head[1]];
    };
    const a = thigh(straight);
    const b = thigh(bent);
    const degrees = Math.acos((a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))) * 180 / Math.PI;
    expect(degrees, stage.label).toBeGreaterThanOrEqual(minimum);
    expect(pose[`thigh.${bent}`].tail[2], stage.label).toBeCloseTo(0.06, 2);
    const ankle = pose[`shin.${bent}`].tail;
    const seat = pose.pelvis.head;
    expect(Math.hypot(ankle[0] - seat[0], ankle[1] - seat[1]), stage.label).toBeLessThan(0.23);
    expect(ankle[2], stage.label).toBeCloseTo(0.075, 2);
    const foot = pose[`foot.${bent}`];
    const heel = add(foot.head, rotate(foot.q, sub(SKIN_EXTRA[`heel.${bent}`][0], J[`ankle.${bent}`])));
    // The ankle may move out, but the actual heel must stay inside its hip near the seat.
    expect(Math.abs(heel[0] - seat[0]), stage.label).toBeLessThan(Math.abs(pose[`thigh.${bent}`].head[0] - seat[0]));
    expect(Math.hypot(heel[0] - seat[0], heel[1] - seat[1]), stage.label).toBeLessThan(0.18);
  }
}, 60_000);

it.each([
  ['maha-mudra', mahaMudra],
  ['janu-sirsasana', januSirsasana],
] as const)('%s bends and releases the knee above the mat', (_id, json) => {
  const sheet = json as unknown as RigData;
  for (let i = 0; i < sheet.stages.length; i++) {
    const j = (i + 1) % sheet.stages.length;
    for (let k = 1; k <= 8; k++) {
      const t = smoothstep(k / 9);
      const pose = groundedSheetPose(sheet, i, j, t);
      const where = `${sheet.stages[i].label} → ${sheet.stages[j].label} @${k}/9`;
      const lift = pose.pelvisLocation[2] - anchorToContacts(sheet, i, j, t).pelvisLocation[2];
      expect(lift, where).toBeLessThanOrEqual(0.03);
      expect(clashes(solve(pose), CLEARANCE_TOL), where).toEqual([]);
    }
  }
}, 60_000);
