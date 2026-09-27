import { describe, expect, it } from 'vitest';
import { poses } from '../data';
import { buildClassTrack } from './cues';
import {
  FULL_CLASS,
  SHORT_CLASS,
  firstSetOnly,
  programById,
  programMinutes,
  programPoses,
  programSeconds,
} from './programs';

const byId = (id: string) => poses.find((p) => p.id === id)!;
const spokenTexts = (id: string) =>
  buildClassTrack(60, SHORT_CLASS)
    .find((t) => t.pose.id === id)!
    .events.map((e) => e.text ?? '');

describe('class programs', () => {
  it('the full class is every posture, whole', () => {
    expect(programPoses(FULL_CLASS)).toEqual(poses);
    const total = poses.reduce((s, p) => s + p.approxTotalSeconds, 0);
    expect(programSeconds(FULL_CLASS)).toBe(total);
    expect(programMinutes(FULL_CLASS)).toBe(Math.round(total / 60));
  });

  it('short-class orders exist and ascend', () => {
    const orders = SHORT_CLASS.items.map((i) => i.order);
    for (const o of orders) expect(poses.some((p) => p.order === o)).toBe(true);
    for (let i = 1; i < orders.length; i++) expect(orders[i]).toBeGreaterThan(orders[i - 1]);
    expect(programPoses(SHORT_CLASS).map((p) => p.id)).toEqual([
      'pranayama',
      'half-moon',
      'awkward',
      'eagle',
      'cobra',
      'camel',
      'spine-twisting',
      'kapalbhati',
    ]);
  });

  it('first set only drops the second-set segments and keeps the partition', () => {
    for (const pose of programPoses(SHORT_CLASS)) {
      const segs = pose.segments ?? [];
      expect(segs.every((s) => !/^second set/i.test(s.label))).toBe(true);
      expect(segs.reduce((s, seg) => s + seg.seconds, 0)).toBe(pose.approxTotalSeconds);
    }
    // a floor posture keeps its savasana and sit-up out of the first set
    expect(firstSetOnly(byId('cobra')).segments!.map((s) => s.kind)).toEqual(['set', 'rest', 'situp']);
    expect(firstSetOnly(byId('cobra')).approxTotalSeconds).toBe(55);
    expect(firstSetOnly(byId('half-moon')).approxTotalSeconds).toBe(240);
    // no second set authored: taken whole, same object
    expect(firstSetOnly(byId('spine-twisting'))).toBe(byId('spine-twisting'));
  });

  it('minute math sums the trimmed holds', () => {
    const expected = SHORT_CLASS.items
      .map((i) => firstSetOnly(poses.find((p) => p.order === i.order)!))
      .reduce((s, p) => s + p.approxTotalSeconds, 0);
    expect(programSeconds(SHORT_CLASS)).toBe(expected);
    expect(programMinutes(SHORT_CLASS)).toBe(Math.round(expected / 60));
    expect(programMinutes(SHORT_CLASS, 30)).toBe(Math.round((expected * 2) / 60));
    expect(programMinutes(SHORT_CLASS)).toBeGreaterThanOrEqual(12);
    expect(programMinutes(SHORT_CLASS)).toBeLessThanOrEqual(17);
  });

  it('the short-class voice never announces a second set', () => {
    for (const id of ['pranayama', 'half-moon', 'awkward', 'eagle', 'cobra', 'camel', 'kapalbhati']) {
      expect(spokenTexts(id).some((t) => /second set/i.test(t))).toBe(false);
    }
    // the full class still does
    const fullCobra = buildClassTrack(60, 16)[0];
    expect(fullCobra.events.some((e) => /second set/i.test(e.text ?? ''))).toBe(true);
  });

  it('buildClassTrack keeps the fromOrder signature', () => {
    expect(buildClassTrack(60, 20).map((t) => t.pose.order)).toEqual([20, 21, 22, 23, 24, 25, 26]);
    expect(buildClassTrack(60).length).toBe(poses.length);
  });

  it('programById falls back to the full class', () => {
    expect(programById('short')).toBe(SHORT_CLASS);
    expect(programById('nope')).toBe(FULL_CLASS);
    expect(programById(null)).toBe(FULL_CLASS);
  });
});
