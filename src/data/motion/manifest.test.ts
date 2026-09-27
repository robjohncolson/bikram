import { describe, expect, it } from 'vitest';
import { motionManifest } from './manifest';
import { poses } from '../poses';

const poseIds = new Set(poses.map((p) => p.id));
/** sprite sheets actually shipped, as `/motion/<id>.png` */
const shipped = new Set(
  Object.keys(import.meta.glob('../../../public/motion/*.png')).map((k) => k.slice(k.lastIndexOf('/motion/'))),
);

describe('motion manifest', () => {
  it('names only real postures and ships each sprite in public/', () => {
    for (const [id, m] of Object.entries(motionManifest)) {
      expect(poseIds.has(id), `unknown pose id ${id}`).toBe(true);
      expect(m.sprite).toMatch(new RegExp(`^/motion/${id}\\.[0-9a-f]{8}\\.png$`));
      expect(shipped.has(m.sprite), `missing ${m.sprite}`).toBe(true);
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
});
