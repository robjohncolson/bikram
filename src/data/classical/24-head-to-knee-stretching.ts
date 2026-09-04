import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#24 combines
//   Jānuśīrṣāsana with Paścimottānāsana; its nearest classical counterpart
//   is Janusirsasana)
// - https://en.wikipedia.org/wiki/Paschimottanasana (jānu = knee, śīrṣa =
//   head; Janu Sirsasana is first documented in Krishnamacharya's 1934 Yoga
//   Makaranda; paścima = west or the back of the body, uttāna = extended or
//   intensely stretched; Paschimottanasana appears in Hatha Yoga Pradipika
//   1.28–29; basic forms and supported adaptations for both poses)
// - https://www.wisdomlib.org/definition/paschimottanasana (paścima = back,
//   uttāna = stretched, āsana = posture; historical textual definitions)
// - https://www.wisdomlib.org/definition/pashcima (west, western, behind;
//   use for the path at the back of the body in a yoga text)
// - https://www.wisdomlib.org/definition/uttana (ud + tan, to stretch;
//   extended, stretched out, or turned upward)
// - https://schoolofyoga.in/hatha-yoga-pradeepika-chapter-1/ (Hatha Yoga
//   Pradipika 1.28–29 places the legs along the floor, catches the toes and
//   brings the forehead toward the knees)
// - https://ghoshyoga.org/postures-of-ghosh-yoga/ (a collation of five Ghosh
//   lineage publications lists Janushirasana, Head to Knee Posture, and
//   Paschimottanasana, Stretching Posture, as separate adjacent entries)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Janu Sirsasana #59, p. 148, intensity 5, plates 126–129;
//   Paschimottanasana #67, p. 166, intensity 6, plates 153–162; ladder pose
//   names, plates and intensities)
// - Plates cross-checked in three Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Janu Sirsasana 127 and Paschimottanasana 161 at Level 1)
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Janu Sirsasana 127 and Paschimottanasana 160)
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   (Janu Sirsasana 127 and Paschimottanasana 161)
// - https://yoganga.com/articles/paschimottanasana/ (Marla Apt's Iyengar-method
//   instruction: start from an upright Dandasana, elevate the seat or use a
//   belt as needed, ground and lengthen the legs, lift the front trunk, hinge
//   at the hips, broaden the chest, and bend the elbows outward; support the
//   forehead when the trunk does not yet reach the legs)
// - https://www.karineisen.com/blog/arogya-yoga-chapter-19nbsp-janu-sirsasana-the-king-of-forward-bends
//   (an Iyengar-method teacher's account of upright, arms-raised, concave and
//   forward stages; the two sides of the trunk reach evenly over the straight
//   leg)
// - https://yogavastu.com/p/janu-sirsasana/ (bent knee to the side, sitting
//   bones down, trunk extending over the straight leg; a belt and head support
//   as options)
// - https://yogavastu.com/p/paschimottanasana/ (backs of the legs grounded,
//   front body length and inward movement through the upper back; belt as an
//   option)
//
// `asana` names both classical entries because the 26 & 2 posture performs
// them back to back. `reference.plates` includes both verified plate runs;
// `difficulty` records the harder of the two grades, with both stated below.
export const headToKneeStretching: ClassicalNote = {
  asana: 'Janu Sirsasana and Paschimottanasana',
  asanaEnglish: 'Head-to-Knee Pose and Seated Forward Bend',
  etymology:
    'Jānu means “knee”, śīrṣa means “head”, and āsana is a posture: Janu Sirsasana is Head-to-Knee Pose. It is a modern asana, documented in Krishnamacharya’s 1934 Yoga Makaranda rather than in the medieval hatha manuals. Paścima literally means “west” and can also name the back of the body; uttāna describes an extended or intense stretch. Paschimottanasana is therefore the stretch along the body’s western, or back, side. It is the older of this pair: the fifteenth-century Hatha Yoga Pradipika describes a seated fold with both legs extended, the toes held and the forehead moving toward the knees.',
  reference: { plates: '126–129 and 153–162', difficulty: 6 },
  contrast:
    'The 26 & 2 posture deliberately joins two classical forms. The Light on Yoga index gives Janu Sirsasana plates 126–129 and grade 5, then Paschimottanasana plates 153–162 and grade 6; a collation of Ghosh-lineage publications likewise lists Head to Knee Posture and Stretching Posture as distinct, adjacent entries. In the first section, the organizing action differs. The class form rounds the spine, tucks the chin, puts the forehead on the knee even if the knee must bend, and then works the leg straighter without losing that contact. Iyengar-method versions generally keep the working leg extended, use a belt or elevate the seat when reach is limited, and explore an upright or concave spine before lowering the trunk. These are two deliberate ways into the one-leg fold, not better and worse attempts at the same instruction. The second section has more common ground but still deserves its own description: 26 & 2 asks you to hinge over both legs with a long spine, laying belly and chest on the thighs before the face reaches beyond the knees. Iyengar-method instruction also builds the fold over two active, grounded legs and lengthens the front body toward the feet, while allowing a belt or support beneath the head. The shared shape does not make the teaching order identical.',
  refinements: [
    'Give the two-leg section a clear Dandasana base. Sit near the front of the sitting bones, elevate the seat if you cannot sit upright, press the backs and inner edges of the legs down, and reach through the heels. Keep the quadriceps active as the class asks; the fold then grows from an alert base rather than from pulling harder with the arms.',
    'In the one-leg section, square the trunk by reaching the side beside the bent knee farther forward. Iyengar-method teaching observes that this side has more distance to travel; let both sides of the waist become even as the navel and breastbone face the straight thigh. This sharpens the class setup without changing its rounded finish.',
    'Use the class breath cue to preserve length inside the first section’s curl. Inhale before folding to lift the front of the trunk; exhale as the chin tucks and the forehead settles to the knee. Once contact is made, keep reaching the heel away and the waist forward while the spine remains deliberately rounded.',
    'Keep the shoulders away from the ears when the elbows bend. Iyengar-method Paschimottanasana sends the elbows outward while the collarbones stay broad; in the class form, combine that width with the instructed downward direction beside the calf or legs. The arms can deepen the fold without drawing the neck into the shoulders.',
  ],
  stages: [
    'Dandasana with support: sit on a folded blanket if needed, loop a belt around the soles, keep both legs active and lift the trunk upright. Stay here until the pelvis and spine can rise without strain.',
    'Janu Sirsasana preparation: bend one knee to the side, keep both sitting bones grounded and face the straight leg. Hold a belt around the foot and remain upright or tip forward with the chest lifted and the back gently concave.',
    'The class head-to-knee form: interlace the hands around the foot, tuck the chin and bring the forehead to the knee, bending that knee as much as necessary. Pull the toes back, reach the heel away and gradually straighten the leg while keeping the forehead down.',
    'The two-leg finish: bring the legs together, hinge forward with the spine long, and lay belly, chest and then face along the thighs, hands holding the feet or a belt. Support the forehead if the trunk does not yet reach the legs without collapsing.',
  ],
  ladder: {
    before: [
      'Dandasana (Staff)',
      'Baddha Konasana (Bound Angle)',
      'Supta Padangusthasana (Reclining Hand-to-Big-Toe)',
      'Uttanasana (Standing Forward Bend)',
    ],
    beyond: [
      'Trianga Mukhaikapada Paschimottanasana (Three-Limbed Forward Bend)',
      'Parivrtta Janu Sirsasana (Revolved Head-to-Knee)',
      'Urdhva Mukha Paschimottanasana (Upward-Facing Forward Bend)',
      'Kurmasana (Tortoise)',
    ],
  },
};
