/**
 * The posture LIBRARY's access layer — the wider classical repertoire, a
 * second collection beside the 26 & 2 and never mixed into it. Views import
 * only from here (and the rig loaders from `data/index.ts`).
 *
 * Each entry is our own `LibraryAsana` (one file per posture) joined with
 * its facts from `classical/illustrated-index.json` by id — the Sanskrit
 * name, pages, photograph numbers, grade and roots are never duplicated.
 *
 * The posture files are DISCOVERED: every `./*.ts` here except this index,
 * the shared notes (`common.ts`, `common-<family>.ts`) and the tests is
 * loaded, and every export that is a `LibraryAsana` is an entry, ordered by
 * the book's own numbering. Adding a posture is two new files (its content
 * here, its rig module in `scripts/blender/library/`) and nothing shared.
 * Sutra ids resolve against `classical/sutras-index.json` (transliteration
 * and our topic label). Both JSON files land in the library's own chunk:
 * the routes are lazy, so the 26 & 2 never loads them.
 */
import illustrated from '../classical/illustrated-index.json';
import sutras from '../classical/sutras-index.json';
import { getPose } from '../index';
import type { LibraryAsana, LibraryFamily, NoticeRegion } from '../types';

/** The fixed `notice` vocabulary (the Blender helper's NOTICE, in the same order). */
export const NOTICE_REGIONS: readonly NoticeRegion[] = [
  'neck',
  'shoulders',
  'upper-back',
  'lower-back',
  'core',
  'hips',
  'hamstrings',
  'quads',
  'calves',
  'feet',
  'wrists',
  'breath',
];

/** A region's chip label ("upper-back" → "upper back"). */
export const noticeLabel = (r: NoticeRegion): string => r.replace('-', ' ');

/** The book's facts for an entry, from the illustrated index. */
export interface BookFacts {
  /** the book's own number for the posture (its order) */
  bookNumber: number;
  sanskrit: string;
  page: number;
  pdfPage: number;
  figures: number[];
  grade?: number;
  roots: string[];
}

/** A library posture as the pages read it: ours plus the book's facts. */
export type LibraryEntry = LibraryAsana & BookFacts;

interface IndexRow extends BookFacts {
  romanised: string;
}

const book = new Map((illustrated as IndexRow[]).map((r) => [r.romanised, r]));

function join(a: LibraryAsana): LibraryEntry {
  const r = book.get(a.id);
  if (!r) throw new Error(`library: ${a.id} is not in the illustrated index`);
  return {
    ...a,
    bookNumber: r.bookNumber,
    sanskrit: r.sanskrit,
    page: r.page,
    pdfPage: r.pdfPage,
    figures: r.figures,
    grade: r.grade,
    roots: r.roots,
  };
}

const LIBRARY_FAMILIES: readonly LibraryFamily[] = ['standing', 'backbend', 'seated', 'lotus', 'inversion', 'twist'];

/** A module export that is a posture entry (the shape, checked loosely; the tests check the rest). */
function isAsana(v: unknown): v is LibraryAsana {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Partial<LibraryAsana>;
  return typeof o.id === 'string' && LIBRARY_FAMILIES.includes(o.family as LibraryFamily) && Array.isArray(o.steps) && Array.isArray(o.sutras);
}

const postureModules = import.meta.glob<Record<string, unknown>>(['./*.ts', '!./index.ts', '!./common.ts', '!./common-*.ts', '!./*.test.ts'], {
  eager: true,
});

/** Every library posture, in the book's order (its numbering). */
export const libraryAsanas: LibraryEntry[] = Object.values(postureModules)
  .flatMap((m) => Object.values(m).filter(isAsana))
  .map(join)
  .sort((a, b) => a.bookNumber - b.bookNumber);

const byId = new Map(libraryAsanas.map((a) => [a.id, a]));

export function getLibraryAsana(id: string): LibraryEntry | undefined {
  return byId.get(id);
}

/** The rig sheet id a library posture draws (`loadRigData`). */
export const libraryRigId = (id: string): string => `library:${id}`;

export interface LibraryFamilyInfo {
  id: LibraryFamily;
  title: string;
  blurb: string;
  asanas: LibraryEntry[];
}

/** Each family's heading and blurb, in the order `/library` shows them. */
const FAMILY_TEXT: Record<LibraryFamily, { title: string; blurb: string }> = {
  standing: {
    title: 'Standing',
    blurb: 'Poses built on the feet: the legs grow strong and steady, and the rest of the practice stands on them.',
  },
  backbend: {
    title: 'Backbends',
    blurb: 'The spine arched back, lying on the front or pushing up from the floor: the chest opens and the back grows supple.',
  },
  seated: {
    title: 'Seated',
    blurb: 'Sitting on the floor, the legs straight, spread or folded: forward bends and the long quiet stretches.',
  },
  lotus: {
    title: 'Crossed legs',
    blurb: 'The crossed-leg seats — siddhasana, the lotus, and the poses built on the lotus: the seats the book gives for breath practice and meditation.',
  },
  inversion: {
    title: 'Inversions',
    blurb: 'The headstand and the shoulderstand, and the variations built on them. Learn them with a teacher; read the cautions first.',
  },
  twist: {
    title: 'Twists',
    blurb: 'The spine turned about its own length, seated or lying: the trunk wrings and the back loosens.',
  },
};

/** Families as page sections, in `FAMILY_TEXT` order, each with its postures (book order); empty families are left out. */
export const libraryFamilies: LibraryFamilyInfo[] = LIBRARY_FAMILIES.map((f) => ({
  id: f,
  ...FAMILY_TEXT[f],
  asanas: libraryAsanas.filter((a) => a.family === f),
})).filter((f) => f.asanas.length > 0);

interface SutraRow {
  id: string;
  sanskrit: string;
  topic: string;
}

const sutraRows = new Map((sutras as SutraRow[]).map((s) => [s.id, s]));

/** A sutra's transliteration and our topic label, or undefined for an unknown id. */
export function sutraInfo(id: string): { id: string; sanskrit: string; topic: string } | undefined {
  const s = sutraRows.get(id);
  return s && { id: s.id, sanskrit: s.sanskrit, topic: s.topic };
}

/** Where a prepares/counter/related id leads: a library page or a 26 & 2 posture page. */
export interface LibraryLink {
  id: string;
  label: string;
  to: string;
  kind: 'library' | 'sequence';
}

export function resolveLink(id: string): LibraryLink | undefined {
  const a = byId.get(id);
  if (a) return { id, label: a.english, to: `/library/${id}`, kind: 'library' };
  const p = getPose(id);
  if (p) return { id, label: p.englishName, to: `/pose/${id}`, kind: 'sequence' };
  return undefined;
}

/** "The Illustrated Light on Yoga, p. 95, figs. 109–113" — facts only. */
export function sourceLine(a: LibraryEntry): string {
  const f = a.figures;
  const run = f.length > 1 && f[f.length - 1] - f[0] === f.length - 1;
  const figs = f.length === 0 ? '' : f.length === 1 ? `, fig. ${f[0]}` : run ? `, figs. ${f[0]}–${f[f.length - 1]}` : `, figs. ${f.join(', ')}`;
  return `The Illustrated Light on Yoga, p. ${a.page}${figs}`;
}
