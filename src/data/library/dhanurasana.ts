import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_BACKBEND } from './common-backbend';

export const dhanurasana: LibraryAsana = {
  id: 'dhanurasana',
  family: 'backbend',
  english: 'Bow',
  steps: [
    { text: 'Lie on your front at full length, face down.', stage: 0 },
    { text: 'Breathing out, bend the knees and reach the arms back: the left hand takes the left ankle, the right hand the right. Stay for two breaths.', stage: 1 },
    { text: 'Empty the lungs, then draw the legs up so the knees leave the floor while the chest rises with them. The arms are the string that bends the body into a bow.', stage: 2 },
    { text: 'Take the head as far back as it will go. Neither the ribs nor the pelvic bones touch the floor: the belly alone bears the weight.', stage: 2 },
    { text: 'Keep the knees apart while you lift, or the legs will not rise far; once you are fully up, bring the thighs, knees and ankles together. The belly is stretched, so the breath runs quick; let it.', stage: 2 },
    { text: 'Breathing out, let go of the ankles.', stage: 3 },
    { text: 'Stretch the legs long, lower the head and legs to the floor and rest.', stage: 4 },
  ],
  hold: 'From twenty seconds up to a minute, as your capacity allows (p. 54).',
  cautions: [
    { text: 'Rest neither the ribs nor the pelvic bones on the floor; only the abdomen takes the weight.', page: 54 },
    { text: 'Do not join the knees on the way up, or the legs will not lift high enough; bring them together only once the full stretch is reached.', page: 54 },
    { text: 'The stretched abdomen quickens the breath; the book says not to be troubled by it.', page: 54 },
    ...EVERY_BACKBEND,
  ],
  prepares: ['salabhasana'],
  counter: ['savasana'],
  related: ['bow'],
  sutras: [...SUTRAS],
};
