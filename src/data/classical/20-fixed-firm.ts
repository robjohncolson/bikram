import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#20 Suptavajrāsana,
//   "Reclining Thunderbolt Pose"; nearest equivalent in other schools given as
//   Supta Virasana, Reclining Hero Pose; the article notes that some of the
//   series' Sanskrit names differ from those other schools use for the same
//   or closely related poses)
// - https://en.wikipedia.org/wiki/Virasana (also where /wiki/Supta_Virasana
//   lands: vira = hero, supta = reclined; medieval texts' Virasana was a
//   cross-legged meditation seat and the modern kneeling pose is
//   twentieth-century, described in Light on Yoga; knees together, feet
//   apart, seat on the floor between them; variations Supta Virasana (hands
//   beside the thighs or overhead), Adho Mukha Virasana, Eka Pada Supta
//   Virasana / Ardha Supta Virasana, Yogadandasana; one of the few poses
//   said to be fine straight after eating; knee-injury note and support
//   under the seat; Vajrasana as the other kneeling seat)
// - https://en.wikipedia.org/wiki/Vajrasana_(yoga) (vajra = thunderbolt or
//   diamond; sitting on the heels; the Hatha Yoga Pradipika uses the name as
//   a synonym of Siddhasana; the seventeenth-century Gheranda Samhita's
//   Vajrasana has the feet beside the buttocks, i.e. the modern Virasana,
//   while other texts mean sitting on the feet; Supta Vajrasana is an
//   Ashtanga intermediate-series pose; Laghu Vajrasana; orthopaedic notes
//   on the knees and "yoga foot drop")
// - https://en.wiktionary.org/wiki/सुप्त (supta: asleep, resting, dormant,
//   latent; from Proto-Indo-European *swep- "to sleep")
// - https://en.wiktionary.org/wiki/वज्र (vajra: "the hard or mighty one",
//   Indra's thunderbolt, the diamond thought as hard as it; adjective
//   adamantine, hard, impenetrable; from PIE *weǵ- "strong, lively";
//   Avestan vazra, the mace of Mithra)
// - https://en.wiktionary.org/wiki/वीर (vira: a man, especially a brave or
//   eminent one, a hero; from PIE *wiHrós "man", cognate with Latin vir and
//   Old English wer; Rigvedic)
// - https://www.ghoshyoga.org/postures-of-ghosh-yoga.html (the Ghosh
//   lineage's collated repertoire: #7 Vajrasana "Firm Posture" and #32
//   Supta-Vajrasana "Reclined Firm Posture", the latter in Buddha Bose,
//   Gouri Shankar Mukerji, Monotosh Roy and P. S. Das)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 200-odd asanas,
//   c. 600 photographs; each asana graded 1–60; asanas, then pranayama)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Virasana #40, p. 120, intensity 1, plates 85–92; Supta Virasana #41,
//   p. 123, intensity 2, plates 93–96; Paryankasana #42, p. 125, grade 2,
//   plate 97; Bhekasana #43, p. 126, grade 4, plates 98–100; Supta Bhekasana
//   #164, grade 21, plates 457–458; the book's own Supta Vajrasana is #57,
//   p. 146, grade 12, plates 123–124, filed right after Baddha Padmasana
//   (#55, p. 142) — not Fixed Firm; Laghuvajrasana #176, grade 23, plate
//   513; Ustrasana #16, grade 3, plates 40–41; Matsyasana #51, grade 5,
//   plates 112–114)
// - https://eyalshifroni.com/blog/b-k-s-iyengars-light-on-yoga-asanas-index/
//   (the same index by family: photos 86–124 are the sitting poses — Supta
//   Virasana, Paryankasana, Bhekasana, Padmasana with variations, Supta
//   Vajrasana)
// - Plates cross-checked in two Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Virasana 89; Supta Virasana 96 "supported and not supported";
//   Paryankasana 97; Bhekasana 100; Supta Vajrasana 124; Laghu Vajrasana
//   513; Supta Bhekasana 458)
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Virasana 88, 89; Supta Virasana 93, 96 "unsupported, or supported as
//   needed"; Paryankasana 97; Bhekasana 100; Laghuvajrasana 513)
// - https://www.ashtangayoga.info/ashtanga-yoga/intermediate-series-nadi-shodhana/item/supta-vajrasana/
//   (the pose that carries the name Supta Vajrasana in the Ashtanga
//   intermediate series and in Light on Yoga: from bound lotus, arching back
//   to the crown while holding the toes — a lotus backbend, unrelated to the
//   26 & 2 recline)
// - https://yogaselection.com/supta-virasana-reclining-hero-pose/
//   (Iyengar-method teaching: thighs descend while the inner knees draw in
//   and the knees stay together; tops of the feet press down, little-toe
//   edges on the floor, heels pointing up; tailbone and buttocks tuck; calf
//   flesh drawn away from the knee crease before sitting; chest lifts; a
//   bolster under the back and support under the head; a nine-stage
//   progression through folded blankets, a block, a chair and bolsters;
//   Adho Mukha Virasana as the counterpose)
// - https://yogainternational.com/article/view/laid-back/ (the thighs kept
//   strictly parallel — the knees drifting apart under the pull of the front
//   thigh is the common fault; the rectus femoris as the usual limiter,
//   attached above the hip joint, so the top of the pelvis tilts back and
//   the sitting bones move toward the knees; the arched lumbar that lets a
//   stiff body reach the floor is the other fault; blankets under the
//   ankles, the pelvis, the back and the head; arms overhead reaching away
//   from the knees)
// - https://yogavastu.com/p/virasana/ and https://yogavastu.com/p/supta-virasana/
//   (Iyengar-method Virasana: calf flesh drawn out and away from the knee as
//   you sit, weight into the front of the shins, spine long, chest open, a
//   block or blankets under the seat; Supta Virasana as a restorative,
//   body-weight stretch with blocks under the head and upper back, the open
//   chest allowing fuller breathing)
// - https://prajnayoga.com/the-couch-pose-paryankasana/ (Paryankasana as
//   Supta Virasana with the upper back arched over a bolster, hands holding
//   the elbows overhead and reaching back; a preparation for pranayama)
// - https://en.wikipedia.org/wiki/Bhekasana (bheka = frog; Light on Yoga
//   pp. 126–129, i.e. the entry that follows Paryankasana)
// - https://courses.bikramyogaworks.com/pages/supta-vajrasana-fixed-firm-pose
//   (26 & 2 execution: sit between the heels with the hips on the floor,
//   hands to the feet, one elbow down then the other, then head and
//   shoulders; arms overhead gripping the opposite elbows and drawing them
//   toward the floor; exit back through the elbows)
export const fixedFirm: ClassicalNote = {
  asana: 'Supta Virasana',
  asanaEnglish: 'Reclining Hero Pose',
  etymology:
    'Supta is “asleep” or “lying down” — from the ancient root that means to sleep — and vajra is Indra’s thunderbolt and, by extension, the diamond: the hard, unbreakable thing, so that as an adjective the word means adamantine. The Ghosh lineage rendered Vajrasana as “Firm Posture” and this recline as “Reclined Firm”, which is where the English “Fixed Firm” comes from; Iyengar files the same shape under vira, “hero” or simply “man” (a cousin of the Latin vir), so his Supta Virasana is the reclining hero.',
  reference: { plates: '93–96', difficulty: 2 },
  contrast:
    'Light on Yoga does contain a Supta Vajrasana, but it is a different pose entirely — a grade-12 backbend taken from bound lotus, filed among the Padmasana variations at plates 123–124 — while the shape you practise here is the book’s Supta Virasana, the recline of the hero seat, graded 2 of 60 at plates 93–96 and placed among the beginners’ sitting poses. Neither lineage is misnaming anything: the seventeenth-century Gheranda Samhita already used Vajrasana for a seat with the feet beside the buttocks — what Iyengar calls Virasana — and the published repertoires of Bishnu Ghosh’s Calcutta school kept that reading, so the 26 & 2 name carries an older text’s usage and Iyengar’s carries a newer one. The base is identical — seat on the floor between the heels, feet hugging the hips, toes pointing straight back — and both want the thighs parallel and the knees together, but the ways down differ: 26 & 2 climbs down a ladder of elbow, elbow, shoulders and finishes with the arms overhead holding opposite elbows, twice, for a counted forty seconds or so in a heated room, whereas Iyengar takes the full form once with the arms beside the thighs or overhead, and in his method the pose is more often a long, supported rest — a bolster along the spine, a folded blanket under the head, minutes rather than seconds — than a counted hold. The two answers to a lifting knee are the clearest contrast: 26 & 2 has no props, so a knee that rises sets today’s depth and you stay on the elbows and let the heat and the weeks do the work, while the Iyengar method raises the floor instead — a blanket under the ankles, a block under the seat, a bolster under the back — so the back can rest while the knees stay down, and lowers the props over months. What both agree on is the purpose: a deep, passive lengthening of the fronts of the thighs and hips that restores the knees after the belly-down backbends and readies the front body for the arches to come — Camel two postures on in this sequence; Paryankasana, Bhekasana and the deeper backbends in Iyengar’s, where the open chest of the recline is traditionally said to be a good place to learn to breathe before pranayama.',
  refinements: [
    'Make the seat before you load it. In the Iyengar method you sit down between the heels while drawing the flesh of each calf outward and away from the back of the knee, so the weight lands on the front of the shins and the joint is not pinched; the tops of the feet press into the floor, the little-toe edges stay down and the heels point up — the same “feet glued alongside the hips, soles to the ceiling” that 26 & 2 asks for, arrived at from underneath.',
    'Keep the thighs parallel on purpose. Iyengar-method teachers read knees drifting apart as the stretch escaping sideways — the front of the thigh tightens and pulls the knees out — so the inner knees draw toward each other and the thighs stay on one track for the whole descent; “knees together” is not a tidiness rule, it is what keeps the lengthening in the quadriceps.',
    'Tip the pelvis before you tip the trunk. The muscle that limits the recline runs from the pelvis across both the hip and the knee, so in the Iyengar method each stage down begins by lengthening the tailbone toward the knees and letting the top of the pelvis tilt back; the arched lower back that lets a stiff body reach the floor is the common fault, and your own caution to stop at the elbows when the low back is troubled is the same principle read from the other side.',
    'Lengthen away from the knees once you are down. With the elbows held overhead, reach them along the floor away from the knees and let the front ribs settle rather than flare, so the stretch runs in one line from knees to elbows; the chest lifts because the upper back and shoulders open, not because the lower back arches.',
    'Breathe as if the pose were a rest — because for Iyengar it is. His method holds this recline long and quiet, the opened chest a place to learn fuller breathing before pranayama, and that same slow breath is how 26 & 2 wants the posture to grow quieter the lower you settle: each exhale releasing the front of the hips, none of them forcing.',
  ],
  stages: [
    'The upright seat alone: sit between the heels with a folded blanket under the ankles — or a block under the seat if the knees complain — spine tall, hands on the thighs, and breathe there. The Iyengar rule is that a base is made comfortable before it is loaded, and this is also the padded, upright version your ankle and knee cautions ask for.',
    'Hands, then elbows: lean back onto the hands, then one elbow and the other, chest lifted and both knees on the floor. If a knee rises, this is the posture today — both lineages say so, the Iyengar method by reaching for a prop, 26 & 2 by staying exactly here.',
    'The supported recline, outside the hot room: a bolster along the spine and a folded blanket under the head, so the back rests fully while the knees stay down and the lower back stays long — the Iyengar way of holding the shape for minutes, and a good place to learn where the pelvis needs to tilt.',
    'The full form: shoulders and head on the floor, knees together, arms overhead holding opposite elbows and reaching away from the knees, lower back long rather than arched — and the exit retraced elbow by elbow, never twisted off the legs.',
  ],
  ladder: {
    before: [
      'Vajrasana (Thunderbolt)',
      'Virasana (Hero)',
      'Eka Pada Supta Virasana (One-Legged Reclining Hero)',
    ],
    beyond: [
      'Paryankasana (Couch)',
      'Bhekasana (Frog)',
      'Ustrasana (Camel)',
      'Supta Bhekasana (Reclining Frog)',
    ],
  },
};
