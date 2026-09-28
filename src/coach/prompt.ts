/**
 * The coach's system prompt: everything the app knows, in plain text, so
 * the model can reason about a next class the way a teacher would. Pure —
 * the caller passes the live journal, mastery and tonight's program.
 */
import { chakras, muscles, poses } from '../data';
import type { Pose } from '../data';
import type { ClassProgram } from '../pacer';
import { programMinutes } from '../pacer';
import type { ClassRecord, Journal, TrainerStore } from '../trainer';
import { band, nodeP } from '../trainer';

export interface CoachContext {
  journal: Journal;
  store: TrainerStore;
  /** the program just practised */
  program: ClassProgram;
  /** the class record just written, when there is one */
  last?: ClassRecord;
  now: number;
}

/** The shape the coach must answer a proposal in. */
export const PROPOSAL_FORMAT = `When you propose a class, put it in ONE fenced json block exactly like this, after your prose:

\`\`\`json
{
  "name": "Hips and a calm finish",
  "blurb": "one calm sentence for the picker",
  "items": [ { "order": 1, "sets": 1 }, { "order": 2 }, { "order": 13 }, { "order": 26, "sets": 1 } ],
  "reasons": { "2": "why this posture is here", "13": "…" }
}
\`\`\`

Rules the app enforces (a proposal that breaks one is rejected and you will be asked again):
- "order" is the posture's sequence number 1–26; items must be in ascending order, no repeats.
- Posture 1 (Standing Deep Breathing) opens every class and posture 26 (Blowing in Firm) closes it.
- Posture 13 (Savasana) normally opens the floor series (14–25); leave it out only for a short class, as the built-in short class does — every floor posture already carries its own short savasana between sets.
- "sets": 1 means first set only; omit it for both sets. Postures with one set ignore it.
- Keep the class between 12 and 75 minutes at the practitioner's tempo.
- Respect the cautions of every posture you include against what the practitioner told you.`;

function poseLine(p: Pose): string {
  const ch = p.chakras.map((c) => c.id).join(', ');
  const strengthens = p.muscles.filter((m) => m.action === 'strengthens').map((m) => m.id).join(', ') || '—';
  const stretches = p.muscles.filter((m) => m.action === 'stretches').map((m) => m.id).join(', ') || '—';
  const cautions = p.contraindications.length ? p.contraindications.join(' | ') : 'none listed';
  return [
    `#${p.order} ${p.englishName} (${p.sanskritName}) — ${p.category}, ${p.sets} set(s), ${p.timing}, ≈${Math.round(
      p.approxTotalSeconds / 60,
    )} min`,
    `  summary: ${p.summary}`,
    `  chakras: ${ch}`,
    `  strengthens: ${strengthens}`,
    `  stretches: ${stretches}`,
    `  benefits: ${p.benefits.slice(0, 3).join(' | ')}`,
    `  cautions: ${cautions}`,
  ].join('\n');
}

function journalLines(j: Journal, now: number): string {
  const recent = j.classes.slice(-12);
  if (recent.length === 0) return 'No paced classes recorded yet.';
  return recent
    .map((c) => {
      const d = new Date(c.startedAt).toISOString().slice(0, 10);
      const ago = Math.round((now - c.endedAt) / 86_400_000);
      return `${d} (${ago} d ago): program ${c.program ?? 'full'}, postures ${c.fromOrder}–${c.toOrder}, ${Math.round(
        c.pacedSeconds / 60,
      )} min at ${c.bpm} BPM${c.rehearsed ? ', rehearsed' : ''}`;
    })
    .join('\n');
}

function masteryLines(store: TrainerStore, now: number): string {
  if (Object.keys(store.kcs).length === 0) return 'No memory-trainer data yet.';
  const rows = poses.map((p) => `#${p.order} ${p.id}: ${band(nodeP(store, `id:${p.id}`, now))}`);
  return rows.join('; ');
}

/** The whole system prompt for one debrief. */
export function buildSystemPrompt(ctx: CoachContext): string {
  const tonight = ctx.program.items
    .map((it) => `#${it.order}${it.sets === 1 ? ' (first set)' : ''}`)
    .join(', ');
  return [
    'You are the coach for a 26 & 2 hot yoga practice (the Bikram sequence: 24 postures and 2 breathing exercises). You talk with one practitioner right after a class. Be warm, brief and concrete — a calm teacher, not a chatbot. Second person. Never quote the copyrighted studio dialogue; use your own words. Energetic or traditional claims are "traditionally said to".',
    '',
    'Your job in this conversation: (1) ask what felt tight, weak, shaky or good, and what they want more or less of — two or three short questions at most, one at a time; (2) then propose the NEXT class as a program of postures from the sequence, in sequence order, using the data below to target what they told you (muscle groups, chakras, cautions); (3) explain each pick in one line. If they ask for changes, revise.',
    '',
    PROPOSAL_FORMAT,
    '',
    `Tonight's class (${ctx.program.name}, ≈${programMinutes(ctx.program)} min): ${tonight}`,
    ctx.last
      ? `It ran ${Math.round(ctx.last.pacedSeconds / 60)} min of paced breathing at ${ctx.last.bpm} BPM${
          ctx.last.rehearsed ? ', in rehearsal mode' : ''
        }.`
      : '',
    '',
    '== Recent practice journal ==',
    journalLines(ctx.journal, ctx.now),
    '',
    '== Memory trainer: how well each posture is known (unseen / shaky / developing / solid) ==',
    masteryLines(ctx.store, ctx.now),
    '',
    '== Chakras ==',
    chakras.map((c) => `${c.id}: ${c.englishName} (${c.sanskritName}), ${c.location}, element ${c.element}`).join('\n'),
    '',
    '== Muscle groups ==',
    muscles.map((m) => `${m.id}: ${m.name}${m.anatomicalName ? ` (${m.anatomicalName})` : ''}, ${m.region}`).join('\n'),
    '',
    '== The 26 postures ==',
    poses.map(poseLine).join('\n'),
  ].join('\n');
}

/** The line that opens the debrief, spoken by the practitioner's app on their behalf. */
export const OPENING_LINE =
  'The class just ended. Ask me what you need to know — one question at a time — and then propose my next class.';
