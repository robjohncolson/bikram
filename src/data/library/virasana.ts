import type { LibraryAsana } from '../types';
import { SUTRAS, SUTRA_48 } from './common';
import { HERO_LINEAGE } from './common-seated';

export const virasana: LibraryAsana = {
  id: 'virasana',
  family: 'seated',
  english: 'Hero',
  steps: [
    { text: 'Kneel with the knees together and the feet about a foot and a half apart, the tops of the feet on the floor.', stage: 0 },
    { text: 'Lower the buttocks to the floor between the feet — the seat on the floor, not on the feet — each inner calf alongside its outer thigh, the toes pointing back.', stage: 1 },
    { text: 'Rest the wrists on the knees, palms up, the tips of thumb and forefinger touching and the other fingers straight. Lift the back tall and stay, breathing deeply.', stage: 1 },
    { text: 'Lace the fingers, turn the palms to the ceiling and stretch the arms straight up over the head. Stay about a minute.', stage: 2 },
    { text: 'Breathing out, unlace the hands and place the palms on the soles.', stage: 3 },
    { text: 'Fold forward until the chin rests on the knees. Stay about a minute.', stage: 4 },
    { text: 'Breathing in, bring the trunk back up.', stage: 5 },
    // coming out: the figure stays in the seat, so this step points at no stage
    { text: 'Then bring the feet forward and relax the legs.' },
  ],
  hold: 'Seated with the wrists on the knees, as long as you can; a minute with the arms up and a minute folded forward (p. 62).',
  cautions: HERO_LINEAGE,
  counter: ['supta-virasana', 'savasana'],
  related: ['fixed-firm'],
  sutras: [
    ...SUTRAS,
    // the book offers it as a seat for meditation and breath practice (p. 62)
    SUTRA_48,
  ],
};
