import type { LibraryAsana } from '../types';
import { SHOULDERSTAND_LINEAGE, SUTRAS } from './common';

export const setuBandhaSarvangasana: LibraryAsana = {
  id: 'setu-bandha-sarvangasana',
  family: 'inversion',
  english: 'Bridge from the shoulderstand',
  steps: [
    { text: 'Come into the supported shoulderstand.', stage: 2 },
    { text: 'With the palms resting well on the back, lift the spine and bend the knees.', stage: 3 },
    { text: 'Let the feet travel over behind you, past the wrists, and down to the floor.', stage: 4 },
    { text: 'Stretch the legs out and keep them together: the body is now a bridge.', stage: 5 },
    { text: 'The elbows and wrists carry the bridge; only the back of the head and neck, the shoulders, the elbows and the feet touch the floor. Keep the head still, and if the wrists or elbows tire, walk the feet in and lower the back to the floor.', stage: 5 },
    { text: 'Lie flat to rest.', stage: 6 },
  ],
  hold: 'Half a minute to a minute, breathing normally (p. 102).',
  cautions: [
    ...SHOULDERSTAND_LINEAGE,
    { text: 'The book grades this among the harder shoulderstand variations, and its weight falls on the elbows and wrists.', page: 102 },
  ],
  prepares: ['salamba-sarvangasana-i', 'camel'],
  counter: ['savasana'],
  related: ['camel', 'bow'],
  sutras: SUTRAS,
};
