/**
 * The Moon-days notes — hand-written, one per lunar phase and one per
 * planetary day. Each names a few postures the day's mood leans toward
 * and one thing to notice in the hold. The associations are tradition,
 * described as tradition: they never override the class, its order, or
 * the cautions on a posture's page, and they claim no effects.
 */

export interface SkyNote {
  title: string;
  /** where the association comes from, honestly */
  tradition: string;
  /** the note itself, in the teacher's voice */
  text: string;
  /** pose ids the day leans toward (2–4) */
  postures: string[];
  /** one thing to notice in today's class */
  notice: string;
}

/** Indexed by moonPhase().bucket — 0 new … 4 full … 7 waning crescent. */
export const PHASE_NOTES: SkyNote[] = [
  {
    title: 'New Moon — begin quietly',
    tradition:
      'Across many traditions the dark of the moon is a seed time: the day for the plainest, most deliberate practice rather than the most ambitious one.',
    text:
      'Give the breath the whole class today. Let Standing Deep Breathing set a count you keep all the way to Kapalbhati, and treat every hold as a place to breathe rather than a shape to reach. Depth will come back on its own over the next fortnight.',
    postures: ['pranayama', 'tree', 'savasana'],
    notice: 'the length of your exhale — whether it stays as long as the inhale once the room is hot',
  },
  {
    title: 'Waxing Crescent — build',
    tradition:
      'The waxing moon is traditionally the half of the month for building and beginning; the crescent is the first visible sliver of that.',
    text:
      'Small, honest gains today. Sit a little lower in Awkward Pose than yesterday; stay a breath longer in Standing Head to Knee before you kick; let Cobra lift from the back muscles alone. Nothing dramatic — the point is that it is repeatable tomorrow.',
    postures: ['awkward', 'standing-head-to-knee', 'cobra'],
    notice: 'the standing leg — whether the knee stays truly locked while the rest of you works',
  },
  {
    title: 'First Quarter — meet the resistance',
    tradition:
      'Half lit and half dark, the first quarter is traditionally the point where effort meets resistance and the decision to continue is made.',
    text:
      'The balancing series is where the class asks the question. In Standing Bow, kick and reach in equal measure; in Balancing Stick, let the whole body become one line for the full count; in Locust, lift from the back of the body. Falling out and going back in is the practice, not a failure of it.',
    postures: ['standing-bow', 'balancing-stick', 'locust'],
    notice: 'the moment you want to come out early — and what happens if you take one more breath first',
  },
  {
    title: 'Waxing Gibbous — refine',
    tradition:
      'Just short of full, the gibbous moon is traditionally a time for adjusting and refining what has already been built, not adding more.',
    text:
      'Change nothing about the effort; change the precision. In Triangle, check the hips before you check the depth; in the standing head-to-knee stretch, let the forehead find the knee by lengthening rather than pulling; in Bow, kick the legs up and let the arms be ropes. Second set, same shape, one degree cleaner.',
    postures: ['triangle', 'standing-separate-leg-head-to-knee', 'bow'],
    notice: 'the difference between your first set and your second — which one was more honest',
  },
  {
    title: 'Full Moon — soften',
    tradition:
      'Traditions disagree here: the Ashtanga custom rests entirely on the full and new moons, while others practise as usual. The lens takes a middle way — a full class, held more gently.',
    text:
      'Practise the whole sequence, and take the pressure off the depth. Let Half Moon be a long, even side bend rather than a deep one; let Wind Removing and the Spine Twist do their quiet work; and stay in savasana as long as the class allows. A full moon class is a good one to remember how it feels to hold back on purpose.',
    postures: ['half-moon', 'wind-removing', 'spine-twisting', 'savasana'],
    notice: 'how much you can let go of in each savasana — the jaw, the hands, the eyes',
  },
  {
    title: 'Waning Gibbous — take stock',
    tradition:
      'After fullness, the waning moon is traditionally the half of the month for digesting, reviewing, and gratitude.',
    text:
      'Let the floor series be the teacher today. Fixed Firm and Half Tortoise ask for patience rather than strength; the head-to-knee stretch shows you exactly where you are. Notice what has changed since the last full moon, and what has not, without arguing with either.',
    postures: ['fixed-firm', 'half-tortoise', 'head-to-knee-stretching'],
    notice: 'how the second side differs from the first in every two-sided posture',
  },
  {
    title: 'Last Quarter — release',
    tradition:
      'The last quarter is traditionally the time for letting go — clearing what the month built up so the next one can begin clean.',
    text:
      'Give the exhales the class. Let the separate-leg stretch fold on the out-breath; let Rabbit round and release without forcing the forehead in; let the Spine Twist turn a little further on every exhale and never on an inhale. Leave the mat lighter than you arrived.',
    postures: ['standing-separate-leg-stretching', 'rabbit', 'spine-twisting'],
    notice: 'the exhale that ends each hold — whether you let it finish before you move',
  },
  {
    title: 'Waning Crescent — rest and prepare',
    tradition:
      'The last sliver before the dark — the balsamic moon in the old vocabulary — is traditionally a time for rest, reflection, and readying for what comes next.',
    text:
      'The two breathing exercises frame the class; today, let them be the class. Pranayama slow and complete at the start, Kapalbhati sharp and light at the end, and everything between them practised at a pace you could sustain for a lifetime. Then savasana without a clock.',
    postures: ['pranayama', 'kapalbhati', 'savasana'],
    notice: 'the pause between breaths — the still point after each exhale',
  },
];

/** Indexed by planetaryDay().index — Sunday first. */
export const DAY_NOTES: SkyNote[] = [
  {
    title: 'Sunday — the Sun’s day',
    tradition:
      'The planetary week is one of the oldest and most consistent of the sky traditions: each day carries a planet, and the Sun’s day is the day of the heart and the spine.',
    text:
      'The spine-strengthening series is the Sun’s work: Cobra, Locust, Full Locust, and Bow, each lifting from the back of the body with the breath steady. Let the chest open because the back muscles asked it to, not because the arms pushed.',
    postures: ['cobra', 'locust', 'full-locust', 'bow'],
    notice: 'that the lift comes from the back, not the arms — in Cobra, take the hands off the floor for one breath',
  },
  {
    title: 'Monday — the Moon’s day',
    tradition: 'The Moon’s day is traditionally the day of water, rhythm, and receptivity.',
    text:
      'Let the breath lead and the body follow. Half Moon moves with the breath rather than against it; Wind Removing is a conversation between the thigh and the belly’s rise and fall; savasana is where the day’s practice actually lands.',
    postures: ['half-moon', 'wind-removing', 'savasana'],
    notice: 'how the breath moves the belly in the floor series, and whether you let it',
  },
  {
    title: 'Tuesday — Mars’s day',
    tradition: 'Mars’s day is traditionally the day of heat, drive, and effort.',
    text:
      'The standing series is built for this. Sit the full depth of Awkward Pose; kick hard in Standing Bow and reach just as hard the other way; hold Balancing Stick as one straight line for every count. Effort with a soft face is the skill.',
    postures: ['awkward', 'standing-bow', 'balancing-stick'],
    notice: 'strength without gripping — the jaw, the brow, and the hands stay soft while the legs work',
  },
  {
    title: 'Wednesday — Mercury’s day',
    tradition: 'Mercury’s day is traditionally the day of the mind, the nerves, and the breath as messenger.',
    text:
      'Concentration is the posture today. In Standing Deep Breathing, count without losing count; in Eagle, let the fixed gaze do the balancing; in the Spine Twist, look over the shoulder and let the eyes finish what the spine started.',
    postures: ['pranayama', 'eagle', 'spine-twisting'],
    notice: 'where the gaze goes — and how the balance changes the instant it wanders',
  },
  {
    title: 'Thursday — Jupiter’s day',
    tradition: 'Jupiter’s day is traditionally the day of expansion and generosity.',
    text:
      'Room to breathe. Standing Separate Leg Stretching opens the back of the body; Triangle opens the hips and the chest at once; Camel opens the whole front. Take each only as far as the breath stays generous — an open chest with a held breath is not open.',
    postures: ['standing-separate-leg-stretching', 'triangle', 'camel'],
    notice: 'the breath into the back ribs in every opening posture',
  },
  {
    title: 'Friday — Venus’s day',
    tradition: 'Venus’s day is traditionally the day of ease, balance, and symmetry.',
    text:
      'Grace over force. Tree stands without a fight; Toe Stand balances on the breath as much as the foot; the separate-leg head-to-knee stretch gives the second side exactly the care the first side got. Evenness is the depth today.',
    postures: ['tree', 'toe-stand', 'standing-separate-leg-head-to-knee'],
    notice: 'whether both sides received the same attention — and which side you secretly favour',
  },
  {
    title: 'Saturday — Saturn’s day',
    tradition: 'Saturn’s day is traditionally the day of discipline, structure, and stillness.',
    text:
      'Stay the full count. Fixed Firm and Half Tortoise reward the practitioner who does nothing extra; Kapalbhati asks for sixty honest exhalations, not fifty-five; and savasana is a posture, held with the same discipline as the rest.',
    postures: ['fixed-firm', 'half-tortoise', 'kapalbhati', 'savasana'],
    notice: 'staying the full count in every hold — not one breath less',
  },
];
