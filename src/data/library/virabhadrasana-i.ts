import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING } from './common-standing';

export const virabhadrasanaI: LibraryAsana = {
  id: 'virabhadrasana-i',
  family: 'standing',
  english: 'Warrior I',
  steps: [
    { text: 'Stand in Tadasana.', stage: 0 },
    { text: 'Raise both arms over the head and stretch up.', stage: 1 },
    { text: 'Press the palms together above the head and take a deep breath in.', stage: 2 },
    { text: 'With that breath, jump the feet wide apart to the sides, a good four feet or more.', stage: 3 },
    { text: 'Breathing out, turn to the right: the right foot turns out a quarter turn and the left foot a little in, and the hips and chest come round to face the right foot. Bend the right knee until the thigh is level with the floor and the shin upright, the knee over the heel and no further. Keep the left leg stretched straight with the knee tight. Face, chest and right knee all point the way of the right foot; take the head back, stretch the spine up from its base and look up at the joined palms.', stage: 4 },
    { text: 'Straighten the right knee and turn back to face the front.', stage: 5 },
    // one side is shown: the other would need its own stages for the feet to turn
    { text: 'Turn to the left and repeat, the left knee bending, for the same short time.' },
    { text: 'Breathe out and jump the feet back together, parting the palms.', stage: 6 },
    { text: 'Lower the arms and stand in Tadasana.', stage: 7 },
  ],
  hold: 'Twenty seconds to half a minute on each side with normal breathing (p. 44); the book warns against staying long (p. 45).',
  cautions: [
    { text: 'All the standing poses are strenuous and this one most of all: the book says it should not be tried with a weak heart.', page: 45 },
    { text: 'Even a fairly strong student should not stay long in it.', page: 45 },
    { text: 'The bent knee should not travel past the ankle; keep it over the heel.', page: 44 },
    ...EVERY_STANDING,
  ],
  prepares: ['tadasana', 'utthita-parsvakonasana'],
  counter: ['uttanasana'],
  sutras: [...SUTRAS],
};
