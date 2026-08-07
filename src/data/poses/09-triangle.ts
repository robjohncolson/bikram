import type { Pose } from '../types';

export const triangle: Pose = {
  id: 'triangle',
  order: 9,
  englishName: "Triangle Pose",
  sanskritName: "Trikonasana",
  pronunciation: 'tree-koh-NAH-sah-nah',
  category: 'standing',
  sets: 2,
  timing: "2 sets — ~45–60s each side first set, ~30s second",
  approxTotalSeconds: 165,
  summary:
    'A deep wide-stance lunge with the arms stretched into one vertical line — one fingertip to the floor between the toes, the other reaching for the sky. Often called the master posture of the series, it puts every major muscle group to work at the same time.',
  setup: [
    'From a wide stance — about four feet — raise the arms to shoulder height, palms down, in one line.',
    'Turn the right foot out ninety degrees; keep the left foot planted and the left leg straight.',
    'Bend the right knee and sink the hips until the right thigh is parallel to the floor, knee stacked over the ankle.',
    'Keeping both arms in one straight line, tip them like a wheel spoke: right fingertips reach down toward the floor between the big toe and second toe, left arm points straight up.',
    'Turn the head and set your gaze on the top hand.',
  ],
  cues: [
    'Keep the weight even in both legs — the straight leg presses through the outer edge of its foot and works just as hard as the bent one.',
    'The bent knee tracks over the toes; do not let it collapse inward or drift past the ankle.',
    'The fingertip only touches the floor — no weight in the hand; the legs carry everything.',
    'Keep the arms in one unbroken vertical line, pulling away from each other like a stretched cable.',
    'Revolve the chest open toward the ceiling; the twist lives in the upper body while the hips stay low and steady.',
    'Chin toward the shoulder, eyes on the top hand — the gaze completes the line.',
  ],
  breath:
    'Exhale as you bend into the lunge, then keep a strong, steady breath through the nose — this posture asks for a lot of oxygen, so never let the breath stall.',
  benefits: [
    'Works every major muscle group at once — legs, hips, core, back, shoulders, and arms all engaged simultaneously.',
    'Builds serious strength and endurance in the thighs and hips through the deep held lunge.',
    'Opens the hips and stretches the inner thighs across a wide, active base.',
    'Keeps the heart rate elevated — one of the most aerobically demanding holds of the standing series.',
    'Improves hip mobility and trunk rotation together in one movement.',
    'Traditionally said to nourish every organ and system at once, and to bring all the chakras into balance — the reason it is called the master posture.',
  ],
  contraindications: [
    'Knee injuries — reduce the depth of the bend and keep the knee stacked strictly over the ankle.',
    'Neck problems — keep the gaze forward instead of turning up toward the top hand.',
    'Dizziness, low blood pressure, or heart conditions — this is a long, demanding hold; come out early and rest if needed.',
  ],
  chakras: [
    {
      id: 'sacral',
      why: 'The deep bent-knee lunge and wide base open the hips and groin at their fullest — Svadhisthana territory, stretched and strengthened at once.',
    },
    {
      id: 'heart',
      why: 'The chest revolves open toward the sky while the heart pumps hard to fuel the whole body — Anahata is both opened and exercised.',
    },
    {
      id: 'root',
      why: 'Two feet pressing into a wide, unshakable base make the posture possible — the triangle is only as strong as its grounded foundation.',
    },
  ],
  muscles: [
    { id: 'quadriceps', action: 'strengthens', emphasis: 'primary', note: 'the bent thigh holds parallel to the floor — the deepest leg work of the standing series' },
    { id: 'adductors', action: 'stretches', emphasis: 'primary', note: 'the straight leg’s inner thigh lengthens across the wide stance' },
    { id: 'glutes', action: 'strengthens', emphasis: 'primary', note: 'both hips stabilize the low, open position' },
    { id: 'obliques', action: 'strengthens', emphasis: 'secondary', note: 'revolve and hold the chest open' },
    { id: 'deltoids', action: 'strengthens', emphasis: 'secondary', note: 'both arms held in one line for the entire posture' },
    { id: 'hamstrings', action: 'stretches', emphasis: 'secondary', note: 'along the straight leg' },
    { id: 'ankles-feet', action: 'strengthens', emphasis: 'secondary', note: 'both feet grip and ground the wide base' },
  ],
  mnemonic:
    'Nine is three times three — and #9 is the posture of threes: two legs and the floor drawing the three-sided shape that gives the master posture its name.',
  sequenceNote:
    'Triangle is the summit of the standing series: the hamstrings and inner thighs just opened by #8’s wide straddle now power a deep, working lunge that gathers everything trained so far — grounded strength, open hips, a revolving chest, and a steady gaze — into one posture, keeping the heart rate high before the standing series begins to wind down.',
};
