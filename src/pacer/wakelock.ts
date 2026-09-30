/**
 * Screen wake lock for practice sessions: the phone must not sleep
 * mid-hold. Browsers silently release the lock when the tab hides, so
 * the helper re-acquires on visibility return while "wanted". Degrades
 * to a no-op where the API is missing (older Safari, some webviews).
 */

export interface WakeLock {
  /** request the lock (call from a user-gesture-ish flow); idempotent */
  acquire(): void;
  /** release and stop wanting it */
  release(): void;
  dispose(): void;
}

export function wakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

export function createWakeLock(): WakeLock {
  let sentinel: WakeLockSentinel | null = null;
  let wanted = false;
  let pending = false;
  let generation = 0;

  async function request() {
    if (!wanted || !wakeLockSupported() || sentinel || pending) return;
    pending = true;
    const token = generation;
    try {
      const acquired = await navigator.wakeLock.request('screen');
      if (!wanted || token !== generation) {
        await acquired.release().catch(() => {});
        return;
      }
      sentinel = acquired;
      acquired.addEventListener('release', () => {
        if (sentinel === acquired) sentinel = null;
      });
    } catch {
      // denied (low battery, permissions) — practice continues unlocked
    } finally {
      pending = false;
      if (wanted && token !== generation) void request();
    }
  }

  const onVisibility = () => {
    if (wanted && document.visibilityState === 'visible') void request();
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibility);
  }

  return {
    acquire() {
      wanted = true;
      void request();
    },
    release() {
      wanted = false;
      generation++;
      void sentinel?.release().catch(() => {});
      sentinel = null;
    },
    dispose() {
      this.release();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
    },
  };
}
