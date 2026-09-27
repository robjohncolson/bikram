import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Pose } from '../data';
import { PoseMotion } from '../components/PoseMotion';
import type { BreathPhase } from '../components/PoseMotion';
import { figureFrameAt, figurePlan, segmentTimeline } from '../pacer';
import type { FigurePlan, SegmentPosition } from '../pacer';
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

/**
 * The sprite frame the class figure shows right now. The class advances in
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
): number | undefined {
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
  useEffect(() => {
    breathStamp.current = performance.now();
  }, [breathPhase]);

  const [frame, setFrame] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!seg) {
      setFrame(undefined);
      return;
    }
    if (paused) return; // hold the last frame
    const compute = (now: number) => {
      const beatMs = beatSeconds * 1000;
      const sub = beatMs > 0 ? Math.min(1, Math.max(0, (now - beatStamp.current) / beatMs)) : 0;
      setFrame(
        figureFrameAt(
          seg,
          {
            seconds: (beatsIn + sub) * beatSeconds,
            total,
            beatProgress: sub,
            breath:
              breathPhase && breathSeconds > 0
                ? { phase: breathPhase, progress: Math.min(1, (now - breathStamp.current) / (breathSeconds * 1000)) }
                : undefined,
          },
          steps,
        ),
      );
    };
    // once per beat synchronously (rAF is silent in a background tab), then
    // smoothly between beats while the tab is visible
    compute(performance.now());
    let raf = requestAnimationFrame(function tick(now) {
      compute(now);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [seg, steps, beatsIn, beatSeconds, total, breathPhase, breathSeconds, paused]);

  return seg ? frame : undefined;
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
  const plan = useMemo(() => figurePlan(props.pose), [props.pose]);
  const frame = useClassFigureFrame(plan, props.figureClock, props.breath, props.paused);
  const segMotion =
    plan && props.figureClock
      ? plan.segments[Math.min(props.figureClock.segment, plan.segments.length - 1)]?.motion
      : undefined;
  const motion = props.hidden ? undefined : (segMotion ?? props.pose.motion);

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
    if (props.segmentLabel) setAnnounced(props.segmentLabel);
  }, [props.segmentLabel]);

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
                layers={{ guides: true, ghost: false }}
                frame={frame}
              />
            </div>
          ) : (
            <div className="cm-figure cm-figure-hidden" aria-hidden="true">
              {props.hidden ? '?' : ''}
            </div>
          )}
        </div>

        <div className="cm-readout">
          {props.segmentLabel && (
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
        {announced}
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
