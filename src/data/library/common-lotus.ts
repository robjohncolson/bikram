import type { LineageNote } from '../types';

/**
 * What the lineage asks of the crossed-leg seats — B.K.S. Iyengar, The
 * Illustrated Light on Yoga — each point in our own words with the printed
 * page it comes from. The family's own notes (the shared ones live in
 * `common.ts`); nothing the book does not say.
 */

/** Asked of every seat in the family (the book's general hints). */
export const EVERY_SEAT: LineageNote[] = [
  { text: 'Breathe through the nose, and never hold the breath while coming into the pose or while staying in it.', page: 39 },
  { text: 'Work on a folded blanket on a level floor, not on the bare floor.', page: 38 },
  { text: 'Faulty practice shows itself as discomfort within days; if you cannot find the fault yourself, go to someone who has practised well for guidance.', page: 40 },
];

/** The lotus: both feet on the thighs. */
export const LOTUS_LINEAGE: LineageNote[] = [
  { text: 'Anyone not used to sitting on the floor will feel sharp pain round the knees at first; with steady, patient practice it fades, and the pose can then be held at ease for a long time.', page: 67 },
  { text: 'Keep the spine upright from its base to the neck.', page: 67 },
  { text: 'Cross the legs the other way as well — the left foot first on the right thigh — so both legs develop evenly.', page: 67 },
  ...EVERY_SEAT,
];
