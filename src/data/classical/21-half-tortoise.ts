import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#21 Ardhakūrmāsana,
//   Half Tortoise Pose; Balasana given as the nearest equivalent in other
//   schools)
// - https://en.wikipedia.org/wiki/Kurmasana (kurma = tortoise/turtle and asana
//   = seat/posture; the modern form is a seated forward bend with the arms
//   passed under the legs; Kurma is Vishnu's tortoise avatar)
// - https://en.wikipedia.org/wiki/Kurma (Kurma is second in the Dashavatara;
//   supports Mount Mandara during the churning of the ocean; the Shatapatha
//   Brahmana has Prajapati assume tortoise form as creator)
// - https://www.holy-bhagavad-gita.org/chapter/2/verse/58/ and
//   https://vedabase.io/en/library/bg/2/58/ (Gita 2.58 compares gathered senses
//   with a tortoise drawing its limbs into its shell)
// - https://en.wikipedia.org/wiki/Pratyahara (sensory withdrawal; fifth of
//   Patanjali's eight limbs)
// - https://en.wikipedia.org/wiki/Balasana (bala = child; first documented in
//   the 20th century; the usual arms-back form and an arms-forward variation)
// - https://en.wikipedia.org/wiki/Virasana (vira = hero; the modern kneeling
//   seat has the feet beside the hips; Adho Mukha Virasana extends the trunk
//   and hands forward)
// - https://en.wikipedia.org/wiki/Vajrasana_(yoga) (vajra = thunderbolt or
//   diamond; the name has varied historically and commonly denotes sitting on
//   the heels; Light on Yoga does not describe basic Vajrasana)
// - https://www.ghoshyoga.org/postures-of-ghosh-yoga.html (collation of five
//   Ghosh-lineage publications: Ardha-Kurmasana is among the first 27 forms
//   shared by the three publications from Ghosh's lifetime and is marked in
//   all five; the later list separately names Ardha Kurmasana II/Kurmasana,
//   first phase, and Kurmasana; the numbering is expressly not a sequence)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Virasana grade 1, plates 85–92; Kurmasana grade 14, plates 360–367;
//   Supta Kurmasana grade 14, plate 368; no rows for Ardha Kurmasana,
//   Balasana, basic Vajrasana or Adho Mukha Virasana)
// - https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Level 1 identifies plate 91 as Parvatasana in Virasana and plate 92 as
//   Adho Mukha Virasana, both sourced to Light on Yoga; it groups plate 92
//   with forward extensions; later levels identify Kurmasana at 363–364 and
//   Supta Kurmasana at 368)
// - https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (cross-check: Kurmasana stage 1 at plates 363–364 and Kurmasana II at 365)
// - https://yogavastu.com/p/virasana-forward/ and
//   https://yogavastu.com/p/virasana/ (Iyengar-method teaching: Virasana with
//   heels beside the seat; the calf drawn outward and weight toward the front
//   of the shin; the forward variation with feet under the seat, knees apart,
//   active arms, and optional support under the forehead or seat)
// - https://yogavastu.com/p/kurmasana/ (Iyengar-method Kurmasana with arms
//   beneath the legs, hands reaching back and heels reaching forward;
//   Upavistha Konasana given as a milder alternative)
//
// `reference` names plate 92 even though `asana` is null. The published index
// includes it only within Virasana's plates 85–92; the UK Iyengar syllabus
// supplies the Adho Mukha Virasana label. There is no independent index row or
// separate difficulty grade for the forward fold, so no grade is shown here.
export const halfTortoise: ClassicalNote = {
  asana: null,
  etymology:
    'Ardha means “half”, kurma means “tortoise” or “turtle”, and asana means “seat” or “posture”: Half Tortoise. Kurma is the second of Vishnu’s ten principal avatars. In the churning-of-the-ocean story, the tortoise supports Mount Mandara; the older Shatapatha Brahmana instead has Prajapati take tortoise form as creator. Bhagavad Gita 2.58 compares gathered senses with a tortoise drawing in its limbs. In Patanjali’s eight-limbed scheme, sensory withdrawal is pratyahara, the fifth limb. That makes the tortoise a traditional image for turning attention inward, not a promise that the posture will produce a particular state.',
  reference: { plates: '92' },
  contrast:
    'The familiar name does not identify the same shape across systems. The published Light on Yoga index has no separate Ardha Kurmasana, Balasana or Adho Mukha Virasana entry. It lists Kurmasana at grade 14 of 60, plates 360–367: a wide-legged seated fold whose arms pass beneath the legs. The UK Iyengar syllabus does label plate 92, within the book’s Virasana plate series, as Adho Mukha Virasana. That kneeling forward extension is the closest photographed comparison; Balasana is another common comparison, although its usual arms-back form and twentieth-century name remain distinct. The Ghosh Yoga collation records Ardha-Kurmasana in five lineage publications and separately records an Ardha Kurmasana II called the first phase of Kurmasana. Because the collation expressly says its numbers are neither a practice sequence nor a ranking, those later names do not establish this posture as a first stage of Light on Yoga’s Kurmasana. The bases also differ. Virasana sits between the heels with the feet beside the hips, while the 26 & 2 posture sits on the heels with knees and feet together—a seat commonly called Vajrasana today, though that name has varied historically. Iyengar-method Downward-Facing Hero teaching can widen the knees, reach both arms along the floor and support the forehead; 26 & 2 keeps the knees and feet together, seals the palms with crossed thumbs, touches only the pinky edges and forehead, and lowers and rises without pushing from the hands. One form can be arranged as a supported resting pose; the counted 26 & 2 form is an active rest between Fixed Firm and Camel.',
  refinements: [
    'Organize the seat before the fold. Iyengar-method Virasana teaching draws the calf outward before sitting and keeps the weight toward the front of the shin. Keep the 26 & 2 base—knees and feet together, hips on the heels—and use the padding named in Take care if full kneeling flexion does not suit your knees or ankles.',
    'Lengthen before you lower. Reach upward through the straight arms before the pelvis changes direction, then let arms, head and torso travel forward together. The aim is a long hinge from the hips, not a race to place the forehead on the floor.',
    'Keep the arms active. Iyengar-method Downward-Facing Hero teaching keeps the forward reach awake and the shoulders and collarbones broad. Transfer that action without changing the class grip: palms remain sealed, elbows straight, biceps beside the ears, and pinky edges reaching away from the hips.',
    'Let the breath measure the shape. The supported Iyengar-method variation emphasizes the movement of the ribcage; here, keep the breath quiet and unforced as the back and side ribs widen. If the breath tightens, shorten the reach or lift the forehead while the hips remain on the heels.',
  ],
  stages: [
    'The seat alone: kneel and sit on the heels, spine tall and hands on the thighs. Use a folded blanket under the ankles or between hips and heels when that makes the base more workable; stay here if the fold would add strain.',
    'The supported comparison: separate the knees to make room for the trunk, reach the arms forward with palms apart and rest the forehead on a block or folded towel. This is the Iyengar-method arrangement and also matches the wider-knee option in the pregnancy caution; it is a place to learn a quiet back-body breath, not the final 26 & 2 shape.',
    'The class base and grip: bring knees and feet together, straighten the arms, seal the palms and cross the thumbs. Keep the hips on the heels and lower only as far as the arms, head and torso can remain one long unit, even if the forehead stays above the floor.',
    'The complete 26 & 2 form: pinky edges and forehead touch the floor while the hips remain on the heels. Reach forward through the shoulders, then rise and lower as one piece without using the hands to push.',
  ],
  ladder: {
    before: [
      'Vajrasana (Thunderbolt)',
      'Virasana (Hero)',
      'Parvatasana in Virasana (Mountain-arms in Hero)',
      'Balasana (Child)',
    ],
    beyond: [
      'Adho Mukha Virasana (Downward-facing Hero)',
      'Adho Mukha Svanasana (Downward-facing Dog)',
      'Upavistha Konasana (Wide-Angle Seated Forward Bend)',
      'Kurmasana (Tortoise)',
    ],
  },
};
