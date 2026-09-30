import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_FOLD, FOLD_PREGNANCY, PREPARES_PASCHIMOTTANASANA } from './common-folds';

export const triangaMukhaikapadaPaschimottanasana: LibraryAsana = {
  id: 'trianga-mukhaikapada-paschimottanasana',
  family: 'seated',
  english: 'Three-limb forward fold',
  steps: [
    { text: 'Sit with both legs stretched straight in front of you.', stage: 0 },
    { text: 'Bend the right knee and lift the shin.', stage: 1 },
    { text: 'Take the right foot back beside the right hip, toes pointing back and resting on the mat, the inner calf against the outer thigh. Find your balance with the weight on the bent knee; keep the left foot and toes stretched and pointing forward.', stage: 2 },
    { text: 'Hold the left foot with both palms on the sides of the sole. If you can, reach further and hook the wrists round the foot (the figure holds the sides of the foot: its arms do not reach round it); take two deep breaths.', stage: 3 },
    { text: 'Bring the knees together, and breathing out, widen the elbows and draw the trunk forward to rest the forehead, then the nose, the lips and at last the chin on the left knee. Keep the left elbow off the mat and the trunk inclined a little toward the bent leg.', stage: 4 },
    { text: 'Stay, breathing evenly.', stage: 4 },
    { text: 'Breathing in, lift the head and trunk and let go of the foot.', stage: 5 },
    { text: 'Bring the right foot forward with the shin upright; then straighten the leg into the staff.', stage: 6 },
    // the figure shows the right leg folded; the other side points at no stage
    { text: 'Repeat with the left leg folded back beside the left hip and the right leg stretched, for the same time.' },
  ],
  hold: 'Half a minute to a minute on each side, breathing evenly (p. 75).',
  cautions: [
    { text: 'At first the body tips toward the outstretched leg and its foot turns out. Keep the weight on the bent knee and learn to balance there.', page: 75 },
    { text: 'Do not rest the elbow on the side of the straight leg on the floor: a beginner tends to topple toward that leg, so lean the trunk slightly toward the folded one.', page: 75 },
    { text: 'Hooking the wrists round the foot usually takes several months, so do not lose heart after the first attempts.', page: 75 },
    PREPARES_PASCHIMOTTANASANA,
    FOLD_PREGNANCY,
    ...EVERY_FOLD,
  ],
  prepares: ['virasana', 'janu-sirsasana', 'ardha-baddha-padma-paschimottanasana'],
  counter: ['savasana'],
  related: ['fixed-firm'],
  sutras: [...SUTRAS],
};
