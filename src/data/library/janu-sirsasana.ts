import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_FOLD, FOLD_MENSTRUATION, FOLD_PREGNANCY, PREPARES_PASCHIMOTTANASANA } from './common-folds';

export const januSirsasana: LibraryAsana = {
  id: 'janu-sirsasana',
  family: 'seated',
  english: 'Head to knee',
  steps: [
    { text: 'Sit with both legs stretched straight in front of you.', stage: 0 },
    { text: 'Bend the left knee out to the side, the outer thigh and calf resting on the mat, and bring the left heel in against the inner left thigh near the perineum, the big toe touching the inner right thigh. Ease the knee back so the legs open wider than a right angle.', stage: 1 },
    { text: 'Reach forward and hold the right foot: the toes at first, then the sole, then the heel; in time the arms go past it and one hand takes the other wrist beyond the foot. Keep the right knee straight and the back of it on the mat.', stage: 2 },
    { text: 'Breathing out, bend the elbows out wide and carry the trunk forward along the right leg, the chest against the thigh; rest the forehead, then the nose, the lips and at last the chin beyond the right knee. Do not let the right leg roll outward.', stage: 3 },
    { text: 'Stay, breathing deeply.', stage: 3 },
    { text: 'Breathing in, lift the head and trunk; let go of the foot and sit up, the left heel still in.', stage: 4 },
    { text: 'Straighten the left leg and bend the right the same way, its heel in at the perineum.', stage: 5 },
    { text: 'Fold down the left leg exactly as on the first side, and stay for the same time.', stage: 6 },
    { text: 'Come up, straighten the right leg and sit in the staff.', stage: 7 },
  ],
  hold: 'Half a minute to a minute on each side, breathing deeply; the book also allows holding the breath out after each exhalation (p. 72).',
  cautions: [
    { text: 'Keep the angle between the legs wider than a right angle; do not leave the bent knee square to the straight leg, but draw it back so the body stretches away from it.', page: 72 },
    { text: 'At first the straight leg’s foot tips outward; do not let the leg roll. Keep that knee tight and its back on the floor throughout.', page: 72 },
    PREPARES_PASCHIMOTTANASANA,
    FOLD_PREGNANCY,
    FOLD_MENSTRUATION,
    ...EVERY_FOLD,
  ],
  prepares: ['maha-mudra'],
  counter: ['savasana'],
  related: ['head-to-knee-stretching'],
  sutras: [...SUTRAS],
};
