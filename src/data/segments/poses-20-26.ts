import type { PoseSegment } from '../types';

/**
 * Poses 20–26: the kneeling and seated series through the closing
 * breath. The savasana/sit-up rhythm continues through Rabbit; the
 * final stretching and twisting postures flow seat-to-seat, and
 * Kapalbhati closes the class kneeling. First-segment cues are never
 * spoken (the announcement covers them).
 */
export const segments2026: Record<string, PoseSegment[]> = {
  'fixed-firm': [
    { kind: 'set', label: 'First set', cue: 'Kneel between the heels — walk back onto the elbows, then the shoulders.', seconds: 45 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up.', seconds: 10 },
    { kind: 'set', label: 'Second set', cue: 'Second set — only as deep as the knees allow, arms overhead on the floor.', seconds: 40 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up.', seconds: 10 },
  ],

  'half-tortoise': [
    { kind: 'set', label: 'First set', cue: 'Kneel, arms overhead, palms together — fold forward until the little fingers brush the floor.', seconds: 35 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up.', seconds: 10 },
    { kind: 'set', label: 'Second set', cue: 'Second set — fold forward, forehead down, hips on the heels.', seconds: 30 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up.', seconds: 10 },
  ],

  camel: [
    { kind: 'set', label: 'First set', cue: 'Kneel up, hands on the hips — press forward, drop back, and reach for the heels.', seconds: 40 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up.', seconds: 10 },
    { kind: 'set', label: 'Second set', cue: 'Second set — hips forward the whole time, one hand to each heel.', seconds: 35 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up.', seconds: 10 },
  ],

  rabbit: [
    { kind: 'set', label: 'First set', cue: 'Grip the heels — tuck the chin, roll forward, crown lightly to the floor.', seconds: 35 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up.', seconds: 10 },
    { kind: 'set', label: 'Second set', cue: 'Second set — roll forward like a wheel, hips high, arms pulling.', seconds: 30 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up.', seconds: 10 },
  ],

  'head-to-knee-stretching': [
    { kind: 'side', label: 'First set — right leg', cue: 'Right leg out, left heel to the inner thigh — grip the foot, head to the knee.', seconds: 40 },
    { kind: 'side', label: 'First set — left leg', cue: 'Change legs — head to the left knee.', seconds: 40 },
    { kind: 'set', label: 'First set — stretching', cue: 'Both legs together — grip the toes and stretch the whole body forward.', seconds: 40 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up.', seconds: 10 },
    { kind: 'side', label: 'Second set — right leg', cue: 'Second set — right leg, head to the knee.', seconds: 25 },
    { kind: 'side', label: 'Second set — left leg', cue: 'Change legs.', seconds: 25 },
    { kind: 'set', label: 'Second set — stretching', cue: 'Both legs — grip the toes, pull, and stretch forward.', seconds: 25 },
  ],

  'spine-twisting': [
    { kind: 'side', label: 'Right side', cue: 'Left leg folded, right foot over the knee — twist to the right, look over the right shoulder.', seconds: 50 },
    { kind: 'side', label: 'Left side', cue: 'Other side — twist to the left, look over the left shoulder.', seconds: 40 },
  ],

  kapalbhati: [
    { kind: 'breath', label: 'First set — 60 exhalations', cue: 'Kneel tall, hands on the knees — sixty sharp exhalations, snap the belly in on every one.', seconds: 90, pacer: { beatsPerBar: 1 } },
    { kind: 'breath', label: 'Second set — 60 exhalations', cue: 'Second set — a little faster. Sixty more.', seconds: 75, pacer: { beatsPerBar: 1 } },
  ],
};
