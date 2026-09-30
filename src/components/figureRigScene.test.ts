import { describe, expect, it } from 'vitest';
import { teachingLayerChanged } from './figureRigScene';

describe('teaching layer redraws', () => {
  const content = {};
  const key = [content, 'view', 'color'];

  it.each(['ghost', 'guides'])('clears an absent %s after a skeleton rebuild resets its cache', () => {
    expect(teachingLayerChanged(undefined, undefined, true)).toBe(true);
  });

  it('redraws present layers on rebuild even when their keys match', () => {
    expect(teachingLayerChanged(key, [...key], true)).toBe(true);
    expect(teachingLayerChanged(undefined, key, true)).toBe(true);
  });

  it('clears a removed layer once and leaves unchanged layers cached', () => {
    expect(teachingLayerChanged(key, undefined, false)).toBe(true);
    expect(teachingLayerChanged(undefined, undefined, false)).toBe(false);
    expect(teachingLayerChanged(key, [...key], false)).toBe(false);
  });

  it('redraws when content, camera or color changes', () => {
    expect(teachingLayerChanged(undefined, key, false)).toBe(true);
    for (let i = 0; i < key.length; i++) {
      const changed = [...key];
      changed[i] = {};
      expect(teachingLayerChanged(key, changed, false)).toBe(true);
    }
  });
});
