/**
 * Class-time structure per posture, authored in four range files so the
 * timing can evolve independently of pose content. Keyed by pose id;
 * merged onto poses by `poses/index.ts`. Every posture must appear in
 * exactly one file, with segments summing to its approxTotalSeconds
 * (enforced by segments.test.ts).
 */
import type { PoseSegment } from '../types';
import { segments0107 } from './poses-01-07';
import { segments0813 } from './poses-08-13';
import { segments1419 } from './poses-14-19';
import { segments2026 } from './poses-20-26';

export const segmentsByPose: Record<string, PoseSegment[]> = {
  ...segments0107,
  ...segments0813,
  ...segments1419,
  ...segments2026,
};
