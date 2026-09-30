/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { chakras } from '../data';

const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8');
const classMode = readFileSync(new URL('../views/PacerClassMode.css', import.meta.url), 'utf8');
const explorer = readFileSync(new URL('../views/Explorer.css', import.meta.url), 'utf8');

type RGB = [number, number, number];
const tokens = (source: string): Record<string, string> => Object.fromEntries(
  [...source.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
);
const roots = [...css.matchAll(/:root\s*\{([^}]+)\}/g)];
const light = tokens(roots[0][1]);
const themes = { light, dark: { ...light, ...tokens(roots[1][1]) } };
const mix = (front: RGB, back: RGB, alpha: number): RGB =>
  front.map((v, i) => v * alpha + back[i] * (1 - alpha)) as RGB;

function color(value: string, theme: Record<string, string>, background: RGB): RGB {
  const variable = /^var\((--[\w-]+)\)$/.exec(value);
  if (variable) return color(theme[variable[1]], theme, background);
  if (/^#[\da-f]{6}$/i.test(value)) {
    return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as RGB;
  }
  const rgba = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(value);
  if (rgba) return mix(rgba.slice(1, 4).map(Number) as RGB, background, Number(rgba[4]));
  throw new Error(`Unsupported color: ${value}`);
}

function contrast(a: RGB, b: RGB): number {
  const luminance = (rgb: RGB) => rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
}

for (const [name, theme] of Object.entries(themes)) {
  const rgb = (value: string, background: RGB = [0, 0, 0]) => color(value, theme, background);
  describe(`${name} text contrast`, () => {
    for (const surface of ['--bg', '--bg-raised', '--bg-sunken', '--ember-soft']) {
      for (const text of ['--text', '--text-soft', '--text-faint', '--ember-text', '--strengthens', '--stretches']) {
        it(`${text} on ${surface} meets AA for normal text`, () => {
          expect(contrast(rgb(theme[text]), rgb(theme[surface]))).toBeGreaterThanOrEqual(4.5);
        });
      }
    }

    it('pill labels stay readable over every chakra and semantic tint', () => {
      const pill = /\.pill\s*\{([^}]+)\}/.exec(css)![1];
      const text = /(?:^|;)\s*color:\s*([^;]+);/.exec(pill)![1];
      const alpha = Number(/var\(--pill\) (\d+)%/.exec(pill)![1]) / 100;
      for (const accent of [...chakras.map((c) => c.color), theme['--ember'], theme['--strengthens'], theme['--stretches']]) {
        for (const surface of ['--bg', '--bg-raised', '--bg-sunken']) {
          const background = mix(rgb(accent), rgb(theme[surface]), alpha);
          expect(contrast(color(text, { ...theme, '--pill': accent }, background), background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    it('selected chakra counts use readable text, retaining the colored border', () => {
      const rule = /\.ex-chakra\.is-active \.ex-chakra-count\s*\{([^}]+)\}/.exec(explorer)![1];
      const text = /(?:^|;)\s*color:\s*([^;]+);/.exec(rule)![1];
      expect(contrast(rgb(text), rgb(theme['--bg']))).toBeGreaterThanOrEqual(4.5);
    });

    it('class-mode text meets AA at both gradient endpoints', () => {
      const cm = { ...theme, ...tokens(/\.cm\s*\{([^}]+)\}/.exec(classMode)![1]) };
      for (const surface of ['--cm-bg', '--cm-bg-top']) {
        const background = color(cm[surface], cm, [0, 0, 0]);
        for (const text of ['--cm-text', '--cm-soft', '--cm-faint', '--cm-ember']) {
          expect(contrast(color(cm[text], cm, background), background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  });
}
