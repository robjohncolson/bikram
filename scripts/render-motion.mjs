// Wrapper for the Blender motion renderer so `npm run motion [pose-id ...]`
// works without remembering Blender's CLI. Set BLENDER to override the
// executable path. `npm run motion:preview <id>` renders the stage
// contact sheet (to .motion-tmp/preview-<id>.png) instead of the sprite.
//
// A full render fans out one Blender per posture (up to MOTION_JOBS at
// once); each worker writes its manifest entry as a JSON sidecar and one
// final merge pass writes src/data/motion/manifest.ts. The renderer runs
// Cycles on the CPU (see render_motion.py), so workers scale with cores;
// three at a time is the default (each frame's setup and Freestyle pass is
// single-threaded, the sampling is not). MOTION_ENGINE=EEVEE puts the GPU
// back, and then one worker at a time is the honest setting.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTURES = path.join(ROOT, 'scripts', 'blender', 'postures');

const candidates = [
  process.env.BLENDER,
  'C:/Tools/blender-5.2.1-windows-x64/blender.exe',
  'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe',
  '/Applications/Blender.app/Contents/MacOS/Blender',
  'blender',
].filter(Boolean);
const blender = candidates.find((c) => c === 'blender' || existsSync(c));

const args = process.argv.slice(2);
const preview = args[0] === '--preview';

if (preview) {
  const r = spawnSync(blender, ['-b', '--python', 'scripts/blender/preview_stages.py', '--', ...args.slice(1)], {
    stdio: 'inherit',
    cwd: ROOT,
  });
  process.exit(r.status ?? 1);
}

const all = readdirSync(POSTURES)
  .filter((f) => f.endsWith('.py') && !f.startsWith('_'))
  .map((f) => f.slice(0, -3).replace(/_/g, '-'))
  .sort();
const ids = args.length ? args.map((a) => a.replace(/_/g, '-')) : all;
const unknown = ids.filter((id) => !all.includes(id));
if (unknown.length) {
  console.error(`render-motion: no posture module for ${unknown.join(', ')}`);
  process.exit(1);
}
const defaultJobs = (process.env.MOTION_ENGINE || 'CYCLES').toUpperCase() === 'EEVEE' ? 1 : 3;
const jobs = Math.max(1, Math.min(ids.length, Number(process.env.MOTION_JOBS) || defaultJobs));
console.log(`render-motion: ${ids.length} posture(s), ${jobs} at a time`);

function runOne(id) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn(blender, ['-b', '--python', 'scripts/blender/render_motion.py', '--', '--entry-only', id], {
      cwd: ROOT,
    });
    let tail = '';
    const keep = (chunk) => {
      tail = (tail + chunk.toString()).split('\n').slice(-30).join('\n');
    };
    child.stdout.on('data', keep);
    child.stderr.on('data', keep);
    child.on('close', (code) => {
      const secs = ((Date.now() - t0) / 1000).toFixed(0);
      if (code === 0) console.log(`  ✓ ${id} (${secs}s)`);
      else console.error(`  ✗ ${id} exited ${code} after ${secs}s\n${tail}`);
      resolve(code === 0);
    });
  });
}

const queue = [...ids];
const results = await Promise.all(
  Array.from({ length: jobs }, async () => {
    const done = [];
    while (queue.length) done.push(await runOne(queue.shift()));
    return done;
  }),
);
const failed = results.flat().filter((ok) => !ok).length;

const merge = spawnSync(blender, ['-b', '--python', 'scripts/blender/render_motion.py', '--', '--merge'], {
  stdio: 'inherit',
  cwd: ROOT,
});
process.exit(failed || (merge.status ?? 1) ? 1 : 0);
