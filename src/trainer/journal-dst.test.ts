/// <reference types="node" />
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, it } from 'vitest';

it('counts calendar days across both New York DST transitions', () => {
  const moduleUrl = pathToFileURL(resolve('src/trainer/journal.ts')).href;
  const result = execFileSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', `
    import { practiceStreak, daysSince } from ${JSON.stringify(moduleUrl)};
    const cases = [[2, 8, 0, 30], [10, 1, 23, 30]];
    console.log(JSON.stringify(cases.map(([month, day, hour, minute]) => {
      const practiced = new Date(2026, month, day, 12).getTime();
      const now = new Date(2026, month, day + 1, hour, minute).getTime();
      const key = month === 2 ? '2026-03-08' : '2026-11-01';
      return [new Date(practiced).getTimezoneOffset(), practiceStreak({ days: [key] }, now), daysSince(practiced, now)];
    })));
  `], { env: { ...process.env, TZ: 'America/New_York' }, encoding: 'utf8' });
  expect(JSON.parse(result)).toEqual([[240, 1, 1], [300, 1, 1]]);
});
