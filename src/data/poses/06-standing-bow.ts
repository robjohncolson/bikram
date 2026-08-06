import type { Pose } from '../types';

export const standingBow: Pose = {
  id: 'standing-bow',
  order: 6,
  englishName: "Standing Bow Pulling Pose",
  sanskritName: "Dandayamana-Dhanurasana",
  pronunciation: 'dahn-dah-yah-MAH-nah dah-noo-RAH-sah-nah',
  category: 'standing',
  sets: 2,
  timing: "2 sets — 60s then 30s, each leg",
  approxTotalSeconds: 260,
  summary:
    'A one-legged backbend in motion: you grip the inside of one ankle behind you, kick back and up, and reach forward until the body approaches a standing split. It is the great heart opener of the standing series — balance, backbend, and full-body stretch in a single shape.',
  setup: [
    'Stand tall and shift your full weight onto the left leg, locking the knee.',
    'Reach the right arm back and grip the inside of the right ankle — palm facing outward, all five fingers together around the ankle.',
    'Raise the left arm straight up beside the ear, fingertips reaching for the ceiling.',
    'Fix your gaze on one point ahead of you before anything starts to move.',
    'Begin kicking the right leg back and up as the left arm and upper body stretch forward.',
  ],
  cues: [
    'Kick and reach at the same time — the kick backward and the reach forward balance each other like two ends of a drawn bow.',
    'Keep both shoulders squared forward; resist the pull that wants to twist your chest open to the side.',
    'The standing knee stays locked — a solid, unbending lamp post underneath everything.',
    'Let the kick, not gravity, bring your body down; aim the abdomen toward parallel with the floor.',
    'Keep the reaching arm alongside your ear and stretch your fingertips toward the mirror.',
    'If you fall out, step right back in — the posture is built from a thousand attempts.',
  ],
  breath:
    'Steady, continuous breathing through the nose. The deeper the kick, the calmer the breath needs to be — holding it will tip you over.',
  benefits: [
    'Builds powerful balance, patience, and single-pointed concentration.',
    'Strengthens the standing leg from ankle to hip through a long isometric hold.',
    'Deeply stretches the hip flexors, thigh, and shoulder of the kicking side.',
    'Opens the chest and front body — one of the biggest heart openers in the standing series.',
    'Traditionally said to shunt circulation from one side of the body to the other, flushing the heart and lungs with fresh blood.',
    'Improves spinal flexibility and elasticity through a moving backbend.',
  ],
  contraindications: [
    'Knee problems in the standing leg — keep a softer stance and reduce depth rather than forcing the lock.',
    'Shoulder injuries — ease the reach and the grip; do not yank on the held ankle.',
    'Low back sensitivity — emphasize kicking up over pitching down, and come out early if the lower spine pinches.',
  ],
  chakras: [
    {
      id: 'heart',
      why: 'The kicking leg pulls the chest broad and forward into a deep front-body opening — Anahata is stretched wide open at the very center of the bow.',
    },
    {
      id: 'sacral',
      why: 'The kicking hip moves through its fullest extension, stretching the hip flexors and pelvis where Svadhisthana lives.',
    },
    {
      id: 'root',
      why: 'The entire posture stands on one locked, rooted leg — Muladhara is the anchor that lets the rest of the body fly.',
    },
  ],
  muscles: [
    { id: 'quadriceps', action: 'strengthens', emphasis: 'primary', note: 'the locked standing leg carries everything' },
    { id: 'hip-flexors', action: 'stretches', emphasis: 'primary', note: 'the kicking side opens through full hip extension' },
    { id: 'pectorals', action: 'stretches', emphasis: 'primary', note: 'the chest is drawn open like the belly of a bow' },
    { id: 'glutes', action: 'strengthens', emphasis: 'secondary', note: 'drive the kick back and up' },
    { id: 'erector-spinae', action: 'strengthens', emphasis: 'secondary', note: 'support the backbend against gravity' },
    { id: 'deltoids', action: 'strengthens', emphasis: 'secondary', note: 'the forward arm reaches without rest' },
    { id: 'forearms', action: 'strengthens', emphasis: 'secondary', note: 'the grip must hold against a full-power kick' },
    { id: 'ankles-feet', action: 'strengthens', emphasis: 'secondary', note: 'constant micro-corrections keep you upright' },
  ],
  mnemonic:
    'The numeral 6 is one stroke that curls back on itself — at #6 your kicking leg curls up behind you the same way, closing the loop of the bow.',
  sequenceNote:
    'The balancing series continues: where Standing Head to Knee (#5) compressed the body forward, #6 answers it by opening the front body into a backbend. It is the first big heart opener of class, preparing the chest and spine for Balancing Stick and the deeper backbends to come.',
};
