import type { Pose } from '../types';

export const fixedFirm: Pose = {
  id: 'fixed-firm',
  order: 20,
  englishName: "Fixed Firm Pose",
  sanskritName: "Supta-Vajrasana",
  pronunciation: 'SOOP-tah vahj-RAH-sah-nah',
  category: 'floor',
  sets: 2,
  timing: "2 sets, ~40s",
  approxTotalSeconds: 145,
  summary:
    'A kneeling recline that rebuilds the knees and ankles: sitting between the heels, you lower back in stages — elbow, elbow, shoulders — until the back rests on the floor with arms overhead. Depth is earned, never forced; you go exactly as far as the knees allow.',
  setup: [
    'Kneel on the floor with your knees together and your feet apart, alongside your hips.',
    'Sit down between your heels, toes pointing straight back, feet hugging the hips.',
    'Lean back onto one elbow, then the other, going down in stages.',
    'If the knees stay down, lower the shoulders and head to the floor.',
    'Reach the arms overhead, take hold of opposite elbows, and rest them on the floor behind you.',
  ],
  cues: [
    'Go down the way you would descend a ladder — one stage at a time, never falling backward.',
    'Keep the knees together and on the floor; if they lift, that is your depth for today — stay on your elbows.',
    'The feet stay glued alongside the hips, toes pointing straight back, soles facing the ceiling.',
    'Sensation of stretch in the thighs and ankles is the posture working; sharp pain in the knees means come up.',
    'Coming out, retrace your steps — elbows first, then up, never twisting sideways off the legs.',
    'Let the chest lift and the breath soften; the lower you settle, the quieter the posture becomes.',
  ],
  breath:
    'Slow, even breathing throughout — send the inhale into the belly and chest as the front of the hips stretches, and let each exhale release you a little deeper.',
  benefits: [
    'Stretches and lubricates the knees and ankles — this is the sequence’s rehabilitation posture for the lower joints, practiced progressively.',
    'Gives the quadriceps and hip flexors one of their deepest stretches in the class.',
    'Improves ankle flexibility and stretches the tops of the feet.',
    'Increases circulation to the knees, lower legs, and lower spine.',
    'Traditionally said to help sciatica, gout, and varicose veins.',
    'Traditionally said to strengthen the kidneys and aid digestion through the open, stretched abdomen.',
  ],
  contraindications: [
    'Knee injury — never push through sharp knee pain; stay upright or recline only to the elbows, and let depth come over weeks, not seconds.',
    'Ankle injury — the fully pointed, weighted ankle position can aggravate a sprain; pad under the ankles or sit higher.',
    'Low back problems — reclining fully increases the lumbar arch; stop at the elbows.',
    'Later pregnancy — lying flat on the back can be uncomfortable or inadvisable; stay upright or propped.',
  ],
  chakras: [
    {
      id: 'sacral',
      why: 'The recline stretches the entire front of the pelvis and lower abdomen, opening and drawing circulation through the Svadhisthana region.',
    },
    {
      id: 'root',
      why: 'The legs, knees, and feet — the body’s foundation — are folded and pressed to the earth, grounding attention in Muladhara territory.',
    },
  ],
  muscles: [
    { id: 'quadriceps', action: 'stretches', emphasis: 'primary', note: 'fully lengthened over the deeply bent knees — the heart of the posture' },
    { id: 'hip-flexors', action: 'stretches', emphasis: 'primary', note: 'the recline pulls the front of the hips long' },
    { id: 'ankles-feet', action: 'stretches', emphasis: 'primary', note: 'tops of the feet and ankles under full, weighted extension' },
    { id: 'abdominals', action: 'stretches', emphasis: 'secondary', note: 'the front body lengthens from knees to ribs' },
    { id: 'deltoids', action: 'stretches', emphasis: 'secondary', note: 'arms overhead on the floor, holding opposite elbows' },
    { id: 'lats', action: 'stretches', emphasis: 'secondary' },
  ],
  mnemonic:
    'Hindsight is 20/20: at #20 the belly-down backbends are behind you — you sit back between your heels, recline, and look straight up at the ceiling with perfect vision.',
  sequenceNote:
    'After four backbends on the abdomen, the sequence flips over and kneels. Fixed Firm opens the kneeling series, restoring the knees and ankles, stretching the quadriceps and hip flexors deeply, and preparing the front of the body for Camel — the biggest backbend still to come.',
};
