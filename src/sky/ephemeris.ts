/**
 * A tiny, dependency-free ephemeris — just enough sky for the Moon-days
 * lens: Sun and Moon ecliptic longitudes by the Meeus low-precision
 * formulas (Sun within ~0.01°, Moon within ~1–2°), the Moon's phase as
 * eight named buckets, tropical zodiac signs, and the planetary week.
 * Pure functions of a timestamp; no location, no network.
 *
 * The formulas are the same ones Moon Chorus (../aim-dojo) uses to deal
 * its nights, so both apps name the same phase on the same evening.
 */

const DAY_MS = 86_400_000;
/** J2000.0 epoch — 2000-01-01 12:00 UTC — in days since the Unix epoch. */
const J2000_DAYS = 10957.5;
const RAD = Math.PI / 180;
/** Mean synodic month in days. */
export const SYNODIC_DAYS = 29.530589;

const norm = (deg: number) => ((deg % 360) + 360) % 360;

/** Days since J2000.0 for a timestamp. */
export function daysSinceJ2000(atMs: number): number {
  return atMs / DAY_MS - J2000_DAYS;
}

/** Geocentric ecliptic longitudes of the Sun and Moon, degrees 0–360 (equinox of date). */
export function luminaryLongitudes(atMs: number): { sun: number; moon: number } {
  const n = daysSinceJ2000(atMs);
  const g = (357.528 + 0.9856003 * n) * RAD; // solar mean anomaly
  const sun = norm(280.46 + 0.9856474 * n + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
  const mp = (134.963 + 13.064993 * n) * RAD; // lunar mean anomaly
  const moon = norm(218.316 + 13.176396 * n + 6.289 * Math.sin(mp));
  return { sun, moon };
}

export const PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
] as const;

export interface MoonPhase {
  /** 0 new · 2 first quarter · 4 full · 6 last quarter — eight 45° buckets centred on the named phases */
  bucket: number;
  name: (typeof PHASE_NAMES)[number];
  /** Moon minus Sun longitude, degrees 0–360 */
  elongation: number;
  /** lit fraction of the disc, 0–1 */
  illumination: number;
  /** days since new moon, from the elongation */
  ageDays: number;
}

export function moonPhase(atMs: number): MoonPhase {
  const { sun, moon } = luminaryLongitudes(atMs);
  const elongation = norm(moon - sun);
  const bucket = Math.floor(((elongation + 22.5) % 360) / 45) % 8;
  return {
    bucket,
    name: PHASE_NAMES[bucket],
    elongation,
    illumination: (1 - Math.cos(elongation * RAD)) / 2,
    ageDays: (elongation / 360) * SYNODIC_DAYS,
  };
}

export const SIGN_NAMES = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export interface ZodiacPosition {
  index: number;
  name: (typeof SIGN_NAMES)[number];
  /** degrees into the sign, 0–30 */
  degree: number;
}

/** Tropical sign for an ecliptic longitude (equinox of date, so no precession step). */
export function tropicalSign(longitude: number): ZodiacPosition {
  const lon = norm(longitude);
  const index = Math.floor(lon / 30) % 12;
  return { index, name: SIGN_NAMES[index], degree: lon - index * 30 };
}

/** The planetary week — Sunday first, as the calendar has it. */
export const WEEKDAY_PLANETS = [
  { day: 'Sunday', planet: 'Sun' },
  { day: 'Monday', planet: 'Moon' },
  { day: 'Tuesday', planet: 'Mars' },
  { day: 'Wednesday', planet: 'Mercury' },
  { day: 'Thursday', planet: 'Jupiter' },
  { day: 'Friday', planet: 'Venus' },
  { day: 'Saturday', planet: 'Saturn' },
] as const;

export function planetaryDay(atMs: number): { index: number; day: string; planet: string } {
  const index = new Date(atMs).getDay();
  return { index, ...WEEKDAY_PLANETS[index] };
}

/** Local calendar day index (days since the Unix epoch, local midnight). */
export function localDayIndex(atMs: number): number {
  const d = new Date(atMs);
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / DAY_MS);
}
