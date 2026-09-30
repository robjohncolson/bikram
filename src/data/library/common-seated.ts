import type { LineageNote } from '../types';
import { EVERY_SEAT } from './common-lotus';

/**
 * What the lineage asks of the seated poses — B.K.S. Iyengar, The
 * Illustrated Light on Yoga — each point in our own words with the printed
 * page it comes from. The family's own notes (the general hints every seat
 * shares live in `common-lotus.ts`, `EVERY_SEAT`); nothing the book does
 * not say.
 */

/** The two boats: balanced on the buttocks, the legs raised. */
export const BOAT_LINEAGE: LineageNote[] = [
  { text: 'Keep breathing in the boats: the pull is to hold the breath after an in-breath, but then the effort lands in the stomach muscles rather than the organs beneath them.', page: 59 },
  { text: 'Balance on the buttocks alone; no part of the spine should come down to the floor.', page: 59 },
  { text: 'At first the back may be too weak to take the strain. Being able to stay longer is the sign that it is growing stronger.', page: 59 },
  ...EVERY_SEAT,
];

/** The hero and its reclining form: the seat on the floor between the feet. */
export const HERO_LINEAGE: LineageNote[] = [
  { text: 'The buttocks rest on the floor, not the body on the feet.', page: 62 },
  { text: 'If the seat will not reach the floor yet, sit on the feet laid one over the other, and over time move the toes apart until the feet lie outside the thighs and the buttocks come down between them.', page: 62 },
  { text: 'The pose may be done straight after a meal.', page: 62 },
  ...EVERY_SEAT,
];

/** The bound angle: the book's own provisions for it. */
export const BOUND_ANGLE_LINEAGE: LineageNote[] = [
  { text: 'The outer edges of both feet stay on the floor, the backs of the heels against the perineum.', page: 65 },
  { text: 'It may be done after meals, so long as the head is not taken down to the floor.', page: 66 },
  { text: 'In pregnancy the book allows it right through, at any time of day, but not the forward bend straight after eating.', page: 40 },
  { text: 'Sitting in it for meditation with the back upright and the palms folded before the chest takes practice.', page: 66 },
  ...EVERY_SEAT,
];
