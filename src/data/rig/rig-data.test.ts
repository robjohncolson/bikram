import { afterEach, describe, expect, it, vi } from 'vitest';
import { motionManifest } from '../motion/manifest';
import type { Position, RigData, RigGuide, RigStagePose } from '../types';
import { RIG_LIVE, applyFigureFlag, figureRenderer, hasRigData, loadRigData, rigBridgeIds } from './index';
import skeleton from './skeleton.json';

const sheets = import.meta.glob<RigData>(['./*.json', '!./skeleton.json'], { eager: true, import: 'default' });
const byId = new Map(Object.values(sheets).map((d) => [d.id, d]));
const BONES = new Set(skeleton.BONES.map((b) => b[0] as string));
const POSITIONS: Position[] = ['standing', 'supine', 'prone', 'kneeling', 'seated'];
const isVec = (v: unknown) => Array.isArray(v) && v.length === 3 && v.every((c) => typeof c === 'number' && Number.isFinite(c));

function checkPose(where: string, pose: RigStagePose) {
  for (const [k, v] of Object.entries(pose)) {
    if (k === 'pelvis.location') {
      expect(isVec(v), `${where}: pelvis.location`).toBe(true);
      continue;
    }
    expect(BONES.has(k), `${where}: unknown bone ${k}`).toBe(true);
    const ok = isVec(v) || (typeof v === 'object' && v !== null && !Array.isArray(v) && isVec(v.dir) && (v.roll === undefined || typeof v.roll === 'number'));
    expect(ok, `${where}: ${k}`).toBe(true);
  }
}

function wellFormed(g: RigGuide): boolean {
  if ('plane' in g) {
    return (
      (g.plane === 'x' || g.plane === 'y') &&
      typeof g.at === 'number' &&
      (g.z === undefined || (g.z.length === 2 && g.z[0] < g.z[1])) &&
      (g.w === undefined || g.w > 0)
    );
  }
  return isVec(g.from) && isVec(g.to);
}

describe('rig data (exported from the Blender posture modules)', () => {
  it('has one sheet per manifest entry, describing the same stages in the same order', () => {
    for (const [id, m] of Object.entries(motionManifest)) {
      const d = byId.get(id);
      expect(d, `no rig data for ${id}`).toBeDefined();
      expect(d!.stages.map((s) => s.label), id).toEqual(m.stages.map((s) => s.label));
      expect(d!.position, id).toEqual(m.position);
      expect(hasRigData(id)).toBe(true);
    }
  });

  it('names only known bones, well-formed guides and valid positions', () => {
    for (const d of byId.values()) {
      expect(POSITIONS).toContain(d.position.start);
      expect(POSITIONS).toContain(d.position.end);
      expect(d.transition).toBeGreaterThan(0);
      d.stages.forEach((st, i) => {
        const where = `${d.id} #${i} ${st.label}`;
        expect(st.hold, where).toBeGreaterThan(0);
        checkPose(where, st.pose);
        if (st.ghost) checkPose(`${where} ghost`, st.ghost);
        for (const g of st.guides ?? []) expect(wellFormed(g), `${where}: guide ${JSON.stringify(g)}`).toBe(true);
      });
    }
  });

  it('matches the sprite frame layout (holds and transitions add up to the sheet)', () => {
    for (const [id, m] of Object.entries(motionManifest)) {
      const d = byId.get(id)!;
      let frame = 0;
      d.stages.forEach((st, i) => {
        expect(m.stages[i].frame, `${id} ${st.label}`).toBe(frame);
        frame += st.hold - 1 + (i < d.stages.length - 1 ? d.transition : 1);
      });
      expect(frame, id).toBe(m.frames);
    }
  });

  it('loads a sheet by id (a bridge by its colon id) and lists the bridges', async () => {
    expect((await loadRigData('half-moon')).id).toBe('half-moon');
    expect((await loadRigData('bridge:supine-prone')).position).toEqual({ start: 'supine', end: 'prone' });
    await expect(loadRigData('nope')).rejects.toThrow();
    expect(rigBridgeIds().sort()).toEqual(Object.keys(motionManifest).filter((k) => k.startsWith('bridge:')).sort());
  });

  it('rolls the live figure out behind a flag (figureRenderer is pure)', () => {
    expect(RIG_LIVE.has('half-moon')).toBe(true);
    expect(figureRenderer('half-moon', undefined, 'class')).toBe('rig');
    expect(figureRenderer('half-moon', undefined, 'page')).toBe('sprite');
    expect(figureRenderer('cobra', undefined, 'class')).toBe('sprite');
    expect(figureRenderer('cobra', 'rig', 'page')).toBe('rig');
    expect(figureRenderer('nope', 'rig')).toBe('sprite');
  });

  describe('applyFigureFlag', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });
    const memoryStorage = () => {
      const m = new Map<string, string>();
      return {
        getItem: (k: string) => m.get(k) ?? null,
        setItem: (k: string, v: string) => void m.set(k, String(v)),
        removeItem: (k: string) => void m.delete(k),
      };
    };

    it('sets the flag from a RIG_LIVE page and clears it again, for every posture', () => {
      vi.stubGlobal('localStorage', memoryStorage());
      // visiting half moon (RIG_LIVE) with ?figure=rig remembers it…
      expect(applyFigureFlag('?figure=rig')).toBe('rig');
      // …so a later plain visit to a non-live posture gets the rig
      expect(figureRenderer('cobra', applyFigureFlag(''), 'page')).toBe('rig');
      expect(figureRenderer('cobra', applyFigureFlag(''), 'class')).toBe('rig');
      // ?figure=sprite on half moon forgets it
      expect(applyFigureFlag('?figure=sprite')).toBeUndefined();
      expect(figureRenderer('cobra', applyFigureFlag(''), 'class')).toBe('sprite');
      expect(figureRenderer('half-moon', applyFigureFlag(''), 'class')).toBe('rig'); // RIG_LIVE still
    });

    it('still honours the query when storage is blocked', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
        removeItem: () => {
          throw new Error('blocked');
        },
      });
      expect(applyFigureFlag('?figure=rig')).toBe('rig');
      expect(applyFigureFlag('')).toBeUndefined();
    });
  });
});
