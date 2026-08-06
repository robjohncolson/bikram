/**
 * Data access layer. Views import from here, never from pose files directly.
 */
import { poses } from './poses';
import { chakras, chakraById } from './chakras';
import { muscles, muscleById } from './muscles';
import type { ChakraId, MuscleId, Pose } from './types';

export { poses, chakras, chakraById, muscles, muscleById };
export type * from './types';

const poseById = new Map(poses.map((p) => [p.id, p]));

export function getPose(id: string): Pose | undefined {
  return poseById.get(id);
}

export function getNeighbors(pose: Pose): { prev?: Pose; next?: Pose } {
  const i = poses.indexOf(pose);
  return { prev: poses[i - 1], next: poses[i + 1] };
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
  let t = 0;
  for (const p of poses) {
    if (p === pose) return t;
    t += p.approxTotalSeconds;
  }
  return t;
}

export function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}
