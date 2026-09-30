import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_FOLD } from './common-folds';

export const mahaMudra: LibraryAsana = {
  id: 'maha-mudra',
  family: 'seated',
  english: 'Great seal',
  steps: [
    { text: 'Sit with both legs stretched straight in front of you.', stage: 0 },
    { text: 'Bend the left knee out to the left, the outer thigh and calf on the mat, the left heel in against the inner left thigh near the perineum and the big toe touching the inner right thigh. The book sets the two legs at a right angle.', stage: 1 },
    { text: 'Reach both arms forward and catch the right big toe, thumbs and first fingers curled round it, the spine long.', stage: 2 },
    { text: 'Lower the head until the chin rests in the small hollow at the top of the breastbone, between the collarbones. Keep the spine fully extended and do not let the right leg roll outward.', stage: 3 },
    { text: 'Breathe in fully and draw the whole abdomen, from the anus up to the diaphragm, back toward the spine and up. Let the grip go and breathe out; then breathe in again and hold the breath with the abdomen held the same way.', stage: 3 },
    { text: 'Release the abdomen, breathe out, lift the head, let go of the toe and sit up, the left heel still in.', stage: 4 },
    { text: 'Straighten the left leg and bend the right the same way.', stage: 5 },
    { text: 'Take the left big toe and seal as on the first side, for the same length of time.', stage: 6 },
    { text: 'Come up, straighten the right leg and sit in the staff.', stage: 7 },
  ],
  hold: 'One to three minutes in the seal on each side, the same on both (p. 71).',
  cautions: [
    { text: 'Here the technique itself asks for the held breath with the abdominal grip; the general rule of never holding the breath in a pose gives way to the instructions of each pose, which the book says to follow.', page: 39 },
    { text: 'Hold the whole spine long, and keep the straight leg from tipping out to its side.', page: 71 },
    { text: 'The bent leg lies out at a right angle to the straight one, its heel in at the perineum.', page: 70 },
    ...EVERY_FOLD.slice(1),
  ],
  counter: ['savasana'],
  related: ['head-to-knee-stretching'],
  sutras: [...SUTRAS],
};
