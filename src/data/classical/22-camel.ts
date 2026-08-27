import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Ustrasana (uṣṭra = camel; a different,
//   standing pose carries the name in the 19th-c. Sritattvanidhi; the modern
//   kneeling backbend comes from two of Krishnamacharya's students — Pattabhi
//   Jois's Ashtanga series and Iyengar's Light on Yoga, pp. 87–88; Ardha
//   Ustrasana has a hands-on-hips version and a one-hand-on-heel/one-arm-
//   overhead version; toes tucked under is the lighter form; blocks beside
//   the calves as a prop; the pose is #22 of the Bikram series)
// - https://en.wiktionary.org/wiki/उष्ट्र (uṣṭra: camel, also buffalo, and a
//   cart drawn by either; from Proto-Indo-Iranian *úštras, cognate with the
//   Avestan uštra inside the name Zarathustra)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#22 Camel Pose =
//   Ustrasana, the same name in both lineages; #20 "Supta Vajrasana" is
//   nearest Supta Virasana; #23 Rabbit is nearest Balasana)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 200-odd asanas, ~600
//   photographs; each asana graded 1–60)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Ustrasana #16, p. 87, intensity 3, plates 40–41 — between Parighasana
//   #15 and Utkatasana #17; Virasana #40 p. 120 grade 1 plates 85–92; Supta
//   Virasana #41 p. 123 grade 2 plates 93–96; Salabhasana grade 1 plates
//   60–61; Bhujangasana I grade 1 plates 72–73; Urdhva Mukha Svanasana grade 1
//   plate 74; Dhanurasana grade 4 plate 63; Urdhva Dhanurasana I grade 7
//   plates 479–482; Kapotasana grade 21 plates 503–512; Laghuvajrasana grade
//   23 plate 513; Eka Pada Rajakapotasana I grade 28 plates 539–542; the
//   book's own "Supta Vajrasana" #57 is a lotus-based pose, grade 12, plates
//   123–124 — not Fixed Firm)
// - Plate 41 cross-checked in two Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Ustrasana 41; Supta Virasana 96; Kapotasana 507, 512; Laghu Vajrasana 513)
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Ustrasana 41; Supta Virasana 93, 96; Kapotasana 507–512; Laghuvajrasana 513)
// - https://yogavastu.com/p/ustrasana/ (Iyengar-method teaching: an important
//   early backbend that teaches arching with gravity; when the feet are out of
//   reach, blocks beside the feet or a bolster across the soles or over the
//   ankles)
// - https://yogaselection.com/four-stages-to-learning-ustrasana-camel-pose/
//   (Iyengar-method stages: toes tucked → bolster over the calves → bolster on
//   the soles → full; shins press down, backs of the thighs lift, fronts of
//   the thighs draw down, shoulder blades lift the chest, fingertips on the
//   heels progressing to palms on the soles, the spine between the blades
//   moves in)
// - https://www.ihanuman.com/asana/ustrasana (shins parallel, thighs
//   perpendicular, buttocks pressed down and forward, upper arms rotated
//   outward, chest lifted by the shoulder blades, head back onto the upper
//   back; preparations Salabhasana, Dhanurasana, Urdhva Mukha Svanasana;
//   follow-ups Urdhva Dhanurasana, a twist, Halasana, Sarvangasana; a block
//   between the knees or the feet)
// - https://yogainternational.com/article/view/ustrasana-camel-pose/ (from
//   Vajrasana; hands on the back of the pelvis first; thighs vertical, femurs
//   rolling in, sacrum moving forward and in; shoulder blades together and
//   down; back of the neck long; hands stay on the back when the heels are
//   out of reach; toes turned under as the lighter form; exit one hand at a
//   time, head last; child's pose after)
// - https://yogauonline.com/yoga-poses/camel-pose/ (knees hip-width; tailbone
//   lengthening down; buttock flesh released; lower front ribs kept from
//   flaring; inner shoulder blades toward the spine; the neck continuing the
//   line of the upper back; wall, blocks and chair as props; dizziness means
//   come out; do not twist the sacroiliac joints on the way out; preparations
//   Cobra, Locust, low lunge, half Bow)
// - https://en.wikipedia.org/wiki/Kapotasana (kapota = pigeon; a different
//   standing Kapotasana in the Sritattvanidhi; the kneeling backbend is the
//   Light on Yoga form, pp. 367–372)
// - https://en.wikipedia.org/wiki/Laghuvajrasana (laghu = little/light, vajra
//   = thunderbolt; thighs half-raised, crown to the floor, hands on the
//   ankles; Light on Yoga pp. 372–373)
// - https://en.wikipedia.org/wiki/Virasana (vira = hero, supta = reclined;
//   Light on Yoga pp. 123–125; a kneeling base for backbends)
// - https://en.wikipedia.org/wiki/Urdhva_Dhanurasana (urdhva = upward, dhanu =
//   bow; Ustrasana and Dhanurasana named as preparations)
// - https://courses.bikramyogaworks.com/pages/ustrasana-camel-pose (26 & 2
//   execution: knees and feet six inches apart, hands on the hips with fingers
//   down and thumbs out, head back first, then one hand at a time to the heel
//   with the thumb outside and fingers inside, everything pushing forward for
//   the whole hold; two sets)
export const camel: ClassicalNote = {
  asana: 'Ustrasana',
  asanaEnglish: 'Camel Pose',
  etymology:
    'Uṣṭra is the camel — an old Indo-Iranian word (in the earliest texts it could name a buffalo too) that survives in the name Zarathustra — and āsana is a seat or posture; the kneeling arc, seen side-on, is usually read as the animal’s hump. The name is older than the shape: a nineteenth-century Mysore manual, the Sritattvanidhi, gives Ushtrasana to a different, standing pose, and the kneeling backbend you practise is a twentieth-century form recorded by two of Krishnamacharya’s students — Pattabhi Jois in the Ashtanga series and Iyengar in Light on Yoga.',
  reference: { plates: '40–41', difficulty: 3 },
  contrast:
    'Same name, same shape, opposite place in the curriculum: Light on Yoga files Ustrasana sixteenth among its two hundred-odd poses, in the beginners’ standing work between Parighasana and Utkatasana, and grades it 3 of 60 — an early backbend for learning how to arch with gravity — whereas 26 & 2 saves it for the summit of the floor series and calls it the deepest backbend of the class. The execution runs close — a kneeling base with the toes pointing back, hands to the hips first, thighs kept as vertical as you can manage, the head released back — but the finish differs: Iyengar’s completed form lays the palms flat on the soles of the feet and presses them to lever the chest up, while 26 & 2 drops the head back before the hands go down, takes each heel in a grip one hand at a time, and then drives stomach, thighs and hips forward for the rest of the hold. Iyengar takes it once, for roughly half a minute of ordinary breathing, and in his method the missing inches are made up with props — blocks beside the feet, a bolster across the soles or the calves, a wall — so the arc is built in the upper back before the hands ever reach the feet; 26 & 2 gives you two counted sets in a heated room and no props, so the arc is built by warmth and repetition, and the hands simply stay on the hips until the heels are yours. On the buttocks the lineages answer the same question differently: 26 & 2 has you squeeze the glutes throughout as guardians of the low back, while Iyengar-method teachers vary — some press the buttocks down and forward, others soften them to make room for the sacrum — and both are ways of keeping the hinge out of the lumbar spine. The exits say something too: Iyengar walks on from Ustrasana toward Urdhva Dhanurasana, Kapotasana and Laghu Vajrasana, settling afterwards with a forward bend or a twist; 26 & 2 has no wheel and no pigeon, so Camel is the roof of the sequence and Rabbit, its exact mirror, follows at once.',
  refinements: [
    'Root the shins and the tops of the feet into the floor and lift the backs of the thighs, so that “push the hips forward” is a lift up out of the pelvis rather than a slide of the knees past vertical — in the Iyengar method the thighs stay perpendicular and the forward drive comes from the sacrum moving in and forward, which is the same thing the 26 & 2 cue means by keeping the thighs upright.',
    'Build the arc in the upper back: draw the inner edges of the shoulder blades toward the spine and down, then press the spine between them forward into the chest — Iyengar’s way of making the sternum rise, and exactly the barrel-not-hinge that the 26 & 2 cue asks for.',
    'Roll the upper arms outward before the hands go down, so the shoulders open rather than round when the grip lands; the collarbones stay wide and the chest keeps its lift once the heels are in hand.',
    'Keep the lower front ribs from flaring: lengthen the side ribs up and let the lift come from the chest rather than the belly — Iyengar-method teachers watch for the flared rib because that is where the low-back hinge hides.',
    'Lengthen the back of the neck before you let the head go, and let it be the last link to fall and the first to return — the neck continuing the line of the upper-back arch, not folding at its base — which is what “the hips lead, not the head” means in practice; and, as both lineages say, if the room spins, come up and sit back.',
  ],
  stages: [
    'Hands on the back of the hips, fingers down, elbows drawing together: press the hips forward and lift the chest, stopping where the thighs are still vertical — the hands-on-hips half form (Ardha Ustrasana) of the Iyengar catalogue, and the exact shape the 26 & 2 cautions give for a sore low back.',
    'Toes tucked under so the heels rise to meet the hands — an Iyengar-method rung to practise outside the hot room (in class the toes stay pointing straight back, so take the stage before or after this one instead).',
    'One hand at a time: one hand stays on the hip pressing forward while the other reaches for its heel, then return and switch — the other half form, one hand on a heel with the opposite arm sweeping overhead, trains the same asymmetry.',
    'Both heels in hand, head back, sternum lifting, hips and thighs pressing forward continuously; in the Iyengar method the final refinement is to lay the palms flat on the soles so the feet become a lever for the chest.',
  ],
  ladder: {
    before: [
      'Virasana (Hero)',
      'Supta Virasana (Reclining Hero)',
      'Bhujangasana (Cobra)',
      'Dhanurasana (Bow)',
    ],
    beyond: [
      'Urdhva Dhanurasana (Upward Bow)',
      'Kapotasana (Pigeon)',
      'Laghu Vajrasana (Little Thunderbolt)',
      'Eka Pada Rajakapotasana (One-Legged King Pigeon)',
    ],
  },
};
