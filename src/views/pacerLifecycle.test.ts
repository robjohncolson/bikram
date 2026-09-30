import { expect, it } from 'vitest';
import { getPose } from '../data';
import { figureFrameAt, figurePlan } from '../pacer/figure';
import { keepPausedPulseFrame } from './pacerLifecycle';

it('refreshes paused figures when skipping into, out of, and back into Kapalbhati', () => {
  let previous: { poseId: string; segment: number } | undefined;
  let frame;
  for (const poseId of ['spine-twisting', 'kapalbhati', 'spine-twisting', 'kapalbhati']) {
    const segment = figurePlan(getPose(poseId)!)!.segments[0];
    const fresh = figureFrameAt(segment, { seconds: 0, total: 60, beatProgress: 0 });
    if (!keepPausedPulseFrame(true, segment.kind, poseId, 0, previous)) frame = fresh;
    expect(frame).toEqual(fresh);
    previous = { poseId, segment: 0 };
  }
});

it('freezes only the same paused pulse posture and segment', () => {
  const previous = { poseId: 'kapalbhati', segment: 1 };
  expect(keepPausedPulseFrame(true, 'pulse', 'kapalbhati', 1, previous)).toBe(true);
  expect(keepPausedPulseFrame(true, 'pulse', 'kapalbhati', 0, previous)).toBe(false);
  expect(keepPausedPulseFrame(false, 'pulse', 'kapalbhati', 1, previous)).toBe(false);
  expect(keepPausedPulseFrame(true, 'pulse', 'kapalbhati', 1)).toBe(false);
});
