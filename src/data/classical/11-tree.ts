import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Vrikshasana (vrksa = tree, asana = posture;
//   described in the 17th-c. Gheranda Samhita 2.36; a 7th-c. Mamallapuram
//   relief of a one-legged figure is suggested by Tias Little as an early
//   instance; foot on the inner thigh or in half lotus; arms overhead with
//   or without joined palms; Bikram Yoga calls the pose Tadasana and carries
//   the half lotus on into the toe-stand squat; Light on Yoga p. 62)
// - https://en.wikipedia.org/wiki/Tadasana (tada = mountain; Samasthiti =
//   sama "even" + sthiti "standing"; absent from medieval hatha texts, first
//   recorded in the 1896 Vyayama Dipika, taken into yoga in early-20th-c.
//   Mysore under Krishnamacharya; LoY p. 41 basic description)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#11 Tree Pose is
//   Tāḍāsana, nearest Vrikshasana; #12 Toe Stand is Pādāṅguṣṭhāsana, nearest
//   Malasana; Bikram's Sanskrit names differ from other schools')
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; ~200 asanas, ~600
//   photographs; 1–60 difficulty grades; pranayama section; course appendix)
// - https://en.wikipedia.org/wiki/List_of_asanas (Vrikshasana standing/
//   balancing, 17th-c. GhS; Tadasana and Natarajasana 20th-c.; Padmasana
//   4th-c. DU)
// - https://en.wikipedia.org/wiki/Utthita_Padangusthasana (LoY pp. 76–78;
//   Bikram's Padangusthasana #12 is a different pose, no hand-to-foot contact)
// - https://en.wikipedia.org/wiki/Natarajasana (LoY pp. 419–422; listed with
//   Vrksasana, Garudasana and Ardha Chandrasana among one-legged standing
//   poses; 20th-c., Krishnamacharya → Iyengar)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Tadasana #1, p. 61, grade 1, plate 1; Vrksasana #2, p. 62, grade 1,
//   plate 2; Ardha Baddha Padmottanasana p. 94, grade 9, plates 50–55;
//   Padmasana p. 129, grade 4, plates 104–105; Vatayanasana p. 98, grade 11,
//   plates 57–59; Natarajasana p. 419, grade 58, plates 587–591a; Baddha
//   Konasana p. 128, grade 3, plates 101–103; Virasana p. 120, grade 1,
//   plates 85–92; Utthita Hasta Padangusthasana p. 76, grade 16, plates 20–23)
// - Plate 2 cross-checked in three Iyengar-association syllabi (each lists
//   Tadasana 1, Vrksasana 2 at the introductory level):
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
// - https://www.hoiy.org/kb/vrksasana/ (Iyengar study-group notes: plate 2;
//   knee bent out to the side; sole against the inner thigh, toes pointing
//   down; Urdhva Namaskarasana arms; wall for balance)
// - https://www.ihanuman.com/asana/vrksasana (classical steps: from Tadasana,
//   heel at the root of the opposite thigh, toes down, palms joined and raised
//   overhead, breathe, return; preparation Baddha Konasana, Sukhasana,
//   Tadasana, Virasana; follow-on Ardha Chandrasana, Janu Sirsasana, Utthita
//   Trikonasana; wall with the arm sliding up it; eyes-closed progression;
//   Gheranda Samhita II.36)
// - https://yogavastu.com/p/vrksasana/ (Iyengar-method teaching: root through
//   the standing foot as the other knee bends out to the side; draw the spine
//   up; palms joined overhead = Urdhva Namaskarasana, palms apart = Urdhva
//   Hastasana as a lighter shoulder option)
// - https://www.ohmyyoga.com.au/blog/vrksasana (foot on the inner thigh, toes
//   down; 20–30 s hold; wall, holding the ankle, or a belt around the ankle;
//   palms at the chest before extending up)
// - https://www.youtube.com/watch?v=3qRfGonMaik ("02 Tree Pose | Vrksasana |
//   Light on Yoga Challenge" — plate-2 numbering, title only)
export const tree: ClassicalNote = {
  asana: 'Vrksasana',
  asanaEnglish: 'Tree Pose',
  etymology:
    'Vrksa is “tree” and asana “a seat” or “posture”, so the classical name simply says what you are about to become; tada is “mountain”, and in Light on Yoga Tadasana — also called Samasthiti, “even standing” — is the two-footed mountain at plate 1, with Vrksasana following it at plate 2. 26 & 2 gives the tree the mountain’s name, so when an Iyengar teacher says Tadasana they mean the upright stance you are in before the foot ever lifts. The tree is the older shape: the seventeenth-century Gheranda Samhita describes it (verse 2.36), and a seventh-century relief at Mamallapuram of a figure standing on one leg is sometimes read as an early tree, whereas the mountain is a modern arrival, first recorded in an 1896 exercise manual and taken into yoga in early-twentieth-century Mysore.',
  reference: { plates: '2', difficulty: 1 },
  contrast:
    'The two lineages agree almost completely on the legs: Iyengar’s Vrksasana — plate 2, graded 1, the second entry in Light on Yoga and the first one-legged balance he teaches — sets the heel high at the root of the opposite thigh with the toes pointing straight down, which is exactly where 26 & 2 sends your heel toward the hip crease. What differs is the finish and the purpose: Iyengar joins the palms and takes the arms straight up overhead (Urdhva Namaskarasana), so the whole line from standing foot to fingertips grows upward like the tree of the name, and the foot is held in place by the press of sole into thigh rather than by a hand; 26 & 2 keeps the palms at the chest, lets one hand hold the foot for as long as you need it, and makes the pressing-down of the folded knee the main event. That is because in the 26 & 2 sequence Tree is the doorway to Toe Stand — the same half lotus is about to be carried down into a squat on the ball of one foot — so the hips are opened and levelled here, the arms stay low and quiet, and the heat of the room is what makes the hip work available. The holds differ too: as Iyengar teachers time it, the classical form is a shorter hold of roughly twenty to thirty seconds of even breathing on each side, while 26 & 2 gives you about forty-five seconds a side, right then left, with the eyes fixed on one point. Neither is the other done wrong — the overhead arms are a shoulder opener and a test of balance at full height; the chest-height prayer is the calm before the descent.',
  refinements: [
    'Build the standing leg the way Iyengar builds Tadasana before the other foot ever lifts: weight spread through the whole sole, inner and outer heel both down, kneecap facing straight ahead and drawn up by the front of the thigh — so that 26 & 2’s locked knee is a lifted, working quadriceps rather than a joint pushed backward.',
    'Make the foot stay by pressure, not grip: the sole presses into the inner thigh and the thigh presses back into the sole, toes pointing straight down. In the Iyengar method that two-way press is what holds the foot once the hand lets go — practise it while your hand is still there, and the release becomes an afterthought.',
    'Open the knee from the hip, not the knee: the bent leg turns out in its socket so the knee swings sideways and down, the pressing-down cue lands in the hip joint where it belongs, and the hip point on that side stays level with the other instead of hitching up.',
    'Grow upward as you root downward. Iyengar’s arms go overhead to draw the spine long; even with the palms at the chest you can do the same with the trunk — side ribs lifted out of the pelvis, tailbone reaching down, crown rising — so the tree gets taller, not just stiller.',
    'Fix the eyes on one unmoving point at eye level and keep the breath even; in the Iyengar method the pose is counted as a practice of concentration first and a hip opener second, and the balance follows the gaze.',
  ],
  stages: [
    'Back against a wall, the lifted foot resting at the ankle or the calf (below the knee, never on it), hands on the hips: learn the level pelvis and the lifted standing kneecap with nothing to lose.',
    'Foot high on the inner thigh, held there by a hand as 26 & 2 allows — or, Iyengar-style, by a belt looped around the ankle — with the other hand on the hip; find the sole-into-thigh press.',
    'The 26 & 2 form: hand released, folded knee pressing down, palms together at the chest, gaze fixed, about forty-five seconds a side.',
    'The classical finish, for practice outside class: from the same balance, join the palms and straighten the arms overhead, breathing evenly for twenty to thirty seconds; once that is steady, Iyengar-lineage teachers progress to closing the eyes.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Baddha Konasana (Bound Angle)',
      'Virasana (Hero)',
      'Sukhasana (Easy Seat)',
    ],
    beyond: [
      'Ardha Baddha Padmottanasana (Half-Bound Lotus Forward Bend)',
      'Vatayanasana (Horse)',
      'Padmasana (Lotus)',
      'Natarajasana (Lord of the Dance)',
    ],
  },
};
