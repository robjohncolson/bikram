import { describe, expect, it } from 'vitest';
import { poses, getPose } from '../data';
import { mapSteps, stageForStep, stageScore } from './stagematch';
import { climaxStage } from './figure';

const labelsOf = (id: string) => getPose(id)!.motion!.stages.map((s) => s.label);
const mapped = (id: string) => {
  const p = getPose(id)!;
  const labels = labelsOf(id);
  return mapSteps(p.setup, labels, 0, climaxStage(p.motion!)).map((i) => (i === undefined ? '—' : labels[i]));
};

describe('stage matching', () => {
  it('scores label words the steps actually say', () => {
    expect(stageScore('bend the elbows down toward the calf', 'Elbows down')).toBe(1);
    expect(stageScore('curl the forehead toward the knee', 'Head to knee')).toBe(1);
    expect(stageScore('Raise both arms overhead and press the palms together', 'Arms up')).toBe(1);
    expect(stageScore('Fix your gaze on one point ahead', 'Kick out')).toBe(0);
  });

  it('walks a step to the earlier of two stages it names, never backwards', () => {
    const labels = labelsOf('standing-head-to-knee'); // Stand, Hold the foot, Kick out, Elbows down, Head to knee, Release…
    const elbows = labels.indexOf('Elbows down');
    const step = 'bend the elbows down toward the calf, then tuck the chin and curl the forehead toward the knee';
    expect(labels[stageForStep(step, labels, elbows - 1, elbows + 1)!]).toBe('Elbows down');
    expect(labels[stageForStep(step, labels, elbows, elbows + 1)!]).toBe('Head to knee');
    expect(stageForStep('kick the leg out', labels, elbows + 1, elbows + 1)).toBeUndefined();
  });

  it('maps the postures whose walk-in the figure follows', () => {
    // standing sheets open in Tadasana, so the first stage is a place to go
    expect(mapped('half-moon')).toEqual(['Arms up', '—', 'Right side', 'Backbend', 'Hands to feet']);
    expect(mapped('standing-head-to-knee')).toEqual(['—', 'Hold the foot', 'Kick out', 'Elbows down']);
    expect(mapped('balancing-stick')).toEqual(['Arms up', '—', 'Step forward', 'Tip to horizontal', '—']);
    // floor sheets start IN their first stage, so its line moves nothing
    expect(mapped('camel')).toEqual(['—', 'Hands on hips', '—', 'Head back', '—']);
    expect(mapped('cobra').slice(0, 2)).toEqual(['—', 'Hands under shoulders']);
  });

  it('reaches at least one stage in every posture with a walk-in', () => {
    const report: string[] = [];
    for (const p of poses) {
      // breathing exercises and savasana have no stages a step walks into
      if (!p.motion || p.setup.length < 3 || p.category === 'breathing' || p.id === 'savasana') continue;
      const m = mapped(p.id);
      const hit = m.filter((x) => x !== '—').length;
      report.push(`${p.id}: ${m.join(" | ")}`);
      expect(hit, `${p.id}: ${m.join(' | ')}`).toBeGreaterThanOrEqual(1);
    }
  });
});
