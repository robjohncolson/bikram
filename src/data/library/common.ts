import type { LibraryAsana, LineageNote } from '../types';

/**
 * What the lineage asks of the inversions — B.K.S. Iyengar, The Illustrated
 * Light on Yoga — each point in our own words with the printed page it
 * comes from. Nothing here is a modern addition: a caution the book does
 * not give is not given. Shared points are written once so the pages say
 * them the same way.
 */

/** Asked of every inversion (the book's general hints on asana practice). */
const EVERY_INVERSION: LineageNote[] = [
  { text: 'With dizziness or high blood pressure, do not begin the practice with the headstand or the shoulderstand; the book puts forward bends before and after them instead.', page: 39 },
  { text: 'With pus in the ears or a displaced retina, the book rules out the upside-down poses altogether.', page: 39 },
  { text: 'Never stand on the head or go into the shoulderstand during menstruation.', page: 40 },
  { text: 'In pregnancy the book opens all asanas only for the first three months; the inversions are not among the few it keeps after that.', page: 40 },
  { text: 'No strain should show in the face, ears or eyes, or in the breath, while you practise.', page: 38 },
  { text: 'Faulty practice shows itself as discomfort within days; if you cannot find the fault yourself, go to someone who has practised well for guidance.', page: 40 },
];

/** The headstand family: the crown on the blanket, the forearms round it. */
export const HEADSTAND_LINEAGE: LineageNote[] = [
  { text: 'Perfect the shoulderstand first — and the standing poses and the shoulderstand and plough cycle — before trying the headstand; it then comes with far less effort.', page: 89 },
  { text: 'A beginner learns it with a friend’s help or against a wall a few inches behind the head, best in a corner where two walls keep the pose square.', page: 84 },
  { text: 'Work on a blanket folded four times; the elbows no wider apart than the shoulders, the fingers locked right to their tips, since loose fingers take the body’s weight and the arms ache.', page: 83 },
  { text: 'Only the crown of the head rests on the blanket — neither the forehead nor the back of the head.', page: 83 },
  { text: 'The body’s weight is taken by the head; the forearms and hands are there only to catch a loss of balance. Keep the elbows in line with the shoulders and the shoulders lifted as high off the floor as you can.', page: 87 },
  { text: 'A faulty headstand brings pain to the head, neck and back, so learn the correct position rather than simply finding the balance.', page: 87 },
  { text: 'If the eyes turn bloodshot going up or staying up, the pose is wrong.', page: 88 },
  { text: 'Go up and come down with both legs moving together, slowly and on an exhalation, without jerks.', page: 88 },
  { text: 'If you topple, loosen the laced fingers, go limp and bend the knees, and you will roll over rather than fall hard.', page: 86 },
  { text: 'It is not advisable to start with the headstand or the shoulderstand with high or low blood pressure.', page: 90 },
  { text: 'Once learned, do the headstand while fresh — not when tired or when the breath is fast — and follow it with the shoulderstand and its cycle.', page: 89 },
  ...EVERY_INVERSION,
];

/** The shoulderstand family: the back of the head, the neck, the shoulders and upper arms on the floor. */
export const SHOULDERSTAND_LINEAGE: LineageNote[] = [
  { text: 'Only the back of the head and the neck, the shoulders and the backs of the arms as far as the elbows rest on the floor; the hands support the back. The book names the pose for that support: the neck and shoulders bear the body, the hands hold it up.', page: 93 },
  { text: 'Bring the chest forward to meet the chin — not the chin down to the chest — so the spine is fully stretched.', page: 92 },
  { text: 'Keep the elbows no wider than the shoulders, and the neck straight with the chin centred on the breastbone; a neck that drifts sideways and is not corrected will hurt and can be injured.', page: 93 },
  { text: 'If you cannot yet hold the pose without help, use a stool as a support.', page: 91 },
  { text: 'With high blood pressure, do not attempt the supported shoulderstand until you can stay in the plough for at least three minutes, and do the plough first.', page: 94 },
  { text: 'Do not practise the shoulderstand during menstruation.', page: 94 },
  ...EVERY_INVERSION.filter((n) => n.page !== 40 || !n.text.startsWith('Never')),
];

/** For the ploughs: the feet over the head. */
export const PLOUGH_LINEAGE: LineageNote[] = [
  { text: 'If the toes will not stay on the floor behind the head, rest them on a chair or stool; do the same if the breath grows heavy or fast, and no pressure is then felt in the head.', page: 97 },
  { text: 'A longer, better stretched shoulderstand before the plough keeps the toes on the floor for longer.', page: 96 },
];

/**
 * The sutras, faithfully: what each says, in our words, applied no further.
 * Patanjali names no posture and gives no technique; II.46 and II.47 are
 * his whole account of asana, and every entry carries them.
 */
export const SUTRAS: LibraryAsana['sutras'] = [
  { id: 'II.46', note: 'Patanjali asks one thing of a posture, this one included: that it be steady and at ease.' },
  { id: 'II.47', note: 'The sutra says posture is perfected as effort relaxes and attention rests on the boundless.' },
];

/** II.48 in its own meaning, for the two long-held foundations. */
export const SUTRA_48: LibraryAsana['sutras'][number] = {
  id: 'II.48',
  note: 'When posture is so established, the sutra says, the pairs of opposites no longer disturb.',
};
