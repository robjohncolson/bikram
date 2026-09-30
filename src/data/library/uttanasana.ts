import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING } from './common-standing';

export const uttanasana: LibraryAsana = {
  id: 'uttanasana',
  family: 'standing',
  english: 'Intense forward stretch',
  steps: [
    { text: 'Stand in Tadasana with the knees tight.', stage: 0 },
    { text: 'Breathing out, bend forward and touch the fingers to the floor, then lay the palms down beside the feet, behind the heels, the knees never bending. (The figure’s arms are shorter than the book asks: its hands hang toward the floor without reaching it.)', stage: 1 },
    { text: 'Try to lift the head and lengthen the spine. Shift the hips slightly forward so the legs stand perpendicular to the floor, and take two deep breaths.', stage: 1 },
    { text: 'Breathing out, bring the trunk nearer the legs and rest the head on the knees. Keep the kneecaps pulled well up.', stage: 2 },
    { text: 'Stay, breathing deeply and evenly.', stage: 2 },
    { text: 'Breathing in, raise the head off the knees while the palms stay on the floor (the figure’s hands hang toward it), and take two breaths.', stage: 3 },
    { text: 'Take a deep breath in, lift the hands and come up into Tadasana.', stage: 4 },
  ],
  hold: 'A minute with the head on the knees, breathing deeply and evenly; the book finds a stay of two minutes or more quietens the mind (p. 52).',
  cautions: [
    { text: 'Never let the knees bend or the grip at them slacken; keep the kneecaps drawn up.', page: 52 },
    { text: 'With dizziness or high blood pressure, the book places this pose before and after the headstand and shoulderstand.', page: 39 },
    { text: 'If the head feels heavy or flushed in the headstand, do this pose first.', page: 52 },
    { text: 'Practice is set aside during menstruation, but when the flow is heavier than usual the book names this among the poses that help.', page: 40 },
    ...EVERY_STANDING,
  ],
  prepares: ['padangusthasana', 'padahastasana'],
  counter: ['tadasana'],
  related: ['half-moon'],
  sutras: [...SUTRAS],
};
