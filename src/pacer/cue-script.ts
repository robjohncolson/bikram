import { poses } from '../data';
import { CLOSING_LINE, announceText } from './cues';

/**
 * The complete spoken script of a class — every string the sampler can
 * ever say with default preferences (Sanskrit variants intentionally
 * excluded: they fall back to speech synthesis). Used by the voice-clip
 * generator (scripts/generate-voice.mjs) and the coverage test, so
 * content edits that add spoken lines fail tests until clips regenerate.
 */
export function collectCueTexts(): string[] {
  const texts = new Set<string>();
  texts.add(CLOSING_LINE);
  for (const pose of poses) {
    texts.add(announceText(pose, false));
    // the full teaching voice: every setup step (walk-in), every
    // alignment cue and the breath line (mid-hold coaching)
    for (const step of pose.setup) texts.add(step);
    for (const cue of pose.cues) texts.add(cue);
    if (pose.breath) texts.add(pose.breath);
    if (pose.segments) {
      // the first segment's cue is never spoken — the announcement covers it
      for (const seg of pose.segments.slice(1)) texts.add(seg.cue);
    } else {
      for (let set = 1; set < pose.sets; set++) {
        texts.add(set === 1 ? 'Second set.' : `Set ${set + 1}.`);
      }
    }
  }
  return [...texts].sort();
}
