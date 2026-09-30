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
    { text: 'Stretch the arms straight up over the head, turn the palms toward the ceiling and bow the chin to the breastbone.', stage: 3 },
    { text: 'Lift the arms from the back of the lower ribs and from the shoulder blades, and stay, breathing deeply and evenly.', stage: 3 },
    { text: 'Bring the arms down in front of you.', stage: 5 },
    { text: 'Unlace the hands.', stage: 6 },
    { text: 'Lift the top foot away, extend that leg, then release the other foot and rest with both legs long.', stage: 11 },
    { text: 'Place the left foot first, then the right. Change the finger crossing and raise the arms again, keeping the back upright.', stage: 18 },
    { text: 'Lower and separate the hands; release one foot at a time and rest with the legs straight.', stage: 26 },
  ],
  hold: 'A minute or two, with deep, even breathing, and the same again with the legs and fingers crossed the other way (p. 68).',
  cautions: LOTUS_LINEAGE,
  prepares: ['padmasana'],
  counter: ['savasana'],
  related: ['half-moon'],
  sutras: SUTRAS,
};
