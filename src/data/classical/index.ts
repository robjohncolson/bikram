/**
 * The classical (Light on Yoga) layer — one file per posture, keyed by
 * pose id and merged onto `Pose.classical` by poses/index.ts. Authored
 * independently of the 26 & 2 teaching on purpose; see ClassicalNote in
 * ../types.ts for the contract and the originality rule.
 *
 * GENERATED import list — regenerate with scripts/gen-classical-index.py
 * (or edit by hand: one import + one key per file).
 *
 * Only AUDITED notes are listed here. These files are written but still
 * awaiting their independent audit pass, so their postures show no
 * "Go deeper" section yet:
 *   camel
 *   fixed-firm
 *   half-tortoise
 *   head-to-knee-stretching
 *   kapalbhati
 *   rabbit
 *   savasana
 *   situp
 *   spine-twisting
 *   standing-separate-leg-head-to-knee
 *   wind-removing
 * Remove a name from PENDING_AUDIT in the generator once audited.
 */
import type { ClassicalNote } from '../types';

import { pranayama } from './01-pranayama';
import { halfMoon } from './02-half-moon';
import { awkward } from './03-awkward';
import { eagle } from './04-eagle';
import { standingHeadToKnee } from './05-standing-head-to-knee';
import { standingBow } from './06-standing-bow';
import { balancingStick } from './07-balancing-stick';
import { standingSeparateLegStretching } from './08-standing-separate-leg-stretching';
import { triangle } from './09-triangle';
import { tree } from './11-tree';
import { toeStand } from './12-toe-stand';
import { cobra } from './16-cobra';
import { locust } from './17-locust';
import { fullLocust } from './18-full-locust';
import { bow } from './19-bow';

export const classicalByPose: Record<string, ClassicalNote> = {
  pranayama: pranayama,
  'half-moon': halfMoon,
  awkward: awkward,
  eagle: eagle,
  'standing-head-to-knee': standingHeadToKnee,
  'standing-bow': standingBow,
  'balancing-stick': balancingStick,
  'standing-separate-leg-stretching': standingSeparateLegStretching,
  triangle: triangle,
  tree: tree,
  'toe-stand': toeStand,
  cobra: cobra,
  locust: locust,
  'full-locust': fullLocust,
  bow: bow,
};
