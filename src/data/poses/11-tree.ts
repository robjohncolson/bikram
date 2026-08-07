import type { Pose } from '../types';

export const tree: Pose = {
  id: 'tree',
  order: 11,
  englishName: "Tree Pose",
  sanskritName: "Tadasana",
  pronunciation: 'tah-DAHS-ah-nah',
  category: 'standing',
  sets: 1,
  timing: "1 set — ~45s each side, right then left",
  approxTotalSeconds: 90,
  summary:
    'Standing tall on one locked leg, you draw the other foot up toward the opposite hip crease and press the folded knee down, hips open, palms finally meeting in prayer. After the big muscular postures, Tree is about one thing: rooting and stillness.',
  setup: [
    'Stand tall, pour your weight into the left foot, and fix your gaze on one unmoving point ahead.',
    'Bend the right knee and lift the right foot, placing the sole high against the left inner thigh — heel working toward the hip crease, like a half lotus resting against the leg.',
    'Hold the foot in place with one hand for as long as you need it.',
    'Press the folded knee down toward the floor while keeping both hips level and facing forward.',
    'When you feel steady, release the foot and bring both palms together in prayer at the center of the chest.',
  ],
  cues: [
    'Lock the standing knee — the standing leg is a lamp post, solid from foot to hip.',
    'Keep pressing the folded knee down toward the standing knee; the hip opens a little more with every breath.',
    'Stand tall through the crown of the head — no leaning, no sinking; the spine stays as straight as the trunk of a tree.',
    'Hips stay level and square to the front; do not let the lifted-leg side hitch up.',
    'Holding the foot is not cheating — prayer hands are the destination, not the entry requirement.',
    'Still eyes, still body, quiet breath. The posture is won by not moving.',
  ],
  breath:
    'Smooth, unhurried breathing through the nose. Balance rides on the breath — the moment it turns choppy, the tree starts to sway, so keep it long and even.',
  benefits: [
    'Improves balance, posture, and ankle stability on the standing side.',
    'Opens the hip and safely mobilizes the knee of the folded leg, preparing both for the lotus-like positions of the floor series.',
    'Strengthens the standing leg from foot to glute through a long isometric hold.',
    'Builds the quiet, single-pointed concentration that Toe Stand will demand next.',
    'Traditionally said to help prevent hernia by firming the abdominal wall and groin.',
  ],
  contraindications: [
    'Knee injuries — never force the foot high or the knee down; resting the foot at the calf or ankle keeps the balance work intact.',
    'Hip replacement or acute hip pain — limit the external rotation and keep the foot low.',
    'Significant balance impairment — practice within reach of a wall rather than skipping the posture.',
  ],
  chakras: [
    {
      id: 'root',
      why: 'The whole posture is an exercise in rooting — one foot gripping the earth, weight settled, stillness held — the exact terrain of Muladhara.',
    },
    {
      id: 'sacral',
      why: 'The folded leg externally rotates and opens the hip, mobilizing the pelvis where Svadhisthana lives.',
    },
  ],
  muscles: [
    { id: 'quadriceps', action: 'strengthens', emphasis: 'primary', note: 'the locked standing knee is a sustained isometric hold' },
    { id: 'ankles-feet', action: 'strengthens', emphasis: 'primary', note: 'the standing foot makes constant micro-adjustments to stay rooted' },
    { id: 'glutes', action: 'strengthens', emphasis: 'secondary', note: 'the standing hip steadies the pelvis against tipping' },
    { id: 'adductors', action: 'stretches', emphasis: 'secondary', note: 'the folded leg opens through the inner thigh and groin' },
    { id: 'erector-spinae', action: 'strengthens', emphasis: 'secondary', note: 'holding the spine tall against gravity' },
    { id: 'calves', action: 'strengthens', emphasis: 'secondary' },
  ],
  mnemonic:
    'The numeral 11 is two tree trunks standing side by side. In pose #11 you take your two trunks and fold one away — eleven becomes one tall tree.',
  sequenceNote:
    'After the sweat and strain of the standing series, Tree lets the heart rate settle while sharpening the balance and opening the hips. It is also the direct doorway to what comes next: Toe Stand begins exactly where Tree ends.',
};
