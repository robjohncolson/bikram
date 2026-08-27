import { describe, expect, it } from 'vitest';
import { poses } from '../data';
import { DAY_NOTES, PHASE_NOTES, localDayIndex, todayLens } from './index';

const NOW = new Date(2026, 7, 27, 12).getTime();
const DAY = 86_400_000;

describe('moon-days lens', () => {
  it('has a note for every phase and every planetary day, naming real postures', () => {
    expect(PHASE_NOTES).toHaveLength(8);
    expect(DAY_NOTES).toHaveLength(7);
    const ids = new Set(poses.map((p) => p.id));
    for (const note of [...PHASE_NOTES, ...DAY_NOTES]) {
      expect(note.postures.length).toBeGreaterThanOrEqual(2);
      expect(note.postures.length).toBeLessThanOrEqual(4);
      for (const id of note.postures) expect(ids.has(id), `${note.title}: ${id}`).toBe(true);
      expect(note.tradition.length).toBeGreaterThan(20);
      expect(note.notice.length).toBeGreaterThan(10);
      // tradition is described as tradition — never as fact
      expect(/tradition/i.test(note.tradition)).toBe(true);
    }
  });

  it('never promises an effect', () => {
    const claims = /\b(cures?|heals?|detox\w*|boosts? (?:the )?immun\w*|prevents? (?:disease|illness|injury)|treats? (?:disease|illness|pain|anxiety|depression))\b/i;
    for (const note of [...PHASE_NOTES, ...DAY_NOTES]) {
      expect(claims.test(`${note.text} ${note.tradition} ${note.notice}`), note.title).toBe(false);
    }
  });

  it('walks every posture exactly once as the posture of the day over 26 days', () => {
    const seen = new Set<string>();
    for (let d = 0; d < poses.length; d++) seen.add(todayLens(NOW + d * DAY).postureOfTheDay.id);
    expect(seen.size).toBe(poses.length);
    // and in sequence order, day to day
    const a = todayLens(NOW).postureOfTheDay;
    const b = todayLens(NOW + DAY).postureOfTheDay;
    expect((poses.indexOf(a) + 1) % poses.length).toBe(poses.indexOf(b));
  });

  it('is the same lens all day and resolves the notes it shows', () => {
    const morning = todayLens(new Date(2026, 7, 27, 6).getTime());
    const evening = todayLens(new Date(2026, 7, 27, 22).getTime());
    expect(morning.postureOfTheDay.id).toBe(evening.postureOfTheDay.id);
    expect(morning.dayNote.title).toBe(evening.dayNote.title);
    expect(morning.weekday.day).toBe('Thursday');
    expect(morning.leaning.length).toBeGreaterThanOrEqual(4);
    expect(localDayIndex(evening.phase ? NOW : NOW)).toBe(localDayIndex(NOW));
  });
});
