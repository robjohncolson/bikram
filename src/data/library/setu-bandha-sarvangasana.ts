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
    { text: 'The elbows and wrists carry the bridge; only the back of the head and neck, the shoulders, the elbows and the feet touch the floor. To ease the load on them, lengthen the spine toward the neck with the heels pressed firmly down.', stage: 5 },
    { text: 'To come down, take the hands out from under the back,', stage: 6 },
    { text: 'then lower the back to the floor and lie flat to rest.', stage: 7 },
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
