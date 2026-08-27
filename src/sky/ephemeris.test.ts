import { describe, expect, it } from 'vitest';
import {
  PHASE_NAMES,
  SYNODIC_DAYS,
  localDayIndex,
  luminaryLongitudes,
  moonPhase,
  planetaryDay,
  tropicalSign,
} from './ephemeris';

describe('ephemeris', () => {
  it('matches Moon Chorus’s formula exactly — both apps name the same night', () => {
    // values produced by the sibling app’s approxLuminaryLons for these instants
    const a = luminaryLongitudes(1_700_000_000_000);
    expect(a.sun).toBeCloseTo(232.275999, 5);
    expect(a.moon).toBeCloseTo(249.577924, 5);
    const b = luminaryLongitudes(1_754_000_000_000);
    expect(b.sun).toBeCloseTo(128.947589, 5);
    expect(b.moon).toBeCloseTo(212.436656, 5);
  });

  it('finds the well-known new and full moons of January 2000', () => {
    // new moon 2000-01-06 18:14 UTC; first quarter 01-14 13:34; full 01-21 04:40
    const nm = moonPhase(Date.UTC(2000, 0, 6, 18, 14));
    expect(Math.min(nm.elongation, 360 - nm.elongation)).toBeLessThan(5);
    expect(nm.bucket).toBe(0);
    expect(nm.name).toBe('New Moon');
    expect(nm.illumination).toBeLessThan(0.01);
    const fq = moonPhase(Date.UTC(2000, 0, 14, 13, 34));
    expect(Math.abs(fq.elongation - 90)).toBeLessThan(5);
    expect(fq.bucket).toBe(2);
    const fm = moonPhase(Date.UTC(2000, 0, 21, 4, 40));
    expect(Math.abs(fm.elongation - 180)).toBeLessThan(5);
    expect(fm.bucket).toBe(4);
    expect(fm.illumination).toBeGreaterThan(0.99);
    expect(fm.ageDays).toBeCloseTo(SYNODIC_DAYS / 2, 0);
  });

  it('places the 2024 eclipse new moon and a 2026 full moon', () => {
    // total solar eclipse 2024-04-08 18:18 UTC = new moon
    expect(moonPhase(Date.UTC(2024, 3, 8, 18, 18)).bucket).toBe(0);
    // full moon 2026-08-28 04:18 UTC
    const fm = moonPhase(Date.UTC(2026, 7, 28, 4, 18));
    expect(Math.abs(fm.elongation - 180)).toBeLessThan(6);
    expect(fm.bucket).toBe(4);
  });

  it('walks all eight phases across one synodic month, in order', () => {
    const start = Date.UTC(2000, 0, 6, 18, 14);
    const seen: number[] = [];
    for (let h = 0; h < SYNODIC_DAYS * 24; h += 6) {
      const b = moonPhase(start + h * 3_600_000).bucket;
      if (seen[seen.length - 1] !== b) seen.push(b);
    }
    expect(seen.slice(0, 8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(PHASE_NAMES).toHaveLength(8);
  });

  it('puts the Sun at the equinox and in the right tropical sign', () => {
    const { sun } = luminaryLongitudes(Date.UTC(2000, 2, 20, 7, 35)); // March equinox 2000
    expect(Math.min(sun, 360 - sun)).toBeLessThan(0.5);
    expect(tropicalSign(luminaryLongitudes(Date.UTC(2024, 6, 15)).sun).name).toBe('Cancer');
    expect(tropicalSign(luminaryLongitudes(Date.UTC(2024, 11, 25)).sun).name).toBe('Capricorn');
    expect(tropicalSign(359.9)).toMatchObject({ name: 'Pisces' });
    expect(tropicalSign(0.1)).toMatchObject({ name: 'Aries' });
    expect(tropicalSign(45).degree).toBeCloseTo(15, 10);
  });

  it('names the planetary day from the local weekday', () => {
    // 2026-08-27 is a Thursday (local noon keeps the day unambiguous)
    const thu = new Date(2026, 7, 27, 12).getTime();
    expect(planetaryDay(thu)).toMatchObject({ day: 'Thursday', planet: 'Jupiter' });
    expect(planetaryDay(thu + 3 * 86_400_000)).toMatchObject({ day: 'Sunday', planet: 'Sun' });
    expect(localDayIndex(thu + 86_400_000) - localDayIndex(thu)).toBe(1);
  });
});
