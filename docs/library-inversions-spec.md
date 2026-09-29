# Spec — the posture library, first family: inversions (2026-09-29)

Robert: widen the app past the 26 & 2 — live three.js figures for the wider
asana repertoire, each shown WITH its instructions and the sutras that bear on
it; "eventually we find ways to animate the parts that are hard to see with
just bones". This task builds the LIBRARY (a second collection beside the
sequence, never mixed into it) and fills its first family.

Read first: `CLAUDE.md` (all of it — the 26 & 2 pipeline this must NOT
disturb), `scripts/blender/postures/README.md` (the rig contract),
`docs/live-figure-spec.md`, `src/rig/`, `src/data/rig/index.ts`,
`src/components/PoseMotion.tsx` + `FigureRig.tsx` + `useOrbit.ts`,
`src/data/classical/illustrated-index.json`, `sutras-index.json`,
`sutras-brief.md`, `docs/illustrated-index.md`, `docs/sutras-index.md`.

Ground rules: `npm test` (258 / 27) green, `npx tsc -b`, `npm run lint`,
`npm run build` clean; never weaken an assertion; no colours outside the
tokens; never regexes in Bash heredocs; Playwright only under the scratchpad;
do not commit. The 26 & 2 must be byte-for-byte unaffected: `RIG_LIVE`, the
sprite manifest, `public/motion/`, the trainer, the class, the coach.

## The ten postures (ids = `romanised` in the illustrated index)

`salamba-sirsasana-i`, `urdhva-dandasana`, `salamba-sarvangasana-i`,
`halasana`, `karnapidasana`, `supta-konasana`, `parsva-halasana`,
`eka-pada-sarvangasana`, `parsvaika-pada-sarvangasana`,
`setu-bandha-sarvangasana`. The lotus-in-shoulderstand entries (48–50) are
out: the tube rig cannot weave crossed legs.

## 1. Rig data — live only, no sprites

- `scripts/blender/library/<id with _>.py`, the SAME `POSTURE` contract as
  the posture modules (stages with labels/holds/views/frames, optional
  guides and ghost, `position` start/end), 4–8 stages each: the way in, the
  held form, the way out. Use the book's photograph for SHAPE ONLY
  (`illustrated-index.json` gives `pdfPage`; the page PNG is
  `C:/Users/rober/Downloads/yogapic-ocr/page-NNN.png`, looked at with the
  Read tool, never copied). The reach helpers' stderr warnings and a floor
  check (no hand/foot/head tip below z = −0.005 — the crown and forearms
  REST on the floor in headstand, the shoulders and back of the head in
  shoulderstand) must be silent for every stage.
- `render_motion.py`'s full render must NOT pick these up (no sprites).
  `scripts/blender/preview_stages.py` must: `npm run motion:preview
  library:halasana` → `.motion-tmp/preview-library.halasana.png`.
- `scripts/blender/export_rig.py` exports them to
  `src/data/rig/library/<id>.json` (a SUBFOLDER, so `RIG_LIVE`'s `./*.json`
  glob and `rig-data.test.ts` are untouched); `loadRigData('library:<id>')`
  loads them (own lazy chunk each).
- Parity: add Blender fixtures (`export_fixtures.py`) for the headstand and
  shoulderstand held stages — upside-down aims exercise the antiparallel
  `rotationDifference` path hard — and `pose.test.ts` must hold them to 1e-4.
- Optional per stage: `notice: ['neck', 'shoulders', …]` — the body regions
  whose work the bones cannot show (a fixed vocabulary you define and
  document: neck, shoulders, upper-back, lower-back, core, hips, hamstrings,
  quads, calves, feet, wrists, breath). Rendered as TEXT for now (see §3);
  it is the hook for Robert's "animate the parts hard to see with bones" —
  a later task will draw them.

## 2. Content — `src/data/library/`

`types.ts` gets a `LibraryAsana` contract (documented like `Pose`):

```ts
interface LibraryAsana {
  id: string;                 // = illustrated-index romanised
  family: 'inversion';        // union grows with later families
  english: string;            // our label (may reuse the index's)
  steps: { text: string; stage?: number }[];   // 5–9, second person, calm
  hold: string;               // e.g. "Build from 30 seconds toward a few minutes"
  cautions: string[];         // honest, specific (see below)
  prepares?: string[];        // library or 26&2 ids that lead in
  counter?: string[];         // what to do after
  related?: string[];         // 26&2 pose ids with the same action, if any
  sutras: { id: string; note: string }[];
}
```

`sanskrit`, `page`, `pdfPage`, `figures`, `grade`, `roots` come from
`illustrated-index.json` by id — never duplicated. One file per posture
(`src/data/library/<id>.ts`), an `index.ts` access layer
(`libraryAsanas`, `getLibraryAsana`, `libraryFamilies`); views import only
from it.

- **Steps are OUR words**, written from general knowledge of these postures
  and the photograph — do NOT open the OCR text of the book's technique
  pages. `stage` ties a step to the rig stage it describes (for the player).
- **Cautions are the point of an inversion page.** Weight on the forearms
  and shoulders, never the neck; learn headstand and shoulderstand with a
  qualified teacher; folded blankets under the shoulders in shoulderstand
  and plough; skip or modify with neck injury, high blood pressure,
  glaucoma or detached retina, and in pregnancy without guidance; come down
  at the first strain in the neck. Plain statements, no fear-mongering, no
  medical claims beyond these.
- **Sutras honestly.** Patanjali names no asana. Every entry links II.46
  (steadiness and ease) and II.47 (effort relaxed), and only where it truly
  applies II.48 or II.49–50 (the breath after asana). Each `note` is ONE
  sentence of ours on how that principle shows in THIS posture, phrased as
  the tradition ("the tradition's steadiness here is…"). No invented
  posture-specific sutra links.

## 3. The pages

- `/library` — families as sections, the ten as cards (Sanskrit, our
  English, the book's grade as a small pill when it exists). NO WebGL on
  this page (ten contexts is too many); text cards.
- `/library/:id` — the live figure (autonomous stage play, stage chips,
  guides/ghost chips when the sheet has them, the hand orbit, reset —
  reuse the rig path of `PoseMotion`; factor a sprite-free `LiveFigure`
  out of it rather than faking a sprite, and leave the 26 & 2's
  `PoseMotion` behaviour unchanged). Beside/below it: the STEPS as an
  ordered list synchronised with the figure — the step whose `stage` is
  playing is highlighted, clicking a step scrubs the figure to its stage;
  the current stage's `notice` regions as small text chips ("Notice:
  shoulders · neck"); hold; cautions (visible, not collapsed); prepares /
  counter / related as links; "The tradition" panel: each linked sutra's
  id, transliteration, OUR topic label (from `sutras-index.json`) and the
  entry's note; a source line ("The Illustrated Light on Yoga, p. N,
  figs. …") — facts only.
- WebGL unavailable: the page still works — a one-line notice where the
  figure would be; steps and everything else intact.
- Entry points: a "Library" link from `/explore` and from the Timeline
  footer; in the top nav ONLY if the nav still fits at 320 px without
  wrapping (check and report — it was tight with four links).
- Both themes, 360 px phone width, reduced motion (no autonomous play,
  chips still scrub).

## 4. Tests

`src/data/library/library.test.ts`: every library JSON has a
`LibraryAsana` and vice versa; every id is in the illustrated index; every
`step.stage` is a real stage of its sheet; every `notice` term is in the
vocabulary; every sutra id exists and every entry cites II.46 and II.47;
every `prepares`/`counter`/`related` id resolves (library or 26&2); every
inversion has ≥ 4 cautions. Plus the parity fixtures above.

## 5. Originality gate

Every committed text file you wrote (the `src/data/library/*.ts`, docs) is
checked with an 8-word window against BOTH local extractions:
`C:/Users/rober/Downloads/yogapic-ocr/page-*.txt` and
`C:/Users/rober/Downloads/yoga-ocr/page-*.txt` (write the gate as
`scripts/library-originality-gate.py`, logic only, refusing any corpus
path inside the repo). Zero matches or the task is not done. Put its
output in `docs/library.md` (the how/why of the library, short).

## 6. Verify and report

Screenshots (foreground Playwright, scratchpad): `/library`, and
`/library/salamba-sirsasana-i`, `/library/halasana`,
`/library/setu-bandha-sarvangasana` at the held stage with steps
highlighted, orbited to a three-quarter view, both themes, 360 px. Look at
each with the Read tool. Also confirm `/pose/half-moon` and a class start
look exactly as before (one screenshot each). Update `CLAUDE.md` (a
`src/data/library/` bullet; the library rig folder and preview id) and add
a top entry to `CONTINUATION_PROMPT.md`. Report: files, test count, the
gate output, the floor/reach check output, what each screenshot showed,
whether Library made the nav, anything not done.
