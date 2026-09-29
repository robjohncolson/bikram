import { describe, expect, it } from 'vitest';
import indexData from './illustrated-index.json';
import courses from './illustrated-courses.json';
import mappings from './illustrated-map.json';

interface Entry {
  sanskrit: string;
  romanised: string;
  english: string;
  page: number;
  pdfPage: number;
  section: string;
  kind: string;
  bookNumber?: number;
  grade?: number;
  figures?: number[];
  roots: string[];
  note?: string;
}

const entries: Entry[] = indexData;
const byId = new Map(entries.map((entry) => [entry.romanised, entry]));
const poseFiles = import.meta.glob('../poses/[0-9][0-9]-*.ts');
const poseIds = Object.keys(poseFiles)
  .map((path) => path.match(/\/\d{2}-(.+)\.ts$/)?.[1])
  .filter((id): id is string => id !== undefined)
  .sort();

function visit(value: unknown, fn: (record: Record<string, unknown>) => void) {
  if (Array.isArray(value)) {
    value.forEach((item) => visit(item, fn));
  } else if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    fn(record);
    Object.values(record).forEach((item) => visit(item, fn));
  }
}

describe('illustrated edition reference data', () => {
  it('includes the numbered selection and the meditation photograph', () => {
    expect(entries.filter((entry) => entry.kind === 'asana')).toHaveLength(57);
    expect(entries.filter((entry) => entry.kind === 'pranayama')).toHaveLength(4);
    expect(entries.filter((entry) => entry.kind === 'meditation')).toHaveLength(1);
    expect(entries.filter((entry) => entry.bookNumber !== undefined)
      .map((entry) => entry.bookNumber)).toEqual(
      Array.from({ length: 61 }, (_, i) => i + 1),
    );
  });

  it('keeps names and both page systems in book order', () => {
    entries.forEach((entry, i) => {
      expect(entry.sanskrit.trim()).not.toBe('');
      expect(entry.english.trim()).not.toBe('');
      expect(Number.isInteger(entry.page)).toBe(true);
      expect(Number.isInteger(entry.pdfPage)).toBe(true);
      expect(entry.page).toBeGreaterThan(0);
      expect(entry.pdfPage).toBeLessThanOrEqual(179);
      expect(entry.pdfPage - entry.page).toBe(17);
      if (i > 0) {
        expect(entry.page).toBeGreaterThanOrEqual(entries[i - 1].page);
        expect(entry.pdfPage).toBeGreaterThanOrEqual(entries[i - 1].pdfPage);
      }
    });
  });

  it('uses unique ASCII kebab-case lookup ids', () => {
    expect(byId.size).toBe(entries.length);
    entries.forEach((entry) => {
      expect(entry.romanised).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(Array.isArray(entry.roots)).toBe(true);
      entry.roots.forEach((root) => expect(root).toMatch(/^[a-z]+$/));
    });
  });

  it('records numeric source facts and explains omissions', () => {
    entries.forEach((entry) => {
      if (entry.grade === undefined) {
        expect(entry.note).toBeTruthy();
      } else {
        expect(Number.isInteger(entry.grade)).toBe(true);
        expect(entry.grade).toBeGreaterThan(0);
      }
      if (entry.figures === undefined) {
        expect(entry.note).toBeTruthy();
      } else {
        expect(entry.figures.length).toBeGreaterThan(0);
        expect(new Set(entry.figures).size).toBe(entry.figures.length);
        entry.figures.forEach((figure) => {
          expect(Number.isInteger(figure)).toBe(true);
          expect(figure).toBeGreaterThan(0);
          expect(figure).toBeLessThanOrEqual(150);
        });
      }
    });
  });

  it('resolves course steps, alternative sequences and seat options', () => {
    expect(new Set(courses.map((course) => course.id)).size).toBe(courses.length);
    courses.forEach((course) => {
      expect(course.steps.length).toBeGreaterThan(0);
      expect(course.sourcePdfPage - course.sourcePage).toBe(17);
    });
    visit(courses, (record) => {
      if (typeof record.asana !== 'string') return;
      const entry = byId.get(record.asana);
      expect(entry, record.asana).toBeDefined();
      expect(record.page).toBe(entry?.page);
    });
  });

  it('keeps timings and counts numeric without inventing missing values', () => {
    const numericKeys = [
      'seconds', 'secondsMin', 'secondsMax', 'cycles', 'repetitions',
      'repetitionsMin', 'repetitionsMax', 'initialRounds', 'stage',
      'weekStart', 'weekEnd', 'day',
    ];
    visit(courses, (record) => {
      numericKeys.forEach((key) => {
        if (record[key] !== undefined) {
          expect(typeof record[key]).toBe('number');
          expect(record[key]).toBeGreaterThan(0);
        }
      });
      if (typeof record.secondsMin === 'number' && typeof record.secondsMax === 'number') {
        expect(record.secondsMax).toBeGreaterThanOrEqual(record.secondsMin);
      }
    });
    expect(courses.filter((course) => 'day' in course).map((course) => course.day))
      .toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(courses.find((course) => course.id === 'weeks-23-25'))
      .toHaveProperty('unresolvedPrefix');
  });

  it('maps all app postures exactly once and documents absent matches', () => {
    expect(mappings).toHaveLength(26);
    expect(new Set(mappings.map((mapping) => mapping.pose)).size).toBe(26);
    expect(mappings.map((mapping) => mapping.pose).sort()).toEqual(poseIds);
    mappings.forEach((mapping) => expect(mapping.note).toBeTruthy());
    visit(mappings, (record) => {
      if (!('asana' in record)) return;
      if (record.asana === null) {
        expect(record.note).toBeTruthy();
        expect(record.pdfPage).toBeUndefined();
        expect(record.figures).toBeUndefined();
        return;
      }
      expect(typeof record.asana).toBe('string');
      const entry = byId.get(String(record.asana));
      expect(entry).toBeDefined();
      expect(Number.isInteger(record.pdfPage)).toBe(true);
      expect(record.pdfPage).toBeGreaterThanOrEqual(entry?.pdfPage ?? 0);
      expect(record.pdfPage).toBeLessThanOrEqual(179);
      expect(Array.isArray(record.figures)).toBe(true);
      if (Array.isArray(record.figures)) {
        expect(record.figures.length).toBeGreaterThan(0);
        record.figures.forEach((figure) => expect(entry?.figures).toContain(figure));
      }
    });
  });

  it('pins edition-specific numbering and photograph locations', () => {
    expect(byId.get('utthita-trikonasana')).toMatchObject({
      page: 42, pdfPage: 59, figures: [2, 3, 4], grade: 3,
    });
    expect(byId.get('janu-sirsasana')?.grade).toBe(5);
    expect(byId.get('paschimottanasana')?.grade).toBe(6);
    expect(byId.get('savasana')?.grade).toBeUndefined();
    expect(byId.get('marichyasana-ii')).toMatchObject({
      page: 110, figures: [133, 134, 135, 136], grade: 10,
    });
    expect(mappings.find((mapping) => mapping.pose === 'cobra'))
      .toMatchObject({ asana: 'bhujangasana-i', pdfPage: 72, figures: [31] });
    expect(mappings.find((mapping) => mapping.pose === 'half-tortoise'))
      .toMatchObject({ asana: 'virasana', pdfPage: 80, figures: [45] });
  });
});
