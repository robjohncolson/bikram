// store.ts touches window.localStorage; tests stub a minimal window global.
import { beforeEach, describe, expect, it } from 'vitest';
import { loadStore, saveStore, STORAGE_KEY } from './store';
import { nodeP } from './bkt';

const NOW = 1_754_000_000_000;

const storage = new Map<string, string>();
beforeEach(() => {
  storage.clear();
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => void storage.set(k, v),
      removeItem: (k: string) => void storage.delete(k),
    },
  };
});

describe('store migration', () => {
  it('returns a fresh store when nothing is saved', () => {
    const store = loadStore(NOW);
    expect(store.version).toBe(2);
    expect(Object.keys(store.kcs).length).toBe(0);
  });

  it('migrates v1 tallies into identity-KC posteriors and persists v2', () => {
    storage.set(
      'yoga-trainer-v1',
      JSON.stringify({
        version: 1,
        poses: { camel: { seen: 3, correct: 3, wrong: 0 }, eagle: { seen: 2, correct: 0, wrong: 2 } },
        bestStreak: 4,
      }),
    );
    const store = loadStore(NOW);
    expect(store.bestStreak).toBe(4);
    expect(store.answers).toBe(5);
    expect(store.kcs['id:camel'].p).toBeGreaterThan(0.8);
    expect(store.kcs['id:eagle'].p).toBeLessThan(0.4);
    expect(storage.has(STORAGE_KEY)).toBe(true);
    // aggregates see the migrated evidence
    expect(nodeP(store, 'id:camel')).toBe(store.kcs['id:camel'].p);
  });

  it('drops corrupt entries instead of crashing', () => {
    storage.set(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        kcs: { 'id:camel': { p: 1.7, correct: 1, wrong: 0, last: NOW }, 'id:tree': { p: 0.6, correct: 2, wrong: 1, last: NOW } },
        cards: { 'name:tree': { interval: 30, ease: 2.5, due: NOW, reps: 1, lapses: 0 }, broken: { due: 'soon' } },
        bestStreak: 2,
        answers: 4,
      }),
    );
    const store = loadStore(NOW);
    expect(store.kcs['id:camel']).toBeUndefined(); // p out of range
    expect(store.kcs['id:tree'].p).toBe(0.6);
    expect(store.cards['name:tree'].interval).toBe(30);
    expect(store.cards['broken']).toBeUndefined();
  });

  it('round-trips through save/load', () => {
    const store = loadStore(NOW);
    store.kcs['id:camel'] = { p: 0.42, correct: 1, wrong: 1, last: NOW };
    saveStore(store);
    const reloaded = loadStore(NOW);
    expect(reloaded.kcs['id:camel'].p).toBe(0.42);
  });
});
