/**
 * The posture LIBRARY's access layer — the wider classical repertoire, a
 * second collection beside the 26 & 2 and never mixed into it. Views import
 * only from here (and the rig loaders from `data/index.ts`).
 *
 * Each entry is our own `LibraryAsana` (one file per posture) joined with
 * its facts from `classical/illustrated-index.json` by id — the Sanskrit
 * name, pages, photograph numbers, grade and roots are never duplicated.
 * Sutra ids resolve against `classical/sutras-index.json` (transliteration
 * and our topic label). Both JSON files land in the library's own chunk:
 * the routes are lazy, so the 26 & 2 never loads them.
 */
import illustrated from '../classical/illustrated-index.json';
import sutras from '../classical/sutras-index.json';
import { getPose } from '../index';
import type { LibraryAsana, LibraryFamily, NoticeRegion } from '../types';
import { ekaPadaSarvangasana } from './eka-pada-sarvangasana';
import { halasana } from './halasana';
import { karnapidasana } from './karnapidasana';
import { parsvaHalasana } from './parsva-halasana';
import { parsvaikaPadaSarvangasana } from './parsvaika-pada-sarvangasana';
import { salambaSarvangasanaI } from './salamba-sarvangasana-i';
import { salambaSirsasanaI } from './salamba-sirsasana-i';
import { setuBandhaSarvangasana } from './setu-bandha-sarvangasana';
import { suptaKonasana } from './supta-konasana';
import { urdhvaDandasana } from './urdhva-dandasana';

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
  return { ...a, sanskrit: r.sanskrit, page: r.page, pdfPage: r.pdfPage, figures: r.figures, grade: r.grade, roots: r.roots };
}

/** Every library posture, in the book's order within each family. */
export const libraryAsanas: LibraryEntry[] = [
  salambaSirsasanaI,
  urdhvaDandasana,
  salambaSarvangasanaI,
  halasana,
  karnapidasana,
  suptaKonasana,
  parsvaHalasana,
  ekaPadaSarvangasana,
  parsvaikaPadaSarvangasana,
  setuBandhaSarvangasana,
].map(join);

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

const FAMILY_TEXT: Record<LibraryFamily, { title: string; blurb: string }> = {
  inversion: {
    title: 'Inversions',
    blurb: 'The headstand and the shoulderstand, and the variations built on them. Learn them with a teacher; read the cautions first.',
  },
};

/** Families as page sections, each with its postures. */
export const libraryFamilies: LibraryFamilyInfo[] = (Object.keys(FAMILY_TEXT) as LibraryFamily[]).map((f) => ({
  id: f,
  ...FAMILY_TEXT[f],
  asanas: libraryAsanas.filter((a) => a.family === f),
}));

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
