/**
 * The mannequin rig, as `scripts/blender/render_motion.py` builds it: joint
 * rest positions, bones (head joint → tail joint, parent), the skin radii
 * and extra skin vertices, and the camera views. The character stands at
 * the origin facing -Y, +Z up; its LEFT is +X.
 *
 * Hand-kept in step with the Blender script: `skeleton.test.ts` deep-equals
 * these tables against the GENERATED `src/data/rig/skeleton.json`
 * (`npm run rig:export`), so drift fails a test.
 */
import type { Vec3 } from './math';
import { normalize, sub } from './math';

export const FPS = 12;

/** a bone turning further than this (degrees) between stages is steered through a midpoint */
export const BIG_TURN_DEG = 150;

export const J: Record<string, Vec3> = {
  pelvis: [0, 0, 1.0],
  waist: [0, 0, 1.12],
  chest: [0, 0, 1.27],
  neck: [0, 0, 1.4],
  head: [0, 0, 1.52],
  crown: [0, 0, 1.72],
  'shoulder.L': [0.2, 0, 1.44],
  'shoulder.R': [-0.2, 0, 1.44],
  'elbow.L': [0.22, 0, 1.15],
  'elbow.R': [-0.22, 0, 1.15],
  'wrist.L': [0.23, 0, 0.9],
  'wrist.R': [-0.23, 0, 0.9],
  'fingers.L': [0.23, 0, 0.8],
  'fingers.R': [-0.23, 0, 0.8],
  'hip.L': [0.1, 0, 0.98],
  'hip.R': [-0.1, 0, 0.98],
  'knee.L': [0.1, 0, 0.54],
  'knee.R': [-0.1, 0, 0.54],
  'ankle.L': [0.1, 0, 0.1],
  'ankle.R': [-0.1, 0, 0.1],
  'toes.L': [0.1, -0.16, 0.02],
  'toes.R': [-0.1, -0.16, 0.02],
};

/** name, head joint, tail joint, parent — parents always come first */
export type BoneDef = [name: string, head: string, tail: string, parent: string | null];

export const BONES: BoneDef[] = [
  ['pelvis', 'pelvis', 'waist', null],
  ['spine.lower', 'waist', 'chest', 'pelvis'],
  ['spine.upper', 'chest', 'neck', 'spine.lower'],
  ['neck', 'neck', 'head', 'spine.upper'],
  ['head', 'head', 'crown', 'neck'],
  ['clavicle.L', 'neck', 'shoulder.L', 'spine.upper'],
  ['clavicle.R', 'neck', 'shoulder.R', 'spine.upper'],
  ['upperarm.L', 'shoulder.L', 'elbow.L', 'clavicle.L'],
  ['upperarm.R', 'shoulder.R', 'elbow.R', 'clavicle.R'],
  ['forearm.L', 'elbow.L', 'wrist.L', 'upperarm.L'],
  ['forearm.R', 'elbow.R', 'wrist.R', 'upperarm.R'],
  ['hand.L', 'wrist.L', 'fingers.L', 'forearm.L'],
  ['hand.R', 'wrist.R', 'fingers.R', 'forearm.R'],
  ['hipbone.L', 'pelvis', 'hip.L', 'pelvis'],
  ['hipbone.R', 'pelvis', 'hip.R', 'pelvis'],
  ['thigh.L', 'hip.L', 'knee.L', 'hipbone.L'],
  ['thigh.R', 'hip.R', 'knee.R', 'hipbone.R'],
  ['shin.L', 'knee.L', 'ankle.L', 'thigh.L'],
  ['shin.R', 'knee.R', 'ankle.R', 'thigh.R'],
  ['foot.L', 'ankle.L', 'toes.L', 'shin.L'],
  ['foot.R', 'ankle.R', 'toes.R', 'shin.R'],
];

export const BONE_NAMES: string[] = BONES.map((b) => b[0]);
export const BONE: Record<string, BoneDef> = Object.fromEntries(BONES.map((b) => [b[0], b]));
export const PARENT: Record<string, string | null> = Object.fromEntries(BONES.map((b) => [b[0], b[3]]));

/** skin tube radius (x, y) at each joint, keyed by the joint name's stem */
export const RADIUS: Record<string, [number, number]> = {
  pelvis: [0.14, 0.1],
  waist: [0.11, 0.09],
  chest: [0.15, 0.1],
  neck: [0.05, 0.05],
  head: [0.09, 0.1],
  crown: [0.07, 0.08],
  shoulder: [0.06, 0.06],
  elbow: [0.045, 0.045],
  wrist: [0.035, 0.035],
  fingers: [0.03, 0.02],
  palm: [0.05, 0.035],
  hip: [0.085, 0.085],
  knee: [0.06, 0.06],
  ankle: [0.045, 0.045],
  toes: [0.04, 0.025],
  ball: [0.045, 0.03],
  heel: [0.038, 0.038],
};

/**
 * Extra skin vertices riding the hand and foot bones: rest position,
 * from-joint, to-joint (the tube edge it splits) or null (a spur), bone.
 */
export const SKIN_EXTRA: Record<string, [Vec3, string, string | null, string]> = {
  'palm.L': [[0.23, 0, 0.865], 'wrist.L', 'fingers.L', 'hand.L'],
  'palm.R': [[-0.23, 0, 0.865], 'wrist.R', 'fingers.R', 'hand.R'],
  'ball.L': [[0.1, -0.11, 0.035], 'ankle.L', 'toes.L', 'foot.L'],
  'ball.R': [[-0.1, -0.11, 0.035], 'ankle.R', 'toes.R', 'foot.R'],
  'heel.L': [[0.1, 0.035, 0.045], 'ankle.L', null, 'foot.L'],
  'heel.R': [[-0.1, 0.035, 0.045], 'ankle.R', null, 'foot.R'],
};

/** which bone a joint's skin vertex follows */
export const VERTEX_BONE: Record<string, string> = {
  pelvis: 'pelvis',
  waist: 'spine.lower',
  chest: 'spine.upper',
  neck: 'neck',
  head: 'head',
  crown: 'head',
  'shoulder.L': 'upperarm.L',
  'shoulder.R': 'upperarm.R',
  'elbow.L': 'forearm.L',
  'elbow.R': 'forearm.R',
  'wrist.L': 'hand.L',
  'wrist.R': 'hand.R',
  'fingers.L': 'hand.L',
  'fingers.R': 'hand.R',
  'hip.L': 'thigh.L',
  'hip.R': 'thigh.R',
  'knee.L': 'shin.L',
  'knee.R': 'shin.R',
  'ankle.L': 'foot.L',
  'ankle.R': 'foot.R',
  'toes.L': 'foot.L',
  'toes.R': 'foot.R',
};

/** camera azimuths in degrees about +Z (0 = looking at the mannequin's front) */
export const VIEWS: Record<string, number> = {
  front: 0,
  quarter: -35,
  side: -90,
  'quarter-back': -145,
  back: 180,
};

/** Every bone's rest direction (head → tail), unit length. */
export function restDirections(): Record<string, Vec3> {
  return Object.fromEntries(BONES.map(([n, h, t]) => [n, normalize(sub(J[t], J[h]))]));
}
