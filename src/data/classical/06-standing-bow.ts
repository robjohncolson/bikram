import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Natarajasana (nata = dancer, raja = king;
//   Nataraja = Shiva as cosmic dancer, carved at Chidambaram; absent from the
//   medieval hatha texts, brought into modern yoga by Krishnamacharya and
//   made a signature pose by Iyengar; Light on Yoga pp. 419–422; same-side
//   hand holds the raised foot, other arm reaches forward; the intense
//   variation takes both arms overhead to the foot; strap/wall variants)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#6 Dandayamana
//   Dhanurasana, "Standing Bow Pose", nearest classical name Natarajasana)
// - https://en.wikipedia.org/wiki/Dhanurasana (dhanu = bow; HYP 1.25 and
//   Gheranda Samhita 2.18 describe a bow pose; the prone form standardised in
//   the 20th c.; Parsva and Purna variants)
// - https://en.wikipedia.org/wiki/Virabhadrasana (Virabhadrasana III: trunk
//   and back leg horizontal, arms forward; LoY pp. 69–74; 20th-c. origin)
// - https://en.wikipedia.org/wiki/Eka_Pada_Rajakapotasana (back foot held
//   with one or both hands; LoY pp. 389–399)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; ~200 asanas, ~600
//   plates; 1–60 difficulty scale)
// - https://www.yogapedia.com/definition/5417/dandayamana-dhanurasana (danda =
//   stick/staff, dhanura = bow; "standing bow pulling pose"; Bikram sequence)
// - https://www.wisdomlib.org/definition/dandayamana (Cappeller: dandayamana
//   = "resembling a staff", i.e. held straight like a rod)
// - https://www.nest-yoga.com/blog/2023/8/15/richard-rosens-asana-breakdown-iva-natarajsana-lord-of-the-dance
//   (LoY grade 58, second-highest in the book; Iyengar's finish has both
//   hands overhead drawing the foot to the crown; a one-hand ankle grip as the
//   simpler version; standing knee not buckling, pelvis level, big-toe mound
//   pressed, chest broad; preparations: lunge, Ardha/Virasana, Supta
//   Padangusthasana)
// - https://yogauonline.com/yoga-poses/lord-of-the-dance-pose-king-dancer-pose/
//   (trunk lifted out of the pelvis before the tip forward; the tip comes from
//   the hip joint; strap, wall and chair supports; preparations include Tree,
//   Warrior III, Bow, Camel, Locust, Supta Padangusthasana)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Natarajasana #199, p. 419, intensity 58, plates 587–591a; Dhanurasana
//   p. 101, grade 4, plate 63; Parsva Dhanurasana 64–65 / 4; Virabhadrasana
//   III p. 73, grade 5, plates 16–17; Bhekasana 98–100 / 4; Ustrasana 40–41 /
//   3; Eka Pada Rajakapotasana I 539–542 / 28; Padangustha Dhanurasana
//   553–557 / 43; Urdhva Dhanurasana I 479–482 / 7; Tadasana plate 1 / 1;
//   Vrksasana plate 2 / 1; top grades: Tiriang Mukhottanasana 60, then
//   Natarajasana and Viparita Salabhasana 58. Plain Kapotasana is not on the
//   sheet — its plates 507–512 come from the syllabi below)
// - Plates cross-checked in Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Natarajasana 590, 591 under Syllabus Level 4, its top level; Dhanurasana 63;
//   Virabhadrasana III 17; Bhekasana 100; Eka Pada Rajakapotasana I 542;
//   Padangustha Dhanurasana 555; Kapotasana 507, 512)
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Dhanurasana 63; Virabhadrasana III 17; Bhekasana 100; Kapotasana
//   507–512; Eka Pada Raja Kapotasana I 542 — Natarajasana not listed)
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   (Dhanurasana 63; Virabhadrasana III 17)
export const standingBow: ClassicalNote = {
  asana: 'Natarajasana',
  asanaEnglish: 'Lord of the Dance Pose',
  etymology:
    'Danda is a staff or rod, and dandayamana — the prefix this lineage gives its standing postures — is a participle meaning “being like a staff”, upright and unbending, which is why it is usually rendered simply “standing”; dhanu is a bow and asana “a seat” or “posture”, so Dandayamana-Dhanurasana is the bow pose stood up on one leg. Iyengar files the standing shape under a different name altogether: nata is a dancer, raja a king, and Nataraja is Shiva as the cosmic dancer, the deity of the great temple at Chidambaram, whose eastern gateway tower carries this very shape among its carved dance poses — so Natarajasana is the pose of the lord of the dance. The bow is old and the standing bow is not: the medieval hatha texts describe a Dhanurasana, though never on one leg, while the dancer appears in no medieval text at all and entered modern yoga in the twentieth century through Krishnamacharya before Light on Yoga made it famous.',
  reference: { plates: '587–591', difficulty: 58 },
  contrast:
    'Light on Yoga keeps the bow on the floor — Dhanurasana is the prone backbend at plate 63, graded 4 — and files the one-legged standing bow almost at the end of its asana section as Natarajasana, graded 58, the second-highest mark on Iyengar’s scale. That grade belongs to the finish, where the trunk stays lifted and the elbow rotates up and back until both hands hold the foot overhead and draw it toward the crown; the rung below it — one hand on the foot, the other arm reaching forward, trunk still fairly upright — is the shape most modern classes call dancer pose, and the nearest relative of the one you practise. 26 & 2 takes that rung, makes it the whole posture, and changes its direction: rather than staying upright and pulling the foot in, you kick back and up and let the kick carry the trunk down toward parallel as the foot rises over your head, the reaching arm and the kicking leg drawing the bow between them. The room and the count explain the choice — a heated body reaches full hip extension sooner, and a sixty-second hold rewards a shape that can be pushed a little further every second over one that is settled into once. Iyengar’s version is a still balance measured by how far the foot comes overhead; the 26 & 2 version is a moving one measured by how much kick your grip and your standing leg can absorb — the same bow, drawn from opposite ends.',
  refinements: [
    'Build the standing leg the way Iyengar builds Tadasana: press the mound of the big toe and the inner heel down, spread the toes, and draw the thigh muscle up so the kneecap lifts. The lock is a lifted quadriceps holding the leg straight, never the joint shoved backward — which keeps the standing knee inside its own caution.',
    'Level the pelvis before the kick has anywhere to go. The hip of the lifted leg wants to ride up and swing open; drop that hip point, roll the kicking thigh slightly inward, and aim the knee straight back behind its own hip. In the Iyengar method this is what keeps the backbend in the spine rather than in a twisted sacrum, and it is the mechanical form of your “shoulders square” cue.',
    'Rotate the gripping arm from the shoulder, not the wrist: turn the upper arm outward so the elbow points at the ceiling and the shoulder blade slides down the back. In the Iyengar method that rotation is the road to the arm going fully overhead; in your hold it stops the held shoulder from dragging the chest round toward the kicking side.',
    'Length before depth: lift the sternum and front ribs up out of the waist as the kick begins, then let the tip forward come from the hip joint of the standing leg rather than from the waist. The backbend then spreads through the upper back and the front of the hip — exactly what your low-back caution asks for, kicking up rather than pitching down.',
    'Treat the reaching arm as Virabhadrasana III’s arm: upper arm beside the ear, palm turned inward, shoulder blade pulled down away from the ear, fingertips reaching to lengthen the spine out of the pelvis rather than merely pointing at the mirror.',
  ],
  stages: [
    'Stand tall holding the foot — or a belt looped around it, as an Iyengar student would — with the free hand on a wall: learn the grip, the level pelvis and the knee-behind-hip line with no tipping and nothing to fall out of.',
    'Kick back and up with the trunk still upright and the chest lifted, standing knee locked and both hip points facing front — the settled, chest-up stage; hold it steady before adding any forward reach.',
    'Reach forward and tip the trunk, letting the kick carry the foot above head height while both shoulders stay square to the front — the complete 26 & 2 form.',
    'Outside the counted set, the classical finish: rotate the elbow up and back, then bring the second hand to the foot overhead — Iyengar’s plates 590–591, a shoulder opening well beyond anything the class hold asks of you, and not a shape to hunt for inside it.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Virabhadrasana III (Warrior III)',
      'Dhanurasana (Bow)',
      'Bhekasana (Frog)',
    ],
    beyond: [
      'Eka Pada Rajakapotasana I (One-Legged King Pigeon)',
      'Padangustha Dhanurasana (Big-Toe Bow)',
      'Kapotasana (Pigeon)',
      'Urdhva Dhanurasana (Upward Bow)',
    ],
  },
};
