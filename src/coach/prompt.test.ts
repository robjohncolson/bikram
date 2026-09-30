import { describe, expect, it } from 'vitest';
import brief from '../data/classical/sutras-brief.md?raw';
import { FULL_CLASS } from '../pacer';
import { emptyJournal, emptyStore } from '../trainer';
import { buildSystemPrompt, PROPOSAL_FORMAT } from './prompt';

describe('coach tradition context', () => {
  it('appends the complete brief with citation guidance and a physiology boundary', () => {
    const prompt = buildSystemPrompt({
      journal: emptyJournal(),
      store: emptyStore(),
      program: FULL_CLASS,
      now: Date.UTC(2026, 8, 29),
    });
    expect(prompt).toContain(PROPOSAL_FORMAT);
    expect(prompt).toContain('== The 26 postures ==');
    expect(prompt).toContain('== The tradition (Patanjali, as read by Iyengar) ==');
    expect(prompt).toContain(brief.trim());
    expect(prompt).toContain('You may cite a sutra by id when naming a principle.');
    expect(prompt).toContain('Do not present tradition as physiology.');
    expect(prompt.indexOf('== The tradition')).toBeGreaterThan(prompt.indexOf('== The 26 postures =='));
  });
});

it('omits the memory-trainer section when no store is supplied', () => {
  const ctx = { journal: emptyJournal(), program: FULL_CLASS, now: Date.UTC(2026, 8, 30) };
  expect(buildSystemPrompt(ctx)).not.toMatch(/memory.trainer/i);
  expect(buildSystemPrompt({ ...ctx, store: emptyStore() })).toContain('== Memory trainer:');
});
