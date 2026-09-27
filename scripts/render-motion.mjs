// Wrapper for the Blender motion renderer so `npm run motion [pose-id ...]`
// works without remembering Blender's CLI. Set BLENDER to override the
// executable path. `npm run motion:preview <id>` renders the stage
// contact sheet (to .motion-tmp/preview-<id>.png) instead of the sprite.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

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
const script = preview ? 'scripts/blender/preview_stages.py' : 'scripts/blender/render_motion.py';
const rest = preview ? args.slice(1) : args;

const r = spawnSync(blender, ['-b', '--python', script, '--', ...rest], { stdio: 'inherit' });
process.exit(r.status ?? 1);
