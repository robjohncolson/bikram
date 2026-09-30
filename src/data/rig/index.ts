/**
 * The live figure's stage data, one GENERATED JSON per posture or bridge
 * (`scripts/blender/export_rig.py`, `npm run rig:export`). Each file is its
 * own lazy chunk: a posture page or a class only fetches the sheets it
 * draws, and the service worker's runtime cache keeps them offline like
 * every other chunk.
 *
 * Rollout: every posture with rig data is `RIG_LIVE` — the class draws the
 * live rig throughout (never a mix of renderers between postures), and a
 * posture page shows the sprite and the live figure side by side.
 * `?figure=rig` forces the rig everywhere (remembered in `yoga-figure-v1`)
 * and `?figure=sprite` clears that.
 */
import type { RigData } from '../types';

const files = import.meta.glob<RigData>(['./*.json', '!./skeleton.json'], { import: 'default' });
// the posture library (`library:<id>`): its own folder, so the 26 & 2's
// globs here (RIG_LIVE, the bridges) never see it; each file its own chunk
const libraryFiles = import.meta.glob<RigData>('./library/*.json', { import: 'default' });

const loaded = new Map<string, RigData>();
const pending = new Map<string, Promise<RigData>>();

/** File stem of an id: `bridge:supine-prone` → `bridge.supine-prone` (no colons on Windows). */
const stemOf = (id: string) => id.replace(':', '.');

const LIBRARY = 'library:';

/** The lazy loader of an id's sheet, if there is one. */
function loaderOf(id: string): (() => Promise<RigData>) | undefined {
  return id.startsWith(LIBRARY) ? libraryFiles[`./library/${id.slice(LIBRARY.length)}.json`] : files[`./${stemOf(id)}.json`];
}

/** Whether a rig sheet exists for this id (a posture, `bridge:<a>-<b>` or `library:<id>`). */
export function hasRigData(id: string): boolean {
  return loaderOf(id) !== undefined;
}

/** The rig sheet for a posture, bridge or library id, lazily loaded (and kept once loaded). */
export function loadRigData(id: string): Promise<RigData> {
  const done = loaded.get(id);
  if (done) return Promise.resolve(done);
  let p = pending.get(id);
  if (!p) {
    const load = loaderOf(id);
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

/**
 * Start loading these sheets and resolve once every one has settled (a
 * sheet that fails is left to the figure's own fallback). Class mode starts
 * this for the whole program and every bridge as soon as the pacer
 * page opens, so a skip rarely has to wait — and when it does, the class
 * figure holds its pose until the sheet arrives (`holdUntilLoaded`).
 */
export function preloadRigData(ids: Iterable<string>): Promise<void> {
  return Promise.allSettled([...ids].filter(hasRigData).map((id) => loadRigData(id))).then(() => undefined);
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

/**
 * Postures whose class-mode figure is the live rig by default: every
 * posture with rig data (derived from the generated sheets, so a new
 * posture module joins by `npm run rig:export`; bridges are not postures).
 * Checked against the sprite, posture by posture, in
 * `docs/live-figure-rollout.md`.
 */
export const RIG_LIVE: ReadonlySet<string> = new Set(
  Object.keys(files)
    .map((k) => k.slice(2, -5))
    .filter((s) => !s.startsWith('bridge.')),
);

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
