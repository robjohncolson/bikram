import type { Pose } from '../types';

export const spineTwisting: Pose = {
  id: 'spine-twisting',
  order: 25,
  englishName: 'Spine-Twisting Pose',
  sanskritName: 'Ardha-Matsyendrasana',
  pronunciation: 'AR-dah maht-see-en-DRAHS-ah-nah',
  category: 'floor',
  sets: 1,
  timing: '1 set, ~20s each side',
  approxTotalSeconds: 110,
  summary:
    'A seated twist taken to each side — the only posture in the sequence that rotates the spine, and it rotates it both ways. The final posture of class wrings the spine out like a towel before the closing breath.',
  setup: [
    'Sit and bend the left knee down to the floor, drawing the left heel beside the right hip.',
    'Step the right foot over the left knee and plant it flat on the floor.',
    'Bring the left arm over the outside of the right knee, then reach down and take hold of the left knee — the arm presses against the raised leg while the hand grips the down knee.',
    'Place the right hand on the floor behind you, close to the spine.',
    'Turn the belly, chest, shoulders, and finally the head to the right. Then unwind and repeat the whole shape to the left.',
  ],
  cues: [
    'Stay tall on both sitting bones — a twist only works on a lengthened spine, so grow up out of the pelvis first.',
    'Rotate from the bottom up: belly first, then ribs, then shoulders, and last of all the chin over the shoulder.',
    'Use the arm against the knee as a gentle lever, not a crank — the spine does the twisting, the arm just keeps what you earn.',
    'Keep both shoulders level and the chest lifted; do not let the twist collapse you sideways.',
    'The knee on the floor stays down — that anchor is what makes the twist travel through the spine instead of the hips.',
  ],
  breath:
    'Inhale to sit taller, exhale to rotate a little further — each breath cycle ratchets the twist deeper. Keep breathing evenly at your edge; never hold the breath in a twist.',
  benefits: [
    'Restores rotation — the one direction of spinal movement nothing else in the class provides — and works it equally both ways.',
    'Increases mobility in every segment of the spine and releases the hips and outer glutes.',
    'Traditionally said to wring out and massage the abdominal organs, improving digestion and elimination.',
    'Relieves tension in the lower back after the long sequence of forward and backward bending.',
    'Improves posture and body awareness by revealing side-to-side differences in your rotation.',
  ],
  contraindications: [
    'Recent disc herniation or acute back pain — twist gently and stop well short of your maximum.',
    'Pregnancy — avoid deep closed twists that compress the belly; take an open, gentle variation instead.',
    'Knee or hip issues on the folded leg — keep the bottom leg extended straight instead of bending it under.',
  ],
  chakras: [
    {
      id: 'solar-plexus',
      why: 'The twist squeezes and releases the organs around the navel like a sponge — the classic wringing action that kindles Manipura, the digestive fire.',
    },
    {
      id: 'sacral',
      why: 'Rotation is anchored at the pelvis and sacrum, mobilizing the low belly and hips where Svadhisthana governs fluidity and release.',
    },
  ],
  muscles: [
    { id: 'obliques', action: 'strengthens', emphasis: 'primary', note: 'the engine of the twist — working rotators on one side, lengthening on the other' },
    { id: 'erector-spinae', action: 'stretches', emphasis: 'primary', note: 'the deep muscles along the spine are wrung out in both directions' },
    { id: 'glutes', action: 'stretches', emphasis: 'secondary', note: 'the crossed top leg opens the outer hip' },
    { id: 'abdominals', action: 'strengthens', emphasis: 'secondary', note: 'brace to keep the trunk tall while rotating' },
    { id: 'neck', action: 'stretches', emphasis: 'secondary', note: 'the chin over the shoulder completes the twist at the top' },
  ],
  mnemonic:
    'Posture 25 is the quarter — flip the coin and spin it. One quarter-turn to the right, one to the left: the last posture spins the spine both ways.',
  sequenceNote:
    'By posture 25 the spine has bent forward, backward, and sideways — rotation is the only movement left, so the sequence closes with it. Twisting both directions wrings out everything the class has built up and returns the spine to neutral, ready for the final breathing exercise and Savasana.',
};
