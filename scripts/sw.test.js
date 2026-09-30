import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import '../public/sw-lib.js';

const { shellAssets, bundledAssets, staleUrls, canPrune, oldCaches, rangeResponse } = globalThis.swLib;
const origin = 'https://yoga.test';
const html = '<script type="module" src="/assets/app-abc.js"></script><link href="/assets/app-abc.css" rel="stylesheet">';
const shell = () => new Response(html, { headers: { 'content-type': 'text/html' } });
const audio = () => new Response(new Uint8Array([0, 1, 2, 3, 4]), { headers: { 'content-type': 'audio/ogg' } });

function worker() {
  const stores = new Map();
  const handlers = {};
  const fetch = vi.fn(async (req) => {
    const url = typeof req === 'string' ? req : req.url;
    if (url.endsWith('/index.html')) return shell();
    if (url.endsWith('.js')) return new Response('export default 1', { headers: { 'content-type': 'text/javascript' } });
    return new Response('asset');
  });
  const key = (req) => new URL(typeof req === 'string' ? req : req.url, origin).href;
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name);
      return {
        keys: async () => [...entries.keys()].map((url) => new Request(url)),
        match: async (req) => entries.get(key(req))?.clone(),
        put: async (req, res) => { entries.set(key(req), res.clone()); },
        delete: async (req) => entries.delete(key(req)),
        addAll: async (urls) => {
          for (const url of urls) {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Fetch failed');
            entries.set(key(url), res.clone());
          }
        },
      };
    },
  };
  const self = { addEventListener: (type, handler) => { handlers[type] = handler; }, skipWaiting: vi.fn(), clients: { claim: vi.fn(), matchAll: vi.fn(async () => [{ id: 'page' }]) } };
  runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    self, caches, fetch, location: { origin }, URL, Response, AbortController,
    setTimeout, clearTimeout, importScripts: () => {}, swLib: globalThis.swLib,
  });
  function dispatch(type, props = {}) {
    const pending = [];
    let response;
    handlers[type]({ source: { id: 'page' }, ...props, waitUntil: (promise) => pending.push(promise), respondWith: (promise) => { response = promise; } });
    return { response, done: Promise.all(pending) };
  }
  const request = (path, options = {}) => ({ method: 'GET', url: origin + path, headers: new Headers(), ...options });
  return { caches, fetch, self, dispatch, request };
}

afterEach(() => vi.useRealTimers());

describe('worker pure helpers', () => {
  it('makes only build assets and hashed motion PNGs immutable at the host', () => {
    const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
    const headers = new Map(config.headers.map((rule) => [rule.source, rule.headers[0].value]));
    expect(headers.get('/assets/(.*)')).toBe('public, max-age=31536000, immutable');
    const motion = config.headers.find((rule) => rule.source.startsWith('/motion/'));
    const pattern = new RegExp('^/motion/' + motion.source.slice('/motion/:file('.length, -1) + '$');
    expect(pattern.test('/motion/eagle.ghost.1234abcd.png')).toBe(true);
    expect(pattern.test('/motion/eagle.png')).toBe(false);
    expect(motion.headers[0].value).toContain('immutable');
    expect(headers.get('/voice/(.*)')).toBe('public, max-age=0, must-revalidate');
  });

  it('discovers and deduplicates same-origin shell assets', () => {
    expect(shellAssets(html + '<script src="https://elsewhere.test/assets/no.js"></script><link href="/manifest.webmanifest"><script src=\'/assets/app-abc.js\'></script>', origin)).toEqual([
      origin + '/assets/app-abc.js', origin + '/assets/app-abc.css',
    ]);
    expect(bundledAssets('import("./lazy-123.js");const deps=["assets/lazy-123.js","assets/lazy-123.css"]', origin + '/assets/app.js')).toEqual([
      origin + '/assets/lazy-123.js', origin + '/assets/lazy-123.css',
    ]);
  });

  it('prunes only entries absent from the latest list and only older shell caches', () => {
    expect(staleUrls([origin + '/voice/old.ogg', origin + '/voice/new.ogg'], ['/voice/new.ogg'], origin)).toEqual([origin + '/voice/old.ogg']);
    expect(oldCaches(['yoga-26and2-v1', 'yoga-26and2-v2', 'yoga-26and2-v3', 'yoga-voice-v1', 'yoga-motion-v1', 'other'], 'yoga-26and2-v2')).toEqual(['yoga-26and2-v1']);
  });

  it.each([
    ['bytes=0-1', [0, 1], 'bytes 0-1/5'],
    ['bytes=2-', [2, 3, 4], 'bytes 2-4/5'],
    ['bytes=-2', [3, 4], 'bytes 3-4/5'],
    ['bytes=3-99', [3, 4], 'bytes 3-4/5'],
    ['bytes=-99', [0, 1, 2, 3, 4], 'bytes 0-4/5'],
  ])('slices %s with correct Safari response headers', async (range, bytes, contentRange) => {
    const res = await rangeResponse(audio(), range);
    expect(res.status).toBe(206);
    expect(res.headers.get('content-range')).toBe(contentRange);
    expect(res.headers.get('content-length')).toBe(String(bytes.length));
    expect(res.headers.get('accept-ranges')).toBe('bytes');
    expect(res.headers.get('content-type')).toBe('audio/ogg');
    expect([...new Uint8Array(await res.arrayBuffer())]).toEqual(bytes);
  });

  it.each(['bytes=5-', 'bytes=3-1', 'bytes=-0', 'bytes=-', 'bytes=0-1,3-4', 'bad'])('rejects invalid or unsatisfiable %s', async (range) => {
    const res = await rangeResponse(audio(), range);
    expect(res.status).toBe(416);
    expect(res.headers.get('content-range')).toBe('bytes */5');
    expect(await res.text()).toBe('');
  });
});

describe('worker lifecycle', () => {
  it('precaches the first-visit shell and its dependencies before taking control', async () => {
    const w = worker();
    const original = w.fetch.getMockImplementation();
    w.fetch.mockImplementation((req) => String(req).endsWith('app-abc.js')
      ? Promise.resolve(new Response('import("./lazy-123.js")')) : original(req));
    await w.dispatch('install').done;
    const cache = await w.caches.open('yoga-26and2-v2');
    for (const path of ['/index.html', '/assets/app-abc.js', '/assets/app-abc.css', '/assets/lazy-123.js', '/manifest.webmanifest', '/icons/icon-192.png']) {
      expect(await cache.match(path), path).toBeTruthy();
    }
    expect(w.self.skipWaiting).toHaveBeenCalledOnce();
    w.fetch.mockRejectedValue(new Error('offline'));
    const nav = w.dispatch('fetch', { request: w.request('/pace', { mode: 'navigate' }) });
    expect(await (await nav.response).text()).toBe(html);
    await nav.done;
  });

  it('does not activate after an unsuccessful shell fetch', async () => {
    const w = worker();
    w.fetch.mockResolvedValue(new Response('unavailable', { status: 503 }));
    await expect(w.dispatch('install').done).rejects.toThrow('Invalid app shell');
    expect(w.self.skipWaiting).not.toHaveBeenCalled();
  });

  it('keeps the previous shell if a new entry asset is missing', async () => {
    const w = worker();
    const cache = await w.caches.open('yoga-26and2-v2');
    await cache.put('/index.html', new Response('previous shell'));
    const original = w.fetch.getMockImplementation();
    w.fetch.mockImplementation((req) => String(req).endsWith('.js')
      ? Promise.resolve(new Response('missing', { status: 404 })) : original(req));
    await expect(w.dispatch('install').done).rejects.toThrow('Invalid shell asset');
    expect(await (await cache.match('/index.html')).text()).toBe('previous shell');
    expect(w.self.skipWaiting).not.toHaveBeenCalled();
  });

  it('falls back after three seconds of stalled navigation', async () => {
    vi.useFakeTimers();
    const w = worker();
    await (await w.caches.open('yoga-26and2-v2')).put('/index.html', shell());
    w.fetch.mockImplementation(() => new Promise(() => {}));
    const nav = w.dispatch('fetch', { request: w.request('/train', { mode: 'navigate' }) });
    await vi.advanceTimersByTimeAsync(3000);
    expect(await (await nav.response).text()).toBe(html);
    await vi.advanceTimersByTimeAsync(27000);
    await nav.done;
  });

  it.each([503, 404, 200])('does not poison the shell with status %s non-HTML responses', async (status) => {
    const w = worker();
    const cache = await w.caches.open('yoga-26and2-v2');
    await cache.put('/index.html', shell());
    w.fetch.mockResolvedValue(new Response('bad', { status }));
    const nav = w.dispatch('fetch', { request: w.request('/pace', { mode: 'navigate' }) });
    expect(await (await nav.response).text()).toBe(html);
    await nav.done;
    expect(await (await cache.match('/index.html')).text()).toBe(html);
  });

  it('returns a cached manifest immediately and revalidates it within waitUntil', async () => {
    const w = worker();
    const cache = await w.caches.open('yoga-26and2-v2');
    await cache.put('/manifest.webmanifest', new Response('old'));
    let finish;
    w.fetch.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const event = w.dispatch('fetch', { request: w.request('/manifest.webmanifest') });
    expect(await (await event.response).text()).toBe('old');
    finish(new Response('new'));
    await event.done;
    expect(await (await cache.match('/manifest.webmanifest')).text()).toBe('new');
  });

  it('keeps cached icons usable when background revalidation is offline', async () => {
    const w = worker();
    await (await w.caches.open('yoga-26and2-v2')).put('/icons/icon-192.png', new Response('icon'));
    w.fetch.mockRejectedValue(new Error('offline'));
    const event = w.dispatch('fetch', { request: w.request('/icons/icon-192.png') });
    expect(await (await event.response).text()).toBe('icon');
    await event.done;
  });

  it('serves cached ranges without network and never caches network partial responses', async () => {
    const w = worker();
    const cache = await w.caches.open('yoga-voice-v1');
    await cache.put('/voice/clip.ogg', audio());
    const request = w.request('/voice/clip.ogg', { headers: new Headers({ range: 'bytes=1-2' }) });
    const cached = w.dispatch('fetch', { request });
    expect((await cached.response).status).toBe(206);
    await cached.done;
    expect(w.fetch).not.toHaveBeenCalled();
    w.fetch.mockResolvedValue(new Response('partial', { status: 206 }));
    const missing = w.dispatch('fetch', { request: { ...request, url: origin + '/voice/missing.ogg' } });
    expect((await missing.response).status).toBe(206);
    await missing.done;
    expect(await cache.match('/voice/missing.ogg')).toBeUndefined();
  });

  it('preserves media and newer caches on activation, then prunes media from page lists', async () => {
    const w = worker();
    for (const name of ['yoga-26and2-v1', 'yoga-26and2-v3', 'other']) await w.caches.open(name);
    const voice = await w.caches.open('yoga-voice-v1');
    const motion = await w.caches.open('yoga-motion-v1');
    await voice.put('/voice/old.ogg', audio());
    await voice.put('/voice/current.ogg', audio());
    await motion.put('/motion/old.png', new Response('old'));
    await w.dispatch('activate').done;
    expect(await w.caches.keys()).not.toContain('yoga-26and2-v1');
    expect(await w.caches.keys()).toEqual(expect.arrayContaining(['yoga-26and2-v3', 'yoga-voice-v1', 'yoga-motion-v1', 'other']));
    await w.dispatch('message', { data: { type: 'precache', urls: ['/voice/current.ogg'] } }).done;
    expect(await voice.match('/voice/old.ogg')).toBeUndefined();
    expect(await voice.match('/voice/current.ogg')).toBeTruthy();
    expect(await motion.keys()).toHaveLength(0);
  });

  it('evicts obsolete entry assets when a new shell is saved', async () => {
    const w = worker();
    const cache = await w.caches.open('yoga-26and2-v2');
    await cache.put('/assets/old.js', new Response('old'));
    await w.dispatch('install').done;
    expect(await cache.match('/assets/old.js')).toBeUndefined();
    expect(await cache.match('/assets/app-abc.js')).toBeTruthy();
  });

  it('keeps the previous build assets for a page still running it', async () => {
    const w = worker();
    const cache = await w.caches.open('yoga-26and2-v2');
    const build = (tag) => new Response(`<script type="module" src="/assets/app-${tag}.js"></script>`, { headers: { 'content-type': 'text/html' } });
    const navigate = async (tag) => {
      w.fetch.mockImplementation(async (req) => {
        const url = typeof req === 'string' ? req : req.url;
        if (url.endsWith('.js')) return new Response('export default 1', { headers: { 'content-type': 'text/javascript' } });
        return build(tag);
      });
      const nav = w.dispatch('fetch', { request: w.request('/', { mode: 'navigate' }) });
      await nav.response;
      await nav.done;
    };
    await navigate('a');
    await navigate('b');
    await navigate('b');
    expect(await cache.match('/assets/app-a.js')).toBeTruthy();
    await navigate('c');
    expect(await cache.match('/assets/app-a.js')).toBeUndefined();
    expect(await cache.match('/assets/app-b.js')).toBeTruthy();
    expect(await cache.match('/assets/app-c.js')).toBeTruthy();
  });
});

describe('live client retention and slow shell refresh', () => {
  it('allows pruning only for the sole posting window', () => {
    const clients = [{ id: 'old' }, { id: 'new' }];
    expect(canPrune(clients, 'old')).toBe(false);
    expect(canPrune(clients, 'new')).toBe(false);
    expect(canPrune([clients[0]], 'new')).toBe(false);
    expect(canPrune([clients[0]], 'old')).toBe(true);
    expect(canPrune([], 'old')).toBe(false);
    expect(canPrune(clients)).toBe(false);
  });

  it('retains both windows media and lazy assets until a single-client visit', async () => {
    const w = worker();
    w.self.clients.matchAll.mockResolvedValue([{ id: 'old' }, { id: 'page' }]);
    const voice = await w.caches.open('yoga-voice-v1');
    const motion = await w.caches.open('yoga-motion-v1');
    const cache = await w.caches.open('yoga-26and2-v2');
    await voice.put('/voice/old.ogg', audio());
    await voice.put('/voice/new.ogg', audio());
    await motion.put('/motion/old.png', new Response('old'));
    await motion.put('/motion/new.png', new Response('new'));
    await cache.put('/assets/old-lazy.js', new Response('old'));
    await w.caches.open('yoga-26and2-v1');
    await w.dispatch('install').done;
    await w.dispatch('activate').done;
    expect(await w.caches.keys()).toContain('yoga-26and2-v1');
    expect(await cache.match('/assets/old-lazy.js')).toBeTruthy();
    for (const [id, version] of [['page', 'new'], ['old', 'old']]) {
      await w.dispatch('message', { source: { id }, data: { type: 'precache', urls: [`/voice/${version}.ogg`, `/motion/${version}.png`] } }).done;
    }
    for (const version of ['old', 'new']) {
      expect(await voice.match(`/voice/${version}.ogg`)).toBeTruthy();
      expect(await motion.match(`/motion/${version}.png`)).toBeTruthy();
    }
    w.self.clients.matchAll.mockResolvedValue([{ id: 'page' }]);
    await w.dispatch('message', { data: { type: 'precache', urls: ['/voice/new.ogg', '/motion/new.png'] } }).done;
    expect(await voice.match('/voice/old.ogg')).toBeUndefined();
    expect(await motion.match('/motion/old.png')).toBeUndefined();
    const nav = w.dispatch('fetch', { request: w.request('/index.html', { mode: 'navigate' }) });
    await nav.done;
    expect(await cache.match('/assets/old-lazy.js')).toBeUndefined();
  });

  it('serves the cached shell at three seconds and saves the eventual network shell', async () => {
    vi.useFakeTimers();
    const w = worker();
    const cache = await w.caches.open('yoga-26and2-v2');
    await cache.put('/index.html', shell());
    let finish;
    let signal;
    w.fetch.mockImplementationOnce((_, options) => {
      signal = options.signal;
      return new Promise((resolve) => { finish = resolve; });
    });
    const nav = w.dispatch('fetch', { request: w.request('/train', { mode: 'navigate' }) });
    await vi.advanceTimersByTimeAsync(3000);
    expect(await (await nav.response).text()).toBe(html);
    expect(signal.aborted).toBe(false);
    const updated = html + '<!-- new deployment -->';
    finish(new Response(updated, { headers: { 'content-type': 'text/html' } }));
    await nav.done;
    expect(await (await cache.match('/index.html')).text()).toBe(updated);
    expect(vi.getTimerCount()).toBe(0);
  });
});
