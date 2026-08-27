import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#7 Balancing Stick
//   Pose, Tulādaṇḍāsana; nearest name in other schools given as
//   Virabhadrasana III)
// - https://en.wikipedia.org/wiki/Virabhadrasana (Virabhadra = the warrior
//   Shiva made from a lock of his hair after Sati died at Daksha's sacrifice;
//   the three forms and the story each is said to depict, III being the
//   strike; III = trunk horizontal, arms forward, one leg back level with the
//   floor, the hardest of the three; the shape is 20th-century, popularised
//   via Krishnamacharya / Jois, with a look-alike in Niels Bukh's 1924
//   Primary Gymnastics; arm variants: to the sides, along the body, prayer)
// - https://en.wikipedia.org/wiki/List_of_asanas (Virabhadrasana I–III,
//   Parsvottanasana, Utthita Hasta Padangusthasana, Hanumanasana attested
//   20th c. via Krishnamacharya; Ardha Chandrasana 20th c. via Light on Yoga;
//   Dandasana 8th c.; no Tuladandasana entry)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 1–60 difficulty grades)
// - https://en.wikipedia.org/wiki/Dandasana (danda = stick / staff, as in
//   Chaturanga Dandasana and Viparita Dandasana)
// - https://www.wisdomlib.org/definition/tula (tula = a balance, the beam of a
//   pair of scales; Libra; a unit of weight; likeness / equality; root tul,
//   "to weigh")
// - https://www.yogapedia.com/definition/5506/tuladandasana (tula = balance,
//   danda = stick or staff; alternate names Virabhadrasana 3, Eka Padasana;
//   a Bikram standing pose)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Virabhadrasana III #9, p. 73, intensity 5, plates 16–17;
//   Virabhadrasana I #7, p. 69, intensity 3, plates 12–14; Virabhadrasana II
//   #8, p. 72, intensity 1, plate 15; Tadasana p. 61, grade 1, plate 1;
//   Parsvottanasana p. 78, grade 6, plates 24–28; Ardha Chandrasana p. 74,
//   grade 5, plates 18–19; Urdhva Prasarita Ekapadasana #21, p. 93, grade 6,
//   plate 49; Hanumanasana p. 352, grade 36, plates 472–476a)
// - Plate 17 (the finished form) cross-checked in three Iyengar-association
//   syllabi:
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (all three: Virabhadrasana I 14, II 15, III 17, Tadasana 1,
//   Parsvottanasana 26, Ardha Chandrasana 19, Urdhva Prasarita Ekapadasana 49;
//   the UK / Canada sheets add Utthita Hasta Padangusthasana 20–23 and
//   Hanumanasana 475–476)
// - https://www.nest-yoga.com/blog/2018/9/19/richard-rosens-asana-breakdown-no-8-virabhadrasana-1
//   (Light on Yoga grades: Virabhadrasana I 3, II 1, III 5; the Virabhadra
//   myth)
// - https://www.ihanuman.com/asana/virabhadrasana-iii (Light on Yoga entry:
//   from Virabhadrasana I, trunk extended forward over the front thigh, then
//   the standing leg straightens as the back leg lifts to hip height; whole
//   body one horizontal line; pelvis level, tailbone toward the heels;
//   shoulder blades drawn in to keep the chest lifted; preparatory poses
//   Urdhva Hastasana, Utkatasana, Virabhadrasana I; related Adho Mukha
//   Svanasana)
// - https://yogavastu.com/p/virabhadrasana-iii/ (Iyengar-method teaching:
//   entered from Virabhadrasana I; palms may stay shoulder-width while the
//   shoulders learn the reach; fingertips on a wall as the balance aid; the
//   back of the pelvis made horizontal; kneecap tracking forward; equal
//   extension of the two sides of the trunk)
// - https://insideyoga.org/asana-library/virabhadrasana-iii/ (variations:
//   hands on blocks, chair, back foot to a wall; lifted leg rolled inward
//   with the big toe turned down to keep the hips square; heel pushed away,
//   toes spread; gaze on a point ahead)
// - No citable source gave Light on Yoga's hold time for the pose, so the
//   note speaks only of "a single, longer hold".
export const balancingStick: ClassicalNote = {
  asana: 'Virabhadrasana III',
  asanaEnglish: 'Warrior III',
  etymology:
    'Tula is a balance — the beam of a pair of scales, and the Sanskrit name of Libra — from a root meaning “to weigh”; danda is a stick, staff or rod, the same word that names the seated Dandasana and the low plank of Chaturanga Dandasana; asana is a seat or posture. So Tula-Dandasana is the balanced staff: one rigid rod laid level across the pivot of a single leg, which is exactly what the cues ask of you. Virabhadra is the warrior Shiva made from a lock of his own hair to break up Daksha’s sacrifice after Sati died there, and Iyengar’s three Virabhadrasanas are traditionally read as that story in three stances — the third, yours, being the strike that ends it.',
  reference: { plates: '16–17', difficulty: 5 },
  contrast:
    'Light on Yoga has no Tuladandasana; its nearest entry is Virabhadrasana III, the hardest of the three warriors at grade 5 of 60 (Warrior II is a 1, Warrior I a 3), and nearly every point of the finished line agrees with yours — one straight standing leg, arms forward beside the ears, trunk and lifted leg level with the floor, both hips facing down. The difference is the road in. Iyengar unfolds the pose out of Virabhadrasana I: the trunk folds down to rest along the bent front thigh, and only then does the front knee straighten as the back leg rises, so the balance is found by lengthening out of a lunge, and in the Iyengar method it is a single, longer hold whose emphasis is a level pelvis and two sides of the trunk stretched the same amount. 26 & 2 takes one big step and tips the entire body in a single seesaw motion, palms sealed and thumbs crossed, for ten seconds of everything you have, twice: a counted, heated sprint placed at the top of the balancing series to spike the heart rate, where Iyengar’s hold is placed among the standing poses to teach poise. Neither lineage has it wrong — the classical entry is how you earn the level hips, and the 26 & 2 hold is where you spend them.',
  refinements: [
    'Build the standing leg the way Iyengar builds every standing pose before you tip: weight spread across the whole sole, kneecap drawn up by the front of the thigh so the locked knee is a lifted quadriceps rather than a jammed joint, and the standing hip pulled back underneath you so it does not jut sideways the moment the other foot leaves the floor.',
    'Level the back of the pelvis. The lifted-leg hip wants to swing open, and in the Iyengar method you close it by rolling that leg’s inner thigh up toward the ceiling until the big toe points straight at the floor and both sides of the waist read the same length — which gives the “keep both hips level” cue a mechanism instead of just an order.',
    'Lengthen the tailbone back toward the lifted heel while the lower belly draws up toward the spine. That is Iyengar’s guard against the sag in the low back that every horizontal pose invites, and it is the same action the low-back caution asks for: a stick that is level from end to end, never a leg hoisted above a dropped middle.',
    'Let the back carry the arms. Draw the outer upper arms in and the shoulder blades into the body before you reach, so the chest stays lifted and the shoulders slide away from the ears even with the palms sealed; the burn then lives in the shoulders and upper back, which is the work, and not in the neck.',
    'Reach both ends at once and let the breath report on it. Iyengar treats an even breath as the test of a pose held correctly, and a breath that snags inside ten seconds is usually telling you that one end of the stick has stopped reaching.',
  ],
  stages: [
    'Fingertips on a wall in front of you, or hands on two tall blocks: fold out of Virabhadrasana I with the chest along the front thigh, lift the back leg, and learn to level the pelvis before there is a balance to lose.',
    'Back heel pressed into a wall behind you at hip height, standing leg straight, arms forward — the wall holds the leg level so you can spend the whole hold on the hips and the two sides of the trunk.',
    'The classical entry unaided: unfold from Warrior I, chest resting on the thigh first, then straighten the standing knee as the leg rises, and stay in a single, longer hold with the breath even.',
    'The 26 & 2 form: one big step, the single seesaw tip, palms sealed and thumbs crossed, and ten seconds stretched flat-out in both directions — then step out clean.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Virabhadrasana I (Warrior I)',
      'Parsvottanasana (Intense Side Stretch)',
      'Utthita Hasta Padangusthasana (Extended Hand-to-Big-Toe)',
    ],
    beyond: [
      'Ardha Chandrasana (Half Moon, the one-leg balance)',
      'Urdhva Prasarita Ekapadasana (Standing Splits)',
      'Hanumanasana (Monkey, the full splits)',
    ],
  },
};
