import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { BOAT_LINEAGE } from './common-seated';

export const paripurnaNavasana: LibraryAsana = {
  id: 'paripurna-navasana',
  family: 'seated',
  english: 'Full boat',
  steps: [
    { text: 'Sit in the staff pose, palms beside the hips.', stage: 0 },
    { text: 'Breathing out, lean the trunk back a little and, in the same movement, lift both legs off the floor, straight and firm, knees locked and toes pointing.', stage: 1 },
    { text: 'Find the balance on the buttocks alone, the spine clear of the floor, the legs rising at about 60 to 65 degrees so the feet are higher than the head.', stage: 1 },
    { text: 'Take the hands off the floor and reach the arms forward beside the thighs, parallel to the floor, palms facing each other, hands at shoulder height.', stage: 2 },
    { text: 'Stay with a normal breath; the work can already be felt after twenty seconds or so.', stage: 2 },
    { text: 'Breathing out, lower the hands and bring the legs down to the floor.', stage: 3 },
    // the figure stays seated: lying back to rest points at no stage
    { text: 'Then lie back on the floor and relax.' },
  ],
  hold: 'Half a minute at first, building up to a minute, breathing normally (p. 58).',
  cautions: BOAT_LINEAGE,
  prepares: ['dandasana'],
  counter: ['savasana'],
  related: ['situp'],
  sutras: SUTRAS,
};
