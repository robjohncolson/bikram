import type { LibraryAsana } from '../types';
import { PLOUGH_LINEAGE, SHOULDERSTAND_LINEAGE, SUTRAS } from './common';

export const halasana: LibraryAsana = {
  id: 'halasana',
  family: 'inversion',
  english: 'Plough',
  steps: [
    { text: 'Lie on the back on a folded blanket, arms beside you.', stage: 0 },
    { text: 'Come up into the supported shoulderstand with a firm chinlock.', stage: 2 },
    { text: 'Release the chinlock, lower the trunk a little and take the straight legs over the head until the toes rest on the floor — or on a chair or stool if they do not reach.', stage: 3 },
    { text: 'Tighten the knees by drawing up the backs of the thighs, and lift the trunk.', stage: 3 },
    { text: 'Stretch the arms along the floor away from the legs and lace the fingers, so legs and arms reach in opposite directions; halfway through, change the interlock.', stage: 4 },
    { text: 'To come out, release the hands and raise the legs back up to the shoulderstand.', stage: 5 },
    { text: 'Slide slowly down to the floor.', stage: 6 },
    { text: 'Lie flat on the back and relax.', stage: 7 },
  ],
  hold: 'One to five minutes, breathing normally (p. 96).',
  cautions: [...SHOULDERSTAND_LINEAGE, ...PLOUGH_LINEAGE],
  prepares: ['salamba-sarvangasana-i'],
  counter: ['savasana'],
  related: ['head-to-knee-stretching'],
  sutras: SUTRAS,
};
