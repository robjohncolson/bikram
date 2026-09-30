import { afterEach, expect, it, vi } from 'vitest';
import { createMetronome } from './metronome';
import { getPose } from '../data';
import { buildPoseTrack } from './cues';
import { segmentBeatPhase, segmentSettings } from '../views/pacerLifecycle';
import { PACER_DEFAULTS } from './timing';
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
    connect: () => ({ connect() {} }), start: vi.fn(), stop() {},
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

it.each([30, 60, 120])('plays exactly sixty pulses per set at %i BPM without subdividing the class clock', (bpm) => {
  vi.useFakeTimers();
  const ctx = new Context();
  vi.stubGlobal('AudioContext', function () { return ctx; });
  const track = buildPoseTrack(getPose('kapalbhati')!, 60);
  const beats: BeatEvent[] = [];
  const metro = createMetronome((beat) => beats.push(beat), () => ctx.currentTime);
  metro.update({ bpm });
  metro.setPhaseSource((serial) => segmentBeatPhase(track, Math.min(serial, track.totalBeats - 1)));
  metro.start();
  const duration = track.totalBeats * 60 / bpm + 1;
  for (let t = 0.04; t < duration; t += 0.04) {
    ctx.currentTime = t;
    // A volume or BPM settings write must never reset the count or subdivision.
    const serial = Math.max(0, beats.length - 1);
    const phase = segmentBeatPhase(track, Math.min(serial, track.totalBeats - 1));
    metro.update(segmentSettings({ ...PACER_DEFAULTS, bpm, volume: 0.2 }, phase.pacer));
    vi.advanceTimersByTime(40);
  }
  const ticks = ctx.createOscillator.mock.results.map((r) => r.value.start.mock.calls[0][0] as number);
  expect(ticks).toHaveLength(120);
  track.spans.forEach((span, i) => {
    const start = 0.12 + (span.startBeat + span.entryBeats) * 60 / bpm;
    const set = ticks.slice(i * 60, (i + 1) * 60);
    expect(set[0]).toBeCloseTo(start);
    set.slice(1).forEach((t, n) => expect(t - set[n]).toBeCloseTo(60 / bpm / (i + 1)));
  });
  beats.forEach((beat, i) => {
    expect(beat.serial).toBe(i);
    expect(beat.time).toBeCloseTo(0.12 + i * 60 / bpm);
  });
  metro.dispose();
});

it('schedules subdivision ticks only within lookahead and consumes missed pulses silently', () => {
  vi.useFakeTimers();
  const ctx = new Context();
  vi.stubGlobal('AudioContext', function () { return ctx; });
  let wall = 0;
  const beats: BeatEvent[] = [];
  const metro = createMetronome((beat) => beats.push(beat), () => wall);
  metro.update({ beatsPerBar: 1, pulsesPerBeat: 2, pulses: 6 });
  metro.start();
  expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  ctx.currentTime = wall = 0.48;
  vi.advanceTimersByTime(40);
  expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  expect(beats).toHaveLength(1);
  wall = 2.4; // suspended audio clock: four pulse slots have now elapsed
  ctx.dispatchEvent(new Event('statechange'));
  expect(beats.some((b) => b.late)).toBe(true);
  expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  for (let i = 0; i < 100; i++) {
    ctx.currentTime += 0.04;
    wall += 0.04;
    vi.advanceTimersByTime(40);
  }
  expect(ctx.createOscillator).toHaveBeenCalledTimes(3); // only the final unmissed pulse remains
  expect(beats.length).toBeGreaterThan(6); // recovery still advances the class
  metro.dispose();
});

it('keeps the remaining pulse count when the user changes BPM mid-set', () => {
  vi.useFakeTimers();
  const ctx = new Context();
  vi.stubGlobal('AudioContext', function () { return ctx; });
  const beats: BeatEvent[] = [];
  const metro = createMetronome((beat) => beats.push(beat), () => ctx.currentTime);
  metro.update({ beatsPerBar: 1, pulsesPerBeat: 2, pulses: 60 });
  metro.start();
  for (let t = 0.04; t < 25; t += 0.04) {
    ctx.currentTime = t;
    if (t > 10) metro.update({ bpm: 120, volume: 0.2 });
    vi.advanceTimersByTime(40);
  }
  const ticks = ctx.createOscillator.mock.results.map((r) => r.value.start.mock.calls[0][0] as number);
  expect(ticks).toHaveLength(60);
  expect(ticks[1] - ticks[0]).toBeCloseTo(0.5);
  expect(ticks[59] - ticks[58]).toBeCloseTo(0.25);
  expect(metro.settings).toMatchObject({ bpm: 120, pulsesPerBeat: 2, pulses: 60 });
  expect(beats.length).toBeGreaterThan(30);
  metro.dispose();
});

it('silences a pending half-beat pulse when the class pauses', () => {
  vi.useFakeTimers();
  const ctx = new Context();
  vi.stubGlobal('AudioContext', function () { return ctx; });
  let quiet = false;
  const metro = createMetronome(() => {}, () => ctx.currentTime);
  metro.update({ beatsPerBar: 1, pulsesPerBeat: 2, pulses: 60 });
  metro.setPhaseSource((serial) => ({ beat: 0, bar: serial, quiet }));
  metro.start();
  quiet = true;
  ctx.currentTime = 0.48;
  vi.advanceTimersByTime(40);
  expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  metro.dispose();
});
