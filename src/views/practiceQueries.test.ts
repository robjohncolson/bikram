import { afterEach, describe, expect, it, vi } from 'vitest';
import { pacerQuery, shouldBlockClassNavigation } from '../navigation';
import { FULL_CLASS, SHORT_CLASS } from '../pacer';
import { pacerSelection } from './pacerLifecycle';

afterEach(() => vi.unstubAllGlobals());

describe('practice query changes', () => {
  it('allows query-only navigation during a class but guards departure', () => {
    expect(shouldBlockClassNavigation(true, '/', '/')).toBe(false);
    expect(shouldBlockClassNavigation(true, '/', '/sequence')).toBe(true);
    expect(shouldBlockClassNavigation(false, '/', '/sequence')).toBe(false);
  });

  it('keeps figure flags independent from the selected class', () => {
    expect(pacerQuery('?figure=rig&program=short')).toBe(pacerQuery('?program=short&figure=sprite'));
    expect(pacerQuery('?figure=rig')).toBe(pacerQuery(''));
    expect(pacerQuery('?from=4')).not.toBe(pacerQuery(''));
  });

  it('applies selection and reset links only while idle', () => {
    expect(pacerSelection('?program=short')).toEqual({ program: SHORT_CLASS, startIdx: 0 });
    expect(pacerSelection('?program=short&from=4')).toEqual({ program: FULL_CLASS, startIdx: 3 });
    expect(pacerSelection('')).toEqual({ program: FULL_CLASS, startIdx: 0 });
    for (const phase of ['running', 'paused', 'closing', 'done']) {
      for (const query of ['', '?program=short', '?from=4']) {
        expect(pacerSelection(query, undefined, phase)).toBeUndefined();
      }
    }
    expect(pacerSelection('?from=999')?.startIdx).toBe(0);
  });

  it('does not save a build until idle, then makes it the selected coach program', () => {
    const storage = { getItem: vi.fn(() => null), setItem: vi.fn() };
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('window', { localStorage: storage });
    const query = `?build=${encodeURIComponent(btoa(JSON.stringify({
      name: 'A shorter class', blurb: 'A calm practice.', items: SHORT_CLASS.items,
      reasons: Object.fromEntries(SHORT_CLASS.items.map((item) => [item.order, 'A steady practice.'])),
    })))}`;
    for (const phase of ['running', 'paused', 'closing', 'done']) {
      expect(pacerSelection(query, undefined, phase)).toBeUndefined();
    }
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(pacerSelection(query)?.program.id).toBe('coach');
    expect(storage.setItem).toHaveBeenCalled();
  });
});
