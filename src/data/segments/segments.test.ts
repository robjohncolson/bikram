import { describe, expect, it } from 'vitest';
import { poses } from '../index';
import { segmentsByPose } from './index';
import { buildClassTrack, classMinutes, CLOSING_SECONDS } from '../../pacer/cues';
import { FULL_CLASS } from '../../pacer/programs';
import { poseGridSeconds } from '../../pacer/grid';

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

  it('keeps the compiled class at about 87 minutes plus two minutes closing', () => {
    const minutes = classMinutes(FULL_CLASS);
    expect(minutes).toBeGreaterThanOrEqual(84);
    expect(minutes).toBeLessThanOrEqual(90);
    expect(CLOSING_SECONDS).toBe(120);
    const tracks = buildClassTrack(60);
    const gridSeconds = poses.reduce((sum, p) => sum + poseGridSeconds(p), 0);
    const entrySeconds = tracks.reduce((sum, t) => sum + t.spans.reduce((n, s) => n + s.entryBeats, 0), 0);
    expect(gridSeconds + entrySeconds).toBe(tracks.reduce((sum, t) => sum + t.totalBeats, 0));
  });

  it('describes sit-ups after supine rests and avoids fixed-length pose copy', () => {
    const situp = poses.find((p) => p.id === 'situp')!;
    expect(JSON.stringify(situp)).not.toMatch(/every floor posture/);
    expect(situp.sequenceNote).toContain('after the final Bow set');
    for (const id of ['pranayama', 'kapalbhati']) {
      const p = poses.find((p) => p.id === id)!;
      expect([p.summary, ...p.benefits].join(' ')).not.toMatch(/ninety minutes|90 minutes/);
    }
  });

  it('never puts a sit-up or supine rest after a spine set before the final Bow set', () => {
    for (const id of ['cobra', 'locust', 'full-locust', 'bow']) {
      const segs = segmentsByPose[id];
      segs.forEach((seg, i) => {
        if (seg.kind !== 'set' || (id === 'bow' && seg.label === 'Second set')) return;
        expect(segs[i + 1]?.kind, `${id}: ${seg.label}`).not.toBe('situp');
        expect(segs[i + 1]?.orientation, `${id}: ${seg.label}`).toBe('prone');
      });
    }
  });

  it('follows each complete spine set with a prone rest, except the last Bow set', () => {
    for (const id of ['cobra', 'locust', 'full-locust', 'bow']) {
      const segs = segmentsByPose[id];
      expect(segs.filter((s) => s.kind === 'set')).toHaveLength(2);
      segs.forEach((seg, i) => {
        if (seg.kind !== 'set') return;
        if (id === 'bow' && seg.label === 'Second set') {
          expect(segs.slice(i + 1).map((s) => s.kind)).toEqual(['rest', 'situp']);
          expect(segs[i + 1].orientation).not.toBe('prone');
        } else {
          expect(segs[i + 1]).toMatchObject({ kind: 'rest', orientation: 'prone' });
        }
      });
    }
  });

  it('gives both Locust sets separate right, left and both-leg holds', () => {
    for (const set of ['First', 'Second']) {
      expect(segmentsByPose.locust.filter((s) => s.label.startsWith(`${set} set`)).map((s) => s.label))
        .toEqual(['right leg', 'left leg', 'both legs'].map((part) => `${set} set \u2014 ${part}`));
    }
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
