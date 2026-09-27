/* 26 & 2 offline worker: network-first navigations with cached
   fallback, cache-first for hashed static assets. Assets are content-
   hashed by Vite, so cache-first is always safe for them. */
const CACHE = 'yoga-26and2-v1';
/* The studio voice (~380 small Opus clips) lives in its own cache so a
   class never has to fetch a line mid-hold over hot-room reception. The
   page sends the clip list after registering (see main.tsx). */
const VOICE_CACHE = 'yoga-voice-v1';
/* The motion figures (one PNG sprite sheet per posture, ~100 KB each)
   likewise get their own cache so a posture page animates offline. */
const MOTION_CACHE = 'yoga-motion-v1';
const KEEP = new Set([CACHE, VOICE_CACHE, MOTION_CACHE]);
const BATCH = 6;

function isAudio(res) {
  const type = res.headers.get('content-type') || '';
  return type.startsWith('audio/') || type === 'application/ogg';
}

function isImage(res) {
  return (res.headers.get('content-type') || '').startsWith('image/');
}

/* path prefix → [cache name, content-type guard] */
const STORES = {
  '/voice/': [VOICE_CACHE, isAudio],
  '/motion/': [MOTION_CACHE, isImage],
};

function storeFor(pathname) {
  for (const prefix in STORES) if (pathname.startsWith(prefix)) return STORES[prefix];
  return null;
}

async function precache(urls) {
  const wanted = urls.filter((u) => typeof u === 'string' && storeFor(u));
  const have = new Set();
  for (const [name] of Object.values(STORES)) {
    const cache = await caches.open(name);
    for (const r of await cache.keys()) have.add(new URL(r.url).pathname);
  }
  const missing = wanted.filter((u) => !have.has(u));
  for (let i = 0; i < missing.length; i += BATCH) {
    await Promise.all(
      missing.slice(i, i + BATCH).map(async (u) => {
        try {
          const [name, guard] = storeFor(u);
          const res = await fetch(u);
          if (res.ok && guard(res)) await (await caches.open(name)).put(u, res);
        } catch {
          /* offline or blocked — the next visit tries again */
        }
      }),
    );
  }
}

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !Array.isArray(data.urls)) return;
  if (data.type !== 'precache-voice' && data.type !== 'precache') return;
  event.waitUntil(precache(data.urls));
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

  const store = storeFor(new URL(req.url).pathname);
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && (!store || store[1](res))) {
            const copy = res.clone();
            caches.open(store ? store[0] : CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
