import { describe, expect, it } from 'vitest';
import { collectCueTexts } from './cue-script';
import { voiceClips } from './voiceclips';

describe('studio voice clips', () => {
  const texts = collectCueTexts();

  it('collects the full spoken script (announcements, guides, segment cues)', () => {
    expect(texts.length).toBeGreaterThan(60);
    expect(texts).toContain('Posture 22. Camel Pose.');
    expect(texts).toContain('Twenty-second savasana.');
    expect(texts).toContain('Sit-up.');
    // the never-spoken first-segment cues stay out of the script
    expect(texts.every((t) => t.length > 0)).toBe(true);
  });

  // Once clips are generated, every spoken line must have one — a content
  // edit that adds spoken text fails here until generate-voice.mjs reruns.
  it('covers every cue text once generated', () => {
    const generated = Object.keys(voiceClips).length;
    if (generated === 0) return; // pre-generation: nothing to cover yet
    const missing = texts.filter((t) => !voiceClips[t]);
    expect(missing, `missing clips for: ${missing.slice(0, 5).join(' | ')}`).toEqual([]);
    for (const path of Object.values(voiceClips)) {
      expect(path).toMatch(/^\/voice\/[0-9a-f]{12}\.(ogg|wav)$/);
    }
  });
});
