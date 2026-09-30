import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_BACKBEND } from './common-backbend';

export const ustrasana: LibraryAsana = {
  id: 'ustrasana',
  family: 'backbend',
  english: 'Camel',
  steps: [
    { text: 'Kneel with the thighs and feet together, the toes pointing back and resting on the floor.', stage: 0 },
    { text: 'Place the palms on the hips.', stage: 1 },
    { text: 'Stretch the thighs, curve the spine back and open the ribs.', stage: 2 },
    { text: 'Breathing out, reach back toward the feet.', stage: 3 },
    { text: 'Set the right palm on the right heel and the left palm on the left heel, or on the soles if you can. Press the feet with the palms, take the head back and push the spine toward the thighs, which stay upright.', stage: 4 },
    { text: 'Firm the buttocks and stretch the back further, from the base of the spine up, the neck lengthening back. Stay about half a minute, breathing normally.', stage: 4 },
    { text: 'Let go of the heels and lift the hands; the book releases them one at a time.', stage: 5 },
    { text: 'Bring each hand back to its hip.', stage: 6 },
    { text: 'Come up, then sit down on the floor and relax.', stage: 7 },
  ],
  hold: 'About half a minute with normal breathing (p. 50).',
  cautions: [
    { text: 'Keep the thighs perpendicular to the floor while the spine goes back toward them.', page: 50 },
    { text: 'Come out one hand at a time, each to its hip, before you sit down.', page: 50 },
    ...EVERY_BACKBEND,
  ],
  counter: ['urdhva-dhanurasana', 'savasana'],
  prepares: ['dhanurasana', 'urdhva-mukha-svanasana'],
  related: ['camel'],
  sutras: [...SUTRAS],
};
