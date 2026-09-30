import { afterEach, expect, it, vi } from 'vitest';
import { createWakeLock } from './wakelock';
class Sentinel extends EventTarget { release = vi.fn(() => Promise.resolve()); }
const flush = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };
afterEach(() => vi.unstubAllGlobals());
it('an old release event cannot clear a newly acquired sentinel', async () => {
  const old = new Sentinel();
  const current = new Sentinel();
  const request = vi.fn().mockResolvedValueOnce(old).mockResolvedValue(current);
  vi.stubGlobal('navigator', { wakeLock: { request } });
  const lock = createWakeLock();
  lock.acquire();
  await flush();
  lock.release();
  lock.acquire();
  await flush();
  old.dispatchEvent(new Event('release'));
  lock.release();
  expect(current.release).toHaveBeenCalledOnce();
});
it('serializes requests and releases a result arriving after stop before reacquiring', async () => {
  const old = new Sentinel();
  const current = new Sentinel();
  let resolve!: (value: Sentinel) => void;
  const request = vi.fn().mockImplementationOnce(() => new Promise((yes) => { resolve = yes; })).mockResolvedValue(current);
  vi.stubGlobal('navigator', { wakeLock: { request } });
  const lock = createWakeLock();
  lock.acquire();
  lock.acquire();
  expect(request).toHaveBeenCalledTimes(1);
  lock.release();
  lock.acquire();
  resolve(old);
  await flush();
  expect(old.release).toHaveBeenCalledOnce();
  expect(request).toHaveBeenCalledTimes(2);
  lock.dispose();
  expect(current.release).toHaveBeenCalledOnce();
});
