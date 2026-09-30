import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { LOTUS_LINEAGE } from './common-lotus';
import { BIND_LINEAGE } from './common-lotus-bound';

export const baddhaPadmasana: LibraryAsana = {
  id: 'baddha-padmasana',
  family: 'lotus',
  english: 'Bound lotus',
  steps: [
    { text: 'Sit in the lotus, the right foot placed first and the left foot on top.', stage: 0 },
    { text: 'Breathing out, swing the arms back from the shoulders.', stage: 2 },
    { text: 'Take the left arm round behind the back toward the right hip and catch the left big toe. Hold it and breathe in. (In the figure, its hand stops by the far hip, about 25 cm from the toe.)', stage: 3 },
    { text: 'On the next exhalation bring the right arm round toward the left hip and catch the right big toe, the arms crossed behind the back (the figure’s right hand, too, stops by the far hip).', stage: 4 },
    { text: 'Throw the head back as far as it will go and take a few deep breaths.', stage: 5 },
    { text: 'Let go with the right hand,', stage: 6 },
    { text: 'then with the left, and bring the hands back to the knees.', stage: 7 },
    // the other crossing: the figure only shows the right foot placed first, so this step points at no stage
    { text: 'Cross the legs the other way and bind again, now catching the right toe first, since the right foot lies on top.' },
  ],
  hold: 'A few deep breaths with the head thrown back (p. 70); the book gives no longer clock.',
  cautions: [...BIND_LINEAGE, ...LOTUS_LINEAGE],
  prepares: ['padmasana', 'parvatasana'],
  counter: ['savasana'],
  sutras: SUTRAS,
};
