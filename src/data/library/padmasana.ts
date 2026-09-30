import type { LibraryAsana } from '../types';
import { SUTRAS, SUTRA_48 } from './common';
import { LOTUS_LINEAGE } from './common-lotus';

export const padmasana: LibraryAsana = {
  id: 'padmasana',
  family: 'lotus',
  english: 'Lotus',
  steps: [
    { text: 'Sit on the blanket with both legs stretched out straight in front of you.', stage: 0 },
    { text: 'Bend the right knee, take the right foot in the hands and lift it toward the left thigh.', stage: 1 },
    { text: 'Set it down at the root of the left thigh, sole turned up, the right heel close to the navel.', stage: 2 },
    { text: 'Bend the left knee and bring the left foot up and over the right shin.', stage: 3 },
    { text: 'Set it down at the root of the right thigh, sole up, heel toward the navel. Both knees rest on the floor.', stage: 4 },
    { text: 'Sit tall, the spine upright from its base to the neck. Stretch the arms and rest the wrists on the knees, the tip of each forefinger touching the thumb.', stage: 4 },
    { text: 'To come out, lift the left foot off first.', stage: 5 },
    { text: 'Then lift the right foot off and stretch the legs out.', stage: 7 },
    // the other side: the figure only shows the right-foot-first crossing, so this step points at no stage
    { text: 'Cross the legs the other way, the left foot first, and sit for the same length of time.' },
  ],
  hold: 'The book gives no clock: once the knees have eased, as long as you can sit at rest in it (p. 67).',
  cautions: LOTUS_LINEAGE,
  prepares: ['siddhasana'],
  counter: ['savasana'],
  related: ['fixed-firm'],
  sutras: [...SUTRAS, SUTRA_48],
};
