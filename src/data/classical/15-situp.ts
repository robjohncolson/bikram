import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#15 Pādahastāsana,
//   English "Situp", nearest equivalent in other schools: Paschimottanasana;
//   #2 Ardhachandrāsana with Pādahastāsana; #24 Jānuśīrṣāsana with
//   Paścimottānāsana; #14 Pavanamuktāsana, #16 Bhujaṅgāsana)
// - https://en.wikipedia.org/wiki/Bikram_Yoga (26 items = 24 asanas + 2
//   pranayama; standing series, first savasana, floor asanas, Kapalabhati,
//   final savasana; sequence devised from B. C. Ghosh's teaching)
// - https://www.ghoshyoga.org/postures-of-ghosh-yoga.html (Ghosh Yoga's
//   collation of the lineage's five publications: no sit-up listed anywhere;
//   Padahastasana is #12 and standing — "Foot-Hand Posture", body folded
//   forward — in all five; Paschimottanasana is #6, seated, in all five;
//   #13–17 are Baddha-Padmasana, Matsyasana, Chakrasana, Halasana,
//   Sarvangasana)
// - https://en.wikipedia.org/wiki/Sit-up (a floor-based abdominal exercise;
//   a fuller range of movement than a crunch)
// - https://en.wikipedia.org/wiki/Paschimottanasana (paschima = west / the
//   back of the body, uttana = intense stretch, asana = seat/posture; Hatha
//   Yoga Pradipika 1.28–29; illustrated in the 1830 Jogapradipika; entered
//   from Dandasana, feet or lower legs held, a strap round the feet if the
//   back is stiff; named variations include Janu Sirsasana, Upavistha
//   Konasana, Parivrtta Paschimottanasana and the balancing forms Urdhva
//   Mukha Paschimottanasana / Ubhaya Padangusthasana; Light on Yoga pp.
//   148–173 cited; no mention of Bikram or sit-ups)
// - https://en.wikipedia.org/wiki/Uttanasana (uttana = intense stretch;
//   Padahastasana = the variant with the hands under the toes and feet,
//   palms up; the modern standing fold is 20th-century — Krishnamacharya
//   1934, Light on Yoga pp. 91–93; the Sritattvanidhi's "Uttanasana" is a
//   different, supine shape)
// - https://en.wikipedia.org/wiki/Navasana (paripurna = full, nava = boat;
//   the 19th-c. Sritattvanidhi's Naukasana; balanced on the sitting bones,
//   not rolled back onto the tailbone; Ardha Navasana easier; Ubhaya
//   Padangusthasana harder, with the toes or feet held)
// - https://en.wikipedia.org/wiki/Dandasana (danda = stick/staff; legs
//   extended, trunk upright, hands on the floor; not in the medieval hatha
//   texts; the base Paschimottanasana is entered from)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 200+ asanas, ~600
//   photographs; every asana graded 1–60; asanas, then bandhas/kriyas, then
//   pranayama; an appendix of courses building over 300 weeks)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Paschimottanasana #67, p. 166, intensity 6, plates 153–162; Dandasana
//   #35, p. 112, intensity 2, plate 77; Paripurna Navasana #34, p. 111,
//   intensity 2, plate 78; Ardha Navasana #36, p. 112, intensity 2, plate 79;
//   Ubhaya Padangusthasana #70, p. 173, intensity 3, plate 167; Urdhva Mukha
//   Paschimottanasana I #69, p. 173, intensity 10, plate 168, and II #71,
//   p. 174, intensity 10, plates 169–170; Urdhva Prasarita Padasana #106,
//   p. 240, intensity 1, plates 276–279 (the sheet's IAST column mislabels
//   this row "Ekapādāsana"); Jathara Parivartanasana #105, p. 237, intensity
//   5, plates 272–275; Supta Padangusthasana #108, p. 244, intensity 13,
//   plates 284–287; Padahastasana #19, p. 91, intensity 6, plates 45–46;
//   Padangusthasana #18, p. 89, intensity 3, plates 43–44; Uttanasana #20,
//   p. 92, intensity 8, plates 47–48; Janu Sirsasana #59, p. 148, intensity
//   5, plates 126–129; no sit-up row)
// - https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (plate cross-check, source Light on Yoga — Level 1: Padangusthasana 44,
//   Padahastasana 46, Uttanasana 48, Dandasana 77, Paripurna Navasana 78,
//   Ardha Navasana 79, Urdhva Prasarita Padasana (90°) 279, Supta
//   Padangusthasana I 284 / II 287, Janu Sirsasana 127, Paschimottanasana
//   161; Level 2: Ubhaya Padangusthasana 167, Jathara Parivartanasana
//   274–275, Urdhva Prasarita Padasana all plates 276–279; Level 3: Urdhva
//   Mukha Paschimottanasana I 168, II 170)
// - https://yogapath.com.au/pose-of-the-week-pascimottanasana/ (Light on
//   Yoga gives Paschimottanasana five pages and ten photographs, plate 162
//   the finished form; Iyengar's remark that a correct Paschimottanasana
//   puts no felt weight on the back; entered from Dandasana; hands catch the
//   feet)
// - https://yoganga.com/articles/paschimottanasana/ (Iyengar-method teaching:
//   sitting bones drawn back and spread; knees and feet firm, not turning
//   out; inner edges of the legs press the floor; heels extend away from the
//   pelvis; tops of the thighs turn in and press down; the fold is at the
//   hips, not the waist; first phase concave back — front of the trunk lifted
//   from pelvis to throat, back ribs and spine moving forward; hands hold a
//   belt, then the outer heels, then the heels, kept apart to keep the chest
//   broad; navel and sternum aimed at the toes rather than head at legs; head
//   rests only once belly and ribs rest on the legs, back of the neck level;
//   inhale lengthens the front, exhale extends forward; errors: pulling the
//   head down as the goal, folding from the waist, tightening belly and
//   chest, elbows dropping; props: blankets under the seat, belt, block,
//   bolster or chair for the head)
// - https://yogavastu.com/p/paschimottanasana-concave-spine-looking-up/
//   (the concave-spine stage: from Dandasana, bend without rounding, dorsal
//   spine moving in, full length from pubis to sternum, belt if needed; the
//   final pose of forward-bend sequences)
// - https://yogavastu.com/p/paschimottanasana/ (backs of the legs pressed to
//   the ground as you reach for the feet; belt if necessary; needs full
//   hamstring extension and front-body length)
// - https://yogavastu.com/p/urdhva-prasarita-padasana/ (Iyengar-method: lie
//   flat, legs raised to 90°, back ribs and pelvis pressed into the floor,
//   low back never arching; static hold or a slow see-saw of the legs; arms
//   by the sides or, harder, overhead; belt)
// - https://yogaselection.com/yoga-poses-for-abdominal-strength/
//   (Iyengar-method abdominal work = Urdhva Prasarita Padasana and Paripurna
//   Navasana; backs of the shoulders and the back of the pelvis stay on the
//   floor; alignment before range; stages and belts rather than force; leg
//   movements synchronised with the breath; no sit-ups or crunches)
// - https://yogavastu.com/p/paripurna-navasana/ (Iyengar-method: balance on
//   the buttocks alone, feet higher than the head, arms forward at shoulder
//   height, breath never restrained — release when it is; beginners hold a
//   couple of breaths; belt round the feet for a flat back and straight legs)
// - https://www.griffinshill.com.au/blog/savasana-a-much-misunderstood-yoga-pose
//   (Iyengar-lineage: legs straightened one at a time lying down; to come
//   out, roll to the right side, wait there a little, then sit up)
//
// `asana` is null: Light on Yoga has no sit-up and the Ghosh lineage lists
// none either. `reference` points at Paschimottanasana's plates because that
// is the shape the sit-up dives into and the equivalent the published
// posture table names; no difficulty grade is given because the sit-up
// itself is not graded (Paschimottanasana as a whole is grade 6).
export const situp: ClassicalNote = {
  asana: null,
  etymology:
    'Pada is the foot, hasta the hand, and asana a seat or posture, so Pada-Hastasana names the hands-to-feet finish rather than the movement that gets you there. A published table of the 26 & 2 sequence calls this item a sit-up and maps its nearest classical shape to Paschimottanasana; a Ghosh-lineage index of five early manuals contains standing Padahastasana and seated Paschimottanasana, but no sit-up entry. In Light on Yoga, Padahastasana is the standing fold at plates 45–46, with the palms beneath the feet. A grip on the big toes instead belongs to the padangustha family: pada, foot, with angustha, big toe or thumb. The seated fold has its own older name: paschima is west or the back of the body, uttana is an intense stretch, and the fifteenth-century Hatha Yoga Pradipika already describes Paschimottanasana.',
  reference: { plates: '153–162, as Paschimottanasana' },
  contrast:
    'Light on Yoga has no sit-up entry. The nearest classical counterpart is only the finish: Paschimottanasana, plates 153–162 and grade 6 of 60. Iyengar-method teachers enter that pose from Dandasana, keep the legs grounded, lengthen the front of the trunk and hinge at the hips before lowering the head; 26 & 2 passes through the fold in a quick, double-exhale transition, with the chin tucked, big toes held and elbows reaching down. The methods also choose different abdominal work. Iyengar-method sources teach Urdhva Prasarita Padasana with the back ribs and pelvis grounded while the legs move by stages, and Paripurna Navasana as a balance with the breath left free; the sit-up moves the whole trunk with momentum between floor postures. Neither approach is a correction of the other. If you hold the toe-grip instead of passing through it, the classical ladder continues to Ubhaya Padangusthasana at plate 167 and Urdhva Mukha Paschimottanasana at plates 168–170.',
  refinements: [
    'Set the back before you swing. Iyengar-method supine leg work keeps the back ribs and the back of the pelvis grounded while the legs load. As the arms reach overhead and the chin tucks, lengthen the low back into the mat so the lift begins from a gathered trunk rather than an exaggerated arch.',
    'Arrive on the sitting bones. The seat you pass through is Dandasana; Iyengar-method instructions draw the sitting bones back, press the legs down and reach the heels away. Land there before you dive for the toes so the fold can begin at the hips.',
    'Keep the legs active: draw the kneecaps up, press the backs of the legs toward the floor, reach through the heels and keep the thighs from rolling apart. This carries the posture’s straight-leg, heels-down cue through the whole transition.',
    'Lengthen before you lower. In the concave stage of Paschimottanasana, the front of the trunk reaches forward and the back stays unrounded. Use the second exhale to send the breastbone toward the feet first; let the forehead follow rather than lead.',
    'Use the grip for length, not to drag the head down. Let the pull travel from the big toes through elbows that reach down and slightly out, keep the chest broad, and retain this posture’s chin-to-chest position without hunching the shoulders.',
  ],
  stages: [
    'Use the alternative already given in this posture’s Take care list: bend the knees, roll to your side and press up with the hands. Once seated, stay tall or reach gently toward the shins.',
    'Soften the knees for the sit-up, then hold the shins, ankles or a belt around the feet with the chest open. Keep the head up; for now the forward movement is only a hinge at the hips.',
    'Keep the legs straight and heels grounded as you rise, then take the toes and stop with the front of the trunk long. Let the second exhale carry the breastbone forward before the forehead descends.',
    'For the full transition, keep the legs straight and heels down, hold the big toes, reach the elbows toward the floor and the forehead toward the knees, then release promptly. Outside the class, explore the finish as a steadier Paschimottanasana rather than repeating the snap.',
  ],
  ladder: {
    before: [
      'Dandasana (Staff)',
      'Urdhva Prasarita Padasana (Upward Extended Legs)',
      'Supta Padangusthasana (Reclining Big-Toe Hold)',
      'Ardha Navasana (Half Boat)',
    ],
    beyond: [
      'Paschimottanasana (Seated Forward Bend)',
      'Paripurna Navasana (Full Boat)',
      'Ubhaya Padangusthasana (Both Big Toes)',
      'Urdhva Mukha Paschimottanasana (Upward-facing Forward Bend)',
    ],
  },
};
