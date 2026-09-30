import { describe, expect, it } from 'vitest';
import { getPose, motionUrls, rigBridgeIds, loadRigData } from '../data';
import type { PoseMotion } from '../data';
import { validateProposal } from '../coach/proposal';
import { buildClassTrack } from './cues';
import { figurePlan, planEndMotion } from './figure';
import { FULL_CLASS, SHORT_CLASS } from './programs';
import type { ClassProgram, ProgramItem } from './programs';

const firstSets: ProgramItem[] = FULL_CLASS.items.map(({ order }) => ({ order, sets: 1 }));
const subsets: [string, ProgramItem[]][] = [
  ['every first set', firstSets],
  ...FULL_CLASS.items.map(({ order }): [string, ProgramItem[]] => [
    `first set only for ${order}`, FULL_CLASS.items.map((item) => item.order === order ? { order, sets: 1 } : item),
  ]),
  ...[16, 17, 18, 19].flatMap((order): [string, ProgramItem[]][] => [
    [`omit ${order}`, FULL_CLASS.items.filter((item) => item.order !== order)],
    [`omit ${order}, first sets`, firstSets.filter((item) => item.order !== order)],
  ]),
];
// Ordered subsets may skip Savasana, Bow, or every intervening floor posture.
for (let from = 4; from < 26; from++) {
  for (let to = from + 1; to <= 26; to++) {
    subsets.push([`${from} to ${to}`, [...new Set([1, 2, 3, from, to, 26])].map((order) => ({ order, sets: 1 }))]);
  }
}

function checkProgram(program: ClassProgram) {
  let previous: PoseMotion | undefined;
  const tracks = buildClassTrack(60, program);
  for (const pose of [...tracks.map((tr) => tr.pose), getPose('savasana')!]) {
    const plan = figurePlan(pose, { previous })!;
    expect(plan).toBeDefined();
    let last = previous;
    for (const seg of plan.segments) {
      const from = last?.position?.end;
      const to = seg.motion.position!.start;
      if (from && from !== to) {
        expect(seg.bridge?.position, `${pose.id}: ${from} -> ${to}`).toEqual({ start: from, end: to });
      }
      last = seg.motion;
    }
    previous = planEndMotion(pose);
  }
}

describe('program hand-offs', () => {
  it('bridges every position change in SHORT_CLASS, including closing rest', () => checkProgram(SHORT_CLASS));
  it.each(subsets)('bridges coach-valid subset: %s', (_name, items) => {
    const result = validateProposal({ items });
    expect(result.ok, JSON.stringify(result)).toBe(true);
    if (result.ok) checkProgram(result.proposal.program);
  });

  it('discovers and preloads every new bridge for both renderers', async () => {
    const { bridgeFor } = await import('../data');
    for (const [from, to] of [
      ['prone', 'kneeling'], ['prone', 'seated'],
      ['standing', 'prone'], ['standing', 'kneeling'], ['standing', 'seated'],
    ] as const) {
      const id = `bridge:${from}-${to}`;
      const motion = bridgeFor(from, to)!;
      expect(motion, id).toBeDefined();
      expect(motionUrls()).toContain(motion.sprite);
      expect(rigBridgeIds()).toContain(id);
      expect((await loadRigData(id)).position).toEqual(motion.position);
    }
  });
});
