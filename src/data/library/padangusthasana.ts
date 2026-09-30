import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING, TOE_HOLD } from './common-standing';

export const padangusthasana: LibraryAsana = {
  id: 'padangusthasana',
  family: 'standing',
  english: 'Big-toe hold',
  steps: [
    { text: 'Stand in Tadasana.', stage: 0 },
    { text: 'Set the feet about a foot apart.', stage: 1 },
    { text: 'Breathing out, bend forward and hook each big toe between the thumb and the first two fingers, palms facing one another, and hold on firmly. (The figure takes the toes; its rigid trunk leaves the head ahead of the knees.)', stage: 2 },
    { text: 'Lift the head, draw the diaphragm toward the chest and hollow the back as far as it will go. Let the bend come from the pelvis, not from the shoulders reaching down, so the back is concave from the tailbone. Keep the legs stiff and take a breath or two here.', stage: 2 },
    { text: 'Breathing out, tighten and pull on the toes without lifting them, and take the head down between the knees.', stage: 3 },
    { text: 'Stay there, breathing normally.', stage: 4 },
    { text: 'Breathing in, come back up to the concave back, head raised.', stage: 6 },
    { text: 'Let go of the toes and separate the hands from the feet.', stage: 7 },
    { text: 'Stand up into Tadasana.', stage: 8 },
  ],
  hold: 'A breath or two with the back concave, then about 20 seconds with the head down (pp. 50–51).',
  cautions: [...TOE_HOLD, ...EVERY_STANDING],
  prepares: ['tadasana', 'prasarita-padottanasana'],
  counter: ['tadasana'],
  related: ['half-moon'],
  sutras: [...SUTRAS],
};
