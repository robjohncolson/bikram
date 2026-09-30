/**
 * Data access layer. Views import from here, never from pose files directly.
 */
import { poses } from './poses';
import { chakras, chakraById } from './chakras';
import { muscles, muscleById } from './muscles';
import { bridgeFor, motionId, motionUrls } from './motion';
import { RIG_LIVE, applyFigureFlag, figureRenderer, hasRigData, loadRigData, preloadRigData, rigBridgeIds, rigDataIfLoaded } from './rig';
import type { ChakraId, MuscleId, Pose } from './types';
export type { FigureOverride } from './rig';

export { poses, chakras, chakraById, muscles, muscleById, motionUrls, bridgeFor, motionId };
export { RIG_LIVE, applyFigureFlag, figureRenderer, hasRigData, loadRigData, preloadRigData, rigBridgeIds, rigDataIfLoaded };
export type * from './types';

const poseById = new Map(poses.map((p) => [p.id, p]));
const poseIndexById = new Map(poses.map((p, i) => [p.id, i]));
const poseByOrder = new Map(poses.map((p) => [p.order, p]));
const offsetById = new Map<string, number>();
let offset = 0;
for (const pose of poses) {
  offsetById.set(pose.id, offset);
  offset += pose.approxTotalSeconds;
}

export function getPose(id: string): Pose | undefined {
  return poseById.get(id);
}

export function getNeighbors(pose: Pose): { prev?: Pose; next?: Pose } {
  const i = poseIndexById.get(pose.id);
  if (i === undefined) return {};
  return { prev: poses[i - 1], next: poses[i + 1] };
}

export function getPoseByOrder(order: number): Pose | undefined {
  return poseByOrder.get(order);
}

/** Postures linked to a chakra, in sequence order */
export function posesForChakra(id: ChakraId): Pose[] {
  return poses.filter((p) => p.chakras.some((c) => c.id === id));
}

/** Postures working a muscle group, in sequence order */
export function posesForMuscle(id: MuscleId): Pose[] {
  return poses.filter((p) => p.muscles.some((m) => m.id === id));
}

/** Approximate full class length in seconds (postures only, excluding transitions) */
export const classTotalSeconds = poses.reduce((s, p) => s + p.approxTotalSeconds, 0);

/** Seconds elapsed in class when this pose begins */
export function classOffsetSeconds(pose: Pose): number {
  const seconds = offsetById.get(pose.id);
  if (seconds === undefined) throw new Error(`Unknown pose: ${pose.id}`);
  return seconds;
}

export function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}
