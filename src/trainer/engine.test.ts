import { describe, expect, it } from 'vitest';
import { BKT_BY_KIND, bktUpdate, nodeP } from './bkt';
import { AGAIN_MINUTES, gradeCard, newCardState } from './srs';
import { allCards, ARCS, kcNodes } from './graph';
import { buildQueue, NEW_PER_SESSION, recordAnswer } from './engine';
import { emptyStore } from './store';
import type { TrainerStore } from './types';

const NOW = 1_754_000_000_000;

describe('knowledge graph', () => {
  it('has 26 identities, 25 transitions, 4 arcs, 1 root', () => {
    const kinds = { identity: 0, transition: 0, arc: 0, root: 0 };
    for (const node of kcNodes.values()) kinds[node.kind]++;
    expect(kinds).toEqual({ identity: 26, transition: 25, arc: 4, root: 1 });
  });

  it('is acyclic with edges only pointing up the hierarchy', () => {
    // identities have no prereqs; transitions depend only on identities;
    // arcs/root aggregate without prereq edges — acyclic by construction,
    // but verify no node lists itself or an aggregate as a prerequisite
    for (const node of kcNodes.values()) {
      expect(node.prereqs).not.toContain(node.id);
      for (const p of node.prereqs) {
        const dep = kcNodes.get(p);
        expect(dep).toBeDefined();
        expect(dep!.kind).toBe('identity');
      }
    }
  });

  it('arc children cover every leaf exactly once', () => {
    const seen = new Set<string>();
    for (const arc of ARCS) {
      for (const child of kcNodes.get(`arc:${arc.key}`)!.children) {
        expect(seen.has(child)).toBe(false);
        seen.add(child);
      }
    }
    expect(seen.size).toBe(26 + 25);
  });

  it('produces 77 cards (26 name + 26 pos + 25 next) with unique ids', () => {
    expect(allCards.length).toBe(77);
    expect(new Set(allCards.map((c) => c.id)).size).toBe(77);
  });
});

describe('bkt update', () => {
  const params = BKT_BY_KIND.next; // guess .25, slip .1, learn .2

  it('matches hand-computed posterior for a correct answer', () => {
    // prior .1: posterior = .1*.9 / (.1*.9 + .9*.25) = .09/.315 = .285714…
    // after learning: .2857 + .7143*.2 = .428571…
    expect(bktUpdate(0.1, true, params)).toBeCloseTo(0.428571, 5);
  });

  it('matches hand-computed posterior for a wrong answer', () => {
    // prior .5: posterior = .5*.1 / (.5*.1 + .5*.75) = .05/.425 = .117647…
    // after learning: .117647 + .882353*.2 = .294117…
    expect(bktUpdate(0.5, false, params)).toBeCloseTo(0.294118, 5);
  });

  it('is monotone: correct raises, wrong lowers (pre-learning bump aside)', () => {
    for (const p of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      expect(bktUpdate(p, true, params)).toBeGreaterThan(p);
      expect(bktUpdate(p, false, params)).toBeLessThan(p + params.pLearn);
    }
  });

  it('converges toward certainty with repeated correct answers', () => {
    let p = 0.1;
    for (let i = 0; i < 10; i++) p = bktUpdate(p, true, params);
    expect(p).toBeGreaterThan(0.99);
  });
});

describe('noisy-AND aggregation', () => {
  it('root is the product of arc probabilities', () => {
    const store: TrainerStore = emptyStore();
    // drive every leaf near certainty
    for (const node of kcNodes.values()) {
      if (node.kind === 'identity' || node.kind === 'transition') {
        store.kcs[node.id] = { p: 0.9, correct: 5, wrong: 0, last: NOW };
      }
    }
    const arcs = ARCS.map((a) => nodeP(store, `arc:${a.key}`));
    const product = arcs.reduce((x, y) => x * y, 1);
    expect(nodeP(store, 'root')).toBeCloseTo(product, 10);
    // 51 leaves at .9 → root should be tiny; strictness is intentional
    expect(nodeP(store, 'root')).toBeCloseTo(0.9 ** 51, 5);
  });
});

describe('srs scheduling', () => {
  it('walks 30m → 1d → 3d → ease growth on repeated good', () => {
    let s = newCardState(NOW);
    s = gradeCard(s, 'good', NOW);
    expect(s.interval).toBe(30);
    s = gradeCard(s, 'good', NOW);
    expect(s.interval).toBe(60 * 24);
    s = gradeCard(s, 'good', NOW);
    expect(s.interval).toBe(60 * 24 * 3);
    s = gradeCard(s, 'good', NOW);
    expect(s.interval).toBe(Math.round(60 * 24 * 3 * 2.5));
  });

  it('again resets to the relearn step and costs ease', () => {
    let s = newCardState(NOW);
    for (let i = 0; i < 4; i++) s = gradeCard(s, 'good', NOW);
    const lapsed = gradeCard(s, 'again', NOW);
    expect(lapsed.interval).toBe(AGAIN_MINUTES);
    expect(lapsed.ease).toBeCloseTo(2.3, 10);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.due).toBe(NOW + AGAIN_MINUTES * 60 * 1000);
  });
});

describe('review queue', () => {
  it('introduces a ration of new cards for a fresh store', () => {
    const queue = buildQueue(emptyStore(), NOW);
    expect(queue.length).toBe(NEW_PER_SESSION);
    expect(queue.every((q) => q.reason === 'new')).toBe(true);
    // introduction order starts at pose 1's cards
    expect(queue[0].card.id).toBe('name:pranayama');
  });

  it('puts due cards first and reschedules after answers', () => {
    const store = emptyStore();
    recordAnswer(store, 'name:pranayama', 'good', NOW);
    expect(store.cards['name:pranayama'].due).toBe(NOW + 30 * 60 * 1000);
    // not due yet → next queue is new cards only
    const soon = buildQueue(store, NOW + 60 * 1000);
    expect(soon.some((q) => q.card.id === 'name:pranayama' && q.reason === 'due')).toBe(false);
    // an hour later it is due and leads the queue
    const later = buildQueue(store, NOW + 61 * 60 * 1000);
    expect(later[0].card.id).toBe('name:pranayama');
    expect(later[0].reason).toBe('due');
  });

  it('feeds BKT evidence on the card’s KC', () => {
    const store = emptyStore();
    recordAnswer(store, 'next:pranayama', 'good', NOW);
    expect(store.kcs['tr:1'].p).toBeCloseTo(0.428571, 5);
    expect(store.kcs['tr:1'].correct).toBe(1);
    expect(store.answers).toBe(1);
  });
});
