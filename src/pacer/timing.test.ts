import { describe, expect, it } from 'vitest';
import {
  beatSeconds,
  beatsForSeconds,
  breathPhaseFromBeat,
  breathsPerMinute,
  clampSettings,
  PACER_DEFAULTS,
  PACER_PRESETS,
  phaseSeconds,
} from './timing';

describe('pacer defaults', () => {
  it('defaults to the Pranayama six-count at five breaths a minute', () => {
    expect(PACER_DEFAULTS.bpm).toBe(60);
    expect(PACER_DEFAULTS.beatsPerBar).toBe(6);
    expect(phaseSeconds(PACER_DEFAULTS)).toBe(6);
    expect(breathsPerMinute(PACER_DEFAULTS)).toBe(5);
  });

  it('treats one-beat bars as a pulse: one exhale per beat', () => {
    const kapalbhati = clampSettings({ bpm: 60, beatsPerBar: 1 });
    expect(breathsPerMinute(kapalbhati)).toBe(60);
  });

  it('ships presets whose settings are already legal', () => {
    for (const p of PACER_PRESETS) {
      const clamped = clampSettings({ bpm: p.bpm, beatsPerBar: p.beatsPerBar });
      expect(clamped.bpm).toBe(p.bpm);
      expect(clamped.beatsPerBar).toBe(p.beatsPerBar);
    }
  });
});

describe('clampSettings', () => {
  it('clamps out-of-range and non-numeric values to legal settings', () => {
    expect(clampSettings({ bpm: 500, beatsPerBar: 0, volume: 3 })).toEqual({
      bpm: 120,
      beatsPerBar: 1,
      volume: 1,
      muted: false,
    });
    expect(clampSettings({ bpm: Number.NaN, volume: -1, muted: true })).toEqual({
      bpm: 60,
      beatsPerBar: 6,
      volume: 0,
      muted: true,
    });
    expect(clampSettings(null)).toEqual(PACER_DEFAULTS);
  });

  it('rounds fractional bpm and bar sizes', () => {
    const s = clampSettings({ bpm: 71.6, beatsPerBar: 3.4 });
    expect(s.bpm).toBe(72);
    expect(s.beatsPerBar).toBe(3);
  });
});

describe('beatsForSeconds', () => {
  it('maps seconds to beats at the current tempo', () => {
    expect(beatsForSeconds(120, 60)).toBe(120); // 60 bpm: beats are seconds
    expect(beatsForSeconds(120, 30)).toBe(60); // half tempo, half the beats
    expect(beatsForSeconds(0.2, 60)).toBe(1); // never zero
  });
});

describe('breathPhaseFromBeat', () => {
  it('inhales on even bars and exhales on odd ones, one bar long', () => {
    expect(breathPhaseFromBeat(0, 6, 1)).toEqual({ phase: 'inhale', seconds: 6 });
    expect(breathPhaseFromBeat(1, 6, 1)).toEqual({ phase: 'exhale', seconds: 6 });
    expect(breathPhaseFromBeat(14, 4, beatSeconds(120))).toEqual({ phase: 'inhale', seconds: 2 });
    expect(breathPhaseFromBeat(7, 8, beatSeconds(30))).toEqual({ phase: 'exhale', seconds: 16 });
  });

  it('matches phaseSeconds for the same settings', () => {
    const s = clampSettings({ bpm: 72, beatsPerBar: 5 });
    expect(breathPhaseFromBeat(2, s.beatsPerBar, beatSeconds(s.bpm))?.seconds).toBeCloseTo(phaseSeconds(s));
  });

  it('does not breathe in pulse mode or on bad input', () => {
    expect(breathPhaseFromBeat(0, 1, 1)).toBeUndefined();
    expect(breathPhaseFromBeat(3, 1, 0.5)).toBeUndefined();
    expect(breathPhaseFromBeat(-1, 6, 1)).toBeUndefined();
    expect(breathPhaseFromBeat(0, 6, 0)).toBeUndefined();
    expect(breathPhaseFromBeat(Number.NaN, 6, 1)).toBeUndefined();
  });
});
