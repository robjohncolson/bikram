import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING } from './common-standing';

export const tadasana: LibraryAsana = {
  id: 'tadasana',
  family: 'standing',
  english: 'Mountain',
  steps: [
    { text: 'Begin standing easily, the feet a little apart and the arms loose.', stage: 0 },
    { text: 'Draw the feet together until the heels touch and the big toes touch. Spread the toes long on the floor with the balls of the feet grounded.', stage: 1 },
    { text: 'Lift the kneecaps so the knees tighten, firm the buttocks, and draw up the muscles behind the thighs.', stage: 2 },
    { text: 'Hold the belly in and the chest forward; lengthen the spine upward and keep the neck straight. Share the weight evenly between heels and toes, so ear, hip and ankle stack in one upright line.', stage: 2 },
    { text: 'In the full form the arms reach straight up over the head.', stage: 3 },
    { text: 'For ease you may instead let them rest beside the thighs, fingers together and pointing to the floor — the way every standing pose begins.', stage: 4 },
  ],
  hold: 'The book sets no time: it is the stance every standing pose starts from and returns to (p. 41).',
  cautions: [
    { text: 'Do not stand with the weight on the heels, on the toes, along either rim of the foot, or on one leg; spread it evenly over both feet.', page: 41 },
    { text: 'The book links weight hanging back on the heels to loose hips, a pushed-out belly and a spine that soon tires the body and dulls the mind.', page: 41 },
    { text: 'Even with the feet apart, keep each heel and its toes on a line parallel to the body’s midline rather than splayed at an angle.', page: 41 },
    ...EVERY_STANDING,
  ],
  counter: ['utthita-trikonasana'],
  related: ['pranayama'],
  sutras: [...SUTRAS],
};
