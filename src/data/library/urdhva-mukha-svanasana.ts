import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_BACKBEND } from './common-backbend';

export const urdhvaMukhaSvanasana: LibraryAsana = {
  id: 'urdhva-mukha-svanasana',
  family: 'backbend',
  english: 'Upward-facing dog',
  steps: [
    { text: 'Lie on your front, face down, the feet about a foot apart and the toes pointing straight back.', stage: 0 },
    { text: 'Put the palms down beside the waist, the fingers pointing toward the head.', stage: 0 },
    { text: 'Breathing in, begin to lift the head and the trunk.', stage: 1 },
    { text: 'Straighten the arms fully and take the head and trunk back as far as they will go. The knees stay off the floor: the palms and the toes carry the whole weight.', stage: 2 },
    { text: 'Stretch the spine, the thighs and the calves, firm the buttocks and the backs of the arms, press the chest forward and let the head go back.', stage: 2 },
    { text: 'Bend the elbows, let the stretch go and come down to rest on the floor.', stage: 3 },
  ],
  hold: 'Half a minute to a minute, breathing deeply (p. 56).',
  cautions: [
    { text: 'Keep the legs straight and firm and never let the knees rest on the floor; the palms and toes alone bear the body.', page: 56 },
    ...EVERY_BACKBEND,
  ],
  prepares: ['bhujangasana-i'],
  counter: ['adho-mukha-svanasana'],
  related: ['cobra'],
  sutras: [...SUTRAS],
};
