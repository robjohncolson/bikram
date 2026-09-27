/**
 * The breath grid. Class time is counted in metronome beats; a BAR is
 * one breath phase (inhale or exhale) and a BREATH is two bars — or one
 * beat in pulse mode (Kapalbhati). Every segment of every posture is
 * quantised to whole breaths, so a posture is a fixed number of breaths,
 * every segment begins on an inhale, and a cue can be addressed precisely:
 * "breath 4, exhale". Pure helpers shared by the cue sequencer, the
 * programs' length math and the class-mode readout.
 */
import type { Pose } from '../data';

/** The default six-count: six beats in, six out — the Pranayama pace. */
export const DEFAULT_BAR_BEATS = 6;

/**
 * Beats in one bar for a posture: its segments' metronome override
 * (Pranayama holds the six-count, Kapalbhati pulses at one) or the
 * user's count. A posture's segments must all agree — tests enforce it.
 */
export function poseBarBeats(pose: Pose, userBeatsPerBar = DEFAULT_BAR_BEATS): number {
  const override = pose.segments?.find((s) => s.pacer)?.pacer?.beatsPerBar;
  return Math.max(1, Math.round(override ?? userBeatsPerBar));
}

/** Beats in one full breath: two bars, or one beat in pulse mode. */
export function breathBeats(barBeats: number): number {
  return barBeats <= 1 ? 1 : 2 * barBeats;
}

/** Whole breaths covering `beats` of class time — never fewer than one. */
export function quantizeBeats(beats: number, breath: number): number {
  return Math.max(1, Math.round(beats / breath)) * breath;
}

/**
 * A posture's class time on the breath grid, in canonical seconds (one
 * beat per second at the 60 BPM reference): the sum of its quantised
 * segments, or its whole hold quantised when it has no segments.
 */
export function poseGridSeconds(pose: Pose, userBeatsPerBar = DEFAULT_BAR_BEATS): number {
  const breath = breathBeats(poseBarBeats(pose, userBeatsPerBar));
  if (pose.segments && pose.segments.length > 0) {
    return pose.segments.reduce((s, seg) => s + quantizeBeats(seg.seconds, breath), 0);
  }
  return quantizeBeats(pose.approxTotalSeconds, breath);
}

/** Strip the set prefix: "Second set — right leg" → "right leg"; "First set" → "". */
export function segmentKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(first|second|third) set\s*[—–-]\s*/, '')
    .replace(/^(first|second|third) set$/, '');
}

/**
 * What a segment is ABOUT, side removed: "right leg" → "leg", "both
 * knees" → "knees", "hands to feet" → itself, "First set" → "". Segments
 * of one posture that share a phrase are the same work on different
 * sides; different phrases are different parts of the posture.
 */
export function segmentPhrase(label: string): string {
  return segmentKey(label)
    .replace(/\b(right|left|both)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Wordings a phrase's teaching lines use that don't repeat the label. */
const PHRASE_SYNONYMS: Record<string, RegExp> = {
  'hands to feet': /hands to feet|\bfold|\bheels?\b/i,
  backbend: /back ?bend|head back|behind you/i,
  stretching: /\bstretch/i,
  side: /\bside/i,
};

/** Does this line of teaching talk about the phrase (its part of the posture)? */
export function mentionsPhrase(text: string, phrase: string): boolean {
  if (!phrase) return false;
  const syn = PHRASE_SYNONYMS[phrase];
  if (syn) return syn.test(text);
  return new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
}
