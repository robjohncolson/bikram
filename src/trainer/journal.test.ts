import { beforeEach, describe, expect, it } from 'vitest';
import {
  JOURNAL_KEY,
  amendLastClass,
  classesInLast,
  dayKey,
  daysSince,
  emptyJournal,
  lastClass,
  loadJournal,
  practiceStreak,
  recordClass,
  saveJournal,
  touchPracticeDay,
} from './journal';

const DAY = 86_400_000;
// local noon, so day arithmetic never straddles midnight in any zone
const NOW = new Date(2026, 7, 27, 12, 0, 0).getTime();

function rec(endedAt: number, extra: Partial<Parameters<typeof recordClass>[1]> = {}) {
  return {
    startedAt: endedAt - 3_600_000,
    endedAt,
    fromOrder: 1,
    toOrder: 26,
    pacedSeconds: 3_600,
    bpm: 60,
    rehearsed: false,
    ...extra,
  };
}

describe('practice journal', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: {
          getItem: (k: string) => storage.get(k) ?? null,
          setItem: (k: string, v: string) => storage.set(k, v),
          removeItem: (k: string) => storage.delete(k),
        },
      },
      configurable: true,
    });
  });

  it('records classes, touches days, and round-trips', () => {
    const j = emptyJournal();
    recordClass(j, rec(NOW));
    expect(j.days).toEqual([dayKey(NOW)]);
    expect(lastClass(j)?.toOrder).toBe(26);
    saveJournal(j);
    const back = loadJournal();
    expect(back.classes).toHaveLength(1);
    expect(back.days).toEqual([dayKey(NOW)]);
    expect(window.localStorage.getItem(JOURNAL_KEY)).toContain('"version":1');
  });

  it('amends the last class with the rehearsal debrief', () => {
    const j = emptyJournal();
    expect(amendLastClass(j, { recalled: 3 })).toBe(false);
    recordClass(j, rec(NOW, { rehearsed: true }));
    expect(amendLastClass(j, { handoffs: 25, recalled: 21 })).toBe(true);
    expect(lastClass(j)).toMatchObject({ rehearsed: true, handoffs: 25, recalled: 21 });
  });

  it('counts a streak that ends today or yesterday, and breaks after a skipped day', () => {
    const j = emptyJournal();
    for (let d = 1; d <= 4; d++) touchPracticeDay(j, NOW - d * DAY);
    expect(practiceStreak(j, NOW)).toBe(4); // yesterday back through four days
    touchPracticeDay(j, NOW);
    expect(practiceStreak(j, NOW)).toBe(5);
    expect(practiceStreak(emptyJournal(), NOW)).toBe(0);
    const gap = emptyJournal();
    touchPracticeDay(gap, NOW - 2 * DAY);
    touchPracticeDay(gap, NOW - 3 * DAY);
    expect(practiceStreak(gap, NOW)).toBe(0);
  });

  it('touching the same day twice changes nothing', () => {
    const j = emptyJournal();
    expect(touchPracticeDay(j, NOW)).toBe(true);
    expect(touchPracticeDay(j, NOW + 60_000)).toBe(false);
    expect(j.days).toHaveLength(1);
  });

  it('measures whole days since and classes in a window', () => {
    expect(daysSince(NOW, NOW)).toBe(0);
    expect(daysSince(NOW - DAY, NOW)).toBe(1);
    expect(daysSince(NOW - 10 * DAY, NOW)).toBe(10);
    const j = emptyJournal();
    recordClass(j, rec(NOW - 9 * DAY));
    recordClass(j, rec(NOW - 2 * DAY));
    recordClass(j, rec(NOW));
    expect(classesInLast(j, 7, NOW)).toBe(2);
    expect(classesInLast(j, 30, NOW)).toBe(3);
  });

  it('sanitizes garbage and derives days from classes', () => {
    window.localStorage.setItem(
      JOURNAL_KEY,
      JSON.stringify({
        version: 1,
        classes: [rec(NOW - DAY), { startedAt: 'x' }, null, { ...rec(NOW), recalled: 'no' }],
        days: ['2026-01-01', 'nonsense', 7],
      }),
    );
    const j = loadJournal();
    expect(j.classes).toHaveLength(2);
    expect(j.classes[1].recalled).toBeUndefined();
    expect(j.days).toEqual(['2026-01-01', dayKey(NOW - DAY), dayKey(NOW)].sort());
    window.localStorage.setItem(JOURNAL_KEY, '{"version":9}');
    expect(loadJournal()).toEqual(emptyJournal());
    window.localStorage.setItem(JOURNAL_KEY, 'not json');
    expect(loadJournal()).toEqual(emptyJournal());
  });
});
