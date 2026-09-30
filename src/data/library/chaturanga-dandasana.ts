import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_BACKBEND } from './common-backbend';

export const chaturangaDandasana: LibraryAsana = {
  id: 'chaturanga-dandasana',
  family: 'backbend',
  english: 'Four-limbed staff',
  steps: [
    { text: 'Lie on your front, face down. Bend the elbows and set the palms beside the chest; let the feet rest about a foot apart, the toes tucked under.', stage: 0 },
    { text: 'Breathing out, lift the whole body a few inches clear of the floor on the hands and toes alone.', stage: 1 },
    { text: 'Hold it stiff as a staff, level with the floor from the head to the heels, the knees drawn tight. Stay a while, breathing normally.', stage: 1 },
    { text: 'Then carry the whole body slowly forward until the feet rest on the upper side of the toes.', stage: 2 },
    { text: 'Stay about half a minute, the breath normal or deep. The movement may be repeated several times.', stage: 2 },
    { text: 'Lower yourself to the floor and relax.', stage: 3 },
  ],
  hold: 'A while in the staff, then about thirty seconds forward on the tops of the toes; the movement may be repeated several times (p. 55).',
  cautions: [
    { text: 'Keep the body stiff and parallel to the floor from head to heels, the knees taut; the four limbs carry it, the body does not sag between them.', page: 55 },
    ...EVERY_BACKBEND,
  ],
  counter: ['adho-mukha-svanasana'],
  sutras: [...SUTRAS],
};
