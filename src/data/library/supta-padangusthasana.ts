import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_TWIST } from './common-twist';

export const suptaPadangusthasana: LibraryAsana = {
  id: 'supta-padangusthasana',
  family: 'twist',
  english: 'Reclining big-toe hold',
  steps: [
    { text: 'Lie flat on your back, both legs stretched, the knees tight. Breathing in, lift the left leg until it stands straight up. The right leg stays long on the floor, the right hand resting on the right thigh.', stage: 1 },
    { text: 'Reach up with the left arm and take hold of the left big toe between the thumb and the first two fingers, and take three or four deep breaths. (The figure’s hand holds the shin, its fingertips about 28 cm from the toe here and 17 cm away with the trunk lifted; take the toe if you can, the shin if you cannot.)', stage: 2 },
    { text: 'Breathing out, lift the head and trunk off the floor, bend the left elbow and draw the straight leg toward you until the chin comes to the left knee. Stay about twenty seconds, breathing normally, the right leg fully stretched along the floor.', stage: 3 },
    { text: 'Breathing in, lay the head and trunk back down and let the leg return to the vertical.', stage: 4 },
    { text: 'Breathing out, let go of the toe and lower the left leg beside the right, the left hand coming to the left thigh.', stage: 6 },
    { text: 'After a few deep breaths, raise the right leg, take the toe and repeat the lift of the head and trunk for the same time.', stage: 9 },
    { text: 'Settle the head and trunk onto the mat again.', stage: 10 },
    { text: 'Release the right foot.', stage: 11 },
    { text: 'Lower the right leg beside the left.' },
  ],
  hold: 'Three or four deep breaths holding the toe, then about twenty seconds with the chin at the knee (p. 108).',
  cautions: [
    { text: 'Draw the raised leg toward the head without letting its knee bend, and keep the other leg stretched fully along the floor all the while.', page: 108 },
    ...EVERY_TWIST,
  ],
  prepares: ['parsvaika-pada-sarvangasana'],
  counter: ['savasana'],
  related: ['wind-removing'],
  sutras: [...SUTRAS],
};
