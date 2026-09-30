import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING } from './common-standing';

export const prasaritaPadottanasana: LibraryAsana = {
  id: 'prasarita-padottanasana',
  family: 'standing',
  english: 'Wide-legged forward fold',
  steps: [
    { text: 'Stand in Tadasana.', stage: 0 },
    { text: 'Breathing in, set the hands on the waist and spread the legs very wide — about four and a half to five feet.', stage: 2 },
    { text: 'Draw the kneecaps up so the legs are firm. Exhaling, lay the palms on the floor between the feet, in line with the shoulders. Breathing in, lift the head and make the back concave.', stage: 5 },
    { text: 'Exhaling, bend the elbows and lower the crown of the head to the floor. The weight stays on the legs, not on the head; the feet, the palms and the head make one straight line.', stage: 6 },
    { text: 'Stay here, breathing deeply and evenly.', stage: 6 },
    { text: 'Inhale, lift the head and straighten the arms, the back concave again and the head well up.', stage: 7 },
    { text: 'Exhale and come up to standing, then jump the feet back together into Tadasana.', stage: 9 },
  ],
  hold: 'Half a minute with the crown on the floor, breathing deeply and evenly (p. 49).',
  cautions: [
    { text: 'Do not drop the body’s weight onto the head; it stays on the legs.', page: 49 },
    { text: 'Keep the feet, the palms and the head in one straight line.', page: 49 },
    ...EVERY_STANDING,
  ],
  prepares: ['tadasana', 'parsvottanasana'],
  counter: ['tadasana'],
  related: ['standing-separate-leg-stretching'],
  sutras: [...SUTRAS],
};
