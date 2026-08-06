import type { Pose } from '../types';

export const rabbit: Pose = {
  id: 'rabbit',
  order: 23,
  englishName: 'Rabbit Pose',
  sanskritName: 'Sasangasana',
  pronunciation: 'sah-sahn-GAHS-ah-nah',
  category: 'floor',
  sets: 2,
  timing: '2 sets, ~20s',
  approxTotalSeconds: 120,
  summary:
    'The counterpose to Camel: gripping the heels, chin tucked, you roll forward into the tightest ball of the class until the crown of the head lightly touches the floor at the knees. Maximum forward compression answers maximum backbend.',
  setup: [
    'Sit on your heels, then reach back and grip each heel firmly — thumbs on the outside, fingers on the inside.',
    'Tuck the chin tightly to the chest.',
    'Keeping the grip, round forward slowly until the crown of the head touches the floor and the forehead touches the knees.',
    'Lift the hips toward the ceiling, rolling forward like a wheel until the arms are straight.',
  ],
  cues: [
    'Pull hard on the heels the entire time — that pull is what keeps the weight off your head and neck.',
    'Only the lightest touch of the crown on the floor; your arms carry the load, not your neck.',
    'Keep the forehead glued to the knees — if it loses contact, walk the knees closer to the head.',
    'Lift the hips high and roll forward, stretching the spine one vertebra at a time from tailbone to neck.',
    'Shoulders draw away from the ears; the back of the neck stays long.',
    'Come out the way you went in — slowly, chin tucked, unrolling the spine from the bottom up.',
  ],
  breath:
    'The chest and belly are compressed, so breathe into the back of the ribs — slow, deliberate breaths. Use each exhale to curl a fraction deeper into the ball.',
  benefits: [
    'Gives the spine its maximum forward stretch, creating space between the vertebrae — traditionally said to nourish the discs and keep the spine young.',
    'Stretches the neck, shoulders, and upper back, where most people carry their tension.',
    'Compresses the throat with the deepest chin lock of the class — traditionally said to stimulate the thyroid and balance metabolism.',
    'Directly counterbalances Camel, restoring the spine to equilibrium after the deepest backbend.',
    'The head-down, curled shape calms the nervous system and turns attention inward.',
  ],
  contraindications: [
    'Neck injury — this posture requires the neck to bear no weight; if you cannot keep the load in your arms, stay upright and skip the roll forward.',
    'Low-back disc problems — this is the deepest spinal flexion of the class; keep the curl shallow and stop short of any nerve pain.',
    'Sensitive knees — place padding under them and keep the hips closer to the heels.',
    'Untreated high blood pressure or glaucoma — the head-below-heart position raises pressure in the head; keep the fold shallow.',
    'If you feel dizzy coming out, sit on the heels and breathe normally before the second set.',
  ],
  chakras: [
    {
      id: 'throat',
      why: 'The chin-to-chest tuck is the deepest throat compression in the sequence, squeezing and refreshing the region of Vishuddha and the thyroid mapped to it.',
    },
    {
      id: 'crown',
      why: 'The crown of the head physically touches the earth — the sequence’s only direct contact with the seat of Sahasrara, made in a posture of complete surrender and inward folding.',
    },
    {
      id: 'third-eye',
      why: 'Forehead pressed to the knees in a closed, head-down ball draws all awareness inward toward the space between the brows.',
    },
  ],
  muscles: [
    { id: 'erector-spinae', action: 'stretches', emphasis: 'primary', note: 'full-length spinal flexion from tailbone to skull' },
    { id: 'trapezius', action: 'stretches', emphasis: 'primary', note: 'upper back and area between the shoulder blades open wide' },
    { id: 'forearms', action: 'strengthens', emphasis: 'primary', note: 'the heel grip is your safety line — it never lets go' },
    { id: 'neck', action: 'stretches', emphasis: 'secondary', note: 'back of the neck lengthens; keep the weight in the arms' },
    { id: 'abdominals', action: 'strengthens', emphasis: 'secondary', note: 'contract to hold the tight curl' },
    { id: 'lats', action: 'stretches', emphasis: 'secondary' },
  ],
  mnemonic:
    '22 arches back, 23 curls forward — the camel and the rabbit are mirror twins. Picture the 3 in 23 as a spine curled onto itself: one number past the hump, the rabbit rolls into its burrow.',
  sequenceNote:
    'Rabbit exists here for one reason: Camel. Maximum extension must be answered by maximum flexion, so the sequence folds you into a ball the moment the deepest backbend ends. It also closes the kneeling family of postures and leaves the spine balanced for the final stretching and twisting to come.',
};
