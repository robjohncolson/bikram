/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { STUDY } from './features';

it('has no trainer shortcut while Study is hidden', () => {
  const manifest = JSON.parse(readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));
  if (!STUDY) {
    for (const shortcut of manifest.shortcuts) {
      expect(new URL(shortcut.url, 'https://example.test').pathname).not.toMatch(/^\/train(?:\/|$)/);
    }
  }
});
