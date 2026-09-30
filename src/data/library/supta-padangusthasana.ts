import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_TWIST } from './common-twist';

export const suptaPadangusthasana: LibraryAsana = {
  id: 'supta-padangusthasana',
  family: 'twist',
  english: 'Reclining big-toe hold',
  steps: [
    { text: 'Lie flat on your back, both legs stretched, the knees tight.', stage: 0 },
    { text: 'Breathing in, lift the left leg until it stands straight up. The right leg stays long on the floor, the right hand resting on the right thigh.', stage: 1 },
    { text: 'Reach up with the left arm and take hold of the left big toe between the thumb and the first two fingers, and take three or four deep breaths. (The figure’s arm is shorter than its leg, so it holds the shin; take the toe if you can, the shin if you cannot.)', stage: 2 },
    { text: 'Breathing out, lift the head and trunk off the floor, bend the left elbow and draw the straight leg toward you until the chin comes to the left knee. Stay about twenty seconds, breathing normally, the right leg fully stretched along the floor.', stage: 3 },
    { text: 'Breathing in, lay the head and trunk back down and let the leg return to the vertical.', stage: 4 },
    { text: 'Breathing out, let go of the toe and lower the left leg beside the right, the left hand coming to the left thigh.', stage: 5 },
    // the figure shows the book's left-leg-first side only, so this step points at no stage
    { text: 'After a few deep breaths, do the same with the right leg.' },
  ],
  hold: 'Three or four deep breaths holding the toe, then about twenty seconds with the chin at the knee (p. 108).',
  cautions: [
    { text: 'Draw the raised leg toward the head without letting its knee bend, and keep the other leg stretched fully along the floor all the while.', page: 108 },
    ...EVERY_TWIST,
  ],
  prepares: ['bharadvajasana'],
  counter: ['savasana'],
  related: ['wind-removing'],
  sutras: [...SUTRAS],
};
