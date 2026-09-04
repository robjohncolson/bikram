import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (item 23 is
//   rendered Śasāṁgāsanā / Rabbit and mapped to Balasana as its nearest
//   equivalent; item 21 is mapped to Balasana too; the page warns that names
//   in the sequence may differ from, or name different poses in, other schools)
// - https://en.wiktionary.org/wiki/शश (śaśa: hare or rabbit; also the lunar
//   markings traditionally read as a hare; cognate with English “hare”)
// - https://en.wiktionary.org/wiki/अङ्क (aṅka: hook, curve, lap, side, line,
//   numeral or mark; derived from a root meaning to curve or bend)
// - https://www.wisdomlib.org/definition/shashanka (dictionary entries give
//   śaśāṅka as “hare-marked,” a name for the moon, and analyse it as the
//   compound śaśa + aṅka)
// - https://yogainternational.com/article/view/learn-sasangasana-rabbit-pose/
//   (uses Sasangasana and Shashankasana as modern alternate spellings; for
//   its Rabbit form: kneeling, heels or ankles held, chin tucked, crown down,
//   hips raised toward vertical thighs, shoulder blades broadened, and only
//   light pressure at the head; back off the hip lift if breath is crowded)
// - https://www.yogapedia.com/definition/6516/shashankasana-yoga (a different
//   modern Shashankasana: from Vajrasana, arms overhead, then a fold with the
//   hands and forehead on the ground)
// - https://loyindex.org → the published “Asana Indexes for Light on Yoga”
//   sheet, also fetched directly as CSV:
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (208 entries; no row containing Sasa/Sasanka/Shashank/Sasang/Rabbit/Hare/
//   Bala; Virasana #40, grade 1, plates 85–92; Ustrasana #16, grade 3, plates
//   40–41; Halasana #91, grade 4, plates 238–244; Karnapidasana #92, grade 1,
//   plates 245–246; Pindasana in Sarvangasana #103, grade 5, plates 268–269;
//   Supta Kurmasana #134, grade 14, plate 368)
// - https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (the Level 1 forward-extension list labels Light on Yoga plate 92 Adho
//   Mukha Virasana; the published index above includes that plate within the
//   Virasana entry rather than giving Adho Mukha Virasana its own row; the
//   syllabus also confirms Halasana 244 and Karnapidasana 246)
// - https://yogaselection.com/adho-mukha-virasana/ and
//   https://yogavastu.com/p/virasana-forward/ (Iyengar-method teaching: big
//   toes or feet together, knees apart to make room for the ribs, pelvis at
//   the heels or supported, forehead on the floor or a block, trunk reaching
//   forward, and shoulders kept open)
// - https://en.wikipedia.org/wiki/Halasana (Karnapidasana is a Halasana
//   variation with the knees bent near the head, within a shoulderstand cycle)
// - https://www.ihanuman.com/asana/karnapidasana (Iyengar-method teaching:
//   knees lower beside the ears while the trunk remains lifted; the head,
//   neck, shoulders and upper arms remain on the floor)
// - https://courses.bikramyogaworks.com/pages/sasangasana-rabbit-pose (26 & 2
//   execution: knees and feet together, heels gripped with thumbs outside,
//   chin tucked, forehead at the knees, crown lightly down, hips lifted until
//   the arms straighten, then a controlled return to rest on the back)
//
// No `reference`: the published Light on Yoga index has no Rabbit,
// Sasangasana, Shashankasana or Balasana entry. The numbered plates above
// belong to related poses and are evidence for the comparison and ladder.
export const rabbit: ClassicalNote = {
  asana: null,
  etymology:
    'Śaśa means hare or rabbit, while śaśāṅka is “hare-marked,” a traditional name for the moon built from śaśa and aṅka, “mark.” Āsana means a seat or posture. These are related explanations, not interchangeable spellings: without diacritics, the two Sanskrit words are normally written shasha and shashanka. Sasangasana is the conventional 26 & 2 label for Rabbit, but it is not a precise transliteration of either word. Modern yoga sources also use Shashankasana for a different, child-like movement from Vajrasana: the arms rise and then reach ahead as the forehead lowers. Here the shape identifies Rabbit more clearly than the shared modern names do—the heels are held, the forehead comes to the knees, the crown touches lightly and the hips lift.',
  contrast:
    'The published Light on Yoga index has no row for Sasangasana, Shashankasana, Rabbit, Hare or Balasana, so this note does not assign Rabbit a classical entry or a book reference. Its Virasana row spans plates 85–92, and an Iyengar Association syllabus labels plate 92 Adho Mukha Virasana within its forward-extension group. Downward-Facing Hero is therefore a useful form to compare, not a separate Rabbit or Child’s Pose entry in the book: Iyengar-method teaching keeps the pelvis at the heels, opens the knees for the ribs, supports the forehead and sends the trunk and arms forward. The 26 & 2 form keeps knees and feet together, reaches back for the heels, tucks the chin, brings forehead and knees together, lets the crown meet the floor lightly and raises the hips until the arms straighten. Halasana and Karnapidasana are separately indexed inverted poses. Karnapidasana also gathers thighs and trunk into a compact curve, but its knees descend beside the ears while its head, neck, shoulders and upper arms remain grounded; Rabbit stays kneeling and uses the heel pull to keep pressure away from the head and neck. One arrangement does not repair the other. In this sequence Rabbit is the short, active flexion immediately after Camel, followed by a controlled return to the back.',
  refinements: [
    'Set the 26 & 2 base first: knees and feet together, each heel firmly held with the thumb outside. Begin the pull before the head approaches the floor, and keep it as the hips rise; the grip and straightening arms are what preserve the crown as a light contact.',
    'Borrow the two-way reach of Adho Mukha Virasana during the entry: let the pelvis settle toward the heels while the trunk travels forward. When Rabbit changes that relationship by lifting the hips, keep reaching through the shoulders rather than dropping the torso onto the head.',
    'Broaden the shoulder blades across the back while drawing the shoulders away from the ears. This action appears in the independent Rabbit source as well as the related Iyengar-method folds, and it supports the pose page’s instruction to keep the back of the neck long.',
    'Use Karnapidasana only as an image for the rounded trunk: as the thighs close toward the body, keep lifting and lengthening the back away from that pressure. In Rabbit the same intention follows the local cue to stretch progressively from tailbone toward neck; it does not import the inversion’s support on the shoulders.',
    'Let each breath set the depth. Breathe slowly into the back ribs; if the breath becomes pinched, lower the hips toward the heels until it is steady again. On the exit, lower the hips first, keep the chin tucked and unroll without turning the head.',
  ],
  stages: [
    'Remain upright on the heels with the grip secure and the chin gently tucked. If the neck caution applies, this is the stopping place: keep the head off the floor and do not substitute a neck-only curl.',
    'Round forward only within a quiet breath, keeping the hips close to the heels and the crown off the floor. Use padding for sensitive knees; with a low-back concern or a pressure-related caution, this shallow fold is the limit.',
    'With no neck restriction and the heel pull already active, bring the forehead to the knees and allow the crown to touch lightly as the hips begin to rise. Keep the load in the legs and the pulling arms rather than settling onto the head.',
    'For the complete 26 & 2 form, lift the hips high, approach vertical thighs and straighten the arms without losing forehead-to-knee contact. Maintain only light contact at the crown, then lower the hips and retrace the entry slowly.',
  ],
  ladder: {
    before: [
      'Virasana (Hero)',
      'Adho Mukha Virasana (Downward-Facing Hero)',
      'Ustrasana (Camel)',
    ],
    beyond: [
      'Halasana (Plough)',
      'Karnapidasana (Ear-Pressure Pose)',
      'Pindasana in Sarvangasana (Embryo in Shoulderstand)',
      'Supta Kurmasana (Sleeping Tortoise)',
    ],
  },
};
