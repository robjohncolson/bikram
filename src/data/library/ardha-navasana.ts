import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { BOAT_LINEAGE } from './common-seated';

export const ardhaNavasana: LibraryAsana = {
  id: 'ardha-navasana',
  family: 'seated',
  english: 'Half boat',
  steps: [
    { text: 'Sit with the legs stretched straight out in front of you.', stage: 0 },
    { text: 'Lace the fingers and cup them round the back of the head, just above the neck, elbows wide.', stage: 1 },
    { text: 'Breathing out, lean the trunk back and at the same time lift the legs together, thighs and knees firm, toes pointed. The balance is on the buttocks; the spine stays clear of the floor.', stage: 2 },
    { text: 'Hold the legs low, about 30 to 35 degrees above the floor, with the crown of the head level with the toes. The abdomen and the lower back take hold.', stage: 2 },
    { text: 'Keep the breath light rather than deep: a big in-breath lets go of the hold on the abdomen.', stage: 2 },
    { text: 'Lower the legs to the floor and sit up tall.', stage: 3 },
    { text: 'Release the hands.' },
  ],
  hold: 'Twenty to thirty seconds with normal breathing; staying a full minute shows strong abdominal muscles (p. 59).',
  cautions: BOAT_LINEAGE,
  prepares: ['dandasana', 'paripurna-navasana'],
  counter: ['savasana'],
  related: ['situp'],
  sutras: SUTRAS,
};
