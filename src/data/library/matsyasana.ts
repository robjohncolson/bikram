import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { LOTUS_LINEAGE } from './common-lotus';

export const matsyasana: LibraryAsana = {
  id: 'matsyasana',
  family: 'lotus',
  english: 'Fish',
  steps: [
    { text: 'Sit in the lotus, right foot first.', stage: 0 },
    { text: 'Lean back onto the elbows, the crossed legs staying on the floor.', stage: 1 },
    { text: 'Lie flat on the back with the crossed legs resting on the floor.', stage: 2 },
    { text: 'Breathing out, arch the back: lift the neck and chest, take the head back and set the crown on the floor.', stage: 3 },
    { text: 'Hold the crossed legs and use the grip to draw the head further back, so the arch deepens.', stage: 3 },
    // the figure keeps its hands on the legs here (its forearms cannot fold beyond the head), so this step points at no stage
    { text: 'Then let go of the legs, fold the arms, take each elbow in the other hand and rest the forearms on the floor beyond the head. Stay, breathing deeply.' },
    { text: 'Lower the back of the head to the floor and lie flat.', stage: 4 },
    { text: 'Breathe in and come up onto the elbows and back to sitting; release the legs.', stage: 5 },
    // the other crossing: the figure only shows the right foot placed first
    { text: 'Cross the legs the other way and do the pose again for the same time.' },
  ],
  hold: 'Thirty seconds to a minute in the arch, breathing deeply (p. 68), and the same with the legs crossed the other way.',
  cautions: [
    { text: 'If the arch onto the crown and the folded forearms are beyond you, lie flat on the back in the lotus with the arms stretched straight over the head instead.', page: 68 },
    ...LOTUS_LINEAGE,
  ],
  prepares: ['padmasana'],
  counter: ['savasana'],
  related: ['fixed-firm'],
  sutras: SUTRAS,
};
