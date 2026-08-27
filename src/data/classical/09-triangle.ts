import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Trikonasana (utthita = extended, trikona =
//   triangle, asana = posture/seat; a 20th-c. pose from Krishnamacharya's
//   school, in his 1934 Yoga Makaranda; Light on Yoga pp. 63–65; Iyengar's
//   form: feet a leg-length apart, both knees straight, front foot out 90°,
//   hand to the shin or floor by the front foot, other arm vertical, gaze to
//   the top thumb; Bikram Yoga named among traditions whose form differs)
// - https://en.wikipedia.org/wiki/Utthita_Parshvakonasana (utthita =
//   extended, parsva = side/flank, kona = angle; 20th-c., Krishnamacharya's
//   Mysore school, taught by Jois and Iyengar; Light on Yoga pp. 66–67; one
//   knee at a right angle, hand on the floor by the foot, top arm in line
//   with the body over the ear; Parivrtta variant)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#9 Trikonasana /
//   Triangle Pose; nearest classical form given as Parsvakonasana)
// - https://en.wikipedia.org/wiki/Virabhadrasana (Warrior II: front knee at
//   a right angle, back leg straight, arms level, gaze over the front hand)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 1–60 grades; Utthita
//   Trikonasana grade 3, entered by jumping the feet 3–3½ ft apart)
// - https://en.wikipedia.org/wiki/List_of_asanas (both poses 20th-c., TK)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Utthita Parsvakonasana #5, p. 66, intensity 4, plates 8–9; Utthita
//   Trikonasana #3, p. 63, intensity 3, plates 3–5; Parivrtta Trikonasana
//   p. 64 / 5 / 6–7; Parivrtta Parsvakonasana p. 68 / 8 / 10–11;
//   Virabhadrasana II p. 72 / 1 / 15; Ardha Chandrasana p. 74 / 5 / 18–19;
//   Tadasana plate 1 / grade 1. The sheet's IAST column is shifted one row
//   against its name column around rows 3–5; name, page and plate columns
//   agree with the syllabi below.)
// - Plates 8–9 cross-checked (pdftotext) in three Iyengar-association syllabi,
//   which also give Utthita Trikonasana 4–5, Parivrtta Trikonasana 6–7,
//   Parivrtta Parsvakonasana 10–11, Virabhadrasana I/II/III 14/15/17,
//   Ardha Chandrasana 19, Parsvottanasana 26, Parighasana 39:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
// - https://yogavastu.com/p/utthita-parsvakonasana/ (Iyengar-method: the back
//   leg stays active, no collapse into the front leg or the hand; the spine
//   extends from the root of the outer back heel; block under the hand)
// - https://yogaselection.com/utthita-parsvakonasana-extended-side-angle-pose-a-comprehensive-guide/
//   (Iyengar-based: stance a little over a leg's length; thigh parallel, knee
//   over the ankle; front outer thigh drawn back; back heel pressed down; hand
//   beside the outer foot; arm over the ear, head turned up; Virabhadrasana II
//   as the preparation; block, wall and chair-under-the-thigh props)
// - https://www.ihanuman.com/asana/utthita-parsvakonasana (entered from
//   Tadasana via the wide arms-out stance; palm outside the front foot; outer
//   knee pressed into the inner arm; shoulder blades tucked in; chest turned
//   up and back; preparations include Utthita Trikonasana, Virabhadrasana II)
// - https://www.indianyogaassociation.com/blog/utthita-parsvakonasana-or-side-angle-pose.html
//   (Iyengar-method: front second toe at 90°, front heel in line with the back
//   arch; back thigh rolled outward, inner ankle lifted; both sides of the
//   chest stretched equally, lower ribs may touch the thigh but not rest on
//   it; look forward for neck issues; errors: hip drops, back foot unstable,
//   knee past the ankle)
// - https://www.yogateket.com/blog/how-to-trikonasana-variations (Bikram's
//   version: front knee 90°, thigh parallel, hand to the big toe, other arm
//   up, gaze up, count of ten; Utthita Trikonasana is straight-legged)
// - Bikram bottom-arm placement — elbow in front of the knee, fingertips
//   between the big and second toes, no weight in hand or elbow — via search
//   summaries of https://www.sumitsyoga.com/post/bikram-yoga-triangle-pose-anatomy,
//   https://ohmybikram.wordpress.com/2011/10/17/posture-clinic-triangle-pose/
//   and https://www.yogapedia.com/definition/9534/bikram-triangle
// - Not reachable this session (paywall / HTTP 403), so nothing is taken from
//   them: Yoga Journal "The Right Triangle" and "5 Steps to Master Utthita
//   Parsvakonasana"; iyengaryogaintroassessment.wordpress.com and
//   iyengarhomepractice.wordpress.com.
export const triangle: ClassicalNote = {
  asana: 'Utthita Parsvakonasana',
  asanaEnglish: 'Extended Side Angle Pose',
  etymology:
    'Tri is “three” and kona is “an angle” or “corner”, so Trikonasana is simply the three-cornered posture — in 26 & 2 the triangle is the one your two legs draw with the floor. Iyengar’s name for the shape your legs actually make is Utthita Parsvakonasana: utthita is “extended” or “stretched out”, parsva is “the side” or “flank”, kona again “angle”, and asana “a seat” or “posture” — the flank stretched into one long angle. Neither name is old: both poses surface in the twentieth century in Krishnamacharya’s Mysore school, where Iyengar learned them (Trikonasana is in the 1934 Yoga Makaranda), and no medieval hatha text describes either.',
  reference: { plates: '8–9', difficulty: 4 },
  contrast:
    'Iyengar’s Utthita Trikonasana keeps both knees straight — feet about a leg-length apart, one hand to the shin or the floor beside the front foot, the other arm vertical — and Light on Yoga grades it 3; the moment 26 & 2 bends the front knee to a right angle with the thigh parallel to the floor, the legs become the base of his Utthita Parsvakonasana, the extended side angle at plates 8–9 and grade 4, which is why this note files the master posture there. Yet the top half stays true to its own name: 26 & 2 keeps the arms in Trikonasana’s vertical line, the bottom elbow in front of the bent knee and only the fingertips touching the floor between the big toe and the second toe, while Iyengar takes the bottom arm down the outside of the leg — armpit against the outer knee, palm flat beside the outer foot — and sends the top arm over the ear so that back heel, flank and fingertips make one unbroken diagonal. The difference is one of purpose. Iyengar’s line is an extension — the flank stretched open, the knee-to-armpit contact used as the lever that turns the chest, practised as one unhurried hold per side, often with a wall or a block — whereas 26 & 2 wants a strength hold: no weight in the hand means the legs and trunk carry everything, the vertical arms pull apart like a stretched cable, and the chest revolves upward against low, steady hips through two counted sets in a heated room — the everything-at-once work behind its title of master posture. So the 26 & 2 Triangle is a hybrid of two of the opening standing poses in Light on Yoga — Parsvakonasana’s legs under Trikonasana’s arms — and each lineage is consistent with itself.',
  refinements: [
    'Start the pose from the back foot, the way the Iyengar method builds its wide-stance standing poses: press the outer edge of the back heel into the floor, lift the inner ankle toward the outer, and roll the back thigh outward so the straight leg stays as awake as the bent one — in his method the line of the posture begins at that heel, and the 26 & 2 cue to work the straight leg just as hard is the same teaching in different words.',
    'Let the stance, not the knee, set the depth. In the Iyengar method the front thigh reaches parallel by lengthening the stride until the shin can stand vertical; if your thigh is not yet level with the knee stacked over the ankle, widen the feet rather than let the knee travel forward — the knee caution in this posture and Iyengar’s alignment agree exactly here.',
    'Steer the bent knee toward its little-toe side and draw the outer thigh of that leg back, as if toward a wall behind you, so both hips stay in one plane — Iyengar teachers practise this shape with the back heel and hips against a wall, and the image keeps the revolve in the chest, where 26 & 2 puts it, rather than in a hip that drifts up and forward.',
    'Lengthen the underside of the trunk as much as the top: in the Iyengar method the lower ribs roll forward and the upper ribs roll back, and the lower side may touch the thigh but never rests on it — which is exactly what “no weight in the hand” asks of you, and the honest way to revolve the chest open.',
    'Keep the top arm in the plane of the body — it likes to drift forward — and tuck the shoulder blades in against the back ribs so the chest stays broad; turn the head only along the line of that arm, and if your neck says no today, do as the posture’s own caution says and keep the gaze forward.',
  ],
  stages: [
    'Virabhadrasana II legs: wide stance, front knee bent to a right angle over the ankle, back leg straight and pressing through its outer heel, arms level at shoulder height — the whole base of the posture with no tilt and nothing to reach for. Stay here until the thigh can reach parallel without the knee passing the ankle.',
    'Forearm resting on the front thigh, top arm to the sky: the tilt with a shelf under it, so you can learn the back-leg press and the revolving chest before the fingertips have anywhere to go.',
    'Hand on a block beside the front foot — the Iyengar prop — or fingertips light on the floor with the knee still stacked: full depth in the legs while the two sides of the trunk stay equally long.',
    'The complete 26 & 2 form: thigh parallel, elbow in front of the knee, fingertips touching between the toes with no weight in them, arms in one vertical line, chest revolving, eyes on the top hand — and, when you want the classical extension, take the top arm over the ear once and feel the single line from back heel to fingertips.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Utthita Trikonasana (Extended Triangle)',
      'Virabhadrasana II (Warrior II)',
    ],
    beyond: [
      'Parivrtta Parsvakonasana (Revolved Side Angle)',
      'Parivrtta Trikonasana (Revolved Triangle)',
      'Ardha Chandrasana (Half Moon, the one-leg balance)',
    ],
  },
};
