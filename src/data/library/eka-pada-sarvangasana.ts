import type { LibraryAsana } from '../types';
import { SHOULDERSTAND_LINEAGE, SUTRAS } from './common';

export const ekaPadaSarvangasana: LibraryAsana = {
  id: 'eka-pada-sarvangasana',
  family: 'inversion',
  english: 'One-leg shoulderstand',
  steps: [
    { text: 'Come into the supported shoulderstand.', stage: 1 },
    { text: 'Keep the left leg up; on an exhale take the right leg down to the floor as in the plough, straight and firm. If it will not reach, lower it as far as it goes.', stage: 2 },
    { text: 'Keep the upright knee taut, the leg straight and facing the head, not tipping sideways.', stage: 2 },
    { text: 'On an exhale, lift the right leg back to the shoulderstand.', stage: 3 },
    { text: 'Take the left leg down in the same way, the right leg upright.', stage: 4 },
    { text: 'Lift it back up to join the other.', stage: 5 },
    { text: 'Slide down slowly and rest.', stage: 6 },
  ],
  hold: 'About twenty seconds on each side (p. 100).',
  cautions: SHOULDERSTAND_LINEAGE,
  prepares: ['salamba-sarvangasana-i', 'halasana'],
  counter: ['savasana'],
  related: ['head-to-knee-stretching'],
  sutras: SUTRAS,
};
