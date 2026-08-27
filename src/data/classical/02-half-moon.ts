import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Ardha_Chandrasana (Iyengar's form: one-leg
//   balance from Trikonasana, top hand on the hip; Bikram's is a two-legged
//   side bend "elsewhere called Indudalasana")
// - https://en.wikipedia.org/wiki/Uttanasana (Padahastasana section: hands
//   under the feet, palms up; Light on Yoga pp. 91–93; 1944 Bernard illustration)
// - https://en.wikipedia.org/wiki/Parighasana (kneeling side bend; LoY pp. 85–87)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#2 naming; nearest
//   classical name given as Indudalasana)
// - https://en.wikipedia.org/wiki/Bikram_Yoga (Ghosh lineage, 105 °F / 40 %)
// - https://en.wikipedia.org/wiki/List_of_asanas
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 1–60 difficulty scale)
// - https://www.yogapedia.com/definition/7439/indudalasana (indu = moon, dala =
//   portion; via search summary)
// - Light on Yoga plate numbers, cross-checked in three Iyengar-association
//   syllabi: Padahastasana 46 (Canada lists 45–46, "show both stages"),
//   Ardha Chandrasana 19, Padangusthasana 43–44, Uttanasana 48,
//   Parighasana 38–39, Urdhva Dhanurasana from Tadasana 483–486:
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   https://yogafocuscollective.com/sequences
// - No citable source gave Padahastasana's difficulty grade, so it is omitted.
export const halfMoon: ClassicalNote = {
  asana: 'Padahastasana',
  asanaEnglish: 'Hands-under-Feet Forward Bend',
  etymology:
    'Ardha is “half” and chandra is “the moon”, so Ardha Chandrasana names the crescent your body draws in the side bend; pada is “foot”, hasta is “hand”, and asana is “a seat” or “posture”, so Pada-Hastasana simply describes the grip. The two-legged crescent is sometimes filed under a third name, Indudalasana — indu being another word for the moon and dala a piece or portion of it.',
  reference: { plates: '45–46' },
  contrast:
    'Iyengar’s Ardha Chandrasana shares only the name: it is a one-leg balance opened out from Utthita Trikonasana, the lifted leg level with the floor and, as Light on Yoga shows it, the top hand resting on the hip. Light on Yoga has no named two-legged standing side bend — its nearest lateral work is the kneeling gate pose, Parighasana — so the crescent half of this posture is a Ghosh-lineage shape rather than a classical entry. Pada-Hastasana is a true match, with one telling difference: Iyengar slides the palms up under the soles until the toes reach the wrists and lets the length of the legs set the depth, while 26 & 2 grips the heels from behind and pulls, because in a heated room and a counted hold the pull is what brings a body flat quickly and evenly. The backbend has a classical cousin too — arching back from standing with the arms overhead is how the Iyengar syllabus enters Urdhva Dhanurasana from Tadasana — but here it stays a brief, hips-forward stretch rather than a drop-back.',
  refinements: [
    'Before either side bend, grow tall first: press the four corners of both feet, draw the kneecaps up, and lift the whole trunk out of the pelvis toward the steepled fingers — in the Iyengar method a locked knee is a lifted quadriceps, not a jammed joint, and a side bend begins from a spine that has already been lengthened.',
    'Borrow the Iyengar habit of practising Utthita Trikonasana with the back against a wall: imagine that wall behind you in the side bend and keep both shoulder blades and both hips touching it, so the depth you find is lateral depth and not a twist forward.',
    'As the head goes back in the backbend, keep lifting the sternum and rolling the upper arms outward so the arch spreads through the upper back rather than pinching in the low back — the same distribution Iyengar teaches for every standing backbend, and the surest way to honour the low-back caution.',
    'In Hands to Feet, Iyengar teaches the fold from the hip joints with the weight forward over the balls of the feet: as you pull on the heels, keep the hips stacked over the ankles instead of sitting back, and the hamstrings lengthen rather than brace against the pull.',
    'Give the fold one breath of the Iyengar concave-back stage before you pull yourself flat — head lifted, spine long, chest reaching toward the shins — so the depth comes from the hips and the legs, not from rounding the upper back.',
  ],
  stages: [
    'Side bends with the hands on the hips and elbows wide: learn to send the hips the opposite way before the arms come overhead.',
    'Arms overhead and locked beside the ears, but bend only as far as both sides of the trunk stay in one plane — evenness first, depth later.',
    'Hands to Feet in the concave-back stage: palms under the feet (or hands on the calves), head up, back long, knees as straight as the hamstrings allow.',
    'Full Padahastasana — palms under the soles, toes toward the wrists, face to the shins — and then add the 26 & 2 pull on the heels and work the knees to locked.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Utthita Trikonasana (Extended Triangle)',
      'Parighasana (Gate)',
      'Padangusthasana (Big-Toe Hold)',
    ],
    beyond: [
      'Uttanasana (Intense Forward Stretch)',
      'Ardha Chandrasana (Half Moon, the one-leg balance)',
      'Paschimottanasana (Seated Forward Bend)',
      'Urdhva Dhanurasana (Upward Bow, entered from Tadasana)',
    ],
  },
};
