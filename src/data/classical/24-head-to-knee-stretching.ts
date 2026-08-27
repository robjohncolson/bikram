import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#24 Jānuśīrṣāsana
//   with Paścimottānāsana, "Head To Knee Pose with Back Stretching Pose";
//   nearest equivalent in other schools given as Janusirsasana; the sequence
//   devised c. 1971)
// - https://en.wikipedia.org/wiki/Janusirsasana (janu = knee, sirsa = head;
//   one leg extended, the other bent with the knee pointing away and the sole
//   by the groin, the trunk folding over the extended leg; a modern pose —
//   Krishnamacharya's 1934 Yoga Makaranda, then Ashtanga Vinyasa; Light on
//   Yoga 1979 ed. pp. 148–151)
// - https://en.wikipedia.org/wiki/Paschimottanasana (paschima = west / the
//   back of the body, the sushumna in subtle-body usage; uttana = intense
//   stretch; in the Hatha Yoga Pradipika 1.28–29, the Shiva Samhita and the
//   Gheranda Samhita; entered from Dandasana; variations Urdhva Mukha
//   Paschimottanasana / Ubhaya Padangusthasana, Parivrtta Paschimottanasana,
//   Upavistha Konasana, Janusirsasana; belt/blanket/bolster props)
// - https://en.wikipedia.org/wiki/List_of_asanas (Janusirsasana, Upavistha
//   Konasana and Marichyasana 20th c., Krishnamacharya; Paschimottanasana
//   15th c., Hatha Yoga Pradipika; Dandasana 8th c.; Kurmasana 7th c.;
//   Krounchasana and Yoganidrasana 17th c.)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 200+ asanas, c. 600
//   photographs; every asana graded 1–60; asanas then pranayama)
// - https://www.wisdomlib.org/definition/paschimottanasana (paścima = back,
//   uttāna = stretched, āsana = posture; the Gheranda Samhita definition:
//   legs on the ground like a stick, forehead between the knees, hands
//   holding the toes)
// - https://www.wisdomlib.org/definition/pashcima (western; behind, hinder;
//   later; last; Amanaska Yoga: the path at the back of the yogin's body)
// - https://www.wisdomlib.org/definition/uttana (ud + tan, "to stretch";
//   stretched out, spread out; supine, face up; turned upward)
// - https://schoolofyoga.in/hatha-yoga-pradeepika-chapter-1/ (HYP 1.28–29:
//   legs on the ground like a stick, toes caught with the hands, forehead on
//   the knees; said to move the vital wind along the rear channel, kindle the
//   digestive fire and slim the loins; chapter 1 describes about 15 asanas;
//   the text names Siddhasana, not this pose, as foremost)
// - https://www.ghoshyoga.org/postures-of-ghosh-yoga.html (Ghosh Yoga's
//   collation of the lineage's publications: Janushirasana is #5 "Head to
//   Knee Posture" and Paschimottanasana #6 "Stretching Posture", separate
//   entries in all five — Bishnu Ghosh, Buddha Bose, Gouri Shankar Mukerji,
//   Monotosh Roy, P. S. Das)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Janu Sirsasana #59, p. 148, intensity 5, plates 126–129; Parivrtta Janu
//   Sirsasana p. 151, grade 9, plates 130–132; Ardha Baddha Padma
//   Paschimottanasana grade 8, plates 133–137; Trianga Mukhaikapada
//   Paschimottanasana grade 5, plates 138–139; Krounchasana grade 10, plates
//   140–142; Marichyasana I grade 5, plates 143–144; Upavistha Konasana grade
//   9, plates 148–152; Paschimottanasana #67, p. 166, intensity 6, plates
//   153–162; Parivrtta Paschimottanasana grade 9, plates 163–166; Ubhaya
//   Padangusthasana grade 3, plate 167; Urdhva Mukha Paschimottanasana I / II
//   grade 10, plates 168 / 169–170; Dandasana p. 112, grade 2, plate 77;
//   Baddha Konasana grade 3, plates 101–103; Uttanasana grade 8, plates
//   47–48; Supta Padangusthasana grade 13, plates 284–287; Kurmasana grade
//   14, plates 360–367)
// - Plates cross-checked in three Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Level 1, filed under "Paschima Pratana Sthiti – Forward Extension
//   Asanas": Janu Sirsasana 127, Trianga Mukhaikapada Paschimottanasana 139,
//   Marichyasana I 144, Parsva Upavista Konasana 152, Paschimottanasana 161
//   "(Ugrasana/Brahmacharyasana)"; Dandasana 77 among the sitting asanas;
//   Level 2: Parivrtta Janu Sirsasana 132, Ardha Baddha Padma
//   Paschimottanasana 135, Parivrtta Paschimottanasana 165, Ubhaya
//   Padangusthasana 167, Kurmasana 363–364; Level 3: Urdhva Mukha
//   Paschimottanasana I 168, II 170)
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Dandasana 77; Triang Mukhaikapada 139; Marichyasana I 143 "twist only
//   with a clasp"; Upavistha Konasana 148 "concave back and holding toes";
//   Janu Sirsasana 127; Paschimottanasana 160 "(Ugrasana"; Kurmasana 363–364
//   "stage 1 – arms extended sideways")
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   (Janu Sirsasana 127, Trianga Mukhaikapada 139, Marichyasana I 144,
//   Parsva Upavistha Konasana 152, Paschimottanasana 161)
// - https://yoganga.com/articles/paschimottanasana/ (Marla Apt, Iyengar
//   method: Dandasana on folded blankets; thighs pressed down, the inner
//   edges of the legs into the floor, heels reaching away from the pelvis,
//   tops of the thighs turning in; three variations — concave back with a
//   belt, then block or heels, then clasped heels and folding; lift the front
//   body from pelvis to throat; navel and sternum toward the toes rather than
//   the head forced down; fold at the hips not the waist; back ribs down,
//   chest and collarbones broad; lower back extending toward the head;
//   errors — folding from the waist, head forced down into a coil, head
//   hanging below the chest, shoulders or throat tightened; forehead on a
//   bolster, blankets or a chair; Geeta Iyengar holding students for several
//   minutes; lengthen on the inhale, extend on the exhale)
// - https://www.karineisen.com/blog/arogya-yoga-chapter-19nbsp-janu-sirsasana-the-king-of-forward-bends
//   (Iyengar's Arogya Yoga on Janu Sirsasana: bent knee at about 90° with the
//   sole on the inner thigh for stiffer hips, drawn further back for open
//   ones; the trunk reaches forward symmetrically, the side opposite the bent
//   knee working harder; belt; four stages — utthita, urdhva hasta, urdhva
//   mukha (concave), adho mukha (forehead, nose, chin to the knee))
// - https://www.karineisen.com/blog/arogya-yoga-chapter-20-paschimottanasana
//   (Arogya Yoga on Paschimottanasana: inner ankles and heels extended
//   forward; legs kept even; knees kept straight rather than bent to lessen
//   the pull; buttocks and thighs broadened, not clenched, a gripped base
//   blamed for the low back and legs complaining; sit elevated so the fold
//   happens at the hips; block under the heels when the knees will not
//   straighten)
// - https://yogavastu.com/p/janu-sirsasana/ (bent knee out to the side,
//   sitting bones pointing down; a twist folded into a forward bend; belt;
//   head supported for the quieting effect; usually the first pose of a
//   seated forward-bend sequence)
// - https://yogavastu.com/p/paschimottanasana/ (backs of the legs pressed to
//   the floor; belt; inward movement of the dorsal spine; usually the last
//   pose of a seated forward-bend sequence; Janu Sirsasana and Triang
//   Mukhaikapada as its companions)
// - https://www.yogainperson.com/single-post/janu-sirsasana (heel extended,
//   kneecap lifted, thigh pressed down; the heart faces the straight leg's
//   foot; grip progression strap → shin or foot → beyond the foot with
//   clasped fingers or a wrist hold; inhale to lengthen, exhale to fold;
//   block under the bent knee; rolled blanket under the straight knee)
// - https://biyome.com.au/yoga/asana-manual/janu-sirsasana/ (heel near the
//   perineum, an obtuse angle between the legs, the bent leg's outer calf and
//   thigh on the floor; grip progression toes → sole → heel → wrist clasp
//   beyond the foot; concave on the inhale, fold on the exhale with the
//   elbows wide; forehead, nose, lips and chin lowered past the knee in turn;
//   30–60 s; error — the bent foot slipping under the straight leg)
//
// `asana` names both classical entries because the 26 & 2 posture is the two
// of them back to back; `reference.plates` carries both plate runs and the
// grade is the harder half's (Paschimottanasana 6 — Janu Sirsasana is 5;
// both are spelled out in the contrast).
export const headToKneeStretching: ClassicalNote = {
  asana: 'Janu Sirsasana and Paschimottanasana',
  asanaEnglish: 'Head-to-Knee Pose and Seated Forward Bend',
  etymology:
    'Jānu is the knee and śīrṣa the head, so the first name states its own goal, and the studio spelling Janushirasana and Iyengar’s Janu Sirsasana are one word for a young shape — the pose is not in the old hatha texts and first turns up in Krishnamacharya’s teaching of the 1930s. Paścima means west and, by extension, what lies behind: in the yoga texts it is the back of the body, the side the spine and the suṣumṇā channel run along (the usual gloss being that the practitioner faces the rising sun, so the front is east and the back is west), and uttāna, from ud, “up”, and tan, “to stretch”, is a stretching-out or spreading — the same word that makes Uttanasana — so Paschimottanasana is the stretching-out of the west side, heels to skull. The Ghosh lineage’s plain English “Stretching Posture” is simply that uttāna translated; Light on Yoga also records the pose’s older names Ugrasana and Brahmacharyasana, and this is one of the oldest shapes in 26 & 2 — the fifteenth-century Hatha Yoga Pradipika already describes it much as the class does it, legs on the ground like a stick, hands to the toes, forehead to the knees.',
  reference: { plates: '126–129 and 153–162', difficulty: 6 },
  contrast:
    'Light on Yoga files these as two separate asanas some twenty plates apart — Janu Sirsasana at plates 126–129, graded 5, and Paschimottanasana at plates 153–162, graded 6, with the revolved, half-lotus, three-limbed and Marichi forward bends in between — and the Ghosh lineage lists them separately too, at 5 and 6 of its longer repertoire; joining them into one numbered posture, right side, left side, both legs, is Bikram’s arrangement, though the order is orthodox, since Iyengar teachers also open a seated forward-bend sequence with Janu Sirsasana and close it with Paschimottanasana. The head is where the two methods part company: in the Iyengar version the leg is never bent to buy the touch — you sit up on folded blankets, take a belt round the foot when the hands cannot reach, and pass through upright, arms-lifted and concave stages, lifting the front of the trunk and sending navel and breastbone toward the toes, before the face comes down at all, and when it does it arrives along the shin, forehead and then nose, lips and chin past the knee — whereas 26 & 2 puts the forehead on the knee first, chin tucked and spine rounded, bends the knee as much as that takes, and only then works the leg straight under a head that does not lift. Neither is the other one done badly: the Iyengar fold is a long front body arriving late at the leg, while the 26 & 2 head-to-knee is a compression posture — the seated twin of the standing head-to-knee, with the same chin-tuck and the same traditional thyroid claim — and its flexed foot, pulled back by ten interlaced fingers with the elbows dropping toward the floor either side of the calf, makes the arms a lever the classical toe, heel and wrist grips are not meant to be. The stretching pose then closes the gap almost entirely: hinge at the hips, lay belly and chest along the thighs, reach the face past the knees, elbows toward the floor — the class and the Iyengar method give the same instructions in the same order, and the classical grip merely continues past the feet, hands round the heels or one wrist caught beyond the soles. What the heated room and two counted sets replace is Iyengar’s toolkit and clock — blankets under the hips, a belt, a bolster across the shins for the forehead, holds of several minutes with the head resting — so that the same length the Iyengar method assembles slowly from the base up, the class reaches after Camel and Rabbit have opened the spine both ways, with the heat doing the work the props would.',
  refinements: [
    'Build Dandasana under both folds the way the Iyengar method does before anything bends: sit forward onto the front of the sitting bones — on a folded blanket if the low back rounds, which is exactly what your disc caution asks for — press the inner edges of both legs and the backs of the thighs into the floor, reach the heels away and draw the kneecaps up. That is the class’s pull-the-toes-back, press-the-heel-away, engage-the-quadriceps cue with a foundation under it: the hamstrings let go for a leg that is working, not for one being hauled on.',
    'Square by sending the far side further. In Janu Sirsasana the side of the trunk away from the bent knee has less far to travel and drifts ahead; Iyengar teachers have the navel turn to face the straight thigh and the ribs on the bent-knee side reach forward to catch up, while the bent leg’s outer thigh and calf settle toward the floor and its foot is kept from sliding under the straight leg. The setup line “square the torso over the extended leg” means this, and it keeps both sitting bones down instead of one hip lifting to shorten the reach.',
    'Lengthen first, then fold — even into the rounded head-to-knee. The Iyengar order is upright, then concave (breastbone lifted, gaze forward, on an inhale), then down (on the exhale), with navel and sternum travelling toward the toes and the fold hinging at the tops of the thighs rather than the waist, so the back ribs sink and widen instead of the lower back bulging. Take that inhale-long, exhale-down rhythm into both sets — it is the breath line the class already gives you — and let the chin-tuck curl be what you add on top of a long spine, not what you do instead of it.',
    'Keep the shoulders out of the neck as the elbows drop. In the classical fold the arms widen as the trunk goes down, the elbows travelling outward and the collarbones staying broad, so the shoulders never climb toward the ears; the 26 & 2 grip bends the elbows down beside the calf, so let them go down and a little out, keep the throat and jaw soft, and let the arms hold what the legs and the fold give — the cue to deepen rather than yank is the Iyengar rule that the arms do not pull the head down.',
    'Broaden the base and breathe into the back. Iyengar’s later teaching on this pose has the buttocks and thighs spread rather than clenched — a gripped base, he warns, is what sets the low back and legs complaining — and once the belly lies on the thighs the inhale has only the back of the ribs to fill, so widen there and let each exhale settle you the half-inch the class asks for.',
  ],
  stages: [
    'Dandasana with the belt: sit up on folded blankets, legs straight, a belt round the soles held in both hands, spine tall and chest lifted — the Iyengar first phase, where the legs learn their work before anything folds. Do it with one knee bent and the sole at the inner thigh, too, for the head-to-knee shape.',
    'The concave stage: hands or belt to the foot, inhale, lift the breastbone and look forward with the back hollow and the leg straight — the trunk about halfway down — and hold there, breathing. The class offers the other side of the same trade, forehead on the knee with the knee bent; the Iyengar syllabi keep the leg straight and delay the head. Either is the posture at this stage.',
    'Head down onto support: a bolster or folded blanket across the shin or thighs for the forehead, the leg as straight as it will go, so the fold can be held long and quiet — the way Iyengar teachers hold students for minutes with the head resting. At home, or between sets, this is how the length arrives without pulling.',
    'The complete forms: forehead on the knee with the toes pulled back, the leg straightening under it, elbows down; then both legs together, belly, chest and face laid along the thighs and past the knees, hands at the feet or big toes — or, as Iyengar-method teachers finish it, one wrist caught beyond the soles.',
  ],
  ladder: {
    before: [
      'Dandasana (Staff)',
      'Baddha Konasana (Bound Angle)',
      'Supta Padangusthasana (Reclining Hand-to-Big-Toe)',
      'Uttanasana (Standing Forward Bend)',
    ],
    beyond: [
      'Triang Mukhaikapada Paschimottanasana (Three-Limbed Forward Bend)',
      'Parivrtta Janu Sirsasana (Revolved Head-to-Knee)',
      'Urdhva Mukha Paschimottanasana (Upward-Facing Forward Bend)',
      'Kurmasana (Tortoise)',
    ],
  },
};
