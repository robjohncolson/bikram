import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Kapalabhati (kapala = skull, bhati =
//   shining; a shatkarma of medieval hatha yoga; the Gheranda Samhita's
//   claims for it)
// - https://en.wikipedia.org/wiki/Shatkarma (Kapalabhati is the fifth of
//   the six acts listed in the Hatha Yoga Pradipika and repeated in the
//   Gheranda Samhita; a sharp short out-breath followed by a release that
//   lets the body inhale by itself)
// - https://www.wisdomlib.org/hinduism/book/hatha-yoga-pradipika-english/d/doc7975.html
//   and https://archive.org/details/HathaYogaPradipika-SanskritTextWithEnglishTranslatlionAndNotes
//   (Pancham Sinh's 1914 translation, public domain: 2.21 the six acts are
//   for bodies with excess fat or phlegm, others need not do them; 2.22 the
//   list — dhauti, basti, neti, trataka, nauli, kapalabhati; 2.23 they are
//   kept secret; 2.35 Kapala Bhati = inhalation and exhalation worked very
//   fast like a blacksmith's bellows, drying phlegm disorders; 2.36
//   pranayama succeeds once the six acts have cleared the phlegm; 2.59–67
//   Bhastrika, seated in Padmasana, the bellows image again, said to break
//   the three knots and rouse kundalini)
// - https://www.hindupedia.com/en/Kap%C4%81labh%C4%81ti (Gheranda Samhita
//   1.56–59: three varieties — vatakrama, air drawn in one nostril and out
//   the other; vyutkrama, water in through the nose and out the mouth;
//   sitkrama, water in through the mouth and out the nose)
// - https://en.wikipedia.org/wiki/Gheranda_Samhita (late 17th c.; sevenfold
//   path with the shatkarmas first; Kapalabhati among its six)
// - https://en.wikipedia.org/wiki/Bhastrika (Iyengar: the kriya of
//   Kapalabhati is a milder form of Bhastrika — Light on Yoga, 1995 ed.,
//   pp. 449–450; rapid forceful in- and out-breaths driven by the
//   diaphragm; HYP: breaks the three knots)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; three parts —
//   introduction, c. 200 asanas graded 1–60 plus bandhas and kriyas, then
//   pranayama; no plates or grades in the pranayama part)
// - https://en.wikipedia.org/wiki/Vajrasana_(yoga) (vajra = thunderbolt or
//   diamond; the Hatha Yoga Pradipika uses the name as a synonym of
//   Siddhasana with a heel at the perineum; Gheranda 2.12 describes what
//   Light on Yoga calls Virasana; Sjoman: Light on Yoga never describes the
//   basic Vajrasana; Laghu Vajrasana at pp. 372–373)
// - https://en.wikipedia.org/wiki/Virasana (vira = hero; knees together,
//   feet apart, seat resting on the floor between them; a cushion for
//   beginners; an alternative seat for pranayama and meditation; knee
//   cautions)
// - https://loyindex.org → Eyal Shifroni's Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Virasana #40, p. 120, grade 1, plates 85–92; Siddhasana p. 116, grade
//   1, plate 84; Padmasana p. 129, grade 4, plates 104–105; Baddha Konasana
//   grade 3, plates 101–103; Supta Vajrasana grade 12, plates 123–124;
//   Laghuvajrasana grade 23, plate 513; no Vajrasana row and no pranayama
//   rows — the index covers the asana part only)
// - https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (sources Light on Yoga and Light on Pranayama; Level 1: Ujjayi and
//   Viloma lying down; Level 2: the same sitting, Ujjayi with a short
//   kumbhaka, Anuloma and Pratiloma without retention, Bhramari, Sitali,
//   Sitkari; Level 3: Ujjayi with antara kumbhaka, "Bhastrika, Kapalabhati",
//   Anuloma and Pratiloma with retention)
// - https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Light on Pranayama chapter 23 = Kapalabhati and Bhastrika; Kapalabhati
//   stage I enters at Intermediate Junior I, after Ujjayi stages I–VIII and
//   Viloma I–V; stage II and Bhastrika I–II at Intermediate Junior II —
//   "3 or 4 cycles, 5 or 6 strokes at a time", and if the sound of the
//   stroke changes in the third or fourth round, wait, then resume; stages
//   III and IV at the Senior levels)
// - https://www.mettayogastudio.com/metta-blog/kapalabhati (attributes to
//   Iyengar: the inhalation is slow and the exhalation vigorous; a general
//   exhilaration among the effects)
// - https://yogainternational.com/article/view/learn-kapalabhati-skull-shining-breath/
//   (modern teaching: erect seat, Siddhasana ideal; the abdomen thrusts for
//   the exhale and the inhale is entirely passive and about three times
//   longer; only the abdomen moves, ribcage suspended, cheeks soft;
//   beginners 11 strokes a round, three rounds, about one a second, resting
//   30–60 s on normal breaths between rounds; stop on dizziness or a lost
//   rhythm; cautions for blood pressure, heart, glaucoma and ear trouble;
//   empty stomach)
// - https://en.wikipedia.org/wiki/Bandha_(yoga) (Jalandhara = the chin
//   lock: neck extended, sternum lifted, chin lowered to the chest;
//   Uddiyana: after a full exhale the abdomen is drawn up under the ribs on
//   a false inhale, the base of nauli; Iyengar on Mula Bandha at Light on
//   Yoga p. 525 and pp. 435–437)
// - https://en.wikipedia.org/wiki/Nauli (a shatkarma: abdominal churning,
//   staged from Uddiyana Bandha; in the Hatha Yoga Pradipika; rarely taught
//   in yoga as exercise)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#26 Kapalabhati,
//   "Skull polishing", nearest equivalent "not an asana: a shatkarma, a
//   purification"; #1 Pranayama likewise not an asana)
// - https://en.wikipedia.org/wiki/Bikram_Yoga (devised c. 1971 on B. C.
//   Ghosh's teaching; 90 minutes, 24 postures and two breathing exercises at
//   105 °F / 40 % humidity; Kapalabhati is the last item before the final
//   relaxation)
// - https://www.ghoshyoga.org/postures-of-ghosh-yoga.html (the Ghosh
//   lineage's collated list has Vajrasana, "Firm Posture", at #7 in Bose,
//   Mukerji, Roy and Das; the list carries no breathing entries)
// - https://yogavastu.com/p/virasana/ (Iyengar-method kneeling seat: calf
//   flesh drawn away from the knee and outward before sitting, weight into
//   the front of the shins, spine long through the crown, chest and
//   shoulders open, a block or folded blankets under the seat when the
//   knees object, arms kept active on the knees)
//
// No `reference`: Light on Yoga handles Kapalabhati inside the pages it
// gives to Bhastrika in the pranayama part (pp. 449–450 of the 1995
// edition per Wikipedia), which carries neither plates nor a 1–60 grade,
// and the kneeling Vajrasana seat has no entry of its own in the book.
export const kapalbhati: ClassicalNote = {
  asana: null,
  etymology:
    'Kapala is the skull and bhati is shining, so Kapalabhati is the skull-brightening — a name for the clear head the practice leaves you with rather than for anything the body does, which is why the class’s own English for it, Blowing, names the action instead. Vajrasana pairs vajra — the thunderbolt that is also the diamond, the hardest and steadiest thing the old texts could name — with asana, a seat; the Hatha Yoga Pradipika uses that name for a cross-legged seat with a heel pressed to the perineum (its other name is Siddhasana), while the kneeling seat you actually take, shins down and hips on the heels, is the Vajrasana of the Ghosh school’s own lists, where it stands at number 7 as Firm Posture. The Gheranda Samhita keeps three Kapalabhatis — one of air, drawn in through one nostril and out the other, and two of water passed between nose and mouth — which tells you the older idea inside the name: a rinsing of the head, kin to neti, long before it was a workout for the belly.',
  contrast:
    'The classical texts do not file this as a pranayama at all: in the Hatha Yoga Pradipika it is the last of the six cleansing acts — the shatkarmas, prescribed for bodies carrying excess phlegm or fat, kept quiet, and done so that pranayama proper can succeed afterwards — and its whole description is a blacksmith’s bellows worked fast until the phlegm dries; Iyengar, five centuries on, folds it into the pages Light on Yoga gives to Bhastrika, the bellows breath, as that practice’s gentler relative, and Light on Pranayama gives the pair a chapter of their own, so the classical form lives in the part of the book that carries no plates and no 1–60 grade. What the Iyengar method makes of it is a sitting practice kept apart from asana work and reached late — the association syllabi place Kapalabhati after the whole ladder of Ujjayi and Viloma and the first retentions, beside Bhastrika, and meter the bellows breath in cycles of five or six strokes with a rule to wait whenever the sound of a stroke changes — where 26 & 2 hands it to every first-timer at the end of a hot ninety minutes as two counted sets of sixty, the second faster, because its job in that room is expulsion: the last stale air of the class blown out before you lie down. The seat differs as well: classical pranayama sits cross-legged (the Pradipika puts Bhastrika in Padmasana, and the Iyengar seats are Siddhasana, Padmasana or Virasana, the kneeling seat that rests between the heels at plates 85–92, grade 1), and Light on Yoga never describes the plain kneeling Vajrasana at all, keeping the name for two much harder poses, so Kapalbhati in Vajrasana takes its base from the Ghosh school’s Firm Posture — a seat Iyengar’s book knows only as the moment before Virasana’s feet slide apart. Then the lips: the classical strokes go through the nose, since the six acts are about clearing the head, and the Iyengar method, like the texts, keeps the mouth closed for every breath but the cooling inhales of Sitali and Sitkari, while 26 & 2 blows each stroke out through the lips — the same choice it makes for the “ha” of Standing Deep Breathing, so the two exercises that bracket the class both empty by the mouth. Where the lineages agree is the mechanism, and it matters more than all the rest: Iyengar’s summary of this breath is that the inhalation is slow and the exhalation vigorous, and the modern teaching everywhere has the abdomen thrust for the out-breath and simply let go for the in-breath — which is the instruction you already have, so the contrast is one of setting, seat, count and lips, never of what the belly does.',
  refinements: [
    'Set the seat the way the Iyengar method sets Virasana, before asking anything of the breath: tops of the feet pressing down, ankles long, the flesh of the calf drawn back and outward from behind the knee as you sit, so the weight lands on the front of the shins and the sit-bones rest evenly on both heels. A folded blanket under the ankles, or between hips and heels, is how that method makes a kneeling seat sustainable — and a seat that hurts will pull your attention out of the belly within ten strokes.',
    'Lift the chest first, then leave it alone. In the Iyengar method the sternum is raised and the collarbones widened before the first breath moves, and the ribcage is then held where it is — suspended, not pumping — so the whole action lives below the ribs. That is the classical version of your cue that chest, shoulders and face stay still: they are still because they were set, not because they are braced.',
    'Make the out-breath the only event. Iyengar’s own summary of this breath is that the inhalation is slow and the exhalation vigorous: the belly snaps back on the stroke and is simply released afterwards, and the air that returns is recoil, not a sip. If you catch yourself drawing the inhale in, you have drifted toward Bhastrika — the bellows, where both halves are worked — and the exercise becomes twice as tiring for no more effect.',
    'Borrow the lock’s lift, not its chin. Iyengar’s seated pranayama is done in Jalandhara Bandha — breastbone up, chin down onto it — but 26 & 2 keeps the head level, so take only the half that fits: the sternum rising toward the chin, the back of the neck long, the head balanced so that it does not nod with each stroke. A head that bobs is being moved by the shoulders, which means the shoulders are moving.',
    'Listen to the strokes and rest between rounds. The Iyengar syllabi meter the bellows breath in short cycles and tell you to wait when the sound of a stroke changes, and the classical teaching always follows a round with quiet breaths; here the count is fixed, but the gap between the two sets is yours — spend it on one or two long, silent breaths through the nose rather than a gasp, and if the blow through the lips goes soft before sixty, let it be soft rather than turning it into a chest breath.',
  ],
  stages: [
    'The seat, breathing normally: kneel and sit on the heels — blanket under the ankles, or between hips and heels if the knees object — hands on the knees, spine long through the crown. Breathe quietly and watch the belly rise and fall under the ribs so you know which muscle the pump will use. This is also the version the pregnancy note asks for, so it is a complete practice in itself.',
    'A short, slow round: a dozen sharp exhales at one a second or slower — the beginner’s count in the classical teaching — then half a minute of ordinary breathing. The test is not the count but what moved: only the belly, with the face soft and the shoulders quiet, and no pull on any inhale. This is the gentler pace the blood-pressure note asks for.',
    'Build toward sixty at the class tempo, keeping every stroke the same size and the same sound; if the rhythm breaks, the head swims or the fingers tingle, stop and breathe normally — the pose’s own rule — and begin the next round from where the rhythm was still clean.',
    'The full form: two sets of sixty, the second faster, chest lifted and still, every inhale entirely passive — and, in the spirit of the Iyengar method, the sixtieth stroke as crisp as the first.',
  ],
  ladder: {
    before: [
      'Vajrasana (Thunderbolt)',
      'Virasana (Hero)',
      'Ujjayi Pranayama (Victorious Breath)',
      'Uddiyana Bandha (Abdominal Lift)',
    ],
    beyond: [
      'Bhastrika Pranayama (Bellows Breath)',
      'Nauli (Abdominal Churning)',
      'Nadi Sodhana Pranayama (Alternate-Nostril Breath)',
    ],
  },
};
