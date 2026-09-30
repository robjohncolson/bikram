import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_BACKBEND } from './common-backbend';

export const adhoMukhaSvanasana: LibraryAsana = {
  id: 'adho-mukha-svanasana',
  family: 'backbend',
  english: 'Downward-facing dog',
  steps: [
    { text: 'Lie on your front at full length, face down, the feet a foot apart. Put the palms beside the chest, the fingers straight and pointing toward the head.', stage: 0 },
    { text: 'Breathing out, straighten the arms and lift the trunk off the floor.', stage: 1 },
    { text: 'Send the hips up and back as the head travels in toward the feet.', stage: 2 },
    { text: 'Let the crown of your head come down to the mat between the arms, the elbows straight and the back stretched long.', stage: 3 },
    { text: 'Keep the legs firm with the knees straight and press the heels down, so the soles lie flat on the floor, the feet parallel and the toes pointing straight ahead. Stay about a minute, breathing deeply.', stage: 3 },
    { text: 'Breathing out, lift the head off the floor.', stage: 4 },
    { text: 'Stretch the trunk forward.', stage: 5 },
    { text: 'Lower the body gently to the floor and rest.', stage: 6 },
  ],
  hold: 'About a minute with deep breathing; the book finds a longer stay restores energy when you are exhausted (pp. 56–57).',
  cautions: [
    { text: 'Do not bend the knees: keep the legs stiff and let the heels and soles rest fully on the floor, the feet parallel.', page: 56 },
    { text: 'With dizziness or high blood pressure, the book puts this pose, with the forward bends, before and after the headstand and the shoulderstand rather than starting with them.', page: 39 },
    ...EVERY_BACKBEND,
  ],
  prepares: ['chaturanga-dandasana', 'urdhva-mukha-svanasana'],
  counter: ['savasana'],
  sutras: [...SUTRAS],
};
