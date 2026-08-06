import type { Pose } from '../types';

export const halfMoon: Pose = {
  id: 'half-moon',
  order: 2,
  englishName: "Half Moon Pose with Hands to Feet Pose",
  sanskritName: "Ardha Chandrasana with Pada-Hastasana",
  pronunciation: 'ARD-hah chahn-DRAH-sah-nah with PAH-dah hah-STAHS-ah-nah',
  category: 'standing',
  sets: 2,
  timing: "2 sets — each side, backbend, and forward fold",
  approxTotalSeconds: 480,
  summary:
    'The first true posture: a four-direction warm-up for the spine — deep side bends right and left, a backbend, and then Pada-Hastasana, folding the body flat against the legs with hands under the heels. The obliques are the star of the show.',
  setup: [
    'Stand with feet together; sweep the arms up sideways over the head and interlace the fingers, releasing the index fingers into a steeple grip.',
    'Lock the elbows and squeeze the arms in tight against the ears — head, arms, and torso become one solid piece.',
    'Stretch up toward the ceiling to lengthen out of the waist, then push the hips left and bend the whole upper body to the right; repeat on the other side.',
    'For the backbend, drop the head back, look behind you, and let arms and torso follow as far back as they will go while the hips press forward.',
    'Finally fold forward, take hold of the heels from behind with the palms under the feet, and pull the body flat against the legs.',
  ],
  cues: [
    'Both knees locked and both elbows locked throughout — all the movement comes from the waist, not the arms or hips.',
    'In the side bends, push the hips beyond the line of the body in the opposite direction so the bend deepens evenly along the whole side.',
    'Keep the body in one flat plane — chest open, no twisting forward or back, as if bending between two panes of glass.',
    'In the backbend, the head goes back first; keep the eyes open, breathe, and push the hips forward to counterbalance.',
    'In Hands to Feet, pull hard on the heels — the pulling folds you flat — then work the knees toward locked without losing the grip.',
    'Aim the face for the shins and hug the elbows in behind the calves; the fold gets its depth from patience, not momentum.',
  ],
  breath:
    'Normal, continuous breathing in every part — no breath-holding in the side bends or backbend, and keep slow, steady breaths flowing even when folded flat against the legs.',
  benefits: [
    'Works the entire waistline — firms and tones the obliques and side body with every bend.',
    'Restores spinal mobility in all four directions within the first minutes of class: side to side, backward, and forward.',
    'Builds shoulder and upper-back endurance through the long overhead hold.',
    'Deeply stretches the hamstrings and calves in the Hands to Feet fold.',
    'Traditionally said to benefit the kidneys and aid digestion by alternately compressing and lengthening each side of the abdomen.',
  ],
  contraindications: [
    'Low back issues — keep the backbend small and prioritize length over depth.',
    'High or low blood pressure, or dizziness — soften the head-drop in the backbend and rise slowly out of the forward fold.',
    'Hamstring strains — bend the knees slightly in Hands to Feet and ease the pulling force.',
  ],
  chakras: [
    {
      id: 'solar-plexus',
      why: 'The side bends knead the waist and obliques directly over Manipura, alternately compressing and stretching the body’s fire center to stoke it for the class ahead.',
    },
    {
      id: 'heart',
      why: 'The backbend lifts the sternum and spreads the ribs wide, opening the space around Anahata after the chest expansion Pranayama began.',
    },
  ],
  muscles: [
    { id: 'obliques', action: 'stretches', emphasis: 'primary', note: 'each side bend lengthens one whole waistline while the other side stabilizes' },
    { id: 'deltoids', action: 'strengthens', emphasis: 'primary', note: 'the arms stay locked overhead beside the ears for minutes at a time' },
    { id: 'hamstrings', action: 'stretches', emphasis: 'primary', note: 'Pada-Hastasana folds the trunk flat against locked legs' },
    { id: 'erector-spinae', action: 'strengthens', emphasis: 'secondary', note: 'controls the spine through the side bends and supports the backbend' },
    { id: 'abdominals', action: 'stretches', emphasis: 'secondary', note: 'the backbend opens the entire front of the body' },
    { id: 'lats', action: 'stretches', emphasis: 'secondary', note: 'lengthened by the overhead reach and the deep fold' },
    { id: 'calves', action: 'stretches', emphasis: 'secondary', note: 'the forward fold travels all the way down the back of the legs' },
  ],
  mnemonic:
    'The moon is the sky’s second light. After the first breath (#1), the body becomes a crescent — bending to two sides, then two more directions. Two sides, pose #2.',
  sequenceNote:
    'The first real posture bends the spine in all four directions while the body is fresh, mapping the territory the next 24 postures will explore. The side bends wake the waist, the backbend previews the spine series, and Hands to Feet is the first taste of the forward folds to come.',
};
