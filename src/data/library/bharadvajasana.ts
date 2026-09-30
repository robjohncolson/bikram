import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_TWIST } from './common-twist';

export const bharadvajasana: LibraryAsana = {
  id: 'bharadvajasana',
  family: 'twist',
  english: 'Bharadvaja’s twist',
  steps: [
    { text: 'Sit with both legs stretched straight out in front of you.', stage: 0 },
    { text: 'Bend the right knee out to the side and take the right foot back toward the right hip.', stage: 1 },
    { text: 'Bend the left knee too, so that both feet lie round to the right side, by the right hip. Sit with the buttocks on the floor.', stage: 2 },
    { text: 'Turn the trunk about 45 degrees to the left. Straighten the right arm and set the right hand on the outside of the left thigh near the knee, then slide it in under the knee, the palm to the floor. (The figure’s hand stays on the outside of the thigh: reaching under the knee its arm would pass through the thigh.)', stage: 2 },
    { text: 'Breathing out, swing the left arm from the shoulder round behind the back, bend the elbow, and with the left hand take hold of the right upper arm just above the elbow. (The figure’s hand stays behind the waist, its fingertips about 33 cm from the opposite elbow.) Turn the neck to the right and look over the right shoulder. Stay half a minute with deep breathing.', stage: 3 },
    { text: 'Let go of the arm and turn back to face the front.', stage: 4 },
    { text: 'Straighten the legs, the left first, then the right.', stage: 6 },
    { text: 'Do the other side for as long: both feet by the left hip, the trunk turning to the right, the left palm under the right knee and the right hand reaching round the back for the left arm.', stage: 9 },
    { text: 'Release the arm, turn forward and straighten the legs, the right before the left.', stage: 11 },
  ],
  hold: 'Half a minute on each side, breathing deeply (p. 109).',
  cautions: [
    { text: 'The book offers this twist to backs too stiff for the other lateral twists, which such backs find very hard; it is the one to begin with.', page: 109 },
    ...EVERY_TWIST,
  ],
  prepares: ['dandasana', 'supta-virasana'],
  counter: ['marichyasana-ii'],
  related: ['spine-twisting'],
  sutras: [...SUTRAS],
};
