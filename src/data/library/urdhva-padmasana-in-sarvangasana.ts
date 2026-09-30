import type { LibraryAsana } from '../types';
import { SHOULDERSTAND_LINEAGE, SUTRAS } from './common';

export const urdhvaPadmasanaInSarvangasana: LibraryAsana = {
  id: 'urdhva-padmasana-in-sarvangasana',
  family: 'inversion',
  english: 'Lotus in the shoulderstand',
  steps: [
    { text: 'Lie on the back on a folded blanket, arms beside you.', stage: 0 },
    { text: 'Come up into the supported shoulderstand, the palms on the back.', stage: 1 },
    { text: 'Bend the knees and cross the legs as in the lotus: first the right foot onto the left thigh.', stage: 2 },
    { text: 'Then the left foot onto the right thigh.', stage: 3 },
    { text: 'Stretch the crossed legs straight up, draw the knees closer together and take the legs back, away from the pelvis, as far as they will go.', stage: 3 },
    { text: 'Stay with deep, even breathing.', stage: 3 },
    { text: 'Uncross the legs, left foot first, and return to the shoulderstand.', stage: 5 },
    { text: 'Cross them again with the left foot placed first, and stay for the same time.', stage: 7 },
    { text: 'Slide slowly down and lie flat.', stage: 11 },
  ],
  hold: 'Twenty to thirty seconds each way, breathing deeply and evenly (p. 103).',
  cautions: [
    ...SHOULDERSTAND_LINEAGE,
    { text: 'Build it on the lotus itself: the legs cross here exactly as in Padmasana.', page: 103 },
  ],
  prepares: ['salamba-sarvangasana-i', 'padmasana'],
  counter: ['savasana'],
  related: ['fixed-firm'],
  sutras: SUTRAS,
};
