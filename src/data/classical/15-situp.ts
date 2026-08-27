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
// - https://en.wikipedia.org/wiki/Sit-up (an abdominal endurance exercise;
//   fuller range than a crunch; the standard form bends the knees to reduce
//   stress on the back and spine; concerns about compressive lumbar load;
//   from 2015 the US armed forces began replacing sit-ups with planks)
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
// - https://en.wikipedia.org/wiki/Supta_Padangusthasana (supta = reclined,
//   pada = foot, angustha = big toe; from Savasana one leg is raised and the
//   big toe held; belt if the hamstrings are tight; 20th-century; Light on
//   Yoga pp. 244–246)
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
// - https://www.fitsri.com/poses/urdhva-mukha-paschimottanasana (urdhva =
//   upward, mukha = face; a seated balance with the legs raised and the trunk
//   drawn to them, forehead toward the knees; a supine version lifting the
//   legs and clasping the soles; Light on Yoga plate 170; related to Ubhaya
//   Padangusthasana and Navasana)
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
    'Pada is the foot, hasta the hand, and asana a seat or posture — so Pada-Hastasana names only the finish, hands to feet, and the sit-up that gets you there carries no Sanskrit at all: it is a gymnasium word, and the collated repertoire of Bishnu Ghosh’s own school lists no sit-up either. In Light on Yoga the name belongs to a standing pose — Padahastasana, plates 45–46, palms slid under the soles from a forward bend, the very shape posture 2 ends in — while the grip you actually take here, fingers hooked round the big toes, is what Iyengar’s naming calls padangustha, from angustha, the big toe (or thumb): Padangusthasana standing, Supta Padangusthasana lying down, Ubhaya Padangusthasana sitting up and holding both. The fold the sit-up dives into has an older name of its own, Paschimottanasana: paschima is the west, which on the body’s own compass — facing the sunrise — means the back, and uttana an intense stretch, so the seated forward bend is the intense stretch of the west side, the whole back of you from heels to skull, a pose the fifteenth-century Hatha Yoga Pradipika already describes.',
  reference: { plates: '153–162, as Paschimottanasana' },
  contrast:
    'There is no sit-up anywhere in Light on Yoga, and the way the Iyengar method leaves the floor is the opposite of a snap: you come out of Savasana by bending the knees, rolling to one side, waiting there a moment and pressing up with the hands — exactly the roll-up this posture’s own cautions prescribe when the back or neck object — because that method does not spend momentum on a transition, it spends attention. What the sit-up snaps into is Paschimottanasana, plates 153–162 and grade 6 of 60, which the published posture table for this sequence names as the sit-up’s nearest classical relative: Iyengar enters it from Dandasana (plate 77), the tall staff seat with the legs pressing down, folds from the hips with the back concave and the front of the trunk long before the head is allowed to descend, uses the hands at the feet as levers for length rather than depth, and rests in the finished fold for minutes as one of the quietest poses in the book, whereas 26 & 2 takes the same shape as a two-exhale flick — grab, pull, elbows down, forehead toward the knees — and is gone. The abdominal work is where the two lineages part most clearly: Iyengar’s core poses are held isometrics — Urdhva Prasarita Padasana (plates 276–279, grade 1), the legs raised and lowered by stages with the back ribs and pelvis nailed to the floor and never a swing; Paripurna and Ardha Navasana (plates 78–79, grade 2), balanced on the buttocks with the feet higher than the head and the breath left free; Jathara Parivartanasana (plates 272–275) — while 26 & 2 chooses dozens of fast, straight-legged repetitions with heat and momentum on its side. Both choices are deliberate: a held leg-raise teaches the abdomen to steady a still spine, the sit-up teaches it to launch the whole trunk off the floor and re-fire the body after every twenty-second savasana, and the double exhale gives the floor series a pulse no held pose could. And Iyengar does keep the sit-up’s finish as a posture in its own right — Ubhaya Padangusthasana (plate 167, grade 3) and Urdhva Mukha Paschimottanasana (plates 168–170, grade 10) hold both feet with the legs raised and the trunk drawn to them, one balanced on the seat, one lying back — so if you ever wonder where the toe-grab leads once it stops being a transition, that is the answer.',
  refinements: [
    'Set the back before you swing. Iyengar’s supine leg work keeps the back ribs and the back of the pelvis pressed into the floor so the low back never arches as the legs load; borrow that in the second before the sit-up — as the arms sweep overhead and the chin tucks, lengthen the low back into the mat and press the back ribs down, so the lift begins from a trunk already gathered rather than from an arched spine yanked upright. It is the same protection your low-back caution is after, applied a moment earlier.',
    'Arrive on the sitting bones. The seat you pass through at the top is Dandasana, and in the Iyengar method it is built on the sitting bones — drawn back and spread — with the legs pressing down through their inner edges and the heels reaching away; his Navasana rule is the same, balance on the buttocks, never rolled back onto the tailbone. Land on that seat on the way through and the dive for the toes starts from the hips, which is where a forward bend is supposed to start.',
    'Keep the legs the way Iyengar keeps them in every forward bend: kneecaps drawn up, backs of the thighs and calves pressing the floor, heels extending away from the pelvis, tops of the thighs turning a touch inward so the legs do not splay. Your cues already ask for straight legs, heels down and feet flexed; this is what turns those into a lengthening of the whole back body rather than a tug on the knees.',
    'Fold from the hips and lengthen before you lower. Iyengar’s first phase of Paschimottanasana is the concave back — front of the trunk lifted from pubic bone to breastbone, back ribs moving forward, navel and sternum aimed at the toes — and the head goes down only once the belly and ribs have arrived on the legs. In the sit-up you have one exhale for this: use it to send the breastbone toward the feet first, and let forehead-toward-the-knees be where the length ends up rather than what leads it.',
    'Pull to lengthen, not to drag. In the Iyengar method the hands at the feet are levers: the pull from the grip runs along the spine to open the trunk, the elbows bend out and down rather than the shoulders hunching up, and the chest stays broad. In the toe-grab let the pull travel from the big toes to the elbows — which are on their way to the floor anyway — while the chin stays exactly where this posture keeps it, on the chest, so the neck rides the length instead of making it.',
  ],
  stages: [
    'The Iyengar way off the floor — the same one this posture’s cautions give: bend the knees, roll to your side, pause for a breath, press up to sitting with the hands, then reach for the shins with the knees soft. Every sit-up in class can be this one; nothing in the floor series depends on the snap.',
    'Sit up with the knees softened, as the low-back cue allows, then straighten the legs once you are seated and hold the shins, the ankles, or a strap looped over the feet — Iyengar’s belt — with the back concave and the chest open. No head down yet; the fold is a hinge at the hips and nothing more.',
    'Straight legs the whole way up, heels on the floor, chin tucked, hands to the toes — but stop with the back concave, breastbone reaching for the feet, elbows bending outward, and let the second exhale decide how far the forehead travels. Depth is not asked for here; length is.',
    'The full form: legs straight and heels down throughout, big toes held, elbows toward the floor, forehead toward the knees, the double exhale emptying the lungs — quick and light, gone in two breaths. Held longer outside class the same shape is Paschimottanasana; held with the legs in the air it is Ubhaya Padangusthasana.',
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
