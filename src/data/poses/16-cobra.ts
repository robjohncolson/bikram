import type { Pose } from '../types';

export const cobra: Pose = {
  id: 'cobra',
  order: 16,
  englishName: "Cobra Pose",
  sanskritName: "Bhujangasana",
  pronunciation: 'boo-jahng-GAHS-ah-nah',
  category: 'floor',
  sets: 2,
  timing: "2 sets, ~10s",
  approxTotalSeconds: 105,
  summary:
    'Face down, palms under the shoulders, legs and hips welded to the floor — you curl the chest up like a cobra rearing, lifting with the strength of the back, not the push of the hands. The opening posture of the spine-strengthening series.',
  setup: [
    'Lie on your stomach, chin on the floor, legs together — hips, thighs, and the tops of the feet all pressing down.',
    'Place the palms flat on the floor directly beneath the shoulders, fingertips in line with the tops of the shoulders.',
    'Hug the elbows in against the ribs.',
    'Look up toward the ceiling, then inhale and curl the chest off the floor.',
  ],
  cues: [
    'The lift belongs to the back muscles — keep the weight out of the hands until the palms could almost float off the floor.',
    'Come up only to the navel; the belly button stays on the floor. This is a half cobra, and that is the point — it isolates the lumbar spine.',
    'Elbows stay bent and pinned to your sides; do not press up into straight arms.',
    'Squeeze the glutes and press the thighs and tops of the feet down — the anchored lower body protects the low back.',
    'Roll the shoulders down away from the ears and reach the chest forward as much as up.',
    'Keep the eyes toward the ceiling so the arch travels through the entire spine.',
  ],
  breath:
    'Inhale fully as you rise, then hold the posture on mostly full lungs, sipping small breaths through the nose — the lifted chest needs the support of air inside it. Exhale completely as you lower down.',
  benefits: [
    'Strengthens the lumbar spine and the full erector column — the direct antidote to hours of sitting.',
    'Firms the glutes, which work isometrically the entire hold.',
    'Stretches the abdominals and the whole front body from pubic bone to collarbones.',
    'Opens the chest and improves posture as the shoulder blades learn to draw down and back.',
    'Traditionally said to relieve low back pain and improve the function of the digestive organs through the gentle pressure on the abdomen.',
  ],
  contraindications: [
    'Recent low back injury or disc herniation — rise only a few pain-free inches; height is not the goal.',
    'Pregnancy — prone postures are omitted; rest or take a gentle alternative.',
    'Neck problems — keep the gaze forward instead of up so the cervical spine stays long.',
  ],
  chakras: [
    {
      id: 'heart',
      why: 'The whole posture is a lift and spread of the sternum — chest reaching forward and open, the mechanical signature of Anahata.',
    },
    {
      id: 'sacral',
      why: 'With the pelvis and lower abdomen pressed into the floor, the pose works against a steady compression of the region Svadhisthana occupies.',
    },
  ],
  muscles: [
    { id: 'erector-spinae', action: 'strengthens', emphasis: 'primary', note: 'the entire lift is back strength — the lumbar section most of all' },
    { id: 'glutes', action: 'strengthens', emphasis: 'primary', note: 'squeezing anchors the hips and guards the low back' },
    { id: 'abdominals', action: 'stretches', emphasis: 'secondary', note: 'the front body lengthens from pubic bone to collarbones' },
    { id: 'pectorals', action: 'stretches', emphasis: 'secondary', note: 'chest opens as the shoulders roll back' },
    { id: 'hip-flexors', action: 'stretches', emphasis: 'secondary' },
    { id: 'trapezius', action: 'strengthens', emphasis: 'secondary', note: 'shoulder blades draw down and together' },
    { id: 'neck', action: 'strengthens', emphasis: 'secondary', note: 'the head is held up against gravity, eyes to the ceiling' },
  ],
  mnemonic:
    'Sweet sixteen — old enough to rise on your own. At #16 the cobra lifts its hood using nothing but its back; the hands barely help at all.',
  sequenceNote:
    'First of the four spine-strengthening postures (16 through 19), which work progressively up and into the spine. Cobra starts at the base with pure lumbar strength, waking the back extensors after the supine openers and laying the foundation for Locust, Full Locust, Bow — and eventually Camel.',
};
