import { describe, expect, it } from 'vitest';
import { poses } from '../index';
import { segmentsByPose } from './index';

/**
 * The segment invariant: every posture is fully partitioned, exactly.
 * These tests stay meaningful while authoring is in flight (empty maps
 * pass the shape checks; the completeness test documents the target).
 */
describe('class-time segments', () => {
  const authored = Object.keys(segmentsByPose);

  it('references only real pose ids', () => {
    const ids = new Set(poses.map((p) => p.id));
    for (const id of authored) expect(ids.has(id), `unknown pose id ${id}`).toBe(true);
  });

  it('partitions each authored posture exactly into its approxTotalSeconds', () => {
    for (const pose of poses) {
      const segs = segmentsByPose[pose.id];
      if (!segs) continue;
      expect(segs.length, `${pose.id} has no segments`).toBeGreaterThan(0);
      const sum = segs.reduce((s, seg) => s + seg.seconds, 0);
      expect(sum, `${pose.id} segments sum ${sum} ≠ ${pose.approxTotalSeconds}`).toBe(
        pose.approxTotalSeconds,
      );
      for (const seg of segs) {
        expect(seg.seconds, `${pose.id} segment "${seg.label}" too short`).toBeGreaterThanOrEqual(5);
        expect(seg.label.length, `${pose.id} segment missing label`).toBeGreaterThan(0);
        expect(seg.cue.length, `${pose.id} segment "${seg.label}" missing cue`).toBeGreaterThan(0);
      }
    }
  });

  it('covers all 26 postures', () => {
    expect(authored.length).toBe(26);
  });

  it('keeps the whole class near the canonical 90 minutes of posture time', () => {
    if (authored.length < 26) return;
    const total = poses.reduce((s, p) => s + p.approxTotalSeconds, 0);
    expect(total).toBeGreaterThan(60 * 60);
    expect(total).toBeLessThan(95 * 60);
  });
});

describe('segment metronome overrides', () => {
  it('only breathing segments override the count, and only within the pacer range', () => {
    for (const pose of poses) {
      for (const seg of pose.segments ?? []) {
        if (!seg.pacer) continue;
        expect(seg.kind, `${pose.id}: ${seg.label}`).toBe('breath');
        expect(seg.pacer.beatsPerBar).toBeGreaterThanOrEqual(1);
        expect(seg.pacer.beatsPerBar).toBeLessThanOrEqual(8);
      }
    }
    const kapalbhati = poses.find((p) => p.id === 'kapalbhati')!;
    expect(kapalbhati.segments!.every((s) => s.pacer?.beatsPerBar === 1)).toBe(true);
    const pranayama = poses.find((p) => p.id === 'pranayama')!;
    expect(pranayama.segments!.every((s) => s.pacer?.beatsPerBar === 6)).toBe(true);
  });
});
