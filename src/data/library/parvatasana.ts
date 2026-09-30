import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { LOTUS_LINEAGE } from './common-lotus';

export const parvatasana: LibraryAsana = {
  id: 'parvatasana',
  family: 'lotus',
  english: 'Mountain arms in the lotus',
  steps: [
    { text: 'Sit in the lotus: the right foot on the left thigh, the left foot over it on the right thigh, the spine upright.', stage: 0 },
    { text: 'Interlace the fingers, the arms stretched out in front of you.', stage: 1 },
    { text: 'Stretch the arms straight up over the head and turn the palms to face the ceiling.', stage: 3 },
    { text: 'Bow the head until the chin rests on the breastbone.', stage: 3 },
    { text: 'Lift the arms from the back of the lower ribs and from the shoulder blades, and stay, breathing deeply and evenly.', stage: 3 },
    { text: 'Bring the arms down in front of you and unlace the hands.', stage: 5 },
    // the other crossing: the figure only shows the right foot placed first, so this step points at no stage
    { text: 'Change both the crossing of the legs and the way the fingers interlace, and repeat, the back held erect.' },
  ],
  hold: 'A minute or two, with deep, even breathing, and the same again with the legs and fingers crossed the other way (p. 68).',
  cautions: LOTUS_LINEAGE,
  prepares: ['padmasana'],
  counter: ['savasana'],
  related: ['half-moon'],
  sutras: SUTRAS,
};
