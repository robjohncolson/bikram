import { afterEach, expect, it, vi } from 'vitest';
import { createMetronome } from './metronome';
import { getPose } from '../data';
import { buildPoseTrack } from './cues';
import { classFigurePosition, figureBeatProgress, segmentBeatPhase, segmentSettings } from '../views/pacerLifecycle';
import { PACER_DEFAULTS } from './timing';
import { figureFrameAt, figurePlan } from './figure';
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
    connect: () => ({ connect() {} }), start: vi.fn(), stop: vi.fn(),
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
    const serial = beats.at(-1)?.serial ?? 0;
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
  beats.filter((beat) => beat.subdivision === 0).forEach((beat, i) => {
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
  expect(beats.filter((beat) => beat.subdivision === 0)).toHaveLength(1);
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


it.each([0.2, 0.45, 0.9])('preserves all pulses and figure edges through a pause %s seconds after an integer tick', (pauseOffset) => {
  vi.useFakeTimers();
  const ctx = new Context();
  vi.stubGlobal('AudioContext', function () { return ctx; });
  const pose = getPose('kapalbhati')!;
  const track = buildPoseTrack(pose, 60);
  let left = track.totalBeats;
  let anchor: { serial: number; beat: number } | undefined;
  let pending: BeatEvent[] = [];
  const pumps = [0, 0];
  const pumpTimes: number[] = [];
  const metro = createMetronome((event) => pending.push(event), () => ctx.currentTime);
  metro.setPhaseSource((serial) => segmentBeatPhase(track,
    Math.min(track.totalBeats - 1, anchor ? anchor.beat + serial - anchor.serial : track.totalBeats - left)));
  const pauseTime = 0.12 + track.spans[1].startBeat + track.spans[1].entryBeats + 5 + pauseOffset;
  let didPause = false;
  metro.start();
  for (let t = 0; t < track.totalBeats + 4; t += 0.01) {
    ctx.currentTime = t;
    if (!didPause && t >= pauseTime) {
      metro.pause();
      pending = []; // Pacer clears callbacks for cancelled queued ticks.
      ctx.currentTime = t + 2;
      vi.advanceTimersByTime(2000);
      metro.resume();
      t += 2;
      didPause = true;
    }
    vi.advanceTimersByTime(10);
    while (pending.length && pending[0].time <= ctx.currentTime) {
      const event = pending.shift()!;
      if (event.subdivision === 0) {
        anchor = { serial: event.serial, beat: track.totalBeats - left };
        left--; // tickClass consumes this beat before rendering.
      }
      const position = classFigurePosition(track, track.totalBeats, left)!;
      const plan = figurePlan(pose, { track, beatSeconds: event.beatSeconds, leadBeats: track.barBeats })!;
      const segment = plan.segments[position.index];
      if (segment.kind !== 'pulse') throw new Error('expected pulse');
      const progress = figureBeatProgress(event.time * 1000, event.time * 1000,
        event.beatSeconds, event.subdivision, event.divisions);
      const frame = figureFrameAt(segment, { seconds: (position.beatsIn + progress) * event.beatSeconds,
        total: position.beats * event.beatSeconds, beatProgress: progress }).frame;
      const ph = segmentBeatPhase(track, Math.min(track.totalBeats - 1, track.totalBeats - left - 1));
      if (!ph.quiet) {
        expect(frame).toBe(segment.from);
        pumps[position.index]++;
        pumpTimes.push(event.time);
      } else {
        expect(frame).not.toBe(segment.from);
      }
    }
  }
  const heard = ctx.createOscillator.mock.results.map((result) => result.value).filter((osc) => {
    const start = osc.start.mock.calls[0][0] as number;
    return !osc.stop.mock.calls.some(([stop]: [number]) => stop < start);
  });
  expect(heard).toHaveLength(120);
  expect(pumps).toEqual([60, 60]);
  expect(pumpTimes).toEqual(heard.map((osc) => osc.start.mock.calls[0][0]));
  expect(didPause).toBe(true);
  if (pauseOffset === 0.45) expect(ctx.createOscillator.mock.results.some(({ value }) => value.stop.mock.calls.length > 1)).toBe(true);
  metro.dispose();
});

it('holds the scheduled duration for a tempo transition beat in both clocks', () => {
  vi.useFakeTimers();
  const ctx = new Context();
  vi.stubGlobal('AudioContext', function () { return ctx; });
  const beats: BeatEvent[] = [];
  const metro = createMetronome((event) => beats.push(event), () => ctx.currentTime);
  metro.update({ bpm: 60, beatsPerBar: 1, pulsesPerBeat: 2 });
  metro.start();
  ctx.currentTime = 0.2;
  metro.update({ bpm: 120 });
  const first = beats[0];
  expect(figureBeatProgress(370, first.time * 1000, first.beatSeconds)).toBeCloseTo(0.25);
  ctx.currentTime = 0.5;
  vi.advanceTimersByTime(40);
  expect(beats[1]).toMatchObject({ time: 0.62, beatSeconds: 1, subdivision: 1 });
  expect(figureBeatProgress(620, beats[1].time * 1000, beats[1].beatSeconds, beats[1].subdivision, beats[1].divisions)).toBe(0.5);
  ctx.currentTime = 1;
  vi.advanceTimersByTime(40);
  expect(beats[2].beatSeconds).toBe(0.5);
  expect(beats[2].time).toBeCloseTo(1.12);
  metro.dispose();
});
