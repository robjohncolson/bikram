import { describe, expect, it } from 'vitest';
import { announceText, buildClassTrack, buildPoseTrack } from './cues';
import { poses } from '../data';

const camel = poses.find((p) => p.id === 'camel')!;
const pranayama = poses[0];
const balancingStick = poses.find((p) => p.id === 'balancing-stick')!;

describe('cue sequencer', () => {
  it('announces postures by number and breathing exercises by name', () => {
    expect(announceText(camel, false)).toBe('Posture 22. Camel Pose.');
    expect(announceText(pranayama, false)).toBe('Standing Deep Breathing.');
    expect(announceText(camel, true)).toBe('Posture 22. Camel Pose — Ustrasana.');
  });

  it('opens with the announce, then the first setup step as a guide', () => {
    const track = buildPoseTrack(camel, 60);
    expect(track.totalBeats).toBe(camel.approxTotalSeconds); // 60 bpm: beats = seconds
    expect(track.events[0]).toMatchObject({ atBeat: 0, kind: 'announce' });
    const guide = track.events.find((e) => e.kind === 'guide');
    expect(guide).toMatchObject({ atBeat: 3, text: camel.setup[0] });
  });

  it('marks the second-set boundary at the midpoint for two-set postures', () => {
    const track = buildPoseTrack(camel, 60);
    const set = track.events.find((e) => e.kind === 'set');
    expect(set).toMatchObject({
      atBeat: Math.round(track.totalBeats / 2),
      text: 'Second set.',
    });
  });

  it('fires three warning ticks on the final beats of long holds only', () => {
    const long = buildPoseTrack(camel, 60);
    const warns = long.events.filter((e) => e.kind === 'warn').map((e) => e.atBeat);
    expect(warns).toEqual([long.totalBeats - 3, long.totalBeats - 2, long.totalBeats - 1]);
    // a hold squeezed under 12 beats gets no ticks
    const short = buildPoseTrack(balancingStick, 30 / (balancingStick.approxTotalSeconds / 10));
    if (short.totalBeats < 12) {
      expect(short.events.filter((e) => e.kind === 'warn')).toHaveLength(0);
    }
  });

  it('keeps every event inside the hold and sorted', () => {
    for (const track of buildClassTrack(60)) {
      let prev = -1;
      for (const e of track.events) {
        expect(e.atBeat).toBeGreaterThanOrEqual(0);
        expect(e.atBeat).toBeLessThan(track.totalBeats);
        expect(e.atBeat).toBeGreaterThanOrEqual(prev);
        prev = e.atBeat;
      }
    }
  });

  it('compiles the whole class and honors a starting posture', () => {
    expect(buildClassTrack(60)).toHaveLength(26);
    const fromCamel = buildClassTrack(60, 22);
    expect(fromCamel).toHaveLength(5);
    expect(fromCamel[0].pose.id).toBe('camel');
  });

  it('halves beat budgets at half tempo', () => {
    const full = buildPoseTrack(camel, 60);
    const half = buildPoseTrack(camel, 30);
    expect(half.totalBeats).toBe(Math.round(full.totalBeats / 2));
  });

  it('never schedules a guide over the announce on tiny holds', () => {
    for (const track of buildClassTrack(120)) {
      const guide = track.events.find((e) => e.kind === 'guide');
      if (guide) expect(track.totalBeats).toBeGreaterThan(7);
    }
  });
});
