import type { LibraryAsana } from '../types';
import { SUTRAS } from './common';
import { EVERY_STANDING } from './common-standing';

export const utthitaTrikonasana: LibraryAsana = {
  id: 'utthita-trikonasana',
  family: 'standing',
  english: 'Extended triangle',
  steps: [
    { text: 'Stand in Tadasana.', stage: 0 },
    { text: 'On a deep inhalation, jump the feet about a metre apart and raise the arms out to the sides at shoulder height, palms down, level with the floor.', stage: 1 },
    { text: 'Turn the right foot out a full quarter turn and the left foot in a little, the left leg firm from its inner side and the knee tight.', stage: 2 },
    { text: 'Exhaling, extend the trunk sideways over the right leg and take the right hand down toward the right ankle — the palm flat on the floor beyond the foot if you can. Stretch the left arm up in line with the right shoulder and look at the left thumb.', stage: 3 },
    { text: 'Hips, rear of the legs and rear of the ribcage stay in one plane; lock the right knee with the kneecap drawn up and facing the toes.', stage: 3 },
    { text: 'Inhale back up with the arms level, turn the left foot out and the right foot in a little, and extend the same way over the left leg.', stage: 4 },
    { text: 'Hold the left side as long as the right.', stage: 5 },
    { text: 'Inhale up to the wide stance, then exhale and jump the feet back together into Tadasana.', stage: 6 },
  ],
  hold: 'Half a minute to a minute on each side, breathing deeply and evenly (p. 42).',
  cautions: [
    { text: 'Keep the knee of the front leg locked, its kneecap pulled up and facing the same way as the toes.', page: 42 },
    { text: 'Hold the second side exactly as long as the first.', page: 42 },
    ...EVERY_STANDING,
  ],
  prepares: ['tadasana'],
  counter: ['uttanasana'],
  related: ['triangle'],
  sutras: [...SUTRAS],
};
