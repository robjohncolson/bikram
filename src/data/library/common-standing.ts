import type { LineageNote } from '../types';

/**
 * What the lineage asks of the standing poses — B.K.S. Iyengar, The
 * Illustrated Light on Yoga — each point in our own words with the printed
 * page it comes from. The family's own notes (the shared ones live in
 * `common.ts`); nothing the book does not say.
 */

/** Asked of every standing pose (the book's general hints and its note on the family). */
export const EVERY_STANDING: LineageNote[] = [
  { text: 'Breathe only through the nose, and keep the breath moving — never held — on the way in and while you stay.', page: 39 },
  { text: 'Let no strain show in the face, the eyes or the ears, and none in the breath.', page: 38 },
  { text: 'In pregnancy the book allows the standing poses only as mild movements, with nothing pressing on the abdomen.', page: 40 },
  { text: 'The book counts the standing poses as essential for a beginner; later, with more suppleness, they may be kept to about once a week.', page: 49 },
  { text: 'If discomfort follows the practice for days, something is being done wrongly; when you cannot find it yourself, ask someone experienced to look.', page: 40 },
];

/** The two standing toe-and-foot holds (Padangusthasana, Padahastasana), which share one page of effects. */
export const TOE_HOLD: LineageNote[] = [
  { text: 'With a slipped or displaced disc, stay with the back concave and do not take the head down between the knees; the book reports the concave stage helping such students.', page: 52 },
  { text: 'The concave back may not come at once: the book asks for a teacher’s guidance first, and for easier poses to be mastered beforehand.', page: 52 },
  { text: 'Keep both legs straight throughout, the grip at the knees never slackening.', page: 50 },
];
