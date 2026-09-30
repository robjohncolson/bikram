import { afterEach, expect, it, vi } from 'vitest';
import { createMetronome } from './metronome';
import type { BeatEvent } from './metronome';
class Context extends EventTarget {
  currentTime = 0;
  state = 'running';
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
  createGain() {
    return { gain: { value: 0, setTargetAtTime() {}, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
  }
  createOscillator = vi.fn(() => ({
    type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    connect: () => ({ connect() {} }), start() {}, stop() {},
  }));
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
function setup() {
  vi.useFakeTimers();
  const ctx = new Context();
  vi.stubGlobal('AudioContext', function () { return ctx; });
  let wall = 0;
  const beats: BeatEvent[] = [];
  const metro = createMetronome((beat) => beats.push(beat), () => wall);
  metro.start();
  return { ctx, beats, metro, wall: (value: number) => { wall = value; } };
}
it('catches up a frozen audio clock silently, then schedules the next live beat', () => {
  const { ctx, beats, metro, wall } = setup();
  ctx.state = 'suspended';
  ctx.dispatchEvent(new Event('statechange'));
  wall(10);
  vi.advanceTimersByTime(40);
  expect(beats).toHaveLength(1);
  ctx.state = 'running';
  ctx.dispatchEvent(new Event('statechange'));
  expect(beats.filter((beat) => beat.late)).toHaveLength(9);
  expect(beats.at(-1)).toMatchObject({ serial: 10, late: false });
  expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  vi.advanceTimersByTime(40);
  expect(beats).toHaveLength(11);
  metro.dispose();
});
it('marks even a short suspension missed beat late and resets the clock on explicit restart', () => {
  const { ctx, beats, metro, wall } = setup();
  wall(1.5);
  ctx.dispatchEvent(new Event('statechange'));
  expect(beats.at(-1)).toMatchObject({ serial: 1, late: true });
  metro.stop();
  wall(100);
  metro.start();
  expect(beats.at(-1)).toMatchObject({ serial: 0, late: false });
  metro.dispose();
});
it('preserves ordinary audio-clock stall catch-up and quiet-mode cue tones', () => {
  const { ctx, beats, metro, wall } = setup();
  ctx.currentTime = 10;
  wall(10);
  metro.setQuiet(true);
  vi.advanceTimersByTime(40);
  expect(beats.some((beat) => beat.late)).toBe(true);
  expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  metro.cue('end');
  expect(ctx.createOscillator).toHaveBeenCalledTimes(4);
  metro.dispose();
});
