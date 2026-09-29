import { describe, expect, it, vi } from 'vitest';
import { RigBoundary } from './RigBoundary';
import { rigShows, rigStatusAfter } from './rigFallback';

describe('live figure fallback', () => {
  it('a rejected lazy chunk is caught by the boundary and reported as unavailable', async () => {
    // what React does with a lazy component whose import rejects: the
    // error reaches the nearest boundary through these two hooks
    const onFail = vi.fn();
    const boundary = new RigBoundary({ onFail, children: 'rig' });
    const rejected = await Promise.reject(new Error('Failed to fetch dynamically imported module')).catch((e: unknown) => e);
    expect(rejected).toBeInstanceOf(Error);
    boundary.state = { ...boundary.state, ...RigBoundary.getDerivedStateFromError() };
    boundary.componentDidCatch();
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(boundary.render()).toBeNull();
    // and the fallback path picks the sprite, for good
    let status = rigStatusAfter('loading', 'failed');
    expect(rigShows(status, true)).toBe(false);
    status = rigStatusAfter(status, 'ready');
    expect(status).toBe('failed');
    expect(rigShows(status, true)).toBe(false);
  });

  it('passes its children through until something fails', () => {
    const boundary = new RigBoundary({ onFail: () => {}, children: 'rig' });
    expect(boundary.render()).toBe('rig');
  });

  it('shows the rig only once it has drawn AND has its sheet', () => {
    expect(rigShows('loading', true)).toBe(false);
    expect(rigShows(rigStatusAfter('loading', 'ready'), false)).toBe(false);
    expect(rigShows(rigStatusAfter('loading', 'ready'), true)).toBe(true);
    // a failure after it was showing hands back to the sprite
    expect(rigShows(rigStatusAfter('ready', 'failed'), true)).toBe(false);
  });
});
