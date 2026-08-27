/**
 * The classical (Light on Yoga) layer — one file per posture, keyed by
 * pose id and merged onto `Pose.classical` by poses/index.ts. Authored
 * independently of the 26 & 2 teaching on purpose; see ClassicalNote in
 * ../types.ts for the contract and the originality rule.
 */
import type { ClassicalNote } from '../types';

export const classicalByPose: Record<string, ClassicalNote> = {};
