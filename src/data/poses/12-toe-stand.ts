import type { Pose } from '../types';

export const toeStand: Pose = {
  id: 'toe-stand',
  order: 12,
  englishName: "Toe Stand Pose",
  sanskritName: "Padangustasana",
  pronunciation: 'pah-dahn-goos-TAHS-ah-nah',
  category: 'standing',
  sets: 1,
  timing: "1 set — ~40s each side, descent to rise",
  approxTotalSeconds: 85,
  summary:
    'From Tree, you bend the standing knee and sink all the way down to a squat balanced on the ball of one foot, spine upright, hands working toward prayer. The finale of the standing series is equal parts ankle, knee, and undivided attention.',
  setup: [
    'Begin exactly as in Tree: right foot drawn up toward the left hip crease, folded knee pressing down.',
    'Fix your gaze on a spot on the floor about four feet ahead — it stays there for the entire posture.',
    'Bend the standing knee and fold forward, reaching the fingertips to the floor for balance.',
    'Rise onto the ball of the left foot and sink the hips down until you are sitting on the lifted left heel.',
    'Bring the spine upright, then float the hands off the floor one at a time and press the palms together at the chest.',
  ],
  cues: [
    'Balance lives on the ball of the foot — the lifted heel becomes the stool you sit on.',
    'Keep the spine tall and the chest lifted; do not collapse over the fingertips.',
    'Your eyes are the anchor: the gaze stays welded to that one spot on the floor from start to finish.',
    'The fingertips are training wheels — make them lighter, then lift one hand, then the other.',
    'Keep the folded knee reaching toward level, hip staying open just as it was in Tree.',
    'Exit with the same control you entered with — rising slowly back to Tree is part of the posture.',
  ],
  breath:
    'Quiet, steady breathing throughout — exhale as you sink, breathe evenly in the squat, and inhale as you rise. Holding the breath is the fastest way to fall.',
  benefits: [
    'Strengthens the ankles, feet, knees, and hips through a deep single-leg squat.',
    'Develops intense concentration, patience, and mental composure at the edge of balance.',
    'Builds core strength — the upright spine over a tiny base is held by the abdomen.',
    'Traditionally said to ease joint troubles of the legs such as gout, rheumatism, and arthritic knees.',
    'Closes the standing series with confidence: total control on the way down to the floor.',
  ],
  contraindications: [
    'Knee injury or recent knee surgery — the half-lotus fold plus deep flexion under full body weight is too much; stay in Tree instead.',
    'Ankle instability or a recent sprain — the entire balance loads the ball of one foot.',
    'Dizziness or blood-pressure issues — the head dips below the heart on the way down; move slowly or keep the descent partial.',
  ],
  chakras: [
    {
      id: 'root',
      why: 'The deepest grounding of the standing series: your whole weight funnels into the ball of one foot inches from the earth, demanding absolute Muladhara-style stability.',
    },
    {
      id: 'third-eye',
      why: 'The posture is held together by a single fixed gaze and total mental focus — the one-pointed concentration that awakens Ajna.',
    },
  ],
  muscles: [
    { id: 'quadriceps', action: 'strengthens', emphasis: 'primary', note: 'a full-depth single-leg squat, loaded on the way down and the way up' },
    { id: 'ankles-feet', action: 'strengthens', emphasis: 'primary', note: 'the entire body stacks over the ball of one foot' },
    { id: 'calves', action: 'strengthens', emphasis: 'primary', note: 'the raised heel is held up by the calf for the whole hold' },
    { id: 'abdominals', action: 'strengthens', emphasis: 'secondary', note: 'keep the spine upright over a tiny base of support' },
    { id: 'glutes', action: 'strengthens', emphasis: 'secondary', note: 'the standing hip controls the slow descent and rise' },
    { id: 'adductors', action: 'stretches', emphasis: 'secondary', note: 'the folded leg keeps its half-lotus opening from Tree' },
  ],
  mnemonic:
    'At #12 the clock strikes noon and the standing series comes down: the 1 is the single ball of the foot you balance on, and the 2 curls toward the floor exactly like you do.',
  sequenceNote:
    'Toe Stand is the standing series taking a bow — it carries Tree\'s shape all the way to the ground with complete control, so you arrive at the floor deliberately rather than collapsing onto it. The concentration it forges is precisely what the stillness of Savasana, seconds away, will ask of you.',
};
