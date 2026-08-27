import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Shavasana (śava "corpse" + āsana; alternate
//   name Mṛtāsana from mṛta "dead"; the 15th-c. Hatha Yoga Pradipika 1.32
//   describes lying supine like a corpse and says it removes tiredness and
//   calms the mind; the usual pose for yoga nidra; Bikram's Pavanamuktasana
//   follows it in the sequence)
// - https://www.wisdomlib.org/definition/shavasana (śava = corpse, āsana =
//   posture; Hatha Yoga Pradipika, Gheranda Samhita, Hatharatnavali and the
//   Sritattvanidhi all list the pose; all say it removes fatigue and rests
//   the mind)
// - https://archive.org/stream/Gheranda_Samhita/Gheranda%20samhita_djvu.txt
//   (Vasu's 1914 translation: Lesson Second, verse 19, Mritasana — lying flat
//   like a corpse; destroys fatigue and quiets the mind's agitation)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Savasana / Mrtasana #200, p. 422, intensity "-" i.e. ungraded, plate
//   592 — the highest-numbered asana entry; Tadasana #1, p. 61, intensity 1,
//   plate 1; Supta Virasana #41, p. 123, intensity 2, plates 93–96;
//   Siddhasana #39, p. 116, intensity 1, plate 84; Setu Bandha Sarvangasana
//   #98, p. 227, intensity 10, plates 256–259; Yoganidrasana #146, p. 304,
//   intensity 18, plates 389–391)
// - https://eyalshifroni.com/blog/b-k-s-iyengars-light-on-yoga-asanas-index/
//   (Savasana = photo 592 in the book's 602 photographs)
// - Plate 592 cross-checked in three Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (all three list Savasana 592 at the entry level, with two variants: on
//   a bolster with the eyes covered, observing the normal in- and out-breath;
//   and with an eye band, normal in-breath and deep out-breath; Level 1 also
//   lists Ujjayi and Viloma pranayama "in supine position", Level 2 the same
//   two sitting; Supta Virasana 96 and Supta Baddha Konasana sit beside
//   Savasana in the Level 1 supine group)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 200+ asanas, ~600
//   photographs; 60-level grading; asanas, then bandhas/kriyas, then the
//   pranayama section at pp. 431–461)
// - https://iyengaryogakc.com/2016/11/18/savasana-from-lop/ (an Iyengar
//   teacher's practice script built from chapter 30 of Light on Pranayama,
//   with page/instruction numbers: lie down along an imagined centre line
//   from a seated start; extend one leg then the other; heels and knees
//   joined, then the feet fall out evenly, big toes weightless; stiff legs may
//   keep the feet apart; a folded blanket behind the knees if they will not
//   rest; the head kept level — a head tipped up, down or sideways disturbs
//   the mind's attention; inner shoulder blades pinned to the floor, the skin
//   of the top chest rolled from the collarbones toward the blades; arms
//   15–20° from the trunk, palms up, backs of the middle fingers on the
//   floor; upper eyelids drawn toward the inner corners, eyes passive, ears
//   receptive, root of the tongue slack, corners of the lips relaxed; inhale
//   normally, exhale softly, deeply and longer; remain a silent observer; to
//   come out, open the eyes gradually, bend the knees and turn to one side
//   for a minute or two)
// - https://iyengarhomepractice.wordpress.com/2014/12/21/savasana-the-most-difficult-pose-to-master/
//   (Iyengar-lineage teaching: the bridge from the outer to the inner
//   practice and the link between asana and pranayama; a place to reach
//   pratyahara; Iyengar often called it the most difficult pose to master;
//   Light on Pranayama gives it 22 pages, more than any other asana; folded
//   blanket so the forehead sits well above the chin; a strap laid over the
//   eyes; come out by bending the knees and rolling to the right)
// - https://www.griffinshill.com.au/blog/savasana-a-much-misunderstood-yoga-pose
//   (Iyengar-lineage teaching: legs extended one at a time; feet roll out
//   evenly; arms neither glued to the trunk nor flung wide, palms up;
//   shoulder blades drawn down, chest open toward the chin; blanket under the
//   head so the forehead is slightly higher than the chin, head never tipped
//   back or turned; eyes rest back toward the skull; conscious relaxation
//   while fully awake; 5–20 minutes; roll to the right side to come out)
// - https://yogapath.com.au/pose-of-the-week-savasana/ (Light on Pranayama
//   pp. 232–254 on Savasana; stilling body, senses and mind with the
//   intellect alert; exhalation longer than the inhalation)
// - https://yogavastu.com/p/savasana/ (Iyengar-method teaching: always
//   closes practice; 5–15 minutes; a supine meditation when done alone)
// - https://en.wikipedia.org/wiki/Yoga_nidra (modern guided practice
//   systematised by Satyananda Saraswati in 1976; done lying in Shavasana)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#13 Śavāsana,
//   Corpse Pose; #14 Pavanamuktasana)
// - https://en.wikipedia.org/wiki/Bikram_Yoga (90 minutes at 105 °F / 40 %
//   humidity; standing series, a first savasana, floor series, Kapalabhati,
//   a final savasana; sequence based on Bishnu Ghosh's teaching)
// - https://www.yogapedia.com/definition/8588/viloma-pranayama (vi "against"
//   + loma "hair" — against the grain; the breath interrupted by pauses;
//   practised lying or sitting; first described by Iyengar)
//
// `reference` gives the plate only: the index sheet records Savasana with no
// intensity grade, so `difficulty` is omitted rather than guessed.
export const savasana: ClassicalNote = {
  asana: 'Savasana',
  asanaEnglish: 'Corpse Pose',
  etymology:
    'Shava (śava in strict transliteration) is a corpse, and asana is a seat or posture — the name says exactly what the body does, and it is one of the oldest in the room: the fifteenth-century Hatha Yoga Pradipika already describes lying supine like a dead body and credits the pose with taking away tiredness and resting the mind. The seventeenth-century Gheranda Samhita lists the same shape under a second name, Mritasana, from mrita, dead — so the 26 & 2 English name, Dead Body Pose, is the closer rendering of that later name, while Corpse Pose is the usual English for Savasana. One clash worth knowing: Iyengar’s Yoganidrasana, the “yogic-sleep pose” at plates 389–391, is not a relaxation at all but a grade-18 knot with both feet behind the head; the guided practice called yoga nidra is done lying in Savasana, not in that.',
  reference: { plates: '592' },
  contrast:
    'Savasana is the last asana in Light on Yoga — page 422, plate 592, with only the bandhas, kriyas and pranayama after it — and the book’s index gives it no difficulty grade at all, though Iyengar is widely quoted as calling it the hardest of them to master; Iyengar teachers point out that his later Light on Pranayama spends more than twenty pages on it, more than any posture gets there. The Iyengar form is built rather than dropped into: you sit with the knees bent, lower the spine down an imagined centre line, extend one leg and then the other, tuck the inner edges of the shoulder blades under, angle the arms a little out from the trunk with the palms up, rest the head level on a folded blanket so the forehead sits a touch higher than the chin, close the eyes — and, in the Iyengar method, usually cover them — then let the out-breath lengthen while the mind stays a watcher rather than a sleeper, for anything from five to twenty minutes at the end of practice, before rolling to the side to come up. 26 & 2 asks for the same shape with almost none of the apparatus: two minutes, mid-class, no blanket or eye band in a room heated for the rest of the work, heels touching and feet fallen open, palms up, and — the real difference — eyes open and the breath entirely unmanaged, because this Savasana is not the end of practice but its hinge, and what it trains is stillness with the senses still switched on and the whole floor series still to come, each posture followed by a twenty-second echo of it. Iyengar’s closed and covered eyes are pratyahara, the deliberate withdrawal of the senses that in his teaching makes Savasana the bridge from asana to pranayama — the Iyengar syllabi have beginners doing their first Ujjayi and Viloma lying in exactly this pose; the 26 & 2 open gaze keeps you in the room on purpose, awake and answerable to the clock. Neither is the softer option: one lengthens the exhale and shuts the world out, the other forbids you to touch the breath at all and keeps the world in view.',
  refinements: [
    'Lie down along a line, the way Iyengar builds the pose: sit with the knees bent and the feet together, lower the spine down an imagined centre line, then extend one leg and then the other so the pelvis lands square and both buttocks take the same weight. In the Iyengar method symmetry is the first act of relaxation — a body that lies crooked keeps a few muscles quietly working to hold the crookedness, and those are the ones a scan never finds.',
    'Set the head level before you stop moving. Iyengar makes a point of the head lying neither tipped back nor tucked, and neither turned nor leaning to a side — both ears the same height from the floor, the nose on the body’s midline; he gets there with a folded blanket, and without one you can still draw the skull a little away from the shoulders so the chin sits a hair lower than the forehead. His teaching is that a head that tilts takes the attention with it, which is the 26 & 2 cue about the neck resting neutral in different words.',
    'Settle the shoulder blades and let the chest be broad: draw the blades down and slightly together so their inner edges bed into the floor and the collarbones widen instead of hunching, then carry the arms a little out from the thighs — Iyengar wants a small wedge of daylight at the armpit — with the palms up and the fingers resting on their backs, curled only as much as they curl by themselves. Done once, at the start, it leaves the shoulders nowhere to creep up to during the two minutes.',
    'Let the feet fall open evenly. The Iyengar version starts with heels and knees together and then lets both feet roll out by the same amount, big toes weightless; if the backs of the knees will not rest, he props them — which is the rolled towel the 26 & 2 caution already offers. Uneven feet are usually an uneven pelvis; fix them and the low back often settles with them.',
    'Do the Iyengar eye and tongue work with the eyes open: leave the gaze resting on the ceiling but let the eyeballs settle back into their sockets rather than push toward it, let the upper lids grow heavy so the skin between the brows spreads, and let the tongue lie heavy in the floor of the mouth with the lips resting wide rather than pressed. Iyengar closes and covers the eyes to take the senses inward; 26 & 2 keeps them open, so the withdrawal happens behind the gaze instead of behind the lids. And leave the breath alone — the Iyengar beginners’ syllabus has a Savasana that simply observes the normal in-breath and out-breath, and that, not his later lengthened exhalation, is the version that fits the “no counting, no control” of this posture.',
  ],
  stages: [
    'Knees bent, feet flat on the floor a little apart, arms out with the palms up: the low-back option the 26 & 2 caution gives, and the same logic as Iyengar’s support behind the knees. Work only on the head lying level and the shoulder blades settling; the legs can wait.',
    'Full length — legs extended one at a time, feet fallen open evenly, arms angled from the trunk — with the body kept still for the whole two minutes while the face is allowed to do whatever it does. Stillness of the body is the first skill, and it is learnable on its own.',
    'Body still and face still together: eyes resting open and unfocused, tongue and jaw slack, the breath merely watched. This is the complete 26 & 2 posture — nothing further is being asked inside the count.',
    'Outside class, Iyengar’s Savasana as a practice of its own: eyes closed under a bandage, a folded blanket under the head, ten minutes or more, and then — only then — the exhalation softly lengthened as the doorway to lying pranayama. In the hot room the eyes stay open and the breath stays untouched; the two forms are the same shape with different jobs.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Supta Virasana (Reclining Hero)',
      'Supta Baddha Konasana (Reclining Bound Angle)',
      'Setu Bandha Sarvangasana (Supported Bridge)',
    ],
    beyond: [
      'Ujjayi Pranayama in Savasana (Victorious Breath, lying)',
      'Viloma Pranayama (Interrupted Breath)',
      'Siddhasana (Adept’s Seat, for sitting pranayama)',
    ],
  },
};
