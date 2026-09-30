import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_FOLD, FOLD_PREGNANCY, PREPARES_PASCHIMOTTANASANA } from './common-folds';

export const marichyasanaI: LibraryAsana = {
  id: 'marichyasana-i',
  family: 'seated',
  english: 'Marichi forward fold',
  steps: [
    { text: 'Sit with both legs stretched straight in front of you.', stage: 0 },
    { text: 'Bend the left knee and set the whole sole flat on the mat, the shin upright and the calf against the thigh, the heel near the perineum and the inner edge of the foot against the inner right thigh.', stage: 1 },
    { text: 'Take the left hand to the knee.', stage: 2 },
    { text: 'Reach the left shoulder forward until the armpit meets the upright shin. The book then wraps the left arm round the shin and thigh, bends the elbow and sends the forearm behind the back at the waist, where the right hand, taken behind the back, clasps it at the wrist, or at the palm or fingers until that comes.', stage: 3 },
    { text: 'Breathing out, bend forward and rest the forehead, then the nose, the lips and at last the chin on the right knee. Keep both shoulders level with the floor and the back of the right leg on the mat, and breathe normally.', stage: 4 },
    { text: 'Breathing in, lift the head from the knee.', stage: 5 },
    { text: 'Let go of the hands and bring the left arm back round the knee.', stage: 6 },
    { text: 'Straighten the left leg and sit in the staff.', stage: 7 },
    // the figure shows the left knee up; the other side points at no stage
    { text: 'Repeat with the right knee up and the left leg straight, for the same time.' },
  ],
  hold: 'About thirty seconds in the fold, the same on each side (p. 77).',
  cautions: [
    { text: 'If the wrists will not meet behind the back, clasp the palms or the fingers instead.', page: 76 },
    { text: 'Bending forward at all with the hands bound behind is very hard at first; it comes with practice.', page: 77 },
    { text: 'Keep the back of the whole straight leg on the floor throughout, and both shoulders level.', page: 77 },
    PREPARES_PASCHIMOTTANASANA,
    FOLD_PREGNANCY,
    ...EVERY_FOLD,
  ],
  prepares: ['trianga-mukhaikapada-paschimottanasana'],
  counter: ['savasana'],
  sutras: [...SUTRAS],
};
