import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { HERO_LINEAGE } from './common-seated';

export const suptaVirasana: LibraryAsana = {
  id: 'supta-virasana',
  family: 'seated',
  english: 'Reclining hero',
  steps: [
    { text: 'Sit in the hero pose, the buttocks on the floor between the feet.', stage: 0 },
    { text: 'Breathing out, lean back and set the elbows on the floor, first one, then the other.', stage: 1 },
    { text: 'Straighten the arms one after the other to take the weight off the elbows and lower the back to the floor. At first only the crown of the head reaches it; with time the back of the head, then the whole back, comes down.', stage: 2 },
    { text: 'Take the arms over the head and stretch them out along the floor, without letting the shoulder blades lift.', stage: 3 },
    { text: 'Stay as long as you can, breathing deeply.', stage: 3 },
    { text: 'Bring the arms back beside the trunk and press the elbows into the floor.', stage: 4 },
    { text: 'Breathing out, sit up again into the hero pose.', stage: 5 },
  ],
  hold: 'As long as you can with deep breathing; ten to fifteen minutes is what the book gives for legs that ache (pp. 64–65).',
  cautions: [
    { text: 'With the arms over the head, keep the shoulder blades on the floor; the arms may instead lie beside the thighs.', page: 64 },
    { text: 'A beginner may keep the knees apart.', page: 64 },
    { text: 'Begin with only the top of the head touching down, and let the back of the head and then the back reach the floor gradually.', page: 64 },
    ...HERO_LINEAGE.filter((n) => n.page !== 62 || n.text.startsWith('The buttocks')),
    { text: 'It may be done after meals, and before bed.', page: 65 },
  ],
  prepares: ['virasana'],
  counter: ['savasana'],
  related: ['fixed-firm'],
  sutras: SUTRAS,
};
