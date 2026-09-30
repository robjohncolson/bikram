import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_FOLD, FOLD_MENSTRUATION } from './common-folds';

export const upavisthaKonasana: LibraryAsana = {
  id: 'upavistha-konasana',
  family: 'seated',
  english: 'Seated wide angle',
  steps: [
    { text: 'Sit with both legs stretched straight in front of you.', stage: 0 },
    { text: 'Take the legs out to the sides one at a time, as wide as they will go, keeping them straight with the backs of the legs on the mat.', stage: 1 },
    { text: 'Take each big toe between the thumb and the first two fingers. Lift the spine and spread the ribs, draw the diaphragm up, and stay a few seconds with deep breaths.', stage: 2 },
    { text: 'Now hold the feet, and breathing out, bend forward and rest the head on the mat.', stage: 3 },
    { text: 'Then lengthen the neck and put the chin down, and work toward resting the chest on the mat.', stage: 4 },
    { text: 'Stay with normal breathing.', stage: 4 },
    { text: 'Breathing in, lift the trunk from the mat.', stage: 5 },
    { text: 'Let go of the feet, bring the legs together and relax.', stage: 6 },
  ],
  hold: 'Thirty to sixty seconds with the chest down, breathing normally (p. 78).',
  cautions: [
    { text: 'Keep the legs extended all through, the backs of both legs resting on the mat.', page: 78 },
    { text: 'The book allows this pose right through pregnancy, at any time of day, even after meals, though not bending forward straight after a meal.', page: 40 },
    FOLD_MENSTRUATION,
    ...EVERY_FOLD,
  ],
  counter: ['savasana'],
  sutras: [...SUTRAS],
};
