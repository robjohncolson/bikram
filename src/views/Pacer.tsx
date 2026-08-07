import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  BPM_MAX,
  BPM_MIN,
  PACER_PRESETS,
  announceText,
  beatSeconds,
  breathsPerMinute,
  buildPoseTrack,
  clampSettings,
  createMetronome,
  phaseSeconds,
  speak,
  speechSupported,
  stopSpeaking,
  watchVoices,
} from '../pacer';
import type { BeatEvent, Metronome, PacerSettings, PoseTrack, VoiceChoice } from '../pacer';
import { classOffsetSeconds, classTotalSeconds, poses } from '../data';
import { PoseFigure } from '../components/PoseFigure';
import './Pacer.css';

const STORAGE_KEY = 'yoga-pacer-v1';
const BEAT_CHOICES = [1, 2, 3, 4, 6, 8];

/** The class pacer walks the 26 postures on the metronome clock. */
type ClassRun =
  | { phase: 'idle' }
  | { phase: 'running' | 'paused'; idx: number; left: number; budget: number }
  | { phase: 'done'; pacedSeconds: number };

/** Spoken-instruction preferences, persisted alongside the engine settings. */
interface CuePrefs {
  enabled: boolean;
  voiceName: string | null;
  sanskrit: boolean;
  guides: boolean;
}

const CUE_DEFAULTS: CuePrefs = { enabled: true, voiceName: null, sanskrit: false, guides: true };

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
  const [beatView, setBeatView] = useState<{ beat: number; bar: number } | null>(null);
  const [classRun, setClassRun] = useState<ClassRun>({ phase: 'idle' });
  const [startIdx, setStartIdx] = useState(0);

  const settingsRef = useRef(settings);
  const cuesRef = useRef(cues);
  const classRef = useRef<ClassRun>(classRun);
  const trackRef = useRef<PoseTrack | null>(null);
  const pacedRef = useRef(0);
  const metRef = useRef<Metronome | null>(null);
  const timeoutsRef = useRef<Set<number>>(new Set());

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

  /** Compile the cue timeline for a posture at the current tempo & prefs. */
  const buildTrack = useCallback((idx: number) => {
    const p = cuesRef.current;
    return buildPoseTrack(poses[idx], settingsRef.current.bpm, {
      sanskrit: p.sanskrit,
      guides: p.guides,
    });
  }, []);

  /** Render any cue events due at this 0-based beat of the active hold. */
  const fireCues = useCallback((beatIdx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const prefs = cuesRef.current;
    const s = settingsRef.current;
    const speakable = prefs.enabled && speechSupported() && !s.muted;
    for (const ev of track.events) {
      if (ev.atBeat !== beatIdx) continue;
      if (ev.kind === 'warn') {
        metRef.current?.cue('warn'); // tone; engine mute already zeroes it
      } else if (speakable && ev.text) {
        speak(ev.text, {
          voiceName: prefs.voiceName ?? undefined,
          interrupt: ev.kind === 'announce',
          volume: s.volume,
        });
      }
    }
  }, []);

  /** One counted beat of class time: cue, decrement, hand off postures. */
  const tickClass = useCallback(() => {
    const c = classRef.current;
    if (c.phase !== 'running') return;
    // Current beat index into the hold — beat 0 is the posture's first
    // counted beat, so the announce lands the moment a hold begins.
    fireCues(c.budget - c.left);
    pacedRef.current += beatSeconds(settingsRef.current.bpm);
    const left = c.left - 1;
    if (left > 0) {
      commitClass({ ...c, left });
      return;
    }
    if (c.idx >= poses.length - 1) {
      stopSpeaking();
      metRef.current?.cue('end');
      trackRef.current = null;
      commitClass({ phase: 'done', pacedSeconds: pacedRef.current });
    } else {
      metRef.current?.chime();
      const idx = c.idx + 1;
      const track = buildTrack(idx);
      trackRef.current = track;
      commitClass({ phase: 'running', idx, left: track.totalBeats, budget: track.totalBeats });
    }
  }, [buildTrack, commitClass, fireCues]);

  // One metronome per mount. Beat events arrive up to ~150ms early on the
  // audio clock; visuals are deferred to the moment the beat sounds.
  useEffect(() => {
    const m = createMetronome((e: BeatEvent) => {
      const delay = Math.max(0, (e.time - m.now()) * 1000);
      later(() => {
        setBeatView({ beat: e.beat, bar: e.bar });
        tickClass();
      }, delay);
    });
    metRef.current = m;
    m.update(settingsRef.current);
    return () => {
      clearPending();
      stopSpeaking();
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
  // the active track's events but keeps the stored budget/left (never the new
  // track's totalBeats), so the countdown does not jump — past beats' events
  // are naturally skipped because their atBeat is behind budget − left.
  // The rebuild runs at the tempo the budget was counted at (BPM may have
  // moved since this hold began), so event beats stay on the countdown's
  // scale: this effective bpm makes beatsForSeconds return exactly budget.
  useEffect(() => {
    cuesRef.current = cues;
    const c = classRef.current;
    if (c.phase === 'running' || c.phase === 'paused') {
      const pose = poses[c.idx];
      trackRef.current = buildPoseTrack(pose, (c.budget * 60) / pose.approxTotalSeconds, {
        sanskrit: cues.sanskrit,
        guides: cues.guides,
      });
    }
  }, [cues]);

  // Voices load asynchronously; watchVoices calls back now and on changes.
  useEffect(() => watchVoices(setVoices), []);

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
      stopSpeaking();
      setRunning(false);
      setBeatView(null);
    } else {
      m.start();
      setRunning(true);
    }
  }, [clearPending]);

  const skipPose = useCallback(
    (dir: -1 | 1) => {
      const c = classRef.current;
      if (c.phase !== 'running' && c.phase !== 'paused') return;
      const idx = c.idx + dir;
      if (idx < 0 || idx >= poses.length) return;
      stopSpeaking();
      metRef.current?.chime();
      const track = buildTrack(idx);
      trackRef.current = track;
      commitClass({ phase: c.phase, idx, left: track.totalBeats, budget: track.totalBeats });
    },
    [buildTrack, commitClass],
  );

  const beginClass = useCallback(() => {
    const m = metRef.current;
    if (!m) return;
    if (!m.running) {
      m.start();
      setRunning(true);
    }
    pacedRef.current = 0;
    const track = buildTrack(startIdx);
    trackRef.current = track;
    commitClass({ phase: 'running', idx: startIdx, left: track.totalBeats, budget: track.totalBeats });
  }, [buildTrack, commitClass, startIdx]);

  const toggleClassPause = useCallback(() => {
    const c = classRef.current;
    if (c.phase === 'running') {
      stopSpeaking();
      commitClass({ ...c, phase: 'paused' });
    } else if (c.phase === 'paused') {
      commitClass({ ...c, phase: 'running' });
    }
  }, [commitClass]);

  const endClass = useCallback(() => {
    stopSpeaking();
    trackRef.current = null;
    commitClass({ phase: 'idle' });
  }, [commitClass]);

  /** Test-drive the chosen voice on the posture currently in view. */
  const previewVoice = useCallback(() => {
    const c = classRef.current;
    const idx = c.phase === 'running' || c.phase === 'paused' ? c.idx : startIdx;
    const pose = poses[idx] ?? poses[0];
    speak(announceText(pose, cuesRef.current.sanskrit), {
      voiceName: cuesRef.current.voiceName ?? undefined,
      interrupt: true,
      volume: settingsRef.current.volume,
    });
  }, [startIdx]);

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
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applySettings, skipPose, toggleMetronome]);

  // ---------------------------------------------------------------- derived
  const isPulse = settings.beatsPerBar === 1;
  const activeBar = running && beatView ? beatView.bar : null;
  const phaseWord =
    activeBar === null ? 'Ready' : isPulse ? 'Exhale · pulse' : activeBar % 2 === 0 ? 'Inhale' : 'Exhale';
  const orbPhase = activeBar === null ? 'idle' : activeBar % 2 === 0 ? 'in' : 'out';
  const curBeat = running && beatView ? beatView.beat : -1;
  const count = curBeat >= 0 ? Math.min(curBeat + 1, settings.beatsPerBar) : null;
  const rate = breathsPerMinute(settings);
  const rateLine = `${fmtRate(rate)} ${isPulse ? 'pulses' : 'breaths'} / min`;
  const classMinutes = Math.round((classTotalSeconds * (60 / settings.bpm)) / 60);

  // ---------------------------------------------------------------- class card body
  let classBody: ReactNode;
  if (classRun.phase === 'idle') {
    classBody = (
      <div className="pc-class-idle">
        <p className="pc-class-lede text-soft">
          Each posture holds for its class time, counted in beats — slow the tempo and the whole
          class slows with it.
        </p>
        <p className="pc-class-total text-faint">
          Whole class ≈ <strong>{classMinutes} min</strong> at {settings.bpm} BPM.
        </p>
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
            {poses.map((p, i) => (
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
        <button type="button" className="pc-btn" onClick={endClass}>
          Back to the pacer
        </button>
      </div>
    );
  } else {
    const pose = poses[classRun.idx];
    const next = poses[classRun.idx + 1];
    const fracDone = 1 - classRun.left / classRun.budget;
    const progress =
      (classOffsetSeconds(pose) + fracDone * pose.approxTotalSeconds) / classTotalSeconds;
    const remainNote =
      classRun.phase === 'paused' ? ' · paused' : !running ? ' · metronome stopped' : '';
    classBody = (
      <div className="pc-class-run">
        <div className="pc-class-pose">
          <PoseFigure pose={pose} size={110} />
          <div className="pc-class-poseinfo">
            <p className="eyebrow">
              Posture {classRun.idx + 1} of {poses.length}
            </p>
            <h3 className="pc-class-posename">
              {pose.order} · {pose.englishName}
            </h3>
            <p className="pc-class-sanskrit text-soft">{pose.sanskritName}</p>
            <p className="pc-class-timing text-faint">{pose.timing}</p>
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
          {next ? (
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
            disabled={classRun.idx === poses.length - 1}
          >
            Next ›
          </button>
          <button type="button" className="pc-btn pc-btn-quiet" onClick={endClass}>
            End class
          </button>
        </div>
      </div>
    );
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
              {Array.from({ length: settings.beatsPerBar }, (_, i) => (
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
            {speechSupported() ? (
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
                        {voices.length === 0 ? (
                          <option value="">Default voice</option>
                        ) : (
                          <>
                            <option value="">Browser default</option>
                            {voices.map((v) => (
                              <option key={`${v.name}|${v.lang}`} value={v.name}>
                                {v.name} ({v.lang})
                              </option>
                            ))}
                          </>
                        )}
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
          <kbd>←</kbd> <kbd>→</kbd> change posture while the class runs
        </p>
      </div>
    </div>
  );
}
