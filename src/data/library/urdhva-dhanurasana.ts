import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_BACKBEND } from './common-backbend';

export const urdhvaDhanurasana: LibraryAsana = {
  id: 'urdhva-dhanurasana',
  family: 'backbend',
  english: 'Upward bow',
  steps: [
    { text: 'Lie flat on your back.', stage: 0 },
    { text: 'Bend the elbows and raise them over the head, the palms under the shoulders, no wider apart than the shoulders, the fingers toward the feet. Bend and raise the knees and draw the feet in until they touch the hips.', stage: 2 },
    { text: 'Breathing out, lift the trunk.', stage: 3 },
    { text: 'Lower the top of the head to the mat and take two breaths there.', stage: 4 },
    { text: 'Breathing out, raise the trunk and the head and arch the back, the weight on the palms and the soles. Straighten the arms from the shoulders until the elbows lock, and draw the thigh muscles up. For more stretch, the book lifts the heels as you pull the thighs up, opens the chest and the sacrum until the belly is taut, then lowers the heels and keeps the arch. Stay half a minute to a minute, breathing normally.', stage: 6 },
    { text: 'Breathing out, bend the knees and the elbows and lower the body.', stage: 8 },
    { text: 'Let the head and shoulders reach the floor first, the hips still raised.', stage: 9 },
    { text: 'Lower the hips and lift the hands from the mat.', stage: 11 },
    { text: 'Bring the arms down, lengthen the legs and rest.' },
  ],
  hold: 'From thirty seconds up to a minute, the breath normal (p. 114).',
  cautions: [
    { text: 'Set the palms no wider apart than the shoulders, the fingers pointing toward the feet.', page: 114 },
    { text: 'The book counts this pose as the first of the advanced and difficult backbends.', page: 115 },
    { text: 'Never practise the advanced asanas without first emptying the bowels.', page: 37 },
    ...EVERY_BACKBEND,
  ],
  prepares: ['ustrasana', 'dhanurasana'],
  counter: ['savasana'],
  sutras: [...SUTRAS],
};
