import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#21 Ardhakūrmāsana,
//   Half Tortoise Pose; its nearest equivalent in other schools given as
//   Balasana)
// - https://en.wikipedia.org/wiki/Kurmasana (kurma = tortoise/turtle, asana =
//   seat/posture; dedicated to Kurma, Vishnu's tortoise avatar; the modern
//   form is a wide-legged seated forward bend with the arms under the knees,
//   described in Light on Yoga; Supta Kurmasana and Uttana Kurmasana as
//   variants; the name appears in the 7th-c. Ahirbudhnya Samhita and the
//   19th-c. Jogapradipika and Sritattvanidhi; no Ardha Kurmasana mentioned)
// - https://en.wikipedia.org/wiki/Kurma (second of Vishnu's ten avatars;
//   supports Mount Mandara during the Samudra Manthana; Shatapatha Brahmana
//   has Prajapati take a tortoise's form to create all creatures; the
//   tortoise as an image of the senses withdrawn)
// - https://www.holy-bhagavad-gita.org/chapter/2/verse/58/ and
//   https://vedabase.io/en/library/bg/2/58/ (Gita 2.58: the steady mind draws
//   its senses in from their objects as a tortoise draws in its limbs)
// - https://en.wikipedia.org/wiki/Pratyahara (fifth of Patanjali's eight limbs;
//   withdrawal of the senses)
// - https://en.wikipedia.org/wiki/Balasana (bala = child; not described before
//   the 20th century — a similar shape in Niels Bukh's 1924 Primary
//   Gymnastics; arms normally back beside the body, palms up, or stretched
//   forward as a variation; used as a rest before and after Sirsasana; no
//   Light on Yoga entry)
// - https://en.wikipedia.org/wiki/Uttana_Shishosana (extended puppy: the
//   halfway house between Balasana and Adho Mukha Svanasana, thighs vertical)
// - https://en.wikipedia.org/wiki/Virasana (vira = hero; knees together, feet
//   apart so the seat rests on the floor between them; Adho Mukha Virasana =
//   the trunk stretched forward with the hands on the ground; Supta Virasana)
// - https://en.wikipedia.org/wiki/Vajrasana_(yoga) (vajra = thunderbolt/
//   diamond; sitting on the heels; Hatha Yoga Pradipika treats the name as a
//   synonym of Siddhasana; Norman Sjoman notes Light on Yoga never quite
//   defines the basic Vajrasana, though it has Laghu Vajrasana)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; c. 200 asanas, c. 600
//   photographs; every asana graded 1–60; asanas then pranayama)
// - https://www.ghoshyoga.org/postures-of-ghosh-yoga.html (Ghosh Yoga's
//   collation of the lineage's publications: Ardha-Kurmasana is #21 and
//   appears in all five — Bishnu Ghosh, Buddha Bose, Gouri Shankar Mukerji,
//   Monotosh Roy, P. S. Das; further along it lists #77 "Ardha Kurmasana II /
//   Kurmasana, 1st phase" and #78 Kurmasana in Bose and Mukerji)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Virasana #40, p. 120, intensity 1, plates 85–92; Supta Virasana p. 123,
//   grade 2, plates 93–96; Kurmasana #133, p. 288, grade 14, plates 360–367;
//   Supta Kurmasana p. 291, grade 14, plate 368; Supta Vajrasana grade 12,
//   plates 123–124; Laghuvajrasana grade 23, plate 513; Paschimottanasana
//   grade 6, plates 153–162; Upavistha Konasana grade 9, plates 148–152;
//   Adho Mukha Svanasana grade 5, plates 75–76; Parvatasana grade 4, plate
//   107; no Balasana, Vajrasana or Adho Mukha Virasana row of its own)
// - https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Level 1, source Light on Yoga: Virasana 89, Parvatasana in Virasana 91,
//   Adho Mukha Virasana 92 — filed under "Paschima Pratana Sthiti – Forward
//   Extension Asanas" — Supta Virasana 96; Level 2 Kurmasana 363–364; Level 3
//   Supta Kurmasana 368)
// - https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Virasana 88–89; Supta Virasana 93, 96; Kurmasana 363–364 "stage 1 – arms
//   extended sideways"; Kurmasana II 365 "arms extended backwards")
// - https://yogavastu.com/p/virasana-forward/ (Iyengar-method Downward-facing
//   Hero: feet together under the seat, heels directly under the buttocks,
//   knees wide to make room for the ribcage; block under the seat if the
//   knees are tight; arms extended along the floor and kept active against
//   gravity; forehead on the floor or a block so the neck releases; shoulders
//   and collarbones kept open; breath used to deepen; restorative holds of
//   two minutes and more; warm-up for shoulder work and the way into
//   Adho Mukha Svanasana)
// - https://yogavastu.com/p/virasana/ (Iyengar-method Virasana: draw the calf
//   flesh away from the knee and outward before sitting, weight into the
//   front of the shin, spine long, chest open, block or blankets under the
//   seat when the knees object)
// - https://yogavastu.com/p/kurmasana/ and
//   https://yogainternational.com/article/view/kurmasana-tortoise-pose-the-journey-inward/
//   (Iyengar-method Kurmasana: heels pressed forward, thighs down, fold from
//   the pelvic rim, arms hooked under the legs; Upavistha Konasana as the
//   milder substitute; three arm stages — sideways, backwards, clasped; the
//   tortoise as the symbol of pratyahara)
//
// `reference` points at plate 92 even though `asana` is null: Light on Yoga
// has no entry for this shape, but the last photograph of its Virasana entry
// is the kneeling forward fold with the arms stretched along the floor, and
// the UK Iyengar syllabus files that plate as Adho Mukha Virasana. No
// difficulty grade is given because the fold is not graded on its own
// (Virasana as a whole is grade 1).
export const halfTortoise: ClassicalNote = {
  asana: null,
  etymology:
    'Ardha is “half”, kurma is “tortoise” (the same word serves for turtle), and asana is “a seat” or “posture” — so the name promises half of a tortoise. The tortoise it points to is Kurma, the second of Vishnu’s ten avatars, who carries Mount Mandara on his back while gods and demons churn the ocean for the nectar of immortality; an older Vedic text has the creator Prajapati take a tortoise’s form to bring forth all creatures. The image yoga keeps returning to, though, is the Bhagavad Gita’s: a mind steady in wisdom draws its senses in from their objects the way a tortoise draws its limbs into its shell (2.58) — the withdrawal the eight limbs call pratyahara, which every tortoise pose is traditionally said to rehearse.',
  reference: { plates: 'plate 92, inside Virasana' },
  contrast:
    'The name and the shape point in different directions. The tortoise Iyengar files — Kurmasana, graded 14 of 60 at plates 360–367, with Supta Kurmasana at plate 368 — is a seated forward bend with the legs wide and the arms threaded under the knees until the chest lies on the floor, and the “half” is Ghosh-lineage numbering: the collated repertoire of Bishnu Ghosh’s school lists Ardha-Kurmasana at 21 and, much further along, a second Half Tortoise (“Kurmasana, first phase”) and then the full tortoise, so within its own lineage this posture is the first rung of a ladder whose top is Iyengar’s Kurmasana. What you actually practise is the kneeling forward fold that Light on Yoga photographs as the last stage of Virasana (plate 92: head down, arms stretched along the floor) — the pose Iyengar teachers list as Adho Mukha Virasana and the wider yoga world calls Balasana, child’s pose, a twentieth-century name with no entry of its own in the book. The base differs: Iyengar’s Virasana seat rests on the floor between the heels with the feet beside the hips, while 26 & 2 sits on the heels with knees and feet together — the seat the hatha texts call Vajrasana, a name Light on Yoga gives to two much harder poses but never files as a base of its own — and where the Iyengar fold lays the palms flat, usually widens the knees to make room for the trunk and rests the forehead on a block, 26 & 2 seals the palms with the thumbs crossed, lets only the pinky edges and the forehead touch, glues the hips to the heels and rides down and up with no help from the hands. The reason is what each lineage wants from the shape: in the Iyengar method it is a resting station — held long, softly supported, a place to recover between demanding poses — while 26 & 2 places it as the exhale between Fixed Firm and Camel and counts it like every other posture, so its rest is a held, active rest: sealed, symmetrical and timed, with the shoulders and lats quietly working the whole way down and the whole way up.',
  refinements: [
    'Build the base from the shins down before anything above moves. In the Iyengar method a kneeling seat starts with the tops of the feet pressing into the floor, the ankles long, the toes pointing straight back, and the flesh of the calf drawn out from behind the knee as you sit — so the weight lands on the front of the shins and the knees are spared. A folded blanket under the ankles, or between hips and heels, is how that method makes the seat possible; it is exactly the padding your knee caution asks for.',
    'Lengthen before you lower. Iyengar’s own order at Virasana is arms overhead first (Parvatasana in Virasana, plate 91) and forward only after (plate 92), which is precisely the order 26 & 2 gives you: use the moment the arms rise to lift the side ribs and the front of the spine up out of the pelvis, then carry that length down with you so the fold stays a hinge at the hips rather than a rounding of the back.',
    'Keep the arms alive. In the Iyengar fold the extended arms are worked, not draped — reaching out through the fingertips against gravity, the upper arms turning outward so the biceps face the ears while the shoulder blades slide down away from the neck and the collarbones stay wide. That reach is what sends the stretch into the lats and the sides of the trunk instead of the neck, and it is the same reach your cue to stretch forward from the shoulders is asking for.',
    'Fold as an extension, not a drop. The Iyengar syllabi file this pose among the forward extensions — paschima pratana, the lengthening of the back body — and the direction is forward before it is down: crown and fingertips travel away from the hips, the front of the trunk stays long over the thighs, and the breastbone keeps moving toward the floor ahead of you rather than sinking toward the knees.',
    'Let the breath do the deepening. In the Iyengar method a fold like this is not pulled deeper, it is breathed deeper: with the belly resting on the thighs the inhale has nowhere to go but the back of the ribs, so let each in-breath widen the back and each out-breath settle the hips a little heavier onto the heels. The posture asks you to breathe as if asleep; this is how a still body goes on breathing fully.',
  ],
  stages: [
    'The seat alone: kneel and sit on the heels with a folded blanket under the ankles — or between hips and heels if the knees object — spine tall, hands on the thighs. The Iyengar rule is that a base is made comfortable before it is loaded; until sitting on the heels is easy, the fold has nothing to rest on.',
    'The supported fold: knees apart to make room for the trunk (the Iyengar method’s usual arrangement, and the version the pregnancy note asks for), arms forward with the palms flat, forehead on a block or folded towel so the neck lets go. Hold here and learn the back-body breath.',
    'Knees and feet together, arms straight with the palms sealed and thumbs crossed, hips staying on the heels — and the forehead exactly as low as it comes without the seat lifting. A hand’s width of air under the brow is still the posture if the hips have not left the heels.',
    'The complete form: pinky edges and forehead on the floor, hips glued to the heels, spine long from tailbone to crown — then the 26 & 2 addition, rising and lowering as one piece with no hands on the floor, which is the strength hidden inside the rest.',
  ],
  ladder: {
    before: [
      'Vajrasana (Thunderbolt)',
      'Virasana (Hero)',
      'Parvatasana in Virasana (Mountain-arms in Hero)',
      'Balasana (Child)',
    ],
    beyond: [
      'Uttana Shishosana (Extended Puppy)',
      'Adho Mukha Svanasana (Downward-facing Dog)',
      'Paschimottanasana (Seated Forward Bend)',
      'Kurmasana (Tortoise)',
    ],
  },
};
