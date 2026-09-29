import type { LibraryAsana } from '../types';
import { SHOULDERSTAND_LINEAGE, SUTRAS } from './common';

export const parsvaikaPadaSarvangasana: LibraryAsana = {
  id: 'parsvaika-pada-sarvangasana',
  family: 'inversion',
  english: 'Side-leg shoulderstand',
  steps: [
    { text: 'After the one-leg shoulderstand on both sides, come back to the supported shoulderstand.', stage: 1 },
    { text: 'On an exhale, lower the right leg out to its own side, level with the trunk, toward the floor, straight and firm; if it does not reach, lower it as far as it goes.', stage: 2 },
    { text: 'Keep the left leg vertical, not tipping toward the right, and lift the ribs with the palms to open the chest.', stage: 2 },
    { text: 'On an exhale, return to the shoulderstand.', stage: 3 },
    { text: 'Repeat with the left leg for the same time.', stage: 4 },
    { text: 'Return to the shoulderstand.', stage: 5 },
    { text: 'Slide down slowly and rest.', stage: 6 },
  ],
  hold: 'About twenty seconds on each side (p. 101).',
  cautions: SHOULDERSTAND_LINEAGE,
  prepares: ['eka-pada-sarvangasana'],
  counter: ['savasana'],
  related: ['triangle'],
  sutras: SUTRAS,
};
