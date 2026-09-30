import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_BACKBEND } from './common-backbend';

export const bhujangasanaI: LibraryAsana = {
  id: 'bhujangasana-i',
  family: 'backbend',
  english: 'Cobra',
  steps: [
    { text: 'Lie face down with the legs stretched out and the feet together, the knees firm and the toes pointed.', stage: 0 },
    { text: 'Set the palms on the floor beside the pelvis.', stage: 0 },
    { text: 'Breathing in, press the palms down and begin to raise the trunk from the floor.', stage: 1 },
    { text: 'Keep rising until the pubis alone touches the floor, the arms straight, the head thrown back like a snake about to strike. The weight rests on the legs and the palms.', stage: 2 },
    { text: 'Tighten the anus and the buttocks and firm the thighs. Stay for about twenty seconds, breathing normally.', stage: 2 },
    { text: 'Breathing out, bend the elbows and lower the trunk.', stage: 3 },
    { text: 'Rest the trunk on the floor. Do the pose two or three times, then relax.', stage: 4 },
  ],
  hold: 'About twenty seconds, repeated two or three times (p. 55).',
  cautions: [
    { text: 'Lift only until the pubis meets the floor, and keep it there; the weight is taken on the legs and the palms.', page: 55 },
    ...EVERY_BACKBEND,
  ],
  prepares: ['chaturanga-dandasana', 'salabhasana'],
  counter: ['adho-mukha-svanasana'],
  related: ['cobra'],
  sutras: [...SUTRAS],
};
