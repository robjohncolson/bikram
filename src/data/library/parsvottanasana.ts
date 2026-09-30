import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING } from './common-standing';

export const parsvottanasana: LibraryAsana = {
  id: 'parsvottanasana',
  family: 'standing',
  english: 'Intense side stretch',
  steps: [
    { text: 'Stand in Tadasana and breathe in deeply, lengthening the body upward. Take both hands round behind the back. The figure begins a small step apart as the hands travel behind the waist.', stage: 1 },
    { text: 'Join the palms behind the back, fingers upward, and draw the shoulders and elbows back. Inhale and spread the feet about a metre apart. Turn the right foot out and the left well inward, bringing the hips round to face the right leg; keep both knees firm and lift the chest and head.', stage: 2 },
    { text: 'Exhale and fold the trunk down over the right leg.', stage: 3 },
    { text: 'Stretch the back and lengthen the neck so the nose, then the lips, then the chin travel on past the knee. Keep both kneecaps drawn up.', stage: 4 },
    { text: 'Keep the trunk folded as you bring it round through the centre toward the left leg, turning the feet for that side.', stage: 6 },
    { text: 'Inhale and lift the trunk and head without bending the front knee. Exhale and fold over the left leg, staying for the same time.', stage: 9 },
    { text: 'Inhale and bring the head and trunk back to the centre, facing the front.', stage: 10 },
    { text: 'Raise the trunk, release the palms and step the feet inward.', stage: 11 },
    { text: 'Bring the feet together and lower the arms into Tadasana.' },
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
