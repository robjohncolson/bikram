import { Suspense, lazy, useId, useRef, useState } from 'react';
import type { RigData } from '../data';
import { RigBoundary } from './RigBoundary';
import { loadLayers, saveLayers, useReducedMotion } from './figurePrefs';
import type { MotionLayers } from './figurePrefs';
import type { SheetPlayer } from './useSheetPlayer';
import { useOrbit } from './useOrbit';
import './PoseMotion.css';

// three.js and the rig renderer load only when a live figure first mounts
const FigureRig = lazy(() => import('./FigureRig'));

/**
 * The live figure with no sprite behind it — for sheets that only exist as
 * rig data (the posture library). The rig path of PoseMotion without the
 * sprite cells: the same FigureRig, the same chips (play/pause, the
 * sheet's stages, Guides/Mistake when it has them), the same hand orbit
 * and Reset view, the same classes and so the same look. The clock is the
 * parent's `player` (`useSheetPlayer`), so a page can follow the stage and
 * scrub it from elsewhere (the library's step list).
 *
 * There is nothing to fall back to: when WebGL is unavailable, the context
 * is lost, or three or the renderer chunk fails, `onUnavailable` fires and
 * the parent shows its notice instead. Reduced motion: the player never
 * plays on its own and FigureRig snaps to stages; chips still scrub.
 */
export function LiveFigure({
  sheet,
  player,
  size,
  frameClassName,
  onUnavailable,
}: {
  sheet: RigData;
  player: SheetPlayer;
  size: number;
  /** extra class for the disc wrapping the figure */
  frameClassName?: string;
  onUnavailable: () => void;
}) {
  const [layers, setLayers] = useState<MotionLayers>(loadLayers);
  const toggleLayer = (k: keyof MotionLayers) =>
    setLayers((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      saveLayers(next);
      return next;
    });
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const discRef = useRef<HTMLDivElement>(null);
  const orbit = useOrbit(discRef, { enabled: ready, reduced });
  const hintId = useId();
  const hasGuides = sheet.stages.some((s) => s.guides?.length);
  const hasGhost = sheet.stages.some((s) => s.ghost);
  const { blend, current, playing, setPlaying, seek } = player;

  return (
    <div className="pose-motion">
      <div
        ref={discRef}
        className={'pose-motion-frame' + (frameClassName ? ` ${frameClassName}` : '')}
        tabIndex={ready ? 0 : undefined}
        role="group"
        aria-label="Figure view"
        aria-describedby={hintId}
        data-orbit={orbit.dragging ? 'dragging' : 'ready'}
      >
        <div className="pose-motion-stack" data-renderer="rig" style={{ width: size, height: size }}>
          <div className="pose-motion-rig">
            <RigBoundary onFail={onUnavailable}>
              <Suspense fallback={null}>
                <FigureRig
                  data={sheet}
                  size={size}
                  pose={blend}
                  layers={layers}
                  viewOffset={orbit.offset}
                  grounded
                  onReady={() => setReady(true)}
                  onUnavailable={onUnavailable}
                />
              </Suspense>
            </RigBoundary>
          </div>
        </div>
      </div>
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
        {(hasGuides || hasGhost) && (
          <div className="pose-motion-layers" role="group" aria-label="Teaching layers">
            {hasGuides && (
              <button
                type="button"
                className="pose-motion-layer pose-motion-layer--guides"
                aria-pressed={layers.guides}
                onClick={() => toggleLayer('guides')}
              >
                Guides
              </button>
            )}
            {hasGhost && (
              <button
                type="button"
                className="pose-motion-layer pose-motion-layer--ghost"
                aria-pressed={layers.ghost}
                onClick={() => toggleLayer('ghost')}
              >
                Mistake
              </button>
            )}
          </div>
        )}
        {orbit.off && (
          <button
            type="button"
            className="pose-motion-reset"
            onClick={() => {
              orbit.reset();
              // the button goes when the view is back: keep keyboard users on the figure
              discRef.current?.focus({ preventScroll: true });
            }}
          >
            Reset view
          </button>
        )}
        <div className="pose-motion-stages" role="group" aria-label="Stages">
          {sheet.stages.map((s, i) => (
            <button
              key={`${s.label}-${i}`}
              type="button"
              className={'pose-motion-stage' + (i === current ? ' is-current' : '')}
              aria-current={i === current ? 'step' : undefined}
              onClick={() => seek(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {(layers.guides && hasGuides) || (layers.ghost && hasGhost) ? (
        <p className="pose-motion-caption">Blue lines mark the alignment to find · orange is the common mistake</p>
      ) : null}
      <p id={hintId} className="pose-motion-hint text-faint">
        Drag to turn · arrows to orbit
      </p>
    </div>
  );
}
