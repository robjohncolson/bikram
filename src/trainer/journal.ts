/**
 * The practice journal: what was actually practiced, when. Classes paced
 * by the pacer are recorded here; trainer sessions touch the day. Its
 * own versioned localStorage key, sanitized on load like the trainer
 * store. Pure functions over (journal, now) — callers persist.
 */

export const JOURNAL_KEY = 'yoga-journal-v1';
/** Keep the most recent classes only — enough for a long streak, not a database. */
const MAX_CLASSES = 400;
const DAY_MS = 86_400_000;

export interface ClassRecord {
  startedAt: number;
  endedAt: number;
  /** postures paced, by sequence order (1-based, inclusive) */
  fromOrder: number;
  toOrder: number;
  pacedSeconds: number;
  bpm: number;
  rehearsed: boolean;
  /** rehearsal debrief, once saved */
  handoffs?: number;
  recalled?: number;
}

export interface Journal {
  version: 1;
  classes: ClassRecord[];
  /** local calendar days with any practice, 'YYYY-MM-DD', unique, sorted */
  days: string[];
}

export function emptyJournal(): Journal {
  return { version: 1, classes: [], days: [] };
}

/** Local calendar day for a timestamp. */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function sanitize(data: unknown): Journal | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Partial<Journal>;
  if (d.version !== 1) return null;
  const j = emptyJournal();
  for (const c of Array.isArray(d.classes) ? d.classes : []) {
    if (!c || typeof c !== 'object') continue;
    const r = c as Partial<ClassRecord>;
    if (!isNum(r.startedAt) || !isNum(r.endedAt) || !isNum(r.fromOrder) || !isNum(r.toOrder)) continue;
    j.classes.push({
      startedAt: r.startedAt,
      endedAt: r.endedAt,
      fromOrder: Math.floor(r.fromOrder),
      toOrder: Math.floor(r.toOrder),
      pacedSeconds: isNum(r.pacedSeconds) ? Math.max(0, r.pacedSeconds) : 0,
      bpm: isNum(r.bpm) ? r.bpm : 60,
      rehearsed: r.rehearsed === true,
      ...(isNum(r.handoffs) ? { handoffs: Math.floor(r.handoffs) } : {}),
      ...(isNum(r.recalled) ? { recalled: Math.floor(r.recalled) } : {}),
    });
  }
  j.classes = j.classes.slice(-MAX_CLASSES);
  const days = new Set<string>();
  for (const k of Array.isArray(d.days) ? d.days : []) if (typeof k === 'string' && DAY_RE.test(k)) days.add(k);
  for (const c of j.classes) days.add(dayKey(c.endedAt));
  j.days = [...days].sort();
  return j;
}

export function loadJournal(): Journal {
  try {
    const raw = window.localStorage.getItem(JOURNAL_KEY);
    if (raw) {
      const j = sanitize(JSON.parse(raw));
      if (j) return j;
    }
  } catch {
    /* unreadable — start fresh */
  }
  return emptyJournal();
}

export function saveJournal(j: Journal): void {
  try {
    window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(j));
  } catch {
    /* storage unavailable — practice without a journal */
  }
}

/** Mark a local day as practiced; returns true when the journal changed. */
export function touchPracticeDay(j: Journal, now: number): boolean {
  const key = dayKey(now);
  if (j.days.includes(key)) return false;
  j.days = [...j.days, key].sort();
  return true;
}

/** Append a paced class (and its day), keeping the journal bounded. */
export function recordClass(j: Journal, rec: ClassRecord): void {
  j.classes = [...j.classes, rec].slice(-MAX_CLASSES);
  touchPracticeDay(j, rec.endedAt);
}

/** Patch the most recent class — the rehearsal debrief lands after the record. */
export function amendLastClass(j: Journal, patch: Partial<ClassRecord>): boolean {
  const last = j.classes[j.classes.length - 1];
  if (!last) return false;
  j.classes[j.classes.length - 1] = { ...last, ...patch };
  return true;
}

export function lastClass(j: Journal): ClassRecord | undefined {
  return j.classes[j.classes.length - 1];
}

/** Whole local days between a timestamp and now (0 = today). */
export function daysSince(ts: number, now: number): number {
  const a = new Date(ts);
  const b = new Date(now);
  const startA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const startB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.max(0, Math.round((startB - startA) / DAY_MS));
}

/**
 * Consecutive practice days ending today or yesterday (a streak survives
 * until a full day is skipped). Zero when neither day was practiced.
 */
export function practiceStreak(j: Journal, now: number): number {
  const days = new Set(j.days);
  let cursor = now;
  if (!days.has(dayKey(cursor))) {
    cursor -= DAY_MS;
    if (!days.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor -= DAY_MS;
  }
  return streak;
}

/** Classes finished within the last `days` local days (today counts). */
export function classesInLast(j: Journal, days: number, now: number): number {
  return j.classes.filter((c) => daysSince(c.endedAt, now) < days).length;
}
