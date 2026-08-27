import { voiceClips } from './voiceclips';
import { stopSpeaking } from './voice';

/**
 * Recorded-clip channel of the sampler. Clips are pre-synthesized files
 * shipped with the app (see cue-script.ts); this player queues them the
 * way speech synthesis queues utterances — announcements interrupt,
 * guides wait their turn.
 *
 * Phone-proofing: one shared <audio> element is created and primed
 * inside the user's start gesture (unlockClips), then reused for every
 * clip by swapping `src` — mobile Safari lets an element that has played
 * from a gesture keep playing programmatically, but not fresh elements
 * created from a timer. A clip that fails to load or play reports back
 * through `fallback` so the caller can say the line another way instead
 * of leaving a hole in the class.
 */

export function clipsAvailable(): boolean {
  return Object.keys(voiceClips).length > 0;
}

export function clipFor(text: string): string | undefined {
  return voiceClips[text];
}

/** Every clip URL — for offline precaching. */
export function clipUrls(): string[] {
  return [...new Set(Object.values(voiceClips))];
}

interface ClipItem {
  url: string;
  volume: number;
  fallback?: () => void;
}

/** A one-sample silent WAV: enough to unlock an element inside a gesture. */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let shared: HTMLAudioElement | null = null;
let playing: ClipItem | null = null;
let queue: ClipItem[] = [];
/** Bumped on every play/stop so stale media events cannot act on a newer clip. */
let seq = 0;

function element(): HTMLAudioElement | null {
  if (shared) return shared;
  if (typeof Audio === 'undefined') return null;
  shared = new Audio();
  shared.preload = 'auto';
  return shared;
}

/**
 * Prime the clip channel from a user gesture (the start button). Safe to
 * call repeatedly; a no-op outside browsers.
 */
export function unlockClips(): void {
  const el = element();
  if (!el || el.dataset.unlocked === '1') return;
  el.dataset.unlocked = '1';
  el.src = SILENT_WAV;
  void el.play().catch(() => {
    // the gesture did not unlock us — clips may still play where the
    // platform allows it, and failures fall back to speech synthesis
    delete el.dataset.unlocked;
  });
}

function drain(): void {
  const next = queue.shift();
  if (next) playNow(next);
}

function playNow(item: ClipItem): void {
  const el = element();
  if (!el) {
    item.fallback?.();
    drain();
    return;
  }
  const token = ++seq;
  playing = item;
  const finish = (failed: boolean) => {
    if (token !== seq) return; // superseded by a newer play or a stop
    el.removeEventListener('ended', onEnded);
    el.removeEventListener('error', onError);
    playing = null;
    if (failed) item.fallback?.();
    drain();
  };
  const onEnded = () => finish(false);
  const onError = () => finish(true);
  el.addEventListener('ended', onEnded);
  el.addEventListener('error', onError);
  el.volume = Math.min(1, Math.max(0, item.volume));
  el.src = item.url;
  el.play().catch(() => finish(true));
}

export function playClip(
  url: string,
  opts: { volume?: number; interrupt?: boolean; fallback?: () => void } = {},
): void {
  const item: ClipItem = { url, volume: opts.volume ?? 1, fallback: opts.fallback };
  if (opts.interrupt) stopClips();
  if (playing) queue.push(item);
  else playNow(item);
}

export function stopClips(): void {
  queue = [];
  seq++; // invalidate the live clip's listeners before touching the element
  playing = null;
  if (shared && !shared.paused) shared.pause();
}

/** Silence both sampler channels — clips and speech synthesis. */
export function silenceVoice(): void {
  stopClips();
  stopSpeaking();
}
