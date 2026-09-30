import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_BACKBEND } from './common-backbend';

export const salabhasana: LibraryAsana = {
  id: 'salabhasana',
  family: 'backbend',
  english: 'Locust',
  steps: [
    { text: 'Lie on your front at full length, face down, and reach both arms back along the body.', stage: 0 },
    { text: 'Breathing out, raise the head, the chest and both legs together, as high as they will go. Only the front of the belly stays down and carries you; the ribs leave the floor and the hands press on nothing.', stage: 1 },
    { text: 'Firm the buttocks and the thighs. The legs stay straight and touch at the thighs, the knees and the ankles, and the arms stretch back to work the upper back.', stage: 1 },
    { text: 'Lower everything to the floor and rest a moment.', stage: 2 },
    { text: 'For an ache in the low back, try the book’s variation: bend the knees with the thighs apart and the shins upright.', stage: 3 },
    { text: 'Breathing out, lift the thighs off the floor and draw them in until the knees meet, the shins still upright.', stage: 4 },
    { text: 'Lower the thighs, stretch the legs out and lie still.', stage: 5 },
  ],
  hold: 'As long as you can while the breath stays normal (p. 53).',
  cautions: [
    { text: 'Do not lean on the hands: keep them reaching back so that the muscles of the upper back do the work.', page: 53 },
    { text: 'Lifting the chest and legs is hard at first; it grows easier as the abdominal muscles strengthen.', page: 53 },
    ...EVERY_BACKBEND,
  ],
  counter: ['dhanurasana', 'savasana'],
  prepares: ['bhujangasana-i'],
  related: ['locust', 'full-locust'],
  sutras: [...SUTRAS],
};
