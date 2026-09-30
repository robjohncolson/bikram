import { describe, expect, it } from 'vitest';
import { classOffsetSeconds, getNeighbors, getPoseByOrder, poses } from './index';

describe('sequence access', () => {
  it('resolves neighbors and offsets for copies by id', () => {
    let offset = 0;
    for (const [i, pose] of poses.entries()) {
      expect(getNeighbors({ ...pose })).toEqual({ prev: poses[i - 1], next: poses[i + 1] });
      expect(classOffsetSeconds({ ...pose })).toBe(offset);
      expect(getPoseByOrder(pose.order)).toBe(pose);
      offset += pose.approxTotalSeconds;
    }
  });

  it('does not invent a position for an unknown id', () => {
    const missing = { ...poses[0], id: 'missing' };
    expect(getNeighbors(missing)).toEqual({});
    expect(() => classOffsetSeconds(missing)).toThrow('Unknown pose');
    expect(getPoseByOrder(0)).toBeUndefined();
  });

  it('keeps Sanskrit names distinct and free of bracketed answers', () => {
    expect(new Set(poses.map((p) => p.sanskritName)).size).toBe(poses.length);
    for (const pose of poses) expect(pose.sanskritName).not.toMatch(/[()[\]]/);
  });
});
