import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#5 Standing Head
//   to Knee, Daṇḍāyamana Jānuśīrṣāsana, cross-linked to the classical
//   Utthita Padangusthasana; the 26-posture sequence assembled c. 1971)
// - https://en.wikipedia.org/wiki/Utthita_Padangusthasana (utthita =
//   extended, hasta = hand, pada = foot, angustha = big toe/thumb; Form I leg
//   forward with the other hand on the hip, Form II leg to the side; the
//   same-side hand holds the foot; absent from the medieval hatha texts,
//   present in early-20th-c. Danish gymnastics and in India by the 1920s via
//   Kuvalayananda and Krishnamacharya; opens the Ashtanga primary series;
//   Light on Yoga 1979 ed. pp. 76–78; belt, wall and bent-knee modifications)
// - https://en.wikipedia.org/wiki/Janusirsasana (janu = knee, sirsa = head;
//   the seated head-to-knee forward bend; Light on Yoga pp. 148–151)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 1–60 difficulty
//   grades; Utthita Trikonasana graded 3)
// - https://en.wikipedia.org/wiki/List_of_asanas (Utthita Hasta
//   Padangusthasana, Janusirsasana, Supta Padangusthasana and Tadasana all
//   first documented 20th c. by Krishnamacharya; Vrksasana 17th-c. Gheranda
//   Samhita; Trivikramasana in 13th–18th-c. dance statuary)
// - https://www.wisdomlib.org/definition/dandayamana and
//   https://www.wisdomlib.org/definition/dandaya (Cappeller: daṇḍāyamāna
//   "resembling the stem of"; Monier-Williams: the denominative daṇḍāya-
//   "to stand erect", "to resemble a staff")
// - https://www.yogapedia.com/definition/6450/dandayamana-janushirasana
//   (the studio gloss danda = stick, yamana = balancing/maintaining; fifth of
//   the 26; execution: fingers interlocked round the sole, leg extended
//   parallel, head to knee)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Utthita [Hasta] Padangusthasana #11, p. 76, intensity 16, plates 20–23;
//   Janu Sirsasana #59, p. 148, intensity 5, plates 126–129; Supta
//   Padangusthasana p. 244, intensity 13, plates 284–287; Padangusthasana
//   p. 89, intensity 3, plates 43–44; Uttanasana p. 92, intensity 8, plates
//   47–48; Urdhva Prasarita Ekapadasana p. 93, intensity 6, plate 49;
//   Virabhadrasana III p. 73, intensity 5, plates 16–17; Supta Trivikramasana
//   p. 356, intensity 39, plate 478; Tadasana plate 1 / grade 1; Vrksasana
//   plate 2 / grade 1)
// - Plates cross-checked in three Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (UHP I without support: plate 23; I/II with support: Gem plates 120–123)
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   (UHP I/II with support: Gem plates 120–123)
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (plates 20–21 with the foot supported; plates 20–23 without support,
//   "stage 1 hands holding the foot, stage 2 head to knee")
// - https://yogavastu.com/p/utthita-hasta-padangusthasana/ (Iyengar-method
//   teaching: entered from Tadasana keeping the Tadasana line; belt when the
//   hamstrings are short; wall for balance; a foot-supported variation; Supta
//   Padangusthasana as the preparation)
// - http://biynew.blogspot.com/2013/01/utthita-parsva-hasta-padangustasana.html
//   (Iyengar studio notes: two fingers and thumb round the big toe; heel drawn
//   in before the leg extends; inner foot firm, toes spread, inner ankle
//   descending, lift from inner knee to groin, thigh flesh onto the bone;
//   kneecap drawn back; sitting bones level, side ribs even, sternum lifted;
//   hand on the standing hip; elbow to the wall as a balance aid)
// - https://insideyoga.org/asana-library/utthita-hasta-padangusthasana/
//   (toe lock; level the pelvis by drawing the outer hips in and the lifted
//   leg's sitting bone down; strap; foot on a chair back; supine version)
// - https://emilylightyoga.com/writings/utthita-hasta-padangusthasana
//   (tripod of the standing foot, lifted arches, wall placements, strap)
// - https://adventureyogaonline.com/utthita-hasta-padangusthasana/ (free
//   hand on the hip, toe lock, standing kneecap lifted, strap/chair/wall)
export const standingHeadToKnee: ClassicalNote = {
  asana: 'Utthita Hasta Padangusthasana',
  asanaEnglish: 'Extended Hand-to-Big-Toe Pose',
  etymology:
    'Daṇḍa is a staff or rod, and daṇḍāyamāna is the participle of a verb built on it — to stand erect like a staff, to be stem-like — which the Ghosh lineage renders simply as “standing” (the studio gloss that splits it into danda, “stick”, and yamana, “balancing”, is folk etymology); jānu is the knee, śīrṣa the head, āsana the seat. Iyengar’s Jānu Śīrṣāsana is a seated forward bend, so the 26 & 2 name reads as “that pose, done standing like a staff” — but the shape itself lives under a different classical name: utthita (extended), hasta (hand), pāda (foot) and aṅguṣṭha (big toe), the extended hand-to-big-toe pose.',
  reference: { plates: '20–23', difficulty: 16 },
  contrast:
    'In Light on Yoga the nearest form is Utthita Hasta Padangusthasana — plates 20 to 23, graded 16, a long way above Tree at 1 or Triangle at 3 — and Iyengar builds it out of Tadasana with one hand: the same-side hand takes the big toe in a two-finger-and-thumb lock, the other hand rests on the hip, the leg straightens forward, and in a second stage the head comes down to the knee; a further form swings the straight leg out to the side. 26 & 2 rebuilds the pose around a different grip and a different rule: all ten fingers interlaced under the ball of a flexed foot, so the arms can pull hard against a leg that is kicking its heel away, and a locked standing knee that is the gate to every stage — the toe-lock and hip-hand of the Iyengar form are alignment instruments, while the ten-finger grip is a strength instrument that turns the hold into two working legs. The Iyengar syllabi introduce the pose with the foot resting on a ledge, or the leg held in a belt, before the free-standing form, and reach the head-to-knee stage from a lengthened trunk; 26 & 2 meets it in a heated room in two counted sets of a minute and half a minute, adds the elbows-down, chin-tucked curl as its own final gate, and leaves the leg-to-the-side form out entirely, that lateral hip work going to other postures in the series. Neither lineage can claim the pose as ancient: it is absent from the medieval hatha texts and turns up in India only in the 1920s, so Ghosh’s and Krishnamacharya’s students inherited the same young shape and built it into two different disciplines.',
  refinements: [
    'Make the lock the way Iyengar builds a standing leg: spread the toes, root the centre of the heel and the mounds of the big and little toes, draw the inner ankle up and lift the kneecap by tightening the thigh so the muscle wraps onto the bone — the knee is held straight by that lift, never pushed backward into the joint, which is exactly what the “Take care” note asks for.',
    'Level the pelvis as the leg rises. The lifted leg’s sitting bone wants to hitch up and the standing hip to swing out; draw both outer hips toward the midline and sink that sitting bone until the two hip points sit level and face straight ahead — Iyengar teachers check this before the leg is allowed to straighten.',
    'Extend from the hip socket, not the arms. Settle the thigh bone back into its socket, then push the heel away and draw the kneecap back toward you — the 26 & 2 kick into an imaginary wall — so the arms hold what the leg gives rather than hauling the leg up by the foot.',
    'Lengthen before you curl. In the Iyengar method the head reaches the knee by lifting the sternum, keeping both side ribs equally long, and then folding; carry that into the 26 & 2 curl — grow tall first, then tuck the chin and round down on a slow exhale — so the curl compresses the abdomen rather than caving the chest and dragging the standing hip with it.',
  ],
  stages: [
    'On your back: Supta Padangusthasana with a belt round the foot — the leg straight and the pelvis level with nothing to balance, the floor leg pressing down the way the standing leg will.',
    'Foot resting on a ledge, chair back or trestle at hip height (the Iyengar “with support” form): build the standing lock and the square hips while the prop holds the leg.',
    'The 26 & 2 first stage, which the Iyengar method also teaches near a wall: standing knee locked, the held foot in the ten-finger grip with that knee bent — a complete posture until the kick-out is ready.',
    'Leg straight and parallel to the floor, then elbows down and forehead to the knee — the head-to-knee stage of Light on Yoga’s plates, held on a locked leg.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Vrksasana (Tree)',
      'Supta Padangusthasana (Reclining Hand-to-Big-Toe)',
      'Janu Sirsasana (Head-to-Knee)',
    ],
    beyond: [
      'Utthita Hasta Padangusthasana II (Extended Hand-to-Big-Toe, leg to the side)',
      'Virabhadrasana III (Warrior III)',
      'Urdhva Prasarita Ekapadasana (Standing Splits)',
      'Supta Trivikramasana (Reclining Trivikrama)',
    ],
  },
};
