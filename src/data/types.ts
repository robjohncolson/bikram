/**
 * Core data model for the Bikram 26 & 2 sequence guide.
 *
 * The sequence is 26 numbered items: 24 postures plus 2 breathing
 * exercises (#1 Pranayama and #26 Kapalbhati). Every pose lives in its
 * own file under `src/data/poses/` so the sequence stays editable —
 * drop, reorder, or swap postures by editing `poses/index.ts`.
 */

// ---------------------------------------------------------------- chakras

export type ChakraId =
  | 'root'
  | 'sacral'
  | 'solar-plexus'
  | 'heart'
  | 'throat'
  | 'third-eye'
  | 'crown';

export interface Chakra {
  id: ChakraId;
  /** 1 (root) through 7 (crown) */
  number: number;
  sanskritName: string;
  englishName: string;
  /** Traditional color, as a CSS color usable on both light and dark surfaces */
  color: string;
  /** Physical anchor point, e.g. "base of the spine" */
  location: string;
  /** Classical element association, e.g. "earth" */
  element: string;
  /** Seed syllable (bija mantra) */
  bija: string;
  /** Psychological/energetic themes this chakra governs */
  themes: string[];
  description: string;
}

// ---------------------------------------------------------------- muscles

export type MuscleId =
  | 'neck'
  | 'trapezius'
  | 'deltoids'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'pectorals'
  | 'lats'
  | 'erector-spinae'
  | 'abdominals'
  | 'obliques'
  | 'diaphragm'
  | 'hip-flexors'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'adductors'
  | 'calves'
  | 'ankles-feet';

export type BodyRegion = 'head-neck' | 'upper-body' | 'core' | 'lower-body';

export interface MuscleGroup {
  id: MuscleId;
  /** Friendly display name, e.g. "Quadriceps" */
  name: string;
  /** Anatomical name(s) when the display name is colloquial */
  anatomicalName?: string;
  region: BodyRegion;
  /** Which body-map view shows this group best */
  view: 'front' | 'back' | 'both';
  /** One sentence: what this group does for a yogi */
  description: string;
}

// ---------------------------------------------------------------- poses

export type PoseCategory = 'breathing' | 'standing' | 'floor';

/**
 * One timed piece of a posture's class time: a side, a set, the
 * savasana/sit-up interludes of the floor series, or a breathing round.
 * A posture's segments partition its `approxTotalSeconds` exactly —
 * enforced by a unit test — so the class pacer, its countdown, and the
 * spoken cues all ride one clock.
 */
export interface PoseSegment {
  kind: 'side' | 'set' | 'rest' | 'situp' | 'breath';
  /** short display label, e.g. "First set — right leg" */
  label: string;
  /** spoken cue at the segment's start, e.g. "Other side." */
  cue: string;
  seconds: number;
}

/** How a posture engages one muscle group */
export interface MuscleWork {
  id: MuscleId;
  action: 'strengthens' | 'stretches';
  /** Primary work shows first and highlights strongest on the body map */
  emphasis: 'primary' | 'secondary';
  /** Optional short note, e.g. "isometric hold in the standing leg" */
  note?: string;
}

/** Why a posture is linked to a chakra */
export interface ChakraLink {
  id: ChakraId;
  /** One sentence on why this pose activates this chakra */
  why: string;
}

export interface Pose {
  /** Stable kebab-case id, used in routes: /pose/:id */
  id: string;
  /** Position in the sequence, 1–26 */
  order: number;
  englishName: string;
  sanskritName: string;
  /** Rough phonetic pronunciation of the Sanskrit name */
  pronunciation?: string;
  category: PoseCategory;
  /** Number of sets in a standard 90-minute class */
  sets: number;
  /** Human-readable timing, e.g. "2 sets — 60s first set, 30s second" */
  timing: string;
  /** Approximate total time spent on this pose in class, in seconds */
  approxTotalSeconds: number;
  /** 1–2 sentence essence of the posture */
  summary: string;
  /** Ordered steps to enter the posture */
  setup: string[];
  /** Key alignment/technique cues while holding */
  cues: string[];
  /** Breath pattern guidance for this posture */
  breath: string;
  benefits: string[];
  contraindications: string[];
  /** 1–3 chakras, ordered by relevance */
  chakras: ChakraLink[];
  /** Muscle groups worked, primary emphasis first */
  muscles: MuscleWork[];
  /** A memory hook for recalling this pose's place in the sequence */
  mnemonic: string;
  /** Why the pose sits at this point in the sequence / how class flows into it */
  sequenceNote: string;
  /**
   * Minimal line-art figure of the posture: inner SVG markup (no <svg> tag)
   * drawn in a 0 0 100 100 viewBox, stroke="currentColor", fill="none".
   * Rendered by <PoseFigure/>; omit to fall back to a numbered badge.
   */
  figure?: string;
  /**
   * Class-time structure (sides/sets/interludes), authored separately in
   * `src/data/segments/` and merged by `poses/index.ts`. Segments sum
   * exactly to approxTotalSeconds.
   */
  segments?: PoseSegment[];
}
