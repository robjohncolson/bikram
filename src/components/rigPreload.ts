/**
 * Warm the live figure's lazy chunks (the FigureRig component and the
 * three.js scene) before class mode opens, so the class's first posture
 * draws the rig from its first frames instead of the sprite covering the
 * load. Fire and forget: a chunk that fails to load is reported by the
 * figure itself, which then keeps the sprite.
 */
export function preloadRig(): void {
  import('./FigureRig').catch(() => {});
  import('./figureRigScene').catch(() => {});
}
