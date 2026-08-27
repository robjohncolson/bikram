import type { Card, CardId, CardState, Grade, KcId, TrainerStore } from './types';
import { allCards, cardById, kcNodes } from './graph';
import { applyEvidence, band, nodeP } from './bkt';
import { AGAIN_MINUTES, gradeCard, isDue, newCardState, relearnAgain } from './srs';

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
  reason: 'due' | 'new' | 'weak' | 'drill' | 'relearn';
}

/**
 * Interleave: reorder so no two adjacent entries are about the same
 * posture, keeping the original priority order otherwise (greedy — at
 * each step take the first remaining entry that differs from the last
 * one placed; when only same-posture entries remain, take them as is).
 * Blocking a posture's three cards back to back lets each answer prime
 * the next; spreading them makes every retrieval a real one.
 */
export function interleave(entries: QueueEntry[]): QueueEntry[] {
  const rest = entries.slice();
  const out: QueueEntry[] = [];
  const pose = (e: QueueEntry) => e.card.poseId;
  while (rest.length > 0) {
    const last = out[out.length - 1];
    let pick = 0;
    if (last) {
      const i = rest.findIndex((e) => pose(e) !== pose(last));
      if (i >= 0) pick = i;
    }
    out.push(rest.splice(pick, 1)[0]);
  }
  // Repair: the greedy walk can strand clashes at the tail (only same-
  // posture cards left). Move each stranded card to the earliest slot
  // whose neighbours both differ from it, re-scanning until nothing
  // moves; a clash with no such slot anywhere is left alone.
  const fits = (item: QueueEntry, j: number) =>
    (j === 0 || pose(out[j - 1]) !== pose(item)) && (j >= out.length || pose(out[j]) !== pose(item));
  const stuck = new Set<QueueEntry>();
  for (let pass = 0; pass < out.length; pass++) {
    let moved = false;
    for (let i = 1; i < out.length; i++) {
      if (pose(out[i]) !== pose(out[i - 1])) continue;
      const item = out[i];
      if (stuck.has(item)) continue;
      out.splice(i, 1);
      let placed = false;
      // slots after the head first — the head is the highest-priority
      // card and only gives way when nothing else resolves the clash
      const order = [...Array.from({ length: out.length }, (_, k) => k + 1), 0];
      for (const j of order) {
        if (j !== i && fits(item, j)) {
          out.splice(j, 0, item);
          placed = true;
          break;
        }
      }
      if (!placed) {
        out.splice(i, 0, item);
        stuck.add(item);
      } else {
        moved = true;
        break; // indices shifted — start the scan over
      }
    }
    if (!moved) break;
  }
  return out;
}

/**
 * Where to re-insert a missed card so it returns `gap` cards later —
 * nudged forward past any slot whose neighbours are about the same
 * posture (its sibling card would display the answer). Returns the
 * index to splice at.
 */
export function relearnSlot(queue: QueueEntry[], card: Card, after: number, gap: number): number {
  const base = Math.min(queue.length, after + 1 + gap);
  const clashes = (j: number) =>
    (j > 0 && queue[j - 1].card.poseId === card.poseId) ||
    (j < queue.length && queue[j].card.poseId === card.poseId);
  for (let j = base; j <= queue.length; j++) {
    if (!clashes(j)) return j;
  }
  return queue.length;
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

  return interleave(queue);
}

/**
 * A focused drill on one knowledge node — the knowledge map's "drill
 * this" jump. Leaves drill their own cards plus immediate context (a
 * transition brings its two identities; an identity brings the
 * hand-offs leaning on it). Aggregates drill their weakest leaves.
 * Direct cards lead; context follows in introduction order.
 */
export const DRILL_CAP = 8;

export function buildDrillQueue(store: TrainerStore, kc: KcId, now: number): QueueEntry[] {
  const node = kcNodes.get(kc);
  if (!node) return [];

  let targetKcs: KcId[];
  if (node.kind === 'identity') {
    const leaningTransitions = [...kcNodes.values()]
      .filter((n) => n.kind === 'transition' && n.prereqs.includes(kc))
      .map((n) => n.id);
    targetKcs = [kc, ...leaningTransitions];
  } else if (node.kind === 'transition') {
    targetKcs = [kc, ...node.prereqs];
  } else {
    const leafIds =
      node.kind === 'root'
        ? node.children.flatMap((a) => kcNodes.get(a)?.children ?? [])
        : node.children;
    targetKcs = leafIds
      .map((id) => ({ id, p: nodeP(store, id, now) }))
      .sort((a, b) => a.p - b.p)
      .slice(0, 4)
      .map((x) => x.id);
  }

  const queue: QueueEntry[] = [];
  for (const target of targetKcs) {
    for (const card of allCards) {
      if (card.kc !== target) continue;
      if (queue.length >= DRILL_CAP) return interleave(queue);
      queue.push({ card, reason: 'drill' });
    }
  }
  return interleave(queue);
}

/**
 * Where a missed card re-enters the live queue: this many cards after the
 * miss (clamped to the end), so it comes back once the answer has left
 * working memory but before the session ends.
 */
export const RELEARN_GAP = 4;


/** Cards due right now (for badges on the landing screen). */
export function dueCount(store: TrainerStore, now: number): number {
  return allCards.filter((c) => store.cards[c.id] && isDue(store.cards[c.id], now)).length;
}

/** Never-practiced cards remaining. */
export function unseenCount(store: TrainerStore): number {
  return allCards.filter((c) => !store.cards[c.id]).length;
}

/**
 * Does this grade move the card's spaced-repetition schedule? A miss
 * always lapses. A hit steps the interval only when the card is new,
 * due, or in the relearn step — never when it was answered early. That
 * is what keeps a free-practice blitz from marching a card up the
 * ladder to week-long intervals in one afternoon: the schedule advances
 * on *spaced* retrieval, while every answer still counts as BKT evidence.
 */
export function schedulesOn(state: CardState | undefined, grade: Grade, now: number): boolean {
  if (grade === 'again') return true;
  if (!state) return true;
  if (isDue(state, now)) return true;
  // An early hit on a scheduled card leaves the schedule alone even when
  // hours have passed: the card is still due when it was due, and BKT has
  // already taken the evidence. Only relearn (good after a miss) advances.
  return state.interval === AGAIN_MINUTES;
}

/**
 * Record one graded answer: SRS reschedule (when it counts) + BKT
 * evidence, in place. Callers persist with saveStore afterwards.
 */
export function recordAnswer(
  store: TrainerStore,
  cardId: CardId,
  grade: Grade,
  now: number,
): void {
  const card = cardById.get(cardId);
  if (!card) return;
  const prev = store.cards[cardId];
  if (grade === 'again' && (!prev || prev.interval === AGAIN_MINUTES)) {
    // a miss on first exposure, or again while still relearning: the card
    // enters (or restarts) the five-minute step — no lapse, no ease cost;
    // those are for forgetting something once learned
    store.cards[cardId] = relearnAgain(prev ?? newCardState(now), now);
  } else if (schedulesOn(prev, grade, now)) {
    store.cards[cardId] = gradeCard(prev ?? newCardState(now), grade, now);
  }
  applyEvidence(store, card.kc, card.kind, grade === 'good', now);
  store.answers += 1;
}

export { allCards, cardById, kcNodes, nodeP, band };
