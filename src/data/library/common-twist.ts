import type { LineageNote } from '../types';

/**
 * What the lineage asks of the twists and the reclining leg work — B.K.S.
 * Iyengar, The Illustrated Light on Yoga — each point in our own words with
 * the printed page it comes from. The family's own notes (the shared ones
 * live in `common.ts`); nothing the book does not say.
 */

/** Asked of every posture in the family (the book's general hints). */
export const EVERY_TWIST: LineageNote[] = [
  { text: 'Come to the practice with the bladder and bowels emptied, an hour after a very light meal at the soonest and four hours after a heavy one.', page: 37 },
  { text: 'Breathe through the nose, and never hold the breath while coming into the pose or while staying in it.', page: 39 },
  { text: 'Nothing should strain in the face, the ears or the eyes, or in the breath, while you work.', page: 38 },
  { text: 'Faulty practice shows itself as discomfort within days; if you cannot find the fault yourself, go to someone who has practised well for guidance.', page: 40 },
];

/** The seated twists: the book's own words on learning them. */
export const SEATED_TWIST: LineageNote[] = [
  { text: 'The clasp behind the back comes by degrees: first a finger or two, then the palms, then the wrists.', page: 110 },
  ...EVERY_TWIST,
];
