import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Shavasana — the pages
//   https://en.wikipedia.org/wiki/Pavanamuktasana and
//   https://en.wikipedia.org/wiki/Supta_Padangusthasana both resolve to its
//   "Variations" section (Pavanamuktasana: hands clasped round the shin,
//   knee to the chest, body may rock; unknown to medieval hatha yoga,
//   twentieth-century, the Bikram basic sequence given as an example;
//   Supta Padangusthasana: not medieval, #27 of the Ashtanga primary series,
//   cited to Light on Yoga 1979 ed. pp. 244–246; Savasana itself is in
//   Hatha Yoga Pradipika 1.32)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#14 Pavanamuktāsana,
//   Wind Relieving Pose, nearest equivalent given simply as Pavanamuktasana;
//   #13 Savasana; #15 Sit-up mapped to Paschimottanasana)
// - https://en.wikipedia.org/wiki/List_of_asanas (no Pavanamuktasana or
//   Apanasana row; Supta Padangusthasana dated 20th c. / Krishnamacharya;
//   Jathara Parivartanasana 20th c. / Light on Yoga; Shavasana 15th c. HYP)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; c. 200 asanas, c. 600
//   photographs; 1–60 grades; asanas, then pranayama, then course appendix)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (no Pavanamuktasana, Pawanmuktasana or Apanasana row among the 200
//   asanas; Supta Padangusthasana #108, p. 244, grade 13, plates 284–287;
//   Urdhva Prasarita Padasana #106, p. 240, grade 1, plates 276–279; Jathara
//   Parivartanasana #105, p. 237, grade 5, plates 272–275; Karnapidasana #92,
//   p. 220, grade 1, plates 245–246; Halasana #91, p. 216, grade 4, plates
//   238–244; Supta Konasana #93, p. 221, grade 2, plates 247–248; Pindasana in
//   Sarvangasana #103, p. 234, grade 5, plates 268–269; Savasana #200, p. 422,
//   ungraded, plate 592)
// - https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Level 1, "Udara Akunchana Sthiti – Asanas for Abdominal Contraction":
//   Urdhva Prasarita Padasana (90°) 279, Supta Padangusthasana I 284, II 287;
//   Level 2: Jathara Parivartanasana 274–275, Urdhva Prasarita Padasana
//   276–279, Supta Padangusthasana I 285–286 and III; Halasana 244,
//   Karnapidasana 246, Supta Konasana 247 under the inversions; Savasana 592
//   under "Visranta Karaka Sthiti – Restorative"; Supta Baddha Konasana
//   sourced to Yoga: A Gem for Women, not Light on Yoga; no Pavanamuktasana
//   or Apanasana anywhere in the four levels)
// - https://www.ghoshyoga.org/postures-of-ghosh-yoga.html (the lineage's
//   collated list: #1 Shavasana/Mritasana, #2 Pavanamuktasana "Air Releasing
//   Posture" in all five publications — Bishnu Ghosh, Buddha Bose, Gouri
//   Shankar Mukerji, Monotosh Roy, P. S. Das — #3 Bhujangasana; #30 Eka Pada
//   Pavanamuktasana in four of them; #61 Upavishta-Pavanamuktasana, the
//   seated version, in Bose and Mukerji)
// - https://yoganga.com/articles/supta-padangusthasana/ (Iyengar-method
//   teaching by Marla Apt: heels to a wall, sacrum slid long before the legs
//   straighten; both thighs pressed to the floor, inner thigh turned in, inner
//   heel extended; outer hip of the raised leg moved away from the head;
//   thigh bone drawn down into its socket; knee bent to the chest before the
//   belt goes round the ball of the foot; start nearer 60° than 90°; faults:
//   the floor thigh popping up, the buttock of the raised leg lifting; held
//   up to a minute a side; used for low-back relief and traction)
// - https://yogaselection.com/supta-padangusthasana/ (Iyengar method: enter
//   by bending the knee to the chest, then the belt; front of the floor thigh
//   pressed down until the gap behind the knee closes, kneecap and toes to
//   the ceiling; outer thigh and hip of the raised leg moved away from the
//   ribcage, both sides of the sacrum kept down; backs of the shoulders
//   pressed to the floor, elbows slightly bent on the belt; variations I–IV,
//   the fourth a bent-knee version for the gluteal muscles)
// - https://yogavastu.com/p/supta-padangusthasana/ (Iyengar method: kneecap
//   and toes of the floor leg to the ceiling; the back body pressed into the
//   floor; the raised leg drawn back into the pelvis; belt and wall versions)
// - https://www.wisdomlib.org/definition/pavana (pavana = wind, air, breath,
//   "the purifier", from the root pū, to purify) and
//   https://www.wisdomlib.org/definition/mukta (mukta = released, set free,
//   past participle of muc, to release; also the liberated soul)
// - https://en.wikipedia.org/wiki/Prana (the five vayus; apana sits in the
//   lower abdomen, moves downward and outward, governs elimination)
// - https://www.yogapedia.com/definition/7885/pavanamuktasana (pavana / mukta
//   / asana; eka pada and dwi pada versions; head down or lifted)
// - https://en.wikipedia.org/wiki/Halasana (Karnapidasana: karna = ear, pid =
//   to squeeze; not medieval; described independently by Vishnudevananda
//   1960 and Iyengar 1966; knees bent down beside the head from the plough)
// - https://en.wikipedia.org/wiki/Ananda_Balasana (Happy Baby: a twentieth-
//   century name, but the shape appears as Kandukasana, "ball pose", in the
//   19th-c. Sritattvanidhi)
// - https://en.wikipedia.org/wiki/Asana_Pranayama_Mudra_Bandha (Satyananda
//   Saraswati, 1969, Bihar School of Yoga) with the series structure taken
//   from https://habuild.in/habitology/asana-mudra/pawanmuktasana-series-1/
//   and https://habuild.in/habitology/asana-mudra/pawanmuktasana-series-3/
//   (pawanmuktasana as three series: anti-rheumatic joint work, the
//   digestive/abdominal group, and the shakti bandha "energy-lock" group)
//
// `asana` is null and `reference` is omitted: Light on Yoga has no entry for
// this shape under any of its names, and no plate in the book shows the knee
// hug on its own — it is the entry move of Supta Padangusthasana in Iyengar
// teaching, not a photographed pose.
export const windRemoving: ClassicalNote = {
  asana: null,
  etymology:
    'Pavana is wind — literally “the purifier”, from the root pū, to make clean, the air that cleanses by moving — mukta is “released” or “set free”, the past participle of muc, to let go (the same root gives mukti, liberation), and asana is a seat or posture: a pose for the release of wind, which is exactly what it claims to do. Its other common name, Apanasana, points at apana, the vital air the yoga texts place in the lower abdomen and describe as moving downward and outward, in charge of elimination. Neither name is old — no medieval hatha text describes the pose, it surfaces in twentieth-century manuals, and in the Bihar School of Satyananda “pawanmuktasana” is not one pose at all but the name of three whole series of joint-loosening and abdominal warm-ups, a reminder that the wind being freed was always as much stiffness as gas.',
  contrast:
    'Light on Yoga has no Pavanamuktasana: the name is absent from its two-hundred-odd entries and from the Iyengar syllabi built on them, because in that method the knee hug is a doorway rather than a destination — the first move of Supta Padangusthasana (graded 13, plates 284–287), which Iyengar teachers enter by bending the knee to the chest before a belt goes over the foot, a cousin of the straight-leg raise that shares its floor, Urdhva Prasarita Padasana (grade 1, plates 276–279), and the way most practitioners fold up to roll out of Savasana (plate 592). Iyengar’s supine work is organised around the straight leg — hamstring length, a level pelvis, a low back drawn long by the thigh pressing into the floor — and it keeps the abdomen quiet and spacious; 26 & 2 takes the same lying-down body and turns the attention the other way, toward compression: right knee, left knee, both, each thigh pressed beside the ribs in the order the colon runs, counted and repeated, with the straight leg doing quiet duty underneath. That emphasis is the Ghosh lineage’s own: in the collated repertoire of Bishnu Ghosh’s school Pavanamuktasana is posture number two of the entire list, straight after Savasana and just before Bhujangasana — the order the 26 & 2 floor series keeps, with only the sit-up slipped in between — and a one-leg version and a seated version are filed further along. So the two lineages are not disagreeing about one pose; they are using one shape for two jobs — for Iyengar a hinge and a rest between harder things, for 26 & 2 the first counted work of the floor, a digestive massage done lying down. The nearest thing Light on Yoga does grade is where the hug leads if you keep folding: Karnapidasana (grade 1, plates 245–246), the knees drawn down beside the ears from the plough.',
  refinements: [
    'Work the floor leg the way Iyengar teachers work the bottom leg of Supta Padangusthasana: the front of the thigh presses down until the gap behind the knee closes, the kneecap and the toes face straight up, and the inner heel reaches away as if into a wall. The 26 & 2 cue already asks for an actively straight leg; this gives it an anchor, and it is that anchor that keeps the pelvis honest while the other knee comes in.',
    'Watch the buttock on the hugging side. The Iyengar fault list for the supine leg poses is short and specific — the floor thigh popping up, the seat of the working leg lifting — so as you draw the knee toward its shoulder, keep both sides of the sacrum on the mat and let the outer hip of the bent leg move away from the ribs, down toward the heel of the straight leg. Then the pull lengthens the low back instead of tipping the pelvis.',
    'Seat the thigh bone before you pull. In the Iyengar method a leg is drawn back into its hip socket — the femur settled down and in toward the pelvis — before it is stretched. Do that with the bent leg here: let the head of the thigh sink into the socket as the elbows bend, so the press into the belly comes from the hip folding deeper rather than from the knee alone. That is what turns the hold into the glute and deep-rotator stretch the posture promises.',
    'Broaden the shoulder blades on the floor and keep the elbows bent, as Iyengar teachers hold the belt: backs of the shoulders pressed down, chest wide, elbows soft so the arms can pull without the shoulders climbing toward the ears. Head centred, throat soft, face quiet — the effort lives in the arms and never in the neck.',
    'Let the belly stay soft and breathe the Iyengar way — ordinary breathing, the exhale deepening the fold. The compression is done to the abdomen, not by it: a gripping belly resists the thigh, a released one receives it. The posture’s own “soften the belly” cue is the Iyengar principle exactly.',
  ],
  stages: [
    'One knee, the hands behind the thigh (the posture’s own alternative for a replaced knee or hip) and, if the low back grips, the other foot flat on the floor with that knee bent. Learn to keep the sacrum level and the shoulders down before the straight leg is asked to work.',
    'One knee held below the kneecap, the other leg straight and pressed into the floor with the foot upright and the toes drawn back toward you — the complete 26 & 2 single-leg form, with the Iyengar bottom-leg action underneath it.',
    'Both knees in, hands on the shins or holding opposite elbows, the sacrum still broad on the mat and the whole low back flattening — the second half of the posture as class gives it.',
    'Outside the count, the classical continuation: from the single-knee hug, loop a belt over the ball of the foot and straighten the leg toward the ceiling — Supta Padangusthasana I — keeping every floor-leg and pelvis action you built in the hug. In class you stay in the hug; this is where the shape goes when it leaves the room.',
  ],
  ladder: {
    before: [
      'Savasana (Corpse)',
      'Urdhva Prasarita Padasana (Upward Extended Feet)',
      'Supta Baddha Konasana (Reclining Bound Angle)',
    ],
    beyond: [
      'Supta Padangusthasana (Reclining Hand-to-Big-Toe)',
      'Jathara Parivartanasana (Revolving Belly)',
      'Ananda Balasana (Happy Baby)',
      'Karnapidasana (Knees-to-Ears)',
    ],
  },
};
