/** Breath pacer engine — the only import surface for views. */
export {
  BPM_MIN,
  BPM_MAX,
  BEATS_MIN,
  BEATS_MAX,
  PACER_DEFAULTS,
  PACER_PRESETS,
  clampSettings,
  beatSeconds,
  phaseSeconds,
  breathsPerMinute,
  beatsForSeconds,
} from './timing';
export type { PacerSettings, PacerPreset } from './timing';
export { createMetronome } from './metronome';
export type { BeatEvent, Metronome } from './metronome';
export { announceText, buildPoseTrack, buildClassTrack, segmentAtBeat } from './cues';
export type { CueKind, CueEvent, CueOptions, PoseTrack, SegmentPosition } from './cues';
export { speechSupported, watchVoices, speak, stopSpeaking } from './voice';
export type { VoiceChoice, SpeakOptions } from './voice';
export { createWakeLock, wakeLockSupported } from './wakelock';
export type { WakeLock } from './wakelock';
export { collectCueTexts } from './cue-script';
export { clipsAvailable, clipFor, clipUrls, unlockClips, playClip, stopClips, silenceVoice } from './clips';
