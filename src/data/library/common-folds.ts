import type { LineageNote } from '../types';

/**
 * What the lineage asks of the seated forward folds — B.K.S. Iyengar, The
 * Illustrated Light on Yoga — each point in our own words with the printed
 * page it comes from. The family's own notes (the shared ones live in
 * `common.ts` and `common-lotus.ts`); nothing the book does not say.
 */

/** The book's general hints, as they bear on any seated fold. */
export const EVERY_FOLD: LineageNote[] = [
  { text: 'Breathe through the nose only, and do not hold the breath while moving into the pose or while staying in it, unless the technique itself asks for it.', page: 39 },
  { text: 'Practise on a folded blanket laid on a level floor, never on the bare floor.', page: 38 },
  { text: 'Nothing should strain in the face, the ears or the eyes, or in the breath, while you work.', page: 38 },
  { text: 'If the practice leaves discomfort that lasts for days, something is being done wrongly; if you cannot see what, ask someone who has practised well.', page: 40 },
];

/** Pregnancy, as the book gives it for the forward bends. */
export const FOLD_PREGNANCY: LineageNote = {
  text: 'In the first three months of pregnancy the book allows the forward bends, with gentle movements only and no pressure felt on the abdomen.',
  page: 40,
};

/** Menstruation: the book asks for rest from asanas, and names a few seated folds for a flow heavier than usual. */
export const FOLD_MENSTRUATION: LineageNote = {
  text: 'The book asks that asanas be left aside during menstruation; only when the flow is heavier than normal does it name a few poses to practise, this one among them.',
  page: 40,
};

/** The four preparations (p. 77): what the book says they are for. */
export const PREPARES_PASCHIMOTTANASANA: LineageNote = {
  text: 'The book counts this among four poses that ready the back and legs for the full back stretch; once that comes easily, they need only be practised once or twice a week.',
  page: 77,
};
