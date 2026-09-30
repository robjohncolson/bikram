import { voiceClips } from './voiceclips';
import { clipDurations } from './clipdurations';
import { stopSpeaking, unlockSpeech } from './voice';

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

/**
 * How long a line takes to say: the recorded clip's length when we have
 * one, else a reading-pace estimate for speech synthesis.
 */
export function clipSeconds(text: string): number {
  const url = voiceClips[text];
  const known = url ? clipDurations[url] : undefined;
  if (known !== undefined) return known;
  const words = text.trim().split(/\s+/).length;
  return 0.4 + words * 0.42;
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

export type ClipAudio = Pick<HTMLAudioElement,
  'src' | 'preload' | 'dataset' | 'volume' | 'paused' | 'duration' | 'readyState' |
  'play' | 'pause' | 'load' | 'removeAttribute' | 'addEventListener' | 'removeEventListener'>;

export function createClipPlayer(makeAudio: () => ClipAudio | null) {
  let shared: ClipAudio | null = null;
  let cleanup: (() => void) | null = null;
  let playing: ClipItem | null = null;
  let queue: ClipItem[] = [];
  /** Bumped on every play/stop so stale media events cannot act on a newer clip. */
  let seq = 0;

  function element(): ClipAudio | null {
    if (shared) return shared;
    shared = makeAudio();
    if (!shared) return null;
    shared.preload = 'auto';
    return shared;
  }

  /**
   * Prime the clip channel from a user gesture (the start button). Safe to
   * call repeatedly; a no-op outside browsers.
   */
  function unlockClips(): void {
    unlockSpeech();
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
    else if (shared) {
      shared.removeAttribute('src');
      shared.load();
    }
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
    el.volume = Math.min(1, Math.max(0, item.volume));
    el.src = item.url;
    let watchdog: ReturnType<typeof setTimeout>;
    const detach = () => {
      for (const event of ['error', 'pause', 'stalled', 'abort']) el.removeEventListener(event, onError);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('loadedmetadata', armWatchdog);
      clearTimeout(watchdog);
      if (cleanup === detach) cleanup = null;
    };
    const finish = (failed: boolean) => {
      detach();
      if (token !== seq) return;
      seq++;
      playing = null;
      if (failed) {
        el.pause();
        item.fallback?.();
      }
      drain();
    };
    const onEnded = () => finish(false);
    const onError = () => finish(true);
    const armWatchdog = () => {
      clearTimeout(watchdog);
      const seconds = Math.max(clipDurations[item.url] ?? 30, Number.isFinite(el.duration) ? el.duration : 0);
      watchdog = setTimeout(() => finish(true), (seconds + 5) * 1000);
    };
    cleanup = detach;
    el.addEventListener('loadedmetadata', armWatchdog);
    armWatchdog();
    try {
      // Wait out events queued by replacing the previous resource. A play
      // rejection or the watchdog covers failures before playback starts.
      void el.play().then(() => {
        if (token !== seq) return;
        el.addEventListener('ended', onEnded);
        for (const event of ['error', 'pause', 'stalled', 'abort']) el.addEventListener(event, onError);
      }).catch(() => finish(true));
    } catch {
      finish(true);
    }
  }

  function playClip(
    url: string,
    opts: { volume?: number; interrupt?: boolean; fallback?: () => void } = {},
  ): void {
    const item: ClipItem = { url, volume: opts.volume ?? 1, fallback: opts.fallback };
    if (opts.interrupt) stopClips();
    if (playing) queue.push(item);
    else playNow(item);
  }

  function stopClips(): void {
    queue = [];
    seq++; // invalidate the live clip's listeners before touching the element
    cleanup?.();
    playing = null;
    if (shared) {
      shared.pause();
      shared.removeAttribute('src');
      shared.load();
    }
  }
  return { unlockClips, playClip, stopClips };
}

export const { unlockClips, playClip, stopClips } = createClipPlayer(
  () => typeof Audio === 'undefined' ? null : new Audio(),
);

/** Silence both sampler channels — clips and speech synthesis. */
export function silenceVoice(): void {
  stopClips();
  stopSpeaking();
}
