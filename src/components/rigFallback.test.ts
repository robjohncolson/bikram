import { describe, expect, it, vi } from 'vitest';
import { RigBoundary } from './RigBoundary';
import { holdUntilLoaded, rigShows, rigStatusAfter } from './rigFallback';

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

  describe('the class figure never moves onto a sheet that has not loaded', () => {
    type Shown = { sheet?: string; pose: string };
    /** a sheet store with loads that resolve only when the test says so */
    function slowStore() {
      const loaded = new Set<string>();
      const pending = new Map<string, () => void>();
      return {
        isLoaded: (id: string) => loaded.has(id),
        load(id: string): Promise<void> {
          if (loaded.has(id)) return Promise.resolve();
          return new Promise<void>((resolve) => pending.set(id, () => (loaded.add(id), resolve())));
        },
        resolve(id: string) {
          pending.get(id)?.();
          pending.delete(id);
        },
        loadedNow: (id: string) => void loaded.add(id),
      };
    }

    it('holds the current rig pose through an early skip until the destination sheet resolves', async () => {
      const store = slowStore();
      store.loadedNow('pranayama');
      // the renderer PoseMotion ends up with for a shown figure: WebGL has
      // started (`ready`), so the rig shows exactly when its sheet is there
      const renderer = (s: Shown) => (rigShows('ready', s.sheet ? store.isLoaded(s.sheet) : false) ? 'rig' : 'sprite');
      const seen: string[] = [];
      let prev: Shown | undefined;
      const frame = (next: Shown) => {
        prev = holdUntilLoaded(prev, next, store.isLoaded);
        seen.push(renderer(prev));
        return prev;
      };
      // the class starts on a loaded sheet
      expect(frame({ sheet: 'pranayama', pose: 'p@1' })).toEqual({ sheet: 'pranayama', pose: 'p@1' });
      // an early Next: the half-moon sheet is still on the way (a delayed promise)
      const arriving = store.load('half-moon');
      for (let t = 0; t < 5; t++) expect(frame({ sheet: 'half-moon', pose: `h@${t}` }).pose).toBe('p@1'); // held
      // and a second skip before it lands: still held on the last pose drawn
      const arriving2 = store.load('awkward');
      expect(frame({ sheet: 'awkward', pose: 'a@0' }).pose).toBe('p@1');
      store.resolve('awkward');
      await arriving2;
      expect(frame({ sheet: 'awkward', pose: 'a@1' })).toEqual({ sheet: 'awkward', pose: 'a@1' }); // moves on arrival
      store.resolve('half-moon');
      await arriving;
      // a hand-off bridge whose sheet is late holds the same way
      void store.load('bridge:standing-supine');
      expect(frame({ sheet: 'bridge:standing-supine', pose: 'b@0' }).pose).toBe('a@1');
      store.resolve('bridge:standing-supine');
      expect(frame({ sheet: 'bridge:standing-supine', pose: 'b@1' }).pose).toBe('b@1');
      // the renderer never became the sprite after the start
      expect(seen.every((r) => r === 'rig')).toBe(true);
    });

    it('passes through what it cannot hold: the class opening, and a figure withheld in rehearsal', () => {
      const none = () => false;
      // nothing drawn yet: the first sheet passes (the figure's own loading covers it)
      expect(holdUntilLoaded(undefined, { sheet: 'cobra', pose: 'c' }, none)).toEqual({ sheet: 'cobra', pose: 'c' });
      // no sheet wanted (rehearsal withholds the posture): nothing to wait for
      const prev: Shown = { sheet: 'cobra', pose: 'c' };
      expect(holdUntilLoaded(prev, { pose: 'hidden' }, (id) => id === 'cobra')).toEqual({ pose: 'hidden' });
    });
  });
});
