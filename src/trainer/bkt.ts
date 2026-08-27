import type { BktParams, EvidenceKind, KcId, KcState, TrainerStore } from './types';
import { kcNodes } from './graph';

/**
 * Bayesian knowledge tracing. Each answer is evidence about one leaf KC:
 * Bayes-update P(known) for the observation, then apply the learning
 * transition (practice itself teaches).
 */

export const BKT_BY_KIND: Record<EvidenceKind, BktParams> = {
  // 4-choice multiple choice → guessing gets you 1-in-4
  next: { pInit: 0.1, pLearn: 0.2, pGuess: 0.25, pSlip: 0.1 },
  pos: { pInit: 0.1, pLearn: 0.2, pGuess: 0.25, pSlip: 0.1 },
  // self-graded flashcard → little room to "guess", slips are honest lapses
  name: { pInit: 0.1, pLearn: 0.25, pGuess: 0.08, pSlip: 0.08 },
  // in-class recall at a hand-off, self-reported afterwards: nothing to
  // guess from, but heat, fatigue and a wandering mind make slips common
  recall: { pInit: 0.1, pLearn: 0.2, pGuess: 0.05, pSlip: 0.15 },
};

const clamp = (p: number) => Math.min(0.999, Math.max(0.001, p));

/**
 * Forgetting: with no practice, a leaf's P(known) decays exponentially
 * back toward its prior. Every correct answer stretches the half-life
 * (well-practiced knowledge fades slower), capped at two months. Note
 * the symmetry: a P dragged *below* prior by wrong answers also drifts
 * back up — regression toward "we no longer know either way".
 */
const DECAY_BASE_HALF_LIFE_DAYS = 4;
const DECAY_MAX_HALF_LIFE_DAYS = 60;
const DAY_MS = 86_400_000;
/**
 * Evidence counts as *spaced* — and stretches the half-life — only when it
 * lands this long after the leaf's previous evidence. Ten right answers
 * in one sitting prove you knew it that afternoon, not that it will
 * survive a fortnight; only returning to it later shows that.
 */
export const SPACED_GAP_MS = 6 * 60 * 60 * 1000;

/** Half-life in days as a function of the *spaced* correct count. */
export function decayHalfLifeDays(spaced: number): number {
  return Math.min(DECAY_MAX_HALF_LIFE_DAYS, DECAY_BASE_HALF_LIFE_DAYS * (1 + spaced));
}

export function decayedP(state: { p: number; spaced: number; last: number }, prior: number, now: number): number {
  const days = Math.max(0, (now - state.last) / DAY_MS);
  if (days === 0) return state.p;
  const keep = Math.pow(0.5, days / decayHalfLifeDays(state.spaced));
  return prior + (state.p - prior) * keep;
}

/** One BKT step: posterior after an observation, then the learning bump. */
export function bktUpdate(p: number, correct: boolean, params: BktParams): number {
  const { pLearn, pGuess, pSlip } = params;
  const prior = clamp(p);
  const posterior = correct
    ? (prior * (1 - pSlip)) / (prior * (1 - pSlip) + (1 - prior) * pGuess)
    : (prior * pSlip) / (prior * pSlip + (1 - prior) * (1 - pGuess));
  return clamp(posterior + (1 - posterior) * pLearn);
}

function priorFor(kc: KcId): number {
  return kc.startsWith('tr:') ? BKT_BY_KIND.next.pInit : BKT_BY_KIND.name.pInit;
}

/**
 * Current P(known) for a leaf KC: stored posterior decayed toward the
 * prior by time since the last evidence; untouched leaves sit at the
 * prior of the card kind that feeds them. Pass `now` (ms) — omitting it
 * skips decay (used by tests that pin exact posteriors).
 */
export function leafP(store: TrainerStore, kc: KcId, now?: number): number {
  const state = store.kcs[kc];
  const prior = priorFor(kc);
  if (!state) return prior;
  return now === undefined ? state.p : decayedP(state, prior, now);
}

/**
 * P(known) for any node. Aggregates (arc/root) are noisy-AND over their
 * children: the probability that EVERY piece is known. Honest and strict —
 * a low root number early on is correct, not a bug.
 */
export function nodeP(store: TrainerStore, kc: KcId, now?: number): number {
  const node = kcNodes.get(kc);
  if (!node) return 0;
  if (node.kind === 'identity' || node.kind === 'transition') return leafP(store, kc, now);
  let p = 1;
  for (const child of node.children) p *= nodeP(store, child, now);
  return p;
}

/**
 * Average P(known) over every leaf (26 identities + 25 transitions) — the
 * honest headline. The root's noisy-AND is the probability that *all*
 * fifty-one pieces are known at once, which stays near zero long after
 * every piece individually reads solid; the mean says how much of the
 * sequence you know, which is the question people actually ask.
 */
export function meanLeafP(store: TrainerStore, now?: number): number {
  let sum = 0;
  let n = 0;
  for (const node of kcNodes.values()) {
    if (node.kind !== 'identity' && node.kind !== 'transition') continue;
    sum += leafP(store, node.id, now);
    n++;
  }
  return n === 0 ? 0 : sum / n;
}

/** Record one answer's evidence on a leaf KC. */
export function applyEvidence(
  store: TrainerStore,
  kc: KcId,
  kind: EvidenceKind,
  correct: boolean,
  now: number,
): KcState {
  const params = BKT_BY_KIND[kind];
  const prev = store.kcs[kc];
  // Start from what we believe *now* — the stored posterior decayed by the
  // time since its evidence — otherwise one answer after a long gap would
  // silently restore a month-old certainty by refreshing `last`.
  const current = prev ? decayedP(prev, priorFor(kc), now) : params.pInit;
  const p = bktUpdate(current, correct, params);
  const isSpaced = correct && (!prev || now - prev.last >= SPACED_GAP_MS);
  const next: KcState = {
    p,
    correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
    wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
    spaced: (prev?.spaced ?? 0) + (isSpaced ? 1 : 0),
    last: now,
  };
  store.kcs[kc] = next;
  return next;
}

/** Mastery bands used across the UI. */
export function band(p: number): 'unseen' | 'shaky' | 'developing' | 'solid' {
  if (p < 0.15) return 'unseen';
  if (p < 0.5) return 'shaky';
  if (p < 0.85) return 'developing';
  return 'solid';
}
