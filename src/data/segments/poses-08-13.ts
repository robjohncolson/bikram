import type { PoseSegment } from '../types';

/**
 * Authored by the class-structure agent for this posture range.
 *
 * Poses 8–13: the separate-leg trio, the closing balances of the
 * standing series, and the long two-minute savasana that hinges class
 * into the floor series. Standard 90-minute structure: two-set postures
 * run right then left, first set longer; the one-set balances (Tree,
 * Toe Stand) run right side then left. Transition slack (~10s of
 * getting into position) lives inside each posture's first segment.
 * First-segment cues are never spoken — the posture announcement covers
 * them — but are authored as sensible openers.
 */
export const segments0813: Record<string, PoseSegment[]> = {
  'standing-separate-leg-stretching': [
    {
      kind: 'set',
      label: 'First set',
      cue: 'Step the feet wide apart, arms out — fold forward and grip the heels from the outside.',
      seconds: 60,
    },
    {
      kind: 'set',
      label: 'Second set',
      cue: 'Second set — step out wide, fold from the hips, and pull the forehead toward the floor.',
      seconds: 40,
    },
  ],

  triangle: [
    {
      kind: 'side',
      label: 'First set — right side',
      cue: 'Arms in one line, right foot out — bend the right knee, fingertips to the floor, left arm to the ceiling.',
      seconds: 60,
    },
    {
      kind: 'side',
      label: 'First set — left side',
      cue: 'Other side — left knee bends, arms tip the other way, eyes on the top hand.',
      seconds: 45,
    },
    {
      kind: 'side',
      label: 'Second set — right side',
      cue: 'Second set — sink the hips low, arms one straight line. Right side.',
      seconds: 30,
    },
    {
      kind: 'side',
      label: 'Second set — left side',
      cue: 'Other side.',
      seconds: 30,
    },
  ],

  'standing-separate-leg-head-to-knee': [
    {
      kind: 'side',
      label: 'First set — right side',
      cue: 'Palms together overhead — step to the right, square the hips, tuck the chin, and round the forehead to the knee.',
      seconds: 55,
    },
    {
      kind: 'side',
      label: 'First set — left side',
      cue: 'Other side — pivot the feet, square off over the left leg, and round down.',
      seconds: 45,
    },
    {
      kind: 'side',
      label: 'Second set — right side',
      cue: 'Second set — chin to chest, forehead to the knee. Right side.',
      seconds: 30,
    },
    {
      kind: 'side',
      label: 'Second set — left side',
      cue: 'Other side.',
      seconds: 30,
    },
  ],

  tree: [
    {
      kind: 'side',
      label: 'Right side',
      cue: 'Weight into the left foot — draw the right foot up the inner thigh and press the folded knee down.',
      seconds: 50,
    },
    {
      kind: 'side',
      label: 'Left side',
      cue: 'Other side — stand tall on the right leg, left foot up, palms to prayer.',
      seconds: 40,
    },
  ],

  'toe-stand': [
    {
      kind: 'side',
      label: 'Right side',
      cue: 'From Tree — eyes on one spot, bend the standing knee, and sink down onto the lifted heel.',
      seconds: 45,
    },
    {
      kind: 'side',
      label: 'Left side',
      cue: 'Other side — come down slowly, spine tall, hands floating to prayer.',
      seconds: 40,
    },
  ],

  savasana: [
    {
      kind: 'rest',
      label: 'Two-minute savasana',
      cue: 'Lie flat on the back, eyes softly open — completely still for two full minutes.',
      seconds: 120,
    },
  ],
};
