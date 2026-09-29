import type { LibraryAsana } from '../types';
import { SHOULDERSTAND_LINEAGE, SUTRAS, SUTRA_48 } from './common';

export const salambaSarvangasanaI: LibraryAsana = {
  id: 'salamba-sarvangasana-i',
  family: 'inversion',
  english: 'Supported shoulderstand',
  steps: [
    { text: 'Lie flat on the back on a folded blanket, legs stretched with the knees tight, hands beside the legs and palms down. Take a few deep breaths.', stage: 0 },
    { text: 'On an exhale, raise both legs together to a right angle with the body.', stage: 1 },
    { text: 'On the next exhale, lift the hips and back off the floor, pressing the palms gently down.', stage: 2 },
    { text: 'Once the trunk is off the floor, bend the elbows and spread the hands on the ribs behind you, the shoulders resting well down.', stage: 3 },
    { text: 'Using the palms, raise the trunk and legs until they are vertical and the breastbone meets the chin — the chest comes to the chin, not the chin to the chest.', stage: 4 },
    { text: 'Only the back of the head and neck, the shoulders and the upper arms to the elbows stay on the floor. Keep the elbows in, the neck straight, the head still, and breathe evenly.', stage: 4 },
    { text: 'To come down, release the hands and slide down slowly.', stage: 5 },
    { text: 'Lie flat and relax.', stage: 6 },
  ],
  hold: 'Not less than five minutes, increasing gradually toward fifteen (p. 93).',
  cautions: SHOULDERSTAND_LINEAGE,
  prepares: ['head-to-knee-stretching'],
  counter: ['savasana'],
  related: ['rabbit'],
  sutras: [...SUTRAS, SUTRA_48],
};
