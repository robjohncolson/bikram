/**
 * Left/right mirror of an authored stage pose: the mannequin's left is +X,
 * so a mirror negates every direction's x (and `pelvis.location`'s),
 * swaps `.L`/`.R` bones and flips every roll (a right-handed turn about a
 * mirrored axis turns the other way) — the rule the postures README gives
 * for a module's own `mirror()` helper.
 */
import type { RigBoneEntry, RigStagePose, RigVec3 } from '../data/types';

const flipX = (v: RigVec3): RigVec3 => [v[0] === 0 ? 0 : -v[0], v[1], v[2]];

function swapSide(name: string): string {
  if (name.endsWith('.L')) return `${name.slice(0, -2)}.R`;
  if (name.endsWith('.R')) return `${name.slice(0, -2)}.L`;
  return name;
}

function mirrorEntry(e: RigBoneEntry): RigBoneEntry {
  if (Array.isArray(e)) return flipX(e as RigVec3);
  return e.roll ? { dir: flipX(e.dir), roll: -e.roll } : { dir: flipX(e.dir) };
}

export function mirrorStage(pose: RigStagePose): RigStagePose {
  const out: RigStagePose = {};
  for (const [k, v] of Object.entries(pose)) out[swapSide(k)] = mirrorEntry(v);
  return out;
}
