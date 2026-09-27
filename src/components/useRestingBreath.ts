import { useEffect, useState } from 'react';
import type { BreathPhase } from './PoseMotion';

/**
 * A resting breath outside any class: alternates inhale / exhale every
 * `seconds` (default 6 — the Pranayama six-count, five breaths a minute).
 * One timeout per phase flip; the CSS transition does the motion. The
 * first inhale starts shortly after mount so the transition has a
 * settled state to leave from.
 */
export function useRestingBreath(seconds = 6): BreathPhase {
  const [phase, setPhase] = useState<BreathPhase['phase']>('exhale');
  useEffect(() => {
    let timer = 0;
    const flip = () => {
      setPhase((p) => (p === 'inhale' ? 'exhale' : 'inhale'));
      timer = window.setTimeout(flip, seconds * 1000);
    };
    timer = window.setTimeout(flip, 400);
    return () => window.clearTimeout(timer);
  }, [seconds]);
  return { phase, seconds };
}
