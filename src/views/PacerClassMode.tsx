import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import type { Pose, PoseMotion as Motion } from '../data';
import { RIG_LIVE, applyFigureFlag, figureRenderer, loadRigData, motionId, rigBridgeIds, rigDataIfLoaded } from '../data';
import { PoseMotion } from '../components/PoseMotion';
import { holdUntilLoaded } from '../components/rigFallback';
import type { BreathPhase } from '../components/PoseMotion';
import { clipSeconds, figureFrameAt, figurePlan, figurePoseAt, planEnd, segmentTimeline } from '../pacer';
import type { CueLayer, FigureFrame, FigurePlan, FigurePose, PoseTrack, SegmentPosition } from '../pacer';
import './PacerClassMode.css';

/** Where the class clock is: the live segment and the beats into it. */
export interface FigureClockProps {
  /** index into the posture's segments (0 for a segment-less posture) */
  segment: number;
  /** counted beats already spent in the segment */
  beatsIn: number;
  /** the segment's length in beats */
  beats: number;
  /** real seconds per counted beat at the live tempo */
  beatSeconds: number;
}

export interface PacerClassModeProps {
  pose: Pose;
  next?: Pose;
  /** the posture before this one in the class: the figure bridges from where it left off */
  previousPose?: Pose;
  /** a teaching layer flashing for one breath after a coaching line */
  layer?: CueLayer;
  segmentLabel?: string;
  segmentKind?: string;
  paused: boolean;
  /** the class's breath for the ring and the figure; undefined = still (pulse mode) */
  breath?: BreathPhase;
  /** the live place on the breath grid: which breath of the segment, which phase, which count */
  position?: SegmentPosition;
  /** where the next spoken cue lands, in words ("fourth breath, on the exhale") */
  nextCue?: string;
  /** the class clock the figure moves with; undefined leaves the figure resting */
  figureClock?: FigureClockProps;
  /** the posture's compiled cue track: its spoken walk-in drives the figure's entry */
  track?: PoseTrack;
  /** rehearsal: the posture's identity is withheld until it is announced */
  hidden?: boolean;
  /** rehearsal is on: never show what comes next */
  rehearse?: boolean;
  /** replaces the "Next:" line entirely (final savasana) */
  nextLine?: string;
  /** replaces the "Posture N of M" eyebrow */
  eyebrow?: string;
  /** false disables the pause control (final savasana just runs) */
  canPause?: boolean;
  /** whole-class progress, 0–1 */
  progress: number;
  posture: number;
  postureCount: number;
  canBack: boolean;
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
  onTogglePause: () => void;
  onExit: () => void;
}

/** What the class figure shows right now: the sprite frame, and for the live rig its pose and breath. */
interface ClassFigure {
  frame: FigureFrame;
  /** the rig's continuous pose (only computed when the rig draws) */
  pose?: FigurePose;
  /** progress through the breath phase, stepped (rig only: it breathes by opening the chest) */
  breathProgress?: number;
}

/** steps per breath phase for the rig's chest (a 6 s phase ≈ 8 renders a second) */
const BREATH_STEPS = 48;

/**
 * The sheet and sprite frame the class figure shows right now (a hand-off
 * bridge's sheet while one plays) — and, with the live rig, its
 * continuous pose (`figurePoseAt`) and breath. The class advances in
 * whole beats (props change once a beat); between beats the hook
 * extrapolates on requestAnimationFrame from the moment the beat arrived,
 * so entries play at sheet speed and Kapalbhati pumps land on the beat.
 * Pausing freezes the frame; resuming restarts the beat stamp so nothing
 * jumps. See `pacer/figure.ts` for the mapping itself.
 */
function useClassFigureFrame(
  plan: FigurePlan | undefined,
  clock: FigureClockProps | undefined,
  breath: BreathPhase | undefined,
  paused: boolean,
  rig: boolean,
): ClassFigure | undefined {
  const segIndex = clock ? Math.min(clock.segment, (plan?.segments.length ?? 1) - 1) : -1;
  const seg = plan && segIndex >= 0 ? plan.segments[segIndex] : undefined;
  const beatsIn = clock?.beatsIn ?? 0;
  const beatSeconds = clock?.beatSeconds ?? 0;
  const total = (clock?.beats ?? 0) * beatSeconds;
  const steps = useMemo(() => (seg?.kind === 'stages' ? segmentTimeline(seg, total) : undefined), [seg, total]);
  const breathPhase = breath?.phase;
  const breathSeconds = breath?.seconds ?? 0;

  const beatStamp = useRef(0);
  const breathStamp = useRef(0);
  useEffect(() => {
    beatStamp.current = performance.now();
  }, [segIndex, beatsIn, paused]);
  // the rig's chest follows the breath's progress: it freezes on pause (no
  // rAF runs) and on resume the breath clock is shifted by the pause, so
  // the chest carries on from where it stopped instead of jumping ahead.
  // Declared before the phase effect so a phase flip on resume still resets.
  const pausedAt = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (paused) pausedAt.current = performance.now();
    else if (pausedAt.current !== undefined) {
      breathStamp.current += performance.now() - pausedAt.current;
      pausedAt.current = undefined;
    }
  }, [paused]);
  useEffect(() => {
    breathStamp.current = performance.now();
  }, [breathPhase]);

  const [figure, setFigure] = useState<ClassFigure | undefined>(undefined);
  const lastRef = useRef<ClassFigure | undefined>(undefined);
  useEffect(() => {
    if (!seg) {
      lastRef.current = undefined;
      setFigure(undefined);
      return;
    }
    const compute = (now: number) => {
      const beatMs = beatSeconds * 1000;
      // paused: no extrapolation, the beat's own frame (so a skip while
      // paused still shows the new posture's sheet)
      const sub = paused || beatMs <= 0 ? 0 : Math.min(1, Math.max(0, (now - beatStamp.current) / beatMs));
      const breathP = breathPhase && breathSeconds > 0 ? Math.min(1, (now - breathStamp.current) / (breathSeconds * 1000)) : undefined;
      const figureClock = {
        seconds: (beatsIn + sub) * beatSeconds,
        total,
        beatProgress: sub,
        breath: breathPhase && breathP !== undefined ? { phase: breathPhase, progress: breathP } : undefined,
      };
      const frame = figureFrameAt(seg, figureClock, steps);
      const pose = rig ? figurePoseAt(seg, figureClock, steps) : undefined;
      const breathProgress = rig && breathP !== undefined ? Math.round(breathP * BREATH_STEPS) / BREATH_STEPS : undefined;
      // a long hold is the same sheet and frame (and pose) for minutes: no new object, no rerender
      const last = lastRef.current;
      if (
        last &&
        last.frame.motion === frame.motion &&
        last.frame.frame === frame.frame &&
        last.breathProgress === breathProgress &&
        last.pose?.motion === pose?.motion &&
        last.pose?.from === pose?.from &&
        last.pose?.to === pose?.to &&
        last.pose?.t === pose?.t
      )
        return;
      const next = { frame, pose, breathProgress };
      lastRef.current = next;
      setFigure(next);
    };
    // once per beat synchronously (rAF is silent in a background tab), then
    // smoothly between beats while the tab is visible
    compute(performance.now());
    if (paused) return; // hold that frame
    let raf = requestAnimationFrame(function tick(now) {
      compute(now);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [seg, steps, beatsIn, beatSeconds, total, breathPhase, breathSeconds, paused, rig]);

  return seg ? figure : undefined;
}

/**
 * Pin a CSS transition in place while paused: the computed transform is
 * copied inline (and the transition dropped) so the ring stops where it
 * is; on resume both are released and the transition carries on toward
 * the phase's target.
 */
function usePausableTransition(paused: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (paused) {
      const t = getComputedStyle(el).transform;
      el.style.transform = t === 'none' ? '' : t;
      el.style.transition = 'none';
    } else {
      el.style.transition = '';
      el.style.transform = '';
    }
  }, [paused]);
  return ref;
}

/**
 * Full-screen dim-room view of the running class. No clock, no numbers:
 * the breath ring around the figure swells on the inhale and settles on
 * the exhale, one dot per breath of the segment fills as the breaths go
 * by, and one line says where the next instruction lands. Esc leaves.
 */
export function PacerClassMode(props: PacerClassModeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const onExitRef = useRef(props.onExit);
  onExitRef.current = props.onExit;

  // take focus on open; Esc exits (and leaves browser fullscreen)
  useEffect(() => {
    rootRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExitRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenEnabled) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // the stage (ring + figure) is the hero: as large as the viewport allows
  // once the name above and the controls below have their room
  const [stage, setStage] = useState(() => stageSize());
  useEffect(() => {
    const onResize = () => setStage(stageSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const figSize = Math.round(stage * 0.78);

  // the figure is an identity surface: withheld with the name in rehearsal.
  // It moves with the class: the plan maps each segment onto sheet stages
  // (rests and sit-ups borrow the savasana and sit-up sheets), and the
  // frame follows the class clock — into the posture on the cue, held
  // while the class holds, other side when the side changes.
  // Changing sheet between body positions plays a hand-off bridge first
  // (rolling over, sitting up…); into the posture it bridges from the
  // sheet the previous posture left the figure on.
  const beatSeconds = props.figureClock?.beatSeconds ?? 1;
  const track = props.track;
  const previous = useMemo(() => planEnd(props.previousPose), [props.previousPose]);
  const plan = useMemo(
    () =>
      figurePlan(props.pose, {
        track,
        beatSeconds,
        leadBeats: track?.barBeats ?? 0,
        clipSeconds,
        previous: previous?.motion,
        previousStage: previous?.stage,
      }),
    [props.pose, track, beatSeconds, previous],
  );
  // the renderer: the live rig for RIG_LIVE postures (every posture with rig
  // data, or everything with ?figure=rig), else the sprite. Every posture's
  // and bridge's rig data is preloaded (the Pacer starts it as the page
  // opens; this posture's first here), and the figure below HOLDS its pose
  // for a sheet still on the way, so a skip or hand-off never shows the
  // sprite in the middle of a class
  const { search } = useLocation();
  const override = useMemo(() => applyFigureFlag(search), [search]);
  const renderer = figureRenderer(props.pose.id, override, 'class');
  const rig = renderer === 'rig';
  useEffect(() => {
    if (!rig) return;
    for (const id of [props.pose.id, ...rigBridgeIds(), ...RIG_LIVE]) loadRigData(id).catch(() => {});
  }, [rig, props.pose.id]);
  const classFigure = useClassFigureFrame(plan, props.figureClock, props.breath, props.paused, rig);
  const figure = classFigure?.frame;
  const segMotion =
    plan && props.figureClock
      ? plan.segments[Math.min(props.figureClock.segment, plan.segments.length - 1)]?.motion
      : undefined;
  const nextMotion: Motion | undefined = props.hidden ? undefined : (figure?.motion ?? segMotion ?? props.pose.motion);
  const nextPose = rig ? classFigure?.pose : undefined;
  // never move the figure onto a sheet that has not loaded: hold what it
  // drew last (the current rig pose) until the sheet arrives, then move
  const [, sheetArrived] = useReducer((n: number) => n + 1, 0);
  const wanted = {
    motion: nextMotion,
    pose: nextPose,
    frame: figure?.frame,
    sheet: rig && nextMotion ? motionId(nextPose?.motion ?? nextMotion) : undefined,
  };
  const heldRef = useRef<typeof wanted | undefined>(undefined);
  // a sheet that will not load is let through: the figure's own fallback takes it from there
  const failedRef = useRef(new Set<string>());
  const settled = (id: string) => rigDataIfLoaded(id) !== undefined || failedRef.current.has(id);
  const shown = rig ? holdUntilLoaded(heldRef.current, wanted, settled) : wanted;
  heldRef.current = shown;
  const waitingFor = wanted.sheet && shown !== wanted ? wanted.sheet : undefined;
  useEffect(() => {
    if (!waitingFor) return;
    let alive = true;
    const arrived = () => {
      if (alive) sheetArrived();
    };
    loadRigData(waitingFor).then(arrived, () => {
      failedRef.current.add(waitingFor);
      arrived();
    });
    return () => {
      alive = false;
    };
  }, [waitingFor]);
  const motion = shown.motion;
  // a coaching line lights its layer for one breath; nothing while withheld
  const layer = props.hidden ? undefined : props.layer;

  // the breath ring: phase drives a transition one bar long; pulse mode
  // beats a quick contraction on every count instead
  const pos = props.position;
  const pulse = pos?.phase === 'pulse';
  const ringPhase = pulse ? 'pulse' : props.breath ? (props.breath.phase === 'inhale' ? 'in' : 'out') : 'idle';
  const ringRef = usePausableTransition(props.paused);
  const ringStyle = { '--phase-dur': `${props.breath?.seconds ?? 6}s` } as CSSProperties;
  const phaseWord = pulse ? 'Pulse' : props.breath ? (props.breath.phase === 'inhale' ? 'Inhale' : 'Exhale') : '';

  // announce segment changes politely; the beat-by-beat state stays silent
  const [announced, setAnnounced] = useState('');
  useEffect(() => {
    setAnnounced(props.hidden ? '' : props.segmentLabel ?? '');
  }, [props.hidden, props.segmentLabel]);

  return (
    <div
      ref={rootRef}
      className="cm"
      role="dialog"
      aria-modal="true"
      aria-label={
        props.hidden
          ? `Class mode — posture ${props.posture} of ${props.postureCount}`
          : `Class mode — posture ${props.posture} of ${props.postureCount}, ${props.pose.englishName}`
      }
      tabIndex={-1}
    >
      <header className="cm-top">
        <p className="cm-posture">
          {props.eyebrow ?? `Posture ${props.posture} of ${props.postureCount}`}
        </p>
        <h2 className="cm-name">{props.hidden ? 'What comes next?' : props.pose.englishName}</h2>
        <p className="cm-sanskrit">{props.hidden ? 'say it before the voice does' : props.pose.sanskritName}</p>
      </header>

      <main className="cm-mid">
        <div className="cm-stage" style={{ width: stage, height: stage }}>
          <div
            ref={ringRef}
            className="cm-ring"
            data-phase={ringPhase}
            style={ringStyle}
            key={pulse ? `p${pos?.beatsIn ?? 0}` : 'ring'}
            aria-hidden="true"
          />
          <div className="cm-ring-rest" aria-hidden="true" />
          {motion && figSize > 0 ? (
            <div className="cm-figure">
              <PoseMotion
                motion={motion}
                size={figSize}
                showStages={false}
                breath={props.breath}
                breathPaused={props.paused}
                layers={{ guides: layer === 'guides', ghost: layer === 'ghost' }}
                fadeLayers
                frame={shown.frame}
                renderer={renderer}
                pose={shown.pose}
                breathProgress={classFigure?.breathProgress}
              />
            </div>
          ) : (
            <div className="cm-figure cm-figure-hidden" aria-hidden="true">
              {props.hidden ? '?' : ''}
            </div>
          )}
        </div>

        <div className="cm-readout">
          {!props.hidden && props.segmentLabel && (
            <p className="cm-seg" data-kind={props.segmentKind}>
              {props.segmentLabel}
            </p>
          )}
          {pos && (
            <div className="cm-breaths" role="img" aria-label={`Breath ${pos.breath + 1} of ${pos.breaths}`}>
              {Array.from({ length: pos.breaths }, (_, i) => (
                <span
                  key={i}
                  className={
                    'cm-dot' + (i < pos.breath ? ' is-done' : i === pos.breath ? ' is-now' : '')
                  }
                />
              ))}
            </div>
          )}
          <p className="cm-phase" data-phase={ringPhase}>
            {phaseWord && <span className="cm-phase-word">{phaseWord}</span>}
            {pos && !pulse && (
              <span className="cm-counts" aria-hidden="true">
                {Array.from({ length: pos.barBeats }, (_, i) => (
                  <span key={i} className={'cm-pip' + (i <= pos.beatInBar ? ' is-on' : '')} />
                ))}
              </span>
            )}
          </p>
          {props.nextCue && <p className="cm-nextcue">Next cue · {props.nextCue}</p>}
          {props.paused && <p className="cm-paused">paused</p>}
        </div>
      </main>

      <footer className="cm-bottom">
        <div className="cm-bar" aria-hidden="true">
          <span style={{ width: `${(Math.min(1, Math.max(0, props.progress)) * 100).toFixed(2)}%` }} />
        </div>
        <p className="cm-next">
          {props.nextLine
            ? props.nextLine
            : props.rehearse
            ? 'Rehearsal — the next posture stays hidden.'
            : props.next
              ? `Next: ${props.next.englishName}`
              : 'Last posture — Kapalbhati closes the class.'}
        </p>
        <div className="cm-controls">
          <button type="button" onClick={props.onBack} disabled={!props.canBack} aria-label="Skip back one posture">
            ‹ Back
          </button>
          <button
            type="button"
            className="cm-primary"
            onClick={props.onTogglePause}
            disabled={props.canPause === false}
          >
            {props.paused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" onClick={props.onNext} disabled={!props.canNext} aria-label="Skip forward one posture">
            Next ›
          </button>
          {document.fullscreenEnabled && (
            <button type="button" onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </button>
          )}
          <button type="button" onClick={props.onExit}>
            Leave class mode
          </button>
        </div>
      </footer>

      <div className="cm-live" aria-live="polite">
        {props.hidden ? '' : announced}
      </div>
    </div>
  );
}

/** Edge of the square stage (ring + figure) in px for the current viewport. */
function stageSize(): number {
  if (typeof window === 'undefined') return 0;
  const w = window.innerWidth;
  const h = window.innerHeight;
  // header ≈ 120 px, readout ≈ 130 px, footer ≈ 150 px; the stage takes the rest
  const size = Math.round(Math.min(w * 0.9, h - 400, 760));
  return Math.max(120, size);
}
