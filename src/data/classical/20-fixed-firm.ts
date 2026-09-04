import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#20 Suptavajrasana,
//   rendered Reclining Thunderbolt Pose; Supta Virasana is the nearest
//   equivalent named for other schools)
// - https://en.wikipedia.org/wiki/Virasana (vira = hero, supta = reclined;
//   medieval Virasana named a cross-legged meditation seat, while the modern
//   kneeling form appears in twentieth-century sources; Virasana has the seat
//   between the feet; Supta Virasana reclines with the arms beside the thighs
//   or overhead)
// - https://en.wikipedia.org/wiki/Vajrasana_(yoga) (vajra = thunderbolt or
//   diamond, asana = seat or posture; the name's historical usage varied;
//   Gheranda Samhita 2.12 describes a feet-beside-the-buttocks seat that Light
//   on Yoga calls Virasana, while other sources use Vajrasana for sitting on
//   the feet)
// - https://en.wiktionary.org/wiki/सुप्त (supta: asleep, resting or latent;
//   ultimately from the Indo-European root *swep-, to sleep)
// - https://en.wiktionary.org/wiki/वज्र (vajra: Indra's thunderbolt and a
//   diamond; also an adjective for something hard or impenetrable)
// - https://en.wiktionary.org/wiki/वीर (vira: a brave or eminent person, hero)
// - https://www.ghoshyoga.org/postures-of-ghosh-yoga.html (a collated Ghosh
//   repertoire drawn from five authors: #7 Vajrasana, "Firm Posture", and #32
//   Supta-Vajrasana, "Reclined Firm Posture"; the page says its numbering is
//   for counting, not practice order)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; more than 200 asanas,
//   about 600 photographs, with entries carrying a difficulty grade)
// - https://loyindex.org (redirects to the published Light on Yoga index sheet)
// - Published Light on Yoga index sheet (the sheet itself names no author):
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Virasana #40, p. 120, grade 1, plates 85–92; Supta Virasana #41,
//   p. 123, grade 2, plates 93–96; Paryankasana #42, grade 2, plate 97;
//   Bhekasana #43, grade 4, plates 98–100; the separate Supta Vajrasana is
//   #57, p. 146, grade 12, plates 123–124; Ustrasana #16, grade 3, plates
//   40–41; Supta Bhekasana #164, grade 21, plates 457–458)
// - https://eyalshifroni.com/blog/b-k-s-iyengars-light-on-yoga-asanas-index/
//   (a family index placing photographs 86–124 in the sitting group, including
//   Supta Virasana, Paryankasana, Bhekasana, Padmasana variations and the
//   distinct Supta Vajrasana)
// - Plate numbers cross-checked in two Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Virasana 89; Supta Virasana 96, supported and unsupported; Paryankasana
//   97; Bhekasana 100; Supta Vajrasana 124; Supta Bhekasana 458)
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Virasana 88–89; Supta Virasana 93 and 96, supported when needed;
//   Paryankasana 97; Bhekasana 100)
// - https://yogaselection.com/supta-virasana-reclining-hero-pose/
//   (Iyengar-method teaching through supported stages: calf tissue moved away
//   from the knee crease; little-toe edges grounded; heels upright; inner
//   knees drawing in; tops of feet pressing down; tailbone lengthening; props
//   may support the seat, back and head)
// - https://yogainternational.com/article/view/laid-back/ (Roger Cole, an
//   Iyengar-certified teacher: parallel thighs; rectus femoris crossing hip
//   and knee as a common limiter; pelvis and trunk kept aligned; blankets can
//   support ankles, pelvis, upper back and head; arms can extend overhead)
// - https://courses.bikramyogaworks.com/pages/supta-vajrasana-fixed-firm-pose
//   (26 & 2 route: seat between the heels, hands for support, elbows lowered
//   one at a time, then head and shoulders, with the arms overhead; the exit
//   returns through hand and elbow support)
// - ../poses/20-fixed-firm.ts (the controlling local safety guidance: depth
//   stops when the knees lift; sharp knee pain means come up; ankle trouble
//   calls for padding or a higher seat; low-back trouble stops at the elbows;
//   later pregnancy stays upright or propped)
export const fixedFirm: ClassicalNote = {
  asana: 'Supta Virasana',
  asanaEnglish: 'Reclining Hero Pose',
  etymology:
    'Supta means “asleep” or “reclined” and comes from an old root for sleep; vajra names both Indra’s thunderbolt and the diamond; and asana is a seat or posture. A published Ghosh-lineage repertoire translates Vajrasana as “Firm Posture” and Supta-Vajrasana as “Reclined Firm Posture”, placing “Fixed Firm” in that naming family. Vira can mean a hero or a brave person, so the nearest Light on Yoga name, Supta Virasana, is Reclining Hero Pose.',
  reference: { plates: '93–96', difficulty: 2 },
  contrast:
    'The two names reflect overlapping vocabularies rather than an error. A seventeenth-century description used Vajrasana for a seat with the feet beside the buttocks, close to the modern Virasana base, and the Ghosh repertoire preserves the “Firm” translation. The published Light on Yoga index lists the corresponding kneeling recline as Supta Virasana, grade 2 at plates 93–96. It also lists a separate, later Supta Vajrasana, grade 12 at plates 123–124 among the sitting and Padmasana material; that namesake is not the nearest counterpart to Fixed Firm. In shape, 26 & 2 and Supta Virasana share a seat between the heels and a backward recline. Their teaching structures differ: 26 & 2 specifies a staged descent through hand and elbow support, then shoulders and head, with opposite elbows held overhead, repeated in two short counted sets. Iyengar-method teachers also show supported versions with height under the seat, back or head, as well as an unsupported recline with the arms beside the body or overhead. Those prop arrangements explain another method; they are not permission to travel farther in this class. Here a lifting knee fixes your depth, sharp knee pain means come up, ankle trouble calls for padding or a higher seat, low-back trouble means no farther than the elbows, and later pregnancy means staying upright or propped. The transferable work is modest and specific: keep the thighbones tracking evenly, lengthen the front of the thighs without forcing the knees, and preserve space through the lower back as you move only through the range available today.',
  refinements: [
    'Organise the lower legs before leaning back. If the upright seat is comfortable, draw the calf tissue away from each knee crease, keep the tops of the feet grounded and let the heels point upward. If the knees object, remain upright; if an ankle needs protection, use padding or sit higher.',
    'Keep the thighbones parallel and the knee line steady. Iyengar-method sources preserve that relationship even when props change the height; in this class the knees also stay together and down. If either knee starts to lift during the descent, return to the last stable stage rather than pressing it toward the floor.',
    'Move the pelvis and trunk as one unit at first. The rectus femoris crosses both the hip and knee, so drawing the tailbone toward the knees before you lean back can keep the front-body length from turning into a larger lower-back arch. If your low back is already a concern, stop at the elbows as the Take care guidance says.',
    'At the depth already available, broaden the collarbones and let the shoulder blades settle away from the ears. Only in the full form, when every safety condition still holds, reach the held elbows away from the knees without forcing them onto the floor.',
    'Keep the breath slow and even. Let an exhale soften unnecessary gripping, but do not treat it as an instruction to descend; a quieter breath matters more than a lower position.',
  ],
  stages: [
    'Upright only: kneel with the knees together and the feet beside the hips, spine tall. With a knee injury, this may be the stopping place; with an ankle injury, pad beneath the ankles or use a higher seat.',
    'The seat: only if the upright stage remains free of sharp knee pain, lower between the heels with the toes pointing straight back and the feet beside the hips. Stay upright here until the base feels steady.',
    'Hands, then elbows: lean onto the hands, then lower one elbow and the other while both knees remain down. A lifting knee sets the limit for today, and a low-back problem means you go no farther than this stage.',
    'The complete 26 & 2 form: only when the knees remain down without sharp pain, the ankles are comfortable, and no low-back or pregnancy restriction applies, lower shoulders and head, hold opposite elbows overhead, and leave by retracing the descent through the elbows without twisting.',
  ],
  ladder: {
    before: [
      'Vajrasana (Thunderbolt)',
      'Virasana (Hero)',
    ],
    beyond: [
      'Paryankasana (Couch)',
      'Bhekasana (Frog)',
      'Ustrasana (Camel)',
      'Supta Bhekasana (Reclining Frog)',
    ],
  },
};
