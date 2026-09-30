import type { PoseSegment } from '../types';

/**
 * Poses 14–19: wind removing, the first sit-up, and the spine-
 * strengthening series. Spine sets rest on the belly; only the final
 * Bow set returns to savasana and a sit-up. Wind-Removing has no sit-up
 * tail: posture 15 is the first sit-up. First-segment cues are covered
 * by the announcement.
 */
export const segments1419: Record<string, PoseSegment[]> = {
  'wind-removing': [
    { kind: 'side', label: 'First set — right knee', cue: 'Lying on the back — hug the right knee to the chest.', seconds: 35 },
    { kind: 'side', label: 'First set — left knee', cue: 'Change knees — hug the left knee down to the chest.', seconds: 35 },
    { kind: 'set', label: 'First set — both knees', cue: 'Both knees — wrap the arms around the shins and pull everything in.', seconds: 30 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'side', label: 'Second set — right knee', cue: 'Second set — right knee to the chest.', seconds: 30 },
    { kind: 'side', label: 'Second set — left knee', cue: 'Change knees.', seconds: 30 },
    { kind: 'set', label: 'Second set — both knees', cue: 'Both knees — pull, and let the lower back open.', seconds: 25 },
  ],

  situp: [
    { kind: 'rest', label: 'Savasana', cue: 'Savasana — arms by the sides, palms up.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up — arms overhead, cross the thumbs, double exhale, and dive for the toes.', seconds: 15 },
    { kind: 'rest', orientation: 'prone', label: 'Roll to the belly', cue: 'Roll over onto the belly, chin forward on the towel.', seconds: 15 },
  ],

  cobra: [
    { kind: 'set', label: 'First set', cue: 'Palms under the shoulders — lift the chest with the strength of the back.', seconds: 25 },
    { kind: 'rest', orientation: 'prone', label: 'Prone rest', cue: 'Rest on your belly, with one cheek on the towel and your arms by your sides.', seconds: 30 },
    { kind: 'set', label: 'Second set', cue: 'Second set — palms down, chest up, legs heavy on the floor.', seconds: 20 },
    { kind: 'rest', orientation: 'prone', label: 'Prone rest', cue: 'Rest on your belly, with one cheek on the towel and your arms by your sides.', seconds: 30 },
  ],

  locust: [
    { kind: 'side', label: 'First set — right leg', cue: 'Chin forward, arms under the body — lift the right leg.', seconds: 15 },
    { kind: 'side', label: 'First set — left leg', cue: 'Change legs — left leg up, hip stays down.', seconds: 15 },
    { kind: 'set', label: 'First set — both legs', cue: 'Both legs — press the arms down and lift everything together.', seconds: 20 },
    { kind: 'rest', orientation: 'prone', label: 'Prone rest', cue: 'Rest on your belly, with one cheek on the towel and your arms by your sides.', seconds: 30 },
    { kind: 'side', label: 'Second set — right leg', cue: 'Second set. Place your arms beneath your body and lift your right leg.', seconds: 10 },
    { kind: 'side', label: 'Second set — left leg', cue: 'Lower your right leg and lift your left leg.', seconds: 10 },
    { kind: 'set', label: 'Second set — both legs', cue: 'Lower your left leg, then lift both legs together.', seconds: 15 },
    { kind: 'rest', orientation: 'prone', label: 'Prone rest', cue: 'Rest on your belly, with one cheek on the towel and your arms by your sides.', seconds: 30 },
  ],

  'full-locust': [
    { kind: 'set', label: 'First set', cue: 'Arms out like wings — chest and legs lift together.', seconds: 25 },
    { kind: 'rest', orientation: 'prone', label: 'Prone rest', cue: 'Rest on your belly, with one cheek on the towel and your arms by your sides.', seconds: 30 },
    { kind: 'set', label: 'Second set', cue: 'Second set — everything lifts at once, look up.', seconds: 20 },
    { kind: 'rest', orientation: 'prone', label: 'Prone rest', cue: 'Rest on your belly, with one cheek on the towel and your arms by your sides.', seconds: 30 },
  ],

  bow: [
    { kind: 'set', label: 'First set', cue: 'Reach back and grip the ankles from the outside — kick up and back.', seconds: 30 },
    { kind: 'rest', orientation: 'prone', label: 'Prone rest', cue: 'Rest on your belly, with one cheek on the towel and your arms by your sides.', seconds: 30 },
    { kind: 'set', label: 'Second set', cue: 'Second set — grip the ankles, kick, and look up.', seconds: 25 },
    { kind: 'rest', label: 'Twenty-second savasana', cue: 'Twenty-second savasana.', seconds: 20 },
    { kind: 'situp', label: 'Sit-up', cue: 'Sit-up.', seconds: 10 },
  ],
};
