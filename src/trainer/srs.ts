import type { CardState, Grade } from './types';

/**
 * SM-2-lite spaced repetition. Intervals are minutes; 'again' resets to a
 * short relearn step and costs ease, 'good' walks the ladder then grows
 * by the ease factor. Capped so nothing drifts past two months.
 */

const MIN = 60 * 1000;
export const AGAIN_MINUTES = 5;
const STEPS_MINUTES = [30, 60 * 24, 60 * 24 * 3]; // 30m → 1d → 3d, then ease growth
const MAX_MINUTES = 60 * 24 * 60;
const EASE_START = 2.5;
const EASE_MIN = 1.3;
const EASE_LAPSE_COST = 0.2;

export function newCardState(now: number): CardState {
  return { interval: 0, ease: EASE_START, due: now, reps: 0, lapses: 0 };
}

export function gradeCard(state: CardState, grade: Grade, now: number): CardState {
  if (grade === 'again') {
    return {
      interval: AGAIN_MINUTES,
      ease: Math.max(EASE_MIN, state.ease - EASE_LAPSE_COST),
      due: now + AGAIN_MINUTES * MIN,
      reps: state.reps + 1,
      lapses: state.lapses + 1,
    };
  }
  const step = STEPS_MINUTES.find((s) => s > state.interval);
  const interval = Math.min(MAX_MINUTES, step ?? Math.round(state.interval * state.ease));
  return {
    interval,
    ease: state.ease,
    due: now + interval * MIN,
    reps: state.reps + 1,
    lapses: state.lapses,
  };
}

export function isDue(state: CardState, now: number): boolean {
  return state.due <= now;
}
