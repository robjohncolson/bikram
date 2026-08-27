import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#12 Toe Stand Pose,
//   Pādāṅguṣṭhāsana; "nearest equivalent in other schools": Malasana)
// - https://en.wikipedia.org/wiki/Utthita_Padangusthasana (pada = foot,
//   angustha = big toe/thumb, asana = posture; Bikram's "Padangusthasana"
//   without "Utthita" is a different pose — a squat, one leg lightly crossed,
//   buttocks to the heel, no hand–foot contact despite the name; Light on
//   Yoga pp. 76–78 for the classical hand-to-toe balance)
// - https://en.wikipedia.org/wiki/Vrikshasana (Bikram calls tree "Tadasana",
//   folds the leg in half lotus and continues into Toe Stand with the thigh
//   resting on calf and heel; Gheranda Samhita 2.36)
// - https://en.wikipedia.org/wiki/Malasana (mala = garland, Iyengar's
//   arms-hanging-like-a-garland reading; Malasana I/Kanchyasana feet
//   together, arms wrapped behind; Malasana II hands round the heels, chin to
//   floor; the modern feet-apart prayer squat is Upaveshasana; Prapadasana =
//   heels together, feet on tiptoe; Light on Yoga pp. 261–267; the
//   Sritattvanidhi's "Malasana" is today's Bhujapidasana)
// - https://en.wikipedia.org/wiki/Utkatasana (utkata = intense, above the
//   usual, fierce; modern chair form vs. the older low squat; listed in the
//   Hatha Yoga Pradipika; Sritattvanidhi form per Sjoman)
// - https://www.wisdomlib.org/definition/utkatasana (Gheranda Samhita 2.27:
//   big toes fixed on the ground, heels raised, seat placed on the heels;
//   Sritattvanidhi v. 104 gives a different, soles-down shape)
// - https://en.wikipedia.org/wiki/Uttanasana (20th-c. forward-bend family,
//   Light on Yoga pp. 91–93; Padahastasana = hands under the feet)
// - https://iyengaryogaintroassessment.wordpress.com/padangusthasana-concave-and-downward-extending-spine/
//   (Iyengar's Padangusthasana, plates 43–44: fingers hook the big toes,
//   concave-back stage before the head goes down)
// - https://en.wikipedia.org/wiki/Lotus_position (padma = lotus; half lotus;
//   the knee/meniscus risk when rotation is forced below the hip)
// - https://en.wikipedia.org/wiki/Pasasana (pasa = noose; entered from the
//   Upaveshasana squat; Sritattvanidhi; Light on Yoga)
// - https://en.wikipedia.org/wiki/Garudasana (Vatayanasana is its kneeling
//   half-lotus variant)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 1–60 difficulty grades)
// - https://en.wikipedia.org/wiki/Bikram_Yoga (sequence devised from B. C.
//   Ghosh's teaching; 26 postures in a heated room)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Padangusthasana #18, p. 89, grade 3, plates 43–44; Utkatasana p. 88,
//   grade 2, plate 42; Tadasana plate 1 / grade 1; Vrksasana p. 62, grade 1,
//   plate 2; Ardha Baddha Padmottanasana p. 94, grade 9, plates 50–55;
//   Vatayanasana p. 98, grade 11, plates 57–59; Padmasana p. 129, grade 4,
//   plates 104–105; Malasana I p. 262, grade 8, plates 317–321; Malasana II
//   p. 266, grade 2, plate 322; Pasasana p. 267, grade 15, plates 323–329)
// - https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (plates cross-checked: Vrksasana 2, Utkatasana 42, Padangusthasana 44,
//   Ardha Baddha Padmottanasana 52, Vatayanasana 58, Padmasana 104,
//   Malasana I 321 / II 322, Pasasana 328–329; Vrksasana and Utkatasana sit
//   in Level 1, Ardha Baddha Padmottanasana in Level 2, Vatayanasana,
//   Malasana I and Pasasana in Level 3)
// - https://yogainternational.com/article/view/vatayanasana-horse-face-pose/
//   (half lotus, lower onto the lotus knee, standing foot flat, eagle arms,
//   30 s per side, blanket under the knee; Iyengar's own remark that balance
//   and the knees are difficult at first)
// - https://www.ashtangayoga.info/ashtanga-yoga/primary-series-yoga-chikitsa-1/200427-ardha-baddha-padmottanasana-ronald-richard/
//   (ardha/baddha/padma/uttana; the rotation must come from the hip joint so
//   the knee takes almost no sideways load; foot into the groin; bind at the
//   hip crest; bend the standing knee to come up)
// - https://www.karineisen.com/blog/from-vrksasana-to-ardha-baddha-padmottanasana
//   (Iyengar syllabus order: Vrksasana at Level I → Utthita Ardha Padmasana
//   at Level II → Ardha Baddha Padmottanasana, with Uttanasana as prerequisite)
// - https://yogavastu.com/p/utkatasana/ (Iyengar-method Utkatasana: sit back
//   as into a chair, trunk lifts through the crown, shins/knees/thighs stay
//   parallel and do not cave in, four corners of the feet)
// - https://yogavastu.com/p/malasana/ (Iyengar-method Malasana: weight
//   settles into the heels, spine lengthens; Uttanasana before it)
// - https://www.yogaru.ie/pause/vrksasana-tree and
//   https://insideyoga.org/asana-library/vrksasana/ (Iyengar-style tree
//   actions: foot presses the thigh and the thigh presses back; kneecap of the
//   standing leg lifted; hip points levelled by hand)
// - https://www.sikana.tv/en/sport/yoga/prapadasana (tiptoe squat: heels
//   raised, palms together, knees drawn in, 15–20 s)
// - https://courses.bikramyogaworks.com/pages/padangustasana-toe-stand-pose
//   (26 & 2 entry: from Tree, bend and fold, fingertips down, sit on the heel,
//   spine upright; gaze on a floor spot about four feet ahead; exit by
//   reversing the entry)
// - https://www.adelaidehillsbikram.com.au/yoga-tutorials/bikram-posture-12-toe-stand/
//   (weight settled evenly before descending; standing leg locked while
//   bending forward; palms pressed at the chest once the balance is sure)
//
// No `reference`: Light on Yoga has no toe-stand entry, so there is no plate
// or grade to cite for this posture itself. Plates and grades quoted in the
// text belong to its neighbours and were verified against the index sheet
// and the UK teaching syllabus above.
export const toeStand: ClassicalNote = {
  asana: null,
  etymology:
    'Pada is the foot, angustha the big toe (Sanskrit uses one word for the big toe and the thumb) and asana a seat or posture — a big-toe pose, and 26 & 2 earns the name literally by standing you on the ball of one foot with the toes spread into the floor. In Light on Yoga the same name belongs to a different shape entirely: Iyengar’s Padangusthasana (plates 43–44, graded 3) is a standing forward bend in which the fingers hook the big toes, so the classical name promises a hand-to-foot pose, and the toe stand never brings a hand near the foot — here the toe is the ground you balance on, not the thing you hold. The shape’s older name is arguably Utkatasana, from utkata, “intense, towering, fierce”: the seventeenth-century Gheranda Samhita gives that name to a squat with only the toes on the ground, heels in the air and the seat resting on them — the toe stand’s balance point, three centuries before “Utkatasana” came to mean a chair.',
  contrast:
    'Light on Yoga has no toe stand, so the classical view of this posture is triangulated from three neighbours rather than read off one plate. The nearest thing in Iyengar’s book is Vatayanasana (plates 57–59, graded 11): the same half lotus over the same bending standing leg, but the folded knee is lowered all the way to the floor on a flat standing foot and the arms wrap as in eagle — a kneeling pose that gives up the balance and asks more of the hip and knee instead, and one Iyengar himself notes is hard on the knees and the balance to begin with. The posture chart Wikipedia reproduces from the Bikram lineage names Malasana as the nearest equivalent, and the resemblance is the squat: Iyengar’s Malasana II (plate 322, graded 2) sits the heels down with the feet together and lets the spine round and the arms hang like the garland the name means, while Malasana I (plates 317–321, graded 8) binds the arms behind the back — heels grounded and folded forward in both, exactly where the toe stand lifts the heel and keeps the spine upright, so the truer two-footed cousin is the tiptoe squat the modern repertoire calls Prapadasana, which Light on Yoga leaves out. Even your way in has a classical name: half lotus, fold forward, fingertips to the floor is Ardha Baddha Padmottanasana (plates 50–55, graded 9) without its bind — Iyengar keeps the standing leg straight and stays in the fold, where 26 & 2 bends that leg and sinks through it. The differences are choices, not corrections: the Iyengar squats keep the heels grounded because their purpose is length in the ankles, groins and back (a heel that will not reach the floor is, in that method, propped rather than left to float), while 26 & 2 lifts the heel on purpose, because a raised heel turns a stretch into a balance, and balance — total control on the way to the floor, held by one fixed gaze in a room hot enough to make the deep half-lotus squat available — is what the twelfth posture is for; Iyengar’s hold is a single longer one (thirty seconds a side for Vatayanasana), while 26 & 2 gives one counted set of about forty seconds per side and treats the descent and the rise as part of the posture.',
  refinements: [
    'Build the standing foot the way Iyengar builds Tadasana before the heel ever lifts: toes spread, the mound of the big toe and the mound of the little toe both pressing, the ankle centred over the ball of the foot. Once the heel rises the ball of the foot is your entire ground, so keep the big-toe mound heavy — the moment it lightens the ankle rolls outward and the balance goes with it.',
    'Turn the lotus leg from the hip, never the knee. In the Iyengar method the folded knee comes down because the thigh rotates outward in its socket with the shin and foot riding along as one piece; keep the lifted foot alive — toes drawn back toward the shin — and let the standing thigh press back into it as the foot presses in, the same two-way squeeze that holds Vrksasana. If the knee is what feels the fold, the foot is too high, and Tree with the foot lower is the posture to be in.',
    'Level the pelvis before you sink. The lotus-side hip rides up and back as the knee lifts; draw that hip crease down and forward until both hip points face the front, then keep them facing the front on the way down — an asymmetric pose in the Iyengar method is practised until it reads as evenly as a symmetric one, and here the level pelvis is what lets the folded knee reach toward level without the trunk tipping after it.',
    'Let the trunk rise as the hips sink — Iyengar’s Utkatasana rule: the seat goes down and back while the sternum lifts and the side ribs lengthen up out of the pelvis, so the fingertips carry balance rather than the weight of a slumped spine, and the palms can leave the floor without anything above them having to change.',
    'Keep the standing knee pointed where the toes point. In the Iyengar method the shin, knee and thigh of a bent standing leg stay in one plane; if the knee drifts inward as you descend the ankle follows it and the ball of the foot tilts onto its outer edge — track the knee over the second toe on the way down and, just as carefully, on the way up.',
  ],
  stages: [
    'Two feet first: Prapadasana, the tiptoe squat (the shape the Gheranda Samhita calls Utkatasana) — heels lifted and touching, seat resting on the heels, palms together, spine tall. Learn the balance point with two feet before you ask one foot to do it alone; a wall at your back turns wobbles into touches.',
    'From Tree, fold forward and take the fingertips to the floor, then bend the standing knee and descend only halfway, heel still on the ground — Ardha Baddha Padmottanasana without its bind, on a bending leg. This is the partial descent the dizziness caution asks for, and a complete practice on its own.',
    'The full descent onto the lifted heel with both sets of fingertips on the floor and the spine upright; make the fingers lighter, then lift one hand to the chest and leave the other down.',
    'The complete form: seat on the heel, spine tall, palms together at the chest, gaze welded to its spot on the floor — and, in the Iyengar spirit of practising both sides to the same standard, rising back to Tree as slowly as you came down.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Vrksasana (Tree)',
      'Utkatasana (Chair)',
      'Malasana (Garland)',
    ],
    beyond: [
      'Ardha Baddha Padmottanasana (Half-Bound Lotus Forward Bend)',
      'Vatayanasana (Horse)',
      'Pasasana (Noose)',
      'Padmasana (Lotus)',
    ],
  },
};
