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
