/**
 * Pure timing math for the breath pacer. The model: the metronome ticks
 * at `bpm`; `beatsPerBar` beats make one bar; bars alternate breath
 * phase (even = inhale, odd = exhale). With one-beat bars the pacer is a
 * pulse (Kapalbhati-style: one sharp exhale per beat).
 *
 * Default 60 BPM × 6-beat bars = the classic Pranayama six-count:
 * six seconds in, six seconds out — five breaths a minute — and every
 * beat lands on a second, so hold countdowns read as seconds.
 */

export interface PacerSettings {
  /** beats per minute, 30–120 */
  bpm: number;
  /** beats in one breath phase, 1–8 (1 = pulse mode, no phases) */
  beatsPerBar: number;
  /** master volume 0–1 */
  volume: number;
  muted: boolean;
}

export const BPM_MIN = 30;
export const BPM_MAX = 120;
export const BEATS_MIN = 1;
export const BEATS_MAX = 8;

export const PACER_DEFAULTS: PacerSettings = {
  bpm: 60,
  beatsPerBar: 6,
  volume: 0.7,
  muted: false,
};

const num = (v: unknown, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

/** Merge partial settings over the defaults and clamp into legal range. */
export function clampSettings(partial: Partial<PacerSettings> | null | undefined): PacerSettings {
  const p = partial ?? {};
  return {
    bpm: Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(num(p.bpm, PACER_DEFAULTS.bpm)))),
    beatsPerBar: Math.min(
      BEATS_MAX,
      Math.max(BEATS_MIN, Math.round(num(p.beatsPerBar, PACER_DEFAULTS.beatsPerBar))),
    ),
    volume: Math.min(1, Math.max(0, num(p.volume, PACER_DEFAULTS.volume))),
    muted: typeof p.muted === 'boolean' ? p.muted : PACER_DEFAULTS.muted,
  };
}

export function beatSeconds(bpm: number): number {
  return 60 / bpm;
}

/** Length of one breath phase (one bar) in seconds. */
export function phaseSeconds(s: PacerSettings): number {
  return beatSeconds(s.bpm) * s.beatsPerBar;
}

/** Full in+out breaths per minute; in pulse mode, pulses per minute. */
export function breathsPerMinute(s: PacerSettings): number {
  if (s.beatsPerBar === 1) return s.bpm;
  return 60 / (2 * phaseSeconds(s));
}

/** How many beats cover `seconds` of class time at this tempo. */
export function beatsForSeconds(seconds: number, bpm: number): number {
  return Math.max(1, Math.round(seconds * (bpm / 60)));
}

export interface PacerPreset {
  key: string;
  label: string;
  /** one-line teaching note shown under the preset */
  note: string;
  bpm: number;
  beatsPerBar: number;
}

export const PACER_PRESETS: PacerPreset[] = [
  {
    key: 'pranayama',
    label: 'Pranayama 6 · 6',
    note: 'Six counts in, six counts out — five breaths a minute, the opening-breath pace.',
    bpm: 60,
    beatsPerBar: 6,
  },
  {
    key: 'gentle',
    label: 'Gentle 4 · 4',
    note: 'Four counts each way — a softer pace for holds and cool-downs.',
    bpm: 60,
    beatsPerBar: 4,
  },
  {
    key: 'kapalbhati',
    label: 'Kapalbhati pulse',
    note: 'One sharp exhale per beat, inhale passive — the closing-breath rhythm.',
    bpm: 60,
    beatsPerBar: 1,
  },
];
