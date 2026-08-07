import type { Pose } from '../types';

export const kapalbhati: Pose = {
  id: 'kapalbhati',
  order: 26,
  englishName: 'Blowing in Firm Pose',
  sanskritName: 'Kapalbhati in Vajrasana',
  pronunciation: 'kah-pahl-BAH-tee in vahj-RAHS-ah-nah',
  category: 'breathing',
  sets: 2,
  timing: '2 sets of 60 quick exhalations',
  approxTotalSeconds: 165,
  summary:
    'The closing breathing exercise: kneeling in Vajrasana, sixty sharp abdominal exhalations per set with passive inhales in between. The "skull-shining" breath pumps the last stale air out of the lungs and sends you out of class clear and energized.',
  setup: [
    'Sit on your heels in Vajrasana — spine tall, shoulders relaxed, chest lifted.',
    'Rest the hands on the tops of the knees, arms relaxed but straight.',
    'Take one easy full breath in and out to settle, then begin the rhythm.',
  ],
  cues: [
    'Each exhale is a sharp blow out through the lips, and each one snaps the belly button back toward the spine.',
    'Do not inhale on purpose — release the belly and the in-breath happens by itself.',
    'Only the abdomen moves; chest, shoulders, and face stay completely still and soft.',
    'Keep the rhythm even, like a metronome — one clean beat per exhale, sixty beats per set.',
    'Sit tall the whole time; a slumped spine muffles the pump.',
    'The second set goes faster — same sharpness, quicker tempo.',
  ],
  breath:
    'This exercise is the breath: sixty forceful exhalations per set, driven entirely by the abdominal wall, with passive automatic inhales between them. The exhale is the only active phase.',
  benefits: [
    'Strengthens the abdominal wall and trains the diaphragm through rapid contract-and-release cycles.',
    'Forcefully empties the residual stale air that quiet breathing never reaches, exchanging it for fresh oxygen.',
    'The belly-pumping action massages the digestive organs and is traditionally said to improve digestion and elimination.',
    'Traditionally said to "shine the skull" — clearing the head and leaving the mind bright, which is exactly how it lands after ninety minutes of practice.',
    'Closes the class energized rather than depleted, converting the heat and effort into alertness.',
  ],
  contraindications: [
    'Pregnancy — skip forceful abdominal pumping; breathe normally in the same seated position instead.',
    'Uncontrolled high blood pressure or heart conditions — take a slower, gentler pace or sit the exercise out.',
    'Recent abdominal surgery or hernia — avoid until fully healed.',
    'If you feel light-headed or tingly, pause and breathe normally — hyperventilation passes quickly at rest.',
  ],
  chakras: [
    {
      id: 'solar-plexus',
      why: 'Sixty belly-snaps per set is a direct bellows on Manipura — the abdominal pump physically works the fire center that governs energy and digestion.',
    },
    {
      id: 'third-eye',
      why: 'Kapal means skull and bhati means shining — the practice is named for the clear, bright-headed state it produces, traditionally located at Ajna behind the brow.',
    },
  ],
  muscles: [
    { id: 'abdominals', action: 'strengthens', emphasis: 'primary', note: 'every exhale is a sharp abdominal contraction — 120 reps per class' },
    { id: 'diaphragm', action: 'strengthens', emphasis: 'primary', note: 'trained through rapid recoil on each passive inhale' },
    { id: 'obliques', action: 'strengthens', emphasis: 'secondary', note: 'assist each snap of the belly toward the spine' },
    { id: 'ankles-feet', action: 'stretches', emphasis: 'secondary', note: 'the tops of the ankles and feet lengthen under you in Vajrasana' },
  ],
  mnemonic:
    'The alphabet has 26 letters and class has 26 items: Pranayama is the A, Kapalbhati is the Z. The last word of the class is not spoken — it is blown out.',
  sequenceNote:
    'Class ends the way it began — with breath. The opening exercise filled the lungs slowly to build heat; the closing one empties them sharply to release it. After the final twist has wrung the spine neutral, Kapalbhati expels the last stale air of the practice and hands you to final Savasana clean, clear, and awake.',
};
