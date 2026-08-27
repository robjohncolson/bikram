import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Garudasana (garuda = eagle, king of birds,
//   Vishnu's mount, name traced to "devourer"/the sun's consuming rays;
//   Gheranda Samhita 2.37 gives the name to a grounded pose with hands on the
//   knees; the 19th-c. Sritattvanidhi to a one-leg balance nearer to tree;
//   the modern standing wrap is the Light on Yoga form, pp. 97–98;
//   Vatayanasana is its kneeling variant)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#4 Eagle Pose,
//   Garudasana — the same name in both lineages)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 1–60 difficulty grades)
// - https://en.wikipedia.org/wiki/List_of_asanas (standing/balancing; 19th-c. ST)
// - https://en.wikipedia.org/wiki/Utkatasana (utkata = intense, powerful;
//   modern chair form vs. the older low squat)
// - https://en.wikipedia.org/wiki/Vrikshasana (Bikram's "Tadasana" is Vrksasana)
// - https://en.wikipedia.org/wiki/Gomukhasana (Garudasana listed as a
//   preparation for it)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Garudasana #23, p. 97, intensity 1, plate 56; Vatayanasana #24, p. 98,
//   intensity 11, plates 57–59; Tadasana plate 1 / grade 1; Vrksasana plate 2 /
//   grade 1; Utkatasana plate 42 / grade 2; Gomukhasana plates 80–81 / grade 2)
// - Plate 56 cross-checked in three Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Canada also lists Vatayanasana 58–59 and Gomukhasana 80–81 "arms only")
// - https://yogavastu.com/p/garudasana/ (Iyengar-method teaching: the pose is
//   practised standing in Tadasana, seated in Virasana, or in full from a
//   modified Utkatasana; shoulders back and down; asymmetry reveals imbalances)
// - https://yogainternational.com/article/view/eagle-pose-step-by-step/
//   (opposite arm on top is the standard pairing; chair-depth sit; arm bones
//   back into the sockets; hip crease drawn back to level the pelvis; ball of
//   the top foot on a block as a modification)
// - https://yogainternational.com/article/view/vatayanasana-horse-face-pose/
//   (half lotus, kneel on that knee, eagle arms; 30 s per side; horse-face name)
// - https://www.ihanuman.com/asana/garudasana and
//   https://adventureyogaonline.com/garudasana-benefits/ (classical entry is
//   legs first, then arms; toe-on-floor, wall, seated and strap modifications)
export const eagle: ClassicalNote = {
  asana: 'Garudasana',
  asanaEnglish: 'Eagle Pose',
  etymology:
    'Garuda is the eagle of Hindu myth — king of the birds and the mount of Vishnu, a name traditionally traced to a root meaning “to devour”, after the consuming fire of the sun’s rays — and asana is “a seat” or “posture”. The name is older than the shape: the seventeenth-century Gheranda Samhita gives Garudasana to a grounded pose with the hands on the knees, a nineteenth-century Mysore manual to a one-legged balance nearer to tree, and the standing wrap you practise is the twentieth-century form that Light on Yoga records.',
  reference: { plates: '56', difficulty: 1 },
  contrast:
    'This is one of the rare places where the two lineages share both a name and a shape: Iyengar’s Garudasana is the same braid of limbs, filed at plate 56 and graded 1 — the easiest rung of his sixty. Light on Yoga builds it out of Tadasana (a modified Utkatasana, as Iyengar teachers describe it) and wraps the legs before the arms; 26 & 2 wraps the arms first, then sits low as if into a chair and lifts the leg over last, because in a heated room the deep sit is what makes the hook available, and the compression it creates — the “fourteen joints” teaching, which is Ghosh-lineage and not a claim Light on Yoga makes — is the point of the posture. In both, the arm that crosses on top is on the opposite side from the leg on top, so the body is braided rather than merely stacked. Iyengar’s hold is a single, longer one on each side, and in his method the arm wrap is also practised on its own, standing in Tadasana or seated in Virasana; 26 & 2 gives you two short counted sets, elbows pulled down and fingers under the nose, and lets the repetition do what a longer hold would. His very next entry, Vatayanasana, carries the same arms into a kneeling half lotus and jumps to grade 11 — a reminder of how far this beginner’s shape can travel.',
  refinements: [
    'Build the standing foot the way Iyengar builds Tadasana before anything crosses: weight spread over the whole sole, inner and outer heel both grounded, kneecap pointing straight ahead over the second toe — so that when the thighs squeeze together the standing knee holds its line instead of collapsing inward.',
    'Level the pelvis. As the top thigh crosses, the hip on that side rides up and swings back; draw that hip crease down and back into line until both hip points face the front — in the Iyengar method an asymmetric pose is practised until its two sides read as evenly as a symmetric one.',
    'Before the forearms twist, settle the heads of the upper-arm bones back into their sockets and slide the shoulder blades down away from the ears; keep that setting as you pull the elbows toward the waist, so the stretch lands between the blades and not in the neck.',
    'Keep the trunk rising while the hips sink — Iyengar’s Utkatasana rule: lift the sternum and lengthen the side ribs up out of the pelvis, and the low sit stays a sit rather than a slump forward into the arms.',
  ],
  stages: [
    'Arms only, standing tall in Tadasana or seated in Virasana: learn the cross, the forearm twist and the shoulders-down setting before there is any balance to lose.',
    'Sit as if into a chair, cross the thigh over, and rest the toes of the top foot on the floor beside the standing foot (or on a block) as a kickstand — the wrap without the hook.',
    'The full leg wrap with a wall a hand’s width behind you, so a wobble becomes a touch rather than a fall.',
    'The complete form: foot hooked behind the calf, hips low, spine upright, gaze fixed on one point — then add the 26 & 2 pull of the elbows toward the waist while the fingers lift.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Utkatasana (Chair)',
      'Vrksasana (Tree)',
      'Virasana (Hero, with the eagle arms)',
    ],
    beyond: [
      'Vatayanasana (Horse)',
      'Gomukhasana (Cow Face)',
      'Utthita Hasta Padangusthasana (Extended Hand-to-Big-Toe)',
    ],
  },
};
