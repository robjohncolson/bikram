import type { PacerSettings } from './timing';
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
 * throttled or the context suspended (screen lock, backgrounding). Such
 * beats are still delivered — the class clock must stay honest — but
 * flagged `late` so nothing ticks, speaks, or blinks for them in a burst.
 */
const LATE_S = 1.0;

export interface BeatEvent {
  /** absolute audio-clock time this beat sounds at */
  time: number;
  /** 0-based beat within the bar */
  beat: number;
  /** 0-based bar count since start — even bars inhale, odd exhale */
  bar: number;
  /** snapshot of settings the beat was scheduled under */
  beatsPerBar: number;
  /** delivered in a catch-up burst after a stall — silent, no visuals */
  late?: boolean;
}

export interface Metronome {
  /** create/resume audio and start ticking (call from a user gesture) */
  start(): void;
  stop(): void;
  readonly running: boolean;
  /** merge + clamp settings; takes effect from the next scheduled beat */
  update(partial: Partial<PacerSettings>): void;
  readonly settings: PacerSettings;
  /** current audio-clock time, for syncing visuals to BeatEvent.time */
  now(): number;
  /** gentle two-note chime (class pacer pose changes) */
  chime(): void;
  /** sampler tones: 'warn' pre-change tick, 'change' hand-off chime, 'end' closing bell */
  cue(kind: 'warn' | 'change' | 'end'): void;
  /** silence the beat ticks (chimes, bells and cues still sound) — final savasana */
  setQuiet(quiet: boolean): void;
  /** release audio resources */
  dispose(): void;
}

export function createMetronome(onBeat: (e: BeatEvent) => void): Metronome {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let settings: PacerSettings = { ...PACER_DEFAULTS };
  let running = false;
  let quiet = false;
  let nextTime = 0;
  let beat = 0;
  let bar = 0;

  /** Bring a suspended/interrupted context back while we are meant to run
   *  (screen unlock, return from another app, end of a phone call). */
  function keepAlive() {
    if (running && ctx && ctx.state !== 'running') void ctx.resume();
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
    osc.start(time);
    osc.stop(time + decay + 0.05);
  }

  function tickSound(time: number, b: number, currentBar: number) {
    const pulse = settings.beatsPerBar === 1;
    if (b === 0) {
      if (pulse) {
        blip(time, 560, 0.85, 0.09); // kapalbhati pulse: every beat firm
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
    if (!ctx) return;
    const now = ctx.currentTime;
    while (nextTime < now + LOOKAHEAD_S) {
      const late = now - nextTime > LATE_S;
      if (!late && !quiet) tickSound(nextTime, beat, bar);
      onBeat({ time: late ? now : nextTime, beat, bar, beatsPerBar: settings.beatsPerBar, late });
      nextTime += beatSeconds(settings.bpm);
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
      if (running || !ensureAudio() || !ctx) return;
      void ctx.resume();
      running = true;
      beat = 0;
      bar = 0;
      nextTime = ctx.currentTime + 0.12;
      schedule();
      timer = setInterval(schedule, TICK_MS);
    },
    stop() {
      running = false;
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    },
    update(partial) {
      settings = clampSettings({ ...settings, ...partial });
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
