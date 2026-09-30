/* Shared with node tests; classic workers load this with importScripts. */
(() => {
  function shellAssets(html, base) {
    const urls = new Set();
    for (const tag of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
      const value = /\b(?:src|href)\s*=\s*["']([^"']+)["']/i.exec(tag[0]);
      if (!value) continue;
      const url = new URL(value[1], base);
      if (url.origin === new URL(base).origin && url.pathname.startsWith('/assets/')) urls.add(url.href);
    }
    return [...urls];
  }

  function staleUrls(cached, wanted, base) {
    const keep = new Set(wanted.map((url) => new URL(url, base).href));
    return cached.filter((url) => !keep.has(new URL(url, base).href));
  }

  function canPrune(clients, postingClientId) {
    return postingClientId === undefined
      ? clients.length <= 1
      : clients.length === 1 && clients[0].id === postingClientId;
  }

  function bundledAssets(source, base) {
    const urls = new Set();
    for (const match of source.matchAll(/["']((?:\.\/|\/)?assets\/[^"']+\.(?:js|css)|\.\/[^"']+\.(?:js|css))["']/g)) {
      const path = match[1];
      const url = new URL(path.startsWith('assets/') ? '/' + path : path, base);
      if (url.origin === new URL(base).origin && url.pathname.startsWith('/assets/')) urls.add(url.href);
    }
    return [...urls];
  }

  function oldCaches(names, current) {
    const version = /^yoga-26and2-v(\d+)$/.exec(current);
    return names.filter((name) => {
      const match = /^yoga-26and2-v(\d+)$/.exec(name);
      return match && Number(match[1]) < Number(version[1]);
    });
  }

  async function rangeResponse(response, range) {
    const body = await response.arrayBuffer();
    const size = body.byteLength;
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    let start = NaN, end = NaN;
    if (match && (match[1] || match[2])) {
      start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    }
    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    headers.set('Accept-Ranges', 'bytes');
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
      headers.set('Content-Range', `bytes */${size}`);
      headers.set('Content-Length', '0');
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(body.slice(start, end + 1), { status: 206, headers });
  }

  globalThis.swLib = { shellAssets, bundledAssets, staleUrls, canPrune, oldCaches, rangeResponse };
})();
