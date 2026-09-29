/**
 * The live figure's life in PoseMotion, as a tiny state machine: it is
 * `loading` until FigureRig has drawn its first frame (`ready`), and
 * `failed` for good once anything reports it unavailable — no WebGL, a
 * lost context, the three.js chunk or the FigureRig chunk itself failing
 * (the last one arrives through `RigBoundary`). The sprite stays mounted
 * until the rig is ready AND has the sheet it must draw, so a failure at
 * any point never flashes an empty box.
 */
export type RigStatus = 'loading' | 'ready' | 'failed';

export function rigStatusAfter(status: RigStatus, event: 'ready' | 'failed'): RigStatus {
  if (status === 'failed') return 'failed';
  return event;
}

/** Whether the rig draws (true) or the sprite cells (false). */
export function rigShows(status: RigStatus, sheetLoaded: boolean): boolean {
  return status === 'ready' && sheetLoaded;
}

/** What class mode hands the figure: a sheet to draw (by rig id) and how to draw it. */
export interface ShownFigure {
  /** the rig sheet this figure needs (a posture or a bridge id); undefined when nothing is drawn */
  sheet?: string;
}

/**
 * Never move the class figure onto a sheet that has not loaded: a skip or
 * hand-off to a posture whose rig data is still on the way would otherwise
 * reach the renderer without its sheet, and the sprite would cover the
 * wait — two renderers in one class. So the figure HOLDS what it drew last
 * (the current rig pose) until the destination sheet resolves, then moves.
 * Before anything has been shown (the class opening) there is nothing to
 * hold, and a figure with no sheet (withheld in rehearsal) passes through.
 */
export function holdUntilLoaded<T extends ShownFigure>(prev: T | undefined, next: T, isLoaded: (sheet: string) => boolean): T {
  if (!next.sheet || isLoaded(next.sheet)) return next;
  return prev?.sheet && isLoaded(prev.sheet) ? prev : next;
}
