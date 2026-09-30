// The posture library's Python helpers, run from `npm test`: `_selftest.py`
// tests `knee_on` and checks that the cross-language clash fixture
// (src/rig/clearance-fixtures/clashes-from-python.json, which
// src/data/library/library.test.ts holds src/rig/clearance.ts to) is what
// the Python port `_hull.py` computes today. Plain JS: it needs Node's
// child_process, which the app's TypeScript config does not type.
import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';

it('passes the library Python helpers’ self-test (knee_on; the clash fixture is current)', () => {
  const r = spawnSync('python', ['scripts/blender/library/_selftest.py'], { encoding: 'utf-8' });
  expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
}, 120_000);
