import { describe, expect, it } from 'vitest';
import { poses, getPose } from '../data';
import {
  breathBeats,
  mentionsPhrase,
  poseBarBeats,
  poseGridSeconds,
  quantizeBeats,
  segmentKey,
  segmentPhrase,
} from './grid';

const pose = (id: string) => getPose(id)!;

describe('breath grid', () => {
  it('takes the bar from the posture override, else the user', () => {
    expect(poseBarBeats(pose('pranayama'), 4)).toBe(6); // holds its six-count
    expect(poseBarBeats(pose('kapalbhati'), 6)).toBe(1); // pulses
    expect(poseBarBeats(pose('camel'), 4)).toBe(4);
    expect(poseBarBeats(pose('camel'))).toBe(6);
  });

  it('never lets a posture mix bar lengths', () => {
    for (const p of poses) {
      const overrides = new Set((p.segments ?? []).map((s) => s.pacer?.beatsPerBar ?? null));
      expect(overrides.size, p.id).toBeLessThanOrEqual(1);
    }
  });

  it('counts a breath as two bars, or one beat in pulse mode', () => {
    expect(breathBeats(6)).toBe(12);
    expect(breathBeats(4)).toBe(8);
    expect(breathBeats(1)).toBe(1);
  });

  it('rounds to whole breaths, never fewer than one', () => {
    expect(quantizeBeats(80, 12)).toBe(84);
    expect(quantizeBeats(60, 12)).toBe(60);
    expect(quantizeBeats(20, 12)).toBe(24);
    expect(quantizeBeats(10, 12)).toBe(12);
    expect(quantizeBeats(2, 12)).toBe(12);
    expect(quantizeBeats(90, 1)).toBe(90);
  });

  it('sums a posture on the grid', () => {
    // half moon: 80 60 40 60 35 30 20 35 → 84 60 36 60 36 36 24 36
    expect(poseGridSeconds(pose('half-moon'))).toBe(372);
    expect(poseGridSeconds(pose('kapalbhati'))).toBe(pose('kapalbhati').approxTotalSeconds);
    expect(poseGridSeconds({ ...pose('camel'), segments: undefined })).toBe(132);
  });

  it('reads what a segment is about', () => {
    expect(segmentKey('Second set — right leg')).toBe('right leg');
    expect(segmentPhrase('Second set — right leg')).toBe('leg');
    expect(segmentPhrase('First set — both knees')).toBe('knees');
    expect(segmentPhrase('First set — hands to feet')).toBe('hands to feet');
    expect(segmentPhrase('First set')).toBe('');
    expect(segmentPhrase('Right side')).toBe('side');
  });

  it('matches teaching lines to phrases, with the wordings the lines use', () => {
    expect(mentionsPhrase('In the backbend, the head goes back first', 'backbend')).toBe(true);
    expect(mentionsPhrase('Finally fold forward and take hold of the heels', 'hands to feet')).toBe(true);
    expect(mentionsPhrase('Both knees locked throughout', 'backbend')).toBe(false);
    expect(mentionsPhrase('lift the right leg', 'legs')).toBe(false);
    expect(mentionsPhrase('lift both legs', 'legs')).toBe(true);
    expect(mentionsPhrase('anything', '')).toBe(false);
  });
});
