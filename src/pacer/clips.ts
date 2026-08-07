import { voiceClips } from './voiceclips';
import { stopSpeaking } from './voice';

/**
 * Recorded-clip channel of the sampler. Clips are pre-synthesized files
 * shipped with the app (see cue-script.ts); this player queues them the
 * way speech synthesis queues utterances — announcements interrupt,
 * guides wait their turn. Falls back gracefully: callers check
 * clipFor(text) and use speech synthesis when there is no clip.
 */

export function clipsAvailable(): boolean {
  return Object.keys(voiceClips).length > 0;
}

export function clipFor(text: string): string | undefined {
  return voiceClips[text];
}

let current: HTMLAudioElement | null = null;
let queue: { url: string; volume: number }[] = [];

function drain(): void {
  const next = queue.shift();
  if (next) playNow(next.url, next.volume);
}

function playNow(url: string, volume: number): void {
  const audio = new Audio(url);
  audio.volume = Math.min(1, Math.max(0, volume));
  current = audio;
  const done = () => {
    if (current === audio) current = null;
    drain();
  };
  audio.addEventListener('ended', done);
  audio.addEventListener('error', done);
  void audio.play().catch(done);
}

export function playClip(url: string, opts: { volume?: number; interrupt?: boolean } = {}): void {
  const volume = opts.volume ?? 1;
  if (opts.interrupt) stopClips();
  if (current) queue.push({ url, volume });
  else playNow(url, volume);
}

export function stopClips(): void {
  queue = [];
  if (current) {
    current.pause();
    current = null;
  }
}

/** Silence both sampler channels — clips and speech synthesis. */
export function silenceVoice(): void {
  stopClips();
  stopSpeaking();
}
