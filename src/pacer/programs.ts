import type { Pose } from '../data';
import { poses } from '../data';
import { DEFAULT_BAR_BEATS, poseGridSeconds } from './grid';

/**
 * Class programs: which postures the class pacer walks, and how many of
 * each posture's sets. The full class is the whole sequence as authored;
 * shorter programs are curated subsets that reuse the same pose data,
 * segments and cues — nothing is re-authored, only trimmed. Pure.
 */

export interface ProgramItem {
  /** sequence order (1-based) of the posture */
  order: number;
  /** 1 = first set only; omitted = every authored set */
  sets?: 1 | 2;
}

export interface ClassProgram {
  id: 'full' | 'short';
  name: string;
  /** one calm sentence for the picker */
  blurb: string;
  /** postures in class order (ascending) */
  items: ProgramItem[];
}

export const FULL_CLASS: ClassProgram = {
  id: 'full',
  name: 'Full class',
  blurb: 'The whole sequence, both sets where there are two, in class order.',
  items: poses.map((p) => ({ order: p.order })),
};

export const SHORT_CLASS: ClassProgram = {
  id: 'short',
  name: 'Short class',
  blurb:
    'The opening breath, the first three standing postures, a floor backbend pair, the twist and the closing breath — first set only.',
  items: [
    { order: 1, sets: 1 }, // Pranayama
    { order: 2, sets: 1 }, // Half Moon with Hands to Feet
    { order: 3, sets: 1 }, // Awkward
    { order: 4, sets: 1 }, // Eagle
    { order: 16, sets: 1 }, // Cobra
    { order: 22, sets: 1 }, // Camel
    { order: 25, sets: 1 }, // Spine Twisting (one set as authored)
    { order: 26, sets: 1 }, // Kapalbhati
  ],
};

export const PROGRAMS: ClassProgram[] = [FULL_CLASS, SHORT_CLASS];

/** Look a program up by id (e.g. from `/pace?program=short`); full by default. */
export function programById(id: string | null | undefined): ClassProgram {
  return PROGRAMS.find((p) => p.id === id) ?? FULL_CLASS;
}

const SECOND_SET_RE = /^second set\b/i;

/**
 * The posture trimmed to its first set. Segments are cut from the first
 * one labelled "Second set …" onward — the savasana and sit-up after a
 * floor posture's first set stay, since they are the way out of it.
 * A posture with no second-set segments is returned whole. The result
 * is a copy whose segments still partition its approxTotalSeconds, so
 * the cue compiler and the countdown need no special case — and the
 * voice never announces a set that is not coming.
 */
export function firstSetOnly(pose: Pose): Pose {
  const segs = pose.segments;
  if (!segs || segs.length === 0) {
    if (pose.sets <= 1) return pose;
    // no authored structure: take an even share of the hold
    return {
      ...pose,
      sets: 1,
      approxTotalSeconds: Math.round(pose.approxTotalSeconds / pose.sets),
      timing: `First set only · full class: ${pose.timing}`,
    };
  }
  const cut = segs.findIndex((s) => SECOND_SET_RE.test(s.label));
  if (cut <= 0) return pose;
  const kept = segs.slice(0, cut);
  return {
    ...pose,
    sets: 1,
    segments: kept,
    approxTotalSeconds: kept.reduce((s, seg) => s + seg.seconds, 0),
    timing: `First set only · full class: ${pose.timing}`,
  };
}

/** The program's postures in class order, trimmed as the program asks. */
export function programPoses(program: ClassProgram): Pose[] {
  const byOrder = new Map(poses.map((p) => [p.order, p]));
  const out: Pose[] = [];
  for (const item of program.items) {
    const pose = byOrder.get(item.order);
    if (!pose) continue;
    out.push(item.sets === 1 ? firstSetOnly(pose) : pose);
  }
  return out;
}

/** Canonical class seconds of the program's postures (final savasana excluded). */
export function programSeconds(program: ClassProgram, beatsPerBar = DEFAULT_BAR_BEATS): number {
  return programPoses(program).reduce((s, p) => s + poseGridSeconds(p, beatsPerBar), 0);
}

/** Whole minutes the program's postures take at a tempo (60 BPM = class time). */
export function programMinutes(program: ClassProgram, bpm = 60, beatsPerBar = DEFAULT_BAR_BEATS): number {
  return Math.round((programSeconds(program, beatsPerBar) * (60 / bpm)) / 60);
}
