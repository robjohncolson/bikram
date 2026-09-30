import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { LOTUS_LINEAGE } from './common-lotus';
import { BIND_LINEAGE } from './common-lotus-bound';

export const baddhaPadmasana: LibraryAsana = {
  id: 'baddha-padmasana',
  family: 'lotus',
  english: 'Bound lotus',
  steps: [
    { text: 'Sit in the lotus, the right foot placed first and the left foot on top. Lift your hands clear of the knees.', stage: 0 },
    { text: 'Breathing out, swing the arms back from the shoulders.', stage: 1 },
    { text: 'Take the left arm round behind the back toward the right hip and catch the left big toe. Hold it and breathe in. (In the figure, its hand stops by the far hip, about 25 cm from the toe.)', stage: 2 },
    { text: 'On the next exhalation bring the right arm round toward the left hip and catch the right big toe, the arms crossed behind the back (the figure’s right hand, too, stops by the far hip).', stage: 3 },
    { text: 'Throw the head back as far as it will go and take a few deep breaths.', stage: 4 },
    { text: 'Release the right hand, then the left, opening both arms out.', stage: 6 },
    { text: 'Bring the hands forward, clear of the knees. Free the top foot and extend that leg, then release the other foot and rest with both legs straight.', stage: 11 },
    { text: 'Set the left foot first and bring the right foot over it. Bind again, reaching for the right toe before the left, then take the head back.', stage: 19 },
    { text: 'Release each arm and bring the hands forward. Uncross one foot at a time and stretch the legs out to rest.', stage: 26 },
  ],
  hold: 'A few deep breaths with the head thrown back (p. 70); the book gives no longer clock.',
  cautions: [...BIND_LINEAGE, ...LOTUS_LINEAGE],
  prepares: ['padmasana', 'parvatasana'],
  counter: ['savasana'],
  sutras: SUTRAS,
};
