/* Network-first shell, immutable assets, and revalidated manifest/icons. */
importScripts('/sw-lib.js');
const { shellAssets, bundledAssets, staleUrls, oldCaches, rangeResponse } = globalThis.swLib;
const CACHE = 'yoga-26and2-v2';
const VOICE_CACHE = 'yoga-voice-v1';
const MOTION_CACHE = 'yoga-motion-v1';
const BATCH = 6;

function isAudio(res) {
  const type = res.headers.get('content-type') || '';
  return type.startsWith('audio/') || type === 'application/ogg';
}

function isImage(res) {
  return (res.headers.get('content-type') || '').startsWith('image/');
}

const STORES = {
  '/voice/': [VOICE_CACHE, isAudio],
  '/motion/': [MOTION_CACHE, isImage],
};

function storeFor(pathname) {
  for (const prefix in STORES) if (pathname.startsWith(prefix)) return STORES[prefix];
  return null;
}

function isShell(res) {
  return res.ok && !res.redirected && (res.headers.get('content-type') || '').includes('text/html');
}

async function saveShell(res) {
  if (!isShell(res)) throw new Error('Invalid app shell');
  const assets = shellAssets(await res.clone().text(), location.origin + '/index.html');
  if (!assets.length) throw new Error('App shell has no entry assets');
  const cache = await caches.open(CACHE);
  // Follow Vite's imports and preload table, including routes not opened yet.
  const wanted = new Set(assets);
  for (const url of wanted) {
    const asset = await cache.match(url) || await fetch(url);
    if (asset.status !== 200 || (asset.headers.get('content-type') || '').includes('text/html')) {
      throw new Error('Invalid shell asset');
    }
    if (/\.(js|css)$/.test(new URL(url).pathname)) {
      for (const dependency of bundledAssets(await asset.clone().text(), url)) wanted.add(dependency);
    }
    await cache.put(url, asset);
  }
  await cache.put('/index.html', res);
  const cached = (await cache.keys()).map((req) => req.url).filter((url) => new URL(url).pathname.startsWith('/assets/'));
  await Promise.all(staleUrls(cached, [...wanted], location.origin).map((url) => cache.delete(url)));
}

async function precache(urls, voiceOnly) {
  const wanted = urls.filter((url) => typeof url === 'string' && url.startsWith('/') &&
    new URL(url, location.origin).origin === location.origin && storeFor(url));
  for (const [prefix, [name, guard]] of Object.entries(STORES)) {
    if (voiceOnly && name !== VOICE_CACHE) continue;
    const cache = await caches.open(name);
    const list = wanted.filter((url) => url.startsWith(prefix));
    const cached = (await cache.keys()).map((req) => req.url);
    await Promise.all(staleUrls(cached, list, location.origin).map((url) => cache.delete(url)));
    for (let i = 0; i < list.length; i += BATCH) {
      await Promise.all(list.slice(i, i + BATCH).map(async (url) => {
        try {
          if (await cache.match(url)) return;
          const res = await fetch(url);
          if (res.status === 200 && guard(res)) await cache.put(url, res);
        } catch {
          /* The next visit retries missing files. */
        }
      }));
    }
  }
}

let filling = Promise.resolve();
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !Array.isArray(data.urls)) return;
  if (data.type !== 'precache-voice' && data.type !== 'precache') return;
  filling = filling.catch(() => {}).then(() => precache(data.urls, data.type === 'precache-voice'));
  event.waitUntil(filling);
});

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    await saveShell(await fetch('/index.html', { cache: 'reload' }));
    const cache = await caches.open(CACHE);
    await cache.addAll(['/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png']);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await Promise.all(oldCaches(await caches.keys(), CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    const controller = new AbortController();
    let timer;
    const network = Promise.race([
      fetch(req, { signal: controller.signal }).then((res) => {
        if (!isShell(res)) throw new Error('Invalid app shell');
        return res;
      }),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('Navigation timed out'));
        }, 3000);
      }),
    ]).finally(() => clearTimeout(timer));
    event.waitUntil(network.then((res) => saveShell(res.clone())).catch(() => {}));
    event.respondWith(network.catch(async () =>
      (await (await caches.open(CACHE)).match('/index.html')) || Response.error(),
    ));
    return;
  }

  const store = storeFor(url.pathname);
  const immutable = url.pathname.startsWith('/assets/') ||
    /^\/motion\/.+\.[a-f0-9]{8}\.png$/.test(url.pathname);
  const cacheFirst = immutable || store?.[0] === VOICE_CACHE;
  const work = (async () => {
    const cache = await caches.open(store ? store[0] : CACHE);
    const hit = await cache.match(req.url);
    if (req.headers.has('range')) {
      return hit?.status === 200 && store?.[0] === VOICE_CACHE
        ? rangeResponse(hit, req.headers.get('range')) : fetch(req);
    }
    if (cacheFirst && hit) return hit;
    const network = fetch(req).then(async (res) => {
      if (res.status === 200 && (store ? store[1](res) : !url.pathname.startsWith('/api/'))) {
        await cache.put(req, res.clone());
      }
      return res;
    });
    if (hit) return { hit, network };
    return network;
  })();
  event.respondWith(work.then((result) => result.hit || result));
  event.waitUntil(work.then((result) => result.network).catch(() => {}));
});
