import type { LibraryAsana } from '../types';
import { HEADSTAND_LINEAGE, SUTRAS, SUTRA_48 } from './common';

export const salambaSirsasanaI: LibraryAsana = {
  id: 'salamba-sirsasana-i',
  family: 'inversion',
  english: 'Supported headstand',
  steps: [
    { text: 'Fold a blanket four times and kneel beside it. Set the forearms on its centre with the elbows no wider than the shoulders, and lace the fingers right to their tips so the palms make a cup.', stage: 0 },
    { text: 'Place only the crown of the head on the blanket, the back of the head against the cupped palms.', stage: 0 },
    { text: 'Straighten the knees and walk the toes in toward the head, keeping the back upright.', stage: 1 },
    { text: 'On an exhale, lift both feet off the floor together with the knees bent — a gentle swing, never a kick.', stage: 2 },
    { text: 'Let the knees rise toward the ceiling, the heels still folded in.', stage: 3 },
    { text: 'Stretch the legs up until the body stands in one vertical line from the crown to the heels. The head takes the weight; the forearms and hands only guard the balance, and the shoulders stay lifted away from the floor.', stage: 4 },
    { text: 'To come down, bend the knees back in, both legs moving together on an exhalation.', stage: 5 },
    { text: 'Rest the feet and then the knees on the floor, the head still down.', stage: 6 },
    { text: 'Then lift the head from the blanket and rest.', stage: 7 },
  ],
  hold: 'A beginner stays about two minutes and works toward five; once mastered, the book gives ten to fifteen minutes as comfortable (p. 88).',
  cautions: HEADSTAND_LINEAGE,
  prepares: ['salamba-sarvangasana-i', 'halasana'],
  counter: ['salamba-sarvangasana-i', 'savasana'],
  related: ['rabbit'],
  sutras: [...SUTRAS, SUTRA_48],
};
