import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Salabhasana (śalabha = locust/grasshopper;
//   not in the medieval hatha texts — first printed in the 1905 Yogasopana
//   Purvacatuska, then described independently by Vishnudevananda 1960 and
//   Iyengar 1966; main form = legs, arms and head all lifted, arms reaching
//   straight back; Ardha Salabhasana = one leg (and opposite arm) at a time;
//   the Bikram form is staged — arms under the body pointing to the feet,
//   palms down, chin on the floor, each leg, then both)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#17 Locust,
//   nearest classical name given as Ardha Salabhasana; #18 Full Locust,
//   Purna-Salabhasana, nearest Salabhasana; #16 Cobra; #19 Bow)
// - https://en.wikipedia.org/wiki/Makarasana (Light on Yoga pp. 100–101 gives
//   Makarasana as a Salabhasana variation — fingers clasped behind the head,
//   elbows up; the Gheranda Samhita 2.40 form is a different, resting pose)
// - https://en.wikipedia.org/wiki/Dhanurasana (LoY pp. 101–102; Parsva
//   Dhanurasana = the same pose rolled onto one side)
// - https://en.wikipedia.org/wiki/Bhujangasana (LoY pp. 107–108; Salabhasana
//   and Sphinx listed as preparation for it)
// - https://en.wikipedia.org/wiki/List_of_asanas (Locust: reclining backbend,
//   20th c.; Crocodile GhS 2.40; Bow HYP 1.27; Cobra GhS 2.42)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; ~200 asanas, ~600
//   photographs; 1–60 difficulty grades; pranayama section)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Salabhasana #25, p. 99, intensity 1, plates 60–61; Makarasana #26,
//   p. 100, no grade, plate 62; Dhanurasana #27, p. 101, grade 4, plate 63;
//   Parsva Dhanurasana p. 102, grade 4, plates 64–65; Chaturanga Dandasana
//   p. 104, grade 1, plates 66–67; Bhujangasana I #31, p. 107, grade 1,
//   plates 72–73; Urdhva Mukha Svanasana p. 108, grade 1, plate 74;
//   Ustrasana p. 87, grade 3, plates 40–41; Viparita Salabhasana p. 416,
//   grade 58, plate 584 — so Light on Yoga files Locust before Cobra)
// - Plate 60 cross-checked in three Iyengar-association syllabi (all list
//   Salabhasana 60, Makarasana 62, Dhanurasana 63, Bhujangasana I 73,
//   Urdhva Mukha Svanasana 74, Ustrasana 41 at introductory level; the UK
//   syllabus later lists Parsva Dhanurasana 64–65 and Viparita Salabhasana 584):
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
// - https://sivanandalondon.org/twelve-basic-asanas/locust/ (the Sivananda
//   form: chin pushed forward, hands under the body as fists or clasped,
//   elbows drawn together; Half Locust one leg at a time, Full Locust both
//   legs on the third inhale — the same architecture as the 26 & 2 posture)
// - https://yoganga.com/articles/salabhasana/ and
//   https://yogauonline.com/yoga-practice-teaching-tips/yoga-for-beginners/marla-apt-refine-your-salabhasana-building-strength-and-vigor-in-locust-pose/
//   (Iyengar-method teaching: front thighs turned in, inner legs together,
//   reach through the big toes; tailbone pressed down so the buttocks do not
//   jam the low back; shoulder blades down the back, outer shoulders rolled
//   back, chest broad and reaching forward; neck long; one side often works
//   harder — use the limbs' extension to even the two sides; staged with
//   legs on the floor first; a brief hold, a burst of strength rather than
//   endurance; prepared by Trikonasana and the Virabhadrasanas, leads to
//   Dhanurasana, Urdhva Mukha Svanasana, Ustrasana, Urdhva Dhanurasana)
// - https://yogainternational.com/article/view/strengthen-dont-crunch-your-back-in-salabhasana/
//   (length rather than height; glutes active but not clenched; slight
//   inward hip rotation makes lumbar space; tailbone toward the heels)
// - https://www.ihanuman.com/asana/salabhasana and
//   https://www.ihanuman.com/journal/ihanuman/salabhasana-locust-pose-lower-back-pain
//   (classical form: abdomen the only contact; the closer the legs the
//   harder; prepared by Adho Mukha Svanasana and Chaturanga Dandasana;
//   followed by Dhanurasana, Makarasana, Ustrasana; Viparita Salabhasana
//   rests on chin and chest with the legs over the head)
// - https://yogavastu.com/p/salabhasana/ (Iyengar-method framing: the floor
//   backbend where you learn to lift against gravity before deeper backbends)
export const locust: ClassicalNote = {
  asana: 'Salabhasana',
  asanaEnglish: 'Locust Pose',
  etymology:
    'Śalabha is Sanskrit for a locust or grasshopper — the raised legs are usually read as the insect’s lifted hindquarters — and asana is “a seat” or “posture”; ardha means “half”, so a one-leg-at-a-time locust is Ardha Salabhasana, and pūrṇa means “complete”, the word 26 & 2 saves for the next posture. The name is younger than it sounds: no medieval hatha text describes the pose, it first appears in print in a 1905 illustrated Indian manual, and the Sivananda school (1960) and Light on Yoga (1966) recorded it independently within a few years of each other.',
  reference: { plates: '60–61', difficulty: 1 },
  contrast:
    'Iyengar’s Salabhasana is the everything-off-the-floor form: the arms reach straight back beside the body and lift, the head and chest rise, both straight legs rise, and only the abdomen touches the floor — filed at plates 60–61, graded 1 of his sixty, and placed in Light on Yoga before Cobra rather than after it. 26 & 2 practises a different architecture, the one the Sivananda schools also teach (with fists or clasped hands under the body where 26 & 2 uses flat palms): arms pinned under the body, chin reaching forward along the floor, one leg lifted at a time and then both — a staged half form that usually goes by Ardha Salabhasana outside this sequence and that Light on Yoga never lists as a separate entry. The reason is the lever: with the palms pressing down beneath the hips the arms become a fulcrum, the legs can rise higher than an unassisted back could raise them, and the anchored chin and chest isolate the work in the hips and low back — the counted, single-region strength this sequence wants banked before Full Locust asks the whole body to fly. Iyengar’s form does without the fulcrum: with nothing under you the lift is smaller, but the whole back body from the nape to the heels has to fire at once, which is why teachers in his method treat this grade-1 shape as the place you first learn to lift against gravity before Dhanurasana (grade 4). Teachers in the Iyengar method hold it briefly and describe it as a burst of strength rather than an endurance pose, where 26 & 2 gives you three separate lifts on a count; and the shape travels a long way from here — 26 & 2’s own Full Locust is a Salabhasana variation with the arms swung out into wings, Makarasana on the next page clasps the hands behind the head, and Viparita Salabhasana, the locust turned upside down to balance on chin and chest, sits near the top of the scale at grade 58.',
  refinements: [
    'Lengthen before you lift. In the Iyengar method the leg is reached back toward the wall behind you before it is raised — kneecap drawn up, the whole limb moving as one piece — so the height comes from a long leg rather than a bent one; that is the classical version of the locked-knee cue.',
    'Turn the front of the lifting thigh slightly inward and reach through the big toe. Iyengar teachers watch for the foot swinging outward as a straight leg rises; the small inward roll keeps the inner leg working, keeps that hip from rolling up off the arm, and leaves room in the sacrum instead of jamming it.',
    'Tailbone toward the heels, buttocks firm but not clenched. Iyengar-method teachers keep the front of the pelvis pinned to the floor while the legs lift; with your hips resting on your forearms that becomes: both hip points equally heavy on the arms, and if one starts to lift, take the leg an inch lower and grow it longer instead.',
    'Keep the neck long even with the chin down. The Iyengar rule is that the lift never travels into the neck — the base of the skull stays free — so reach the chin forward along the floor rather than pressing it down into the floor, and let the throat stay soft.',
    'Set the shoulders before the legs move. In Iyengar’s form the outer shoulders roll back and the shoulder blades slide down the back so the chest broadens; with your arms beneath you, roll the outer shoulders under and toward the floor before the first lift — the collarbones widen, the forearm pressure spreads along the whole forearm instead of one point, and the chest keeps what room it can for those short breaths.',
  ],
  stages: [
    'Upper body only, legs resting on the floor: arms alongside you, lift the head, chest and hands and reach back through the fingers while the breastbone reaches forward — the first stage Iyengar-method teachers use, learning to lift from the back with nothing under you.',
    'One leg at a time with the arms beside the body rather than under it: front of the pelvis down, both hips level, an inch of honest lift — the same arms-alongside alternative the Take care notes give for wrists, elbows and shoulders.',
    'The 26 & 2 form: arms fed under, palms down beneath the hips, chin reaching forward, one leg to about forty-five degrees, then both legs together on one strong inhale with the palms pressing down.',
    'Iyengar’s full Salabhasana: arms reaching back beside you and lifted, head, chest and both legs off the floor with only the abdomen bearing you — which is, give or take the wings, the shape 26 & 2 asks of you in the very next posture.',
  ],
  ladder: {
    before: [
      'Utthita Trikonasana (Extended Triangle)',
      'Virabhadrasana I (Warrior I)',
      'Adho Mukha Svanasana (Downward-Facing Dog)',
      'Chaturanga Dandasana (Four-Limbed Staff)',
    ],
    beyond: [
      'Makarasana (Crocodile, the clasped-hands locust)',
      'Dhanurasana (Bow)',
      'Urdhva Mukha Svanasana (Upward-Facing Dog)',
      'Ustrasana (Camel)',
    ],
  },
};
