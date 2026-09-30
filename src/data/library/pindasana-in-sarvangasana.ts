import type { LibraryAsana } from '../types';
import { SHOULDERSTAND_LINEAGE, SUTRAS } from './common';
import { PINDA_LINEAGE } from './common-lotus-bound';

export const pindasanaInSarvangasana: LibraryAsana = {
  id: 'pindasana-in-sarvangasana',
  family: 'inversion',
  english: 'Folded lotus in the shoulderstand',
  steps: [
    { text: 'Lie on the back on a folded blanket, arms beside you.', stage: 0 },
    { text: 'Come up into the supported shoulderstand, the palms on the back.', stage: 1 },
    { text: 'Bend the knees and cross the legs as in the lotus, first the right foot onto the left thigh,', stage: 2 },
    { text: 'then the left foot onto the right thigh, and stretch the crossed legs up.', stage: 3 },
    { text: 'Breathing out, bend at the hips and lower the crossed legs toward the head until they rest over it. Stay, breathing normally.', stage: 4 },
    { text: 'Go back up to the lotus in the shoulderstand.', stage: 5 },
    { text: 'Uncross the legs, left foot first, and return to the shoulderstand.', stage: 6 },
    // the other crossing: the figure only shows the right foot placed first, so this step points at no stage
    { text: 'Cross the legs again with the left foot placed first and repeat for the same time.' },
    { text: 'Slide slowly down and lie flat.', stage: 7 },
  ],
  hold: 'Twenty to thirty seconds with normal breathing, the same with the crossing changed (p. 103).',
  cautions: [
    { text: 'Fold down from the lotus in the shoulderstand, and come back up to it before uncrossing the legs.', page: 103 },
    ...PINDA_LINEAGE,
    ...SHOULDERSTAND_LINEAGE,
  ],
  prepares: ['urdhva-padmasana-in-sarvangasana'],
  counter: ['savasana'],
  related: ['wind-removing'],
  sutras: SUTRAS,
};
