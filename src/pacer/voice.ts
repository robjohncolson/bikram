/**
 * The spoken side of the sampler: a thin, guarded wrapper over the
 * browser's built-in speech synthesis. No assets, works offline, and
 * degrades to silence (tones still fire) where speech is unavailable.
 */

export interface VoiceChoice {
  name: string;
  lang: string;
  isDefault: boolean;
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Voices load asynchronously in most browsers. Calls `cb` immediately
 * with whatever is available and again on voiceschanged; returns an
 * unsubscribe. English voices first, then the rest.
 */
export function watchVoices(cb: (voices: VoiceChoice[]) => void): () => void {
  if (!speechSupported()) {
    cb([]);
    return () => {};
  }
  const emit = () => {
    const all = window.speechSynthesis.getVoices().map((v) => ({
      name: v.name,
      lang: v.lang,
      isDefault: v.default,
    }));
    const en = all.filter((v) => v.lang.toLowerCase().startsWith('en'));
    cb(en.length > 0 ? en : all);
  };
  emit();
  window.speechSynthesis.addEventListener('voiceschanged', emit);
  return () => window.speechSynthesis.removeEventListener('voiceschanged', emit);
}

export interface SpeakOptions {
  /** exact voice name from watchVoices; default = browser default */
  voiceName?: string;
  /** cancel anything queued/speaking first (posture announcements) */
  interrupt?: boolean;
  /** 0–1, tracks the pacer volume */
  volume?: number;
}

/** Calm-teacher delivery: slightly slower than default speech. */
const RATE = 0.95;

export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!speechSupported() || !text) return;
  const synth = window.speechSynthesis;
  if (opts.interrupt) synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = RATE;
  utterance.volume = Math.min(1, Math.max(0, opts.volume ?? 1));
  if (opts.voiceName) {
    const voice = synth.getVoices().find((v) => v.name === opts.voiceName);
    if (voice) utterance.voice = voice;
  }
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
