import type { Pose } from '../types';

export const savasana: Pose = {
  id: 'savasana',
  order: 13,
  englishName: "Dead Body Pose",
  sanskritName: "Savasana",
  pronunciation: 'shah-VAHS-ah-nah',
  category: 'floor',
  sets: 1,
  timing: "2 minutes of complete stillness",
  approxTotalSeconds: 120,
  summary:
    'Two full minutes flat on the back, completely still, eyes softly open — the hinge of class between the standing and floor series. It looks like nothing; it is the hardest skill in the room: total, conscious relaxation.',
  setup: [
    'Lie flat on your back with the legs extended along the floor.',
    'Let the heels touch lightly and the feet fall open to the sides.',
    'Rest the arms alongside the body, palms turned up, fingers softly curled.',
    'Keep the eyes gently open, gaze resting on the ceiling.',
    'Release every muscle you can find — and then stop moving entirely.',
  ],
  cues: [
    'Stillness is the posture. No fidgeting, no wiping sweat, no adjusting — every movement restarts the clock in your nervous system.',
    'Eyes stay open and soft: this is awake stillness, not sleep.',
    'Give the breath back to the body — for the first time in class, no counting and no control.',
    'Let the floor take your full weight; scan for gripping in the jaw, shoulders, hands, and hips, and let each one go.',
    'Feel the heartbeat slow on its own — that descent is the work happening.',
    'When the mind replays the last posture or rehearses the next, return to the simple feeling of breath at the nostrils.',
  ],
  breath:
    'Completely natural, unmanaged breathing. After twelve postures of directed breath, you do nothing at all — just watch it slow down by itself.',
  benefits: [
    'Lets the heart rate and blood pressure settle after the exertion of the standing series.',
    'Teaches conscious relaxation — deliberately releasing muscles is a learnable skill, and this is where it is learned.',
    'Shifts the nervous system toward its rest-and-restore state before the floor series begins.',
    'With the body level and still, circulation redistributes freely; traditionally said to let the benefits of the preceding postures absorb.',
    'Trains meditative stillness of mind — two minutes of doing nothing without checking out.',
  ],
  contraindications: [
    'Pregnancy from the second trimester on — lie on the left side instead of flat on the back.',
    'Low-back discomfort when lying flat — place the feet on the floor with the knees bent, or a rolled towel under the knees.',
    'Dizziness or reflux when fully supine — elevate the head and shoulders slightly.',
  ],
  chakras: [
    {
      id: 'crown',
      why: 'All effort dissolves into bare awareness — the body abandoned to gravity, the self quiet — which is precisely the territory of Sahasrara.',
    },
    {
      id: 'third-eye',
      why: 'With the body silenced, attention withdraws from the senses and rests inward behind the soft open gaze, gathering at Ajna.',
    },
  ],
  muscles: [
    { id: 'erector-spinae', action: 'stretches', emphasis: 'primary', note: 'the spine decompresses long and neutral along the floor' },
    { id: 'trapezius', action: 'stretches', emphasis: 'secondary', note: 'the shoulders release their grip and sink toward the ground' },
    { id: 'neck', action: 'stretches', emphasis: 'secondary', note: 'the neck rests neutral, tension draining after the standing series' },
    { id: 'hip-flexors', action: 'stretches', emphasis: 'secondary', note: 'legs extended and rolled open, the hip line finally goes slack' },
  ],
  mnemonic:
    'After a dozen postures on your feet, #13 lays you down flat. Unlucky 13? In this room it is the luckiest number in class — two whole minutes of doing absolutely nothing.',
  sequenceNote:
    'This is the hinge of the 26: the standing series ends, the floor series begins, and the transition is two minutes of stillness — the first and by far the longest savasana. It teaches the skill the rest of class runs on, because from here a 20-second savasana follows every floor posture.',
};
