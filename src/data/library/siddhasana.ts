import type { LibraryAsana } from '../types';
import { SUTRAS, SUTRA_48 } from './common';
import { EVERY_SEAT } from './common-lotus';

export const siddhasana: LibraryAsana = {
  id: 'siddhasana',
  family: 'lotus',
  english: 'The adept’s seat',
  steps: [
    { text: 'Sit on the blanket with the legs stretched straight in front of you.', stage: 0 },
    { text: 'Bend the left knee and, holding the foot, draw the left heel in close to the perineum, the sole against the right thigh.', stage: 1 },
    { text: 'Bend the right knee and bring the right foot over the left ankle.', stage: 2 },
    { text: 'Set the right heel just above the left, against the pubic bone, and tuck the right sole in between the left thigh and calf. Both knees rest on the floor. Do not sit back on the heels. Stretch the arms and rest the backs of the hands on the knees, palms up, thumb and forefinger joined. Stay, the back, neck and head upright and the gaze drawn in, as if resting on the tip of the nose.', stage: 3 },
    { text: 'To come out, lift the right foot off.', stage: 4 },
    { text: 'Then release the left leg and stretch both legs out.', stage: 6 },
    { text: 'Rest, then sit again for the same time with the legs the other way: the right heel in first.', stage: 9 },
    { text: 'Lift the left foot off.', stage: 10 },
    { text: 'Release the right heel and stretch both legs out.' },
  ],
  hold: 'As long as you can, the back, neck and head erect (p. 61).',
  cautions: [
    { text: 'Keep the weight off the heels: the seat is on the floor, not on the feet.', page: 61 },
    { text: 'Hold the back, neck and head erect throughout.', page: 61 },
    { text: 'Change the legs and sit for the same length of time the other way.', page: 61 },
    ...EVERY_SEAT,
  ],
  prepares: ['dandasana', 'fixed-firm'],
  counter: ['savasana'],
  related: ['fixed-firm'],
  sutras: [...SUTRAS, SUTRA_48],
};
