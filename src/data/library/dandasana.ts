import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_SEAT } from './common-lotus';

export const dandasana: LibraryAsana = {
  id: 'dandasana',
  family: 'seated',
  english: 'Staff',
  steps: [
    { text: 'Sit on the blanket with both legs stretched out in front of you, together, the knees and toes facing the ceiling.', stage: 0 },
    { text: 'Set the palms on the floor beside the hips, the fingers pointing toward the feet.', stage: 1 },
    { text: 'Straighten the arms and press the palms into the floor, so the back rises upright from the seat.', stage: 2 },
    { text: 'Keep the backs of the legs long on the floor and the chest open, the head level.', stage: 2 },
    { text: 'Stay there, the trunk tall like a rod, breathing evenly.', stage: 2 },
    { text: 'Then rest the hands on the thighs, keeping the back as tall as it was.', stage: 3 },
  ],
  hold: 'The book sets no time; it is the seat that the boats and the bound angle begin from (pp. 57–65).',
  cautions: EVERY_SEAT,
  counter: ['savasana'],
  related: ['head-to-knee-stretching'],
  sutras: SUTRAS,
};
