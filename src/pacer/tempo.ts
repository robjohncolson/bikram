/**
 * The tempo a spoken line asks for. The figure moves as the words say:
 * "lower in slow motion" spans the line and beyond, "in one motion" and
 * "kick" snap right after it, "on an inhale, lift" waits for the next
 * inhale and rides its first half. Everything else moves at sheet speed
 * as the line ends. Pure; `tempo.test.ts`.
 */

export type TempoKind = 'slow' | 'quick' | 'inhale' | 'normal';

export interface Tempo {
  kind: TempoKind;
  /** when the move starts, relative to the line */
  starts: 'line-start' | 'line-end' | 'next-inhale';
  /** how long the travel takes in seconds; undefined = the sheet's own fps */
  over?: (ctx: { clipSeconds: number; barSeconds: number }) => number;
}

const SLOW = /\bslow(?:ly)?\b|\bslow motion\b|\bgradual(?:ly)?\b/i;
const QUICK = /\bin one motion\b|\bone motion\b|\bsnap\b|\bdive\b|\bkick(?:ing)?\b/i;
const INHALE = /\binhal(?:e|ing)\b/i;

export function tempoOf(text: string): Tempo {
  if (SLOW.test(text)) {
    // the line is spoken over the movement: start with it, finish a little after
    return { kind: 'slow', starts: 'line-start', over: ({ clipSeconds }) => Math.max(2.5, clipSeconds + 1.5) };
  }
  if (INHALE.test(text)) {
    // "on an inhale, lift": the lift rides the first half of the next inhale
    return { kind: 'inhale', starts: 'next-inhale', over: ({ barSeconds }) => Math.max(1, barSeconds * 0.5) };
  }
  if (QUICK.test(text)) {
    return { kind: 'quick', starts: 'line-end', over: () => 0.35 };
  }
  return { kind: 'normal', starts: 'line-end' };
}
