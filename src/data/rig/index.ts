/**
 * The live figure's stage data, one GENERATED JSON per posture or bridge
 * (`scripts/blender/export_rig.py`, `npm run rig:export`). Each file is its
 * own lazy chunk: a posture page or a class only fetches the sheets it
 * draws, and the service worker's runtime cache keeps them offline like
 * every other chunk.
 *
 * Rollout: the sprite stays the default. `RIG_LIVE` postures draw the live
 * rig in class mode; `?figure=rig` forces it everywhere (remembered in
 * `yoga-figure-v1`) and `?figure=sprite` clears that.
 */
import type { RigData } from '../types';

const files = import.meta.glob<RigData>(['./*.json', '!./skeleton.json'], { import: 'default' });

const loaded = new Map<string, RigData>();
const pending = new Map<string, Promise<RigData>>();

/** File stem of an id: `bridge:supine-prone` → `bridge.supine-prone` (no colons on Windows). */
const stemOf = (id: string) => id.replace(':', '.');

/** Whether a rig sheet exists for this id (a posture or `bridge:<a>-<b>`). */
export function hasRigData(id: string): boolean {
  return `./${stemOf(id)}.json` in files;
}

/** The rig sheet for a posture or bridge id, lazily loaded (and kept once loaded). */
export function loadRigData(id: string): Promise<RigData> {
  const done = loaded.get(id);
  if (done) return Promise.resolve(done);
  let p = pending.get(id);
  if (!p) {
    const load = files[`./${stemOf(id)}.json`];
    p = load
      ? load().then((d) => {
          loaded.set(id, d);
          return d;
        })
      : Promise.reject(new Error(`no rig data for ${id}`));
    p.catch(() => pending.delete(id));
    pending.set(id, p);
  }
  return p;
}

/** The sheet if it has already loaded (so a re-render never flashes the fallback). */
export function rigDataIfLoaded(id: string): RigData | undefined {
  return loaded.get(id);
}

/** Every bridge id with rig data (class mode preloads them with the rig on). */
export function rigBridgeIds(): string[] {
  return Object.keys(files)
    .map((k) => k.slice(2, -5))
    .filter((s) => s.startsWith('bridge.'))
    .map((s) => s.replace('.', ':'));
}

/** Postures whose class-mode figure is the live rig by default. */
export const RIG_LIVE: ReadonlySet<string> = new Set(['half-moon']);

const FLAG_KEY = 'yoga-figure-v1';

/** What the `?figure=` override says: the live rig forced everywhere, or nothing. */
export type FigureOverride = 'rig' | undefined;

/**
 * Apply the `?figure=` flag and return the override. The ONLY place with
 * a side effect: `?figure=rig` forces the live figure everywhere and is
 * remembered (`yoga-figure-v1`), `?figure=sprite` forgets it; with no
 * query the remembered choice stands. Views call it once per render,
 * whatever the posture, so a visit to any page sets or clears the flag.
 */
export function applyFigureFlag(search: string | URLSearchParams = ''): FigureOverride {
  const q = typeof search === 'string' ? new URLSearchParams(search) : search;
  const v = q.get('figure');
  try {
    if (v === 'rig') localStorage.setItem(FLAG_KEY, 'rig');
    else if (v === 'sprite') localStorage.removeItem(FLAG_KEY);
    if (v === 'sprite') return undefined;
    return v === 'rig' || localStorage.getItem(FLAG_KEY) === 'rig' ? 'rig' : undefined;
  } catch {
    // storage blocked: the query still counts for this page
    return v === 'rig' ? 'rig' : undefined;
  }
}

/**
 * Which renderer draws a posture's figure — pure, given the override
 * (`applyFigureFlag`). In class mode `RIG_LIVE` postures get the rig; the
 * override gives it to everything, everywhere. Posture pages keep the
 * sprite hero (they show the rig beside it instead — see PoseDetail).
 */
export function figureRenderer(id: string, override: FigureOverride, where: 'class' | 'page' = 'class'): 'sprite' | 'rig' {
  if (!hasRigData(id)) return 'sprite';
  if (override === 'rig') return 'rig';
  return where === 'class' && RIG_LIVE.has(id) ? 'rig' : 'sprite';
}
