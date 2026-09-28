/**
 * Reading a proposed class out of the coach's reply and checking it
 * against the rules a real class has to keep. The model proposes, the
 * code decides. Pure; unit-tested.
 */
import { poses } from '../data';
import type { ClassProgram, ProgramItem } from '../pacer';
import { classMinutes as programMinutes } from '../pacer';

export const COACH_PROGRAM_ID = 'coach';
export const MIN_MINUTES = 12;
export const MAX_MINUTES = 95;

export interface Proposal {
  program: ClassProgram;
  reasons: Record<string, string>;
  minutes: number;
}

export type ProposalResult = { ok: true; proposal: Proposal } | { ok: false; errors: string[] } | { ok: false; none: true };

/** The first fenced json block in a reply, parsed; undefined when none. */
export function extractJson(text: string): unknown | undefined {
  const m = /```json\s*([\s\S]*?)```/i.exec(text) ?? /```\s*(\{[\s\S]*?\})\s*```/.exec(text);
  if (!m) return undefined;
  try {
    return JSON.parse(m[1]);
  } catch {
    return undefined;
  }
}

/** Validate a parsed proposal; the errors read as instructions back to the coach. */
export function validateProposal(raw: unknown, beatsPerBar = 6): ProposalResult {
  if (raw === undefined) return { ok: false, none: true };
  const errors: string[] = [];
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const itemsRaw = Array.isArray(obj.items) ? obj.items : [];
  if (itemsRaw.length === 0) errors.push('"items" must be a non-empty array of { order, sets? }.');
  const items: ProgramItem[] = [];
  const known = new Set(poses.map((p) => p.order));
  let prev = 0;
  for (const it of itemsRaw) {
    const o = it && typeof it === 'object' ? (it as Record<string, unknown>) : {};
    const order = Number(o.order);
    if (!Number.isInteger(order) || !known.has(order)) {
      errors.push(`"order" ${String(o.order)} is not a posture number 1–26.`);
      continue;
    }
    if (order <= prev) errors.push(`posture ${order} is out of sequence order (after ${prev}).`);
    prev = order;
    const sets = o.sets === undefined ? undefined : Number(o.sets);
    if (sets !== undefined && sets !== 1 && sets !== 2) errors.push(`posture ${order}: "sets" must be 1 or 2, or omitted.`);
    items.push(sets === 1 ? { order, sets: 1 } : { order });
  }
  const orders = items.map((i) => i.order);
  if (orders.length && orders[0] !== 1) errors.push('the class must open with posture 1 (Standing Deep Breathing).');
  if (orders.length && orders[orders.length - 1] !== 26) errors.push('the class must close with posture 26 (Blowing in Firm).');
  const name = typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim().slice(0, 60) : "Coach's build";
  const blurb =
    typeof obj.blurb === 'string' && obj.blurb.trim() ? obj.blurb.trim().slice(0, 160) : 'Proposed by the coach after your last class.';
  const reasons: Record<string, string> = {};
  if (obj.reasons && typeof obj.reasons === 'object') {
    for (const [k, v] of Object.entries(obj.reasons as Record<string, unknown>)) {
      if (typeof v === 'string') reasons[k] = v.slice(0, 200);
    }
  }
  const program: ClassProgram = { id: COACH_PROGRAM_ID, name, blurb, items };
  const minutes = items.length ? programMinutes(program, 60, beatsPerBar) : 0;
  if (items.length && (minutes < MIN_MINUTES || minutes > MAX_MINUTES)) {
    errors.push(`the class runs ${minutes} minutes; keep it between ${MIN_MINUTES} and ${MAX_MINUTES}.`);
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, proposal: { program, reasons, minutes } };
}

/** Parse and validate a reply in one go. */
export function readProposal(reply: string, beatsPerBar = 6): ProposalResult {
  return validateProposal(extractJson(reply), beatsPerBar);
}

const STORAGE_KEY = 'yoga-coach-program-v1';

/** The adopted coach program, if one was saved. */
export function loadCoachProgram(): ClassProgram | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const r = validateProposal(JSON.parse(raw));
    return r.ok ? r.proposal.program : undefined;
  } catch {
    return undefined;
  }
}

export function saveCoachProgram(p: ClassProgram): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: p.name, blurb: p.blurb, items: p.items }));
  } catch {
    /* storage blocked: the build lives for this session only */
  }
}
