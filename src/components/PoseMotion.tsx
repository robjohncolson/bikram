import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { PoseMotion as Motion } from '../data';
import './PoseMotion.css';

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
 * held stage. It is a demonstration on its own clock — never a claim
 * about where the class is.
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
 * it and hides the chips and caption (class mode).
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
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(autoplay && !reduced);
  const frameRef = useRef(0);
  frameRef.current = frame;

  // the OS preference turning on stops autonomous motion mid-play
  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  useEffect(() => {
    if (!playing) return;
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
  }, [playing, motion.fps, motion.frames]);

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
  if (breathing) (stackStyle as Record<string, string | number>)['--breath-dur'] = `${breathing.seconds}s`;
  const ghost = active.ghost ? motion.ghost : undefined;
  const guides = active.guides ? motion.guides : undefined;
  const interactive = !layers;

  const current = motion.stages.reduce((acc, s, i) => (frame >= s.frame ? i : acc), 0);

  return (
    <div className="pose-motion">
      <div className={'pose-motion-frame' + (frameClassName ? ` ${frameClassName}` : '')} aria-hidden>
        <div ref={stackRef} className="pose-motion-stack" data-breath={breathing?.phase} style={stackStyle}>
          {ghost && <div className="pose-motion-cell pose-motion-cell--ghost" style={cellStyle(ghost)} />}
          <div className="pose-motion-cell" style={cellStyle(motion.sprite)} />
          {guides && <div className="pose-motion-cell pose-motion-cell--guides" style={cellStyle(guides)} />}
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
