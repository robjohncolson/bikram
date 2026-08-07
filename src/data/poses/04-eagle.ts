import type { Pose } from '../types';

export const eagle: Pose = {
  id: 'eagle',
  order: 4,
  englishName: "Eagle Pose",
  sanskritName: "Garudasana",
  pronunciation: 'gah-roo-DAHS-ah-nah',
  category: 'standing',
  sets: 2,
  timing: "2 sets, each side — ~10s holds plus the wrap",
  approxTotalSeconds: 120,
  summary:
    'Arms and legs each wrapped and intertwined while sitting low on one bent leg — the whole body braided toward its midline. Traditionally said to open all fourteen of the body’s largest joints, it is equal parts deep compression and one-pointed balance.',
  setup: [
    'Swing the arms out wide, then cross the right arm under the left at the elbows.',
    'Twist the forearms around each other and press the palms flat together in front of the face, fingers pointing up below the nose.',
    'Pull the elbows down and sit the hips low, as if into a chair.',
    'Shift the weight into the left leg, lift the right leg high over the left thigh, and hook the right foot behind the left calf.',
    'On the second side, everything mirrors: left arm under, left leg on top.',
  ],
  cues: [
    'Sit lower than feels reasonable first — a deep sit makes the leg wrap possible, not the other way around.',
    'Pull the crossed elbows down toward the waist while the fingers lift, so the stretch travels between the shoulder blades.',
    'Squeeze everything toward the midline: forearms twisted, thighs sealed, no daylight anywhere between the limbs.',
    'Keep the spine upright and the shoulders stacked over the hips — resist the pull to pitch forward.',
    'Fix the eyes on one point straight ahead; the posture balances on the gaze as much as the standing foot.',
    'Wobbling is part of the work — grip the floor with the standing foot, keep breathing, and rewrap if you fall out.',
  ],
  breath:
    'Slow, deliberate normal breathing. The wrap compresses the chest, so each breath has to be intentional — let that constraint make the breathing calmer, not shallower.',
  benefits: [
    'Traditionally said to open and lubricate all fourteen of the largest joints — both ankles, knees, hips, shoulders, elbows, and wrists.',
    'Strengthens the standing leg, ankles, and calves through the low one-legged sit.',
    'Stretches the upper back, shoulders, and the space between the shoulder blades where desk tension collects.',
    'Trains balance, coordination, and single-pointed concentration.',
    'Traditionally said to flush fresh blood through the kidneys and reproductive organs when the deep compression releases.',
  ],
  contraindications: [
    'Knee injuries — keep the sit shallow and rest the top foot beside the standing calf instead of hooking it behind.',
    'Shoulder injuries — hug opposite shoulders with crossed arms instead of the full forearm twist.',
    'Balance concerns or later pregnancy — practice near a wall and skip the deepest sit.',
  ],
  chakras: [
    {
      id: 'sacral',
      why: 'The low sit and crossed-thigh squeeze compress deep into the hips and pelvis, and the release floods the region governed by Svadhisthana with fresh circulation.',
    },
    {
      id: 'root',
      why: 'One foot carries the entire braided body — the standing leg’s grip on the floor is Muladhara’s grounding put to its first one-legged test.',
    },
    {
      id: 'third-eye',
      why: 'The posture is unbalanceable without a fixed gaze; holding one point with the eyes gathers the scattered mind toward Ajna.',
    },
  ],
  muscles: [
    { id: 'quadriceps', action: 'strengthens', emphasis: 'primary', note: 'the standing-leg sit is Awkward Pose carried on one leg' },
    { id: 'trapezius', action: 'stretches', emphasis: 'primary', note: 'the arm wrap pulls the shoulder blades apart and opens the upper back' },
    { id: 'deltoids', action: 'stretches', emphasis: 'primary', note: 'crossed, twisted arms take the shoulders to the end of their range' },
    { id: 'adductors', action: 'strengthens', emphasis: 'secondary', note: 'the thighs squeeze together to hold the leg wrap' },
    { id: 'glutes', action: 'strengthens', emphasis: 'secondary', note: 'stabilize the pelvis over a single bent leg' },
    { id: 'ankles-feet', action: 'strengthens', emphasis: 'secondary', note: 'the standing foot grips and balances the entire posture' },
    { id: 'calves', action: 'strengthens', emphasis: 'secondary', note: 'constant small corrections keep the balance alive' },
  ],
  mnemonic:
    'Pose #4 ties all four limbs into one knot — two arms braided, two legs braided. Four limbs, one eagle.',
  sequenceNote:
    'Eagle closes the warm-up: after the spine (Half Moon) and the legs (Awkward), it wrings out every major joint and previews one-legged balance. The class steps straight from here into the balancing series, and Eagle is the doorway — hips and shoulders opened, gaze trained, standing leg awake.',
};
