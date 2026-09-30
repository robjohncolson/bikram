import type { LibraryAsana } from '../types';
import { PLOUGH_LINEAGE, SHOULDERSTAND_LINEAGE, SUTRAS } from './common';

export const suptaKonasana: LibraryAsana = {
  id: 'supta-konasana',
  family: 'inversion',
  english: 'Reclining angle',
  steps: [
    { text: 'From the plough, keep the knees tight.', stage: 2 },
    { text: 'Spread the straight legs as far apart as you can, pulling the trunk up.', stage: 3 },
    { text: 'Take the right big toe in the right hand and the left in the left, the heels lifted (the figure reaches the lower shins; its fingertips still stop short of the toes).', stage: 5 },
    { text: 'Holding the toes, lift the middle of the back further and stretch the backs of the legs.', stage: 5 },
    { text: 'Let go of the toes and bring the legs together, back into the plough.', stage: 6 },
    { text: 'Slide down slowly and rest.', stage: 7 },
  ],
  hold: 'Twenty to thirty seconds, breathing normally (p. 99).',
  cautions: [...SHOULDERSTAND_LINEAGE, ...PLOUGH_LINEAGE],
  prepares: ['karnapidasana'],
  counter: ['savasana'],
  related: ['standing-separate-leg-stretching'],
  sutras: SUTRAS,
};
