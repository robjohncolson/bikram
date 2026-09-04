/**
 * The classical (Light on Yoga) layer — one file per posture, keyed by
 * pose id and merged onto `Pose.classical` by poses/index.ts. Authored
 * independently of the 26 & 2 teaching on purpose; see ClassicalNote in
 * ../types.ts for the contract and the originality rule.
 *
 * This index is deliberately hand-kept: add one import and one map entry only
 * after a note passes its independent source and originality audit. The test
 * beside this file requires every authored note to be either indexed or named
 * in the hold-back list, so a misspelling cannot publish it by accident.
 *
 * Only AUDITED notes are indexed. Authored notes in the hold-back list do
 * not render a "Go deeper" section; move one into `classicalByPose` only
 * after it passes the audit.
 */
import type { ClassicalNote } from '../types';

export const pendingClassicalAudit = [] as const;

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
  'standing-separate-leg-head-to-knee': standingSeparateLegHeadToKnee,
  tree: tree,
  'toe-stand': toeStand,
  savasana: savasana,
  'wind-removing': windRemoving,
  situp: situp,
  cobra: cobra,
  locust: locust,
  'full-locust': fullLocust,
  bow: bow,
  'fixed-firm': fixedFirm,
  'half-tortoise': halfTortoise,
  camel: camel,
  rabbit: rabbit,
  'head-to-knee-stretching': headToKneeStretching,
  'spine-twisting': spineTwisting,
  kapalbhati: kapalbhati,
};
