import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { PoseMotion as Motion, RigData } from '../data';
import { loadRigData, motionId, rigDataIfLoaded } from '../data';
import type { FigurePose } from '../pacer';
import { frameForPose } from '../pacer';
import { playAt, stageStartAt } from '../rig';
import type { SheetBlend } from '../rig';
import { RigBoundary } from './RigBoundary';
import { rigShows, rigStatusAfter } from './rigFallback';
import type { RigStatus } from './rigFallback';
import './PoseMotion.css';

// three.js and the rig renderer load only when a rig figure first mounts
const FigureRig = lazy(() => import('./FigureRig'));

/** A breath phase to follow and its length in seconds. */
export interface BreathPhase {
  phase: 'inhale' | 'exhale';
  seconds: number;
}

/** Which teaching layers to draw under/over the figure. */
export interface MotionLayers {
  guides: boolean;
  ghost: boolean;
}

const REDUCED = '(prefers-reduced-motion: reduce)';
const LAYERS_KEY = 'yoga-motion-layers-v1';
const DEFAULT_LAYERS: MotionLayers = { guides: true, ghost: false };
/** steps per breath phase when PoseMotion tracks the rig's breath itself (a phase ≈ 40 renders) */
const BREATH_STEPS = 40;

function loadLayers(): MotionLayers {
  try {
    const raw = localStorage.getItem(LAYERS_KEY);
    if (!raw) return DEFAULT_LAYERS;
    const v = JSON.parse(raw) as Partial<MotionLayers> | null;
    return {
      guides: typeof v?.guides === 'boolean' ? v.guides : DEFAULT_LAYERS.guides,
      ghost: typeof v?.ghost === 'boolean' ? v.ghost : DEFAULT_LAYERS.ghost,
    };
  } catch {
    return DEFAULT_LAYERS;
  }
}

function saveLayers(v: MotionLayers): void {
  try {
    localStorage.setItem(LAYERS_KEY, JSON.stringify(v));
  } catch {
    /* storage blocked: the choice just won't stick */
  }
}

/** Live `prefers-reduced-motion`, following OS changes while mounted. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(REDUCED).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.(REDUCED);
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Animated line-art figure. Draws one cell of a rendered sprite sheet
 * through a CSS mask filled with `currentColor`, so the strokes take the
 * surrounding text colour in either theme. Plays at the sheet's fps and
 * loops with a short rest on the last frame; the stage chips scrub to a
 * held stage. Left to itself it is a demonstration on its own clock; a
 * `frame` prop takes the clock away entirely (the class-mode figure is
 * driven this way, in step with the class — see `pacer/figure.ts`).
 *
 * Reduced motion: autonomous playback stops (and stays stopped if the OS
 * preference flips while mounted) and the figure rests on its first held
 * stage; pressing play is an explicit opt-in that still works.
 *
 * Breath (optional, decorative): `breath` sets `data-breath` on the cell
 * and its phase length as `--breath-dur`; CSS transitions a small
 * chest-origin swell on inhale and settles it on exhale. Flipping the
 * phase is the only trigger — no animation loop, and sprite-frame stepping
 * is untouched. Reduced motion drops it entirely. The breath transform
 * sits on the stack wrapper so every layer breathes together.
 *
 * Teaching layers (optional sheets with the sprite's exact frame layout):
 * the ghost (common-mistake figure, faint ember) draws UNDER the figure
 * and the guides (alignment lines, cool blue) ON TOP, all at the same
 * frame and mask math. Posture pages get "Guides"/"Mistake" chips whose
 * choice persists in `yoga-motion-layers-v1`; a `layers` prop overrides
 * it and hides the chips and caption (class mode). With `fadeLayers` the
 * layer cells the sheet has are always mounted and switched by a
 * `data-on` attribute instead, so CSS can fade them in and out (class mode
 * flashes a layer for one breath after a coaching line).
 *
 * Renderer: `renderer="rig"` draws the live three.js figure (`FigureRig`)
 * in the same box instead of the sprite cells — posed from the sheet's
 * exported stage data (`loadRigData`), controlled by `pose` the way the
 * sprite is by `frame`. The sprite shows while three and the data load,
 * and takes over for good if the rig reports itself unavailable. Left to
 * itself the rig walks the stages on the sheet's clock (`playAt`); the
 * chips, play/pause, layer chips and breath all work the same, except that
 * the rig breathes by opening its chest instead of the CSS swell.
 */
export function PoseMotion({
  motion,
  size = 200,
  autoplay = true,
  showStages = true,
  frameClassName,
  breath,
  breathPaused = false,
  layers,
  fadeLayers = false,
  frame: controlled,
  renderer = 'sprite',
  pose,
  breathProgress,
}: {
  motion: Motion;
  size?: number;
  autoplay?: boolean;
  showStages?: boolean;
  /** extra class for the element wrapping the figure cell (e.g. a hero disc) */
  frameClassName?: string;
  /** breathe with a pacer: the current phase and how long it lasts */
  breath?: BreathPhase;
  /** freeze the breath mid-transition (the class is paused) */
  breathPaused?: boolean;
  /** fixed layer choice that hides the chips and caption (class mode) */
  layers?: MotionLayers;
  /** keep the sheet's layer cells mounted and toggle `data-on`, for CSS fades */
  fadeLayers?: boolean;
  /** controlled mode: show exactly this frame and never run the player */
  frame?: number;
  /** which figure draws: the sprite sheet (default) or the live three.js rig */
  renderer?: 'sprite' | 'rig';
  /** the rig's controlled input (its `motion` may be a bridge's sheet); like `frame`, it stops the player */
  pose?: FigurePose;
  /** how far through the breath phase (0–1), when the parent tracks it (class mode) */
  breathProgress?: number;
}) {
  const [stored, setStored] = useState<MotionLayers>(loadLayers);
  const active = layers ?? stored;
  const toggleLayer = (k: keyof MotionLayers) =>
    setStored((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      saveLayers(next);
      return next;
    });
  const reduced = useReducedMotion();
  const [ownFrame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(autoplay && !reduced && controlled === undefined && pose === undefined);
  const frame = controlled === undefined ? ownFrame : Math.min(motion.frames - 1, Math.max(0, Math.round(controlled)));
  const frameRef = useRef(0);
  frameRef.current = ownFrame;

  // ---- the live rig (renderer="rig")
  const [rigStatus, setRigStatus] = useState<RigStatus>('loading');
  const useRig = renderer === 'rig' && rigStatus !== 'failed';
  const [ownBlend, setOwnBlend] = useState<SheetBlend>({ from: 0, to: 0, t: 1 });
  const blendRef = useRef(ownBlend);
  blendRef.current = ownBlend;
  /**
   * The rig is unavailable (no WebGL, a lost context, a chunk that would
   * not load): hand the figure to the sprite for good. On its own clock the
   * sprite picks up where the rig was — the frame nearest its pose — and
   * keeps playing or stays paused as it was.
   */
  const rigUnavailable = () => {
    if (pose === undefined) {
      const b = blendRef.current;
      setFrame(frameForPose(motion, b.from, b.to, b.t));
    }
    setRigStatus((st) => rigStatusAfter(st, 'failed'));
  };
  const rigId = useRig ? motionId(pose?.motion ?? motion) : undefined;
  const [loaded, setLoaded] = useState<RigData | undefined>(undefined);
  const failRef = useRef(rigUnavailable);
  failRef.current = rigUnavailable;
  useEffect(() => {
    if (!rigId || rigDataIfLoaded(rigId)) return;
    let alive = true;
    loadRigData(rigId).then(
      (d) => {
        if (alive) setLoaded(d);
      },
      () => {
        if (alive) failRef.current();
      },
    );
    return () => {
      alive = false;
    };
  }, [rigId]);
  // the sheet the rig draws (a bridge's while one plays); undefined until it has loaded
  const rigSheet = rigId ? (rigDataIfLoaded(rigId) ?? (loaded?.id === rigId ? loaded : undefined)) : undefined;
  // the renderer stays mounted (one WebGL context) while another sheet loads;
  // the sprite covers that moment
  const lastSheet = useRef<RigData | undefined>(undefined);
  if (rigSheet) lastSheet.current = rigSheet;
  const mountedSheet = rigSheet ?? lastSheet.current;
  const rigPlayer = useRig && pose === undefined;
  /** the rig demonstration's own clock: seconds into `playAt`'s loop, frozen while paused */
  const rigClock = useRef(0);

  // the OS preference turning on stops autonomous motion mid-play
  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  useEffect(() => {
    if (!playing || controlled !== undefined || rigPlayer) return;
    let raf = 0;
    let last = performance.now();
    let rest = 0; // ms to hold on the final frame before looping
    const step = 1000 / motion.fps;
    const tick = (now: number) => {
      const dt = now - last;
      if (rest > 0) {
        rest -= dt;
        last = now;
        if (rest <= 0) setFrame(0);
      } else if (dt >= step) {
        last = now - (dt % step);
        const next = frameRef.current + 1;
        if (next >= motion.frames) rest = 1200;
        else setFrame(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, controlled, motion.fps, motion.frames, rigPlayer]);

  // the rig on its own clock: walk the stages at the sheet's fps. The
  // elapsed sheet time lives in `rigClock`, frozen on pause and rebased on
  // resume, so a pause mid-travel resumes mid-travel (as the sprite keeps
  // its frame); only a stage chip seeks, to the start of that stage's hold
  useEffect(() => {
    if (!playing || !rigPlayer || !rigSheet) return;
    const fps = motion.fps;
    const origin = performance.now() - rigClock.current * 1000;
    let raf = requestAnimationFrame(function tick(now) {
      rigClock.current = (now - origin) / 1000;
      const b = playAt(rigSheet, fps, rigClock.current);
      const cur = blendRef.current;
      if (b.from !== cur.from || b.to !== cur.to || b.t !== cur.t) setOwnBlend({ from: b.from, to: b.to, t: b.t });
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing, rigPlayer, rigSheet, motion.fps]);

  const rows = Math.ceil(motion.frames / motion.cols);
  const col = frame % motion.cols;
  const row = Math.floor(frame / motion.cols);
  const scale = size / motion.frame;
  const maskSize = `${motion.cols * motion.frame * scale}px ${rows * motion.frame * scale}px`;
  const maskPos = `${-col * size}px ${-row * size}px`;
  const cellStyle = (url: string) =>
    ({
      WebkitMaskImage: `url(${url})`,
      maskImage: `url(${url})`,
      WebkitMaskSize: maskSize,
      maskSize,
      WebkitMaskPosition: maskPos,
      maskPosition: maskPos,
    }) as CSSProperties;
  const stackStyle = { width: size, height: size } as CSSProperties;
  const breathing = breath && !reduced && breath.seconds > 0 ? breath : undefined;

  // the rig's breath: the parent's progress, or tracked here from the phase
  // flips (a posture page's resting breath), stepped so a phase is a few
  // dozen renders rather than one per display frame
  const [ownBreathP, setOwnBreathP] = useState(0);
  const breathKey = useRig && breathProgress === undefined && breathing ? breathing.phase : undefined;
  const breathMs = (breathing?.seconds ?? 0) * 1000;
  useEffect(() => {
    if (!breathKey || breathPaused || breathMs <= 0) return;
    const t0 = performance.now();
    let last = -1;
    let raf = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, Math.round(((now - t0) / breathMs) * BREATH_STEPS) / BREATH_STEPS);
      if (p !== last) setOwnBreathP((last = p));
      if (p < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [breathKey, breathPaused, breathMs]);

  // A CSS transition can't be paused, so on pause we pin the computed
  // transform inline (and drop the transition); on resume the inline pin
  // is removed and the transition carries on toward the phase's target.
  const stackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    if (breathPaused) {
      const t = getComputedStyle(el).transform;
      el.style.transform = t === 'none' ? '' : t;
      el.style.transition = 'none';
    } else {
      el.style.transition = '';
      el.style.transform = '';
    }
  }, [breathPaused]);
  const rigShown = useRig && rigShows(rigStatus, rigSheet !== undefined);
  if (breathing && !rigShown) (stackStyle as Record<string, string | number>)['--breath-dur'] = `${breathing.seconds}s`;
  const ghost = active.ghost ? motion.ghost : undefined;
  const guides = active.guides ? motion.guides : undefined;
  const interactive = !layers;
  const rigBlend: SheetBlend = pose ? { from: pose.from, to: pose.to, t: pose.t } : ownBlend;

  const current = useRig
    ? rigBlend.t >= 0.5
      ? rigBlend.to
      : rigBlend.from
    : motion.stages.reduce((acc, s, i) => (frame >= s.frame ? i : acc), 0);

  return (
    <div className="pose-motion">
      <div className={'pose-motion-frame' + (frameClassName ? ` ${frameClassName}` : '')} aria-hidden>
        <div
          ref={stackRef}
          className="pose-motion-stack"
          data-breath={rigShown ? undefined : breathing?.phase}
          data-renderer={rigShown ? 'rig' : 'sprite'}
          style={stackStyle}
        >
          {!rigShown && (
            <>
              {fadeLayers && motion.ghost ? (
                <div
                  className="pose-motion-cell pose-motion-cell--ghost"
                  data-on={active.ghost || undefined}
                  style={cellStyle(motion.ghost)}
                />
              ) : (
                ghost && <div className="pose-motion-cell pose-motion-cell--ghost" style={cellStyle(ghost)} />
              )}
              <div className="pose-motion-cell" style={cellStyle(motion.sprite)} />
              {fadeLayers && motion.guides ? (
                <div
                  className="pose-motion-cell pose-motion-cell--guides"
                  data-on={active.guides || undefined}
                  style={cellStyle(motion.guides)}
                />
              ) : (
                guides && <div className="pose-motion-cell pose-motion-cell--guides" style={cellStyle(guides)} />
              )}
            </>
          )}
          {useRig && mountedSheet && (
            <div className="pose-motion-rig" hidden={!rigShown}>
              <RigBoundary onFail={rigUnavailable}>
                <Suspense fallback={null}>
                  <FigureRig
                    data={mountedSheet}
                    size={size}
                    pose={rigBlend}
                    layers={active}
                    fadeLayers={fadeLayers}
                    breath={breathing ? { phase: breathing.phase, progress: breathProgress ?? ownBreathP } : undefined}
                    onReady={() => setRigStatus((st) => rigStatusAfter(st, 'ready'))}
                    onUnavailable={rigUnavailable}
                  />
                </Suspense>
              </RigBoundary>
            </div>
          )}
        </div>
      </div>
      {showStages && (
        <div className="pose-motion-controls">
          <button
            type="button"
            className="pose-motion-play"
            aria-pressed={playing}
            aria-label={playing ? 'Pause figure' : 'Play figure'}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          {interactive && (motion.guides || motion.ghost) && (
            <div className="pose-motion-layers" role="group" aria-label="Teaching layers">
              {motion.guides && (
                <button
                  type="button"
                  className="pose-motion-layer pose-motion-layer--guides"
                  aria-pressed={active.guides}
                  onClick={() => toggleLayer('guides')}
                >
                  Guides
                </button>
              )}
              {motion.ghost && (
                <button
                  type="button"
                  className="pose-motion-layer pose-motion-layer--ghost"
                  aria-pressed={active.ghost}
                  onClick={() => toggleLayer('ghost')}
                >
                  Mistake
                </button>
              )}
            </div>
          )}
          <div className="pose-motion-stages" role="group" aria-label="Stages">
            {motion.stages.map((s, i) => (
              <button
                key={`${s.frame}-${i}`}
                type="button"
                className={'pose-motion-stage' + (i === current ? ' is-current' : '')}
                aria-current={i === current ? 'step' : undefined}
                onClick={() => {
                  setPlaying(false);
                  setFrame(s.frame);
                  setOwnBlend({ from: i, to: i, t: 1 });
                  // the one seek: the demonstration resumes from this stage's hold
                  if (mountedSheet) rigClock.current = stageStartAt(mountedSheet, motion.fps, i);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {interactive && showStages && (guides || ghost) && (
        <p className="pose-motion-caption">
          Blue lines mark the alignment the cue asks for · orange is the common mistake
        </p>
      )}
    </div>
  );
}
