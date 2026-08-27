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
//   against the outer knee; easier versions clasp the shin or hold the
//   raised knee; preparations Marichyasana I and III, Bharadvajasana I)
// - https://chestnuthillyoga.com/home-practice-resources/seated-twists-for-intermediate-students
//   (Iyengar-method progression Marichyasana I → II → III → Ardha
//   Matsyendrasana I → … → Bharadvajasana; sit on the foot laid on its outer
//   edge under the sitting bones; stages hand clasp → elbow hook → bind;
//   inhale to lengthen, exhale to turn; grip the outer hips in without
//   hardening the abdomen; blankets, brick, belt as props)
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
    'Ardha is “half” — an old Indo-Iranian word that also means a side or a part — and Matsyendra is “lord of the fishes”: matsya, fish (a cousin of the Persian māhī), joined to indra, the name of the Vedic storm-god used at the end of a compound to mean the chief or best of its kind; asana is a seat or posture. The lord in question is Matsyendranath, the tenth-century yogi whom the Nath tradition counts as the reviver of hatha yoga and the teacher of Gorakshanath, and whose legend has him swallowed by a fish and overhearing Shiva teach yoga to Parvati from inside its belly. The “half” marks your pose as the simpler form of a Matsyendrasana the fifteenth-century Hatha Yoga Pradipika already names — Iyengar photographs the whole of it as Paripurna (“complete”) Matsyendrasana and grades it 38 of 60.',
  reference: { plates: '311–312', difficulty: 8 },
  contrast:
    'This is one of the places where the two lineages share both a name and a shape, and the differences are all in the seat and the arms. Light on Yoga files Ardha Matsyendrasana I among its intermediate seated twists — page 259, grade 8 of 60; the British Iyengar teaching syllabus keeps it at Level 1 beside Bharadvajasana I and Marichyasana III — as the first of three numbered forms that climb to grades 19 and 22 before the complete Paripurna Matsyendrasana at 38, whereas 26 & 2 gives it the last word of class: one counted hold of about twenty seconds each way, in heat, the only rotation the sequence contains. The seat differs first: in Iyengar’s presentation you sit on the folded foot — its outer edge laid under the sitting bones, a folded blanket between foot and seat when balance or the ankle complains — so the pelvis is lifted and the spine is given room to lengthen; 26 & 2 folds the heel beside the opposite hip and keeps both hips on the floor, so the twist is anchored by the down knee, which the posture’s own cue insists must stay down. The arms differ next: 26 & 2 presses the arm against the outside of the raised knee, grips the down knee, and plants the free hand on the floor behind the spine (the fuller studio dialogue reaches that hand round to the thigh) — a lever and a prop that make a strong, even twist available in a short hold — while Light on Yoga’s photographs for the pose run from plate 307 to 316 as a staircase: the elbow hooked across the knee, then the classical presentation at 311–312 with the armpit over the knee, the hand catching the foot and the free arm swung round behind the waist, then the arm straightened onto the foot at 313–314. Neither is the other’s correction: Iyengar’s ladder makes the bind the destination and the pose a rung between Marichyasana III and Pasasana, while 26 & 2 wants no bind, because after twenty-four postures of forward, backward and sideways bending the point is to turn the whole spine once each way, evenly, and let go.',
  refinements: [
    'Plant the crossed foot as if it were standing in Tadasana — the whole sole pressing down, inner heel and big-toe mound especially — so the raised knee becomes a fixed post for the arm to work against instead of something that drifts outward; in the Iyengar method that foot is what keeps the twist honest.',
    'Lengthen before you turn: on each inhale lift the trunk from the pubic bone up through the sternum and let the outer hips settle down, then twist only on the exhale — Iyengar teachers hang the whole rotation on the breath, so the spine never turns any shorter than it started, which is exactly the ratchet the 26 & 2 breath cue describes.',
    'Turn the ribcage, not the shoulders: draw the shoulder blades back and down and broaden the collarbones first, then let the chest revolve from between the blades — the shoulders stay level, as the posture’s cue asks, and the twist lands in the upper back, where the spine has the most rotation to give.',
    'Let the back hand prop, not carry: press the floor with the fingertips to grow taller, but keep the shoulders stacked over the hips — Iyengar-method teachers warn that leaning back into that hand tips the trunk and steals the twist.',
    'When your turn allows, bring the contact against the knee down from the elbow toward the armpit — in the Iyengar method the armpit over the knee is what converts arm leverage into a whole-trunk turn — but keep the posture’s rule: the arm holds what the spine earns; it never cranks.',
  ],
  stages: [
    'Bottom leg straight, the other foot planted outside it, hand or forearm on the raised knee — the leg arrangement of Marichyasana III without its bind, and the same version the 26 & 2 cautions give for a knee or hip that objects to folding under.',
    'Both legs folded as in class, both hands holding the raised knee instead of the arm hooked — the hand-clasp stage Iyengar teachers use before the elbow — turning on the exhale with the down knee anchored and both sitting bones weighted.',
    'The complete 26 & 2 form: arm pressed against the outer knee, hand gripping the down knee, free hand on the floor behind the spine, chin over the shoulder last.',
    'Beyond class, in Iyengar’s direction: sit up onto the folded foot with a blanket between foot and seat, take the armpit over the knee, reach the hand toward the foot and the free arm round behind the waist — the classical presentation of plates 311–312.',
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
