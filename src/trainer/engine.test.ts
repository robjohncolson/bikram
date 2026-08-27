import { describe, expect, it } from 'vitest';
import { BKT_BY_KIND, SPACED_GAP_MS, applyEvidence, bktUpdate, decayedP, decayHalfLifeDays, leafP, meanLeafP, nodeP } from './bkt';
import { AGAIN_MINUTES, gradeCard, newCardState } from './srs';
import { allCards, ARCS, kcNodes } from './graph';
import { buildDrillQueue, buildQueue, interleave, NEW_PER_SESSION, recordAnswer, relearnSlot, schedulesOn } from './engine';
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

describe('forgetting decay', () => {
  const DAY = 86_400_000;

  it('leaves fresh evidence untouched and skips decay when now is omitted', () => {
    const state = { p: 0.9, correct: 1, wrong: 0, spaced: 1, last: NOW };
    expect(decayedP(state, 0.1, NOW)).toBe(0.9);
    const store = emptyStore();
    store.kcs['id:camel'] = state;
    expect(leafP(store, 'id:camel')).toBe(0.9);
  });

  it('halves the excess over prior after one half-life', () => {
    // one correct answer → half-life 8 days; excess 0.8 → 0.4 → P 0.5
    const state = { p: 0.9, correct: 1, wrong: 0, spaced: 1, last: NOW };
    expect(decayHalfLifeDays(1)).toBe(8);
    expect(decayedP(state, 0.1, NOW + 8 * DAY)).toBeCloseTo(0.5, 10);
  });

  it('fades slower with more practice, capped at 60 days', () => {
    const fresh = { p: 0.9, correct: 1, wrong: 0, spaced: 1, last: NOW };
    const seasoned = { p: 0.9, correct: 10, wrong: 0, spaced: 10, last: NOW };
    const t = NOW + 20 * DAY;
    expect(decayedP(seasoned, 0.1, t)).toBeGreaterThan(decayedP(fresh, 0.1, t));
    expect(decayHalfLifeDays(1000)).toBe(60);
  });

  it('drifts a below-prior P back up toward the prior', () => {
    const struggling = { p: 0.03, correct: 0, wrong: 4, spaced: 0, last: NOW };
    const later = decayedP(struggling, 0.1, NOW + 30 * DAY);
    expect(later).toBeGreaterThan(0.03);
    expect(later).toBeLessThanOrEqual(0.1);
  });

  it('applies new evidence to the decayed posterior, not the stale stored one', () => {
    const store = emptyStore();
    store.kcs['id:eagle'] = { p: 0.95, correct: 3, wrong: 0, spaced: 1, last: NOW };
    const later = NOW + 60 * DAY; // faded most of the way back to the prior
    const faded = leafP(store, 'id:eagle', later);
    expect(faded).toBeLessThan(0.2);
    applyEvidence(store, 'id:eagle', 'name', true, later);
    expect(store.kcs['id:eagle'].p).toBeCloseTo(bktUpdate(faded, true, BKT_BY_KIND.name), 10);
    expect(store.kcs['id:eagle'].p).toBeLessThan(0.95);
  });

  it('decays aggregates through nodeP', () => {
    const store = emptyStore();
    for (const node of kcNodes.values()) {
      if (node.kind === 'identity' || node.kind === 'transition') {
        store.kcs[node.id] = { p: 0.95, correct: 3, wrong: 0, spaced: 3, last: NOW };
      }
    }
    const fresh = nodeP(store, 'root', NOW);
    const stale = nodeP(store, 'root', NOW + 30 * DAY);
    expect(stale).toBeLessThan(fresh);
  });
});

describe('class recall evidence', () => {
  it('moves a transition leaf without touching any card schedule', () => {
    const store = emptyStore();
    applyEvidence(store, 'tr:4', 'recall', true, NOW);
    expect(store.kcs['tr:4'].p).toBeCloseTo(bktUpdate(0.1, true, BKT_BY_KIND.recall), 10);
    expect(Object.keys(store.cards)).toHaveLength(0);
    applyEvidence(store, 'tr:5', 'recall', false, NOW);
    expect(store.kcs['tr:5'].p).toBeLessThan(0.1 + BKT_BY_KIND.recall.pLearn);
    expect(store.kcs['tr:5'].wrong).toBe(1);
  });
});

describe('noisy-AND aggregation', () => {
  it('root is the product of arc probabilities', () => {
    const store: TrainerStore = emptyStore();
    // drive every leaf near certainty
    for (const node of kcNodes.values()) {
      if (node.kind === 'identity' || node.kind === 'transition') {
        store.kcs[node.id] = { p: 0.9, correct: 5, wrong: 0, spaced: 5, last: NOW };
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

  it('drills a transition with its card first, then its two identities', () => {
    const queue = buildDrillQueue(emptyStore(), 'tr:4', NOW);
    expect(queue[0].card.id).toBe('next:eagle');
    const kcs = queue.map((q) => q.card.kc);
    expect(kcs).toContain('id:eagle');
    expect(kcs).toContain('id:standing-head-to-knee');
    expect(queue.every((q) => q.reason === 'drill')).toBe(true);
    expect(queue.length).toBeLessThanOrEqual(8);
  });

  it('drills an identity with its cards plus the hand-offs leaning on it', () => {
    const queue = buildDrillQueue(emptyStore(), 'id:eagle', NOW);
    const ids = queue.map((q) => q.card.id);
    expect(ids[0]).toBe('name:eagle');
    expect(ids).toContain('pos:4');
    expect(ids).toContain('next:awkward'); // tr:3 rests on id:eagle
    expect(ids).toContain('next:eagle'); // tr:4 rests on id:eagle
  });

  it('drills an aggregate through its weakest leaves', () => {
    const store = emptyStore();
    // make everything in the standing arc strong except one transition
    for (const node of kcNodes.values()) {
      if ((node.kind === 'identity' || node.kind === 'transition') && node.arc === 'standing') {
        store.kcs[node.id] = { p: 0.95, correct: 5, wrong: 0, spaced: 5, last: NOW };
      }
    }
    store.kcs['tr:6'] = { p: 0.05, correct: 0, wrong: 3, spaced: 0, last: NOW };
    const queue = buildDrillQueue(store, 'arc:standing', NOW);
    expect(queue[0].card.kc).toBe('tr:6');
    expect(buildDrillQueue(store, 'root', NOW).length).toBeGreaterThan(0);
    expect(buildDrillQueue(store, 'nonsense', NOW)).toEqual([]);
  });

  it('feeds BKT evidence on the card’s KC', () => {
    const store = emptyStore();
    recordAnswer(store, 'next:pranayama', 'good', NOW);
    expect(store.kcs['tr:1'].p).toBeCloseTo(0.428571, 5);
    expect(store.kcs['tr:1'].correct).toBe(1);
    expect(store.answers).toBe(1);
  });
});

describe('honest scheduling', () => {

  it('an early re-"good" leaves the schedule unchanged', () => {
    const store = emptyStore();
    recordAnswer(store, 'name:eagle', 'good', NOW); // new → 30m step
    const scheduled = { ...store.cards['name:eagle'] };
    // blitzed again a minute later, three times: BKT moves, the ladder does not
    for (let i = 1; i <= 3; i++) recordAnswer(store, 'name:eagle', 'good', NOW + i * 60_000);
    expect(store.cards['name:eagle']).toEqual(scheduled);
    expect(store.kcs['id:eagle'].correct).toBe(4);
    expect(store.answers).toBe(4);
  });

  it('an early "again" still lapses', () => {
    const store = emptyStore();
    for (let i = 0; i < 3; i++) recordAnswer(store, 'name:eagle', 'good', NOW + i * 2 * 86_400_000);
    expect(store.cards['name:eagle'].interval).toBeGreaterThan(AGAIN_MINUTES);
    recordAnswer(store, 'name:eagle', 'again', NOW + 6 * 86_400_000 + 1);
    expect(store.cards['name:eagle'].interval).toBe(AGAIN_MINUTES);
    expect(store.cards['name:eagle'].lapses).toBe(1);
  });

  it('"good" right after a miss advances from the relearn step', () => {
    const store = emptyStore();
    recordAnswer(store, 'name:eagle', 'again', NOW);
    expect(schedulesOn(store.cards['name:eagle'], 'good', NOW + 60_000)).toBe(true);
    recordAnswer(store, 'name:eagle', 'good', NOW + 60_000);
    expect(store.cards['name:eagle'].interval).toBe(30);
  });

  it('a due card advances; the same card answered early does not', () => {
    const store = emptyStore();
    recordAnswer(store, 'pos:4', 'good', NOW);
    const due = store.cards['pos:4'].due;
    expect(schedulesOn(store.cards['pos:4'], 'good', due - 1)).toBe(false);
    expect(schedulesOn(store.cards['pos:4'], 'good', due)).toBe(true);
    expect(schedulesOn(undefined, 'good', NOW)).toBe(true);
  });

  it('stretches the half-life only on spaced correct answers', () => {
    const store = emptyStore();
    recordAnswer(store, 'name:eagle', 'good', NOW);
    for (let i = 1; i <= 5; i++) recordAnswer(store, 'name:eagle', 'good', NOW + i * 60_000);
    // six hits in one sitting: the first proves nothing about retention
    // and the rest are massed — no spaced credit, base half-life
    expect(store.kcs['id:eagle'].correct).toBe(6);
    expect(store.kcs['id:eagle'].spaced).toBe(0);
    expect(decayHalfLifeDays(store.kcs['id:eagle'].spaced)).toBe(4);
    recordAnswer(store, 'name:eagle', 'good', NOW + 5 * 60_000 + SPACED_GAP_MS);
    expect(store.kcs['id:eagle'].spaced).toBe(1);
    expect(decayHalfLifeDays(1)).toBe(8);
    // a wrong answer never counts as spaced practice
    recordAnswer(store, 'name:eagle', 'again', NOW + 5 * 60_000 + 3 * SPACED_GAP_MS);
    expect(store.kcs['id:eagle'].spaced).toBe(1);
    expect(store.kcs['id:eagle'].wrong).toBe(1);
  });

  it('does not fine a card twice for missing it again while relearning', () => {
    const store = emptyStore();
    for (let i = 0; i < 3; i++) recordAnswer(store, 'name:eagle', 'good', NOW + i * 2 * 86_400_000);
    const t = NOW + 6 * 86_400_000 + 1;
    recordAnswer(store, 'name:eagle', 'again', t);
    const once = { ...store.cards['name:eagle'] };
    recordAnswer(store, 'name:eagle', 'again', t + 60_000);
    const twice = store.cards['name:eagle'];
    expect(twice.lapses).toBe(once.lapses);
    expect(twice.ease).toBe(once.ease);
    expect(twice.interval).toBe(AGAIN_MINUTES);
    expect(twice.due).toBe(t + 60_000 + AGAIN_MINUTES * 60_000);
    expect(twice.reps).toBe(once.reps + 1);
    // and a hit afterwards still climbs out of relearn
    recordAnswer(store, 'name:eagle', 'good', t + 120_000);
    expect(store.cards['name:eagle'].interval).toBe(30);
  });
});

describe('interleaving', () => {
  const noAdjacentPose = (q: { card: { poseId: string } }[]) =>
    q.every((e, i) => i === 0 || e.card.poseId !== q[i - 1].card.poseId);

  it('finds a clash-free order whenever one exists (deterministic shuffles)', () => {
    // xorshift so the test is repeatable
    let seed = 7;
    const rnd = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    };
    for (let trial = 0; trial < 200; trial++) {
      const n = 4 + Math.floor(rnd() * 20);
      const kinds = 2 + Math.floor(rnd() * 5);
      type Lite = { card: { poseId: string; id: string } };
      const items: Lite[] = Array.from({ length: n }, (_, i) => ({
        card: { poseId: `p${Math.floor(rnd() * kinds)}`, id: `c${i}` },
      }));
      const counts = new Map<string, number>();
      for (const it of items) counts.set(it.card.poseId, (counts.get(it.card.poseId) ?? 0) + 1);
      const maxCount = Math.max(...counts.values());
      const out = interleave(items as never[]) as Lite[];
      expect(out).toHaveLength(n);
      expect(new Set(out.map((e) => e.card.id))).toEqual(new Set(items.map((e) => e.card.id)));
      // a clash-free arrangement exists iff no posture holds more than ceil(n/2) slots
      if (maxCount <= Math.ceil(n / 2)) expect(noAdjacentPose(out), `trial ${trial}`).toBe(true);
    }
  });

  it('re-inserts a miss past its own sibling cards', () => {
    const q = (ids: string[]) => ids.map((id) => ({ card: { id, poseId: id.split(':')[1] } })) as never[];
    const card = { id: 'next:eagle', poseId: 'eagle' } as never;
    // slot 4 would sit right after name:eagle (which shows the answer) → nudged to 5
    const queue = q(['next:eagle', 'pos:1', 'name:tree', 'name:eagle', 'pos:2', 'name:bow']);
    expect(relearnSlot(queue, card, 0, 3)).toBe(5);
    // clean slot: used as is
    expect(relearnSlot(q(['next:eagle', 'pos:1', 'name:tree', 'pos:2', 'name:bow']), card, 0, 3)).toBe(4);
    // nothing clean ahead: end of queue
    expect(relearnSlot(q(['next:eagle', 'pos:1', 'name:eagle', 'pos:4']), card, 0, 2)).toBe(4);
  });

  it('never serves the same posture twice in a row when avoidable', () => {
    expect(noAdjacentPose(buildQueue(emptyStore(), NOW))).toBe(true);
    expect(noAdjacentPose(buildDrillQueue(emptyStore(), 'tr:4', NOW))).toBe(true);
    // an identity drill is three Eagle cards plus one hand-off: one clash is unavoidable
    const eagle = buildDrillQueue(emptyStore(), 'id:eagle', NOW);
    const clashes = eagle.filter((e, i) => i > 0 && e.card.poseId === eagle[i - 1].card.poseId).length;
    expect(clashes).toBe(1);
    // a busy store: everything seen, plenty due
    const store = emptyStore();
    for (const c of allCards) recordAnswer(store, c.id, 'good', NOW - 86_400_000);
    expect(noAdjacentPose(buildQueue(store, NOW))).toBe(true);
  });

  it('keeps priority order otherwise and drops nothing', () => {
    const a = { card: { poseId: 'x' } }, b = { card: { poseId: 'x' } }, c = { card: { poseId: 'y' } };
    const out = interleave([a, b, c] as never[]);
    expect(out).toEqual([a, c, b]);
    const only = [a, b];
    expect(interleave(only as never[])).toEqual([a, b]); // unavoidable: taken as is
    expect(interleave([])).toEqual([]);
  });
});

describe('mean leaf P', () => {
  it('sits at the priors for an empty store and averages leaves otherwise', () => {
    const empty = meanLeafP(emptyStore());
    expect(empty).toBeCloseTo(0.1, 10); // every kind's prior is 0.1
    const store = emptyStore();
    for (const node of kcNodes.values()) {
      if (node.kind === 'identity' || node.kind === 'transition') {
        store.kcs[node.id] = { p: 0.9, correct: 5, wrong: 0, spaced: 5, last: NOW };
      }
    }
    expect(meanLeafP(store)).toBeCloseTo(0.9, 10);
    // the root, by contrast, is tiny — the headline uses the mean on purpose
    expect(nodeP(store, 'root')).toBeLessThan(0.01);
  });
});
