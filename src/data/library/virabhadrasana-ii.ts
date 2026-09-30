import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING } from './common-standing';

export const virabhadrasanaIi: LibraryAsana = {
  id: 'virabhadrasana-ii',
  family: 'standing',
  english: 'Warrior II',
  steps: [
    { text: 'Stand in Tadasana.', stage: 0 },
    { text: 'Take a deep breath in and jump the feet wide apart, arms stretched out to the sides at shoulder height, palms down.', stage: 1 },
    { text: 'Turn the right foot out a quarter turn and the left foot in a little. Keep the left leg straight with the knee tight, and stretch its hamstrings.', stage: 2 },
    { text: 'Exhaling, bend the right knee until the thigh is level with the floor and the shin stands upright over the heel — never forward of the ankle. Reach the hands away from each other as if two people pulled them apart, turn the face to the right and look along the right palm.', stage: 3 },
    { text: 'Stretch the back of the left leg fully; the backs of the legs, the upper back and the hips stay in one line.', stage: 3 },
    { text: 'Inhale back to the wide stance, then turn the left foot out and the right foot in a little.', stage: 4 },
    { text: 'Bend the left knee the same way and hold the left side as long as the right, looking along the left palm.', stage: 5 },
    { text: 'Inhale up to the wide stance, the arms level.', stage: 6 },
    { text: 'Exhale and jump back into Tadasana.', stage: 7 },
  ],
  hold: 'Twenty seconds to half a minute on each side, breathing deeply (p. 45).',
  cautions: [
    { text: 'The bent knee should not pass beyond the ankle: keep it in line with the heel, the shin upright.', page: 45 },
    ...EVERY_STANDING,
  ],
  prepares: ['tadasana', 'virabhadrasana-i'],
  counter: ['uttanasana'],
  related: ['triangle'],
  sutras: [...SUTRAS],
};
