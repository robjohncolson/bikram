import type { LibraryAsana } from '../types';
import { SUTRAS, SUTRA_48 } from './common';
import { LOTUS_LINEAGE } from './common-lotus';

export const padmasana: LibraryAsana = {
  id: 'padmasana',
  family: 'lotus',
  english: 'Lotus',
  steps: [
    { text: 'Sit on the blanket with both legs stretched out straight in front of you. Bend the right knee, take the right foot in the hands and lift it toward the left thigh.', stage: 1 },
    { text: 'Set it down at the root of the left thigh, sole turned up, the right heel close to the navel. Bend the left knee and bring the left foot up and over the right shin.', stage: 2 },
    { text: 'Set it down at the root of the right thigh, sole up, heel toward the navel. Both knees rest on the floor. Sit tall, the spine upright from its base to the neck. Stretch the arms and rest the wrists on the knees, the tip of each forefinger touching the thumb.', stage: 3 },
    { text: 'To come out, lift the left foot off first.', stage: 4 },
    { text: 'Then lift the right foot off and stretch the legs out.', stage: 6 },
    { text: 'Cross the legs the other way, the left foot first, and sit for the same length of time.', stage: 9 },
    { text: 'Lift the right foot off.', stage: 10 },
    { text: 'Lift the left foot off.', stage: 11 },
    { text: 'Stretch both legs out to rest.' },
  ],
  hold: 'The book gives no clock: once the knees have eased, as long as you can sit at rest in it (p. 67).',
  cautions: LOTUS_LINEAGE,
  prepares: ['dandasana', 'siddhasana'],
  counter: ['parvatasana', 'savasana'],
  related: ['fixed-firm'],
  sutras: [...SUTRAS, SUTRA_48],
};
