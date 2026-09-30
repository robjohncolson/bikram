import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_BACKBEND } from './common-backbend';

export const purvottanasana: LibraryAsana = {
  id: 'purvottanasana',
  family: 'backbend',
  english: 'Upward plank',
  steps: [
    { text: 'Sit with the legs stretched straight out in front. Put the palms on the floor by the hips, the fingers pointing toward the feet.', stage: 0 },
    { text: 'Bend the knees and set the soles and heels down on the floor.', stage: 1 },
    { text: 'Take the weight onto the hands and feet and, breathing out, lift the body from the floor.', stage: 2 },
    { text: 'Straighten the arms and the legs, the elbows and knees kept firm. The arms stand upright from the wrists to the shoulders; the trunk runs level with the floor from the shoulders to the pelvis.', stage: 2 },
    { text: 'Stretch the neck and take the head as far back as it will go. Stay a minute, breathing normally.', stage: 2 },
    { text: 'Breathing out, bend the elbows and the knees.', stage: 3 },
    { text: 'Lower yourself to sit on the floor, and relax.', stage: 4 },
  ],
  hold: 'One minute with normal breathing (p. 82).',
  cautions: [
    { text: 'Keep the knees and the elbows straight and firm: the arms upright under the shoulders, the trunk level from the shoulders to the pelvis.', page: 82 },
    ...EVERY_BACKBEND,
  ],
  counter: ['savasana'],
  prepares: ['paschimottanasana'],
  sutras: [...SUTRAS],
};
