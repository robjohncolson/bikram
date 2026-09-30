import type { LibraryAsana } from '../types';
import { PLOUGH_LINEAGE, SHOULDERSTAND_LINEAGE, SUTRAS } from './common';

export const karnapidasana: LibraryAsana = {
  id: 'karnapidasana',
  family: 'inversion',
  english: 'Knees to the ears',
  steps: [
    { text: 'Come into the plough and stay there for its full time.', stage: 3 },
    { text: 'Then bend the knees and rest them on the floor, one beside each ear.', stage: 4 },
    { text: 'Keep the toes stretched back with the heels and toes together; rest the hands on the back of the ribs, or lace the fingers and stretch the arms out.', stage: 4 },
    { text: 'Stay, breathing normally.', stage: 4 },
    { text: 'Straighten the legs back into the plough.', stage: 5 },
    { text: 'Slide down slowly and lie flat.', stage: 6 },
  ],
  hold: 'Half a minute to a minute (p. 98).',
  cautions: [...SHOULDERSTAND_LINEAGE, ...PLOUGH_LINEAGE],
  prepares: ['halasana'],
  counter: ['savasana'],
  related: ['wind-removing'],
  sutras: SUTRAS,
};
