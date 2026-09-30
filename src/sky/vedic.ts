import type { MuscleId, NoticeRegion, Pose } from '../data';
import { daysSinceJ2000, luminaryLongitudes, tropicalSign } from './ephemeris';

export const VEDIC_SOURCES = {
  astronomy: 'https://www.astro.com/swisseph/swisseph.htm',
  text: 'https://www.wilbourhall.org/pdfs/brihatjataka00varaiala.pdf',
  moonDays: 'https://www.astangayogahere.com/moon-days',
} as const;

/** Approximate mean Lahiri (Chitrapaksha), for contemporary dates.
 * IAE 1989 p. 525 precession polynomial, reproduced in Swiss Ephemeris
 * documentation §2.8.12, with J2000 mean Lahiri 23°51′25.5324″ from
 * Appendix E (IAE 2019 p. 429): https://www.astro.com/swisseph/swisseph.htm
 * UTC stands in for TT; its contribution here is far below one arcsecond.
 * Ignores nutation; tested to 1 arcminute, not a precise panchanga.
 */
export function lahiriAyanamsa(atMs: number): number {
  const t = daysSinceJ2000(atMs) / 36525;
  return 23 + 51 / 60 + 25.5324 / 3600
    + (5029.0966 * t + 1.11161 * t * t - 0.000113 * t * t * t) / 3600;
}

const norm = (n: number) => { const r = n % 360; return r < 0 ? r + 360 : r; };
export const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Mina'] as const;
export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
] as const;
const TITHIS = ['Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi'];

/** Input is already sidereal; all intervals include their lower boundary. */
export function rashi(longitude: number) {
  const sign = tropicalSign(longitude);
  return { ...sign, sanskrit: RASHIS[sign.index] };
}
export function nakshatra(longitude: number) {
  // Snap machine rounding at exact thirds of a degree, not sky uncertainty.
  const quarter = Math.floor(norm(longitude) * 3 / 10 + 1e-12) % 108;
  const index = Math.floor(quarter / 4);
  return { index, name: NAKSHATRAS[index], pada: quarter % 4 + 1 };
}
export function tithi(moon: number, sun: number) {
  const number = Math.floor(norm(moon - sun) / 12) + 1;
  return {
    number,
    paksha: number <= 15 ? 'shukla' : 'krishna',
    name: number === 15 ? 'Purnima' : number === 30 ? 'Amavasya' : TITHIS[(number - 1) % 15],
    moonDay: number === 15 || number === 30,
  };
}
export function vedicSky(atMs: number) {
  const sky = luminaryLongitudes(atMs);
  const ayanamsa = lahiriAyanamsa(atMs);
  const moon = norm(sky.moon - ayanamsa);
  return { ayanamsa, moon: rashi(moon), sun: rashi(sky.sun - ayanamsa), nakshatra: nakshatra(moon), tithi: tithi(sky.moon, sky.sun) };
}

export interface KalapurushaRegion {
  region: string;
  citation: 'Brihat Jataka 1.4';
  tradition: string;
  muscles: readonly MuscleId[];
  notice: readonly NoticeRegion[];
  anatomy: string;
}

/** Our anatomy bridge is separate from the verse: organs/joints have no
 * direct muscle ids. Every nearest-region substitution is disclosed in UI.
 */
function makeRegion(region: string, muscles: MuscleId[], notice: NoticeRegion[], anatomy: string): KalapurushaRegion {
  return { region, citation: 'Brihat Jataka 1.4', tradition: 'Jyotisha tradition: the signs name regions of Kalapurusha.', muscles, notice, anatomy: `Our anatomy: ${anatomy}` };
}

// N. Chidambaram Iyer translation, chapter I, stanza 4 and its sign table.
export const KALAPURUSHA: readonly KalapurushaRegion[] = [
  makeRegion('head', ['neck'], ['neck'], 'we read the head through the neck that supports it.'),
  makeRegion('face', ['neck'], ['neck'], 'we read the face through the nearby neck; facial muscles are not in our map.'),
  makeRegion('chest', ['pectorals', 'deltoids'], ['shoulders', 'upper-back'], 'you can notice the chest and nearby shoulders; the library names shoulders and upper back.'),
  makeRegion('heart region', ['pectorals', 'diaphragm'], ['breath', 'upper-back'], 'we read this region through the chest and breathing muscles, with breath and upper back in the library.'),
  makeRegion('belly', ['abdominals', 'obliques'], ['core'], 'you can notice the abdominal muscles; the library calls this the core.'),
  makeRegion('navel region', ['abdominals', 'obliques'], ['core'], 'we read the navel through the surrounding abdominal muscles; the library calls this the core.'),
  makeRegion('lower abdomen', ['abdominals', 'hip-flexors'], ['core', 'hips'], 'you can notice the abdominal muscles and nearby hip flexors; the library names core and hips.'),
  makeRegion('genital region', ['adductors', 'glutes'], ['hips'], 'we read this region through nearby inner-thigh and hip muscles; the library names hips.'),
  makeRegion('thighs', ['quadriceps', 'hamstrings', 'adductors'], ['quads', 'hamstrings'], 'you can notice the front, back and inner thighs; the library names quads and hamstrings.'),
  makeRegion('knees', ['quadriceps', 'hamstrings', 'calves'], ['quads', 'hamstrings', 'calves'], 'we read the knees through the muscles that move them.'),
  makeRegion('ankles', ['calves', 'ankles-feet'], ['calves', 'feet'], 'we read the ankles through nearby calf and foot muscles; the library names calves and feet.'),
  makeRegion('feet', ['ankles-feet'], ['feet'], 'you can notice the feet through our ankle and foot muscle group.'),
];

/** Select primary matches first, fill with secondary, then show class order. */
export function vedicPostures(region: KalapurushaRegion, list: readonly Pose[]): Pose[] {
  const score = (p: Pose) => p.muscles.some(m => region.muscles.includes(m.id) && m.emphasis === 'primary') ? 0 : 1;
  return list.filter(p => p.muscles.some(m => region.muscles.includes(m.id)))
    .sort((a, b) => score(a) - score(b) || a.order - b.order).slice(0, 4)
    .sort((a, b) => a.order - b.order);
}

/** The view supplies lazy library entries joined to their per-stage notices.
 * No runtime library import belongs in the sky layer.
 */
export interface VedicLibraryEntry {
  id: string;
  english: string;
  stages: readonly { notice?: readonly NoticeRegion[]; hold?: number }[];
}

/** How much of a posture's practice asks you to notice the region: 1 when
 *  its held form (the longest hold) names it, plus the share of all its
 *  stages that do. A share, not a count, so a long sheet (a recross runs to
 *  32 stages) does not outrank a short one just by being long. */
export function libraryRegionScore(region: KalapurushaRegion, entry: VedicLibraryEntry): number {
  if (entry.stages.length === 0) return 0;
  const names = (s: VedicLibraryEntry['stages'][number]) => !!s.notice?.some((n) => region.notice.includes(n));
  const holds = entry.stages.map((s) => s.hold ?? 0);
  const held = entry.stages[holds.indexOf(Math.max(...holds))];
  return (names(held) ? 1 : 0) + entry.stages.filter(names).length / entry.stages.length;
}

/** The two library postures that work the region most (ties keep book order). */
export function vedicLibrary<T extends VedicLibraryEntry>(region: KalapurushaRegion, list: readonly T[]): T[] {
  return list
    .map((entry, i) => ({ entry, i, score: libraryRegionScore(region, entry) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, 2)
    .map((x) => x.entry);
}
