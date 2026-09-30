import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING } from './common-standing';

export const parsvottanasana: LibraryAsana = {
  id: 'parsvottanasana',
  family: 'standing',
  english: 'Intense side stretch',
  steps: [
    { text: 'Stand in Tadasana and breathe in deeply, lengthening the body upward.', stage: 0 },
    { text: 'Take both hands round behind the back.', stage: 1 },
    { text: 'Join the palms, draw the shoulders and elbows back, and turn the wrists so the joined hands climb the middle of the back, fingers level with the shoulder blades — a greeting made behind you. Inhale and jump the feet about a metre apart to the sides, still facing the front, and breathe out.', stage: 2 },
    { text: 'Inhale and turn to face the right: the right foot a quarter turn out, the left foot and leg turned in most of the way, the left knee tight, the hips square to the right leg. Take the head back.', stage: 3 },
    { text: 'Exhale and fold the trunk down over the right leg.', stage: 4 },
    { text: 'Stretch the back and lengthen the neck so the nose, then the lips, then the chin travel on past the knee. Keep both kneecaps drawn up.', stage: 5 },
    // one side is shown; the book's swing round to the left side has no stage
    { text: 'To change sides the book keeps you folded: swing the head and trunk round the hips toward the left knee while the feet turn, raise the trunk and head back in one inhalation without bending the front leg, then fold over the left knee for the same time.' },
    { text: 'Inhale and bring the head and trunk back to the centre, facing the front; then turn the feet to point forward and raise the trunk.', stage: 6 },
    { text: 'Exhale, jump the feet back together and release the hands.', stage: 7 },
  ],
  hold: 'Twenty seconds to half a minute on each side, breathing normally (p. 46).',
  cautions: [
    { text: 'If the palms will not meet behind the back, simply hold one wrist with the other hand and work the same way.', page: 46 },
    { text: 'Raise the trunk and head without bending the front leg; both legs stay tight, the kneecaps pulled up.', page: 46 },
    ...EVERY_STANDING,
  ],
  prepares: ['tadasana', 'virabhadrasana-ii'],
  counter: ['tadasana'],
  related: ['standing-separate-leg-head-to-knee'],
  sutras: [...SUTRAS],
};
