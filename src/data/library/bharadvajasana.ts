import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_TWIST } from './common-twist';

export const bharadvajasana: LibraryAsana = {
  id: 'bharadvajasana',
  family: 'twist',
  english: 'Bharadvaja’s twist',
  steps: [
    { text: 'Sit with both legs stretched straight out in front of you, the hands resting on the thighs.', stage: 0 },
    { text: 'Bend the right knee out to the side and take the right foot back toward the right hip.', stage: 1 },
    { text: 'Bend the left knee too, so that both feet lie round to the right side, by the right hip. Sit with the buttocks on the floor.', stage: 2 },
    { text: 'Turn the trunk about 45 degrees to the left. Straighten the right arm and set the right hand on the outside of the left thigh near the knee, then slide it in under the knee, the palm to the floor. (The figure’s hand stays on the outside of the thigh: reaching under the knee its arm would pass through the thigh.)', stage: 3 },
    { text: 'Breathing out, swing the left arm from the shoulder round behind the back, bend the elbow, and with the left hand take hold of the right upper arm just above the elbow. (The figure’s arm stops short of the other arm and rests on the back of the waist.) Turn the neck to the right and look over the right shoulder.', stage: 4 },
    { text: 'Stay half a minute, breathing deeply.', stage: 4 },
    { text: 'Let go of the arm and turn back to face the front.', stage: 6 },
    { text: 'Straighten the legs, the left first, then the right.', stage: 7 },
    // the figure shows the book's first side only, so this step points at no stage
    { text: 'Do the other side for as long: both feet by the left hip, the trunk turning to the right, the left palm under the right knee and the right hand reaching round the back for the left arm.' },
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
