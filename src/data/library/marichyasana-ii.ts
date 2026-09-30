import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { SEATED_TWIST } from './common-twist';

export const marichyasanaII: LibraryAsana = {
  id: 'marichyasana-ii',
  family: 'twist',
  english: 'Marichi’s seated twist',
  steps: [
    { text: 'Sit with both legs stretched straight out in front of you.', stage: 0 },
    { text: 'Bend the left knee and stand the left foot flat on the floor, sole and heel down, the shin upright and the heel close to the seat, the inner edge of the foot against the inner right thigh.', stage: 1 },
    { text: 'Breathing out, swing the spine round to your left through about a right angle, the chest passing the bent thigh, and bring the right arm over the left thigh. Take the right shoulder beyond the left knee and stretch the right arm forward, turning still further. Take two breaths.', stage: 2 },
    { text: 'Breathing out, wrap the right arm round the left knee, bend the elbow and bring the right wrist to the back of the waist; breathe in. Breathing out again, swing the left arm behind the back and clasp one hand with the other. (The figure’s arm hooks round the knee and its hands reach toward each other behind the back without meeting.)', stage: 3 },
    { text: 'Keep the straight right leg firm on the floor, the thigh and calf tight. Stay half a minute to a minute, breathing normally, looking at the right toes or over the shoulder.', stage: 3 },
    { text: 'Unclasp the hands and turn the trunk back to the front.', stage: 5 },
    { text: 'Stretch the left leg out beside the right.', stage: 6 },
    // the figure shows the book's first side only, so this step points at no stage
    { text: 'Repeat with the right knee bent, turning to the right, the left arm round the right knee, for as long.' },
  ],
  hold: 'Half a minute to a minute on each side, breathing normally (p. 111).',
  cautions: [
    { text: 'At first the trunk will not turn far sideways; with practice the armpit comes to rest against the bent knee.', page: 110 },
    { text: 'The straight leg will not stay down at first: tighten the thigh so the kneecap draws up, and the calf, and the leg stays firm and long on the floor.', page: 110 },
    ...SEATED_TWIST,
  ],
  prepares: ['marichyasana-i', 'bharadvajasana'],
  counter: ['ardha-matsyendrasana'],
  related: ['spine-twisting'],
  sutras: [...SUTRAS],
};
