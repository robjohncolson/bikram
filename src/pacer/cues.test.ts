import { describe, expect, it } from 'vitest';
import {
  announceText,
  buildClassTrack,
  buildPoseTrack,
  coachingMaterial,
  cueLayer,
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

it('keeps later-part walk-ins out of the first segment of every track', () => {
  for (const track of buildClassTrack(60)) {
    const firstWalkIn = track.events.filter((e) => e.kind === 'guide' && !e.layer && e.atBeat < track.spans[0].endBeat);
    for (const event of firstWalkIn) {
      expect(event.text, track.pose.id).not.toMatch(/for the (?:final|backbend) part|after the left side|^(?:on|for) the (?:second|other|left) side|^part (?:two|three)/i);
    }
  }
  for (const id of ['locust', 'wind-removing']) {
    const pose = poses.find((p) => p.id === id)!;
    const track = buildPoseTrack(pose, 60);
    const tail = track.events.find((e) => e.text === pose.setup.at(-1));
    expect(tail, id).toBeDefined();
    expect(segmentAtBeat(track, tail!.atBeat)?.index, id).toBe(2);
  }
});
const halfMoon = poses.find((p) => p.id === 'half-moon')!;
/** camel without authored segments — exercises the fallback set-cue path */
const plainCamel = { ...camel, segments: undefined };

describe('cue sequencer', () => {
  it('announces postures by number and breathing exercises by name', () => {
    expect(announceText(camel, false)).toBe('Posture 22. Camel Pose.');
    expect(announceText(pranayama, false)).toBe('Standing Deep Breathing.');
    expect(announceText(camel, true)).toBe('Posture 22. Camel Pose — Ustrasana.');
  });

  it('opens with the announce, walks in one line a bar, then holds the authored time', () => {
    const track = buildPoseTrack(camel, 60);
    expect(track.breathBeats).toBe(12);
    // first set: the announce + five steps = six lines, one a bar = three
    // breaths of entry, THEN the authored 40 s (36 on the grid)
    expect(track.spans[0]).toMatchObject({ startBeat: 0, endBeat: 72, entryBeats: 36 });
    expect(track.events[0]).toMatchObject({ atBeat: 0, kind: 'announce' });
    const guides = track.events.filter((e) => e.kind === 'guide');
    camel.setup.forEach((step, i) => expect(guides[i]).toMatchObject({ atBeat: 6 + i * 6, text: step }));
    // the change cue closes the hold, not the walk-in
    const firstBoundary = track.events.find((e) => e.kind === 'segment')!.atBeat;
    expect(firstBoundary).toBe(66);
    // the second set gets one breath to get back in; rests and sit-ups none
    expect(track.spans.map((sp) => sp.entryBeats)).toEqual([36, 0, 0, 12, 0, 0]);
    expect(track.totalBeats).toBe(192);
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

  it('starts walk-in lines on a bar and every other spoken line on an inhale', () => {
    for (const track of buildClassTrack(60)) {
      if (track.barBeats <= 1) continue;
      for (const e of track.events) {
        if (e.kind !== 'guide' && e.kind !== 'announce') continue;
        const walkIn = e.kind === 'guide' && track.pose.setup.includes(e.text ?? '');
        if (walkIn) {
          expect(e.atBeat % track.barBeats, `${track.pose.id}: ${e.text}`).toBe(0);
          // and inside its segment's entry
          const sp = track.spans.find((x) => e.atBeat >= x.startBeat && e.atBeat < x.endBeat)!;
          expect(e.atBeat, `${track.pose.id}: ${e.text}`).toBeLessThan(sp.startBeat + sp.entryBeats);
        } else {
          expect(e.atBeat % track.breathBeats, `${track.pose.id}: ${e.text}`).toBe(0);
        }
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

  it('speaks a step that opens with "on the second side" on the left side', () => {
    const eagle = poses.find((p) => p.id === 'eagle')!;
    const track = buildPoseTrack(eagle, 60);
    const line = eagle.setup.find((s) => /^on the second side/i.test(s))!;
    const ev = track.events.find((e) => e.text === line)!;
    expect(segmentAtBeat(track, ev.atBeat)!.label).toBe('First set — left side');
    expect(segmentAtBeat(track, ev.atBeat)!.entering).toBe(true);
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
    // first segment: two breaths of entry, then 84 beats of hold; the first
    // walk-in line comes on the exhale of the announce's breath
    expect(cueWhen(track, 0)).toBe('this breath, on the exhale');
    // past the last inhale of the segment, only the change cue is left
    const change = track.events.find((e) => e.kind === 'segment')!.atBeat;
    expect(change).toBe(102);
    expect(cueWhen(track, 97)).toBe('last breath, on the exhale');
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
    // 60 20 40 → (36 entry + 60) 24 (12 entry + 36): each cue one bar before its segment
    expect(track.spans.map((sp) => sp.endBeat - sp.startBeat)).toEqual([96, 24, 48]);
    const segCues = track.events.filter((e) => e.kind === 'segment');
    expect(segCues).toEqual([
      { atBeat: 90, kind: 'segment', text: 'Twenty-second savasana.' },
      { atBeat: 114, kind: 'segment', text: 'Second set.' },
    ]);
    // no fallback set events when segments are authored
    expect(track.events.filter((e) => e.kind === 'set')).toHaveLength(0);
    // at half tempo the hold beats halve, then snap to the breath grid again
    const half = buildPoseTrack(segmented, 30);
    expect(half.spans.map((sp) => sp.endBeat - sp.startBeat)).toEqual([72, 12, 36]);
    expect(half.events.filter((e) => e.kind === 'segment').map((e) => e.atBeat)).toEqual([66, 78]);
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
      index: 0, label: 'First set', beatsLeft: 96, beatsIn: 0, beats: 96,
      breath: 0, breaths: 8, phase: 'inhale', beatInBar: 0, barBeats: 6, entering: true,
    });
    expect(segmentAtBeat(track, 8)).toMatchObject({ breath: 0, phase: 'exhale', beatInBar: 2 });
    expect(segmentAtBeat(track, 36)).toMatchObject({ breath: 3, entering: false });
    expect(segmentAtBeat(track, 95)).toMatchObject({ index: 0, beatsLeft: 1, breath: 7, phase: 'exhale', beatInBar: 5 });
    expect(segmentAtBeat(track, 96)).toMatchObject({ index: 1, label: 'Savasana', beatsLeft: 24, breaths: 2, entering: false });
    expect(segmentAtBeat(track, 167)).toMatchObject({ index: 2, beatsLeft: 1 });
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
    // the entry is sized to the steps, so a first set always fits them all
    const many = {
      ...camel,
      approxTotalSeconds: 60,
      setup: ['one', 'two', 'three', 'four', 'five', 'six'],
      segments: [
        { kind: 'set' as const, label: 'First set', cue: 'First set.', seconds: 30 },
        { kind: 'set' as const, label: 'Second set', cue: 'Second set.', seconds: 30 },
      ],
    };
    const track = buildPoseTrack(many, 60);
    const guides = track.events.filter((e) => e.kind === 'guide' && many.setup.includes(e.text ?? ''));
    expect(guides.map((g) => g.text)).toEqual(many.setup);
    expect(guides.map((g) => g.atBeat)).toEqual([6, 12, 18, 24, 30, 36]);
    expect(track.spans[0].entryBeats).toBe(48); // seven lines → four breaths
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
    expect(announce).toBeLessThanOrEqual(t.totalBeats - t.breathBeats); // a whole breath still follows it
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

describe('cueLayer', () => {
  const cobra = poses.find((p) => p.id === 'cobra')!;
  const line = (p: typeof cobra, start: string) => p.cues.find((c) => c.startsWith(start))!;

  it('lights the ghost for a line that names the mistake', () => {
    expect(cueLayer(line(cobra, 'Elbows stay bent'))).toBe('ghost'); // "do not press up into straight arms"
    expect(cueLayer(line(halfMoon, 'Both knees locked'))).toBe('ghost'); // "not the arms or hips"
    expect(cueLayer("Don't let the hips drop.")).toBe('ghost');
    expect(cueLayer('Lift the chest instead of the chin.')).toBe('ghost');
  });

  it('lights the guides for any other coaching line', () => {
    expect(cueLayer(line(cobra, 'Roll the shoulders down'))).toBe('guides');
    expect(cueLayer(line(halfMoon, 'Keep the body in one flat plane'))).toBe('guides');
  });

  it('matches whole words only and lights nothing for empty text', () => {
    expect(cueLayer('Keep the knot of the belly firm and stopwatch-steady.')).toBe('guides');
    expect(cueLayer('')).toBeUndefined();
    expect(cueLayer('   ')).toBeUndefined();
  });

  it('tags every coaching event with its layer and no walk-in or announce', () => {
    for (const tr of buildClassTrack(60)) {
      const coaching = new Set([...tr.pose.cues, tr.pose.breath]);
      for (const e of tr.events) {
        const isCoaching = e.kind === 'guide' && e.text !== undefined && coaching.has(e.text) && !tr.pose.setup.includes(e.text);
        if (isCoaching) expect(e.layer, `${tr.pose.id}: ${e.text}`).toBe(cueLayer(e.text!));
        else expect(e.layer, `${tr.pose.id}: ${e.kind} ${e.text ?? ''}`).toBeUndefined();
      }
    }
  });
});
