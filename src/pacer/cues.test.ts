import { describe, expect, it } from 'vitest';
import { announceText, buildClassTrack, buildPoseTrack, coachingMaterial, segmentAtBeat, walkInSteps } from './cues';
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
    // at least one coaching line lands after the walk-in's segment
    const material = coachingMaterial(camel);
    const firstBoundary = track.events.find((e) => e.kind === 'segment')!.atBeat;
    const coached = guides.filter((g) => g.atBeat > firstBoundary && material.includes(g.text ?? ''));
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

  it('rotates which coaching lines lead, and rotation 0 is the default', () => {
    const base = buildPoseTrack(camel, 60);
    const zero = buildPoseTrack(camel, 60, { rotation: 0 });
    expect(zero.events).toEqual(base.events);
    const material = coachingMaterial(camel);
    expect(material.length).toBeGreaterThan(2);
    const firstLine = (rotation: number) =>
      buildPoseTrack(camel, 60, { rotation }).events.find((e) => e.kind === 'guide' && material.includes(e.text ?? ''))!.text;
    expect(firstLine(0)).toBe(material[0]);
    expect(firstLine(1)).toBe(material[1]);
    expect(firstLine(material.length)).toBe(material[0]); // wraps
    expect(coachingMaterial(camel, -1)[0]).toBe(material[material.length - 1]);
  });

  it('breathes first in floor postures', () => {
    const cobra = poses.find((p) => p.id === 'cobra')!;
    expect(coachingMaterial(cobra)[0]).toBe(cobra.breath);
    expect(coachingMaterial(camel)[0]).toBe(camel.breath); // camel is floor series
    const eagle = poses.find((p) => p.id === 'eagle')!;
    expect(coachingMaterial(eagle)[0]).toBe(eagle.cues[0]);
    expect(coachingMaterial(eagle).at(-1)).toBe(eagle.breath);
  });

  it('uses the room the walk-in leaves in the first segment', () => {
    // Pranayama's first set is long and has only a short walk-in: the
    // silence after it now carries coaching instead of nothing
    const track = buildPoseTrack(pranayama, 60);
    const firstBoundary = track.events.find((e) => e.kind === 'segment')!.atBeat;
    const walkInEnd = 4 + (pranayama.setup.length - 1) * 8;
    const coached = track.events.filter(
      (e) => e.kind === 'guide' && e.atBeat > walkInEnd && e.atBeat < firstBoundary,
    );
    expect(coached.length).toBeGreaterThan(0);
    expect(coachingMaterial(pranayama)).toContain(coached[0].text);
  });

  it('drops walk-in steps from the middle, never the last one', () => {
    expect(walkInSteps(6, 3)).toEqual([0, 1, 5]);
    expect(walkInSteps(6, 1)).toEqual([5]);
    expect(walkInSteps(6, 0)).toEqual([]);
    expect(walkInSteps(3, 5)).toEqual([0, 1, 2]);
    const cramped = {
      ...camel,
      approxTotalSeconds: 60,
      setup: ['one', 'two', 'three', 'four', 'five', 'six'],
      segments: [
        { kind: 'set' as const, label: 'First set', cue: 'First set.', seconds: 30 },
        { kind: 'set' as const, label: 'Second set', cue: 'Second set.', seconds: 30 },
      ],
    };
    const guides = buildPoseTrack(cramped, 60).events.filter((e) => e.kind === 'guide' && cramped.setup.includes(e.text ?? ''));
    expect(guides.map((g) => g.text)).toEqual(['one', 'two', 'six']);
    expect(guides.map((g) => g.atBeat)).toEqual([4, 12, 20]);
  });

  it('holds the announce back for rehearsal and moves the walk-in with it', () => {
    const track = buildPoseTrack(camel, 60, { announceDelayBeats: 4 });
    expect(track.events.find((e) => e.kind === 'announce')!.atBeat).toBe(4);
    const guides = track.events.filter((e) => e.kind === 'guide');
    expect(guides[0]).toMatchObject({ atBeat: 8, text: camel.setup[0] });
    // clamped on a tiny hold: the announce still lands before the tail
    const tiny = { ...plainCamel, approxTotalSeconds: 10, sets: 1 };
    const t = buildPoseTrack(tiny, 60, { announceDelayBeats: 40 });
    const announce = t.events.find((e) => e.kind === 'announce')!.atBeat;
    expect(announce).toBeLessThanOrEqual(3);
    // every spacing/tail invariant survives across the whole class
    for (const tr of buildClassTrack(60, 1, { announceDelayBeats: 4 })) {
      const spokenBeats = tr.events.filter((e) => e.kind !== 'warn').map((e) => e.atBeat).sort((a, b) => a - b);
      for (let i = 1; i < spokenBeats.length; i++) {
        expect(spokenBeats[i] - spokenBeats[i - 1], tr.pose.id).toBeGreaterThanOrEqual(4);
      }
      expect(tr.events.find((e) => e.kind === 'announce')!.atBeat).toBeLessThan(tr.totalBeats - 5);
    }
  });
});
