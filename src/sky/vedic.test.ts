import { describe, expect, it } from 'vitest';
import { poses } from '../data';
import type { RigData } from '../data';
import { libraryAsanas, NOTICE_REGIONS } from '../data/library';
import { KALAPURUSHA, lahiriAyanamsa, nakshatra, rashi, tithi, vedicLibrary, vedicPostures, vedicSky } from './index';
import { EFFECT_CLAIMS } from './claims';
import todaySource from '../views/Today.tsx?raw';

const rigs = import.meta.glob<RigData>('../data/rig/library/*.json', { eager: true, import: 'default' });
const library = libraryAsanas.map(p => ({ ...p, stages: rigs[`../data/rig/library/${p.id}.json`].stages }));

describe('Vedic sky', () => {
  it('matches independently published mean Lahiri values within one arcminute', () => {
    // Swiss Ephemeris documentation Appendix E, IAE 2019 p. 429.
    // https://www.astro.com/swisseph/swisseph.htm
    // Both epochs are 12:00 TT; using UTC changes far less than 1 arcsecond.
    for (const [date, degrees] of [
      ['2000-01-01T12:00:00Z', 23 + 51 / 60 + 25.5324 / 3600],
      ['2019-01-01T12:00:00Z', 24 + 7 / 60 + 21.1353 / 3600],
      // Maitreya's published Swiss Ephemeris reference epoch, JD 2415020.
      // https://saravali.github.io/astrology/aya_basics.html
      ['1899-12-31T12:00:00Z', 22.46047],
    ] as const) expect(Math.abs(lahiriAyanamsa(Date.parse(date)) - degrees)).toBeLessThan(1 / 60);
  });

  it('partitions every sign, nakshatra and pada at the lower boundary, including wrap', () => {
    for (let i = 0; i < 12; i++) {
      expect(rashi(i * 30).index).toBe(i);
      expect(rashi(i * 30 - 1e-7).index).toBe((i + 11) % 12);
    }
    for (let i = 0; i < 108; i++) {
      const at = nakshatra(i * 10 / 3);
      expect(at.index).toBe(Math.floor(i / 4));
      expect(at.pada).toBe(i % 4 + 1);
      const before = nakshatra(i * 10 / 3 - 1e-7);
      expect(before.index).toBe(Math.floor(((i + 107) % 108) / 4));
      expect(before.pada).toBe((i + 107) % 4 + 1);
    }
    expect(nakshatra(360)).toEqual(nakshatra(0));
    expect(nakshatra(-360)).toEqual(nakshatra(0));
    expect(rashi(360).index).toBe(0);
  });

  it('uses 12-degree elongation tithis, unchanged by a shared sidereal offset', () => {
    for (let i = 0; i < 30; i++) {
      const at = tithi(i * 12, 0);
      expect(at.number).toBe(i + 1);
      expect(at.paksha).toBe(i < 15 ? 'shukla' : 'krishna');
      expect(at.moonDay).toBe(i === 14 || i === 29);
      expect(tithi(i * 12 - 1e-7, 0).number).toBe((i + 29) % 30 + 1);
      expect(tithi(i * 12 - 24, -24)).toEqual(at);
    }
    expect(tithi(168, 0).name).toBe('Purnima');
    expect(tithi(348, 0).name).toBe('Amavasya');
    expect(tithi(360, 0).name).toBe('Pratipada');
    expect(tithi(0, 12).number).toBe(30);
  });

  it('resolves all twelve sourced regions using actual muscles and stage notices', () => {
    expect(KALAPURUSHA).toHaveLength(12);
    const original = JSON.stringify({ poses, library, KALAPURUSHA });
    for (const region of KALAPURUSHA) {
      expect(region.citation).toBe('Brihat Jataka 1.4');
      expect(region.tradition).toMatch(/tradition/i);
      expect(region.anatomy).toMatch(/^Our anatomy:/);
      expect(EFFECT_CLAIMS.test(JSON.stringify(region))).toBe(false);
      for (const n of region.notice) expect(NOTICE_REGIONS).toContain(n);
      const found = vedicPostures(region, poses);
      expect(found.length).toBeGreaterThanOrEqual(2);
      expect(found.length).toBeLessThanOrEqual(4);
      expect(found.map(p => p.order)).toEqual(found.map(p => p.order).sort((a, b) => a - b));
      for (const p of found) expect(p.muscles.some(m => region.muscles.includes(m.id))).toBe(true);
      const primary = poses.filter(p => p.muscles.some(m => region.muscles.includes(m.id) && m.emphasis === 'primary'));
      for (const p of primary.slice(0, 4)) expect(found).toContain(p);
      expect(vedicPostures(region, poses)).toEqual(found);
      const fromLibrary = vedicLibrary(region, library);
      expect(fromLibrary).toHaveLength(2);
      expect(vedicLibrary(region, library)).toEqual(fromLibrary);
      expect(vedicLibrary(region, [])).toEqual([]);
    }
    expect(JSON.stringify({ poses, library, KALAPURUSHA })).toBe(original);
    expect(EFFECT_CLAIMS.test(todaySource)).toBe(false);
    const date = Date.parse('2026-09-30T22:00:00Z');
    expect(vedicSky(date)).toEqual(vedicSky(date));
  });
});

describe('library picks for a region', () => {
  const entries = libraryAsanas.map((a) => ({ id: a.id, english: a.english, stages: rigs[`../data/rig/library/${a.id}.json`].stages }));
  const pick = (region: string) => vedicLibrary(KALAPURUSHA.find((r) => r.region === region)!, entries).map((e) => e.id);
  it('ranks by the held form and the share of stages, not by book order or sheet length', () => {
    expect(pick('belly')).toContain('paripurna-navasana');
    expect(pick('chest')).toContain('ustrasana');
    expect(pick('knees')).toContain('supta-padangusthasana');
    // the long recross sheets do not win just by having 30-odd stages
    for (const r of KALAPURUSHA) expect(vedicLibrary(r, entries)).toHaveLength(2);
  });
});
