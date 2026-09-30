import { afterEach, describe, expect, it, vi } from 'vitest';
import { createClipPlayer } from './clips';
import type { ClipAudio } from './clips';

class AudioFake extends EventTarget implements ClipAudio {
  src = '';
  preload: ClipAudio['preload'] = '';
  dataset = {};
  volume = 1;
  paused = false;
  duration = 40;
  readyState = 0;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn(() => { this.paused = true; });
  load = vi.fn();
  removeAttribute = vi.fn(() => { this.src = ''; });
}

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('clip playback lifecycle', () => {
  it.each(['abort', 'error'])('falls back and drains on %s', async (event) => {
    vi.useFakeTimers();
    const audio = new AudioFake();
    const player = createClipPlayer(() => audio);
    const fallback = vi.fn();
    player.playClip('a', { fallback });
    player.playClip('b');
    await Promise.resolve();
    audio.dispatchEvent(new Event(event));
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(audio.src).toBe('b');
    player.stopClips();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['stalled', 'pause'])('allows a recovered %s to finish without fallback', async (event) => {
    vi.useFakeTimers();
    const audio = new AudioFake();
    const player = createClipPlayer(() => audio);
    const fallback = vi.fn();
    player.playClip('a', { fallback });
    player.playClip('b');
    await Promise.resolve();
    audio.dispatchEvent(new Event(event));
    expect(fallback).not.toHaveBeenCalled();
    expect(audio.src).toBe('a');
    for (const progress of ['progress', 'playing', 'timeupdate']) {
      vi.advanceTimersByTime(40000);
      audio.dispatchEvent(new Event(progress));
    }
    vi.advanceTimersByTime(10000);
    audio.dispatchEvent(new Event('ended'));
    expect(fallback).not.toHaveBeenCalled();
    expect(audio.src).toBe('b');
    player.stopClips();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['stalled', 'pause'])('unwedges an unrecovered %s after no progress', async (event) => {
    vi.useFakeTimers();
    const audio = new AudioFake();
    const player = createClipPlayer(() => audio);
    const fallback = vi.fn();
    player.playClip('a', { fallback });
    player.playClip('b');
    await Promise.resolve();
    audio.dispatchEvent(new Event(event));
    expect(fallback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(45000);
    expect(fallback).toHaveBeenCalledOnce();
    expect(audio.src).toBe('b');
    player.stopClips();
  });

  it('detaches superseded listeners and clears the finished resource', async () => {
    vi.useFakeTimers();
    const audio = new AudioFake();
    const remove = vi.spyOn(audio, 'removeEventListener');
    const player = createClipPlayer(() => audio);
    const fallback = vi.fn();
    player.playClip('a', { fallback });
    await Promise.resolve();
    player.playClip('b', { interrupt: true });
    expect(remove).toHaveBeenCalledWith('ended', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('progress', expect.any(Function));
    await Promise.resolve();
    audio.dispatchEvent(new Event('ended'));
    expect(fallback).not.toHaveBeenCalled();
    expect(audio.src).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('watchdog waits longer than the duration and recovers missing terminal events', async () => {
    vi.useFakeTimers();
    const audio = new AudioFake();
    const player = createClipPlayer(() => audio);
    const fallback = vi.fn();
    player.playClip('a', { fallback });
    await Promise.resolve();
    vi.advanceTimersByTime(41000);
    expect(fallback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(4000);
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(audio.src).toBe('');
  });

  it('rejected play falls back once and cannot cancel a newer clip', async () => {
    vi.useFakeTimers();
    const audio = new AudioFake();
    let reject!: (e: Error) => void;
    audio.play.mockImplementationOnce(() => new Promise((_, no) => { reject = no; }));
    const player = createClipPlayer(() => audio);
    const fallback = vi.fn();
    player.playClip('a', { fallback });
    player.playClip('b', { interrupt: true });
    reject(new Error('interrupted'));
    await Promise.resolve();
    await Promise.resolve();
    expect(audio.src).toBe('b');
    expect(fallback).not.toHaveBeenCalled();
    player.stopClips();
  });
});

