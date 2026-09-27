import { describe, expect, it } from 'vitest';
import {
  announceText,
  buildClassTrack,
  buildPoseTrack,
  coachingMaterial,
  cueWhen,
  lineFitsSegment,
  phaseAtBeat,
  segmentAtBeat,
  walkInSteps,
} from './cues';
import { mentionsPhrase } from './grid';
import { poses } from '../data';

const camel = poses.find((p) => p.id === 'camel')!;
const pranayama = poses[0];
const balancingStick = poses.find((p) => p.id === 'balancing-stick')!;
const halfMoon = poses.find((p) => p.id === 'half-moon')!;
/** camel without authored segments — exercises the fallback set-cue path */
const plainCamel = { ...camel, segments: undefined };

describe('cue sequencer', () => {
  it('announces postures by number and breathing exercises by name', () => {
    expect(announceText(camel, false)).toBe('Posture 22. Camel Pose.');
    expect(announceText(pranayama, false)).toBe('Standing Deep Breathing.');
    expect(announceText(camel, true)).toBe('Posture 22. Camel Pose — Ustrasana.');
  });

  it('opens with the announce, then walks in on the inhales of the first segment', () => {
    const track = buildPoseTrack(camel, 60);
    // 40 20 10 35 20 10 → 36 24 12 36 24 12 on the twelve-count breath
    expect(track.breathBeats).toBe(12);
    expect(track.totalBeats).toBe(144);
    expect(track.events[0]).toMatchObject({ atBeat: 0, kind: 'announce' });
    const guides = track.events.filter((e) => e.kind === 'guide');
    // the first segment is three breaths: two inhales after the announce,
    // so the walk-in keeps the first step and the last (full expression)
    expect(guides[0]).toMatchObject({ atBeat: 12, text: camel.setup[0] });
    expect(guides[1]).toMatchObject({ atBeat: 24, text: camel.setup[4] });
    // the walk-in never crosses the first segment's change cue
    const firstBoundary = track.events.find((e) => e.kind === 'segment')!.atBeat;
    expect(firstBoundary).toBe(30);
    expect(guides[0].atBeat).toBeLessThan(firstBoundary);
    expect(guides[1].atBeat).toBeLessThan(firstBoundary);
  });

  it('lands every change cue on the last exhale of the segment it closes', () => {
    for (const track of buildClassTrack(60)) {
      const cues = track.events.filter((e) => e.kind === 'segment');
      cues.forEach((e, i) => {
        const span = track.spans[i + 1];
        expect(e.atBeat, track.pose.id).toBe(span.startBeat - track.barBeats);
        if (track.barBeats > 1) {
          expect(phaseAtBeat(track, e.atBeat), `${track.pose.id} ${e.text}`).toMatchObject({ phase: 'exhale', beatInBar: 0 });
        }
      });
    }
  });

  it('starts every other spoken line on an inhale', () => {
    for (const track of buildClassTrack(60)) {
      if (track.barBeats <= 1) continue;
      for (const e of track.events) {
        if (e.kind !== 'guide' && e.kind !== 'announce') continue;
        expect(e.atBeat % track.breathBeats, `${track.pose.id}: ${e.text}`).toBe(0);
      }
    }
  });

  it('walks Half Moon in through the segments its steps describe', () => {
    const track = buildPoseTrack(halfMoon, 60);
    const at = (text: string) => track.events.find((e) => e.text === text)?.atBeat;
    const segOf = (beat: number) => segmentAtBeat(track, beat)!.label;
    expect(segOf(at(halfMoon.setup[0])!)).toBe('First set — right side');
    expect(segOf(at(halfMoon.setup[2])!)).toBe('First set — right side');
    expect(segOf(at(halfMoon.setup[3])!)).toBe('First set — backbend');
    expect(segOf(at(halfMoon.setup[4])!)).toBe('First set — hands to feet');
  });

  it('coaches each part of a posture only with lines about it', () => {
    for (const track of buildClassTrack(60)) {
      const phrases = [...new Set(track.spans.map((sp) => sp.phrase))];
      for (const e of track.events) {
        if (e.kind !== 'guide' || !e.text) continue;
        const pos = segmentAtBeat(track, e.atBeat);
        if (!pos) continue;
        const span = track.spans[pos.index];
        expect(lineFitsSegment(e.text, span, phrases), `${track.pose.id} · ${pos.label}: ${e.text}`).toBe(true);
      }
    }
    // the rule itself, on Half Moon's parts
    const hm = buildPoseTrack(halfMoon, 60);
    const backbend = hm.spans.find((sp) => sp.phrase === 'backbend')!;
    const side = hm.spans[0];
    const phrases = [...new Set(hm.spans.map((sp) => sp.phrase))];
    const backLine = halfMoon.cues.find((c) => mentionsPhrase(c, 'backbend'))!;
    expect(lineFitsSegment(backLine, backbend, phrases)).toBe(true);
    expect(lineFitsSegment(backLine, side, phrases)).toBe(false);
    expect(lineFitsSegment('Keep breathing.', side, phrases)).toBe(true);
  });

  it('says where the next cue lands, in words', () => {
    const track = buildPoseTrack(halfMoon, 60);
    // first segment: 84 beats = 7 breaths; a walk-in step opens breath 2
    expect(cueWhen(track, 0)).toBe('next breath, on the inhale');
    // past the last inhale of the segment, only the change cue is left
    const change = track.events.find((e) => e.kind === 'segment')!.atBeat;
    expect(change).toBe(78);
    expect(cueWhen(track, 73)).toBe('last breath, on the exhale');
    expect(cueWhen(track, track.totalBeats - 1)).toBeUndefined();
    const kb = buildPoseTrack(poses.find((p) => p.id === 'kapalbhati')!, 60);
    expect(cueWhen(kb, 0)).toMatch(/end of this set/);
  });

  it('coaches mid-hold in later working segments, never in rests', () => {
    const track = buildPoseTrack(camel, 60);
    const guides = track.events.filter((e) => e.kind === 'guide');
    // at least one coaching line lands after the walk-in's segment
    const material = coachingMaterial(camel);
    const firstBoundary = track.events.find((e) => e.kind === 'segment')!.atBeat;
    const coached = guides.filter((g) => g.atBeat > firstBoundary && material.includes(g.text ?? ''));
    expect(coached.length).toBeGreaterThan(0);
    // rest/situp spans stay silent (only the change cue closing them speaks)
    track.spans.forEach((sp, i) => {
      if (i > 0 && (sp.kind === 'rest' || sp.kind === 'situp')) {
        const inside = guides.filter((g) => g.atBeat >= sp.startBeat && g.atBeat < sp.endBeat);
        expect(inside, `${camel.segments![i].label} should be silent`).toEqual([]);
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

  it('marks the second set on the exhale before its first breath for two-set postures', () => {
    const track = buildPoseTrack(plainCamel, 60);
    const set = track.events.find((e) => e.kind === 'set');
    const breaths = track.totalBeats / track.breathBeats;
    expect(set).toMatchObject({
      atBeat: Math.round(breaths / 2) * track.breathBeats - track.barBeats,
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
    // 60 20 40 → 60 24 36: each cue one bar before its segment begins
    const segCues = track.events.filter((e) => e.kind === 'segment');
    expect(segCues).toEqual([
      { atBeat: 54, kind: 'segment', text: 'Twenty-second savasana.' },
      { atBeat: 78, kind: 'segment', text: 'Second set.' },
    ]);
    // no fallback set events when segments are authored
    expect(track.events.filter((e) => e.kind === 'set')).toHaveLength(0);
    // at half tempo the beats halve, then snap to the breath grid again
    const half = buildPoseTrack(segmented, 30);
    expect(half.spans.map((sp) => sp.endBeat - sp.startBeat)).toEqual([36, 12, 24]);
    expect(half.events.filter((e) => e.kind === 'segment').map((e) => e.atBeat)).toEqual([30, 42]);
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
    expect(segmentAtBeat(track, 0)).toMatchObject({
      index: 0, label: 'First set', beatsLeft: 60, beatsIn: 0, beats: 60,
      breath: 0, breaths: 5, phase: 'inhale', beatInBar: 0, barBeats: 6,
    });
    expect(segmentAtBeat(track, 8)).toMatchObject({ breath: 0, phase: 'exhale', beatInBar: 2 });
    expect(segmentAtBeat(track, 59)).toMatchObject({ index: 0, beatsLeft: 1, breath: 4, phase: 'exhale', beatInBar: 5 });
    expect(segmentAtBeat(track, 60)).toMatchObject({ index: 1, label: 'Savasana', beatsLeft: 24, breaths: 2 });
    expect(segmentAtBeat(track, 119)).toMatchObject({ index: 2, beatsLeft: 1 });
    expect(segmentAtBeat(track, 999)).toMatchObject({ index: 2 });
    expect(segmentAtBeat(buildPoseTrack(plainCamel, 60), 5)).toBeNull();
  });

  it('quantises every segment of every posture to whole breaths', () => {
    for (const track of buildClassTrack(60)) {
      expect(track.totalBeats % track.breathBeats, track.pose.id).toBe(0);
      for (const sp of track.spans) {
        const len = sp.endBeat - sp.startBeat;
        expect(len % track.breathBeats, track.pose.id).toBe(0);
        expect(len).toBeGreaterThanOrEqual(track.breathBeats);
      }
    }
    expect(buildPoseTrack(pranayama, 60).breathBeats).toBe(12); // holds its six-count
    expect(buildPoseTrack(poses.find((p) => p.id === 'kapalbhati')!, 60).breathBeats).toBe(1);
    expect(buildPoseTrack(camel, 60, { beatsPerBar: 4 }).breathBeats).toBe(8);
    expect(buildPoseTrack(camel, 60, { beatsPerBar: 4 }).totalBeats % 8).toBe(0);
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
    const walkInEnd = Math.max(
      ...track.events.filter((e) => e.kind === 'guide' && pranayama.setup.includes(e.text ?? '')).map((e) => e.atBeat),
    );
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
    // 30 s → 36 beats = three breaths: two inhales after the announce
    expect(guides.map((g) => g.text)).toEqual(['one', 'six']);
    expect(guides.map((g) => g.atBeat)).toEqual([12, 24]);
  });

  it('holds the announce back for rehearsal and moves the walk-in with it', () => {
    const track = buildPoseTrack(camel, 60, { announceDelayBeats: 4 });
    expect(track.events.find((e) => e.kind === 'announce')!.atBeat).toBe(4);
    const guides = track.events.filter((e) => e.kind === 'guide');
    expect(guides[0]).toMatchObject({ atBeat: 12, text: camel.setup[0] });
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
