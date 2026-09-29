import { useEffect, useState } from 'react';

/**
 * What the two figure components share: the teaching-layer choice (one
 * stored choice, so a posture page and a library page agree) and the live
 * reduced-motion preference. Factored out of PoseMotion unchanged.
 */

/** Which teaching layers to draw under/over the figure. */
export interface MotionLayers {
  guides: boolean;
  ghost: boolean;
}

const REDUCED = '(prefers-reduced-motion: reduce)';
const LAYERS_KEY = 'yoga-motion-layers-v1';
export const DEFAULT_LAYERS: MotionLayers = { guides: true, ghost: false };

export function loadLayers(): MotionLayers {
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

export function saveLayers(v: MotionLayers): void {
  try {
    localStorage.setItem(LAYERS_KEY, JSON.stringify(v));
  } catch {
    /* storage blocked: the choice just won't stick */
  }
}

/** Live `prefers-reduced-motion`, following OS changes while mounted. */
export function useReducedMotion(): boolean {
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
