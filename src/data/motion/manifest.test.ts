import { describe, expect, it } from 'vitest';
import { motionManifest } from './manifest';
import { bridgeFor, motionUrls } from './index';
import { poses } from '../poses';
import type { Position } from '../types';

const poseIds = new Set(poses.map((p) => p.id));
const POSITIONS: Position[] = ['standing', 'supine', 'prone', 'kneeling', 'seated'];
/** sprite sheets actually shipped, as `/motion/<id>.png` */
const shipped = new Set(
  Object.keys(import.meta.glob('../../../public/motion/*.png')).map((k) => k.slice(k.lastIndexOf('/motion/'))),
);
/** file stem of an id: `bridge:supine-prone` ships as `bridge.supine-prone.<sha8>.png` */
const stem = (id: string) => id.replace(':', '\\.');
const isBridge = (id: string) => id.startsWith('bridge:');

/**
 * The position changes the full class makes when the figure changes sheet
 * (derived in `pacer/figure.test.ts`, which walks the class and fails on
 * any switch without a bridge).
 */
const CLASS_PAIRS: [Position, Position][] = [
  ['standing', 'supine'],
  ['supine', 'prone'],
  ['prone', 'supine'],
  ['supine', 'kneeling'],
  ['kneeling', 'supine'],
  ['supine', 'seated'],
  ['seated', 'supine'],
  ['seated', 'kneeling'],
];

describe('motion manifest', () => {
  it('names only real postures (or bridges) and ships each sprite in public/', () => {
    for (const [id, m] of Object.entries(motionManifest)) {
      expect(poseIds.has(id) || isBridge(id), `unknown pose id ${id}`).toBe(true);
      expect(m.sprite).toMatch(new RegExp(`^/motion/${stem(id)}\\.[0-9a-f]{8}\\.png$`));
      expect(shipped.has(m.sprite), `missing ${m.sprite}`).toBe(true);
    }
  });

  it('ships every optional layer sheet it names, content-addressed', () => {
    for (const [id, m] of Object.entries(motionManifest)) {
      for (const layer of ['guides', 'ghost'] as const) {
        const url = m[layer];
        if (url === undefined) continue;
        expect(url).toMatch(new RegExp(`^/motion/${stem(id)}\\.${layer}\\.[0-9a-f]{8}\\.png$`));
        expect(shipped.has(url), `missing ${url}`).toBe(true);
      }
    }
  });

  it('keeps every stage inside the sheet, in order, starting at frame 0', () => {
    for (const m of Object.values(motionManifest)) {
      expect(m.frames).toBeGreaterThan(0);
      expect(m.cols).toBeGreaterThan(0);
      expect(m.fps).toBeGreaterThan(0);
      expect(m.stages.length).toBeGreaterThan(0);
      expect(m.stages[0].frame).toBe(0);
      let prev = -1;
      for (const s of m.stages) {
        expect(s.label.trim()).not.toBe('');
        expect(s.frame).toBeGreaterThan(prev);
        expect(s.frame).toBeLessThan(m.frames);
        prev = s.frame;
      }
    }
  });

  it('gives every sheet a start and end position', () => {
    for (const [id, m] of Object.entries(motionManifest)) {
      expect(m.position, `${id} has no position`).toBeDefined();
      expect(POSITIONS).toContain(m.position!.start);
      expect(POSITIONS).toContain(m.position!.end);
    }
  });
});

describe('hand-off bridges', () => {
  it('are named by the positions they join, carry no teaching layers, and stay short', () => {
    for (const [id, m] of Object.entries(motionManifest)) {
      if (!isBridge(id)) continue;
      expect(id).toBe(`bridge:${m.position!.start}-${m.position!.end}`);
      expect(m.position!.start).not.toBe(m.position!.end);
      expect(m.guides).toBeUndefined();
      expect(m.ghost).toBeUndefined();
      expect(m.frames).toBeLessThanOrEqual(40);
    }
  });

  it('covers every position change the class makes', () => {
    for (const [a, b] of CLASS_PAIRS) {
      const m = bridgeFor(a, b);
      expect(m, `bridge:${a}-${b}`).toBeDefined();
      expect(m!.position).toEqual({ start: a, end: b });
    }
    expect(bridgeFor('supine', 'supine')).toBeUndefined();
  });

  it('are precached with the posture sheets', () => {
    const urls = new Set(motionUrls());
    for (const [a, b] of CLASS_PAIRS) expect(urls.has(bridgeFor(a, b)!.sprite)).toBe(true);
  });
});
