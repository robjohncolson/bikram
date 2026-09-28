/**
 * Which sprite stage a spoken setup step moves the figure to. Stage labels
 * are short and concrete ("Kick out", "Elbows down", "Hold the heels");
 * a step matches a stage when it says most of the label's content words,
 * allowing the wordings the steps actually use (overhead for up, grip for
 * hold, forehead for head). Pure; `stagematch.test.ts` pins the mapping
 * for every posture so a re-worded step or relabelled stage shows up.
 */

const STOP = new Set(['the', 'a', 'an', 'to', 'on', 'of', 'in', 'into', 'and', 'your', 'both', 'between']);

/** Wordings that count as saying a label word — only the ones the steps really use. */
const SYNONYMS: Record<string, string[]> = {
  up: ['overhead', 'ceiling'],
  hold: ['grip', 'grab', 'interlace'],
  head: ['forehead', 'crown'],
  fold: ['hinge'],
  lie: ['lying', 'abdomen'],
  wide: ['apart'],
  stance: ['feet'],
  horizontal: ['level', 'parallel', 'seesaw'],
  pump: ['rhythm'],
  face: ['square'],
  prayer: ['palms'],
  hips: ['hip'],
  side: ['sideways', 'turn'],
  out: ['straight', 'sides', 'shoulder height'],
  foot: ['ankle'],
  feet: ['foot'],
  prone: ['abdomen', 'belly', 'stomach'],
  hands: ['palms'],
  under: ['beneath'],
  lift: ['raise', 'peel'],
  set: ['step', 'plant'],
};

/** crude stem: enough to make kicks/kicking/kicked meet kick */
function stem(w: string): string {
  return w
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/(ing|ed|es|s)$/, '')
    .replace(/(ie)$/, 'y');
}

/** Content words of a label, stemmed. */
export function labelWords(label: string): string[] {
  return label
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w && !STOP.has(w))
    .map((w) => stem(w));
}

/** Does the step say this (stemmed) label word, or one of its stand-ins? */
function says(stepWords: Set<string>, stepText: string, word: string): boolean {
  if (stepWords.has(word)) return true;
  const alts = SYNONYMS[word] ?? SYNONYMS[Object.keys(SYNONYMS).find((k) => stem(k) === word) ?? ''] ?? [];
  return alts.some((a) => (a.includes(' ') ? stepText.includes(a) : stepWords.has(stem(a))));
}

/** 0–1: the share of the label's content words the step says. */
export function stageScore(step: string, label: string): number {
  const words = labelWords(label);
  if (words.length === 0) return 0;
  const text = step.toLowerCase();
  const stepWords = new Set(text.split(/[^a-z]+/).filter(Boolean).map(stem));
  const hits = words.filter((w) => says(stepWords, text, w)).length;
  return hits / words.length;
}

/** A label that is a return, not a place a step takes you. */
const NEUTRAL = /^(release|centre|center|rise|lower|change|stand)$/i;

/** More than half the label's words: both of two, two of three, all of one. */
export const MATCH_THRESHOLD = 0.66;

/**
 * The stage (index into `labels`) a step moves to, searching only the
 * stages `from` (exclusive) through `to` (inclusive) in order, or
 * undefined when no stage there is said well enough. Ties go to the
 * EARLIER stage — a step that says "elbows down, then forehead to the
 * knee" goes to the elbows now; the knee follows when the lines run out.
 */
export function stageForStep(
  step: string,
  labels: string[],
  from: number,
  to: number,
  threshold = MATCH_THRESHOLD,
): number | undefined {
  let best: number | undefined;
  let bestScore = 0;
  for (let i = from + 1; i <= to && i < labels.length; i++) {
    if (NEUTRAL.test(labels[i].trim())) continue;
    const s = stageScore(step, labels[i]);
    if (s >= threshold && s > bestScore) {
      best = i;
      bestScore = s;
    }
  }
  return best;
}

/**
 * Map an ordered list of steps onto the path from `from` to `to`:
 * monotone (a later step never moves to an earlier stage), one stage per
 * step at most. Unmatched steps are `undefined` — the figure holds while
 * they are said.
 */
export function mapSteps(steps: string[], labels: string[], from: number, to: number): (number | undefined)[] {
  let cursor = from;
  return steps.map((step) => {
    const i = stageForStep(step, labels, cursor, to);
    if (i !== undefined) cursor = i;
    return i;
  });
}
