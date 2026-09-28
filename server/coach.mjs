#!/usr/bin/env node
/**
 * The coach: a tiny local proxy between the app's post-class debrief and
 * DeepSeek, which also keeps the transcript. Runs beside `npm run dev`
 * (`npm run coach`); Vite proxies `/api/*` here.
 *
 *   POST /api/coach      { messages: [{role, content}], date?: 'YYYY-MM-DD', note?: string }
 *                        → { content }   (the assistant's reply)
 *   GET  /api/coach/log  → { days: ['2026-09-27', …] }
 *
 * Every exchange is appended to journal/<date>.md so the conversation is
 * in the repo, readable by anyone (or any agent) planning the next class.
 * The system prompt is long and mostly the app's own posture data, so
 * the log keeps a hash and the non-data head of it instead of repeating
 * it. The API key is read from .env.local (DEEPSEEK_API_KEY), which git
 * ignores. No dependencies.
 */
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JOURNAL = path.join(ROOT, 'journal');
const PORT = Number(process.env.COACH_PORT || 8787);
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const ENDPOINT = 'https://api.deepseek.com/chat/completions';

function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const p = path.join(ROOT, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();
const KEY = process.env.DEEPSEEK_API_KEY;
if (!KEY) {
  console.error('coach: DEEPSEEK_API_KEY is not set (put it in .env.local)');
  process.exit(1);
}

function today() {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

function stamp() {
  return new Date().toTimeString().slice(0, 5);
}

/** Append one exchange to the day's journal page. */
function log(date, system, user, assistant, note) {
  mkdirSync(JOURNAL, { recursive: true });
  const file = path.join(JOURNAL, `${date}.md`);
  const fresh = !existsSync(file);
  let out = '';
  if (fresh) {
    out += `# Coach debrief — ${date}\n\n`;
  }
  if (system) {
    const hash = createHash('sha1').update(system).digest('hex').slice(0, 8);
    const head = system.split('\n').slice(0, 12).join('\n');
    out += `<details><summary>System prompt ${hash} (head)</summary>\n\n\`\`\`\n${head}\n\`\`\`\n\n</details>\n\n`;
  }
  if (note) out += `> ${note}\n\n`;
  out += `## ${stamp()} · you\n\n${user.trim()}\n\n## ${stamp()} · coach\n\n${assistant.trim()}\n\n`;
  appendFileSync(file, out, 'utf8');
}

async function ask(messages) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.7, max_tokens: 2000 }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`DeepSeek ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 2_000_000) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

const send = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(body));
};

createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'content-type',
        'access-control-allow-methods': 'GET,POST',
      });
      return res.end();
    }
    if (req.method === 'GET' && req.url === '/api/coach/log') {
      const days = existsSync(JOURNAL)
        ? readdirSync(JOURNAL).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).map((f) => f.slice(0, 10)).sort()
        : [];
      return send(res, 200, { days });
    }
    if (req.method === 'POST' && req.url === '/api/coach') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const messages = Array.isArray(body.messages) ? body.messages : [];
      if (!messages.length) return send(res, 400, { error: 'messages required' });
      const content = await ask(messages);
      const system = messages.find((m) => m.role === 'system')?.content;
      const user = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
      const firstTurn = messages.filter((m) => m.role === 'user').length === 1;
      log(body.date || today(), firstTurn ? system : undefined, user, content, body.note);
      return send(res, 200, { content });
    }
    send(res, 404, { error: 'not found' });
  } catch (e) {
    console.error('coach:', e.message);
    send(res, 500, { error: e.message });
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`coach: listening on http://127.0.0.1:${PORT} (model ${MODEL}); transcripts → journal/`);
});
