import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { SEATED_TWIST } from './common-twist';

export const ardhaMatsyendrasana: LibraryAsana = {
  id: 'ardha-matsyendrasana',
  family: 'twist',
  english: 'Half lord of the fishes',
  steps: [
    { text: 'Sit with both legs stretched straight out in front of you.', stage: 0 },
    { text: 'Bend the left knee and fold the thigh and calf together, the left foot drawn back to the left buttock. Raise the seat and sit on the left foot, the heel under the left buttock, the foot lying level on its outer edge with the little toe down. (If sitting on the foot is too hard, the book lets you sit on the floor beside it, as the figure does.)', stage: 1 },
    { text: 'Bend the right knee, lift the right leg and set the right foot on the floor by the outside of the left thigh, the right shin upright. Find your balance. Swing the trunk a full right angle round to your right, till the left armpit comes against the outside of the right thigh, over the right knee, the left arm stretching past it.', stage: 2 },
    { text: 'Breathing out, wrap the left arm round the right knee, bend the elbow and bring the left wrist toward the back of the waist; lean the trunk forward so no space is left between armpit and knee. Swing the right arm behind the back and clasp the hands. (The figure’s arm hooks the knee; its hands reach toward each other behind the back without meeting, the wrists about 37 cm apart.) Look over the left shoulder, or turn the head to the right.', stage: 3 },
    { text: 'Stay half a minute to a minute; the breath is short and fast at first and settles with practice.', stage: 3 },
    { text: 'Let go of the clasp and bring the left arm forward past the knee.', stage: 4 },
    { text: 'Release the hands, take the right foot off the floor and straighten the right leg, then the left.', stage: 6 },
    { text: 'Repeat on the other side for as long, sitting on the right foot with the left leg over it.', stage: 9 },
    { text: 'Release the hands, face forward and unfold the legs, the left leg first.', stage: 11 },
  ],
  hold: 'Half a minute to a minute on each side, with normal breathing once the pose is learned (p. 113).',
  cautions: [
    { text: 'The squeezed diaphragm makes the breath short and quick at first; do not be alarmed — with practice it becomes normal.', page: 113 },
    { text: 'If the arm will not yet go round the opposite knee, hold the opposite foot with the arm kept straight; if sitting on the foot is too hard, sit on the floor.', page: 113 },
    ...SEATED_TWIST,
  ],
  prepares: ['marichyasana-ii'],
  counter: ['paschimottanasana'],
  related: ['spine-twisting'],
  sutras: [...SUTRAS],
};
