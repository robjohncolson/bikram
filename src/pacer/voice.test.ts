import { afterEach, expect, it, vi } from 'vitest';
import { speak } from './voice';
import { createClipPlayer } from './clips';

afterEach(() => vi.unstubAllGlobals());
it('primes speech synchronously in the start gesture and resumes fallback speech', () => {
  const synth = { resume: vi.fn(), speak: vi.fn(), cancel: vi.fn() };
  vi.stubGlobal('window', { speechSynthesis: synth });
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    text: string;
    constructor(text: string) { this.text = text; }
  });
  createClipPlayer(() => null).unlockClips();
  expect(synth.speak).toHaveBeenCalledWith(expect.objectContaining({ text: '', volume: 0 }));
  speak('Rest here.', { interrupt: true });
  expect(synth.resume).toHaveBeenCalledTimes(2);
  expect(synth.cancel).toHaveBeenCalledOnce();
});
