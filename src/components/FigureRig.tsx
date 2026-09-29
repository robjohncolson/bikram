import { useEffect, useMemo, useRef, useState } from 'react';
import type { RigData } from '../data';
import { breathe, cubicBezier, guideSegments, orbitBetween, sheetPose, stageCamera, stageGhost, unsmoothstep } from '../rig';
import type { RigColors, RigScene, RGBA } from './figureRigScene';
import './FigureRig.css';

/** Where the rig is: `t` (eased) of the way from stage `from` to `to`; `sheet` = a bridge's data while one plays. */
export interface RigPoseProp {
  from: number;
  to: number;
  t: number;
  sheet?: RigData;
}

export interface FigureRigProps {
  /** the posture's rig sheet */
  data: RigData;
  size: number;
  pose: RigPoseProp;
  layers: { guides: boolean; ghost: boolean };
  /** the breath: which phase and how far through it */
  breath?: { phase: 'inhale' | 'exhale'; progress: number };
  /** keep the layer canvases drawn and toggle `data-on`, so CSS fades them (class mode) */
  fadeLayers?: boolean;
  /** the first frame has been drawn (the sprite can step aside) */
  onReady?: () => void;
  /** WebGL unavailable, the context lost, or three failed to load: the sprite takes over */
  onUnavailable?: () => void;
}

const REDUCED = '(prefers-reduced-motion: reduce)';
const DARK = '(prefers-color-scheme: dark)';
/** the sprite's CSS breath curve (PoseMotion.css), so both figures breathe alike */
const breathEase = cubicBezier(0.45, 0.05, 0.35, 1);

/** Any CSS colour string → sRGB 0–1 RGBA, resolved by the browser itself (a 1×1 canvas). */
function resolveColor(css: string, probe: CanvasRenderingContext2D): RGBA {
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#000';
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255, a / 255];
}

/**
 * The layer colours from the wrapper's computed style: the figure in its
 * text colour (`currentColor`), the ghost in the sprite ghost's
 * `color-mix(in srgb, var(--ember) 55%, transparent)`, the guides in
 * `--stretches` — never hardcoded, so both themes (and class mode's dim
 * room) just work.
 */
function readColors(el: HTMLElement): RigColors | undefined {
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe) return undefined;
  const cs = getComputedStyle(el);
  const ember = resolveColor(cs.getPropertyValue('--ember').trim() || cs.color, probe);
  return {
    figure: resolveColor(cs.color, probe),
    ghost: [ember[0], ember[1], ember[2], ember[3] * 0.55],
    guides: resolveColor(cs.getPropertyValue('--stretches').trim() || cs.color, probe),
  };
}

/** Live `matchMedia` flag. */
function useMedia(query: string): boolean {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = () => setOn(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return on;
}

/**
 * The live three.js figure: the posture's rig posed from stage data and
 * drawn as line art (see `figureRigScene.ts`). Fully controlled — the
 * parent says where it is (`pose`, `breath`) and it renders once per
 * change: a held stage is one render, and there is no loop of its own.
 * Reduced motion snaps to the target stage and drops the breath.
 */
export default function FigureRig({ data, size, pose, layers, breath, fadeLayers = false, onReady, onUnavailable }: FigureRigProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLCanvasElement>(null);
  const ghostRef = useRef<HTMLCanvasElement>(null);
  const guidesRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<RigScene | undefined>(undefined);
  const [colors, setColors] = useState<RigColors | undefined>(undefined);
  const reduced = useMedia(REDUCED);
  const dark = useMedia(DARK);
  const unavailable = useRef(onUnavailable);
  unavailable.current = onUnavailable;
  const ready = useRef(onReady);
  ready.current = onReady;
  const drawn = useRef(false);

  // three and the scene load on mount; any failure hands back to the sprite
  useEffect(() => {
    let alive = true;
    let made: RigScene | undefined;
    import('./figureRigScene')
      .then(({ RigScene }) => {
        if (!alive) return;
        made = new RigScene(); // throws when WebGL is unavailable
        made.onContextLost(() => unavailable.current?.());
        setScene(made);
      })
      .catch(() => {
        if (alive) unavailable.current?.();
      });
    return () => {
      alive = false;
      made?.dispose();
    };
  }, []);

  // colours on mount and whenever the colour scheme flips
  useEffect(() => {
    if (wrapRef.current) setColors(readColors(wrapRef.current));
  }, [dark]);

  const sheet = pose.sheet ?? data;
  const from = reduced ? pose.to : pose.from;
  const t = reduced ? 1 : Math.min(1, Math.max(0, pose.t));
  const amount = !breath || reduced ? 0 : breath.phase === 'inhale' ? breathEase(breath.progress) : 1 - breathEase(breath.progress);
  const holdStage = t >= 1 ? pose.to : t <= 0 ? from : undefined;
  const guideStage = t < 0.5 ? from : pose.to;
  const hasGhost = holdStage !== undefined && Boolean(sheet.stages[holdStage]?.ghost);
  const drawGhost = hasGhost && (fadeLayers || layers.ghost);
  const guides = sheet.stages[guideStage]?.guides;
  const drawGuides = Boolean(guides?.length) && (fadeLayers || layers.guides);
  // one segment list per stage's guides, so the scene sees an unchanged layer
  const guideLines = useMemo(() => (drawGuides ? guideSegments(guides) : undefined), [drawGuides, guides]);

  useEffect(() => {
    const out = { figure: figureRef.current, ghost: ghostRef.current, guides: guidesRef.current };
    if (!scene || !colors || !out.figure || !out.ghost || !out.guides || size <= 0) return;
    try {
      scene.setSize(size);
      const figure = breathe(sheetPose(sheet, from, pose.to, t), amount);
      const ghost = drawGhost && holdStage !== undefined ? stageGhost(sheet, holdStage) : undefined;
      // the camera eases like the sheets' (smoothstep on the linear fraction)
      const cam = orbitBetween(stageCamera(sheet, from), stageCamera(sheet, pose.to), unsmoothstep(t));
      scene.render(
        { figure, ghost, guides: guideLines },
        cam,
        colors,
        { figure: out.figure, ghost: out.ghost, guides: out.guides },
      );
      if (wrapRef.current) wrapRef.current.dataset.renderMs = scene.lastRenderMs.toFixed(2);
      if (!drawn.current) {
        drawn.current = true;
        ready.current?.();
      }
    } catch {
      unavailable.current?.();
    }
  }, [scene, colors, size, sheet, from, pose.to, t, amount, drawGhost, holdStage, guideLines]);

  const style = { width: size, height: size };
  return (
    <div ref={wrapRef} className="figure-rig" style={style} aria-hidden>
      <canvas
        ref={ghostRef}
        className="figure-rig-layer figure-rig-layer--ghost"
        data-on={fadeLayers ? layers.ghost || undefined : undefined}
      />
      <canvas ref={figureRef} className="figure-rig-layer" />
      <canvas
        ref={guidesRef}
        className="figure-rig-layer figure-rig-layer--guides"
        data-on={fadeLayers ? layers.guides || undefined : undefined}
      />
    </div>
  );
}
