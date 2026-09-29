/**
 * The live figure's rig — pure TypeScript, no three.js: the Blender
 * mannequin's skeleton, its posing (`applyStage`, a port of
 * `render_motion.py`), in-betweens, the camera, and the body/guide
 * geometry recipes the renderer (`components/FigureRig.tsx`) meshes.
 * Views import only from here.
 */
export type { Quat, Vec3 } from './math';
export { smoothstep, unsmoothstep, cubicBezier } from './math';
export { BIG_TURN_DEG, BONES, BONE_NAMES, FPS, J, PARENT, RADIUS, SKIN_EXTRA, VERTEX_BONE, VIEWS, restDirections } from './skeleton';
export type { BoneDef } from './skeleton';
export type { BoneName, RigPose, Solved, SolvedBone } from './pose';
export { applyStage, breathe, ghostPose, solve } from './pose';
export type { Midpoints } from './inbetween';
export { blend, midpointDir, midpoints } from './inbetween';
export { mirrorStage } from './mirror';
export type { CameraState } from './camera';
export { cameraAt, orbitBetween, stageCamera } from './camera';
export type { BodySegment } from './body';
export { bodyRecipe, bodySegments, guideSegments, placeBone, radiusAlong, vertexRadii } from './body';
export type { JointRecipe, Radii3, TubeRecipe } from './body';
export { LOOP_REST, playAt, sheetPose, stageGhost, stagePose, stageStartAt } from './sheet';
export type { SheetBlend } from './sheet';
