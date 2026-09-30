import type { LineageNote } from '../types';

/**
 * What the lineage asks of the backbends and the arm-supported poses —
 * B.K.S. Iyengar, The Illustrated Light on Yoga — each point in our own
 * words with the printed page it comes from. The family's own notes (the
 * shared ones live in `common.ts`); nothing the book does not say.
 */

/** Asked of every pose in the family (the book's general hints). */
export const EVERY_BACKBEND: LineageNote[] = [
  { text: 'Come to the practice with the bladder and bowels emptied; leave about an hour after a very light meal and at least four hours after a heavy one.', page: 37 },
  { text: 'Work on a folded blanket on a level floor, not on the bare floor.', page: 38 },
  { text: 'No strain should show in the face, ears or eyes, or in the breath, while you practise.', page: 38 },
  { text: 'Breathe through the nose, and never hold the breath while coming into the pose or while staying in it.', page: 39 },
  { text: 'The book asks that the asanas be set aside during menstruation.', page: 40 },
  { text: 'In pregnancy the book opens all asanas only for the first three months; the backbends are not among the few it keeps after that.', page: 40 },
  { text: 'Faulty practice shows itself as discomfort within days; if you cannot find the fault yourself, go to someone who has practised well for guidance.', page: 40 },
];
