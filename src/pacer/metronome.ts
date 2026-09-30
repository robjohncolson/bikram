import type { PacerSettings } from './timing';
import type { PoseSegment } from '../data';
import { beatSeconds, clampSettings, PACER_DEFAULTS } from './timing';

/**
 * Web Audio metronome with lookahead scheduling: a coarse JS interval
 * schedules sample-accurate ticks slightly ahead on the audio clock, so
 * timing survives tab jank. Sounds are soft pitch-drop sine blips:
 * inhale bars open high, exhale bars open low, mid beats stay quiet.
 */

const LOOKAHEAD_S = 0.15;
const TICK_MS = 40;
/**
 * A beat this far behind the audio clock was missed while the tab was
 * throttled. A frozen context is reconciled against the wall clock on
 * resume; every beat missed during that suspension is late. Such
 * beats are still delivered — the class clock must stay honest — but
 * flagged `late` so nothing ticks, speaks, or blinks for them in a burst.
 */
const LATE_S = 1.0;

export interface BeatEvent {
  /** absolute audio-clock time this beat sounds at */
  time: number;
  /** Duration of the scheduled integer beat, retained across its subdivisions. */
  beatSeconds: number;
  /** Zero-based slot within that beat; only slot zero advances the class. */
  subdivision: number;
  divisions: number;
  /** 0-based beat within the bar */
  beat: number;
  /** 0-based bar count since start — even bars inhale, odd exhale */
  bar: number;
  /** snapshot of settings the beat was scheduled under */
  beatsPerBar: number;
  /** delivered in a catch-up burst after a stall — silent, no visuals */
  late?: boolean;
  /** running count of beats since start — the handle a phase source keys on */
  serial: number;
}

/**
 * Where a beat falls in the breath: `beat` within its bar and the bar's
 * parity (even inhale, odd exhale). A class supplies one so the ticks
 * follow the class's breath grid instead of the metronome's own count.
 */
export interface BeatPhase {
  beat: number;
  bar: number;
  pacer?: PoseSegment['pacer'];
  /** Beats into the counted hold, negative during entry. */
  pulseBeat?: number;
  quiet?: boolean;
}

type MetronomeSettings = PacerSettings & Pick<NonNullable<PoseSegment['pacer']>, 'pulsesPerBeat' | 'pulses'>;

export interface Metronome {
  /** create/resume audio and start ticking (call from a user gesture) */
  start(): void;
  stop(): void;
  /** Freeze the next unplayed slot and cancel lookahead ticks. */
  pause(): void;
  /** Continue the preserved slot after an explicit pause. */
  resume(): void;
  /** Replace a paused track: discard its subdivision and begin a fresh beat on resume. */
  resetPausedBeat(): void;
  readonly running: boolean;
  /** merge + clamp settings; takes effect from the next scheduled beat */
  update(partial: Partial<MetronomeSettings>): void;
  readonly settings: MetronomeSettings;
  /** current audio-clock time, for syncing visuals to BeatEvent.time */
  now(): number;
  /** gentle two-note chime (class pacer pose changes) */
  chime(): void;
  /** sampler tones: 'warn' pre-change tick, 'change' hand-off chime, 'end' closing bell */
  cue(kind: 'warn' | 'change' | 'end'): void;
  /** silence the beat ticks (chimes, bells and cues still sound) — final savasana */
  setQuiet(quiet: boolean): void;
  /**
   * Let a class dictate each beat's place in the breath: called with the
   * serial of every beat as it is scheduled; a null answer (no class, or
   * paused) falls back to the metronome's own bar count, which then
   * continues from wherever the source left it.
   */
  setPhaseSource(source: ((serial: number) => BeatPhase | null) | null): void;
  /** release audio resources */
  dispose(): void;
}

export function createMetronome(
  onBeat: (e: BeatEvent) => void,
  wallNow: () => number = () => performance.now() / 1000,
): Metronome {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let settings: MetronomeSettings = { ...PACER_DEFAULTS };
  let running = false;
  let quiet = false;
  let nextTime = 0;
  let clockOffset = 0;
  let beat = 0;
  let bar = 0;
  let serial = 0;
  let subdivision = 0;
  let divisions = 1;
  let stepSeconds = 1;
  let pulseBeat = 0;
  let pulseCap: number | undefined;
  let currentBarBeats = settings.beatsPerBar;
  let pausedAt: number | null = null;
  const queued: { time: number; osc?: OscillatorNode; restore: () => void }[] = [];
  let tickOsc: OscillatorNode | undefined;
  let phaseSource: ((serial: number) => BeatPhase | null) | null = null;

  /** Bring a suspended/interrupted context back while we are meant to run
   *  (screen unlock, return from another app, end of a phone call). */
  function keepAlive() {
    if (!running || !ctx) return;
    if (ctx.state !== 'running') void ctx.resume().catch(() => {});
    else schedule();
  }

  function ensureAudio(): boolean {
    if (ctx) return true;
    if (typeof AudioContext === 'undefined') return false;
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = settings.muted ? 0 : settings.volume;
    master.connect(ctx.destination);
    ctx.addEventListener('statechange', keepAlive);
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', keepAlive);
    return true;
  }

  function blip(time: number, freq: number, peak: number, decay: number) {
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.72, time + decay * 0.7);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    osc.connect(gain).connect(master);
    tickOsc = osc;
    osc.start(time);
    osc.stop(time + decay + 0.05);
  }

  function tickSound(time: number, b: number, currentBar: number) {
    const pulse = currentBarBeats === 1;
    if (b === 0) {
      if (pulse) {
        blip(time, 560, 0.85, 0.09); // kapalbhati: every pulse firm
      } else if (currentBar % 2 === 0) {
        blip(time, 780, 0.9, 0.14); // inhale bar opens high
      } else {
        blip(time, 470, 0.9, 0.16); // exhale bar opens low
      }
    } else {
      blip(time, 620, 0.3, 0.06); // quiet mid-bar count
    }
  }

  function schedule() {
    if (!running || pausedAt !== null || !ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    while (queued.length && queued[0].time <= now) queued.shift();
    const offset = wallNow() - now;
    const frozen = offset - clockOffset;
    // Audio clocks are quantized; retain small drift until it is meaningful.
    const resumed = frozen > 0.1;
    if (resumed) {
      nextTime -= frozen;
      clockOffset = offset;
    }
    // onBeat may stop the metronome, so `running` can change inside the loop.
    // oxlint-disable-next-line no-unmodified-loop-condition
    while (running && nextTime < now + LOOKAHEAD_S) {
      const saved = { nextTime, beat, bar, serial, subdivision, divisions, stepSeconds, pulseBeat, pulseCap, currentBarBeats };
      const restore = () => {
        ({ nextTime, beat, bar, serial, subdivision, divisions, stepSeconds, pulseBeat, pulseCap, currentBarBeats } = saved);
      };
      tickOsc = undefined;
      const late = now - nextTime > LATE_S || (resumed && nextTime < now);
      const ph = phaseSource?.(serial) ?? null;
      if (ph?.quiet !== undefined) quiet = ph.quiet;
      if (subdivision === 0) {
        if (ph) {
          beat = ph.beat;
          bar = ph.bar;
        }
        const pacer = ph?.pacer ?? settings;
        currentBarBeats = pacer?.beatsPerBar ?? settings.beatsPerBar;
        divisions = Math.max(1, Math.round(pacer?.pulsesPerBeat ?? 1));
        pulseCap = pacer?.pulses;
        pulseBeat = ph?.pulseBeat ?? serial;
        stepSeconds = beatSeconds(settings.bpm) / divisions;
      }
      const pulse = pulseBeat * divisions + subdivision;
      const audible = pulseCap === undefined || (pulse >= 0 && pulse < pulseCap);
      if (!late && !quiet && audible && (subdivision === 0 || nextTime >= now)) tickSound(nextTime, beat, bar);
      onBeat({ time: late ? now : nextTime, beat, bar, beatsPerBar: currentBarBeats,
        beatSeconds: stepSeconds * divisions, subdivision, divisions, late, serial });
      if (!late && nextTime > now) queued.push({ time: nextTime, osc: tickOsc, restore });
      nextTime += stepSeconds;
      subdivision += 1;
      if (subdivision < divisions) continue;
      subdivision = 0;
      serial += 1;
      beat += 1;
      if (beat >= settings.beatsPerBar) {
        beat = 0;
        bar += 1;
      }
    }
  }

  return {
    get running() {
      return running;
    },
    get settings() {
      return settings;
    },
    start() {
      // already running: a fresh gesture may still be what a suspended
      // context (created outside one) has been waiting for
      if (running) {
        keepAlive();
        return;
      }
      if (!ensureAudio() || !ctx) return;
      void ctx.resume().catch(() => {});
      running = true;
      pausedAt = null;
      beat = 0;
      bar = 0;
      serial = 0;
      subdivision = 0;
      clockOffset = wallNow() - ctx.currentTime;
      nextTime = ctx.currentTime + 0.12;
      schedule();
      timer = setInterval(schedule, TICK_MS);
    },
    pause() {
      if (!ctx || pausedAt !== null) return;
      pausedAt = ctx.currentTime;
      const pauseTime = ctx.currentTime;
      const pending = queued.filter((slot) => slot.time > pauseTime);
      pending[0]?.restore();
      for (const slot of pending) slot.osc?.stop(ctx.currentTime);
      queued.length = 0;
    },
    resume() {
      if (!ctx || pausedAt === null) return;
      nextTime += ctx.currentTime - pausedAt;
      pausedAt = null;
      clockOffset = wallNow() - ctx.currentTime;
      schedule();
    },
    resetPausedBeat() {
      this.pause();
      if (pausedAt === null) return;
      subdivision = 0;
      beat = 0;
      bar = 0;
      serial = 0;
      nextTime = pausedAt + 0.12;
    },
    stop() {
      running = false;
      pausedAt = null;
      for (const slot of queued) if (ctx && slot.time > ctx.currentTime) slot.osc?.stop(ctx.currentTime);
      queued.length = 0;
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    },
    update(partial) {
      const merged = { ...settings, ...partial };
      settings = { ...clampSettings(merged), pulsesPerBeat: merged.pulsesPerBeat, pulses: merged.pulses };
      if (master && ctx) {
        master.gain.setTargetAtTime(settings.muted ? 0 : settings.volume, ctx.currentTime, 0.02);
      }
      // if the bar shrank below the current beat position, resync cleanly
      if (beat >= settings.beatsPerBar) beat = 0;
    },
    now() {
      return ctx ? ctx.currentTime : 0;
    },
    setQuiet(q) {
      quiet = q;
    },
    setPhaseSource(source) {
      phaseSource = source;
    },
    chime() {
      this.cue('change');
    },
    cue(kind) {
      if (!ensureAudio() || !ctx) return;
      const t = ctx.currentTime + 0.02;
      if (kind === 'warn') {
        blip(t, 880, 0.45, 0.08); // one bright tick
      } else if (kind === 'change') {
        blip(t, 523.25, 0.6, 0.25); // C5
        blip(t + 0.18, 659.25, 0.6, 0.35); // E5
      } else {
        blip(t, 659.25, 0.55, 0.3); // E5 → C5 → G4, a settling bell
        blip(t + 0.35, 523.25, 0.55, 0.3);
        blip(t + 0.7, 392.0, 0.6, 0.6);
      }
    },
    dispose() {
      this.stop();
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', keepAlive);
      if (ctx) {
        ctx.removeEventListener('statechange', keepAlive);
        void ctx.close();
        ctx = null;
        master = null;
      }
    },
  };
}
