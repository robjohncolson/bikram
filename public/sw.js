/* 26 & 2 offline worker: network-first navigations with cached
   fallback, cache-first for hashed static assets. Assets are content-
   hashed by Vite, so cache-first is always safe for them. */
const CACHE = 'yoga-26and2-v1';
/* The studio voice (~380 small Opus clips) lives in its own cache so a
   class never has to fetch a line mid-hold over hot-room reception. The
   page sends the clip list after registering (see main.tsx). */
const VOICE_CACHE = 'yoga-voice-v1';
const KEEP = new Set([CACHE, VOICE_CACHE]);
const VOICE_BATCH = 6;

function isAudio(res) {
  const type = res.headers.get('content-type') || '';
  return type.startsWith('audio/') || type === 'application/ogg';
}

async function precacheVoice(urls) {
  const cache = await caches.open(VOICE_CACHE);
  const have = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
  const missing = urls.filter((u) => typeof u === 'string' && u.startsWith('/voice/') && !have.has(u));
  for (let i = 0; i < missing.length; i += VOICE_BATCH) {
    await Promise.all(
      missing.slice(i, i + VOICE_BATCH).map(async (u) => {
        try {
          const res = await fetch(u);
          if (res.ok && isAudio(res)) await cache.put(u, res);
        } catch {
          /* offline or blocked — the next visit tries again */
        }
      }),
    );
  }
}

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'precache-voice' || !Array.isArray(data.urls)) return;
  event.waitUntil(precacheVoice(data.urls));
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  const voice = new URL(req.url).pathname.startsWith('/voice/');
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && (!voice || isAudio(res))) {
            const copy = res.clone();
            caches.open(voice ? VOICE_CACHE : CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
