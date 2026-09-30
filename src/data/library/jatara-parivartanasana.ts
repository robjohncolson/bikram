import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_TWIST } from './common-twist';

export const jataraParivartanasana: LibraryAsana = {
  id: 'jatara-parivartanasana',
  family: 'twist',
  english: 'Belly turn, lying',
  steps: [
    { text: 'Lie flat on your back, legs together and long, arms beside you.', stage: 0 },
    { text: 'Breathing out, lift both legs together until they point straight up. Keep them stiff, the knees never bending.', stage: 1 },
    { text: 'Stretch the arms out along the floor in line with the shoulders, so the body makes a cross. Stay for a few breaths.', stage: 2 },
    { text: 'Breathing out, take both legs down to the left together, toward the floor, until the left toes come almost to the fingertips of the left hand. The legs turn from the hips; the back stays on the floor as far as it can, and as the legs come near the hand, turn the belly the other way, to the right.', stage: 3 },
    { text: 'Stay about twenty seconds with the legs stiff, then on an exhalation bring them slowly back up to the vertical.', stage: 4 },
    { text: 'After a few breaths there, take them down to the right in the same way, the belly turning to the left, and stay as long.', stage: 5 },
    { text: 'Breathing out, bring the legs back up to the vertical.', stage: 6 },
    { text: 'Lower the legs gently to the floor and rest.', stage: 7 },
  ],
  hold: 'About twenty seconds on each side, with a few breaths between, the legs up (p. 107).',
  cautions: [
    { text: 'At first the opposite shoulder will come off the floor as the legs go down; have a friend hold it down, or keep hold of something heavy with that hand.', page: 106 },
    { text: 'Keep the knees tight and the legs together all the way down and back; turn the legs from the hips only, the lower back staying on the floor as far as you can.', page: 107 },
    ...EVERY_TWIST,
  ],
  prepares: ['supta-padangusthasana'],
  counter: ['savasana'],
  related: ['wind-removing'],
  sutras: [...SUTRAS],
};
