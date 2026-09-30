import type { LibraryAsana } from '../types';
import { SUTRAS, SUTRA_48 } from './common';
import { BOUND_ANGLE_LINEAGE } from './common-seated';

export const baddhaKonasana: LibraryAsana = {
  id: 'baddha-konasana',
  family: 'seated',
  english: 'Bound angle',
  steps: [
    { text: 'Sit with the legs stretched straight out in front of you, the hands resting on the thighs.', stage: 0 },
    { text: 'Bend the knees out to the sides and draw the feet in toward the trunk.', stage: 3 },
    { text: 'Bring the soles and heels together and take hold of the feet near the toes.', stage: 4 },
    { text: 'Draw the heels in to the perineum, the outer edges of the feet on the floor, and let the thighs open until the knees come down to the floor. Lace the fingers round the feet and hold them firmly.', stage: 5 },
    { text: 'Lift the spine; let the gaze rest level in front of you, or down the line of the nose to its tip. Stay as long as you can.', stage: 5 },
    { text: 'Press the elbows down on the thighs and, breathing out, fold forward, taking the head, then the nose, then the chin down to the floor. Stay half a minute to a minute, breathing normally.', stage: 6 },
    { text: 'Breathing in, raise the trunk and sit up tall again.', stage: 7 },
    { text: 'To come out, bring the knees up, still holding the feet.', stage: 8 },
    { text: 'Let go of the feet, the knees still bent; then stretch the legs out straight.', stage: 9 },
  ],
  hold: 'Upright, as long as you can; folded forward, thirty to sixty seconds, the breath normal (p. 65).',
  cautions: BOUND_ANGLE_LINEAGE,
  prepares: ['dandasana'],
  counter: ['paschimottanasana'],
  sutras: [
    ...SUTRAS,
    // the book recommends it, with the lotus and the hero, for breath practice and meditation (p. 66)
    SUTRA_48,
  ],
};
