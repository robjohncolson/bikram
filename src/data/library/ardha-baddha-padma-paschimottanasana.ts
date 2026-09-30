import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_SEAT } from './common-lotus';

export const ardhaBaddhaPadmaPaschimottanasana: LibraryAsana = {
  id: 'ardha-baddha-padma-paschimottanasana',
  family: 'lotus',
  english: 'Bound half-lotus forward bend',
  steps: [
    { text: 'Sit with both legs stretched straight in front of you.', stage: 0 },
    { text: 'Bend the left knee and lift the left foot over the right thigh.', stage: 1 },
    { text: 'Set it on the right thigh, the heel pressing near the navel and the toes stretched out: the half lotus.', stage: 2 },
    { text: 'Take the left arm round behind the back and, breathing out, catch the left big toe. Bring the bent knee closer to the straight leg, reach the right arm forward and hold the right foot, the palm against the sole. Breathe in, stretch the back and look up for a few seconds, keeping the grip.', stage: 3 },
    { text: 'Breathing out, bend forward, the right elbow widening, and rest first the forehead, then the nose, the lips and at last the chin on the right knee. Keep the whole back of the straight leg on the floor and stay, breathing evenly.', stage: 4 },
    { text: 'Breathe in and lift the head and trunk.', stage: 5 },
    { text: 'Release the hands,', stage: 6 },
    { text: 'then lift the left foot off and straighten the leg.', stage: 7 },
    // the other side: the figure only shows the left foot in half lotus, so this step points at no stage
    { text: 'Repeat on the other side, the right foot on the left thigh, for the same time.' },
  ],
  hold: 'Thirty seconds to a minute, breathing evenly, the same on each side (p. 74).',
  cautions: [
    { text: 'If the toe will not come from behind, swing the left shoulder back.', page: 73 },
    { text: 'If you cannot hold the toe from behind at all, hold the straight leg with both hands and follow the same steps.', page: 74 },
    { text: 'At first the knee of the straight leg lifts off the floor; tighten the thigh and let the whole back of the leg rest down.', page: 74 },
    ...EVERY_SEAT,
  ],
  prepares: ['padmasana'],
  counter: ['savasana'],
  related: ['head-to-knee-stretching'],
  sutras: SUTRAS,
};
