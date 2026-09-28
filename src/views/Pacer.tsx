import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode } from 'react';
import {
  BPM_MAX,
  BPM_MIN,
  CLOSING_LINE,
  CLOSING_SECONDS,
  PACER_PRESETS,
  PROGRAMS,
  announceText,
  beatSeconds,
  beatsForSeconds,
  breathsPerMinute,
  buildPoseTrack,
  clampSettings,
  clipFor,
  clipsAvailable,
  createMetronome,
  createWakeLock,
  breathPhaseFromBeat,
  phaseSeconds,
  playClip,
  programById,
  classMinutes as programMinutes,
  programPoses,
  segmentAtBeat,
  phaseAtBeat,
  cueWhen,
  poseGridSeconds,
  DEFAULT_BAR_BEATS,
  silenceVoice,
  speak,
  speechSupported,
  stopClips,
  stopSpeaking,
  unlockClips,
  watchVoices,
} from '../pacer';
import type { BeatEvent, BreathCue, ClassProgram, Metronome, PacerSettings, PoseTrack, VoiceChoice, WakeLock } from '../pacer';
import type { Pose } from '../data';
import { poses } from '../data';
import {
  amendLastClass,
  applyEvidence,
  band,
  daysSince,
  lastClass,
  loadJournal,
  loadStore,
  nodeP,
  practiceStreak,
  recordClass,
  saveJournal,
  saveStore,
} from '../trainer';
import { PoseFigure } from '../components/PoseFigure';
import { PacerClassMode } from './PacerClassMode';
import { CoachDebrief } from './CoachDebrief';
import { COACH_PROGRAM_ID, loadCoachProgram, saveCoachProgram, validateProposal } from '../coach';
import './Pacer.css';

const STORAGE_KEY = 'yoga-pacer-v1';
const BEAT_CHOICES = [1, 2, 3, 4, 6, 8];

/** The class pacer walks the 26 postures on the metronome clock. */
type ClassRun =
  | { phase: 'idle' }
  | {
      phase: 'running' | 'paused';
      idx: number;
      left: number;
      budget: number;
      /** false while a rehearsal withholds the posture's identity */
      revealed: boolean;
    }
  | { phase: 'closing'; left: number; budget: number }
  | { phase: 'done'; pacedSeconds: number; rehearsedFrom?: number };

/**
 * `/pace?program=short|coach` picks a program; `/pace?from=<order>` implies
 * the full class; `/pace?build=<base64 json>` carries a proposed class in
 * the coach's format (a link handed over after a debrief elsewhere) — it
 * is validated like any proposal and, when it holds, saved as the coach's
 * build and started from.
 */
function initialProgram(coach: ClassProgram | undefined): ClassProgram {
  const q = new URLSearchParams(window.location.search);
  const build = q.get('build');
  if (build) {
    try {
      const r = validateProposal(JSON.parse(atob(build.replace(/-/g, '+').replace(/_/g, '/'))));
      if (r.ok) {
        saveCoachProgram(r.proposal.program);
        return r.proposal.program;
      }
    } catch {
      /* not a build link: fall through */
    }
  }
  if (q.get('from')) return programById('full');
  const id = q.get('program');
  if (id === COACH_PROGRAM_ID && coach) return coach;
  return programById(id);
}

/** Canonical seconds before each posture of a class (on the breath grid), and the class total. */
function classClock(list: Pose[], beatsPerBar: number): { offsets: number[]; total: number } {
  const offsets: number[] = [];
  let t = 0;
  for (const p of list) {
    offsets.push(t);
    t += poseGridSeconds(p, beatsPerBar);
  }
  return { offsets, total: t };
}

/** The posture whose figure and name stand for the final savasana. */
const SAVASANA_IDX = poses.findIndex((p) => p.id === 'savasana');

/** Rehearsal: beats between the hand-off chime and the announce. */
const REHEARSAL_DELAY_BEATS = 4;

/** Local day index — rotates the coaching material once a day. */
function dayIndex(): number {
  const d = new Date();
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / 86_400_000);
}

/** Spoken-instruction preferences, persisted alongside the engine settings. */
interface CuePrefs {
  enabled: boolean;
  voiceName: string | null;
  sanskrit: boolean;
  guides: boolean;
  /** rehearsal: recall each posture before the voice announces it */
  rehearse: boolean;
}

const CUE_DEFAULTS: CuePrefs = {
  enabled: true,
  voiceName: null,
  sanskrit: false,
  guides: true,
  rehearse: false,
};

function restoreSettings(): PacerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // clampSettings ignores the extra `cues` field in the stored JSON.
    return clampSettings(raw ? (JSON.parse(raw) as Partial<PacerSettings>) : null);
  } catch {
    return clampSettings(null);
  }
}

function restoreCues(): CuePrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    const c =
      parsed && typeof parsed === 'object'
        ? (parsed as { cues?: Partial<CuePrefs> }).cues
        : undefined;
    if (!c || typeof c !== 'object') return { ...CUE_DEFAULTS };
    return {
      enabled: typeof c.enabled === 'boolean' ? c.enabled : CUE_DEFAULTS.enabled,
      voiceName: typeof c.voiceName === 'string' ? c.voiceName : CUE_DEFAULTS.voiceName,
      sanskrit: typeof c.sanskrit === 'boolean' ? c.sanskrit : CUE_DEFAULTS.sanskrit,
      guides: typeof c.guides === 'boolean' ? c.guides : CUE_DEFAULTS.guides,
      rehearse: typeof c.rehearse === 'boolean' ? c.rehearse : CUE_DEFAULTS.rehearse,
    };
  } catch {
    return { ...CUE_DEFAULTS };
  }
}

/** Remaining counts rendered like a clock: at 60 BPM a count is a second. */
function mss(counts: number): string {
  const c = Math.max(0, counts);
  return `${Math.floor(c / 60)}:${String(c % 60).padStart(2, '0')}`;
}

function fmtRate(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function SpeakerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}

export function Pacer() {
  const [settings, setSettings] = useState<PacerSettings>(restoreSettings);
  const [cues, setCues] = useState<CuePrefs>(restoreCues);
  const [voices, setVoices] = useState<VoiceChoice[]>([]);
  const [running, setRunning] = useState(false);
  const [beatView, setBeatView] = useState<{ beat: number; bar: number; beatsPerBar: number } | null>(null);
  const [classRun, setClassRun] = useState<ClassRun>({ phase: 'idle' });
  /** the class-mode figure's breath: follows bar parity while the class
   *  runs, holds (frozen) while it is paused, undefined in pulse mode */
  const [breath, setBreath] = useState<BreathCue | undefined>(undefined);
  /** the class the coach proposed after the last debrief, once adopted */
  const [coachProgram, setCoachProgram] = useState<ClassProgram | undefined>(loadCoachProgram);
  const [program, setProgram] = useState<ClassProgram>(() => initialProgram(loadCoachProgram()));
  const programs = useMemo(() => (coachProgram ? [...PROGRAMS, coachProgram] : PROGRAMS), [coachProgram]);
  /** The program's postures, trimmed — the class walks this list. */
  const classPoses = useMemo(() => programPoses(program), [program]);
  const clock = useMemo(() => classClock(classPoses, settings.beatsPerBar), [classPoses, settings.beatsPerBar]);
  // /pace?from=<order> — a posture page's "practice from here"
  const [startIdx, setStartIdx] = useState(() => {
    const from = Number(new URLSearchParams(window.location.search).get('from'));
    return Number.isInteger(from) && from >= 1 && from <= poses.length ? from - 1 : 0;
  });
  const [immersed, setImmersed] = useState(false);

  const settingsRef = useRef(settings);
  const cuesRef = useRef(cues);
  const classRef = useRef<ClassRun>(classRun);
  const trackRef = useRef<PoseTrack | null>(null);
  const pacedRef = useRef(0);
  const metRef = useRef<Metronome | null>(null);
  const lockRef = useRef<WakeLock | null>(null);
  const immerseBtnRef = useRef<HTMLButtonElement | null>(null);
  const timeoutsRef = useRef<Set<number>>(new Set());
  /** A stall (throttled tab, suspended audio) is being caught up silently. */
  const stalledRef = useRef(false);
  /** A posture hand-off happened inside a stall — owe one orientation cue. */
  const stallHandoffRef = useRef(false);
  /** The running class's postures and program, fixed at Begin. */
  const posesRef = useRef<Pose[]>(classPoses);
  const programRef = useRef<ClassProgram>(program);
  /** Where this class started — the rehearsal debrief lists hand-offs from here. */
  const classFromRef = useRef(0);
  const classStartedAtRef = useRef(0);
  /** Segment whose metronome override is currently applied ("idx:segIndex"). */
  const segAppliedRef = useRef<string | null>(null);
  /** The breath grid the running class was compiled on (the user's count at Begin). */
  const classBarRef = useRef(DEFAULT_BAR_BEATS);
  /** The last delivered beat: its metronome serial and class beat, so the
   *  metronome can be told the breath phase of every beat it schedules. */
  const anchorRef = useRef<{ serial: number; beatIdx: number; track: PoseTrack | null } | null>(null);

  /** setTimeout that gets cleaned up when the pacer stops or unmounts. */
  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
  }, []);

  /** Drop deferred beat visuals/ticks — beats already scheduled up to
   *  ~150ms ahead must not land after the user asks for silence. */
  const clearPending = useCallback(() => {
    for (const id of timeoutsRef.current) clearTimeout(id);
    timeoutsRef.current.clear();
  }, []);

  const commitClass = useCallback((next: ClassRun) => {
    classRef.current = next;
    setClassRun(next);
  }, []);

  /** Compile a posture's cue timeline. Tracks are always built at the
   *  60 BPM reference, so one count = one canonical class second and the
   *  budget equals approxTotalSeconds. The metronome tempo then sets how
   *  fast counts actually tick — slow the tempo and the class stretches,
   *  exactly as the idle card's math promises. */
  const buildTrack = useCallback((idx: number) => {
    const p = cuesRef.current;
    return buildPoseTrack(posesRef.current[idx], 60, {
      sanskrit: p.sanskrit,
      guides: p.guides,
      rotation: dayIndex(),
      announceDelayBeats: p.rehearse ? REHEARSAL_DELAY_BEATS : 0,
      beatsPerBar: classBarRef.current,
    });
  }, []);

  /** One spoken cue through the sampler: the studio-voice clip when one
   *  exists and the voice preference allows it, else speech synthesis.
   *  Interrupts silence BOTH channels so an announce always cuts through. */
  const sayCue = useCallback((text: string, interrupt: boolean) => {
    const prefs = cuesRef.current;
    const s = settingsRef.current;
    const wantClips = prefs.voiceName === null || prefs.voiceName === '~studio';
    const url = wantClips ? clipFor(text) : undefined;
    if (url) {
      if (interrupt) stopSpeaking();
      playClip(url, {
        volume: s.volume,
        interrupt,
        // a clip that will not load or play (offline miss, decoder hiccup,
        // autoplay refusal) must not leave a hole in the class
        fallback: () => speak(text, { interrupt: false, volume: s.volume }),
      });
    } else {
      if (interrupt) stopClips();
      speak(text, {
        voiceName: prefs.voiceName && !prefs.voiceName.startsWith('~') ? prefs.voiceName : undefined,
        interrupt,
        volume: s.volume,
      });
    }
  }, []);

  /** Render any cue events due at this 0-based beat of the active hold. */
  const fireCues = useCallback(
    (beatIdx: number) => {
      const track = trackRef.current;
      if (!track) return;
      const prefs = cuesRef.current;
      const s = settingsRef.current;
      // clips speak even where speech synthesis is unsupported
      const speakable = prefs.enabled && !s.muted && (speechSupported() || clipsAvailable());
      for (const ev of track.events) {
        if (ev.atBeat !== beatIdx) continue;
        if (ev.kind === 'warn') {
          metRef.current?.cue('warn'); // tone; engine mute already zeroes it
        } else if (speakable && ev.text) {
          sayCue(ev.text, ev.kind === 'announce');
        }
      }
    },
    [sayCue],
  );

  /** Apply a segment's metronome override (or restore the user's setting). */
  const applySegmentPacer = useCallback((key: string | null, beatsPerBar?: number) => {
    if (segAppliedRef.current === key) return;
    segAppliedRef.current = key;
    metRef.current?.update({ beatsPerBar: beatsPerBar ?? settingsRef.current.beatsPerBar });
  }, []);

  /** The class is over: bell, silence, journal, done screen. */
  const finishClass = useCallback(() => {
    const m = metRef.current;
    silenceVoice();
    m?.cue('end');
    m?.stop();
    m?.setQuiet(false);
    applySegmentPacer(null);
    clearPending();
    setRunning(false);
    setBeatView(null);
    trackRef.current = null;
    anchorRef.current = null;
    const journal = loadJournal();
    const endedAt = Date.now();
    const list = posesRef.current;
    recordClass(journal, {
      startedAt: classStartedAtRef.current || endedAt,
      endedAt,
      fromOrder: list[classFromRef.current]?.order ?? 1,
      toOrder: list[list.length - 1]?.order ?? poses.length,
      pacedSeconds: Math.round(pacedRef.current),
      bpm: settingsRef.current.bpm,
      rehearsed: cuesRef.current.rehearse,
      program: programRef.current.id,
    });
    saveJournal(journal);
    commitClass({
      phase: 'done',
      pacedSeconds: pacedRef.current,
      rehearsedFrom: cuesRef.current.rehearse ? classFromRef.current : undefined,
    });
  }, [applySegmentPacer, clearPending, commitClass]);

  /** One counted beat of class time: cue, decrement, hand off postures.
   *  `late` beats arrive in a burst after a stall (screen lock, background
   *  tab): they advance the class clock but stay silent, and the first
   *  live beat afterwards speaks one orientation cue if a hand-off went by. */
  const tickClass = useCallback(
    (late = false, serial?: number) => {
      const c = classRef.current;
      if (c.phase === 'closing') {
        if (serial !== undefined) anchorRef.current = { serial, beatIdx: c.budget - c.left, track: null };
        pacedRef.current += beatSeconds(settingsRef.current.bpm);
        const left = c.left - 1;
        if (left > 0) commitClass({ ...c, left });
        else finishClass();
        return;
      }
      if (c.phase !== 'running') return;
      // Current beat index into the hold — beat 0 is the posture's first
      // counted beat, so the announce lands the moment a hold begins.
      const beatIdx = c.budget - c.left;
      if (serial !== undefined) anchorRef.current = { serial, beatIdx, track: trackRef.current };
      // a segment may ask the metronome for its own count (never its own tempo)
      const track = trackRef.current;
      const segNow = track ? segmentAtBeat(track, beatIdx) : null;
      const segData = segNow ? track?.pose.segments?.[segNow.index] : undefined;
      applySegmentPacer(segNow ? `${c.idx}:${segNow.index}` : `${c.idx}:-`, segData?.pacer?.beatsPerBar);
      if (late) {
        stalledRef.current = true;
      } else {
        if (stalledRef.current) {
          stalledRef.current = false;
          // a live beat 0 speaks its own announce; otherwise re-orient once
          if (stallHandoffRef.current && beatIdx > 0) {
            metRef.current?.chime();
            sayCue(announceText(posesRef.current[c.idx], cuesRef.current.sanskrit), true);
          }
          stallHandoffRef.current = false;
        }
        fireCues(beatIdx);
      }
      pacedRef.current += beatSeconds(settingsRef.current.bpm);
      // a rehearsal reveals the posture the moment its announce beat arrives
      const announceAt = trackRef.current?.events.find((e) => e.kind === 'announce')?.atBeat ?? 0;
      const revealed = c.revealed || beatIdx >= announceAt;
      const left = c.left - 1;
      if (left > 0) {
        commitClass({ ...c, left, revealed });
        return;
      }
      if (c.idx >= posesRef.current.length - 1) {
        // the last posture is done: a quiet final savasana, then the bell
        silenceVoice();
        metRef.current?.chime();
        metRef.current?.setQuiet(true);
        applySegmentPacer('closing');
        trackRef.current = null;
        const budget = beatsForSeconds(CLOSING_SECONDS, 60);
        if (!late) sayCue(CLOSING_LINE, true);
        commitClass({ phase: 'closing', left: budget, budget });
      } else {
        if (late) stallHandoffRef.current = true;
        else metRef.current?.chime();
        const idx = c.idx + 1;
        const track = buildTrack(idx);
        trackRef.current = track;
        commitClass({
          phase: 'running',
          idx,
          left: track.totalBeats,
          budget: track.totalBeats,
          revealed: !cuesRef.current.rehearse,
        });
      }
    },
    [applySegmentPacer, buildTrack, commitClass, finishClass, fireCues, sayCue],
  );

  // One metronome per mount. Beat events arrive up to ~150ms early on the
  // audio clock; visuals are deferred to the moment the beat sounds.
  useEffect(() => {
    const m = createMetronome((e: BeatEvent) => {
      if (e.late) {
        tickClass(true, e.serial); // catch-up after a stall: clock moves, nothing sounds
        return;
      }
      const delay = Math.max(0, (e.time - m.now()) * 1000);
      later(() => {
        setBeatView({ beat: e.beat, bar: e.bar, beatsPerBar: e.beatsPerBar });
        const c = classRef.current;
        const bs = beatSeconds(settingsRef.current.bpm);
        if (c.phase === 'running') {
          // the class's own breath grid, not the metronome's bar count
          const tr = trackRef.current;
          const ph = tr ? phaseAtBeat(tr, c.budget - c.left) : null;
          setBreath(ph && ph.phase !== 'pulse' && tr ? { phase: ph.phase, seconds: tr.barBeats * bs } : undefined);
        } else if (c.phase === 'closing') {
          setBreath(breathPhaseFromBeat(e.bar, e.beatsPerBar, bs));
        } else if (c.phase !== 'paused') {
          setBreath(undefined);
        }
        tickClass(false, e.serial);
      }, delay);
    });
    // Every beat the metronome schedules asks the class where it falls in
    // the breath, so the ticks (high inhale, low exhale) follow the grid the
    // cues are addressed on. No class, or paused: the metronome's own count.
    m.setPhaseSource((serial) => {
      const a = anchorRef.current;
      const c = classRef.current;
      if (!a || (c.phase !== 'running' && c.phase !== 'closing')) return null;
      const t = a.beatIdx + (serial - a.serial);
      if (a.track && t < a.track.totalBeats) {
        const ph = phaseAtBeat(a.track, t);
        return { beat: ph.beatInBar, bar: ph.bar };
      }
      // past the anchor's posture: the next one opens on an inhale
      const u = a.track ? t - a.track.totalBeats : t;
      const bpb = m.settings.beatsPerBar;
      return { beat: u % bpb, bar: Math.floor(u / bpb) };
    });
    metRef.current = m;
    m.update(settingsRef.current);
    return () => {
      clearPending();
      silenceVoice();
      m.stop();
      m.dispose();
      if (metRef.current === m) metRef.current = null;
    };
  }, [clearPending, later, tickClass]);

  // Keep the engine and localStorage in step with every settings change.
  // One save path: engine settings and cue prefs share the one stored JSON.
  useEffect(() => {
    settingsRef.current = settings;
    metRef.current?.update(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, cues }));
    } catch {
      // storage unavailable — the pacer still works, it just won't remember
    }
  }, [settings, cues]);

  // Cue prefs feed tickClass through a ref; a mid-class change also rebuilds
  // the active track's events but keeps the stored budget/left, so the
  // countdown does not jump — past beats' events are naturally skipped
  // because their atBeat is behind budget − left. Tracks always compile at
  // the 60 BPM reference, so the rebuilt totalBeats equals the live budget.
  useEffect(() => {
    cuesRef.current = cues;
    const c = classRef.current;
    if (c.phase === 'running' || c.phase === 'paused') {
      trackRef.current = buildPoseTrack(posesRef.current[c.idx], 60, {
        sanskrit: cues.sanskrit,
        guides: cues.guides,
        rotation: dayIndex(),
        announceDelayBeats: cues.rehearse ? REHEARSAL_DELAY_BEATS : 0,
        beatsPerBar: classBarRef.current,
      });
      // switching rehearsal off mid-class shows the posture at once
      if (!cues.rehearse && !c.revealed) commitClass({ ...c, revealed: true });
    }
  }, [cues, commitClass]);

  // Voices load asynchronously; watchVoices calls back now and on changes.
  useEffect(() => watchVoices(setVoices), []);

  // Keep the screen awake while the metronome runs (guarded no-op where
  // the Wake Lock API is missing; re-acquires after tab switches).
  useEffect(() => {
    const lock = createWakeLock();
    lockRef.current = lock;
    return () => {
      lock.dispose();
      if (lockRef.current === lock) lockRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (running) lockRef.current?.acquire();
    else lockRef.current?.release();
  }, [running]);

  // Immersion only exists while a class is running or paused.
  useEffect(() => {
    if (classRun.phase !== 'running' && classRun.phase !== 'paused' && classRun.phase !== 'closing') setImmersed(false);
  }, [classRun.phase]);

  const exitImmersion = useCallback(() => {
    setImmersed(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    immerseBtnRef.current?.focus();
  }, []);

  const applySettings = useCallback((partial: Partial<PacerSettings>) => {
    setSettings((s) => clampSettings({ ...s, ...partial }));
  }, []);

  const applyCues = useCallback((partial: Partial<CuePrefs>) => {
    setCues((c) => ({ ...c, ...partial }));
  }, []);

  const toggleMetronome = useCallback(() => {
    const m = metRef.current;
    if (!m) return;
    if (m.running) {
      m.stop();
      clearPending();
      silenceVoice();
      setRunning(false);
      setBeatView(null);
    } else {
      unlockClips(); // inside the gesture: mobile browsers need it here
      m.start();
      setRunning(true);
    }
  }, [clearPending]);

  const skipPose = useCallback(
    (dir: -1 | 1) => {
      const c = classRef.current;
      if (c.phase !== 'running' && c.phase !== 'paused') return;
      const idx = c.idx + dir;
      if (idx < 0 || idx >= posesRef.current.length) return;
      silenceVoice();
      metRef.current?.chime();
      anchorRef.current = null;
      const track = buildTrack(idx);
      trackRef.current = track;
      commitClass({
        phase: c.phase,
        idx,
        left: track.totalBeats,
        budget: track.totalBeats,
        revealed: !cuesRef.current.rehearse,
      });
    },
    [buildTrack, commitClass],
  );

  const beginClass = useCallback(() => {
    const m = metRef.current;
    if (!m) return;
    unlockClips(); // inside the gesture: mobile browsers need it here
    if (!m.running) {
      m.start();
      setRunning(true);
    }
    pacedRef.current = 0;
    stalledRef.current = false;
    stallHandoffRef.current = false;
    anchorRef.current = null;
    classBarRef.current = settingsRef.current.beatsPerBar;
    posesRef.current = classPoses;
    programRef.current = program;
    const from = Math.min(startIdx, classPoses.length - 1);
    classFromRef.current = from;
    classStartedAtRef.current = Date.now();
    const track = buildTrack(from);
    trackRef.current = track;
    // the first posture was chosen by hand — nothing to recall yet
    commitClass({ phase: 'running', idx: from, left: track.totalBeats, budget: track.totalBeats, revealed: true });
  }, [buildTrack, classPoses, commitClass, program, startIdx]);

  const toggleClassPause = useCallback(() => {
    const c = classRef.current;
    if (c.phase === 'running') {
      silenceVoice();
      anchorRef.current = null;
      commitClass({ ...c, phase: 'paused' });
    } else if (c.phase === 'paused') {
      // resume on an inhale: rewind to the start of the breath that was cut
      const tr = trackRef.current;
      const back = tr ? (c.budget - c.left) % tr.breathBeats : 0;
      commitClass({ ...c, phase: 'running', left: Math.min(c.budget, c.left + back) });
    }
  }, [commitClass]);

  const endClass = useCallback(() => {
    silenceVoice();
    metRef.current?.setQuiet(false);
    applySegmentPacer(null);
    trackRef.current = null;
    anchorRef.current = null;
    commitClass({ phase: 'idle' });
  }, [applySegmentPacer, commitClass]);

  /** Test-drive the chosen voice on the posture currently in view. */
  const previewVoice = useCallback(() => {
    const c = classRef.current;
    const running = c.phase === 'running' || c.phase === 'paused';
    const pose = (running ? posesRef.current[c.idx] : classPoses[startIdx]) ?? poses[0];
    sayCue(announceText(pose, cuesRef.current.sanskrit), true);
  }, [classPoses, sayCue, startIdx]);

  // Keyboard: Space start/pause, [ ] tempo, arrows skip posture in class.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'SELECT' ||
          t.tagName === 'TEXTAREA' ||
          t.tagName === 'BUTTON' ||
          t.isContentEditable)
      ) {
        return;
      }
      if (ev.code === 'Space') {
        if (ev.repeat) return;
        ev.preventDefault();
        toggleMetronome();
      } else if (ev.key === '[') {
        applySettings({ bpm: settingsRef.current.bpm - 2 });
      } else if (ev.key === ']') {
        applySettings({ bpm: settingsRef.current.bpm + 2 });
      } else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
        const c = classRef.current;
        if (c.phase === 'running' || c.phase === 'paused') {
          ev.preventDefault();
          skipPose(ev.key === 'ArrowLeft' ? -1 : 1);
        }
      } else if (ev.key === 'i' || ev.key === 'I') {
        const c = classRef.current;
        if (c.phase === 'running' || c.phase === 'paused' || c.phase === 'closing') {
          setImmersed((v) => !v);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applySettings, skipPose, toggleMetronome]);

  // ---------------------------------------------------------------- derived
  // while a segment overrides the count, the orb follows the metronome
  const liveBeats = running && beatView ? beatView.beatsPerBar : settings.beatsPerBar;
  const isPulse = liveBeats === 1;
  const activeBar = running && beatView ? beatView.bar : null;
  const phaseWord =
    activeBar === null ? 'Ready' : isPulse ? 'Exhale · pulse' : activeBar % 2 === 0 ? 'Inhale' : 'Exhale';
  const orbPhase = activeBar === null ? 'idle' : activeBar % 2 === 0 ? 'in' : 'out';
  const curBeat = running && beatView ? beatView.beat : -1;
  const count = curBeat >= 0 ? Math.min(curBeat + 1, liveBeats) : null;
  const rate = breathsPerMinute(settings);
  const rateLine = `${fmtRate(rate)} ${isPulse ? 'pulses' : 'breaths'} / min`;
  const classMinutes = programMinutes(program, settings.bpm, settings.beatsPerBar);

  // What the idle card says about last time: computed once per idle spell,
  // not per beat. "Listen for" names the two shakiest hand-offs the trainer
  // knows about — the class is where they get rehearsed.
  const idleInfo = useMemo(() => {
    if (classRun.phase !== 'idle') return null;
    const now = Date.now();
    const journal = loadJournal();
    const last = lastClass(journal);
    const streak = practiceStreak(journal, now);
    const tstore = loadStore(now);
    const shaky =
      Object.keys(tstore.kcs).length === 0
        ? []
        : poses
            .slice(0, -1)
            .map((p) => ({ p, prob: nodeP(tstore, `tr:${p.order}`, now) }))
            .filter((x) => band(x.prob) !== 'solid')
            .sort((a, b) => a.prob - b.prob)
            .slice(0, 2)
            .map((x) => poses[x.p.order]); // the posture the hand-off leads INTO
    return { last, streak, shaky, ago: last ? daysSince(last.endedAt, now) : null };
  }, [classRun.phase]);

  // ---------------------------------------------------------------- class card body
  let classBody: ReactNode;
  let overlay: ReactNode = null;
  if (classRun.phase === 'idle') {
    classBody = (
      <div className="pc-class-idle">
        <p className="pc-class-lede text-soft">
          Each posture holds for its class time, counted in beats — slow the tempo and the whole
          class slows with it.
        </p>
        <div className="pc-programs" role="group" aria-label="Class program">
          {programs.map((pr) => (
            <button
              key={pr.id}
              type="button"
              aria-pressed={pr.id === program.id}
              className="pc-program"
              onClick={() => {
                setProgram(pr);
                setStartIdx(0);
              }}
            >
              <span className="pc-program-head">
                <span className="pc-program-name">{pr.name}</span>
                <span className="pc-program-min">{programMinutes(pr, settings.bpm, settings.beatsPerBar)} min</span>
              </span>
              <span className="pc-program-blurb">{pr.blurb}</span>
            </button>
          ))}
        </div>
        <p className="pc-class-total text-faint">
          {program.name} ≈ <strong>{classMinutes} min</strong> at {settings.bpm} BPM, then two
          minutes of final savasana.
        </p>
        {idleInfo && (idleInfo.last || idleInfo.shaky.length > 0) && (
          <p className="pc-class-last text-soft">
            {idleInfo.last && idleInfo.ago !== null && (
              <>
                Last class{' '}
                {idleInfo.ago === 0 ? 'today' : idleInfo.ago === 1 ? 'yesterday' : `${idleInfo.ago} days ago`}
                {' — '}
                {idleInfo.last.program === 'short'
                  ? 'the short class'
                  : idleInfo.last.fromOrder === 1 && idleInfo.last.toOrder === poses.length
                    ? 'the whole class'
                    : `postures ${idleInfo.last.fromOrder}–${idleInfo.last.toOrder}`}
                , ≈{Math.max(1, Math.round(idleInfo.last.pacedSeconds / 60))} min
                {idleInfo.last.rehearsed &&
                  idleInfo.last.handoffs !== undefined &&
                  idleInfo.last.recalled !== undefined && (
                    <>
                      , {idleInfo.last.recalled} of {idleInfo.last.handoffs} hand-offs recalled
                    </>
                  )}
                .{' '}
                {idleInfo.streak > 1 && <>{idleInfo.streak} days of practice running. </>}
              </>
            )}
            {idleInfo.shaky.length > 0 && (
              <>
                Listen for the hand-off{idleInfo.shaky.length > 1 ? 's' : ''} into{' '}
                {idleInfo.shaky.map((p, i) => (
                  <span key={p.id}>
                    {i > 0 && ' and '}
                    <strong>
                      #{p.order} {p.englishName}
                    </strong>
                  </span>
                ))}
                {' — '}
                {idleInfo.shaky.length > 1 ? 'your shakiest' : 'your shakiest one'}.
              </>
            )}
          </p>
        )}
        <div className="pc-class-startrow">
          <label className="pc-class-from" htmlFor="pc-from">
            Start from
          </label>
          <select
            id="pc-from"
            className="pc-select"
            value={startIdx}
            onChange={(e) => setStartIdx(Number(e.target.value))}
          >
            {classPoses.map((p, i) => (
              <option key={p.id} value={i}>
                {p.order} · {p.englishName}
              </option>
            ))}
          </select>
          <button type="button" className="pc-btn pc-btn-primary" onClick={beginClass}>
            Begin class
          </button>
        </div>
      </div>
    );
  } else if (classRun.phase === 'done') {
    classBody = (
      <div className="pc-class-done">
        <h3 className="pc-class-done-title">Class complete — rest in savasana.</h3>
        <p className="text-soft">
          ≈ {Math.max(1, Math.round(classRun.pacedSeconds / 60))} minutes of paced breathing.
        </p>
        {classRun.rehearsedFrom !== undefined && (
          <RehearsalDebrief list={classPoses} from={classRun.rehearsedFrom} />
        )}
        <CoachDebrief
          program={programRef.current}
          beatsPerBar={settings.beatsPerBar}
          onAdopt={(p) => {
            setCoachProgram(p);
            setProgram(p);
            setStartIdx(0);
          }}
        />
        <button type="button" className="pc-btn" onClick={endClass}>
          Back to the pacer
        </button>
      </div>
    );
  } else if (classRun.phase === 'closing') {
    const savasana = poses[SAVASANA_IDX];
    classBody = (
      <div className="pc-class-run">
        <div className="pc-class-pose">
          <PoseFigure pose={savasana} size={110} />
          <div className="pc-class-poseinfo">
            <p className="eyebrow">Class complete</p>
            <h3 className="pc-class-posename">Final savasana</h3>
            <p className="pc-class-sanskrit text-soft">Lie back. The ticks are silent; the bell rings at two minutes.</p>
          </div>
          <div className="pc-class-remain">
            <span className="pc-remain-num">{mss(classRun.left)}</span>
            <span className="pc-remain-cap text-faint">counts left</span>
          </div>
        </div>
        <div className="pc-class-bar" aria-hidden="true">
          <span style={{ width: '100%' }} />
        </div>
        <div className="pc-class-controls">
          <button type="button" className="pc-btn" ref={immerseBtnRef} onClick={() => setImmersed(true)}>
            Immerse
          </button>
          <button type="button" className="pc-btn pc-btn-quiet" onClick={finishClass}>
            Skip the rest
          </button>
        </div>
      </div>
    );
    if (immersed) {
      overlay = (
        <PacerClassMode
          pose={savasana}
          segmentLabel="Final savasana"
          segmentKind="rest"
          paused={false}
          progress={1}
          posture={classPoses.length}
          postureCount={classPoses.length}
          nextLine="Lie back and let the breath go — the bell rings at two minutes."
          eyebrow="Class complete"
          canPause={false}
          canBack={false}
          canNext={false}
          onBack={() => {}}
          onNext={() => {}}
          onTogglePause={() => {}}
          onExit={exitImmersion}
          breath={breath}
          figureClock={{
            segment: 0,
            beatsIn: classRun.budget - classRun.left,
            beats: classRun.budget,
            beatSeconds: beatSeconds(settings.bpm),
          }}
        />
      );
    }
  } else {
    const pose = classPoses[classRun.idx];
    const next = classPoses[classRun.idx + 1];
    const hidden = cues.rehearse && !classRun.revealed;
    const fracDone = 1 - classRun.left / classRun.budget;
    const progress =
      (clock.offsets[classRun.idx] + fracDone * classRun.budget) / clock.total;
    const remainNote =
      classRun.phase === 'paused' ? ' · paused' : !running ? ' · metronome stopped' : '';
    const beatIdx = classRun.budget - classRun.left;
    const track = trackRef.current;
    const seg = track ? segmentAtBeat(track, beatIdx) : null;
    // the figure leads the class by one bar: it moves on the exhale the
    // change cue is spoken on, so the new hold is shown as it begins
    const figSeg = track ? segmentAtBeat(track, Math.min(track.totalBeats - 1, beatIdx + track.barBeats)) : null;
    const nextCue = track ? cueWhen(track, beatIdx) : undefined;
    classBody = (
      <div className="pc-class-run">
        <div className="pc-class-pose">
          {hidden ? (
            <div className="pc-class-figure-hidden" aria-hidden="true">
              ?
            </div>
          ) : (
            <PoseFigure pose={pose} size={110} />
          )}
          <div className="pc-class-poseinfo">
            <p className="eyebrow">
              Posture {classRun.idx + 1} of {classPoses.length}
              {program.id !== 'full' && <> · {program.name}</>}
            </p>
            <h3 className="pc-class-posename">
              {hidden ? 'What comes next?' : `${pose.order} · ${pose.englishName}`}
            </h3>
            <p className="pc-class-sanskrit text-soft">
              {hidden ? 'Say it before the voice does.' : pose.sanskritName}
            </p>
            {!hidden && <p className="pc-class-timing text-faint">{pose.timing}</p>}
            {seg && (
              <p className="pc-class-seg" data-kind={seg.kind}>
                <span className="pc-seg-label">{seg.label}</span>
                <span className="pc-seg-time">{mss(seg.beatsLeft)}</span>
              </p>
            )}
            {seg && (
              <p className="pc-class-breath text-soft">
                Breath {seg.breath + 1} of {seg.breaths}
                {seg.phase !== 'pulse' && <> · {seg.phase}</>}
                {nextCue && <> · next cue {nextCue}</>}
              </p>
            )}
          </div>
          <div className="pc-class-remain">
            <span className="pc-remain-num">{mss(classRun.left)}</span>
            <span className="pc-remain-cap text-faint">counts left{remainNote}</span>
          </div>
        </div>
        <div className="pc-class-bar" aria-hidden="true">
          <span style={{ width: `${(Math.min(1, Math.max(0, progress)) * 100).toFixed(2)}%` }} />
        </div>
        <p className="pc-class-next text-soft">
          {cues.rehearse ? (
            'Rehearsal — the next posture stays hidden until four counts after the chime.'
          ) : next ? (
            <>
              Next: #{next.order} {next.englishName}
            </>
          ) : (
            'Last posture — the class ends after this.'
          )}
        </p>
        <div className="pc-class-controls">
          <button
            type="button"
            className="pc-btn"
            onClick={() => skipPose(-1)}
            aria-label="Skip back one posture"
            disabled={classRun.idx === 0}
          >
            ‹ Back
          </button>
          <button type="button" className="pc-btn pc-btn-primary" onClick={toggleClassPause}>
            {classRun.phase === 'paused' ? 'Resume class' : 'Pause class'}
          </button>
          <button
            type="button"
            className="pc-btn"
            onClick={() => skipPose(1)}
            aria-label="Skip forward one posture"
            disabled={classRun.idx === classPoses.length - 1}
          >
            Next ›
          </button>
          <button
            type="button"
            className="pc-btn"
            ref={immerseBtnRef}
            onClick={() => setImmersed(true)}
          >
            Immerse
          </button>
          <button type="button" className="pc-btn pc-btn-quiet" onClick={endClass}>
            End class
          </button>
        </div>
      </div>
    );
    if (immersed) {
      overlay = (
        <PacerClassMode
          pose={pose}
          next={next}
          segmentLabel={seg?.label}
          segmentKind={seg?.kind}
          position={seg ?? undefined}
          nextCue={nextCue}
          track={track ?? undefined}
          paused={classRun.phase === 'paused'}
          hidden={hidden}
          rehearse={cues.rehearse}
          progress={progress}
          posture={classRun.idx + 1}
          postureCount={classPoses.length}
          canBack={classRun.idx > 0}
          canNext={classRun.idx < classPoses.length - 1}
          onBack={() => skipPose(-1)}
          onNext={() => skipPose(1)}
          onTogglePause={toggleClassPause}
          onExit={exitImmersion}
          breath={breath}
          figureClock={
            figSeg
              ? { segment: figSeg.index, beatsIn: figSeg.beatsIn, beats: figSeg.beats, beatSeconds: beatSeconds(settings.bpm) }
              : {
                  segment: 0,
                  beatsIn: classRun.budget - classRun.left,
                  beats: classRun.budget,
                  beatSeconds: beatSeconds(settings.bpm),
                }
          }
        />
      );
    }
  }

  // ---------------------------------------------------------------- render
  return (
    <div className="page">
      <div className="container">
        <header className="pc-hero">
          <p className="eyebrow">Breath pacer</p>
          <h1 className="pc-title">A metronome for the breath</h1>
          <p className="pc-lede text-soft">
            The default is 60 BPM in six-beat bars — six counts in, six counts out, five breaths a
            minute: the pace of the opening Pranayama. At 60 BPM every count is one second.
          </p>
        </header>

        <div className="pc-grid">
          <section
            className="card pc-stage"
            data-pulse={isPulse ? '' : undefined}
            style={{ '--phase-dur': `${phaseSeconds(settings)}s` } as CSSProperties}
          >
            <div className="pc-orb-wrap">
              <div className="pc-orb" data-phase={orbPhase} aria-hidden="true" />
              <div className="pc-orb-text">
                <p className="pc-phase" aria-live="polite">
                  {phaseWord}
                </p>
                <p className="pc-count">{count ?? '·'}</p>
              </div>
            </div>
            <div className="pc-dots" aria-hidden="true">
              {Array.from({ length: liveBeats }, (_, i) => (
                <span
                  key={i}
                  className="pc-dot"
                  data-on={curBeat === i ? '' : undefined}
                  data-first={i === 0 ? '' : undefined}
                />
              ))}
            </div>
            <p className="pc-rate text-soft">{rateLine}</p>
            <button type="button" className="pc-btn pc-btn-primary pc-start" onClick={toggleMetronome}>
              {running ? 'Pause' : 'Start'}
            </button>
          </section>

          <section className="card pc-controls">
            <h2 className="pc-card-title">Tempo &amp; sound</h2>

            <div className="pc-field">
              <div className="pc-field-head">
                <label htmlFor="pc-bpm">Tempo</label>
                <span className="pc-field-val">{settings.bpm} BPM</span>
              </div>
              <input
                id="pc-bpm"
                className="pc-range"
                type="range"
                min={BPM_MIN}
                max={BPM_MAX}
                step={1}
                value={settings.bpm}
                list="pc-bpm-marks"
                aria-label="Beats per minute"
                onChange={(e) => applySettings({ bpm: Number(e.target.value) })}
              />
              <datalist id="pc-bpm-marks">
                <option value={60} label="60" />
              </datalist>
              <div className="pc-bpm-scale" aria-hidden="true">
                <span style={{ left: '0%' }}>{BPM_MIN}</span>
                <span style={{ left: '33.333%' }} data-mark>
                  60
                </span>
                <span style={{ left: '100%' }}>{BPM_MAX}</span>
              </div>
            </div>

            <div className="pc-field">
              <div className="pc-field-head">
                <span id="pc-beats-label">Counts per breath</span>
                <span className="pc-field-val">{isPulse ? 'pulse' : `${settings.beatsPerBar} in · ${settings.beatsPerBar} out`}</span>
              </div>
              <div className="pc-seg" role="group" aria-labelledby="pc-beats-label">
                {BEAT_CHOICES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={settings.beatsPerBar === n}
                    onClick={() => applySettings({ beatsPerBar: n })}
                  >
                    {n === 1 ? 'pulse' : n}
                  </button>
                ))}
              </div>
            </div>

            <div className="pc-field">
              <div className="pc-field-head">
                <label htmlFor="pc-vol">Volume</label>
                <span className="pc-field-val">
                  {settings.muted ? 'muted' : `${Math.round(settings.volume * 100)}%`}
                </span>
              </div>
              <div className="pc-vol-row">
                <button
                  type="button"
                  className="pc-mute"
                  aria-pressed={settings.muted}
                  aria-label={settings.muted ? 'Unmute' : 'Mute'}
                  onClick={() => applySettings({ muted: !settings.muted })}
                >
                  {settings.muted ? <SpeakerOffIcon /> : <SpeakerIcon />}
                </button>
                <input
                  id="pc-vol"
                  className="pc-range"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(settings.volume * 100)}
                  aria-label="Volume"
                  onChange={(e) => applySettings({ volume: Number(e.target.value) / 100 })}
                />
              </div>
            </div>

            <div className="pc-field">
              <div className="pc-field-head">
                <span>Presets</span>
              </div>
              <div className="pc-presets">
                {PACER_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className="pc-preset"
                    aria-pressed={settings.bpm === p.bpm && settings.beatsPerBar === p.beatsPerBar}
                    onClick={() => applySettings({ bpm: p.bpm, beatsPerBar: p.beatsPerBar })}
                  >
                    <span className="pc-preset-label">{p.label}</span>
                    <span className="pc-preset-note text-soft">{p.note}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="card pc-class">
          <div className="pc-class-head">
            <p className="eyebrow">Class pacer</p>
            <h2 className="pc-card-title">Pace the class</h2>
          </div>
          {classBody}
          <div className="pc-cues">
            {speechSupported() || clipsAvailable() ? (
              <>
                <div className="pc-cues-row">
                  <span className="pc-cues-label">Instructions</span>
                  <button
                    type="button"
                    className="pc-cue-switch"
                    aria-pressed={cues.enabled}
                    onClick={() => applyCues({ enabled: !cues.enabled })}
                  >
                    Spoken instructions
                  </button>
                </div>
                {cues.enabled && (
                  <div className="pc-cues-body">
                    <div className="pc-cues-voicerow">
                      <label className="pc-cues-voicelabel" htmlFor="pc-voice">
                        Voice
                      </label>
                      <select
                        id="pc-voice"
                        className="pc-select pc-voice"
                        value={cues.voiceName ?? ''}
                        onChange={(e) => applyCues({ voiceName: e.target.value || null })}
                      >
                        {clipsAvailable() ? (
                          <>
                            <option value="">Studio voice — recorded</option>
                            {speechSupported() && <option value="~tts">Browser default</option>}
                          </>
                        ) : (
                          <option value="">
                            {voices.length === 0 ? 'Default voice' : 'Browser default'}
                          </option>
                        )}
                        {voices.map((v) => (
                          <option key={`${v.name}|${v.lang}`} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                      <button type="button" className="pc-btn pc-btn-sm" onClick={previewVoice}>
                        Preview voice
                      </button>
                    </div>
                    <div className="pc-cues-checks">
                      <label className="pc-cue-check">
                        <input
                          type="checkbox"
                          checked={cues.sanskrit}
                          onChange={(e) => applyCues({ sanskrit: e.target.checked })}
                        />
                        Say Sanskrit names
                      </label>
                      <label className="pc-cue-check">
                        <input
                          type="checkbox"
                          checked={cues.guides}
                          onChange={(e) => applyCues({ guides: e.target.checked })}
                        />
                        Technique cue at the start
                      </label>
                      <label className="pc-cue-check">
                        <input
                          type="checkbox"
                          checked={cues.rehearse}
                          onChange={(e) => applyCues({ rehearse: e.target.checked })}
                        />
                        Rehearsal — recall each posture before it&rsquo;s announced
                      </label>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="pc-cues-unsupported text-faint">
                Spoken instructions aren&rsquo;t supported in this browser — tones still mark every
                change.
              </p>
            )}
          </div>
        </section>

        <p className="pc-kbd text-faint">
          <kbd>Space</kbd> start / pause · <kbd>[</kbd> <kbd>]</kbd> tempo −2 / +2 ·{' '}
          <kbd>←</kbd> <kbd>→</kbd> change posture · <kbd>i</kbd> immerse while the class runs
        </p>
      </div>
      {/* portal: the animated .page ancestor would otherwise become the
          fixed-position containing block and trap the overlay under the nav */}
      {overlay && createPortal(overlay, document.body)}
    </div>
  );
}

/**
 * After a rehearsal class: which hand-offs came to mind before the voice
 * confirmed them? Self-reported, saved as in-class evidence on the
 * transition KCs — the knowledge map moves from classes, not just
 * quizzes. Never touches the review schedule.
 */
function RehearsalDebrief({ list, from }: { list: Pose[]; from: number }) {
  // every posture after the first was announced late — a recall each. Only
  // hand-offs between neighbours in the sequence are transition KCs; a
  // short class's jumps (Eagle into Cobra) are recalled but not recorded.
  const handoffs = list.slice(from + 1).filter((p, i) => list[from + i].order === p.order - 1);
  const [missed, setMissed] = useState<Set<string>>(() => new Set());
  const [saved, setSaved] = useState<number | null>(null);

  const toggle = (id: string) =>
    setMissed((m) => {
      const next = new Set(m);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = () => {
    const now = Date.now();
    const store = loadStore(now);
    for (const p of handoffs) {
      applyEvidence(store, `tr:${p.order - 1}`, 'recall', !missed.has(p.id), now);
    }
    saveStore(store);
    const recalled = handoffs.length - missed.size;
    const journal = loadJournal();
    if (amendLastClass(journal, { handoffs: handoffs.length, recalled })) saveJournal(journal);
    setSaved(recalled);
  };

  if (handoffs.length === 0) return null;
  return (
    <div className="pc-debrief">
      <p className="eyebrow">Rehearsal debrief</p>
      {saved === null ? (
        <>
          <p className="text-soft">
            Tap any hand-off you did <em>not</em> recall before the voice said it, then save. This
            feeds the knowledge map as class evidence — it never changes your review schedule.
          </p>
          <ul className="pc-debrief-list">
            {handoffs.map((p) => {
              const miss = missed.has(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className="pc-debrief-item"
                    aria-pressed={miss}
                    onClick={() => toggle(p.id)}
                  >
                    <span className="pc-debrief-num">{p.order}</span>
                    <span className="pc-debrief-name">{p.englishName}</span>
                    <span className="pc-debrief-mark">{miss ? 'missed' : 'recalled'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" className="pc-btn pc-btn-primary" onClick={save}>
            Save {handoffs.length - missed.size} of {handoffs.length} recalled
          </button>
        </>
      ) : (
        <p className="text-soft">
          Saved — <strong>{saved}</strong> of {handoffs.length} hand-offs recalled in class.
        </p>
      )}
    </div>
  );
}
