#!/usr/bin/env node
/**
 * Generates the recorded voice clips for the class sampler.
 *
 * Every string collectCueTexts() (src/pacer/cue-script.ts) can speak is
 * synthesized with piper (neural TTS) and encoded to Opus into
 * public/voice/, then src/pacer/voiceclips.ts is regenerated to map each
 * exact text to its clip URL. Reruns are incremental: clips whose file
 * already exists are skipped, stale clips are pruned.
 *
 * Requirements (nothing is installed by this script except the voice model):
 *   - piper CLI          (`pip install --user piper-tts`) — override with $PIPER
 *   - ffmpeg with libopus — override with $FFMPEG; also probes the
 *     imageio-ffmpeg static binary (`pip install --user imageio-ffmpeg`).
 *     Without ffmpeg it falls back to shipping raw WAVs (~15x larger).
 *   - voice model: $PIPER_VOICE (path to a .onnx, with its .onnx.json
 *     beside it) or it is downloaded once to ~/.cache/piper-voices/.
 *
 * Fails hard (nonzero exit, manifest untouched) if any clip cannot be made.
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'voice');
const MANIFEST = path.join(ROOT, 'src', 'pacer', 'voiceclips.ts');

const VOICE_NAME = 'en_US-lessac-medium';
const VOICE_URL_BASE =
  'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/';
/** ~8% slower than the model default — a calm instructor's pace. */
const LENGTH_SCALE = '1.08';
const SENTENCE_SILENCE = '0.3';

function fail(msg) {
  console.error(`generate-voice: ${msg}`);
  process.exit(1);
}

function onPath(cmd) {
  const r = spawnSync('which', [cmd], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function resolvePiper() {
  if (process.env.PIPER) return process.env.PIPER;
  const found = onPath('piper') ?? path.join(homedir(), '.local', 'bin', 'piper');
  if (!existsSync(found)) {
    fail('piper not found — `pip install --user piper-tts` or set $PIPER');
  }
  return found;
}

function resolveFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  const found = onPath('ffmpeg');
  if (found) return found;
  const probe = spawnSync(
    'python3',
    ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],
    { encoding: 'utf8' },
  );
  if (probe.status === 0) return probe.stdout.trim();
  return null; // WAV fallback
}

async function resolveVoiceModel() {
  if (process.env.PIPER_VOICE) {
    const model = process.env.PIPER_VOICE;
    if (!existsSync(model) || !existsSync(`${model}.json`)) {
      fail(`$PIPER_VOICE (${model}) or its .json config is missing`);
    }
    return model;
  }
  const cacheDir = path.join(homedir(), '.cache', 'piper-voices');
  const model = path.join(cacheDir, `${VOICE_NAME}.onnx`);
  for (const file of [`${model}.json`, model]) {
    if (existsSync(file)) continue;
    mkdirSync(cacheDir, { recursive: true });
    const url = VOICE_URL_BASE + path.basename(file);
    console.log(`downloading ${url}`);
    const res = await fetch(url);
    if (!res.ok) fail(`voice model download failed: ${res.status} ${url}`);
    const tmp = `${file}.download`;
    await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp));
    renameSync(tmp, file);
  }
  return model;
}

async function collectTexts() {
  const { createServer } = await import('vite');
  const server = await createServer({
    root: ROOT,
    server: { middlewareMode: true },
    logLevel: 'silent',
  });
  try {
    const { collectCueTexts } = await server.ssrLoadModule('/src/pacer/cue-script.ts');
    return collectCueTexts();
  } finally {
    await server.close();
  }
}

function synthesizeWav(piper, model, text, wavPath) {
  const r = spawnSync(
    piper,
    [
      '--model', model,
      '--output-file', wavPath,
      '--length-scale', LENGTH_SCALE,
      '--sentence-silence', SENTENCE_SILENCE,
    ],
    { input: text.replace(/\s+/g, ' ').trim(), encoding: 'utf8' },
  );
  if (r.status !== 0 || !existsSync(wavPath) || statSync(wavPath).size < 1024) {
    fail(`piper failed for "${text}"\n${r.stderr ?? ''}`);
  }
}

function encodeOgg(ffmpeg, wavPath, oggPath) {
  const r = spawnSync(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', wavPath,
    '-c:a', 'libopus', '-b:a', '24k', '-ac', '1', '-ar', '24000',
    oggPath,
  ]);
  if (r.status !== 0 || !existsSync(oggPath) || statSync(oggPath).size === 0) {
    fail(`ffmpeg failed for ${wavPath}\n${r.stderr ?? ''}`);
  }
}

const piper = resolvePiper();
const ffmpeg = resolveFfmpeg();
const ext = ffmpeg ? 'ogg' : 'wav';
if (!ffmpeg) {
  console.warn('ffmpeg not found — shipping raw WAVs (~15x larger than Opus)');
}
const model = await resolveVoiceModel();
const texts = await collectTexts();
if (texts.length === 0) fail('collectCueTexts() returned no texts');

mkdirSync(OUT_DIR, { recursive: true });
const workDir = path.join(tmpdir(), `generate-voice-${process.pid}`);
mkdirSync(workDir, { recursive: true });

let made = 0;
const entries = [];
try {
  for (const text of [...texts].sort()) {
    const name = createHash('sha256').update(text).digest('hex').slice(0, 12);
    const outFile = path.join(OUT_DIR, `${name}.${ext}`);
    entries.push([text, `/voice/${name}.${ext}`]);
    if (existsSync(outFile)) continue; // incremental rerun

    const wavPath = path.join(workDir, `${name}.wav`);
    synthesizeWav(piper, model, text, wavPath);
    // Build in the temp dir, then move into place, so an interrupted run
    // never leaves a half-written clip that a rerun would skip as done.
    if (ffmpeg) {
      const oggPath = path.join(workDir, `${name}.ogg`);
      encodeOgg(ffmpeg, wavPath, oggPath);
      renameSync(oggPath, outFile);
    } else {
      renameSync(wavPath, outFile);
    }
    made++;
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

// Prune clips no longer referenced (texts changed or renamed).
const wanted = new Set(entries.map(([, url]) => path.basename(url)));
for (const file of readdirSync(OUT_DIR)) {
  if (/^[0-9a-f]{12}\.(ogg|wav)$/.test(file) && !wanted.has(file)) {
    rmSync(path.join(OUT_DIR, file));
    console.log(`pruned stale clip ${file}`);
  }
}

const manifest = [
  '/**',
  ' * GENERATED FILE — do not edit by hand.',
  ' * Regenerate with: node scripts/generate-voice.mjs',
  ' * Maps every spoken cue text (see cue-script.ts) to its recorded clip.',
  ' */',
  'export const voiceClips: Record<string, string> = {',
  ...entries.map(([text, url]) => `  ${JSON.stringify(text)}: ${JSON.stringify(url)},`),
  '};',
  '',
].join('\n');
writeFileSync(MANIFEST, manifest);

const total = entries.reduce(
  (sum, [, url]) => sum + statSync(path.join(OUT_DIR, path.basename(url))).size,
  0,
);
console.log(
  `${entries.length} clips (${made} newly synthesized), ` +
    `${(total / 1024).toFixed(0)} KiB in public/voice/, voice ${VOICE_NAME}`,
);
