import type { LibraryAsana } from '../types';
import { HEADSTAND_LINEAGE, SUTRAS } from './common';

export const urdhvaDandasana: LibraryAsana = {
  id: 'urdhva-dandasana',
  family: 'inversion',
  english: 'Headstand, legs level',
  steps: [
    { text: 'Set up as for the supported headstand: forearms and crown on the folded blanket, fingers laced.', stage: 0 },
    { text: 'Go up into the headstand and settle in the vertical line.', stage: 3 },
    { text: 'On an exhale, lower the straight legs together until they are parallel to the floor, the hips drawing back a little to balance them.', stage: 4 },
    { text: 'Stay only as long as you can hold it steadily, breathing normally.', stage: 4 },
    { text: 'On an exhale, take the legs back up to vertical.', stage: 5 },
    { text: 'Bend both knees toward the trunk.', stage: 6 },
    { text: 'Rest the feet and knees on the floor.', stage: 7 },
    { text: 'Raise the head and rest.' },
  ],
  hold: 'About ten seconds; on the way down from the headstand the book suggests staying here up to a minute as capacity grows (p. 87).',
  cautions: [
    ...HEADSTAND_LINEAGE,
    { text: 'At first the neck, shoulders and spine are under great strain here and the legs can be held level only for seconds; the stay lengthens as the neck, shoulders, abdomen and spine grow stronger.', page: 87 },
  ],
  prepares: ['salamba-sirsasana-i'],
  counter: ['salamba-sarvangasana-i', 'savasana'],
  related: ['standing-separate-leg-stretching'],
  sutras: SUTRAS,
};
