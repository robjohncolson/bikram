import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { poses } from '../data';
import { buildPoseTrack, PACER_DEFAULTS } from '../pacer';
import { dayKey, emptyJournal, recordClass } from '../trainer';
import { eligibleHandoff, guardClassUnload, practicedSpan, rehearsalDelay, RehearsalDebrief, segmentSettings, stopClassPlayback } from './Pacer';
import { PacerClassMode } from './PacerClassMode';

describe('pacer lifecycle', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('warns on unload, finishes only on departure, and removes its listeners', () => {
    const target = new EventTarget();
    const onLeave = vi.fn();
    const cleanup = guardClassUnload(target, onLeave);
    const attempt = new Event('beforeunload', { cancelable: true });
    Object.defineProperty(attempt, 'returnValue', { value: '', writable: true });
    target.dispatchEvent(attempt);
    expect(attempt.defaultPrevented).toBe(true);
    expect(onLeave).not.toHaveBeenCalled();
    target.dispatchEvent(new Event('pagehide'));
    expect(onLeave).toHaveBeenCalledOnce();
    cleanup();
    const after = new Event('beforeunload', { cancelable: true });
    target.dispatchEvent(after);
    target.dispatchEvent(new Event('pagehide'));
    expect(after.defaultPrevented).toBe(false);
    expect(onLeave).toHaveBeenCalledOnce();
  });

  it.each([1, 6])('preserves a %i-count override through every settings update', (override) => {
    for (const change of [{ volume: 0.2 }, { muted: true }, { bpm: 80 }, { beatsPerBar: 4 }, {}]) {
      const settings = { ...PACER_DEFAULTS, ...change };
      expect(segmentSettings(settings, override)).toEqual({ ...settings, beatsPerBar: override });
      expect(segmentSettings(settings)).toEqual(settings);
    }
  });

  it.each([false, true])('stops playback, pending beats and the wake lock (bell: %s)', (bell) => {
    const metronome = { cue: vi.fn(), stop: vi.fn(), setQuiet: vi.fn() };
    const lock = { release: vi.fn() };
    const clearPending = vi.fn();
    stopClassPlayback(metronome, lock, clearPending, bell);
    expect(metronome.stop).toHaveBeenCalledOnce();
    expect(lock.release).toHaveBeenCalledOnce();
    expect(clearPending).toHaveBeenCalledOnce();
    expect(metronome.setQuiet).toHaveBeenCalledWith(false);
    expect(metronome.cue).toHaveBeenCalledTimes(bell ? 1 : 0);
  });

  it('records the practiced span and day even after revisiting an earlier posture', () => {
    const span = practicedSpan(new Set([3, 4, 5, 2]));
    expect(span).toEqual({ fromOrder: 2, toOrder: 5 });
    expect(practicedSpan(new Set())).toBeNull();
    const journal = emptyJournal();
    const now = new Date(2026, 8, 30, 12).getTime();
    recordClass(journal, { ...span!, startedAt: now - 120_000, endedAt: now, pacedSeconds: 120, bpm: 60, rehearsed: true });
    expect(journal.classes[0].toOrder).toBe(5);
    expect(journal.days).toEqual([dayKey(now)]);
  });

  it('does not delay the chosen opening posture, including a nonzero start', () => {
    for (const from of [0, 9]) {
      const track = buildPoseTrack(poses[from], 60, { announceDelayBeats: rehearsalDelay(true, from, from) });
      expect(track.events.find((event) => event.kind === 'announce')?.atBeat).toBe(0);
      expect(rehearsalDelay(true, from + 1, from)).toBeGreaterThan(0);
      expect(rehearsalDelay(false, from + 1, from)).toBe(0);
    }
  });

  it('only offers a hand-off held past its delayed announce from a practiced neighbour', () => {
    const track = buildPoseTrack(poses[1], 60, { announceDelayBeats: rehearsalDelay(true, 1, 0) });
    const reveal = track.events.find((event) => event.kind === 'announce')!.atBeat;
    expect(eligibleHandoff(track, 0, 1)).toBe(false);
    expect(eligibleHandoff(track, reveal, 1)).toBe(false);
    expect(eligibleHandoff(track, reveal + 1, 1)).toBe(true);
    expect(eligibleHandoff(track, reveal + 1)).toBe(false);
    expect(eligibleHandoff(track, reveal + 1, 4)).toBe(false);
    const opening = buildPoseTrack(poses[0], 60);
    expect(eligibleHandoff(opening, 20, 0)).toBe(false);
  });

  it('debriefs only eligible postures and starts unanswered with saving disabled', () => {
    const html = renderToStaticMarkup(<RehearsalDebrief handoffs={[poses[1]]} />);
    expect(html).toContain(poses[1].englishName);
    expect(html).not.toContain(poses[2].englishName);
    expect(html).toContain('unanswered');
    expect(html).toContain('disabled=""');
    expect(html).toContain('Confirm 0 recalled, 0 missed');
    expect(renderToStaticMarkup(<RehearsalDebrief handoffs={[]} />)).toBe('');
  });

  it('withholds a supplied segment identity in class mode and its live region', () => {
    vi.stubGlobal('document', { fullscreenEnabled: false });
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <PacerClassMode pose={poses[25]} hidden rehearse segmentLabel="First set — 60 exhalations"
          paused={false} progress={0} posture={26} postureCount={26} canBack canNext={false}
          onBack={() => {}} onNext={() => {}} onTogglePause={() => {}} onExit={() => {}} />
      </MemoryRouter>,
    );
    expect(html).not.toContain('60 exhalations');
    expect(html).not.toContain(poses[25].englishName);
    expect(html).toContain('What comes next?');
  });
});
