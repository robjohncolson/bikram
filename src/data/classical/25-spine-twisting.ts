import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Matsyendrasana (Ardha_Matsyendrasana
//   redirects here; ardha = half, Matsyendra = lord of the fishes, paripurna
//   = perfected/complete; named in the 15th-c. Hatha Yoga Pradipika 1.26–27
//   and (per this article) Gheranda Samhita 2.22–23; the pose was the cover
//   of Yogi Ghamande's 1905 Yogasopana; Ardha Matsyendrasana I = one leg bent
//   on the ground with the foot tucked close, the other crossed over with the
//   knee raised; II and III add a Padmasana leg; Light on Yoga pp. 259–262
//   and 270–273; see-also Bharadvajasana, Jathara Parivartanasana,
//   Marichyasana)
// - https://en.wikipedia.org/wiki/Matsyendranath (10th-century Nath yogi,
//   "Lord of the Fishes"; reviver of hatha yoga, guru of Gorakshanath; the
//   legend of hearing Shiva teach Parvati from inside a fish)
// - https://en.wiktionary.org/wiki/मत्स्य (matsya: fish; Proto-Indo-Iranian
//   *mátsyas; cognate with Persian māhī)
// - https://en.wiktionary.org/wiki/इन्द्र (indra: the Vedic god; as a common
//   noun "chief, best, first of its class")
// - https://en.wiktionary.org/wiki/अर्ध (ardha: half; also side, part)
// - https://en.wikipedia.org/wiki/Hatha_Yoga_Pradipika (15th c., Svatmarama;
//   Matsyendrasana among its asanas)
// - https://en.wikipedia.org/wiki/Gheranda_Samhita (late 17th c., 32 asanas;
//   NOTE its asana table does not list Matsyendrasana even though the
//   Matsyendrasana article cites GS 2.22–23 — the note leans on the HYP only)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#25 Spine Twisting
//   = Ardha Matsyendrasana, the same name in both lineages)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; ~200 asanas, ~600
//   photographs; 1–60 difficulty grades)
// - https://loyindex.org → "Asana Indexes for Light on Yoga", a published
//   Google Sheet (columns #, Yogasana Name, IAST Name, Page, Intensity, First
//   Plate, Last Plate, Note; no author named on the sheet):
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Ardha Matsyendrasana I #116, p. 259, intensity 8, plates 307–316;
//   Ardha Matsyendrasana II #120, p. 270, 19, 330–331; Ardha Matsyendrasana
//   III #121, p. 271, 22, 332–333; Paripurna Matsyendrasana #122, p. 273,
//   38, 334–339; Bharadvajasana I #112, p. 251, 1, 297–298; Bharadvajasana
//   II #113, 2, 299–300; Marichyasana I #64, 5, 143–144; Marichyasana III
//   #114, p. 254, 10, 301–304; Pasasana #119, p. 267, 15, 323–329; Malasana I
//   #117, 8, 317–321; Jathara Parivartanasana #105, p. 237, 5, 272–275;
//   Dandasana #35, 2, plate 77; Parivrtta Trikonasana #4, 5, plates 6–7)
// - Plates cross-checked in two Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Syllabus Level 1: Bharadvajasana I 297–298, Marichyasana III 303–304,
//   Ardha Matsyendrasana I 311–312; Level 3: Pasasana 328–329, Ardha
//   Matsyendrasana II 330–331, III 332–333; Level 4: Paripurna
//   Matsyendrasana 336, 339)
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Ardha Matsyendrasana I 307–308 "preparatory – sitting on foot,
//   wall/foot support"; 308 "with bent elbow crossing knee"; 311–312
//   "classical presentation"; 313–314 "arm straight and gripping the foot";
//   Marichyasana III 301 "opposite bent elbow over the bent knee", 303–304
//   classical; Bharadvajasana I 297–298; Ardha Matsyendrasana II 330–331)
// - https://eyalshifroni.com/blog/b-k-s-iyengars-light-on-yoga-asanas-index/
//   (family index: twists and Malasana occupy photographs 297–339)
// - https://www.ihanuman.com/asana/ardha-matsyendrasana (Iyengar-method
//   teaching: sit on one foot, folded blanket between buttock and foot, or
//   heel beside the buttock on a thicker blanket; lengthen pubis to sternum;
//   outer hips down, chest lifted; shoulder blades back, collarbones broad;
//   the crossed foot's four corners pressed down as in Tadasana; the armpit
//   against the outer knee; an initial version clasps the shin; related
//   asanas Marichyasana I and III, Bharadvajasana I)
// - https://chestnuthillyoga.com/home-practice-resources/seated-twists-for-intermediate-students
//   (Iyengar-method sequence including Marichyasana I–III and Ardha
//   Matsyendrasana I; sit on the foot laid on its outer edge under the
//   sitting bones; repeat progressive hand-clasp, elbow-hook and bind stages;
//   blankets, brick and belt as props)
// - https://yogauonline.com/yoga-poses/half-lord-of-the-fishes-pose/ (from
//   Dandasana; blankets under the hips; reach up before rotating; twist on
//   the exhale; back arm rolled outward to open the chest; elbow, forearm or
//   hand on the knee depending on how the trunk holds; shoulders stacked
//   over hips, no leaning into the back hand; the pelvis allowed to travel
//   with the twist rather than forced square; preparations include
//   Dandasana, Jathara Parivartanasana and Marichyasana)
// - https://yogavastu.com/p/ardha-matsyendrasana/ (Iyengar-method page:
//   intermediate closed twist; elbow hooked behind the raised knee as the
//   lever; often placed after forward bends)
// - https://www.everydayyoga.com/blogs/guides/how-to-do-bound-half-lord-of-the-fishes-pose-in-yoga
//   (bound form: armpit over the knee, the other arm behind the back to
//   clasp the wrist or fingers; sit on the foot or on the floor)
// - https://extendyoga.com/fun-pose-friday-ardha-matsyendrasana/ (floor seat
//   with the foot beside the hip; back hand on the mat; bind as an advanced
//   option; keep the bottom leg straight for knee trouble; gaze forward for
//   neck trouble)
// - https://www.yogarasa.org/practice-menu/asanaslist/ardha-matsyendra-asana
//   (floor seat; back hand pressing the floor; twist distributed along the
//   whole spine rather than concentrated in the lumbar)
// - https://courses.bikramyogaworks.com/pages/ardha-matsyendrasana-spine-twisting-pose
//   (26 & 2 execution: sit on the floor, not on the foot; the crossed heel
//   touches the down knee; both hips on the floor; elbow against the raised
//   knee, hand gripping the knee; back hand reaches for the thigh behind,
//   palm out, or rests on the floor for beginners; twist from the coccyx up,
//   chin over the shoulder last)
// - https://bikramyogasarasota.com/blog/2019/9/15/spotlight-on-spine-twisting-posture
//   (both hips even on the floor; back hand on the floor at the base of the
//   spine, or wrapped round toward the inner thigh; ankle, heel and elbow in
//   line; lengthen sacrum to crown; exhale to twist)
// - https://myyoga.nl/en/de-bikram-yoga-houdingen/ (posture 25 is the last of
//   the sequence; hip opener plus abdominal compression)
export const spineTwisting: ClassicalNote = {
  asana: 'Ardha Matsyendrasana I',
  asanaEnglish: 'Half Lord of the Fishes Pose',
  etymology:
    'Ardha means “half” or one of two parts. Matsya means “fish,” while indra can name the chief or foremost member of a class; together Matsyendra is understood as “lord of the fishes.” Āsana is a seat or posture. The name honours Matsyendranath, an early tenth-century yogi whom Nath accounts remember as a founding teacher and the guru of Gorakshanath. In one legend a fish swallows him, and he learns yoga by listening while Shiva instructs Parvati. The fifteenth-century Hatha Yoga Pradipika both traces its teaching lineage to Matsyendranath and describes Matsyendrasana; ardha distinguishes the commonly practised, less demanding half form from Paripurna, the complete form.',
  reference: { plates: '307–316', difficulty: 8 },
  contrast:
    'The Sanskrit mapping is direct: item 25 in the Bikram sequence is Ardha Matsyendrasana, while the corresponding Light on Yoga index adds the numeral I. That public index records page 259, grade 8 of 60 and plates 307–316. The current British Iyengar syllabus selects plates 311–312 at Level 1; an older Canadian syllabus separately labels 307–308 as a supported preparation seated on the foot, 308 as the bent-elbow stage, 311–312 as the classical presentation and 313–314 as the straight-arm foot grip. The same public index lists Ardha Matsyendrasana II at grade 19, III at grade 22 and Paripurna Matsyendrasana at grade 38. Those page, plate and grade facts are the limit of the book claim here: the detailed technique comes from the cited modern teaching pages. In those Iyengar-method instructions you sit on the folded foot, sometimes with blanket support, and may progress from clasping the shin to bringing the armpit across the raised knee and reaching toward a foot-catching or bound form. In 26 & 2 you stay on both sitting bones, place the folded heel beside the opposite hip, step the other foot over the down knee, press the working arm outside the raised knee and use that hand to hold the down knee. The rear hand stays on the floor close behind the spine. You take that unbound shape for about twenty seconds, unwind, and rebuild it to the left. These are two teaching structures for the same named crossed-leg twist, without making either one a correction of the other.',
  refinements: [
    'Spread the crossed foot firmly into the floor, giving particular attention to its inner edge. A steady foot keeps the raised knee available to meet the arm without drifting away from it.',
    'Regain height before adding rotation: breathe in and lift from the pelvis through the breastbone, then use the outgoing breath to turn. Keep both sitting bones weighted and do not trade height for range.',
    'Keep the shoulders level as the rib cage turns. Draw the shoulder blades gently into the back and widen the collarbones so the chest remains lifted instead of collapsing toward the raised knee.',
    'Use the rear hand as a light support. Touch the floor close behind your spine to help you rise, while keeping the trunk over the sitting bones rather than leaning your weight back into the hand.',
  ],
  stages: [
    'Keep the bottom leg extended, plant the other foot beyond it, and place a hand or forearm against the raised knee. Use the other hand on the floor and turn only while you can remain upright.',
    'Arrange both legs as in class, circle both hands around the front of the raised shin, and sit tall. Turn gently on the exhale while the down knee and both sitting bones stay grounded.',
    'Take the complete 26 & 2 grip: working arm outside the raised knee, that hand holding the down knee, rear hand on the floor close to the spine, and chin turning last. Unwind, reverse the legs and arms, and take the left side.',
    'Outside class, explore the Iyengar-method direction: sit on the folded foot with blanket support if useful, bring the armpit across the raised knee, reach that hand toward the foot and take the other arm behind the waist.',
  ],
  ladder: {
    before: [
      'Dandasana (Staff)',
      'Bharadvajasana I (Bharadvaja’s Twist)',
      'Marichyasana III (Marichi’s Twist)',
      'Jathara Parivartanasana (Revolved Abdomen)',
    ],
    beyond: [
      'Pasasana (Noose)',
      'Ardha Matsyendrasana II (Half Lord of the Fishes II)',
      'Ardha Matsyendrasana III (Half Lord of the Fishes III)',
      'Paripurna Matsyendrasana (Complete Lord of the Fishes)',
    ],
  },
};
