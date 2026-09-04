import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Parsvottanasana (parsva = side/flank, ut =
//   intense, tan = to stretch or extend, asana = seat; palms joined behind
//   the back with the fingertips up; feet about a leg-length apart, both legs
//   straight, front foot pointing forward, back foot turned in ~60°, hips
//   squared to the feet; hands may drop to the floor; unknown in medieval
//   hatha yoga, present in Krishnamacharya's Yoga Makaranda and later in the
//   systems of Jois and Iyengar; Light on Yoga 1979 ed. pp. 78–80. This page
//   dates Yoga Makaranda to 1935, while the Janu Sirsasana source below cites
//   the translated edition as 1934; the note therefore makes no year claim.)
// - https://en.wikipedia.org/wiki/Janu_Sirsasana (janu = knee, sirsa = head;
//   the seated fold over one straight leg with the other knee bent out;
//   a modern form documented in Yoga Makaranda and Light on Yoga pp. 148–151;
//   no standing form mentioned)
// - https://en.wikipedia.org/wiki/Prasarita_Padottanasana (the wide-leg fold
//   mapped to #8 rather than #10; prasarita = spread out, pada = foot and
//   uttana = extended; Light on Yoga pp. 81–85)
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
//   separated or parted)
// - https://www.yogapedia.com/definition/6448/dandayamana-bibhaktapada-janushirasana
//   (#10 of the sequence; one foot forward, arms overhead with the palms in
//   prayer and the trunk folded over the straight leg; its medical and chakra
//   claims are not used)
// - https://eyalshifroni.com/blog/b-k-s-iyengars-light-on-yoga-asanas-index/
//   (Steve Barber links his searchable loyindex.org in a February 2024
//   comment; Eyal Shifroni acknowledges it)
// - https://loyindex.org redirects to Barber's published Light on Yoga index
//   sheet:
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Parsvottanasana #12, p. 78, intensity 6, plates 24–28; Janu Sirsasana
//   #59, p. 148, intensity 5, plates 126–129; Parivrtta Trikonasana p. 64 /
//   5 / 6–7; Virabhadrasana I p. 69 / 3 / 12–14; Prasarita Padottanasana I
//   p. 81 / 4 / 29–34; Padahastasana p. 91 / 6 / 45–46; Uttanasana p. 92 /
//   8 / 47–48; Urdhva Prasarita Ekapadasana p. 93 / 6 / 49;
//   Paschimottanasana p. 166 / 6 / 153–162; Tadasana plate 1 / grade 1)
// - Plate 26 cross-checked in
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   (Parsvottanasana 26; Prasarita Padottanasana I 33, 34) and
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Janu Sirsasana 127; Paschimottanasana 161; Parighasana 39; the pose
//   listed at Level 1 among the standing asanas);
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   lists plate 26 with arms down at Introductory I and explicitly as the
//   classical presentation at Introductory II)
// - https://yogavastu.com/p/parsvottanasana/ (Iyengar-method: feet a
//   leg-length apart, back foot turned slightly, both legs straight; the
//   concave spine kept as far into the bend as possible, head up first and
//   then lowered in the full pose; reverse prayer or elbows held behind the
//   back; firm legs support the forward extension)
// - https://www.ihanuman.com/asana/parsvottanasana (entered from Tadasana;
//   hands may rest on the hips, floor or blocks; the spine stays concave in
//   the first fold; both legs stay straight, the back foot's outer edge
//   extends down and the front hip moves back as the rear hip moves forward;
//   preparations include Tadasana, Uttanasana, Virabhadrasana I and Adho
//   Mukha Svanasana)
// - https://yoganga.com/articles/1157-2/ (Marla Apt: front heel aligned with
//   the back arch; pelvis turned over the front leg, outer back thigh moving
//   forward and back heel grounded; front thigh lifted into the hip; sternum
//   raised without arching the low back; blocks under the hands; reverse
//   prayer or elbows held; head released to the shin only after the torso has
//   lengthened; Supta Padangusthasana, Adho Mukha Svanasana and Utthita
//   Trikonasana used as preparations)
// - https://insideyoga.org/asana-library/parsvottanasana/ (back foot ~60°;
//   heels in line or set "train-track" wide; both hip points forward; weight
//   drifts to the front leg, so the back heel is grounded deliberately;
//   blocks, a wider stance and a bent knee as modifications; Virabhadrasana I,
//   Trikonasana and Prasarita Padottanasana as preparations; Uttanasana and
//   Tadasana as counterposes)
// - https://iyengaryogaintroassessment.wordpress.com currently returns a
//   "Nothing Found" page, so no fact is taken from it. The Yoga Journal page
//   "Master Parsvottanasana in 6 Steps" was also unavailable and is not used.
export const standingSeparateLegHeadToKnee: ClassicalNote = {
  asana: 'Parsvottanasana',
  asanaEnglish: 'Intense Side Stretch Pose',
  etymology:
    'Daṇḍa is a staff; dictionary entries parse daṇḍāyamāna as a participial form built from it, with the sense of standing erect or resembling a stem. Bibhakta represents Sanskrit vibhakta, “separated” or “parted”; pāda is a foot, jānu a knee, śīrṣa the head and āsana a seat or posture. Put together, the class name describes a standing head-to-knee posture with the feet apart. The jānu-śīrṣa pair also appears in Jānu Śīrṣāsana, the seated one-leg fold. The nearest classical standing name is Pārśvottānāsana: pārśva is the side or flank, ut conveys intensity and tan means to extend, hence “intense side stretch.” The cited posture histories place both named forms in modern twentieth-century practice rather than in the medieval hatha manuals.',
  reference: { plates: '24–28', difficulty: 6 },
  contrast:
    'The Light on Yoga index places Parsvottanasana at plates 24–28 and grade 6; Iyengar-association syllabi identify plate 26 as its classical presentation. Its base is close to yours: one foot leads, the rear foot turns in, and the pelvis faces along the front leg. Iyengar-method teaching then keeps both knees straight, takes the arms behind the back in reverse prayer or an elbow hold, establishes a lifted chest and concave spine, and lengthens the torso over the front thigh before the head releases toward the shin. In 26 & 2, the palms stay overhead beside the ears, the chin tucks, and the spine rounds from the top as the forehead seeks the knee; the front knee may bend freely to make that contact and only then works toward straight. The two versions organize the same asymmetrical stance around different tasks. The classical form gives priority to a long, hip-led extension with the arms behind you, while the class form makes the rounded head-to-knee connection and the arms moving with the head its organizing line. Neither action needs to replace the other. Your later effort to straighten the front leg without losing forehead contact is the point at which their leg work most clearly meets.',
  refinements: [
    'Keep the rear heel heavy and the back leg awake as you fold. In this stance the torso readily shifts its load toward the leading foot; pressing the back foot into the floor helps you preserve the pose’s own instruction that both feet remain planted while the pelvis turns over the front leg.',
    'Square the pelvis with a paired action: guide the front hip rearward as the back hip comes forward. Iyengar-method teaching often sets the front heel near the back arch and turns the outer rear thigh toward the leading side. Organize that relationship while you are upright, before the tucked head removes your visual check.',
    'As the bent front leg begins to lengthen, engage the thigh so the kneecap rises and let the whole thigh track back from the hip. This brings a classical standing-pose action into your second stage without changing its rule: stop at the last degree that preserves the forehead-to-knee connection.',
    'Use the upright inhale to create length before you make the class form’s deliberate curve. Lift through the side ribs and chest while the pelvis stays level; then keep that space as the chin tucks and the upper spine begins the descent. Length first and rounding second can coexist here.',
    'Let the overhead prayer remain unmistakably the 26 & 2 arm position. Reach evenly through both arms, keep the elbows straight without clenching the hands, and maintain the arms beside the ears as the head travels down and up. The classical reverse-prayer arrangement is useful for comparison, but it is not an adjustment to import into this hold.',
  ],
  stages: [
    'Hands on the hips, or fingertips on blocks beside the front foot, with both legs comfortably long, the back heel grounded, the pelvis facing forward and the chest lifted: use this classical study stage to learn the base before adding either version’s full fold.',
    'Arms overhead in prayer, chin tucked, forehead resting on a generously bent front knee — the 26 & 2 gate: contact first, and a complete posture in its own right.',
    'Forehead still on the knee while the front leg works toward straight, kneecap lifting and back heel pressing — the full 26 & 2 form, held for the count.',
    'Beyond class, explore the Iyengar-method form represented by plate 26: palms joined behind the back, both legs straight, the torso extending along the front thigh and the head releasing toward the shin.',
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
