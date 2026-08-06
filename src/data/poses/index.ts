/**
 * The sequence, in class order. To match a studio variant, comment out
 * or reorder imports here — `order` fields are re-derived from position
 * nowhere; keep them in sync if you reorder.
 */
import type { Pose } from '../types';
import { figures } from '../figures';

import { pranayama } from './01-pranayama';
import { halfMoon } from './02-half-moon';
import { awkward } from './03-awkward';
import { eagle } from './04-eagle';
import { standingHeadToKnee } from './05-standing-head-to-knee';
import { standingBow } from './06-standing-bow';
import { balancingStick } from './07-balancing-stick';
import { standingSeparateLegStretching } from './08-standing-separate-leg-stretching';
import { triangle } from './09-triangle';
import { standingSeparateLegHeadToKnee } from './10-standing-separate-leg-head-to-knee';
import { tree } from './11-tree';
import { toeStand } from './12-toe-stand';
import { savasana } from './13-savasana';
import { windRemoving } from './14-wind-removing';
import { situp } from './15-situp';
import { cobra } from './16-cobra';
import { locust } from './17-locust';
import { fullLocust } from './18-full-locust';
import { bow } from './19-bow';
import { fixedFirm } from './20-fixed-firm';
import { halfTortoise } from './21-half-tortoise';
import { camel } from './22-camel';
import { rabbit } from './23-rabbit';
import { headToKneeStretching } from './24-head-to-knee-stretching';
import { spineTwisting } from './25-spine-twisting';
import { kapalbhati } from './26-kapalbhati';

const inOrder: Pose[] = [
  pranayama,
  halfMoon,
  awkward,
  eagle,
  standingHeadToKnee,
  standingBow,
  balancingStick,
  standingSeparateLegStretching,
  triangle,
  standingSeparateLegHeadToKnee,
  tree,
  toeStand,
  savasana,
  windRemoving,
  situp,
  cobra,
  locust,
  fullLocust,
  bow,
  fixedFirm,
  halfTortoise,
  camel,
  rabbit,
  headToKneeStretching,
  spineTwisting,
  kapalbhati,
];

/** The sequence with independently-authored figures merged in. */
export const poses: Pose[] = inOrder.map((p) =>
  figures[p.id] ? { ...p, figure: figures[p.id] } : p,
);
