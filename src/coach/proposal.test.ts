import { describe, expect, it } from 'vitest';
import { extractJson, readProposal, validateProposal } from './proposal';

const wrap = (obj: unknown) => `Here is a class for you.\n\n\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\`\n`;

describe('coach proposals', () => {
  it('reads the first fenced json block, or nothing', () => {
    expect(extractJson('no code here')).toBeUndefined();
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extractJson('```\n{"a":2}\n```')).toEqual({ a: 2 });
    expect(extractJson('```json\n{oops\n```')).toBeUndefined();
  });

  it('accepts a well-formed class and reports its length', () => {
    const r = readProposal(
      wrap({
        name: 'Hips',
        blurb: 'A hip-opening evening.',
        items: [{ order: 1, sets: 1 }, { order: 2 }, { order: 9 }, { order: 13 }, { order: 20 }, { order: 26, sets: 1 }],
        reasons: { '9': 'triangle opens the hips' },
      }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.proposal.program.id).toBe('coach');
      expect(r.proposal.program.name).toBe('Hips');
      expect(r.proposal.program.items).toEqual([
        { order: 1, sets: 1 },
        { order: 2 },
        { order: 9 },
        { order: 13 },
        { order: 20 },
        { order: 26, sets: 1 },
      ]);
      expect(r.proposal.reasons['9']).toMatch(/hips/);
      expect(r.proposal.minutes).toBeGreaterThanOrEqual(12);
    }
  });

  it('rejects a class that breaks the sequence rules, naming each rule', () => {
    const r = validateProposal({ items: [{ order: 2 }, { order: 9 }, { order: 5 }, { order: 20 }, { order: 27 }] });
    expect(r.ok).toBe(false);
    if (!r.ok && 'errors' in r) {
      const text = r.errors.join(' ');
      expect(text).toMatch(/open with posture 1/);
      expect(text).toMatch(/close with posture 26/);
      expect(text).toMatch(/out of sequence order/);
      expect(text).toMatch(/27/);
    }
  });

  it('bounds the class length and lets the built-in classes through', () => {
    const everything = { items: Array.from({ length: 26 }, (_, i) => ({ order: i + 1 })) };
    expect(validateProposal(everything).ok).toBe(true); // the full class fits
    const short = {
      items: [1, 2, 3, 4, 16, 22, 25, 26].map((order) => ({ order, sets: 1 })),
    };
    expect(validateProposal(short).ok).toBe(true); // the short class: Kapalbhati needs no savasana
    const tiny = { items: [{ order: 1, sets: 1 }, { order: 26, sets: 1 }] };
    const t = validateProposal(tiny);
    expect(t.ok).toBe(false);
    if (!t.ok && 'errors' in t) expect(t.errors.join(' ')).toMatch(/between 12 and 75/);
  });

  it('distinguishes "no proposal yet" from a bad one', () => {
    const r = readProposal('Tell me how your knees felt?');
    expect(r.ok).toBe(false);
    expect('none' in r && r.none).toBe(true);
  });
});
