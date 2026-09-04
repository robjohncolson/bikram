import { describe, expect, it } from 'vitest';
import { classicalByPose, pendingClassicalAudit } from './index';

const noteModules = import.meta.glob('./[0-9][0-9]-*.ts', { eager: true });
const authoredIds = Object.keys(noteModules)
  .map((path) => path.match(/^\.\/\d{2}-(.+)\.ts$/)?.[1])
  .filter((id): id is string => id !== undefined)
  .sort();

describe('classical note audit gate', () => {
  it('accounts for every authored note exactly once', () => {
    const indexed = Object.keys(classicalByPose);
    const pending = [...pendingClassicalAudit];
    const pendingSet = new Set<string>(pending);

    expect(new Set(indexed).size).toBe(indexed.length);
    expect(new Set(pending).size).toBe(pending.length);
    expect(indexed.filter((id) => pendingSet.has(id))).toEqual([]);
    expect([...indexed, ...pending].sort()).toEqual(authoredIds);
  });
});
