import { describe, expect, it } from 'vitest';
import { announceText, buildClassTrack, buildPoseTrack, segmentAtBeat } from './cues';
import { poses } from '../data';

const camel = poses.find((p) => p.id === 'camel')!;
const pranayama = poses[0];
const balancingStick = poses.find((p) => p.id === 'balancing-stick')!;
/** camel without authored segments — exercises the fallback set-cue path */
const plainCamel = { ...camel, segments: undefined };

describe('cue sequencer', () => {
  it('announces postures by number and breathing exercises by name', () => {
    expect(announceText(camel, false)).toBe('Posture 22. Camel Pose.');
    expect(announceText(pranayama, false)).toBe('Standing Deep Breathing.');
    expect(announceText(camel, true)).toBe('Posture 22. Camel Pose — Ustrasana.');
  });

  it('opens with the announce, then walks in through every setup step', () => {
    const track = buildPoseTrack(camel, 60);
    expect(track.totalBeats).toBe(camel.approxTotalSeconds); // 60 bpm: beats = seconds
    expect(track.events[0]).toMatchObject({ atBeat: 0, kind: 'announce' });
    const guides = track.events.filter((e) => e.kind === 'guide');
    // camel's first segment is 40s — room for all five setup steps 8s apart
    camel.setup.forEach((step, i) => {
      expect(guides[i]).toMatchObject({ atBeat: 4 + i * 8, text: step });
    });
    // the walk-in never crosses the first segment boundary
    const firstBoundary = track.events.find((e) => e.kind === 'segment')!.atBeat;
    camel.setup.forEach((_, i) => {
      expect(guides[i].atBeat).toBeLessThan(firstBoundary);
    });
  });

  it('coaches mid-hold in later working segments, never in rests', () => {
    const track = buildPoseTrack(camel, 60);
    const guides = track.events.filter((e) => e.kind === 'guide');
    // at least one alignment cue lands after the walk-in's segment
    const coached = guides.filter((g) => camel.cues.includes(g.text ?? ''));
    expect(coached.length).toBeGreaterThan(0);
    // rest/situp spans stay silent (walk-in lives in segment 0)
    const segs = camel.segments!;
    const totalSeconds = segs.reduce((s, x) => s + x.seconds, 0);
    let elapsed = 0;
    segs.forEach((seg, i) => {
      const start = Math.round((elapsed / totalSeconds) * track.totalBeats);
      elapsed += seg.seconds;
      const end = i === segs.length - 1 ? track.totalBeats : Math.round((elapsed / totalSeconds) * track.totalBeats);
      if (i > 0 && (seg.kind === 'rest' || seg.kind === 'situp')) {
        // boundary cue at `start` is allowed; nothing else speaks inside
        const inside = guides.filter((g) => g.atBeat > start && g.atBeat < end);
        expect(inside, `${seg.label} should be silent`).toEqual([]);
      }
    });
  });

  it('keeps at least four seconds between any two spoken lines', () => {
    for (const track of buildClassTrack(60)) {
      const spokenBeats = track.events
        .filter((e) => e.kind !== 'warn')
        .map((e) => e.atBeat)
        .sort((a, b) => a - b);
      for (let i = 1; i < spokenBeats.length; i++) {
        expect(
          spokenBeats[i] - spokenBeats[i - 1],
          `${track.pose.id}: lines at ${spokenBeats[i - 1]} and ${spokenBeats[i]}`,
        ).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('silences all guidance when guides are off', () => {
    const track = buildPoseTrack(camel, 60, { guides: false });
    expect(track.events.filter((e) => e.kind === 'guide')).toEqual([]);
    // announce and segment boundaries still speak
    expect(track.events[0].kind).toBe('announce');
    expect(track.events.some((e) => e.kind === 'segment')).toBe(true);
  });

  it('marks the second-set boundary at the midpoint for two-set postures', () => {
    const track = buildPoseTrack(plainCamel, 60);
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

  it('emits authored segment cues on the scaled beat grid', () => {
    const segmented = {
      ...camel,
      approxTotalSeconds: 120,
      segments: [
        { kind: 'set' as const, label: 'First set', cue: 'First set.', seconds: 60 },
        { kind: 'rest' as const, label: 'Savasana', cue: 'Twenty-second savasana.', seconds: 20 },
        { kind: 'set' as const, label: 'Second set', cue: 'Second set.', seconds: 40 },
      ],
    };
    const track = buildPoseTrack(segmented, 60);
    const segCues = track.events.filter((e) => e.kind === 'segment');
    expect(segCues).toEqual([
      { atBeat: 60, kind: 'segment', text: 'Twenty-second savasana.' },
      { atBeat: 80, kind: 'segment', text: 'Second set.' },
    ]);
    // no fallback set events when segments are authored
    expect(track.events.filter((e) => e.kind === 'set')).toHaveLength(0);
    // at half tempo the boundaries scale with the grid
    const half = buildPoseTrack(segmented, 30);
    expect(half.events.filter((e) => e.kind === 'segment').map((e) => e.atBeat)).toEqual([30, 40]);
  });

  it('locates the segment under any beat with a live countdown', () => {
    const segmented = {
      ...camel,
      approxTotalSeconds: 120,
      segments: [
        { kind: 'set' as const, label: 'First set', cue: 'First set.', seconds: 60 },
        { kind: 'rest' as const, label: 'Savasana', cue: 'Rest.', seconds: 20 },
        { kind: 'set' as const, label: 'Second set', cue: 'Second set.', seconds: 40 },
      ],
    };
    const track = buildPoseTrack(segmented, 60);
    expect(segmentAtBeat(track, 0)).toMatchObject({ index: 0, label: 'First set', beatsLeft: 60 });
    expect(segmentAtBeat(track, 59)).toMatchObject({ index: 0, beatsLeft: 1 });
    expect(segmentAtBeat(track, 60)).toMatchObject({ index: 1, label: 'Savasana', beatsLeft: 20 });
    expect(segmentAtBeat(track, 119)).toMatchObject({ index: 2, beatsLeft: 1 });
    expect(segmentAtBeat(track, 999)).toMatchObject({ index: 2 });
    expect(segmentAtBeat(buildPoseTrack(plainCamel, 60), 5)).toBeNull();
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
