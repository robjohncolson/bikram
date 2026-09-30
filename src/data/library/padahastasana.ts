import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING, TOE_HOLD } from './common-standing';

export const padahastasana: LibraryAsana = {
  id: 'padahastasana',
  family: 'standing',
  english: 'Hands under the feet',
  steps: [
    { text: 'Stand in Tadasana.', stage: 0 },
    { text: 'Set the feet about a foot apart.', stage: 1 },
    { text: 'Breathing out, bend forward with the knees straight and slide the hands under the feet, palms up, until the soles rest on the palms.', stage: 2 },
    { text: 'Raise the head and hollow the back as much as you can, the knees still gripped firm, and take a few breaths.', stage: 2 },
    { text: 'Breathing out, bend the elbows and draw up against the palms, bringing the head down between the knees.', stage: 3 },
    { text: 'Stay, breathing normally.', stage: 3 },
    { text: 'Breathing in, lift the head back to the concave position and take two breaths.', stage: 4 },
    { text: 'Breathing in, come up into Tadasana.', stage: 5 },
  ],
  hold: 'A few breaths with the back concave, then about 20 seconds with the head down (p. 51).',
  cautions: [
    { text: 'The book rates this the harder of the two toe-and-foot holds; learn Padangusthasana first.', page: 52 },
    ...TOE_HOLD,
    ...EVERY_STANDING,
  ],
  prepares: ['padangusthasana'],
  counter: ['tadasana'],
  related: ['half-moon'],
  sutras: [...SUTRAS],
};
