import { poses } from '../data';
import { announceText } from './cues';

/**
 * The complete spoken script of a class — every string the sampler can
 * ever say with default preferences (Sanskrit variants intentionally
 * excluded: they fall back to speech synthesis). Used by the voice-clip
 * generator (scripts/generate-voice.mjs) and the coverage test, so
 * content edits that add spoken lines fail tests until clips regenerate.
 */
export function collectCueTexts(): string[] {
  const texts = new Set<string>();
  for (const pose of poses) {
    texts.add(announceText(pose, false));
    if (pose.setup.length > 0) texts.add(pose.setup[0]);
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
