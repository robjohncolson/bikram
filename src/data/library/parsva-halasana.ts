import type { LibraryAsana } from '../types';
import { PLOUGH_LINEAGE, SHOULDERSTAND_LINEAGE, SUTRAS } from './common';

export const parsvaHalasana: LibraryAsana = {
  id: 'parsva-halasana',
  family: 'inversion',
  english: 'Side plough',
  steps: [
    { text: 'From the plough, bring both hands to the ribs behind you, palms flat.', stage: 2 },
    { text: 'Move both legs round to the left as far as you can, until they are in line with the head.', stage: 3 },
    { text: 'Tighten the knees and raise the trunk with the help of the palms; the chest and trunk stay as they were in the plough while only the legs move.', stage: 3 },
    { text: 'Bring the legs back through the centre.', stage: 4 },
    { text: 'On an exhale, take them to the right, in line with the head, for the same time.', stage: 5 },
    { text: 'Return them to the centre.', stage: 6 },
    { text: 'Slide down slowly and rest.', stage: 9 },
  ],
  hold: 'Half a minute on each side (p. 99).',
  cautions: [...SHOULDERSTAND_LINEAGE, ...PLOUGH_LINEAGE],
  prepares: ['supta-konasana'],
  counter: ['savasana'],
  related: ['spine-twisting'],
  sutras: SUTRAS,
};
