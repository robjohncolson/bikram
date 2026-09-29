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
  breathPhaseFromBeat,
} from './timing';
export type { PacerSettings, PacerPreset, BreathCue } from './timing';
export { createMetronome } from './metronome';
export type { BeatEvent, BeatPhase, Metronome } from './metronome';
export { CLOSING_LINE, CLOSING_SECONDS, announceText, buildPoseTrack, buildClassTrack, coachingMaterial, cueLayer, walkInSteps, segmentAtBeat, phaseAtBeat, nextSpokenCue, cueWhen, classMinutes } from './cues';
export { DEFAULT_BAR_BEATS, poseBarBeats, breathBeats, quantizeBeats, poseGridSeconds } from './grid';
export type { CueKind, CueEvent, CueLayer, CueOptions, PoseTrack, SegmentPosition, SegSpan } from './cues';
export { figurePlan, figureFrameAt, planEndMotion, planEnd, segmentTimeline } from './figure';
export type {
  FigurePlan,
  FigurePlanOptions,
  FigureMove,
  FigureSegment,
  FigureClock,
  FigureFrame,
  FrameStep,
} from './figure';
export { speechSupported, watchVoices, speak, stopSpeaking } from './voice';
export type { VoiceChoice, SpeakOptions } from './voice';
export { createWakeLock, wakeLockSupported } from './wakelock';
export type { WakeLock } from './wakelock';
export { collectCueTexts } from './cue-script';
export { clipsAvailable, clipFor, clipUrls, clipSeconds, unlockClips, playClip, stopClips, silenceVoice } from './clips';
export {
  FULL_CLASS,
  SHORT_CLASS,
  PROGRAMS,
  programById,
  firstSetOnly,
  programPoses,
  programSeconds,
  programMinutes,
} from './programs';
export type { ClassProgram, ProgramItem } from './programs';
