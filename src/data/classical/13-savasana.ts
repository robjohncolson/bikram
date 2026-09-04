import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Shavasana (śava "corpse" + āsana; alternate
//   name Mṛtāsana from mṛta "dead"; the 15th-c. Hatha Yoga Pradipika 1.32
//   describes lying supine like a corpse and says it removes tiredness and
//   calms the mind; the usual pose for yoga nidra; Bikram's Pavanamuktasana
//   follows it in the sequence)
// - https://www.wisdomlib.org/definition/shavasana (corroborates śava =
//   corpse and āsana = posture, and records the pose in the Hatha Yoga
//   Pradipika, Hatharatnavali and Sritattvanidhi; its linked edition numbers
//   the Hatha Yoga Pradipika passage I.33 rather than the common I.32)
// - https://archive.org/stream/Gheranda_Samhita/Gheranda%20samhita_djvu.txt
//   (Vasu's 1914 translation: Lesson Second, verse 19, Mritasana — lying flat
//   like a corpse; destroys fatigue and quiets the mind's agitation)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Mrtasana / Savasana #200, p. 422, intensity "-" i.e. ungraded, plate
//   592 — the highest-numbered asana entry; Tadasana #1, p. 61, intensity 1,
//   plate 1; Supta Virasana #41, p. 123, intensity 2, plates 93–96;
//   Siddhasana #39, p. 116, intensity 1, plate 84; Yoganidrasana #146,
//   p. 304, intensity 18, plates 389–391)
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
//   + loma "hair" — against the grain; inhalation and exhalation are broken
//   by pauses)
//
// `reference` gives the plate only: the index sheet records Savasana with no
// intensity grade, so `difficulty` is omitted rather than guessed.
export const savasana: ClassicalNote = {
  asana: 'Savasana',
  asanaEnglish: 'Corpse Pose',
  etymology:
    'Shava — śava in strict transliteration — means “corpse,” and asana means “seat” or “posture,” so Shavasana is literally Corpse Pose; this guide uses the common plain spelling Savasana. A supine imitation of a corpse appears in the fifteenth-century Hatha Yoga Pradipika, while the seventeenth-century Gheranda Samhita gives the same position the name Mritasana, from mrita, “dead.” Corpse Pose and the 26 & 2 label Dead Body Pose therefore express the same image rather than naming different forms. Yoganidrasana, the yogic-sleep asana at plates 389–391 and grade 18 in the Light on Yoga index, is a separate posture. It is also distinct from modern guided yoga nidra, for which Savasana is the usual position.',
  reference: { plates: '592' },
  contrast:
    'Light on Yoga closes its asana catalogue with Mrtasana or Savasana on page 422 and plate 592; the published index leaves its difficulty cell blank, and the book then moves to bandhas, kriyas and pranayama. Iyengar-method teachers draw their more detailed setup from the later Light on Pranayama: lower the trunk carefully from sitting, organise the two sides around a centre line, extend the legs separately, settle the shoulder blades, place the arms a little away from the trunk, level and support the head when needed, and close or cover the eyes. Their accounts commonly allow five to twenty minutes at the end of a practice, with attention on an even breath or a gradually deeper exhalation, followed by a turn to the side before sitting. The 26 & 2 shape is sparer and has a different assignment: heels touch lightly, arms stay alongside the body with palms up, eyes remain open, and the breath is left entirely natural for two minutes at the hinge between the standing and floor series; shorter rests recur through the floor work. Iyengar-method writers connect their closed-eye form with pratyahara and the move from asana toward pranayama, while the UK and Norway association syllabi place introductory Ujjayi and Viloma in a supine position alongside their Savasana work. The open gaze and fixed class interval in 26 & 2 preserve stillness under different conditions. One approach is not a correction of the other.',
  refinements: [
    'Borrow the Iyengar-method emphasis on symmetry before you become still. Place the nose, breastbone and navel on one line, notice whether the pelvis rests evenly, and lengthen the legs from equal hips. Make those checks once; the 26 & 2 task is then to stop adjusting.',
    'Set the head before the clock begins. Let the back of the neck lengthen so the face is level rather than strongly tipped or tucked, keep the nose centred, and check that one ear is not higher than the other. Treat this Iyengar-method alignment check as part of arriving, then leave the head alone.',
    'Settle the shoulder blades before releasing the arms. Guide them gently down the back, let both inner edges meet the floor evenly, and allow the collarbones to widen. Then follow the 26 & 2 position — arms alongside the body, palms up, fingers curling only by their own weight — and leave it alone.',
    'Let the feet open by the same amount while the heels continue to touch lightly. If the backs of the legs do not settle comfortably, use the bent-knee or rolled-towel option already given under Take care rather than forcing the full-length shape.',
    'Keep the 26 & 2 eyes open, but soften the focus and release effort from the tongue, lips and jaw. Observe the breath without shaping it. That matches the normal-breath Savasana in the introductory Iyengar syllabus more closely than the separate deep-exhalation variation does.',
  ],
  stages: [
    'Knees bent, feet flat on the floor a little apart, arms alongside the body with the palms up: the low-back option the 26 & 2 caution gives, following the same supportive logic as the Iyengar-method variation with support behind the knees. Work only on settling the head and shoulder blades evenly; the legs can wait.',
    'Full length — legs extended one at a time, heels lightly touching, feet opening evenly, arms alongside the body — with the larger movements quiet for the whole two minutes. Learn the stillness of the body first.',
    'Body still and face still together: eyes resting open and unfocused, tongue and jaw slack, the breath merely watched. This is the complete 26 & 2 posture — nothing further is being asked inside the count.',
    'As a separate Iyengar-method practice, close or cover the eyes, support the head as needed, stay longer and observe an even breath. A deeper out-breath and supine Ujjayi or Viloma are separately named syllabus variations, not additions to the two-minute 26 & 2 hold.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Supta Virasana (Reclining Hero)',
      'Supta Baddha Konasana (Reclining Bound Angle)',
    ],
    beyond: [
      'Ujjayi Pranayama in Savasana (Victorious Breath, lying)',
      'Viloma Pranayama (Interrupted Breath)',
      'Siddhasana (Adept’s Seat, for sitting pranayama)',
    ],
  },
};
