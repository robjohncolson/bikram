import { describe, expect, it } from 'vitest';
import { MAX_ELEVATION, cameraAt, clampElevation, orbitBetween, withOffset } from './camera';
import { smoothstep } from './math';

const DEG = Math.PI / 180;

describe('camera elevation (the hand orbit)', () => {
  it('leaves the authored cameras level and shaped as before', () => {
    expect(cameraAt('side').elevation).toBeUndefined();
    expect('elevation' in orbitBetween(cameraAt('front'), cameraAt('side'), 0.5)).toBe(false);
  });

  it('carries elevation through an orbit, on the same ease as the framing', () => {
    const a = { ...cameraAt('front'), elevation: 0 };
    const b = { ...cameraAt('side'), elevation: 30 * DEG };
    expect(orbitBetween(a, b, 0).elevation).toBe(0);
    expect(orbitBetween(a, b, 1).elevation).toBeCloseTo(30 * DEG, 12);
    expect(orbitBetween(a, b, 0.25).elevation).toBeCloseTo(30 * DEG * smoothstep(0.25), 12);
    // one side without it counts as level
    expect(orbitBetween(cameraAt('front'), b, 0.5).elevation).toBeCloseTo(15 * DEG, 12);
  });

  it('clamps elevation to ±60°', () => {
    expect(MAX_ELEVATION).toBeCloseTo(60 * DEG, 12);
    expect(clampElevation(80 * DEG)).toBe(MAX_ELEVATION);
    expect(clampElevation(-2)).toBe(-MAX_ELEVATION);
    expect(clampElevation(0.3)).toBe(0.3);
  });

  it('adds a hand offset on top of the authored camera, keeping its framing', () => {
    const cam = cameraAt('quarter', { center_z: 0.5, scale: 2.4 });
    const out = withOffset(cam, { azimuth: 20 * DEG, elevation: 25 * DEG });
    expect(out.azimuth).toBeCloseTo(cam.azimuth + 20 * DEG, 12);
    expect(out.elevation).toBeCloseTo(25 * DEG, 12);
    expect(out.centerZ).toBe(0.5);
    expect(out.scale).toBe(2.4);
    expect(withOffset(cam, { azimuth: 0, elevation: 2 }).elevation).toBe(MAX_ELEVATION);
    // the input is untouched
    expect(cam.elevation).toBeUndefined();
  });
});
