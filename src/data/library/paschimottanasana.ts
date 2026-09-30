import type { LibraryAsana } from '../types';
import { SUTRAS, SUTRA_48 } from './common';
import { EVERY_FOLD, FOLD_MENSTRUATION, FOLD_PREGNANCY } from './common-folds';

export const paschimottanasana: LibraryAsana = {
  id: 'paschimottanasana',
  family: 'seated',
  english: 'Seated forward fold',
  steps: [
    { text: 'Sit with both legs straight out in front, feet together, palms on the mat beside the hips. Take a few breaths.', stage: 0 },
    { text: 'Breathing out, reach forward and take the big toes, each between the thumb and the first two fingers.', stage: 1 },
    { text: 'Lengthen the spine and draw the back in so it hollows rather than humps; the bend starts low, from the pelvis, and the arms reach from the shoulders.', stage: 1 },
    { text: 'Breathing out, bend the elbows out to the sides and use them to draw the trunk forward until the forehead meets the knees.', stage: 2 },
    { text: 'As it eases, take hold of the soles and let the trunk lengthen along the legs, the head travelling past the knees until the chin rests on the shins. Keep the backs of the knees down on the mat.', stage: 3 },
    { text: 'Stay, breathing evenly, in whichever stage you have reached.', stage: 3 },
    { text: 'Breathing in, lift the head from the legs.', stage: 4 },
    { text: 'Let go of the feet and sit up with the legs long.', stage: 5 },
  ],
  hold: 'From one to five minutes in whichever stage you can reach, the breath even (p. 81).',
  cautions: [
    { text: 'At first the back rounds into a hump, because the stretch is being taken only from the shoulders. Learn to bend from the pelvis and to extend the arms from the shoulders, and the back flattens.', page: 79 },
    { text: 'In the early stages the knees come up off the floor. Firm the muscles at the backs of the thighs and draw the trunk forward, and the backs of the knees settle onto the mat.', page: 81 },
    { text: 'The book finds that many cannot grip the feet well here at first, and gives janu sirsasana, trianga mukhaikapada paschimottanasana and marichyasana I (with the half-lotus fold) as the way in.', page: 77 },
    FOLD_PREGNANCY,
    FOLD_MENSTRUATION,
    ...EVERY_FOLD,
  ],
  prepares: ['janu-sirsasana', 'trianga-mukhaikapada-paschimottanasana', 'marichyasana-i'],
  counter: ['savasana'],
  related: ['head-to-knee-stretching'],
  sutras: [...SUTRAS, SUTRA_48],
};
