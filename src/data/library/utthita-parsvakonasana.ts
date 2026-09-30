import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING } from './common-standing';

export const utthitaParsvakonasana: LibraryAsana = {
  id: 'utthita-parsvakonasana',
  family: 'standing',
  english: 'Extended side angle',
  steps: [
    { text: 'Stand in Tadasana.', stage: 0 },
    { text: 'Inhale deeply and jump the feet wide apart — wider than for the triangle — raising the arms out to the sides, palms down.', stage: 1 },
    { text: 'Exhaling slowly, turn the right foot out a quarter turn and the left foot in a little, the left leg straight and tight. Bend the right knee until the thigh is level with the floor and the shin upright, a right angle between them.', stage: 2 },
    { text: 'Take the trunk down over the right thigh until the right armpit covers the outside of the knee, and set the right palm on the floor beside the right foot. Stretch the left arm over the left ear and keep the head up.', stage: 3 },
    { text: 'Firm the loins and stretch the backs of the legs. Move the chest up and back until chest, hips and legs lie in one line, and let the whole back of the body — the spine above all — lengthen.', stage: 3 },
    { text: 'Inhale, lift the palm, straighten the right leg and raise the arms; then turn the feet and bend the left knee for the other side.', stage: 4 },
    { text: 'Come down over the left thigh the same way, the left palm on the floor and the right arm over the ear.', stage: 5 },
    { text: 'Inhale up to the wide stance, then exhale and jump back into Tadasana.', stage: 6 },
  ],
  hold: 'Half a minute to a minute on each side, breathing deeply and evenly (p. 43).',
  cautions: [
    { text: 'Bend the front knee only until thigh and calf make a right angle, the thigh level with the floor.', page: 43 },
    { text: 'To bring the chest, hips and legs into one line, move the chest up and back rather than letting it hang toward the floor.', page: 43 },
    ...EVERY_STANDING,
  ],
  prepares: ['utthita-trikonasana'],
  counter: ['uttanasana'],
  related: ['triangle'],
  sutras: [...SUTRAS],
};
