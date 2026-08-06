import type { TrainerStore } from './types';
import { BKT_BY_KIND, bktUpdate } from './bkt';
import { poses } from '../data';

export const STORAGE_KEY = 'yoga-trainer-v2';
const LEGACY_KEY = 'yoga-trainer-v1';

export function emptyStore(): TrainerStore {
  return { version: 2, kcs: {}, cards: {}, bestStreak: 0, answers: 0 };
}

const isCount = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;

/**
 * Seed v2 state from the old v1 per-pose tallies: replay each pose's
 * correct/wrong counts (correct first) through BKT on its identity KC.
 * Old drills were mostly "what comes next" MC, but per-pose identity is
 * the closest surviving grain — better than discarding real practice.
 */
function migrateV1(raw: string, now: number): TrainerStore {
  const store = emptyStore();
  try {
    const v1 = JSON.parse(raw) as {
      version?: number;
      poses?: Record<string, { seen?: unknown; correct?: unknown; wrong?: unknown }>;
      bestStreak?: unknown;
    } | null;
    if (!v1 || v1.version !== 1 || !v1.poses) return store;
    store.bestStreak = isCount(v1.bestStreak) ? Math.floor(v1.bestStreak) : 0;
    const params = BKT_BY_KIND.next;
    for (const pose of poses) {
      const s = v1.poses[pose.id];
      if (!s) continue;
      const correct = isCount(s.correct) ? Math.floor(s.correct) : 0;
      const wrong = isCount(s.wrong) ? Math.floor(s.wrong) : 0;
      if (correct + wrong === 0) continue;
      let p = params.pInit;
      for (let i = 0; i < wrong; i++) p = bktUpdate(p, false, params);
      for (let i = 0; i < correct; i++) p = bktUpdate(p, true, params);
      store.kcs[`id:${pose.id}`] = { p, correct, wrong, last: now };
      store.answers += correct + wrong;
    }
  } catch {
    /* unreadable legacy data — start fresh */
  }
  return store;
}

function sanitize(data: unknown): TrainerStore | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Partial<TrainerStore>;
  if (d.version !== 2 || typeof d.kcs !== 'object' || typeof d.cards !== 'object') return null;
  const store = emptyStore();
  store.bestStreak = isCount(d.bestStreak) ? Math.floor(d.bestStreak) : 0;
  store.answers = isCount(d.answers) ? Math.floor(d.answers) : 0;
  for (const [id, s] of Object.entries(d.kcs ?? {})) {
    if (!s || typeof s !== 'object') continue;
    const p = (s as { p?: unknown }).p;
    if (typeof p !== 'number' || !Number.isFinite(p) || p <= 0 || p >= 1) continue;
    store.kcs[id] = {
      p,
      correct: isCount(s.correct) ? Math.floor(s.correct) : 0,
      wrong: isCount(s.wrong) ? Math.floor(s.wrong) : 0,
      last: isCount(s.last) ? s.last : 0,
    };
  }
  for (const [id, c] of Object.entries(d.cards ?? {})) {
    if (!c || typeof c !== 'object') continue;
    if (!isCount(c.due) || !isCount(c.interval)) continue;
    store.cards[id] = {
      interval: c.interval,
      ease: typeof c.ease === 'number' && c.ease >= 1 && c.ease <= 4 ? c.ease : 2.5,
      due: c.due,
      reps: isCount(c.reps) ? Math.floor(c.reps) : 0,
      lapses: isCount(c.lapses) ? Math.floor(c.lapses) : 0,
    };
  }
  return store;
}

export function loadStore(now: number): TrainerStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const store = sanitize(JSON.parse(raw));
      if (store) return store;
    }
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = migrateV1(legacy, now);
      saveStore(migrated);
      return migrated;
    }
  } catch {
    /* fall through to fresh */
  }
  return emptyStore();
}

export function saveStore(store: TrainerStore): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — train without persistence */
  }
}

export function resetStore(): TrainerStore {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
  return emptyStore();
}
