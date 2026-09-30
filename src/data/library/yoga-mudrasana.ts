import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { LOTUS_CROSSING } from './common-lotus';
import { BIND_LINEAGE } from './common-lotus-bound';

export const yogaMudrasana: LibraryAsana = {
  id: 'yoga-mudrasana',
  family: 'lotus',
  english: 'Lotus seal',
  steps: [
    { text: 'Sit in the lotus, right foot first, and lift the hands clear of the knees.', stage: 0 },
    { text: 'Breathing out, swing the arms back from the shoulders.', stage: 1 },
    { text: 'Take the left arm round the back and catch the left big toe. (In the figure, its hand stops by the far hip, about 25 cm from the toe while upright.)', stage: 2 },
    { text: 'Bring the right arm round and catch the right big toe: the bound lotus (the figure’s right hand, too, stops by the far hip).', stage: 3 },
    { text: 'Breathe in deeply. Breathing out, bend the trunk forward from the hips and rest the head on the floor, keeping hold of the toes. (The figure’s chest comes to rest on the upper heel, its head a little above the floor; its fingertips remain 12 to 14 cm from the toes.)', stage: 4 },
    { text: 'Breathe in and sit upright, then release the right hand followed by the left and open the arms.', stage: 7 },
    { text: 'Bring the hands forward; release the upper foot, then the other foot, and rest with both legs straight.', stage: 12 },
    { text: 'Set the left foot first, then bring the right foot over it. Reach behind for the right toe before the left and fold again.', stage: 20 },
    { text: 'Sit upright, release the arms, then uncross one foot at a time and rest with the legs long.', stage: 28 },
  ],
  hold: 'The book gives no length of stay for the fold (p. 70).',
  cautions: [...BIND_LINEAGE, ...LOTUS_CROSSING],
  prepares: ['baddha-padmasana'],
  counter: ['savasana'],
  related: ['rabbit'],
  sutras: SUTRAS,
};
