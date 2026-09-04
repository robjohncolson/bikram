import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Ustrasana (uṣṭra = camel; a different,
//   standing pose carries the name in the 19th-c. Sritattvanidhi; the modern
//   kneeling backbend comes from two of Krishnamacharya's students — Pattabhi
//   Jois's Ashtanga series and Iyengar's Light on Yoga, pp. 87–88; Ardha
//   Ustrasana has a hands-on-hips version and a one-hand-on-heel/one-arm-
//   overhead version; toes tucked under is the lighter form; blocks beside
//   the calves as a prop; the pose is #22 of the Bikram series)
// - https://en.wiktionary.org/wiki/उष्ट्र (uṣṭra: camel, also buffalo, and a
//   cart drawn by either; from Proto-Indo-Iranian *úštras, cognate with the
//   Avestan uštra inside the name Zarathustra)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#22 Camel Pose =
//   Ustrasana, the same name in both lineages; #20 "Supta Vajrasana" is
//   nearest Supta Virasana; #23 Rabbit is nearest Balasana)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 200-odd asanas, ~600
//   photographs; each asana graded 1–60)
// - https://loyindex.org → the published "Asana Indexes for Light on Yoga"
//   Google Sheet linked from Eyal Shifroni's Light on Yoga index post
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Ustrasana #16, p. 87, intensity 3, plates 40–41 — between Parighasana
//   #15 and Utkatasana #17; Virasana #40 p. 120 grade 1 plates 85–92; Supta
//   Virasana #41 p. 123 grade 2 plates 93–96; Salabhasana grade 1 plates
//   60–61; Bhujangasana I grade 1 plates 72–73; Urdhva Mukha Svanasana grade 1
//   plate 74; Dhanurasana grade 4 plate 63; Urdhva Dhanurasana I grade 7
//   plates 479–482; Kapotasana grade 21 plates 503–512; Laghuvajrasana grade
//   23 plate 513; Eka Pada Rajakapotasana I grade 28 plates 539–542; the
//   book's own "Supta Vajrasana" #57 is a lotus-based pose, grade 12, plates
//   123–124 — not Fixed Firm)
// - Plate 41 cross-checked in two Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Ustrasana 41; Supta Virasana 96; Kapotasana 507, 512; Laghu Vajrasana 513)
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Ustrasana 41; Supta Virasana 93, 96; Kapotasana 507–512; Laghuvajrasana 513)
// - https://yogavastu.com/p/ustrasana/ (Iyengar-method teaching: an important
//   early backbend that teaches arching with gravity; when the feet are out of
//   reach, blocks beside the feet or a bolster across the soles or over the
//   ankles)
// - https://yogaselection.com/four-stages-to-learning-ustrasana-camel-pose/
//   (Iyengar-method stages: toes tucked → bolster over the calves → bolster on
//   the soles → full; shins press down, backs of the thighs lift, fronts of
//   the thighs draw down, shoulder blades lift the chest, fingertips on the
//   heels progressing to palms on the soles, the spine between the blades
//   moves in)
// - https://www.ihanuman.com/asana/ustrasana (shins parallel, thighs
//   perpendicular, buttocks pressed down and forward, upper arms rotated
//   outward, chest lifted by the shoulder blades, head back onto the upper
//   back; preparations Salabhasana, Dhanurasana, Urdhva Mukha Svanasana;
//   follow-ups Urdhva Dhanurasana, a twist, Halasana, Sarvangasana; a block
//   between the knees or the feet)
// - https://yogainternational.com/article/view/ustrasana-camel-pose/ (from
//   Vajrasana; hands on the back of the pelvis first; thighs vertical, femurs
//   rolling in, sacrum moving forward and in; shoulder blades together and
//   down; back of the neck long; hands stay on the back when the heels are
//   out of reach; toes turned under as the lighter form; exit one hand at a
//   time, head last; child's pose after)
// - https://yogauonline.com/yoga-poses/camel-pose/ (knees hip-width; tailbone
//   lengthening down; buttock flesh released; lower front ribs kept from
//   flaring; inner shoulder blades toward the spine; the neck continuing the
//   line of the upper back; wall, blocks and chair as props; dizziness means
//   come out; do not twist the sacroiliac joints on the way out; preparations
//   Cobra, Locust, low lunge, half Bow)
// - https://en.wikipedia.org/wiki/Kapotasana (kapota = pigeon; a different
//   standing Kapotasana in the Sritattvanidhi; the kneeling backbend is the
//   Light on Yoga form, pp. 367–372)
// - https://en.wikipedia.org/wiki/Laghuvajrasana (laghu = little/light, vajra
//   = thunderbolt; thighs half-raised, crown to the floor, hands on the
//   ankles; Light on Yoga pp. 372–373)
// - https://en.wikipedia.org/wiki/Virasana (vira = hero, supta = reclined;
//   Light on Yoga pp. 123–125; a kneeling base for backbends)
// - https://en.wikipedia.org/wiki/Urdhva_Dhanurasana (urdhva = upward, dhanu =
//   bow; Salabhasana, Bhujangasana and Dhanurasana named as preparations)
// - https://courses.bikramyogaworks.com/pages/ustrasana-camel-pose (26 & 2
//   execution: knees and feet six inches apart, hands on the hips with fingers
//   down and thumbs out, head back first, then one hand at a time to the heel
//   with the thumb outside and fingers inside, everything pushing forward for
//   the whole hold; two sets)
export const camel: ClassicalNote = {
  asana: 'Ustrasana',
  asanaEnglish: 'Camel Pose',
  etymology:
    'Uṣṭra means camel and can also denote a buffalo; it descends from Proto-Indo-Iranian *úštras and is cognate with Avestan uštra. Āsana is a seat or posture, so Uṣṭrāsana is Camel Pose. The name has not always meant this shape: the nineteenth-century Sritattvanidhi applies Ushtrasana to a standing pose, while the familiar kneeling backbend appears in twentieth-century accounts by Pattabhi Jois and B. K. S. Iyengar. There is no name clash between the 26 & 2 and classical forms compared here: item 22 in the Bikram sequence maps directly to Ustrasana.',
  reference: { plates: '40–41', difficulty: 3 },
  contrast:
    'The shared name points to the same kneeling backbend, but the teaching settings differ. The published Light on Yoga index places Ustrasana at entry 16, between Parighasana and Utkatasana, and records plates 40–41 with a difficulty of 3; two Iyengar-association syllabi independently confirm plate 41. The book-level claim stops there: the technique below comes from cited modern teaching pages, including Iyengar-method sources, not from an unchecked attribution to Iyengar himself. Those pages set parallel shins, vertical thighs and toes pointing back, begin with the hands at the hips, and finish with the hands on the heels or the palms resting on the soles; they also offer blocks, a wall or a bolster when the feet are out of reach. The 26 & 2 source narrows the base to about six inches, releases the head before the reach, takes the heels one hand at a time and keeps the hips moving forward; the pose page gives you two sets and lets the hands remain at the hips for a smaller arc. Its continuous glute engagement stays intact. Related teaching sources describe the pelvic action in different language, so the refinements here direct the existing lift without treating either lineage as a correction of the other. In this sequence Camel remains the final backbend, and Rabbit follows immediately.',
  refinements: [
    'Keep the knees, shins and feet in the parallel tracks established by the class setup. Press the shins and the tops of the feet down as the backs of the thighs rise, so the forward action lifts through the pelvis instead of carrying the knees past vertical.',
    'Arrange the chest before reaching: draw the shoulder blades inward and slightly down, send the breastbone upward, and let the region between the shoulder blades move toward the front body. This gives the class cue’s barrel-shaped arc a broad upper-back foundation.',
    'Rotate the upper arms outward before either hand leaves the hips. Keep that rotation as the hands descend, so the collarbones remain broad and the shoulders do not roll forward around the grip.',
    'Let the lower front ribs stay quiet while the side ribs and chest rise. The backbend can then spread along the trunk instead of turning the instruction to lift the chest into a thrust from the belly.',
    'Lengthen the back of the neck before releasing the head, then let the head follow the upper-back arc rather than lead it. Keep the breath moving, and use the pose page’s own limit: if the room spins, return upright and sit back.',
  ],
  stages: [
    'Kneel upright with the toes pointing straight back and keep both hands at the hips. Press the hips forward only until the thighs remain vertical, lift the chest and keep the gaze ahead; this is already the hands-on-hips half form.',
    'Keep both hands supporting the hips as the upper back begins to arc. Let the gaze travel upward and release the head only as far as the breath remains continuous; this is the complete smaller version given by the pose page’s Take care guidance.',
    'With the toes still pointing back, keep one hand at the hip while the other finds its heel. Return that hand and repeat on the second side, keeping the pelvis centred; this rehearses the one-hand-at-a-time entry without asking for the full grip.',
    'Take both heels in hand, release the head, lift the chest and keep the hips and thighs moving forward while you breathe. This is the full 26 & 2 form; reaching the soles belongs to the related Iyengar-method finish, not to this class stage.',
  ],
  ladder: {
    before: [
      'Virasana (Hero)',
      'Salabhasana (Locust)',
      'Bhujangasana (Cobra)',
      'Dhanurasana (Bow)',
    ],
    beyond: [
      'Urdhva Dhanurasana (Upward Bow)',
      'Kapotasana (Pigeon)',
      'Laghu Vajrasana (Little Thunderbolt)',
      'Eka Pada Rajakapotasana (One-Legged King Pigeon)',
    ],
  },
};
