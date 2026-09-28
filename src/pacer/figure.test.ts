import { describe, expect, it } from 'vitest';
import { poses, getPose } from '../data';
import type { PoseMotion } from '../data';
import {
  TRANSITION_FRAMES,
  breathFrame,
  climaxStage,
  figureFrameAt,
  figurePlan,
  frameAt,
  pulseFrame,
  segmentTimeline,
  stagesForLabel,
} from './figure';
import { segmentKey } from './grid';
import type { FigureSegment } from './figure';
import { buildPoseTrack } from './cues';

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
    expect(label(motion('camel'), climaxStage(motion('camel')))).toBe('Hold the heels');
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

  it('sends rests to the savasana sheet and sit-ups through the whole sit-up sheet', () => {
    const cobra = pose('cobra'); // First set, savasana, sit-up, Second set, savasana, sit-up
    const plan = figurePlan(cobra)!;
    const rest = stagesSeg(cobra, 1);
    expect(rest.motion).toBe(motion('savasana'));
    expect(label(rest.motion, rest.targets[0])).toBe('Stillness');
    const situp = stagesSeg(cobra, 2);
    expect(situp.motion).toBe(motion('situp'));
    expect(situp.targets).toEqual([0, 1, 2, 3]);
    // after lying down and sitting up, the second set re-enters from the start
    const second = stagesSeg(cobra, 3);
    expect(second.motion).toBe(cobra.motion);
    expect(label(second.motion, second.from)).toBe('Lie prone');
    // a same-sheet second set continues from where the first set left off
    const hm = stagesSeg(pose('half-moon'), 4);
    expect(label(hm.motion, hm.from)).toBe('Hands to feet');
    expect(label(hm.motion, hm.targets[0])).toBe('Right side');
    expect(plan.segments.length).toBe(6);
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
    expect(frameAt(steps, 0)).toBe(Math.max(1, at('Hold the foot') - TRANSITION_FRAMES));
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
    expect(hmSteps[hmSteps.length - 1]).toEqual({ frame: hmM.stages[rightSide].frame, until: 36 });
    const cobra = pose('cobra');
    const second = stagesSeg(cobra, 3); // Lie prone → Hands under shoulders → Lift, 20 s
    const steps = segmentTimeline(second, 20);
    expect(steps.some((s) => s.frame === second.motion.stages[1].frame)).toBe(true); // hands held as a setup
    expect(steps[steps.length - 1].until).toBe(20);
    const situp = stagesSeg(cobra, 2);
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
    // the walk-in lines that name stages: "arms up" (breath 2), "bend to the right" (breath 4)
    const byStage = new Map(seg.moves!.map((mv) => [label(m, mv.stage), mv.seconds]));
    expect(byStage.get('Arms up')).toBe(12 + track.barBeats + 2);
    expect(byStage.get('Right side')).toBe(36 + track.barBeats + 2);
    const seconds = track.spans[0].endBeat - track.spans[0].startBeat;
    const steps = segmentTimeline(seg, seconds);
    // Tadasana until the first line has been said, then the arms rise
    expect(frameAt(steps, 5)).toBe(m.stages[stage('Stand')].frame);
    expect(frameAt(steps, 12 + track.barBeats + 2 + 3)).toBe(m.stages[stage('Arms up')].frame);
    // still arms up while the elbows line is said; bent to the right after its line
    expect(frameAt(steps, 36 + track.barBeats)).toBe(m.stages[stage('Arms up')].frame);
    expect(frameAt(steps, 36 + track.barBeats + 2 + 3)).toBe(m.stages[stage('Right side')].frame);
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
    expect(frameAt(steps, seg.settle! + 1)).not.toBe(target.frame);
    expect(frameAt(steps, seg.settle! + 1.5 + 2)).toBe(target.frame);
  });

  it('leaves second sets and borrowed sheets to the segment-fraction entry', () => {
    const cobra = pose('cobra');
    const track = buildPoseTrack(cobra, 60);
    const plan = figurePlan(cobra, { track, beatSeconds: 1, leadBeats: 6, clipSeconds: () => 2 })!;
    expect((plan.segments[1] as { moves?: unknown }).moves).toBeUndefined(); // savasana sheet
    expect((plan.segments[2] as { moves?: unknown }).moves).toBeUndefined(); // sit-up sheet
    expect((plan.segments[3] as { moves?: unknown }).moves).toBeUndefined(); // second set: no walk-in
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
    expect(figureFrameAt(kb, { seconds: 3, total: 90, beatProgress: 0 })).toBe(kb.from);
    expect(
      figureFrameAt(pr, { seconds: 3, total: 150, beatProgress: 0, breath: { phase: 'exhale', progress: 1 } }),
    ).toBe(pr.motion.stages[pr.exhale].frame);
  });
});
