import type { Pose } from '../types';

export const situp: Pose = {
  id: 'situp',
  order: 15,
  englishName: "Sit-Up",
  sanskritName: "Pada-Hastasana (Sit-Up)",
  pronunciation: 'PAH-dah hahs-TAHS-ah-nah',
  category: 'floor',
  sets: 1,
  timing: "Once here, then between every floor posture",
  approxTotalSeconds: 60,
  summary:
    'The recurring engine of the floor series: legs straight, arms overhead, snap up to sitting with a double exhale and dive for the toes. Numbered once at 15, but you will repeat it after every floor posture for the rest of class. (The toe-grab finish shares the name Pada-Hastasana — hands to feet — with the forward-fold half of posture 2; the sit-up itself has no Sanskrit name of its own.)',
  setup: [
    'Lying on your back, straighten both legs and flex the feet back toward your face.',
    'Sweep the arms overhead onto the floor behind you and cross the thumbs.',
    'Tuck the chin firmly to the chest.',
    'In one motion, sit up — arms swinging forward past the ears toward the toes.',
    'Dive forward, take hold of the big toes, and pull, reaching the elbows toward the floor and the forehead toward the knees.',
  ],
  cues: [
    'Keep the legs straight and the heels on the floor the whole way up — momentum is allowed, collapsing is not.',
    'The chin stays glued to the chest so the head rides the movement instead of whipping it.',
    'Two exhales, every time: one as you come up to sitting, a second sharper one as you touch the toes.',
    'Feet stay flexed toward your face — stretch out through the heels as you pull the toes back.',
    'Make the forward stretch quick and light; this is a transition, not a long hold.',
    'If the low back protests, soften the knees slightly or roll to your side and press up with the hands instead.',
  ],
  breath:
    'Inhale lying down as the arms reach overhead; exhale as you sit up; then a second, sharper exhale as you grab the toes — the signature double exhale that empties the lungs completely.',
  benefits: [
    'Strengthens the abdominals and hip flexors with dozens of honest repetitions per class.',
    'The double exhale wrings stale air from the bottom of the lungs and resets the breath between postures.',
    'Re-energizes the body after each short Savasana so relaxation never slides into sleepiness.',
    'Gives the hamstrings and calves a brief, repeated stretch in the dive toward the toes.',
    'Trains you to initiate movement from the core — a habit every posture after it borrows.',
  ],
  contraindications: [
    'Low back pain or disc issues — skip the snap: roll onto your side and press up to sitting with the hands.',
    'Neck strain — keep the chin tucked throughout; never lead the movement with the head.',
    'Pregnancy or recent abdominal surgery — take the sideways roll-up every time instead.',
  ],
  chakras: [
    {
      id: 'solar-plexus',
      why: 'Every repetition fires the core — the discipline and ignition of Manipura is literally what lifts you off the floor again and again all class long.',
    },
    {
      id: 'third-eye',
      why: 'Each sit-up ends with the forehead reaching for the knees, pressing attention toward Ajna, the point between the brows.',
    },
  ],
  muscles: [
    { id: 'abdominals', action: 'strengthens', emphasis: 'primary', note: 'the snap up off the floor, repeated after every floor posture' },
    { id: 'hip-flexors', action: 'strengthens', emphasis: 'primary', note: 'straight-leg sit-ups are as much psoas as abs' },
    { id: 'hamstrings', action: 'stretches', emphasis: 'secondary', note: 'the quick dive to the toes' },
    { id: 'calves', action: 'stretches', emphasis: 'secondary', note: 'feet stay flexed back toward the face' },
    { id: 'erector-spinae', action: 'stretches', emphasis: 'secondary', note: 'the spine rounds long over the legs at the finish' },
  ],
  mnemonic:
    'At 15 you get your learner’s permit — and the sit-up is how you drive yourself around the floor series for the rest of class. Learn it once at #15, use it forever after.',
  sequenceNote:
    'Numbered once, repeated always: from here on, every floor posture is followed by a short Savasana and then a sit-up into the next posture. It sits at 15 because this is where the floor series’ rhythm begins — total stillness, then a decisive double-exhale return to work.',
};
