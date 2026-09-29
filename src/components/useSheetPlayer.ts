import { useCallback, useEffect, useRef, useState } from 'react';
import type { RigData } from '../data';
import { FPS, playAt, stageStartAt } from '../rig';
import type { SheetBlend } from '../rig';

/** A rig sheet played on its own clock, with the stage it is on and a seek. */
export interface SheetPlayer {
  /** where the figure is: `t` (eased) of the way from stage `from` to `to` */
  blend: SheetBlend;
  /** the stage showing (the nearer end of a blend) */
  current: number;
  playing: boolean;
  setPlaying: (v: boolean | ((p: boolean) => boolean)) => void;
  /** show stage `i` held and pause there; play resumes from its hold */
  seek: (i: number) => void;
}

/**
 * The stage the figure SHOWS for a blend — the rule FigureRig draws by, so
 * the chips, steps and notice never describe a different stage from the
 * figure: under reduced motion FigureRig snaps to `to`; otherwise the
 * nearer end of the travel.
 */
export function shownStage(b: SheetBlend, reduced: boolean): number {
  if (reduced) return b.to;
  return b.t >= 0.5 ? b.to : b.from;
}

/** A blend brought to rest where FigureRig draws it under reduced motion: held on `to`. */
export function settleBlend(b: SheetBlend): SheetBlend {
  return b.from === b.to && b.t === 1 ? b : { from: b.to, to: b.to, t: 1 };
}

/**
 * The live figure's own demonstration clock, without a sprite: walk the
 * sheet's stages with each hold and transition at the rig's fps (`playAt`,
 * the same timing PoseMotion's rig player uses). The elapsed time lives in
 * a ref, frozen on pause and rebased on resume, so a pause mid-travel
 * resumes mid-travel; `seek` is the only jump. Reduced motion: never plays
 * on its own (and stops if the preference turns on); seeks still work.
 * Lifted out of the figure so the page's step list can follow and drive it.
 */
export function useSheetPlayer(sheet: RigData | undefined, opts: { autoplay?: boolean; reduced: boolean }): SheetPlayer {
  const { autoplay = true, reduced } = opts;
  const [blend, setBlend] = useState<SheetBlend>({ from: 0, to: 0, t: 1 });
  const [playing, setPlaying] = useState(autoplay && !reduced);
  const blendRef = useRef(blend);
  blendRef.current = blend;
  const clock = useRef(0);

  // reduced motion turning on mid-travel: stop, and hold the stage the
  // figure has snapped to (not the one the travel left)
  useEffect(() => {
    if (!reduced) return;
    setPlaying(false);
    setBlend(settleBlend);
  }, [reduced]);

  // a new sheet starts from its first stage
  useEffect(() => {
    clock.current = 0;
    setBlend({ from: 0, to: 0, t: 1 });
  }, [sheet]);

  useEffect(() => {
    if (!playing || !sheet) return;
    const origin = performance.now() - clock.current * 1000;
    let raf = requestAnimationFrame(function tick(now) {
      clock.current = (now - origin) / 1000;
      const b = playAt(sheet, FPS, clock.current);
      const cur = blendRef.current;
      if (b.from !== cur.from || b.to !== cur.to || b.t !== cur.t) setBlend({ from: b.from, to: b.to, t: b.t });
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing, sheet]);

  const seek = useCallback(
    (i: number) => {
      setPlaying(false);
      setBlend({ from: i, to: i, t: 1 });
      if (sheet) clock.current = stageStartAt(sheet, FPS, i);
    },
    [sheet],
  );

  const current = shownStage(blend, reduced);
  return { blend, current, playing, setPlaying, seek };
}
