import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { LOTUS_LINEAGE } from './common-lotus';
import { BIND_LINEAGE } from './common-lotus-bound';

export const yogaMudrasana: LibraryAsana = {
  id: 'yoga-mudrasana',
  family: 'lotus',
  english: 'Lotus seal',
  steps: [
    { text: 'Sit in the lotus, right foot first.', stage: 0 },
    { text: 'Breathing out, swing the arms back from the shoulders.', stage: 1 },
    { text: 'Take the left arm round the back and catch the left big toe.', stage: 2 },
    { text: 'Bring the right arm round and catch the right big toe: the bound lotus.', stage: 3 },
    { text: 'Breathe in deeply. Breathing out, bend the trunk forward from the hips and rest the head on the floor, keeping hold of the toes.', stage: 4 },
    { text: 'Breathe in and come up, the toes still held.', stage: 5 },
    { text: 'Release the right hand,', stage: 6 },
    { text: 'then the left.', stage: 7 },
    // the other crossing: the figure only shows the right foot placed first, so this step points at no stage
    { text: 'Cross the legs the other way, bind with the right toe first, and fold again.' },
  ],
  hold: 'The book gives no length of stay for the fold (p. 70).',
  cautions: [...BIND_LINEAGE, ...LOTUS_LINEAGE],
  prepares: ['baddha-padmasana'],
  counter: ['savasana'],
  related: ['rabbit'],
  sutras: SUTRAS,
};
