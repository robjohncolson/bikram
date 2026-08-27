/**
 * Learning-engine model: a knowledge DAG over the sequence, Bayesian
 * knowledge tracing per node, and spaced-repetition scheduling per card.
 *
 * Knowledge components (KCs) — what can be known:
 *   id:<poseId>   knowing posture N by name/number (identity)
 *   tr:<n>        knowing that posture n is followed by posture n+1 (1–25)
 *   arc:<key>     an arc of class (aggregate of its transitions + identities)
 *   root          the whole sequence (aggregate of arcs)
 *
 * Prerequisite edges: id:i and id:i+1 feed tr:i; tr/id nodes feed their
 * arc; arcs feed root. Aggregates are computed (noisy-AND), never stored.
 *
 * Cards — how KCs get practiced (each card targets exactly one KC):
 *   next:<poseId>  "what comes next?"  4-choice MC   → tr:<order>
 *   name:<poseId>  English↔Sanskrit    self-graded   → id:<poseId>
 *   pos:<order>    "which is #N?"      4-choice MC   → id:<poseId>
 */

export type ArcKey = 'opening' | 'standing' | 'floor' | 'closing';

export type KcId = string; // 'id:eagle' | 'tr:4' | 'arc:standing' | 'root'
export type CardId = string; // 'next:eagle' | 'name:eagle' | 'pos:4'

export type CardKind = 'next' | 'name' | 'pos';

export interface KcNode {
  id: KcId;
  kind: 'identity' | 'transition' | 'arc' | 'root';
  label: string;
  /** pose this node is about (identity: the pose; transition: the FROM pose) */
  poseId?: string;
  /** sequence order anchor for layout/sorting (identity/transition: 1–26) */
  order: number;
  arc?: ArcKey;
  /** prerequisite KC ids (edges point prerequisite → dependent) */
  prereqs: KcId[];
  /** children whose posteriors this aggregate combines (arc/root only) */
  children: KcId[];
}

export interface Card {
  id: CardId;
  kind: CardKind;
  /** the KC this card gives evidence about */
  kc: KcId;
  poseId: string;
  /** introduction order — cards unlock in this order */
  intro: number;
}

/** Bayesian knowledge tracing parameters (per card kind). */
export interface BktParams {
  /** P(already known) before any evidence */
  pInit: number;
  /** P(transition to known) after each practice opportunity */
  pLearn: number;
  /** P(correct | not known) — lucky guess */
  pGuess: number;
  /** P(wrong | known) — slip */
  pSlip: number;
}

/** Stored per-KC learning state (leaves only). */
export interface KcState {
  /** current P(known), after all evidence */
  p: number;
  correct: number;
  wrong: number;
  /**
   * Correct answers that arrived after a real gap (see SPACED_GAP_MS) —
   * the count that stretches the forgetting half-life. Massed repeats
   * within one sitting count toward `correct` but not here.
   */
  spaced: number;
  /** ms timestamp of last evidence */
  last: number;
}

/** Stored per-card spaced-repetition state. */
export interface CardState {
  /** current interval in minutes */
  interval: number;
  /** SM-2 ease factor */
  ease: number;
  /** ms timestamp when the card is next due */
  due: number;
  reps: number;
  lapses: number;
}

export interface TrainerStore {
  version: 2;
  kcs: Record<KcId, KcState>;
  cards: Record<CardId, CardState>;
  bestStreak: number;
  /** total answers ever recorded */
  answers: number;
}

export type Grade = 'again' | 'good';
