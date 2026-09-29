import { describe, expect, it } from 'vitest';
import entries from './sutras-index.json';
import brief from './sutras-brief.md?raw';

const chapters = [
  { roman: 'I', count: 51 },
  { roman: 'II', count: 55 },
  { roman: 'III', count: 56 },
  { roman: 'IV', count: 34 },
];
const themes = new Set([
  'samadhi', 'limbs', 'yama-niyama', 'asana', 'pranayama', 'pratyahara',
  'dharana', 'dhyana', 'kleshas', 'karma', 'siddhis', 'kaivalya', 'other',
]);
const ids = new Set(entries.map((entry) => entry.id));

describe('sutra reference contracts', () => {
  it('contains each numbered sutra once in chapter order', () => {
    expect(entries).toHaveLength(196);
    expect(ids.size).toBe(196);
    expect(entries.map(({ id, pada, n }) => ({ id, pada, n }))).toEqual(
      chapters.flatMap(({ roman, count }, chapter) =>
        Array.from({ length: count }, (_, i) => ({
          id: `${roman}.${i + 1}`, pada: chapter + 1, n: i + 1,
        })),
      ),
    );
  });

  it('preserves the source pagination and treatment order', () => {
    entries.forEach((entry, i) => {
      expect(Number.isInteger(entry.page)).toBe(true);
      expect(Number.isInteger(entry.pdfPage)).toBe(true);
      expect(entry.page).toBeGreaterThan(0);
      expect(entry.pdfPage).toBeLessThanOrEqual(388);
      expect(entry.pdfPage - entry.page).toBe(22);
      if (i > 0) {
        expect(entry.page).toBeGreaterThanOrEqual(entries[i - 1].page);
        expect(entry.pdfPage).toBeGreaterThanOrEqual(entries[i - 1].pdfPage);
      }
    });
    for (const [id, page, pdfPage] of [
      ['I.1', 48, 70], ['II.1', 108, 130], ['II.46', 157, 179],
      ['III.1', 178, 200], ['IV.1', 246, 268], ['IV.34', 283, 305],
    ] as const) {
      expect(entries.find((entry) => entry.id === id)).toMatchObject({ page, pdfPage });
    }
  });

  it('uses bounded topics, known themes, and ASCII transliteration', () => {
    entries.forEach((entry) => {
      expect(themes.has(entry.theme)).toBe(true);
      const words = entry.topic.trim().split(/\s+/);
      expect(words.length).toBeGreaterThanOrEqual(3);
      expect(words.length).toBeLessThanOrEqual(8);
      expect(entry.sanskrit).toMatch(/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/);
      expect(entry.sanskrit).not.toMatch(/\b(?:the|and|of|with|which|consciousness|knowledge|meditation)\b/i);
    });
  });

  it('keeps the brief short and resolves every paragraph citation including ranges', () => {
    expect(brief.trim().split(/\s+/).length).toBeLessThanOrEqual(700);
    const paragraphs = brief.trim().split(/\n\s*\n/);
    expect(paragraphs.length).toBeGreaterThan(0);
    paragraphs.forEach((paragraph) => {
      const citations = [...paragraph.matchAll(/\b(IV|III|II|I)\.(\d+)(?:[–-](?:(IV|III|II|I)\.)?(\d+))?/g)];
      expect(citations.length).toBeGreaterThan(0);
      citations.forEach(([, chapter, start, endChapter, end]) => {
        expect(endChapter === undefined || endChapter === chapter).toBe(true);
        const first = Number(start);
        const last = Number(end ?? start);
        expect(last).toBeGreaterThanOrEqual(first);
        for (let n = first; n <= last; n++) expect(ids.has(`${chapter}.${n}`)).toBe(true);
      });
    });
  });
});
