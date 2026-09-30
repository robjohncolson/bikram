import type { LibraryAsana } from '../types';
import { SHOULDERSTAND_LINEAGE, SUTRAS } from './common';
import { PINDA_LINEAGE } from './common-lotus-bound';

export const pindasanaInSarvangasana: LibraryAsana = {
  id: 'pindasana-in-sarvangasana',
  family: 'inversion',
  english: 'Folded lotus in the shoulderstand',
  steps: [
    { text: 'Come into the supported shoulderstand with your palms on your back. Place the right foot across the left thigh, then bring the left foot over into lotus.', stage: 2 },
    { text: 'Breathe out and fold the crossed legs toward your head. The figure stops with the feet against the belly and the knees above the head.', stage: 3 },
    { text: 'Lift the crossed legs back into the upright lotus.', stage: 4 },
    { text: 'Free the left foot, then straighten both legs into shoulderstand.', stage: 6 },
    { text: 'Place the left foot first and bring the right foot over it into the other crossing.', stage: 8 },
    { text: 'Fold toward the head again and stay for the same time with an even breath.', stage: 9 },
    { text: 'Raise the crossed legs again before you begin to uncross.', stage: 10 },
    { text: 'Free the right foot first.', stage: 11 },
    { text: 'Release the other foot and return to shoulderstand. Lower slowly when you have finished.' },
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
