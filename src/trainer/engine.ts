import type { Card, CardId, Grade, TrainerStore } from './types';
import { allCards, cardById, kcNodes } from './graph';
import { applyEvidence, band, nodeP } from './bkt';
import { gradeCard, isDue, newCardState } from './srs';

/**
 * Session facade the UI talks to. Pure functions over (store, now) —
 * callers own persistence via store.ts.
 */

/** How many never-seen cards a single review session will introduce. */
export const NEW_PER_SESSION = 6;
/** Review queue size cap per session. */
export const QUEUE_CAP = 20;

export interface QueueEntry {
  card: Card;
  /** why this card is in the queue */
  reason: 'due' | 'new' | 'weak';
}

/**
 * Build a review queue: everything due now, then a measured ration of new
 * cards (in introduction order — the DAG's prerequisite-friendly walk),
 * then the weakest already-seen KCs as filler.
 */
export function buildQueue(store: TrainerStore, now: number): QueueEntry[] {
  const queue: QueueEntry[] = [];
  const taken = new Set<CardId>();

  const due = allCards
    .filter((c) => store.cards[c.id] && isDue(store.cards[c.id], now))
    .sort((a, b) => store.cards[a.id].due - store.cards[b.id].due);
  for (const card of due) {
    if (queue.length >= QUEUE_CAP) break;
    queue.push({ card, reason: 'due' });
    taken.add(card.id);
  }

  let added = 0;
  for (const card of allCards) {
    if (queue.length >= QUEUE_CAP || added >= NEW_PER_SESSION) break;
    if (store.cards[card.id] || taken.has(card.id)) continue;
    queue.push({ card, reason: 'new' });
    taken.add(card.id);
    added++;
  }

  if (queue.length < QUEUE_CAP) {
    const weak = allCards
      .filter((c) => store.cards[c.id] && !taken.has(c.id))
      .map((c) => ({ c, p: nodeP(store, c.kc, now) }))
      .filter((x) => x.p < 0.85)
      .sort((a, b) => a.p - b.p);
    for (const { c } of weak) {
      if (queue.length >= QUEUE_CAP) break;
      queue.push({ card: c, reason: 'weak' });
      taken.add(c.id);
    }
  }

  return queue;
}

/** Cards due right now (for badges on the landing screen). */
export function dueCount(store: TrainerStore, now: number): number {
  return allCards.filter((c) => store.cards[c.id] && isDue(store.cards[c.id], now)).length;
}

/** Never-practiced cards remaining. */
export function unseenCount(store: TrainerStore): number {
  return allCards.filter((c) => !store.cards[c.id]).length;
}

/**
 * Record one graded answer: SRS reschedule + BKT evidence, in place.
 * Callers persist with saveStore afterwards.
 */
export function recordAnswer(
  store: TrainerStore,
  cardId: CardId,
  grade: Grade,
  now: number,
): void {
  const card = cardById.get(cardId);
  if (!card) return;
  const prev = store.cards[cardId] ?? newCardState(now);
  store.cards[cardId] = gradeCard(prev, grade, now);
  applyEvidence(store, card.kc, card.kind, grade === 'good', now);
  store.answers += 1;
}

export { allCards, cardById, kcNodes, nodeP, band };
