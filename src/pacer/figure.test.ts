import { describe, expect, it } from 'vitest';
import { poses, getPose, bridgeFor } from '../data';
import type { PoseMotion } from '../data';
import {
  TRANSITION_FRAMES,
  breathFrame,
  bridgeSteps,
  climaxStage,
  figureFrameAt,
  figurePlan,
  figurePoseAt,
  frameAt,
  frameForPose,
  poseAt,
  planEndMotion,
  pulseFrame,
  segmentTimeline,
  stagesForLabel,
} from './figure';
import { segmentKey } from './grid';
import type { FigureSegment, FrameStep } from './figure';
import { buildClassTrack, buildPoseTrack } from './cues';

const pose = (id: string) => getPose(id)!;
const motion = (id: string) => pose(id).motion!;
const label = (m: PoseMotion, i: number) => m.stages[i].label;
const stagesSeg = (p: ReturnType<typeof pose>, i: number) => {
  const s = figurePlan(p)!.segments[i];
  if (s.kind !== 'stages') throw new Error(`segment ${i} of ${p.id} is ${s.kind}`);
  return s;
};

describe('segmentKey', () => {
  it('strips the set prefix and bare set labels', () => {
    expect(segmentKey('Second set — right leg')).toBe('right leg');
    expect(segmentKey('First set')).toBe('');
    expect(segmentKey('Twenty-second savasana')).toBe('twenty-second savasana');
  });
});

describe('stagesForLabel', () => {
  it('lands on the deepest stage of a side, walking through its setup stages', () => {
    const m = motion('standing-separate-leg-head-to-knee'); // Arms up, Face the right foot, Head to knee, Rise, Left side, Rise
    expect(stagesForLabel(m, 'First set — right side', 0).map((i) => label(m, i))).toEqual(['Head to knee']);
    expect(stagesForLabel(m, 'First set — left side', 2).map((i) => label(m, i))).toEqual(['Left side']);
  });

  it('reads an unnamed right side as everything before the first left stage', () => {
    const m = motion('standing-head-to-knee'); // … Elbows down, Head to knee, Release, Left side, Release
    expect(stagesForLabel(m, 'First set — right leg', 0).map((i) => label(m, i))).toEqual(['Head to knee']);
    const bs = motion('balancing-stick');
    expect(stagesForLabel(bs, 'Second set — right foot forward', 4).map((i) => label(bs, i))).toEqual([
      'Tip to horizontal',
    ]);
  });

  it('picks named stages, both-sides stages and the climax for bare sets', () => {
    const hm = motion('half-moon');
    expect(stagesForLabel(hm, 'Second set — backbend', 3).map((i) => label(hm, i))).toEqual(['Backbend']);
    expect(stagesForLabel(hm, 'First set — hands to feet', 5).map((i) => label(hm, i))).toEqual(['Hands to feet']);
    const aw = motion('awkward');
    expect(stagesForLabel(aw, 'Second set — part two', 4).map((i) => label(aw, i))).toEqual(['Part two']);
    const hk = motion('head-to-knee-stretching');
    expect(stagesForLabel(hk, 'First set — stretching', 2).map((i) => label(hk, i))).toEqual(['Both legs']);
    const cobra = motion('cobra');
    expect(stagesForLabel(cobra, 'Second set', 2).map((i) => label(cobra, i))).toEqual(['Lift']);
    expect(label(motion('camel'), climaxStage(motion('camel')))).toBe('Heels in hand');
  });

  it('walks every side for "all three parts"', () => {
    const m = motion('locust');
    expect(stagesForLabel(m, 'Second set — all three parts', 4).map((i) => label(m, i))).toEqual([
      'Right leg',
      'Left leg',
      'Both legs',
    ]);
  });
});

describe('figurePlan', () => {
  it('compiles every posture with a sheet, one figure segment per class segment', () => {
    for (const p of poses) {
      if (!p.motion) continue;
      const plan = figurePlan(p);
      expect(plan, p.id).toBeDefined();
      expect(plan!.segments.length).toBe(p.segments?.length ?? 1);
      for (const s of plan!.segments) {
        if (s.kind === 'stages') {
          expect(s.targets.length).toBeGreaterThan(0);
          for (const i of s.targets) expect(s.motion.stages[i], `${p.id}: ${s.motion.sprite}`).toBeDefined();
        }
      }
    }
  });

  it('never leaves a working segment on a neutral stage', () => {
    for (const p of poses) {
      const plan = figurePlan(p);
      if (!plan) continue;
      for (const s of plan.segments) {
        if (s.kind !== 'stages') continue;
        const last = s.motion.stages[s.targets[s.targets.length - 1]].label;
        expect(last, `${p.id}`).not.toMatch(/^(release|centre|rise|lower|change|stand)$/i);
      }
    }
  });

  it('uses prone sheets for belly rests and preserves supine rests and sit-ups', () => {
    for (const p of poses) {
      const plan = figurePlan(p)!;
      p.segments?.forEach((seg, i) => {
        if (seg.kind !== 'rest') return;
        const rest = stagesSeg(p, i);
        if (seg.orientation === 'prone') {
          expect(rest.motion.position?.start).toBe('prone');
          expect(rest.targets).toEqual([0]);
          expect(label(rest.motion, 0)).toBe('Lie prone');
          const clock = { seconds: 29, total: 30, beatProgress: 0 };
          expect(figureFrameAt(rest, clock).frame).toBe(rest.motion.stages[0].frame);
          expect(figurePoseAt(rest, clock)).toMatchObject({ from: 0, to: 0 });
        } else {
          expect(rest.motion).toBe(motion('savasana'));
        }
      });
      expect(plan.segments).toHaveLength(p.segments!.length);
    }
    const situp = stagesSeg(pose('bow'), 4);
    expect(situp.motion).toBe(motion('situp'));
    expect(situp.targets).toEqual([0, 1, 2, 3]);
    const second = stagesSeg(pose('cobra'), 2);
    expect(label(second.motion, second.from)).toBe('Lie prone');
    // a same-sheet second set continues from where the first set left off
    const hm = stagesSeg(pose('half-moon'), 4);
    expect(label(hm.motion, hm.from)).toBe('Hands to feet');
    expect(label(hm.motion, hm.targets[0])).toBe('Right side');
    expect(figurePlan(pose('cobra'))!.segments.length).toBe(4);
  });

  it('follows the breath in Pranayama and pulses in Kapalbhati', () => {
    const pr = figurePlan(pose('pranayama'))!.segments[0];
    expect(pr.kind).toBe('breath');
    if (pr.kind === 'breath') {
      expect(label(pr.motion, pr.inhale)).toBe('Inhale');
      expect(label(pr.motion, pr.exhale)).toBe('Exhale');
      expect(pr.inhale).toBeGreaterThan(pr.exhale); // the second inhale: its entry comes from an exhale
    }
    const kb = figurePlan(pose('kapalbhati'))!.segments[1];
    expect(kb.kind).toBe('pulse');
    if (kb.kind === 'pulse') expect(kb.to - kb.from).toBe(12); // one cycle = one second at 12 fps
  });

  it('gives a segment-less posture one segment to its climax', () => {
    const plan = figurePlan({ ...pose('savasana'), segments: undefined })!;
    expect(plan.segments).toHaveLength(1);
    const s = plan.segments[0];
    expect(s.kind === 'stages' && label(s.motion, s.targets[0])).toBe('Stillness');
  });
});

describe('segmentTimeline', () => {
  it('plays the entry at sheet speed, holds setups briefly, then holds the target to the end', () => {
    const shk = pose('standing-head-to-knee');
    const seg = stagesSeg(shk, 0); // from Stand → Hold the foot → … → Head to knee, 70 s
    const steps = segmentTimeline(seg, 70);
    const m = seg.motion;
    const at = (l: string) => m.stages[m.stages.findIndex((s) => s.label === l)].frame;
    // starts moving straight away: first steps are transition frames, 1/fps apart
    expect(steps[0].until).toBeCloseTo(1 / m.fps, 5);
    // setup holds are 12% of the slice = 8.4 s, capped at 8
    const holdFoot = steps.find((s) => s.frame === at('Hold the foot'))!;
    const before = steps[steps.indexOf(holdFoot) - 1];
    expect(holdFoot.until - before.until).toBeCloseTo(8, 5);
    // the target holds out the segment
    const last = steps[steps.length - 1];
    expect(last.frame).toBe(at('Head to knee'));
    expect(last.until).toBe(70);
    expect(frameAt(steps, 69)).toBe(at('Head to knee'));
    expect(frameAt(steps, 999)).toBe(at('Head to knee'));
    // and before the first transition frame we are on its first frame
    expect(frameAt(steps, 0)).toBe(Math.max(1, at('Lock the knee') - TRANSITION_FRAMES));
  });

  it('cuts across the sheet end and shares time evenly between several targets', () => {
    const hm = stagesSeg(pose('half-moon'), 4); // Hands to feet → Rise → Stand → (cut) Stand → Arms up → Right side, 36 s
    const hmSteps = segmentTimeline(hm, 36);
    const hmM = hm.motion;
    const armsUp = hmM.stages.findIndex((s) => s.label === 'Arms up');
    const rightSide = hmM.stages.findIndex((s) => s.label === 'Right side');
    // the cut lands in Tadasana, Arms up is held as a setup, then the bend
    expect(hmSteps.some((s) => s.frame === hmM.stages[armsUp].frame)).toBe(true);
    expect(hmSteps.some((s) => s.frame === hmM.frames - 1)).toBe(false); // no path back through the sheet's tail
    expect(hmSteps[hmSteps.length - 1]).toEqual({ motion: hmM, frame: hmM.stages[rightSide].frame, until: 36 });
    const cobra = pose('cobra');
    const second = stagesSeg(cobra, 2); // Lie prone → Hands under shoulders → Lift, 20 s
    const steps = segmentTimeline(second, 20);
    expect(steps.some((s) => s.frame === second.motion.stages[1].frame)).toBe(true); // hands held as a setup
    expect(steps[steps.length - 1].until).toBe(20);
    const situp = stagesSeg(pose('bow'), 4);
    const st = segmentTimeline(situp, 12);
    const m = situp.motion;
    // each of the four stages ends its slice at a multiple of 3 s
    for (let i = 0; i < 4; i++) {
      expect(frameAt(st, i * 3 + 2.9)).toBe(m.stages[i].frame);
    }
  });

  it('scales setup holds down inside a short slice', () => {
    const shk = pose('standing-head-to-knee');
    const seg = stagesSeg(shk, 2); // second set right leg, 30 s, three setups
    const steps = segmentTimeline(seg, 30);
    const m = seg.motion;
    const headToKnee = steps.find((s) => s.frame === m.stages[m.stages.findIndex((x) => x.label === 'Head to knee')].frame)!;
    // setup (holds + transitions) never eats more than 60% of the slice
    expect(steps[steps.indexOf(headToKnee) - 1].until).toBeLessThanOrEqual(18.001);
  });
});

describe('spoken walk-in moves', () => {
  it('moves the figure to each stage as its line ends, then settles into the hold', () => {
    const hm = pose('half-moon');
    const track = buildPoseTrack(hm, 60);
    const clip = () => 2; // every line takes two seconds
    const plan = figurePlan(hm, { track, beatSeconds: 1, leadBeats: track.barBeats, clipSeconds: clip })!;
    const seg = plan.segments[0];
    expect(seg.kind).toBe('stages');
    if (seg.kind !== 'stages') return;
    const m = seg.motion;
    const stage = (l: string) => m.stages.findIndex((s) => s.label === l);
    expect(label(m, seg.from)).toBe('Stand');
    expect(seg.moves).toBeDefined();
    // the walk-in lines that name stages: "arms up" (bar 1), "bend to the right" (bar 3)
    const byStage = new Map(seg.moves!.map((mv) => [label(m, mv.stage), mv.seconds]));
    expect(byStage.get('Arms up')).toBe(6 + track.barBeats + 2);
    expect(byStage.get('Right side')).toBe(18 + track.barBeats + 2);
    const seconds = track.spans[0].endBeat - track.spans[0].startBeat;
    const steps = segmentTimeline(seg, seconds);
    // Tadasana until the first line has been said, then the arms rise
    expect(frameAt(steps, 5)).toBe(m.stages[stage('Stand')].frame);
    expect(frameAt(steps, 6 + track.barBeats + 2 + 3)).toBe(m.stages[stage('Arms up')].frame);
    // the elbows line squeezed the arms in; bent to the right only after its own line
    expect(frameAt(steps, 18 + track.barBeats)).toBe(m.stages[stage('Squeeze the arms')].frame);
    expect(frameAt(steps, 18 + track.barBeats + 2 + 3)).toBe(m.stages[stage('Right side')].frame);
    expect(frameAt(steps, seconds - 1)).toBe(m.stages[stage('Right side')].frame);
  });

  it('settles to the target after the last line when no line names it', () => {
    const shk = pose('standing-head-to-knee');
    const track = buildPoseTrack(shk, 60);
    const plan = figurePlan(shk, { track, beatSeconds: 1, leadBeats: track.barBeats, clipSeconds: () => 3 })!;
    const seg = plan.segments[0];
    if (seg.kind !== 'stages') throw new Error('stages expected');
    const m = seg.motion;
    const target = m.stages[seg.targets[0]];
    expect(target.label).toBe('Head to knee');
    expect(seg.moves!.map((mv) => label(m, mv.stage))).not.toContain('Head to knee');
    const seconds = track.spans[0].endBeat - track.spans[0].startBeat;
    const steps = segmentTimeline(seg, seconds);
    // the last line ("…slowly curl the forehead…") is a slow move, so the
    // elbows travel spans it; the knee follows 1.5 s after the travel ends
    const last = seg.moves![seg.moves!.length - 1];
    expect(last.over).toBeGreaterThanOrEqual(2.5);
    expect(frameAt(steps, seg.settle! - 1)).not.toBe(target.frame);
    expect(frameAt(steps, last.seconds + last.over! + 1.5 + 2)).toBe(target.frame);
  });

  it('moves at the tempo the line asks for', () => {
    const clip = () => 3;
    // "lower in slow motion": starts as the line starts, spans it and more
    const awkward = pose('awkward');
    const at = buildPoseTrack(awkward, 60);
    const aplan = figurePlan(awkward, { track: at, beatSeconds: 1, leadBeats: at.barBeats, clipSeconds: clip })!;
    const partThree = aplan.segments[2];
    if (partThree.kind !== 'stages') throw new Error('stages expected');
    const slow = partThree.moves!.find((mv) => label(partThree.motion, mv.stage) === 'Part three')!;
    const line = at.events.find((e) => e.text === awkward.setup[4])!;
    expect(slow.seconds).toBe(line.atBeat - at.spans[2].startBeat + at.barBeats); // line start
    expect(slow.over).toBe(4.5);
    // "in one motion, tip": a snap after the line
    const stick = pose('balancing-stick');
    const st = buildPoseTrack(stick, 60);
    const splan = figurePlan(stick, { track: st, beatSeconds: 1, leadBeats: st.barBeats, clipSeconds: clip })!;
    const s0 = splan.segments[0];
    if (s0.kind !== 'stages') throw new Error('stages expected');
    const tip = s0.moves!.find((mv) => label(s0.motion, mv.stage) === 'Tip to horizontal')!;
    expect(tip.over).toBe(0.35);
    // "inhale and curl the chest up": waits for an inhale, rides its first half
    const cobra = pose('cobra');
    const ct = buildPoseTrack(cobra, 60);
    const cplan = figurePlan(cobra, { track: ct, beatSeconds: 1, leadBeats: ct.barBeats, clipSeconds: clip })!;
    const c0 = cplan.segments[0];
    if (c0.kind !== 'stages') throw new Error('stages expected');
    const lift = c0.moves!.find((mv) => label(c0.motion, mv.stage) === 'Lift')!;
    expect((lift.seconds - ct.barBeats) % ct.breathBeats).toBe(0);
    expect(lift.over).toBe(ct.barBeats * 0.5);
  });

  it('leaves second sets and borrowed sheets to the segment-fraction entry', () => {
    const cobra = pose('cobra');
    const track = buildPoseTrack(cobra, 60);
    const plan = figurePlan(cobra, { track, beatSeconds: 1, leadBeats: 6, clipSeconds: () => 2 })!;
    expect((plan.segments[1] as { moves?: unknown }).moves).toBeUndefined(); // prone rest
    expect((plan.segments[2] as { moves?: unknown }).moves).toBeUndefined(); // second set: no walk-in
    expect((plan.segments[3] as { moves?: unknown }).moves).toBeUndefined(); // prone rest
  });
});

describe('breath and pulse frames', () => {
  const pr = figurePlan(pose('pranayama'))!.segments[0] as Extract<FigureSegment, { kind: 'breath' }>;
  const kb = figurePlan(pose('kapalbhati'))!.segments[0] as Extract<FigureSegment, { kind: 'pulse' }>;

  it('scrubs the transition into the phase and rests on its hold', () => {
    const m = pr.motion;
    expect(breathFrame(pr, 'inhale', 0)).toBe(m.stages[pr.inhale].frame - TRANSITION_FRAMES);
    expect(breathFrame(pr, 'inhale', 1)).toBe(m.stages[pr.inhale].frame);
    expect(breathFrame(pr, 'exhale', 1)).toBe(m.stages[pr.exhale].frame);
    expect(breathFrame(pr, undefined, 0.5)).toBe(m.stages[pr.inhale].frame);
    // monotone through the phase
    let prev = -1;
    for (let p = 0; p <= 1; p += 0.05) {
      const f = breathFrame(pr, 'exhale', p);
      expect(f).toBeGreaterThanOrEqual(prev);
      prev = f;
    }
  });

  it('pumps on the beat and returns before the next', () => {
    expect(pulseFrame(kb, 0)).toBe(kb.from);
    expect(pulseFrame(kb, 0.5)).toBe(kb.from + 6);
    expect(pulseFrame(kb, 1)).toBe(kb.to - 1);
  });

  it('dispatches on segment kind', () => {
    expect(figureFrameAt(kb, { seconds: 3, total: 90, beatProgress: 0 })).toEqual({ motion: kb.motion, frame: kb.from });
    expect(
      figureFrameAt(pr, { seconds: 3, total: 150, beatProgress: 0, breath: { phase: 'exhale', progress: 1 } }).frame,
    ).toBe(pr.motion.stages[pr.exhale].frame);
  });
});

describe('hand-off bridges', () => {
  const bridge = (s: FigureSegment) => s.bridge?.position && `${s.bridge.position.start}-${s.bridge.position.end}`;

  it('bridges onto the belly and stays prone through Cobra rests and its second set', () => {
    const cobra = pose('cobra');
    const plan = figurePlan(cobra, { previous: motion('situp') })!;
    expect(plan.segments.map(bridge)).toEqual(['supine-prone', undefined, undefined, undefined]);
    expect(plan.segments[0].bridge).toBe(bridgeFor('supine', 'prone'));
    // without a previous sheet the first segment has nothing to bridge from
    expect(figurePlan(cobra)!.segments[0].bridge).toBeUndefined();
  });

  it('lays toe stand down into savasana, and leaves standing to standing alone', () => {
    const sv = figurePlan(pose('savasana'), { previous: planEndMotion(pose('toe-stand')) })!;
    expect(bridge(sv.segments[0])).toBe('standing-supine');
    const hm = figurePlan(pose('half-moon'), { previous: planEndMotion(pose('pranayama')) })!;
    expect(hm.segments.every((s) => s.bridge === undefined)).toBe(true);
  });

  it('releases the held stage, plays the bridge, then the segment', () => {
    const bow = pose('bow');
    const rest = stagesSeg(bow, 3);
    const b = rest.bridge!;
    const m = bow.motion!;
    // The final Bow set lowers before rolling onto the back.
    expect(rest.bridgeFrom).toEqual({ motion: m, stage: m.stages.findIndex((s) => s.label === 'Kick up') });
    const steps = segmentTimeline(rest, 20);
    const release = steps.filter((s) => s.motion === m);
    expect(release.length).toBeGreaterThan(0);
    expect(steps.slice(0, release.length).every((s) => s.motion === m)).toBe(true);
    // then every bridge frame at the bridge's fps
    const releaseBridgeFrames = steps.slice(release.length, release.length + b.frames);
    releaseBridgeFrames.forEach((s, f) => expect(s).toMatchObject({ motion: b, frame: f }));
    const start = releaseBridgeFrames[releaseBridgeFrames.length - 1].until;
    expect(figureFrameAt(rest, { seconds: start - 0.01, total: 20, beatProgress: 0 }, steps).motion).toBe(b);
    expect(figureFrameAt(rest, { seconds: start, total: 20, beatProgress: 0 }, steps).motion).toBe(rest.motion);
    expect(steps[steps.length - 1].until).toBe(20);
  });

  it("starts a posture's first bridge where its figure clock is first shown (one bar in)", () => {
    const cobra = pose('cobra');
    const track = buildPoseTrack(cobra, 60);
    const lead = track.barBeats;
    const plan = figurePlan(cobra, { track, beatSeconds: 1, leadBeats: lead, clipSeconds: () => 2, previous: motion('situp') })!;
    const seg = plan.segments[0];
    if (seg.kind !== 'stages') throw new Error('stages expected');
    expect(seg.bridgeAt).toBe(lead);
    const b = seg.bridge!;
    const seconds = track.spans[0].endBeat - track.spans[0].startBeat + lead;
    const steps = segmentTimeline(seg, seconds);
    expect(figureFrameAt(seg, { seconds: lead, total: seconds, beatProgress: 0 }, steps)).toEqual({ motion: b, frame: 0 });
    const end = lead + b.frames / b.fps;
    expect(figureFrameAt(seg, { seconds: end, total: seconds, beatProgress: 0 }, steps).motion).toBe(seg.motion);
    // no own-sheet move is drawn before the bridge is done
    const firstOwn = steps.findIndex((s) => s.motion === seg.motion);
    expect(steps[firstOwn - 1].until).toBeCloseTo(end, 6);
  });

  it('bridges every position change in the full class (the needed pairs)', () => {
    const pairs = new Set<string>();
    let previous: PoseMotion | undefined;
    for (const tr of buildClassTrack(60)) {
      const plan = figurePlan(tr.pose, { track: tr, beatSeconds: 1, leadBeats: tr.barBeats, previous });
      if (!plan) continue;
      let last = previous;
      for (const s of plan.segments) {
        const from = last?.position?.end;
        const to = s.motion.position?.start;
        expect(from === undefined || to !== undefined, `${tr.pose.id}: ${s.motion.sprite} has no position`).toBe(true);
        if (from && to && from !== to) {
          expect(s.bridge, `${tr.pose.id}: ${from} → ${to}`).toBeDefined();
          expect(s.bridge!.position).toEqual({ start: from, end: to });
          pairs.add(`${from}-${to}`);
        } else {
          expect(s.bridge, `${tr.pose.id}: no change, no bridge`).toBeUndefined();
        }
        last = s.motion;
      }
      previous = last;
    }
    // (the kneeling sets' rests are the kneeling-supine uses inside the class)
    expect([...pairs].sort()).toEqual(
      [
        'kneeling-supine',
        'prone-supine',
        'seated-kneeling',
        'seated-supine',
        'standing-supine',
        'supine-kneeling',
        'supine-prone',
        'supine-seated',
      ].sort(),
    );
    expect(bridgeFor('kneeling', 'supine')).toBeDefined(); // Kapalbhati → the closing savasana
  });
});

describe('continuous poses for the live rig', () => {
  /** the travels of a timeline, in order, each with its hop steps */
  const travels = (steps: FrameStep[]) => {
    const out: { blend: NonNullable<FrameStep['blend']>; steps: FrameStep[] }[] = [];
    for (const s of steps) {
      if (!s.blend) continue;
      const last = out[out.length - 1];
      if (last && last.blend === s.blend) last.steps.push(s);
      else out.push({ blend: s.blend, steps: [s] });
    }
    return out;
  };

  it('gives every hop step of a staged timeline its travel, and t runs 0 → 1 across each', () => {
    const seg = stagesSeg(pose('standing-head-to-knee'), 0);
    const steps = segmentTimeline(seg, 70);
    const m = seg.motion;
    const hops = steps.filter((s) => !m.stages.some((st) => st.frame === s.frame));
    // exactly the hop steps carry a blend: holds never do
    for (const s of steps) expect(Boolean(s.blend), `frame ${s.frame}`).toBe(hops.includes(s));
    const ts = travels(steps);
    expect(ts.length).toBeGreaterThan(1);
    for (const { blend, steps: hs } of ts) {
      expect(blend.to).toBe(blend.from + 1);
      // the travel's frames lead up to the `to` stage's hold
      expect(hs[hs.length - 1].frame).toBe(m.stages[blend.to].frame - 1);
      const end = hs[hs.length - 1].until;
      expect(poseAt(steps, blend.start)!.t).toBeCloseTo(0, 9);
      const mid = poseAt(steps, (blend.start + end) / 2)!;
      expect(mid).toMatchObject({ motion: m, from: blend.from, to: blend.to });
      expect(mid.t).toBeCloseTo(0.5, 9);
      let prev = -1;
      for (let x = blend.start; x < end; x += (end - blend.start) / 17) {
        const p = poseAt(steps, x)!;
        expect(p.t).toBeGreaterThanOrEqual(prev);
        prev = p.t;
      }
      // the moment it arrives: the `to` stage's hold, or the next travel out of it
      const after = poseAt(steps, end)!;
      expect(after.from === after.to ? after.to : after.from).toBe(blend.to);
    }
  });

  it('holds with from === to', () => {
    const seg = stagesSeg(pose('standing-head-to-knee'), 0);
    const steps = segmentTimeline(seg, 70);
    const target = seg.targets[0];
    expect(poseAt(steps, 69)).toEqual({ motion: seg.motion, from: target, to: target, t: 1 });
    expect(poseAt(steps, 999)).toEqual({ motion: seg.motion, from: target, to: target, t: 1 });
  });

  it('walks the half moon spoken entry through the same stages as the sprite', () => {
    const hm = pose('half-moon');
    const track = buildPoseTrack(hm, 60);
    const plan = figurePlan(hm, { track, beatSeconds: 1, leadBeats: track.barBeats, clipSeconds: () => 2 })!;
    const seg = plan.segments[0];
    if (seg.kind !== 'stages') throw new Error('stages expected');
    const m = seg.motion;
    const seconds = track.spans[0].endBeat - track.spans[0].startBeat;
    const steps = segmentTimeline(seg, seconds);
    const spriteStages: number[] = [];
    const rigStages: number[] = [];
    const push = (arr: number[], k: number) => {
      if (arr[arr.length - 1] !== k) arr.push(k);
    };
    for (let x = 0; x < seconds; x += 0.05) {
      const k = m.stages.findIndex((st) => st.frame === frameAt(steps, x));
      if (k >= 0) push(spriteStages, k);
      const p = poseAt(steps, x)!;
      if (p.from === p.to) push(rigStages, p.to);
    }
    expect(rigStages).toEqual(spriteStages);
    expect(rigStages.map((k) => label(m, k))).toEqual(['Stand', 'Arms up', 'Squeeze the arms', 'Right side']);
  });

  it('blends the cut back to stage 0 for the rig, leaving the sprite frames unchanged', () => {
    const m = motion('half-moon');
    const last = m.stages.length - 1;
    const seg: Extract<FigureSegment, { kind: 'stages' }> = { kind: 'stages', motion: m, from: last, targets: [0] };
    const steps = segmentTimeline(seg, 20);
    const marker = steps.findIndex((s) => s.cut);
    expect(marker).toBeGreaterThanOrEqual(0);
    expect(steps[marker]).toMatchObject({ frame: m.stages[0].frame, cut: { from: last, seconds: TRANSITION_FRAMES / m.fps } });
    // the sprite: a cut, straight onto stage 0's first frame
    for (const x of [0, 0.3, 0.6, 5, 19.9]) expect(frameAt(steps, x)).toBe(m.stages[0].frame);
    // the rig: last stage → 0 over the marker's window, then the hold
    const w = TRANSITION_FRAMES / m.fps;
    expect(poseAt(steps, 0)).toEqual({ motion: m, from: last, to: 0, t: 0 });
    expect(poseAt(steps, w / 2)).toEqual({ motion: m, from: last, to: 0, t: 0.5 });
    expect(poseAt(steps, w)).toEqual({ motion: m, from: 0, to: 0, t: 1 });
    // an entry through the cut keeps its sprite frames: the marker adds no time
    const hm = stagesSeg(pose('half-moon'), 4);
    const hmSteps = segmentTimeline(hm, 36);
    const shown = hmSteps.filter((s) => !s.cut);
    expect(hmSteps.some((s) => s.cut)).toBe(true);
    for (let x = 0; x < 36; x += 0.1) expect(frameAt(hmSteps, x)).toBe(frameAt(shown, x));
  });

  it('wraps through stage 0 into a following travel: last → 0 → 1, t continuous', () => {
    const m = motion('half-moon');
    const last = m.stages.length - 1;
    const armsUp = m.stages.findIndex((st) => st.label === 'Arms up');
    expect(armsUp).toBe(1);
    // Stand (stage 0) is neutral, so no hold: the marker is followed at once by the hops into 1
    const seg: Extract<FigureSegment, { kind: 'stages' }> = { kind: 'stages', motion: m, from: last, targets: [armsUp] };
    const steps = segmentTimeline(seg, 20);
    const marker = steps.findIndex((x) => x.cut);
    expect(steps[marker + 1].blend).toMatchObject({ from: 0, to: 1, start: steps[marker].until });
    // the sprite schedule is untouched by the marker
    const shown = steps.filter((x) => !x.cut);
    for (let x = 0; x < 20; x += 0.05) expect(frameAt(steps, x)).toBe(frameAt(shown, x));
    // the rig: (last → 0) then (0 → 1) then the hold, never skipping the wrap
    const seq: string[] = [];
    let prev: { from: number; to: number; t: number } | undefined;
    for (let x = 0; x < 20; x += 0.01) {
      const p = poseAt(steps, x)!;
      const key = `${p.from}>${p.to}`;
      if (seq[seq.length - 1] !== key) {
        // continuity at each hand-over: the old leg arrived, the new one leaves from where it arrived
        if (prev) {
          const arrived = prev.from === prev.to ? prev.to : prev.t > 0.98 ? prev.to : undefined;
          expect(arrived, `${seq[seq.length - 1]} → ${key}`).toBe(p.from);
          if (p.from !== p.to) expect(p.t).toBeLessThan(0.02);
        }
        seq.push(key);
      }
      prev = p;
    }
    expect(seq).toEqual([`${last}>0`, '0>1', '1>1']);
    // the wrap takes its window (TRANSITION_FRAMES/fps) out of the travel, or half the travel when that is shorter
    const start = steps[marker].until;
    const travelEnd = steps.filter((x) => x.blend === steps[marker + 1].blend).at(-1)!.until;
    const wrap = Math.min(TRANSITION_FRAMES / m.fps, (travelEnd - start) / 2);
    expect(poseAt(steps, start + wrap / 2)).toMatchObject({ from: last, to: 0 });
    expect(poseAt(steps, start + wrap / 2)!.t).toBeCloseTo(0.5, 9);
    expect(poseAt(steps, start + wrap)).toMatchObject({ from: 0, to: 1, t: 0 });
    expect(poseAt(steps, (start + wrap + travelEnd) / 2)!.t).toBeCloseTo(0.5, 9);
  });

  it('hands a rig pose back to the nearest sprite frame', () => {
    const m = motion('half-moon');
    const last = m.stages.length - 1;
    expect(frameForPose(m, 3, 3, 1)).toBe(m.stages[3].frame);
    expect(frameForPose(m, 2, 3, 0)).toBe(m.stages[2].frame);
    expect(frameForPose(m, 2, 3, 1)).toBe(m.stages[3].frame);
    // mid-travel: a hop frame strictly between the two holds, advancing with t
    const f1 = frameForPose(m, 2, 3, 0.2);
    const f2 = frameForPose(m, 2, 3, 0.8);
    expect(f1).toBeGreaterThan(m.stages[2].frame);
    expect(f2).toBeLessThan(m.stages[3].frame);
    expect(f2).toBeGreaterThan(f1);
    // the wrap: whichever side is nearer
    expect(frameForPose(m, last, 0, 0.3)).toBe(m.stages[last].frame);
    expect(frameForPose(m, last, 0, 0.7)).toBe(m.stages[0].frame);
  });

  it('breathes and pulses at progress 0 / 0.5 / 1', () => {
    const pr = figurePlan(pose('pranayama'))!.segments[0] as Extract<FigureSegment, { kind: 'breath' }>;
    const kb = figurePlan(pose('kapalbhati'))!.segments[0] as Extract<FigureSegment, { kind: 'pulse' }>;
    const at = (seg: FigureSegment, breath?: { phase: 'inhale' | 'exhale'; progress: number }, beatProgress = 0) =>
      figurePoseAt(seg, { seconds: 3, total: 150, beatProgress, breath });
    expect(at(pr, { phase: 'inhale', progress: 0 })).toEqual({ motion: pr.motion, from: pr.exhale, to: pr.inhale, t: 0 });
    expect(at(pr, { phase: 'inhale', progress: 0.5 })).toEqual({ motion: pr.motion, from: pr.exhale, to: pr.inhale, t: 0.5 });
    expect(at(pr, { phase: 'inhale', progress: 1 })).toEqual({ motion: pr.motion, from: pr.exhale, to: pr.inhale, t: 1 });
    expect(at(pr, { phase: 'exhale', progress: 0.5 })).toEqual({ motion: pr.motion, from: pr.inhale, to: pr.exhale, t: 0.5 });
    expect(at(pr, { phase: 'exhale', progress: 1 }).t).toBe(1);
    expect(at(pr)).toEqual({ motion: pr.motion, from: pr.inhale, to: pr.inhale, t: 1 });
    const m = kb.motion;
    const pump = m.stages.findIndex((s) => s.frame === kb.from);
    expect(label(m, pump)).toBe('Pump');
    expect(label(m, pump + 1)).toBe('Release');
    expect(at(kb, undefined, 0)).toEqual({ motion: m, from: pump, to: pump + 1, t: 0 });
    expect(at(kb, undefined, 0.25)).toEqual({ motion: m, from: pump, to: pump + 1, t: 0.5 });
    expect(at(kb, undefined, 0.5)).toEqual({ motion: m, from: pump + 1, to: pump, t: 0 });
    expect(at(kb, undefined, 1)).toEqual({ motion: m, from: pump + 1, to: pump, t: 1 });
  });

  it("blends a bridge's frames between its own stages, and the release before it", () => {
    const rest = stagesSeg(pose('bow'), 3);
    const b = rest.bridge!;
    const { steps, end } = bridgeSteps(rest);
    const own = steps.filter((s) => s.motion === b);
    // every bridge frame between one stage's first frame and the last stage's
    // travels between consecutive stages (the last stage's hold does not)
    const lastMark = b.stages[b.stages.length - 1].frame;
    for (const s of own) {
      const isMark = b.stages.some((st) => st.frame === s.frame);
      if (!isMark && s.frame < lastMark) expect(s.blend, `bridge frame ${s.frame}`).toBeDefined();
      if (s.frame >= lastMark) expect(s.blend).toBeUndefined();
      if (s.blend) expect(s.blend.to).toBe(s.blend.from + 1);
    }
    expect(travels(own).map((x) => x.blend.to)).toEqual(b.stages.slice(1).map((_, i) => i + 1));
    // the release on the Bow sheet (Kick up → Lower) blends too
    const release = steps.filter((s) => s.motion !== b);
    expect(release.length).toBeGreaterThan(0);
    expect(release.every((s) => s.blend)).toBe(true);
    // figurePoseAt follows the bridge while it plays, then the segment's own sheet
    const full = segmentTimeline(rest, 20);
    expect(figurePoseAt(rest, { seconds: end - 0.01, total: 20, beatProgress: 0 }, full).motion).toBe(b);
    expect(figurePoseAt(rest, { seconds: end, total: 20, beatProgress: 0 }, full).motion).toBe(rest.motion);
  });
});

it('pumps twice per beat in the second set and rests during entry and recovery', () => {
  const kapalbhati = pose('kapalbhati');
  const track = buildPoseTrack(kapalbhati, 60);
  for (const beatSeconds of [0.5, 1, 2]) {
    const plan = figurePlan(kapalbhati, { track, beatSeconds, leadBeats: 1 })!;
    const seg = plan.segments[1];
    if (seg.kind !== 'pulse') throw new Error('expected pulse segment');
    const start = track.spans[1].entryBeats * beatSeconds;
    const clock = (beatProgress: number, seconds = start + beatProgress * beatSeconds) => ({
      seconds, total: 100 * beatSeconds, beatProgress,
    });
    expect(figureFrameAt(seg, clock(0)).frame).toBe(seg.from);
    expect(figureFrameAt(seg, clock(0.5)).frame).toBe(seg.from);
    expect(figureFrameAt(seg, clock(0.25)).frame).toBe(figureFrameAt(seg, clock(0.75)).frame);
    expect(figurePoseAt(seg, clock(0.25))).toEqual(figurePoseAt(seg, clock(0.75)));
    expect(figurePoseAt(seg, clock(0))).toEqual(figurePoseAt(seg, clock(0.5)));
    const release = seg.motion.stages.findIndex((s) => s.label === 'Release');
    for (const seconds of [start - beatSeconds, start + 30 * beatSeconds, start + 35 * beatSeconds]) {
      expect(figureFrameAt(seg, clock(0.25, seconds)).frame).toBe(seg.motion.stages[release].frame);
      expect(figurePoseAt(seg, clock(0.25, seconds))).toEqual({ motion: seg.motion, from: release, to: release, t: 1 });
    }
  }
});
