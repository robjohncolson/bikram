import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Parsvottanasana (parsva = side/flank, ut =
//   intense, tan = to stretch or extend, asana = seat; palms joined behind
//   the back with the fingertips up; feet about a leg-length apart, both legs
//   straight, front foot pointing forward, back foot turned in ~60°, hips
//   squared to the feet; hands may drop to the floor to intensify; unknown
//   in medieval hatha yoga, present in Krishnamacharya's 1935 Yoga Makaranda,
//   then taught by his pupils Jois and Iyengar; Light on Yoga 1979 ed.
//   pp. 78–80; Parighasana and Navasana named as relatives)
// - https://en.wikipedia.org/wiki/Janu_Sirsasana (janu = knee, sirsa = head;
//   the seated fold over one straight leg with the other knee bent out;
//   Light on Yoga pp. 148–151; Paschimottanasana, Upavistha Konasana and
//   Trianga Mukhaikapada Paschimottanasana as relatives; no standing form
//   mentioned)
// - https://en.wikipedia.org/wiki/Prasarita_Padottanasana (the wide-leg fold
//   that is #8's classical relative; Light on Yoga pp. 81–85)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#10 Daṇḍāyamana
//   Vibhaktapāda Jānuśīrṣāsana, "Standing Separate Leg Head to Knee Pose",
//   nearest classical name Parsvottanasana; #8 nearest Prasarita
//   Padottanasana; #5 nearest Utthita Padangusthasana; sequence c. 1971)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; ~200 asanas, ~600
//   plates; 1–60 difficulty scale, Utthita Trikonasana at grade 3)
// - https://www.wisdomlib.org/definition/dandayamana and
//   https://www.wisdomlib.org/definition/dandaya (Cappeller: daṇḍāyamāna
//   "resembling the stem of"; Monier-Williams: the denominative daṇḍāya-
//   "to stand erect", "to resemble a staff")
// - https://www.wisdomlib.org/definition/vibhakta (vibhakta = divided,
//   separated, parted; vi + bhaj — as cited for #8)
// - https://www.yogapedia.com/definition/6448/dandayamana-bibhaktapada-janushirasana
//   (one foot stepped forward, arms overhead with the palms in prayer, the
//   trunk folded over the straight leg; gives no word-by-word etymology)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Parsvottanasana #12, p. 78, intensity 6, plates 24–28; Janu Sirsasana
//   #59, p. 148, intensity 5, plates 126–129; Parivrtta Trikonasana p. 64 /
//   5 / 6–7; Virabhadrasana I p. 69 / 3 / 12–14; Prasarita Padottanasana I
//   p. 81 / 4 / 29–34; Padahastasana p. 91 / 6 / 45–46; Uttanasana p. 92 /
//   8 / 47–48; Urdhva Prasarita Ekapadasana p. 93 / 6 / 49;
//   Paschimottanasana p. 166 / 6 / 153–162; Tadasana plate 1 / grade 1)
// - Plate 26 as the classical presentation, cross-checked (pdftotext) in
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   (Parsvottanasana 26; Prasarita Padottanasana I 33, 34) and
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Janu Sirsasana 127; Paschimottanasana 161; Parighasana 39; the pose
//   listed at Level 1 among the standing asanas);
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   lists Parsvottanasana at the introductory levels (plate column not
//   recovered from the text dump, so not relied on)
// - https://yogavastu.com/p/parsvottanasana/ (Iyengar-method: feet a
//   leg-length apart, back foot turned slightly, both legs straight; the
//   concave spine kept as far into the bend as possible, head up first and
//   lowered toward the shin only in the full pose; reverse prayer, or hands
//   on the hips / elbows held behind the back; blocks; legs kept firm so the
//   spine can release; weight taken into the back leg and heel)
// - https://www.ihanuman.com/asana/parsvottanasana (from Tadasana, feet
//   3–3½ ft apart, front foot 90°, back foot 75–80°, front heel in line with
//   the inner back heel; pelvis level, front hip drawn back and back hip
//   forward; weight even, most people overload the front leg; big-toe mounds
//   pressed, thighs rolled in; trunk lifted and chest raised with the spine
//   concave before folding, head to the knee at the end; shoulder blades in;
//   wrists or elbows held when the palms cannot join; preparations named:
//   Tadasana, Uttanasana, Virabhadrasana I, Adho Mukha Svanasana)
// - https://yoganga.com/articles/1157-2/ (Marla Apt, Iyengar teacher: front
//   heel to back arch; pelvis turned over the front leg, outer back thigh
//   rolled forward; back heel pressed down and reaching back; front thigh
//   drawn up into the socket and pressed back; sternum lifted without arching
//   the low back; head reaches the shin by lengthening the trunk, not by
//   shortening the neck; blocks under the hands, belt round the foot;
//   preparations: Supta Padangusthasana, Adho Mukha Svanasana, Utthita
//   Trikonasana)
// - https://insideyoga.org/asana-library/parsvottanasana/ (back foot ~60°;
//   heels in line or set "train-track" wide; both hip points forward; weight
//   drifts to the front leg, so the back heel is grounded deliberately;
//   blocks, a wider stance and a bent knee as modifications; Virabhadrasana I
//   and Trikonasana as preparations; Uttanasana and Tadasana as counterposes)
// - Not reachable this session (HTTP 403 / login wall / archive blocked), so
//   nothing is taken from them: iyengaryogaintroassessment.wordpress.com
//   (Parsvottanasana pages) and Yoga Journal "Master Parsvottanasana in 6
//   Steps".
export const standingSeparateLegHeadToKnee: ClassicalNote = {
  asana: 'Parsvottanasana',
  asanaEnglish: 'Intense Side Stretch Pose',
  etymology:
    'Daṇḍa is a staff, and daṇḍāyamāna is the participle of a verb built on it — to stand erect like a staff — which the Ghosh lineage uses simply for “standing”; bibhakta is this lineage’s spelling of vibhakta, “parted” or “divided”, pāda is the foot or leg, jānu the knee, śīrṣa the head and āsana the seat, so the whole name says “the head-to-knee pose, done standing with the legs parted”, borrowing Jānu Śīrṣāsana, which in Light on Yoga is a seated fold over one straight leg. Iyengar’s name for the standing shape is Pārśvottānāsana: pārśva is the side or flank, ut- means intense and tan is to stretch or extend, giving “intense stretch of the flank” — a name about what the pose does to the trunk, where ours is about where the head goes. Neither is ancient: no medieval hatha text describes the standing form, which first appears in Krishnamacharya’s 1935 Yoga Makaranda before his students Iyengar and Jois carried it into their schools.',
  reference: { plates: '24–28', difficulty: 6 },
  contrast:
    'In Light on Yoga the nearest form is Parsvottanasana — plates 24 to 28, graded 6, a step above Prasarita Padottanasana’s 4 and below Uttanasana’s 8 — and Iyengar builds it on the same squared stance you use: feet about a leg-length apart, front foot pointing straight ahead, back foot turned in, both hip points facing over the front leg. Everything above the hips then goes the other way. Iyengar joins the palms behind the back in reverse prayer, keeps both knees straight, lifts the chest so the spine is first long and slightly hollow, and only then extends the trunk out along the front leg until the head rests down the shin; 26 & 2 takes the arms overhead beside the ears, tucks the chin, rounds the spine deliberately from the top down, aims the forehead at the knee, and bends that knee as much as it takes, so that contact comes first and the straight leg is earned afterwards. The names tell you why: Iyengar’s pose is an intense stretch of the flank — a lengthening of the whole back line with the head as its passenger and the hands pinned behind the back so the fold has to come from the hips — while ours is a head-to-knee compression, throat closed and belly wrung, in which the round is the mechanism, the overhead arms add their weight to that curve, and the slow one-piece descent and ascent through two heated, counted sets is part of the work. Two uses of one stance, each consistent with its own aims; the second-stage cue to work the front leg straight without losing the touch is where the two forms come closest.',
  refinements: [
    'Set the back foot the way Iyengar sets it: turned in — his teachers give anything from sixty to eighty degrees — with the outer edge of the heel pressed down and a share of the weight kept honestly in that leg, because in the Iyengar method the usual fault in this stance is the body sliding forward onto the front leg. Your cue to keep the back leg strong and both feet planted is the same instruction; the rooted back heel is what lets the hips stay square as the trunk goes down.',
    'Square the pelvis with two opposite actions rather than one push: draw the front hip back and the back hip forward, and roll the outer thigh of the back leg toward the front — Iyengar teachers line the front heel up with the arch of the back foot to make room for this. Check it before the chin tucks, because once the head is down you can no longer see whether one hip has drifted.',
    'When the second stage asks you to work the front leg toward straight, straighten it the Iyengar way: draw the thigh up into the hip socket and press the thighbone back, so the kneecap lifts because the quadriceps has tightened, never because the joint is shoved backward — and only as far as the forehead keeps its touch, which this posture makes the rule.',
    'Grow tall before you fold. In the Iyengar method the trunk is first lifted, the chest raised and the side ribs made long, and only then extended; carry that into your inhale while you are still upright, then tuck the chin and round down from the top of the spine on the exhale as cued, so the curve wraps a lengthened trunk rather than a collapsed one and the compression lands in the throat and belly, not the low back.',
    'Give the overhead prayer Iyengar’s arm work from Virabhadrasana I, where the palms also meet above the head: reach up from the side ribs, straighten the elbows by lengthening rather than gripping, roll the outer upper arms in toward the ears and let the shoulder blades slide down the back, so the arms travel with the head as one piece instead of hanging off the neck. Keep the chin tucked as the posture asks — the classical head-along-the-shin is a different neck action and belongs to the classical form, not to this hold.',
  ],
  stages: [
    'Hands on the hips, or fingertips on blocks either side of the front foot — Iyengar’s first teaching stage — with the stance set, the back heel rooted, the hips squared over the front leg, the chest lifted and the head up: learn the square and the back-leg press before there is any fold. It is also the lifted-torso version the posture itself suggests when the compression is off the table.',
    'Arms overhead in prayer, chin tucked, forehead resting on a generously bent front knee — the 26 & 2 gate: contact first, and a complete posture in its own right.',
    'Forehead still on the knee while the front leg works toward straight, kneecap lifting and back heel pressing — the full 26 & 2 form, held for the count.',
    'Beyond class, the classical finish: palms joined behind the back, both knees straight, the spine long instead of round and the head laid along the shin — Parsvottanasana as Light on Yoga photographs it at plate 26.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Virabhadrasana I (Warrior I)',
      'Utthita Trikonasana (Extended Triangle)',
      'Prasarita Padottanasana (Wide-Legged Forward Bend)',
    ],
    beyond: [
      'Parivrtta Trikonasana (Revolved Triangle)',
      'Janu Sirsasana (Head-to-Knee, seated)',
      'Paschimottanasana (Seated Forward Bend)',
      'Urdhva Prasarita Ekapadasana (Standing Splits)',
    ],
  },
};
