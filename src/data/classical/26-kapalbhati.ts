import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Kapalabhati (kapala = skull, bhati =
//   shining; Kapalabhati is classed as a shatkarma in medieval hatha yoga)
// - https://www.wisdomlib.org/hinduism/book/hatha-yoga-pradipika-english/d/doc7975.html
//   and https://archive.org/details/HathaYogaPradipika-SanskritTextWithEnglishTranslatlionAndNotes
//   (Pancham Sinh's public-domain translation of Hatha Yoga Pradipika,
//   chapter 2: verses 21-23 list and frame the six actions; verse 35 gives
//   Kapala Bhati a rapid bellows comparison; verses 36-37 distinguish the
//   cleansing actions from pranayama; verses 59-63 describe Bhastrika)
// - https://www.hindupedia.com/en/Kap%C4%81labh%C4%81ti (summary of Gheranda
//   Samhita 1.56-59: three practices share the name -- an alternating
//   nostril air practice and two practices moving water between nose and
//   mouth)
// - https://en.wikipedia.org/wiki/Vajrasana_(yoga) (vajra = thunderbolt or
//   diamond; asana = posture or seat; historical uses of the name vary;
//   modern Vajrasana sits on the heels, while modern Virasana sits between
//   them)
// - https://en.wikipedia.org/wiki/Virasana (vira = hero; the modern kneeling
//   pose places the seat on the floor between separated feet)
// - https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (the current UK association syllabus lists Bhastrika and Kapalabhati
//   under pranayamas at Level 3, after earlier breathing practices)
// - https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (the Canadian association syllabus assigns Kapalabhati stages within
//   its Light on Pranayama chapter; its asana plates are a separate column)
// - https://yogainternational.com/article/view/learn-kapalabhati-skull-shining-breath/
//   (modern instruction: choose a steady seated posture; contract the
//   abdomen for each nasal exhale, then release it so air returns without
//   effort; start slowly, keep an even rhythm, and rest between rounds)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (Kapalabhati is
//   item 26 and is explicitly identified as a shatkarma rather than an
//   asana)
// - https://www.ghoshyoga.org/postures-of-ghosh-yoga.html (the collated
//   Ghosh-lineage list gives Vajrasana the English label Firm Posture at
//   number 7)
//
// No `reference`: Kapalabhati names the breathing action, not the seat in
// which it is practised. The cited syllabi therefore list it with pranayamas,
// without an asana plate or a 1-60 difficulty grade.
export const kapalbhati: ClassicalNote = {
  asana: null,
  etymology:
    'Kapala means skull and bhati means shining, giving Kapalabhati its familiar “skull-shining” or “skull-polishing” rendering. The name belongs to the breathing practice, not to the kneeling shape that supports it. Vajrasana names that shape: vajra is a thunderbolt or diamond, and asana is a posture or seat. “Firm Posture” is the Ghosh lineage’s English label for Vajrasana rather than a literal third Sanskrit root. Historical sources have used Vajrasana for more than one seat; in common modern usage it means sitting on the heels. A summary of the later Gheranda Samhita likewise gives Kapalabhati to three different actions: one moves air between the nostrils, and two move water between nose and mouth.',
  contrast:
    'There is no classical asana to match here: you take a seat, but Kapalabhati itself is an action of breath. The Hatha Yoga Pradipika lists it among the six shatkarmas and describes inhalation and exhalation moving rapidly, using a bellows comparison. It then turns from those cleansing actions to pranayama. Modern catalogues place the boundary differently. The 26 & 2 list still identifies item 26 as a shatkarma, while current Iyengar-association syllabi file Kapalabhati under pranayamas and introduce it after earlier breathing work. That change of shelf does not make one account a correction of another. The execution also needs its sources kept separate: the medieval verse does not describe an active-out, passive-in rhythm. The modern instruction cited here does: the belly contracts to send air out and releases so air can return without a deliberate pull. That source uses the nose; this class sends each stroke through the lips. The seat is fixed here too: 26 & 2 uses the modern Vajrasana, sitting on the heels, not modern Virasana with the feet beside the hips and the seat between them.',
  refinements: [
    'Build the seat you are actually practising: sit evenly on both heels, rest the hands on the knees, and lengthen the spine upward. Do not widen the feet and lower between them; that would change this Vajrasana base into the modern Virasana arrangement.',
    'Lift the chest before the first stroke, then keep that lift quiet. Let the shoulders, jaw and face remain easy while the abdomen supplies the visible movement, just as the class cue asks.',
    'Treat contraction and release as different jobs. Draw the belly sharply back to make the out-breath, then stop working and let the abdomen rebound. If you pull air in on purpose, pause and recover the simpler release.',
    'Keep the strokes alike in size and sound. The class asks for a quicker second set; let speed come from a cleaner return of the abdomen, not from adding motion in the chest or head.',
    'Use the space between rounds. Take ordinary, unforced breaths and begin again only when the seat, chest and abdomen are ready to repeat the same rhythm.',
  ],
  stages: [
    'Sit in Vajrasana and breathe normally: hips on the heels, hands on the knees, spine tall, chest lifted, shoulders soft. Watch the abdomen move without trying to shape the breath.',
    'Practise a short round through the lips. Make twelve distinct abdominal exhales at an unhurried pace, release the belly after every stroke, then return to ordinary breathing.',
    'Build toward the class count of sixty while keeping the face and chest quiet. If the rhythm or the passive return disappears, end the round there and reset with normal breaths.',
    'Take the full class form: two sets of sixty, following the authored quicker pace in the second set while keeping every inhale passive and every exhale driven by the abdomen.',
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
