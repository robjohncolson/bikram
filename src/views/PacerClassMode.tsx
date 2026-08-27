import { useEffect, useRef, useState } from 'react';
import type { Pose } from '../data';
import './PacerClassMode.css';

export interface PacerClassModeProps {
  pose: Pose;
  next?: Pose;
  /** the big number: current segment countdown when available, else the posture's */
  countdown: string;
  /** whole-posture countdown, shown small when a segment countdown leads */
  poseCountdown?: string;
  segmentLabel?: string;
  segmentKind?: string;
  paused: boolean;
  /** rehearsal: the posture's identity is withheld until it is announced */
  hidden?: boolean;
  /** rehearsal is on: never show what comes next */
  rehearse?: boolean;
  /** whole-class progress, 0–1 */
  progress: number;
  posture: number;
  postureCount: number;
  canBack: boolean;
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
  onTogglePause: () => void;
  onExit: () => void;
}

/**
 * Full-screen dim-room view of the running class: a countdown readable
 * from across a mat, nothing else fighting for attention. Esc leaves.
 */
export function PacerClassMode(props: PacerClassModeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const onExitRef = useRef(props.onExit);
  onExitRef.current = props.onExit;

  // take focus on open; Esc exits (and leaves browser fullscreen)
  useEffect(() => {
    rootRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExitRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenEnabled) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // announce segment changes politely; the per-second countdown stays silent
  const [announced, setAnnounced] = useState('');
  useEffect(() => {
    if (props.segmentLabel) setAnnounced(props.segmentLabel);
  }, [props.segmentLabel]);

  return (
    <div
      ref={rootRef}
      className="cm"
      role="dialog"
      aria-modal="true"
      aria-label={
        props.hidden
          ? `Class mode — posture ${props.posture} of ${props.postureCount}`
          : `Class mode — posture ${props.posture} of ${props.postureCount}, ${props.pose.englishName}`
      }
      tabIndex={-1}
    >
      <header className="cm-top">
        <p className="cm-posture">
          Posture {props.posture} of {props.postureCount}
        </p>
        <h2 className="cm-name">{props.hidden ? 'What comes next?' : props.pose.englishName}</h2>
        <p className="cm-sanskrit">{props.hidden ? 'say it before the voice does' : props.pose.sanskritName}</p>
      </header>

      <main className="cm-mid">
        {props.segmentLabel && (
          <p className="cm-seg" data-kind={props.segmentKind}>
            {props.segmentLabel}
          </p>
        )}
        <p className="cm-count" aria-live="off">
          {props.countdown}
        </p>
        {props.poseCountdown && <p className="cm-posetime">posture {props.poseCountdown}</p>}
        {props.paused && <p className="cm-paused">paused</p>}
      </main>

      <footer className="cm-bottom">
        <div className="cm-bar" aria-hidden="true">
          <span style={{ width: `${(Math.min(1, Math.max(0, props.progress)) * 100).toFixed(2)}%` }} />
        </div>
        <p className="cm-next">
          {props.rehearse
            ? 'Rehearsal — the next posture stays hidden.'
            : props.next
              ? `Next: #${props.next.order} ${props.next.englishName}`
              : 'Last posture — Kapalbhati closes the class.'}
        </p>
        <div className="cm-controls">
          <button type="button" onClick={props.onBack} disabled={!props.canBack} aria-label="Skip back one posture">
            ‹ Back
          </button>
          <button type="button" className="cm-primary" onClick={props.onTogglePause}>
            {props.paused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" onClick={props.onNext} disabled={!props.canNext} aria-label="Skip forward one posture">
            Next ›
          </button>
          {document.fullscreenEnabled && (
            <button type="button" onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </button>
          )}
          <button type="button" onClick={props.onExit}>
            Leave class mode
          </button>
        </div>
      </footer>

      <div className="cm-live" aria-live="polite">
        {announced}
      </div>
    </div>
  );
}
