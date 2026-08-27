import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Dhanurasana (dhanura = bow, asana = posture;
//   the 15th-c. Hatha Yoga Pradipika and 17th-c. Gheranda Samhita both describe
//   a Dhanurasana in words that fit either a seated or a reclining form; the
//   19th-c. Sritattvanidhi pictures a similar prone pose under the name
//   Nyubjasana; the prone backbend is illustrated (in half-tone) in the 1905
//   Yogasopana Purvacatuska and taught in Sivananda's 1934 Yoga Asanas; feet grasped,
//   legs and chest lifted, arms as the bowstring; Light on Yoga pp. 101–102,
//   Parsva Dhanurasana pp. 102–104 = the same pose rolled onto one side;
//   Balasana, Halasana, Sarvangasana as counterposes)
// - https://www.wisdomlib.org/definition/dhanurasana (dhanus/dhanur = bow, the
//   sandhi form dhanur- before asana; the old texts: grip the toes and draw the
//   body into a bow, toes toward the ears)
// - https://en.wikipedia.org/wiki/Akarna_Dhanurasana (akarna = toward the ear;
//   the seated archer form; the 19th-c. Sritattvanidhi calls that movement
//   Dhanurasana; the name Akarna Dhanurasana is Iyengar's, Light on Yoga
//   pp. 177–179)
// - https://en.wikipedia.org/wiki/Urdhva_Dhanurasana (urdhva = upward; the
//   wheel, also Chakrasana; Salabhasana, Bhujangasana and Dhanurasana listed as
//   preparation)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#19 Bow Pose,
//   Dhanurasana — nearest classical name Dhanurasana; #16 Cobra, #17 Locust
//   = Ardha Salabhasana, #18 Full Locust = Salabhasana, #20 = Supta Virasana,
//   #22 = Ustrasana, #6 Standing Bow = Natarajasana)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 200-odd asanas, ~600
//   photographs; difficulty graded to a maximum of 60; each entry carries a
//   technique, effects and plates; a pranayama section and a course appendix)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Dhanurasana #27, p. 101, intensity 4, plate 63; Parsva Dhanurasana #28,
//   p. 102, intensity 4, plates 64–65; Makarasana #26, p. 100, no grade,
//   plate 62; Chaturanga Dandasana #29, p. 104, 1, plates 66–67;
//   Salabhasana #25, p. 99, 1, plates
//   60–61; Bhujangasana I #31, p. 107, 1, plates 72–73; Urdhva Mukha
//   Svanasana #32, p. 108, 1, plate 74; Ustrasana #16, p. 87, 3, plates
//   40–41; Supta Virasana #41, p. 123, 2, plates 93–96; Bhekasana #43,
//   p. 126, 4, plates 98–100; Akarna Dhanurasana #73, p. 177, 11, plates
//   172–175; Urdhva Dhanurasana I #172, p. 357, 7, plates 479–482; Urdhva
//   Dhanurasana II p. 359, 15, plates 483–487; Padangustha Dhanurasana #191,
//   p. 399, 43, plates 553–557; Bhujangasana II p. 396, 37; Natarajasana
//   #199, p. 419, 58, plates 587–591a)
// - Plate 63 cross-checked in two Iyengar-association syllabi:
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   (Level 1: Salabhasana 60, Dhanurasana 63, Bhujangasana I 73, Urdhva Mukha
//   Svanasana 74, Ustrasana 41, Urdhva Dhanurasana I 482, Supta Virasana 96)
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (introductory: Dhanurasana 63 beside Salabhasana 60, Bhujangasana I 73,
//   Ustrasana 41; intermediate: Parsva Dhanurasana 64, 65, Bhekasana 100;
//   advanced: Padangustha Dhanurasana 555, Viparita Salabhasana 584)
// - https://www.ihanuman.com/asana/dhanurasana (Iyengar-lineage teaching: each
//   hand catches its own ankle; knees a little apart at first, then inner
//   thighs rolled in, legs lengthened from outer hip to outer knee and knees
//   drawn toward each other; the lift comes through resistance between legs
//   and arms; body rests on the lower abdomen, ribs and thighs off the floor;
//   upper arms turned outward; outer shoulders back, collarbones broad,
//   shoulder blades into the back to lift the chest; head lifted, gaze up;
//   faults: head hanging, weight tipping onto the pubis — fixed by lifting the
//   thighs and taking the weight to the abdomen, a collapsed chest; a looped
//   strap round each ankle if the feet are out of reach; preparation Adho
//   Mukha Svanasana, Salabhasana, Urdhva Mukha Svanasana, Virabhadrasana I
//   and III; follow-ups Urdhva Dhanurasana, Ustrasana, Dwi Pada Viparita
//   Dandasana, a twist, Sarvangasana)
// - https://yogavastu.com/p/dhanurasana/ (Iyengar-method framing: practised
//   after Urdhva Mukha Svanasana and Bhujangasana; the dorsal spine drawn in;
//   once the legs cooperate and help draw the shoulders and chest back, the
//   posture asks for less effort)
// - https://yogauonline.com/yoga-practice-teaching-tips/yoga-practice-tips/dhanurasana-bow-pose-with-a-yoga-strap-bowstring/
//   (an Iyengar-certified teacher: a strap looped round the ankles as the
//   bowstring; root the pelvis before lifting chest and legs; head kept
//   neutral rather than thrown back; five to ten breaths)
export const bow: ClassicalNote = {
  asana: 'Dhanurasana',
  asanaEnglish: 'Bow Pose',
  etymology:
    'Dhanus is a bow — the thing an archer draws — and before the vowel of asana, “a seat” or “posture”, it takes its joining form dhanur-, so Dhanurasana is the bow posture, named for the shape of the body and not for any act of shooting; the same name and the same word travel through this sequence unchanged, and into its Standing Bow with dandayamana in front. The name is one of the oldest in the repertoire and one of the least settled: the fifteenth-century Hatha Yoga Pradipika and the seventeenth-century Gheranda Samhita each describe a Dhanurasana that takes hold of the toes or feet and draws the body into a bow, in words that fit a seated archer as well as a belly-down arch, and a nineteenth-century Mysore manual gives the name to the archer while picturing the prone arch under another name. The prone bow you practise here was fixed in print early in the last century — illustrated in a 1905 Indian manual, taught in Sivananda’s 1934 book — and Iyengar keeps the family straight by calling the seated archer Akarna Dhanurasana, the bow drawn to the ear, and the wheel Urdhva Dhanurasana, the bow turned upward.',
  reference: { plates: '63', difficulty: 4 },
  contrast:
    'Light on Yoga puts Dhanurasana at plate 63 and grades it 4 of 60 — a few rungs above the beginner’s grade 1 that Locust and Cobra share — and its form is held at the ankles: each hand catches its own ankle, the knees are allowed a little apart while the pose is being learned and are drawn toward each other as it matures, and the whole body balances on the lower belly with ribs and thighs both clear of the floor, the straight arms and the rising legs pulling against one another the way both lineages picture a bow against its string. 26 & 2 moves the grip to the outside of the feet, a couple of inches below the toes with the thumbs beside the fingers, fixes the knees at hip width and leaves them there, starts from the chin on the floor, and sends the legs up and back on a kick strong enough to roll your weight forward — two counted sets of about twenty seconds in the heat, at the end of a series that has already spent Cobra, Locust and Full Locust on the same muscles. The foot grip and the wide knees read as choices that serve that job: a handle below the toes gives the strongest possible kick something to pull against and lets the arms hang as pure straps, and a fixed hip-width keeps the sacrum free to receive the kick — a strength-and-mobility pump on a count, where Iyengar’s ankle hold and slowly closing knees are the choices of a form meant to be refined over years rather than kicked into for twenty seconds. The two curricula also run the family in opposite directions: in Light on Yoga the bow arrives at plate 63 straight after Locust (60–61) and the crocodile, before the cobra ever appears at 72–73, so, read in page order, the whole-body lift comes before the hands-assisted arch, whereas 26 & 2 builds toward the bow through three postures of pure back strength and only then lets the arms and legs join to bend the spine as one arc. From here the classical ladder keeps climbing: Parsva Dhanurasana (plates 64–65, also grade 4) rolls the same held shape onto one side and then the other, Urdhva Dhanurasana turns the bow over into the wheel at grade 7, and Padangustha Dhanurasana — the big toes held with the arms swung up overhead so the feet come down toward the crown — sits far up the scale at grade 43.',
  refinements: [
    'Roll the fronts of the thighs inward before the kick. Iyengar-lineage teachers set the inner thighs turning toward each other and reach the legs long from outer hip to outer knee, and only then lift; your knees stay at hip width as the posture asks, but the thighs should not splay wider than the knees — the kick then travels straight up and back instead of out to the sides, and the sacrum keeps its room.',
    'Put the weight on the soft belly, not the pubic bone. Iyengar-lineage teachers name weight tipping onto the pubis as a fault, and their remedy is not a harder pull with the arms but a higher lift of the thighs, so the body settles onto the lower abdomen with ribs and thighs both clear — which is the mechanical content of the 26 & 2 cue to let the kick roll you forward. If the front of the pelvis is grinding, kick higher rather than haul harder.',
    'Set the shoulders before the spine moves. In the Iyengar method the outer shoulders roll back, the collarbones widen and the shoulder blades draw into the back to lift the chest, with the upper arms turned outward in their sockets; with your hands on the outsides of the feet this means letting the arms straighten and roll outward so the chest opens from between the shoulder blades, rather than letting the kick drag the shoulders up toward the ears — it keeps the arms honest as strings and spares the shoulder the Take care notes are watching.',
    'Let the legs pull against arms that resist rather than reel in. The Iyengar method teaches the lift through the resistance between legs and arms — the legs press back into the hands, the hands hold and do not haul — and teachers in the method note that once the legs learn to cooperate and draw the chest back themselves, the whole posture asks for less effort, not more; that is the classical reading of “the legs do the work”.',
    'Lengthen the back of the neck and lift the head from there. Iyengar-lineage teachers list a hanging head among the faults and are just as wary of one thrown back; the eyes reach the ceiling because the sternum has risen and the skull follows it on a long nape, never because the neck was bent first.',
  ],
  stages: [
    'If the outsides of the feet are out of reach, hold where Iyengar holds — the ankles — or, in home practice, loop a strap round both ankles and hold its ends as the bowstring, the way Iyengar-trained teachers set beginners up; the legs still learn to press back into something that resists.',
    'Feet held, thighs on the floor: root the front of the pelvis down, press the feet back into the hands and let that pressure alone raise the chest while the thighs stay resting. This teaches the resistance between legs and arms before the thighs are asked to fly, and it is the shape to keep when the low back wants a shallow bend.',
    'The 26 & 2 posture entire: knees at hip width, chin leaving the floor on the inhale, thighs and chest both up, weight rolled forward onto the abdomen, eyes to the ceiling, the kick never slackening for the count.',
    'Outside the counted set, the classical finish: the knees drawn toward each other as the pose matures, the body balanced on the lower belly with ribs and thighs clear, held on ordinary breathing — and from there Parsva Dhanurasana, rolling the held bow onto one side and back, is Iyengar’s next rung.',
  ],
  ladder: {
    before: [
      'Salabhasana (Locust)',
      'Bhujangasana I (Cobra)',
      'Urdhva Mukha Svanasana (Upward-Facing Dog)',
      'Virabhadrasana I (Warrior I)',
    ],
    beyond: [
      'Parsva Dhanurasana (Side Bow)',
      'Ustrasana (Camel)',
      'Urdhva Dhanurasana (Upward Bow)',
      'Padangustha Dhanurasana (Big-Toe Bow)',
    ],
  },
};
