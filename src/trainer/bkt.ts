import type { BktParams, CardKind, KcId, KcState, TrainerStore } from './types';
import { kcNodes } from './graph';

/**
 * Bayesian knowledge tracing. Each answer is evidence about one leaf KC:
 * Bayes-update P(known) for the observation, then apply the learning
 * transition (practice itself teaches).
 */

export const BKT_BY_KIND: Record<CardKind, BktParams> = {
  // 4-choice multiple choice → guessing gets you 1-in-4
  next: { pInit: 0.1, pLearn: 0.2, pGuess: 0.25, pSlip: 0.1 },
  pos: { pInit: 0.1, pLearn: 0.2, pGuess: 0.25, pSlip: 0.1 },
  // self-graded flashcard → little room to "guess", slips are honest lapses
  name: { pInit: 0.1, pLearn: 0.25, pGuess: 0.08, pSlip: 0.08 },
};

const clamp = (p: number) => Math.min(0.999, Math.max(0.001, p));

/** One BKT step: posterior after an observation, then the learning bump. */
export function bktUpdate(p: number, correct: boolean, params: BktParams): number {
  const { pLearn, pGuess, pSlip } = params;
  const prior = clamp(p);
  const posterior = correct
    ? (prior * (1 - pSlip)) / (prior * (1 - pSlip) + (1 - prior) * pGuess)
    : (prior * pSlip) / (prior * pSlip + (1 - prior) * (1 - pGuess));
  return clamp(posterior + (1 - posterior) * pLearn);
}

/** Current P(known) for a leaf KC (stored state or the kind's prior). */
export function leafP(store: TrainerStore, kc: KcId): number {
  const state = store.kcs[kc];
  if (state) return state.p;
  // untouched leaves sit at the prior of the card kind that feeds them
  return kc.startsWith('tr:') ? BKT_BY_KIND.next.pInit : BKT_BY_KIND.name.pInit;
}

/**
 * P(known) for any node. Aggregates (arc/root) are noisy-AND over their
 * children: the probability that EVERY piece is known. Honest and strict —
 * a low root number early on is correct, not a bug.
 */
export function nodeP(store: TrainerStore, kc: KcId): number {
  const node = kcNodes.get(kc);
  if (!node) return 0;
  if (node.kind === 'identity' || node.kind === 'transition') return leafP(store, kc);
  let p = 1;
  for (const child of node.children) p *= nodeP(store, child);
  return p;
}

/** Record one answer's evidence on a leaf KC. */
export function applyEvidence(
  store: TrainerStore,
  kc: KcId,
  kind: CardKind,
  correct: boolean,
  now: number,
): KcState {
  const params = BKT_BY_KIND[kind];
  const prev = store.kcs[kc];
  const p = bktUpdate(prev ? prev.p : params.pInit, correct, params);
  const next: KcState = {
    p,
    correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
    wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
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
