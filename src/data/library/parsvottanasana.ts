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
    { text: 'Join the palms, draw the shoulders and elbows back, and turn the wrists so the joined hands climb the middle of the back, fingers level with the shoulder blades — a greeting made behind you. Inhale and jump the feet a little under a metre apart, then turn to face the right: the right foot a quarter turn out, the left foot and leg turned in most of the way, the left knee tight. Take the head back.', stage: 2 },
    { text: 'Exhale and fold the trunk down over the right leg.', stage: 3 },
    { text: 'Stretch the back and lengthen the neck so the nose, then the lips, then the chin travel on past the knee. Keep both kneecaps drawn up.', stage: 4 },
    // the rig's trunk cannot swing round on its hips in the library, so the turn to the left side has no stage
    { text: 'To change sides the book keeps you folded: swing the head and trunk round the hips toward the left knee while the feet turn, raise the trunk and head back in one inhalation without bending the front leg, then fold over the left knee for the same time.' },
    { text: 'Inhale, bring the head to the centre and the feet back to face forward, and raise the trunk.', stage: 5 },
    { text: 'Exhale, jump the feet back together and release the hands.', stage: 6 },
  ],
  hold: 'Twenty seconds to half a minute on each side, breathing normally (p. 46).',
  cautions: [
    { text: 'If the palms will not meet behind the back, simply hold one wrist with the other hand and work the same way.', page: 46 },
    { text: 'Raise the trunk and head without bending the front leg; both legs stay tight, the kneecaps pulled up.', page: 46 },
    ...EVERY_STANDING,
  ],
  prepares: ['utthita-trikonasana', 'virabhadrasana-i'],
  counter: ['tadasana'],
  related: ['standing-separate-leg-head-to-knee'],
  sutras: [...SUTRAS],
};
