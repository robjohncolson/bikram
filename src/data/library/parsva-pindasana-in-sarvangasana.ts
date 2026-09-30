import type { LibraryAsana } from '../types';
import { SHOULDERSTAND_LINEAGE, SUTRAS } from './common';
import { PINDA_LINEAGE } from './common-lotus-bound';

export const parsvaPindasanaInSarvangasana: LibraryAsana = {
  id: 'parsva-pindasana-in-sarvangasana',
  family: 'inversion',
  english: 'Folded lotus to the side in the shoulderstand',
  steps: [
    { text: 'Come into the supported shoulderstand, the palms on the back.', stage: 0 },
    { text: 'Cross the legs as in the lotus, the right foot onto the left thigh first,', stage: 1 },
    { text: 'then the left foot onto the right thigh, the crossed legs stretched up.', stage: 2 },
    { text: 'Breathing out, fold the crossed legs down over the head.', stage: 3 },
    { text: 'Turn the hips to the right and, breathing out, lower both knees toward the floor, the left knee beside the right ear.', stage: 4 },
    { text: 'Press the left shoulder down and the left hand firmly into the back. Stay, breathing normally.', stage: 4 },
    // the other side: the figure only shows the knees going to the right, so this step points at no stage
    { text: 'Breathing out, come up from the right and take the folded legs across to the left, the left foot near the left ear, for the same time.' },
    { text: 'Come back through the centre and up to the lotus in the shoulderstand.', stage: 6 },
    { text: 'Uncross the legs, left foot first, back to the shoulderstand; then cross them the other way and repeat both sides.', stage: 7 },
  ],
  hold: 'Twenty to thirty seconds on each side with normal breathing (p. 104).',
  cautions: [
    { text: 'At first the upper shoulder lifts off the floor; push it down and press that hand firmly against the back, or you will lose the balance and roll over to the side.', page: 104 },
    { text: 'The sideways turn presses on the diaphragm, so the breath comes fast and hard.', page: 104 },
    { text: 'The knee by the ear reaches the floor only after long practice.', page: 104 },
    ...PINDA_LINEAGE,
    ...SHOULDERSTAND_LINEAGE,
  ],
  prepares: ['pindasana-in-sarvangasana', 'parsva-halasana'],
  counter: ['savasana'],
  related: ['spine-twisting'],
  sutras: SUTRAS,
};
