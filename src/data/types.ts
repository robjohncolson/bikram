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
  /** Rest position; omitted means supine. Prone rests stay on the belly without a sit-up. */
  orientation?: 'supine' | 'prone';
  kind: 'side' | 'set' | 'rest' | 'situp' | 'breath';
  /** short display label, e.g. "First set — right leg" */
  label: string;
  /** spoken cue at the segment's start, e.g. "Other side." */
  cue: string;
  seconds: number;
  /**
   * Metronome override while this segment runs — Kapalbhati pulses one
   * count per bar, Pranayama keeps its six-count whatever the user set.
   * The tempo (BPM) is never overridden, so the class clock is unchanged;
   * the user's setting returns when the segment ends.
   */
  pacer?: { beatsPerBar: number };
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

/**
 * The classical view of a posture — an optional "go deeper" layer
 * authored separately from the 26 & 2 teaching. It reads each posture
 * against the classical repertoire as B.K.S. Iyengar documents it in
 * *Light on Yoga* (1966): the name's roots, the nearest classical asana
 * and how the 26 & 2 execution differs from it, precision actions that
 * transfer into the hold, hold-here stages, and the ladder of poses the
 * shape comes from and leads to.
 *
 * Everything here is ORIGINAL WORDING. The book is cited by plate number
 * so a reader can open their own copy; it is never quoted, and neither is
 * any other source. Traditional or lineage claims keep the app's honesty
 * rule ("in the Iyengar method…", "traditionally…").
 */
export interface ClassicalNote {
  /**
   * The nearest classical asana, in its usual transliteration (may equal
   * the 26 & 2 Sanskrit name). `null` when the 26 & 2 form has no
   * classical entry — the note then explains what is nearest.
   */
  asana: string | null;
  /** English rendering of the classical name, when it differs from ours */
  asanaEnglish?: string;
  /** Word-by-word Sanskrit roots of the name(s), in our own words */
  etymology: string;
  /**
   * Where to look in *Light on Yoga* — plate numbers and Iyengar's 1–60
   * difficulty grade for the classical form. Include only when verified
   * against a citable source; omit rather than guess.
   */
  reference?: { plates: string; difficulty?: number };
  /**
   * How the 26 & 2 execution differs from the classical form (or from the
   * nearest relative), and why the difference exists. Neither lineage is
   * "corrected" by the other; the contrast is the teaching.
   */
  contrast: string;
  /** Precision actions from the classical method that transfer into the 26 & 2 hold (2–5) */
  refinements: string[];
  /** Hold-here-if-not-yet stages toward the full form, easiest first (1–4) */
  stages: string[];
  /** Preparatory classical poses (`before`) and where the shape leads (`beyond`) */
  ladder: { before: string[]; beyond: string[] };
}

/** One held stage inside a motion sprite, addressed by 0-based frame. */
export interface MotionStage {
  label: string;
  frame: number;
}

/** A body position a motion sheet opens or closes in (see `PoseMotion.position`). */
export type Position = 'standing' | 'supine' | 'prone' | 'kneeling' | 'seated';

/** A rendered motion sprite sheet: square cells laid out row-major. */
export interface PoseMotion {
  /** public URL of the PNG sheet */
  sprite: string;
  /**
   * optional guides layer (reference lines/planes, no body): same frame
   * layout as `sprite`, blank where a stage has no guides
   */
  guides?: string;
  /**
   * optional ghost layer (a second figure in the common-mistake pose):
   * same frame layout as `sprite`, drawn only during that stage's hold
   */
  ghost?: string;
  /** cell size in px (square) */
  frame: number;
  /** total frame count */
  frames: number;
  /** grid columns in the sheet */
  cols: number;
  /** intended playback rate */
  fps: number;
  /** camera view the sequence opens on */
  view: string;
  /**
   * the body position of the sheet's first and last stage; when the class
   * figure changes sheet between different positions a hand-off bridge
   * (`bridge:<start>-<end>`, see `bridgeFor`) plays first
   */
  position?: { start: Position; end: Position };
  /** held stages, in order, with the frame each begins on */
  stages: MotionStage[];
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
   * Animated line-art figure: a sprite sheet rendered from the Blender
   * mannequin rig (`scripts/blender/`), merged by `poses/index.ts` from the
   * GENERATED `src/data/motion/manifest.ts`. The sheet is a grayscale
   * luminance mask drawn over currentColor, so one render serves both themes.
   */
  motion?: PoseMotion;
  /**
   * Class-time structure (sides/sets/interludes), authored separately in
   * `src/data/segments/` and merged by `poses/index.ts`. Segments sum
   * exactly to approxTotalSeconds.
   */
  segments?: PoseSegment[];
  /** the classical (Light on Yoga) view of the posture; merged in by poses/index.ts */
  classical?: ClassicalNote;
}

// ---------------------------------------------------------------- live rig

/** A world-space vector (x to the mannequin's left, y backward, z up). */
export type RigVec3 = [number, number, number];

/**
 * One bone in a rig stage, exactly as authored in the Blender posture
 * module: the world direction the bone points (head → tail), or that
 * direction plus a roll in degrees about it (see
 * `scripts/blender/postures/README.md`).
 */
export type RigBoneEntry = RigVec3 | { dir: RigVec3; roll?: number };

/** A stage pose: bone name → entry, plus the optional `pelvis.location` world offset. */
export type RigStagePose = Record<string, RigBoneEntry>;

/** A teaching guide: a line, or a pane perpendicular to x or y. */
export type RigGuide =
  | { from: RigVec3; to: RigVec3 }
  | { plane: 'x' | 'y'; at: number; z?: [number, number]; w?: number };

/** Ortho framing: the height the camera centres on and the metres it shows top to bottom. */
export interface RigFrame {
  center_z: number;
  scale: number;
}

/** One held stage of a rig sheet (the same stages, in the same order, as the sprite's). */
export interface RigStage {
  label: string;
  /** hold length in sheet frames */
  hold: number;
  /** camera view for this stage (else the sheet's) */
  view?: string;
  /** camera framing for this stage (else the sheet's) */
  frame?: Partial<RigFrame>;
  pose: RigStagePose;
  guides?: RigGuide[];
  /** the common mistake, laid over `pose` */
  ghost?: RigStagePose;
  /** library sheets only: the regions whose work the bones cannot show (see `NoticeRegion`) */
  notice?: NoticeRegion[];
  /** library sheets only: the palms carry the back here (contact-checked in Blender and in library.test.ts) */
  palms?: 'back';
  /** library sheets only: the fingers lace here — the two hands' finger regions are then exempt from the clearance check (`src/rig/clearance.ts`) */
  hands?: 'laced';
}

/**
 * A posture (or bridge) as the live three.js figure reads it: the Blender
 * module's stages exported to JSON by `scripts/blender/export_rig.py`
 * (GENERATED — `src/data/rig/<id>.json`).
 */
export interface RigData {
  id: string;
  view: string;
  frame: RigFrame;
  position: { start: Position; end: Position };
  /** frames between two stages at the sheet's fps */
  transition: number;
  stages: RigStage[];
}

// ---------------------------------------------------------------- the library

/**
 * The body regions a library stage can ask you to NOTICE: the work the tube
 * rig's bones cannot show (a neck kept long, shoulders that lift, the
 * breath). A fixed vocabulary, shared with the Blender helper
 * (`scripts/blender/library/_lib.py NOTICE`) and pinned by
 * `library.test.ts`. Rendered as text chips for now; it is the hook for a
 * later layer that draws them.
 */
export type NoticeRegion =
  | 'neck'
  | 'shoulders'
  | 'upper-back'
  | 'lower-back'
  | 'core'
  | 'hips'
  | 'hamstrings'
  | 'quads'
  | 'calves'
  | 'feet'
  | 'wrists'
  | 'breath';

/**
 * One point the lineage makes — B.K.S. Iyengar, The Illustrated Light on
 * Yoga — in OUR words, with the printed page it comes from (the book's
 * printed pages run 1–162; `library.test.ts` holds every reference to it).
 */
export interface LineageNote {
  text: string;
  /** printed page in The Illustrated Light on Yoga */
  page: number;
}

/**
 * Library families, in the order `/library` shows them. The lotus
 * shoulderstands belong to `inversion`, as the book groups them; `lotus`
 * holds the crossed-leg seats (siddhasana, the lotus and the poses built
 * on it).
 */
export type LibraryFamily = 'standing' | 'backbend' | 'seated' | 'lotus' | 'inversion' | 'twist';

/**
 * One posture of the LIBRARY — the wider classical repertoire, a second
 * collection beside the 26 & 2 and never mixed into it (not in the class,
 * the trainer or the coach). Drawn only by the live figure from
 * `src/data/rig/library/<id>.json`.
 *
 * Only what is ours lives here. The Sanskrit name, printed page, scan page,
 * photograph numbers, grade and name roots come from
 * `classical/illustrated-index.json` by `id` and are never duplicated.
 * FAITHFUL TO THE LINEAGE, IN OUR WORDS: Patanjali gives no technique or
 * cautions for any asana, so steps, holds and cautions follow the hatha
 * lineage as Iyengar teaches it in the book (read for facts, never
 * copied: `scripts/library-originality-gate.py` checks every file), and
 * every caution carries its page. No modern additions.
 */
export interface LibraryAsana {
  /** = the illustrated index's `romanised` id (rig sheet `library:<id>`) */
  id: string;
  family: LibraryFamily;
  /** our English label (may reuse the index's) */
  english: string;
  /**
   * How to do it, 5–9 steps, second person, calm. `stage` ties a step to the
   * rig stage it describes (index into the sheet's stages): the page
   * highlights it while that stage plays, and clicking it scrubs there.
   */
  steps: { text: string; stage?: number }[];
  /** how long, as the book gives it (with its page) */
  hold: string;
  /** what the lineage asks: the book's own cautions, attributed and page-cited — nothing it does not say */
  cautions: LineageNote[];
  /** what leads in: library ids or 26 & 2 pose ids */
  prepares?: string[];
  /** what to do after: library ids or 26 & 2 pose ids */
  counter?: string[];
  /** 26 & 2 pose ids with the same action, if any */
  related?: string[];
  /**
   * Sutras that bear on it. Patanjali names no asana and gives no
   * technique: every entry cites II.46 and II.47, II.48 only in its own
   * meaning; II.49 (breath practice, which follows posture) is not a
   * posture sutra. `note` is ONE sentence of ours saying what the sutra
   * itself says, applied minimally — no claims it does not make.
   */
  sutras: { id: string; note: string }[];
}
