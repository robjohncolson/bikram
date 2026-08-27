import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Utkatasana (utkata = wild / intense /
//   above the usual / fierce; modern chair-like form said to originate with
//   Krishnamacharya; Hatha Yoga Pradipika lists the name; the Sritattvanidhi
//   shows a low squat close to Upaveshasana; Ardha / Parivrtta variants)
// - https://www.wisdomlib.org/definition/utkatasana (Gheranda Samhita II.27:
//   big toes fixed on the ground, heels raised, seat resting on the heels;
//   Sritattvanidhi v.104 "the haughty": soles down, knees toward the ears)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#3 Awkward Pose,
//   Utkaṭāsana; nearest name in other schools given as Utkatasana)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 1–60 difficulty scale)
// - https://www.ihanuman.com/asana/utkatasana (Light on Yoga entry: from
//   Tadasana, arms overhead with palms joined, thighs parallel to the floor;
//   preparatory / related poses incl. Virabhadrasana and Malasana I)
// - https://yogapath.com.au/pose-of-the-week-utkatasana/ (difficulty 2 of 60;
//   chest kept back, no stooping, normal breathing)
// - https://en.wikipedia.org/wiki/Malasana (Light on Yoga Malasana I / II,
//   pp. 262–266; the Western "Malasana" is really Upaveshasana; Prapadasana
//   is the heels-together tiptoe variant)
// - https://en.wikipedia.org/wiki/Pasasana (squat-and-twist bind entered
//   from Upaveshasana; Light on Yoga pp. 267–270)
// - Light on Yoga plate numbers, cross-checked in three Iyengar-association
//   syllabi: Utkatasana 42, Tadasana 1, Virabhadrasana I 14, II 15,
//   Malasana I 317–321, Malasana II 322, Pasasana 328–329:
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
export const awkward: ClassicalNote = {
  asana: 'Utkatasana',
  asanaEnglish: 'Chair Pose (Fierce Pose)',
  etymology:
    'Utkata is a Sanskrit adjective for something raised above the ordinary — intense, powerful, fierce, and by extension wild, uneven, or haughty — and asana is a seat or posture, so Utkatasana is the fierce or powerful seat. “Awkward” is the 26 & 2 rendering of that same root, keeping its sense of uneven and out of the usual; “Chair” is a modern nickname for the shape rather than a translation of anything.',
  reference: { plates: '42', difficulty: 2 },
  contrast:
    'Iyengar’s Utkatasana is one sit, entered from Tadasana with the feet together: the arms go overhead with the palms joined, the knees bend until the thighs are level with the floor, the chest is kept drawn back rather than pitched over the thighs, and the whole thing is held for a matter of seconds — Light on Yoga grades it 2 of 60. 26 & 2 turns that single shape into three, opens the feet to hip width, brings the arms forward to shoulder height, and then adds two tip-toe sits that Light on Yoga does not contain at all. Those tip-toe parts are, oddly, the older form of the name: the Gheranda Samhita’s Utkatasana is a heels-raised squat balanced on the toes with the seat resting on the heels, and the Sritattvanidhi’s is a low squat lower still, so part three reaches back past the modern chair toward the textual posture, while Iyengar’s heels-down version belongs to the standing series generally traced to Krishnamacharya. The forward arms and parallel feet are choices with a purpose too — they load the thighs as a strength hold that a counted, heated class can measure and repeat — where Iyengar’s overhead reach is aimed at length in the trunk and an open chest, and asks for far less time.',
  refinements: [
    'In part one, keep the chest drawn back the way Iyengar teaches rather than tipping the trunk forward over the thighs: the moment you stoop, the low back and the knees take over the work the quadriceps were meant to hold, and the sit gets easier for the wrong reason. Lean back, weight in the heels, and let the burn be honest.',
    'Ground the heels as Iyengar’s Tadasana grounds them — inner heels and big-toe mounds pressing evenly — and let each kneecap track straight over its second toe. The parallel-feet setup only does its job when the knees stop drifting toward each other in part one; the squeeze belongs to part three.',
    'Reach the arms from the shoulder blades, not the hands: draw the blades down the back and widen the collarbones, then extend to the fingertips. In the Iyengar method an arm is held by the back, and the arms-never-drop rule stops being a shoulder problem once the back is carrying them.',
    'In the slow-motion descent of part three, apply Iyengar’s rule for every deep knee bend — lengthen the tailbone down toward the heels while lifting the front of the spine up out of the pelvis — so that “sliding down a wall” happens in the spine and not only in the knees.',
    'Breathe normally and keep the face, throat, and eyes soft; Iyengar treats an unforced breath as the sign that a pose is being held correctly. When the thighs shake, that is the marker to watch: if the breath is still even, stay.',
  ],
  stages: [
    'A half-depth chair with the back sliding down a wall, arms forward at shoulder height: learn to keep the whole spine on the wall and the heels heavy before you leave it.',
    'Utkatasana proper, plate 42 — heels down, thighs level, chest back, arms overhead with the palms joined — for a few breaths only; then the same depth with the arms brought forward as 26 & 2 asks.',
    'Part two with one hand on a wall or a chair back until the ankles steady on the toes; take the hand away one finger at a time rather than all at once.',
    'Part three to a halfway hover only — heels up, knees together, spine long — treating the Gheranda Samhita’s seat-on-the-heels as the destination the knees may earn, never the requirement for today.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Urdhva Hastasana (Upward Hands)',
      'Virabhadrasana II (Warrior II)',
    ],
    beyond: [
      'Virabhadrasana I (Warrior I)',
      'Upaveshasana (Squat)',
      'Malasana (Garland)',
      'Pasasana (Noose)',
    ],
  },
};
