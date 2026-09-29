/**
 * The sheets' ortho camera, pure: an azimuth about +Z (Blender's `VIEWS`:
 * 0 = looking at the mannequin's front, side = -90° puts the face to
 * screen right), the height it centres on, and the metres it shows top
 * to bottom. `render_motion.py` keyframes these per stage and eases
 * between them (bezier ease-in-out); `orbitBetween` does the same with
 * smoothstep, turning the SHORT way round like `orbit_camera`.
 */
import type { RigData, RigFrame } from '../data/types';
import { smoothstep } from './math';
import { VIEWS } from './skeleton';

export interface CameraState {
  /** radians about +Z */
  azimuth: number;
  centerZ: number;
  /** ortho height in metres */
  scale: number;
}

/** the renderer's framing defaults (`stage_frame`) */
const DEFAULT_FRAME: RigFrame = { center_z: 0.9, scale: 2.0 };

export function cameraAt(view: string, frame: Partial<RigFrame> = {}): CameraState {
  const f = { ...DEFAULT_FRAME, ...frame };
  return { azimuth: ((VIEWS[view] ?? 0) * Math.PI) / 180, centerZ: f.center_z, scale: f.scale };
}

/** The camera of one stage of a sheet: its own view/frame, else the sheet's. */
export function stageCamera(data: RigData, stage: number): CameraState {
  const st = data.stages[Math.min(data.stages.length - 1, Math.max(0, stage))];
  return cameraAt(st?.view ?? data.view, { ...data.frame, ...(st?.frame ?? {}) });
}

/** `s` (linear, 0–1) of the way from camera `a` to `b`, eased, the azimuth the short way round. */
export function orbitBetween(a: CameraState, b: CameraState, s: number): CameraState {
  const e = smoothstep(s);
  let to = b.azimuth;
  while (to - a.azimuth > Math.PI) to -= 2 * Math.PI;
  while (to - a.azimuth < -Math.PI) to += 2 * Math.PI;
  return {
    azimuth: a.azimuth + (to - a.azimuth) * e,
    centerZ: a.centerZ + (b.centerZ - a.centerZ) * e,
    scale: a.scale + (b.scale - a.scale) * e,
  };
}
