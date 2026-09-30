/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const root = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');
const manifest = JSON.parse(read('public/manifest.webmanifest'));

describe('Android installation', () => {
  it('uses a distinct 512 px maskable icon with artwork inside the safe circle', () => {
    const mask = manifest.icons.find((icon: { purpose?: string }) => icon.purpose === 'maskable');
    expect(mask.src).not.toBe('/icons/icon-512.png');
    const png = readFileSync(new URL(`public${mask.src}`, root));
    expect(png.equals(readFileSync(new URL('public/icons/icon-512.png', root)))).toBe(false);
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(512);
    expect(png.readUInt32BE(20)).toBe(512);
    expect(png[24]).toBe(8);
    expect(png[25]).toBe(2); // RGB, no transparent splash corners
    const chunks: Buffer[] = [];
    for (let offset = 8; offset < png.length;) {
      const size = png.readUInt32BE(offset);
      if (png.toString('ascii', offset + 4, offset + 8) === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + size));
      offset += size + 12;
    }
    const raw = inflateSync(Buffer.concat(chunks));
    const stride = 512 * 3;
    const pixels = Buffer.alloc(512 * stride);
    const paeth = (a: number, b: number, c: number) => {
      const p = a + b - c;
      const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)];
      return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    };
    for (let y = 0; y < 512; y++) {
      const filter = raw[y * (stride + 1)];
      for (let x = 0; x < stride; x++) {
        const i = y * stride + x;
        const a = x >= 3 ? pixels[i - 3] : 0;
        const b = y ? pixels[i - stride] : 0;
        const c = y && x >= 3 ? pixels[i - stride - 3] : 0;
        const predictor = [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter];
        pixels[i] = (raw[y * (stride + 1) + 1 + x] + predictor) & 255;
      }
    }
    let artwork = 0;
    let radius = 0;
    for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
      const i = y * stride + x * 3;
      const differs = [0, 1, 2].some(c => pixels[i + c] !== pixels[c]);
      if (differs) {
        artwork++;
        radius = Math.max(radius, Math.hypot(x - 255.5, y - 255.5));
      }
    }
    expect(artwork).toBeGreaterThan(1000);
    expect(radius).toBeLessThanOrEqual(512 * 0.4);
  });

  it('allows rotation and declares both page color schemes', () => {
    expect(manifest.orientation).toBe('any');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.shortcuts.map((shortcut: { url: string }) => shortcut.url)).toEqual(['/', '/today']);
    expect(read('index.html')).toContain('<meta name="color-scheme" content="light dark"');
    const lightBackground = read('src/styles/global.css').match(/--bg:\s*(#[a-f0-9]+);/)?.[1];
    expect(manifest.background_color).toBe(lightBackground);
    expect(manifest.theme_color).toBe(lightBackground);
  });
});

describe('Android layout rules', () => {
  it('reserves fingertip targets and dynamic viewport space with safe-area padding', () => {
    const base = read('src/styles/global.css');
    const cm = read('src/views/PacerClassMode.css');
    expect(base).toMatch(/@media \(pointer: coarse\)[\s\S]*min-height: 48px/);
    expect(base).toContain('scroll-padding-top: calc(var(--nav-height) + 16px)');
    expect(cm).toContain('height: 100dvh');
    expect(cm).toContain('(orientation: landscape) and (max-height: 560px)');
    for (const side of ['top', 'right', 'bottom', 'left']) expect(cm).toContain(`env(safe-area-inset-${side})`);
  });

  it('gives the map leaves separate 48 px hit areas on touch screens', () => {
    const view = read('src/views/KnowledgeMap.tsx');
    const css = read('src/views/KnowledgeMap.css');
    const viewWidth = Number(view.match(/const W = (\d+)/)?.[1]);
    const touchWidth = Number(css.match(/@media \(pointer: coarse\)[\s\S]*min-width: (\d+)px/)?.[1]);
    const hits = [...view.matchAll(/className="km-hit"[^>]+width=\{(\d+)\} height=\{(\d+)\}/g)];
    expect(hits).toHaveLength(2);
    for (const hit of hits) {
      expect(Number(hit[1]) * touchWidth / viewWidth).toBeGreaterThanOrEqual(48);
      expect(Number(hit[2]) * touchWidth / viewWidth).toBeGreaterThanOrEqual(48);
    }
    // Adjacent postures are farther apart than either hit rectangle.
    const margin = Number(view.match(/const X0 = (\d+)/)?.[1]);
    expect((viewWidth - 2 * margin) / 25).toBeGreaterThan(Number(hits[0][1]));
  });

  it('does not author unreadably small fixed text', () => {
    for (const dir of ['src/views/', 'src/components/']) {
      for (const file of readdirSync(new URL(dir, root)).filter(name => name.endsWith('.css'))) {
        expect(read(dir + file), file).not.toMatch(/#[\da-f]{3,8}\b|rgba?\(/i);
        for (const match of read(dir + file).matchAll(/font-size:\s*([\d.]+)px/g)) {
          expect(Number(match[1]), file).toBeGreaterThanOrEqual(12);
        }
      }
    }
  });
});
