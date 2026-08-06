import { poses } from '../data';
import type { ArcKey, Card, KcId, KcNode } from './types';

/** Arc boundaries over sequence order (inclusive). */
export const ARCS: { key: ArcKey; label: string; from: number; to: number }[] = [
  { key: 'opening', label: 'Opening Breath', from: 1, to: 1 },
  { key: 'standing', label: 'Standing Series', from: 2, to: 12 },
  { key: 'floor', label: 'Floor Series', from: 13, to: 25 },
  { key: 'closing', label: 'Closing Breath', from: 26, to: 26 },
];

export function arcOf(order: number): ArcKey {
  const arc = ARCS.find((a) => order >= a.from && order <= a.to);
  return (arc ?? ARCS[ARCS.length - 1]).key;
}

function buildGraph(): { nodes: Map<KcId, KcNode>; cards: Card[] } {
  const nodes = new Map<KcId, KcNode>();
  const cards: Card[] = [];

  for (const pose of poses) {
    const idKc: KcId = `id:${pose.id}`;
    const arc = arcOf(pose.order);
    nodes.set(idKc, {
      id: idKc,
      kind: 'identity',
      label: pose.englishName,
      poseId: pose.id,
      order: pose.order,
      arc,
      prereqs: [],
      children: [],
    });
  }

  for (let i = 0; i < poses.length - 1; i++) {
    const from = poses[i];
    const to = poses[i + 1];
    const trKc: KcId = `tr:${from.order}`;
    // a transition belongs to the arc of the pose it leads INTO once the
    // arc changes, else its own arc — keeps arc aggregates covering the
    // hand-offs between arcs
    const arc = arcOf(to.order);
    nodes.set(trKc, {
      id: trKc,
      kind: 'transition',
      label: `${from.englishName} → ${to.englishName}`,
      poseId: from.id,
      order: from.order,
      arc,
      prereqs: [`id:${from.id}`, `id:${to.id}`],
      children: [],
    });
  }

  for (const arc of ARCS) {
    const children: KcId[] = [];
    for (const [id, node] of nodes) {
      if (node.kind !== 'arc' && node.arc === arc.key) children.push(id);
    }
    nodes.set(`arc:${arc.key}`, {
      id: `arc:${arc.key}`,
      kind: 'arc',
      label: arc.label,
      order: arc.from,
      arc: arc.key,
      prereqs: [],
      children,
    });
  }

  nodes.set('root', {
    id: 'root',
    kind: 'root',
    label: 'The whole sequence',
    order: 0,
    prereqs: [],
    children: ARCS.map((a) => `arc:${a.key}`),
  });

  // Cards. Introduction order walks the sequence: each pose unlocks its
  // name card, then its position card, then the transition leading out
  // of it — so new material always builds on the pose just studied.
  let intro = 0;
  for (const pose of poses) {
    cards.push({ id: `name:${pose.id}`, kind: 'name', kc: `id:${pose.id}`, poseId: pose.id, intro: intro++ });
    cards.push({ id: `pos:${pose.order}`, kind: 'pos', kc: `id:${pose.id}`, poseId: pose.id, intro: intro++ });
    if (pose.order < poses.length) {
      cards.push({ id: `next:${pose.id}`, kind: 'next', kc: `tr:${pose.order}`, poseId: pose.id, intro: intro++ });
    }
  }

  return { nodes, cards };
}

const graph = buildGraph();

/** All KC nodes, keyed by id. */
export const kcNodes: Map<KcId, KcNode> = graph.nodes;

/** All cards in introduction order. */
export const allCards: Card[] = [...graph.cards].sort((a, b) => a.intro - b.intro);

export const cardById = new Map(allCards.map((c) => [c.id, c]));
