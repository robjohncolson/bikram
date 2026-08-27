import type { PoseSegment } from '../types';

/**
 * Authored by the class-structure agent for this posture range.
 *
 * Poses 1–7: the opening breathing exercise, the warm-up postures, and
 * the balancing series. Standard 90-minute structure: two sets per
 * posture (first set longer), right side before left. Transition slack
 * (~10s of getting into position) lives inside each posture's first
 * segment. First-segment cues are never spoken — the posture
 * announcement covers them — but are authored as sensible openers.
 */
export const segments0107: Record<string, PoseSegment[]> = {
  pranayama: [
    {
      kind: 'breath',
      label: 'First set — 10 breaths',
      cue: 'Ten slow breaths — six counts in through the nose, six counts out through the mouth.',
      seconds: 150,
      pacer: { beatsPerBar: 6 },
    },
    {
      kind: 'breath',
      label: 'Second set — 10 breaths',
      cue: 'Second set — ten more full breaths. Elbows high on the inhale, head back on the exhale.',
      seconds: 140,
      pacer: { beatsPerBar: 6 },
    },
  ],

  'half-moon': [
    {
      kind: 'side',
      label: 'First set — right side',
      cue: 'Arms overhead, fingers interlaced — stretch up and bend to the right.',
      seconds: 80,
    },
    {
      kind: 'side',
      label: 'First set — left side',
      cue: 'Come up slowly — and over to the left side.',
      seconds: 60,
    },
    {
      kind: 'set',
      label: 'First set — backbend',
      cue: 'Come up — head back, arms back, hips forward, and bend backward.',
      seconds: 40,
    },
    {
      kind: 'set',
      label: 'First set — hands to feet',
      cue: 'Come up and fold forward — grip the heels from behind and pull the body against the legs.',
      seconds: 60,
    },
    {
      kind: 'side',
      label: 'Second set — right side',
      cue: 'Second set — arms up, stretch, and over to the right.',
      seconds: 35,
    },
    {
      kind: 'side',
      label: 'Second set — left side',
      cue: 'Come up — and to the left.',
      seconds: 30,
    },
    {
      kind: 'set',
      label: 'Second set — backbend',
      cue: 'Come up — and bend back one more time.',
      seconds: 20,
    },
    {
      kind: 'set',
      label: 'Second set — hands to feet',
      cue: 'Fold forward again — grip the heels, pull, and lay the body flat on the legs.',
      seconds: 35,
    },
  ],

  awkward: [
    {
      kind: 'set',
      label: 'First set — part one',
      cue: 'Feet apart, arms out at shoulder height — sit down into the invisible chair.',
      seconds: 45,
    },
    {
      kind: 'set',
      label: 'First set — part two',
      cue: 'Come up — rise to the very top of the toes, and sit again.',
      seconds: 40,
    },
    {
      kind: 'set',
      label: 'First set — part three',
      cue: 'Heels up, knees together — lower down in slow motion.',
      seconds: 35,
    },
    {
      kind: 'set',
      label: 'Second set — part one',
      cue: 'Second set — arms out, and sit down.',
      seconds: 30,
    },
    {
      kind: 'set',
      label: 'Second set — part two',
      cue: 'Up on the toes — and sit.',
      seconds: 25,
    },
    {
      kind: 'set',
      label: 'Second set — part three',
      cue: 'Knees together — slow motion down, slow motion up.',
      seconds: 25,
    },
  ],

  eagle: [
    {
      kind: 'side',
      label: 'First set — right side',
      cue: 'Right arm under the left, twist the arms — sit low, right leg over, foot behind the calf.',
      seconds: 40,
    },
    {
      kind: 'side',
      label: 'First set — left side',
      cue: 'Other side — left arm under, left leg over the top.',
      seconds: 30,
    },
    {
      kind: 'side',
      label: 'Second set — right side',
      cue: 'Second set — wrap the arms, sit down, and wrap the legs. Right side.',
      seconds: 25,
    },
    {
      kind: 'side',
      label: 'Second set — left side',
      cue: 'Other side.',
      seconds: 25,
    },
  ],

  'standing-head-to-knee': [
    {
      kind: 'side',
      label: 'First set — right leg',
      cue: 'All the weight on the left leg, knee locked — interlace the fingers under the right foot.',
      seconds: 70,
    },
    {
      kind: 'side',
      label: 'First set — left leg',
      cue: 'Other side — stand on the right leg, lock the knee, and pick up the left foot.',
      seconds: 60,
    },
    {
      kind: 'side',
      label: 'Second set — right leg',
      cue: 'Second set — right leg again, thirty seconds. Standing knee locked.',
      seconds: 30,
    },
    {
      kind: 'side',
      label: 'Second set — left leg',
      cue: 'Other side.',
      seconds: 30,
    },
  ],

  'standing-bow': [
    {
      kind: 'side',
      label: 'First set — right leg',
      cue: 'Weight on the left leg — grip the right ankle from the inside, left arm up to the ceiling.',
      seconds: 70,
    },
    {
      kind: 'side',
      label: 'First set — left leg',
      cue: 'Other side — grip the left ankle, right arm up.',
      seconds: 60,
    },
    {
      kind: 'side',
      label: 'Second set — right leg',
      cue: 'Second set — kick back and stretch forward. Right leg.',
      seconds: 30,
    },
    {
      kind: 'side',
      label: 'Second set — left leg',
      cue: 'Other side.',
      seconds: 30,
    },
  ],

  'balancing-stick': [
    {
      kind: 'side',
      label: 'First set — right foot forward',
      cue: 'Arms overhead, palms together — step the right foot forward and tip to a perfect T.',
      seconds: 25,
    },
    {
      kind: 'side',
      label: 'First set — left foot forward',
      cue: 'Other side — step forward and tip, one straight line.',
      seconds: 20,
    },
    {
      kind: 'side',
      label: 'Second set — right foot forward',
      cue: 'Second set — step forward, everything comes down together.',
      seconds: 20,
    },
    {
      kind: 'side',
      label: 'Second set — left foot forward',
      cue: 'Other side — ten seconds, everything you have.',
      seconds: 20,
    },
  ],
};
