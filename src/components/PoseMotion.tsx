import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { PoseMotion as Motion } from '../data';
import './PoseMotion.css';

const REDUCED = '(prefers-reduced-motion: reduce)';

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
 */
export function PoseMotion({
  motion,
  size = 200,
  autoplay = true,
  showStages = true,
  frameClassName,
}: {
  motion: Motion;
  size?: number;
  autoplay?: boolean;
  showStages?: boolean;
  /** extra class for the element wrapping the figure cell (e.g. a hero disc) */
  frameClassName?: string;
}) {
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
  const style = {
    width: size,
    height: size,
    WebkitMaskImage: `url(${motion.sprite})`,
    maskImage: `url(${motion.sprite})`,
    WebkitMaskSize: maskSize,
    maskSize,
    WebkitMaskPosition: maskPos,
    maskPosition: maskPos,
  } as CSSProperties;

  const current = motion.stages.reduce((acc, s, i) => (frame >= s.frame ? i : acc), 0);

  return (
    <div className="pose-motion">
      <div className={'pose-motion-frame' + (frameClassName ? ` ${frameClassName}` : '')} aria-hidden>
        <div className="pose-motion-cell" style={style} />
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
    </div>
  );
}
