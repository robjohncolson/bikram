import library from '../data/rig/skeletons/library.json';
import { J, SKIN_EXTRA, BONES } from './skeleton';
import { normalize, sub } from './math';

export type SkeletonName = 'library';
export interface Skeleton {
  J: typeof J;
  SKIN_EXTRA: typeof SKIN_EXTRA;
}
const base: Skeleton = { J, SKIN_EXTRA };
const extended = library as unknown as Skeleton;
export function skeletonOf(name?: SkeletonName): Skeleton {
  if (name === undefined) return base;
  if (name === 'library') return extended;
  throw new Error(`Unknown skeleton: ${name}`);
}
function directions(name?: SkeletonName) {
  const joints = skeletonOf(name).J;
  return Object.fromEntries(BONES.map(([n, h, t]) => [n, normalize(sub(joints[t], joints[h]))]));
}

const baseDirections = directions();
const libraryDirections = directions('library');
export const directionsOf = (name?: SkeletonName) => name === 'library' ? libraryDirections : baseDirections;
