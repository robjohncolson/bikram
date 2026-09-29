# Spec — widen the live figure to every posture (2026-09-29, afternoon)

The live three.js rig (`docs/live-figure-spec.md`, commit `ec7207a`) is proven on
Half Moon. Widen `RIG_LIVE` to ALL 26 postures — but only after each posture's
live figure has been checked against its sprite and the generic problems fixed.
A class must never mix renderers between postures once this ships: the set is
all or nothing at the end of this task (all).

Read `CLAUDE.md` (the `src/rig/`, `src/data/rig/`, `PoseMotion renderer` bullets),
`docs/live-figure-spec.md`, `src/components/figureRigScene.ts`,
`src/components/FigureRig.tsx`, `src/rig/body.ts`, `src/data/rig/index.ts`.

Ground rules: as in the first spec — `npm test` (214 / 21) stays green, `npx tsc -b`,
`npm run lint`, `npm run build` clean; no colours outside the tokens; no
`npm run motion`; never weaken an assertion; write scripts with the Write tool,
never regexes in heredocs; do not commit.

## 1. A contact sheet per posture — the proof

Write a scratchpad Playwright script (NOT a repo dependency; `npm run dev`
first) that, for every id with rig data (26 postures + 8 bridges), opens
`/pose/<id>?figure=rig` (bridges: use a small dev-only route or the
posture page of a posture whose class plan bridges — simpler: render bridges
through the same page by temporarily allowing `?rig=<bridge id>` on
PoseDetail, dev-only, REMOVED before you finish), clicks every stage chip on
BOTH figures (sprite and live are side by side on the page with the flag on)
and screenshots the two figure discs at each stage. Stitch (or just save)
one image per posture under the scratchpad `rollout/<id>.png` with the stage
labels. Look at EVERY sheet with the Read tool. Do the same for the 8
bridges' stages (they matter in class mode).

For each posture write one line in `docs/live-figure-rollout.md` (committed):
`| id | ok / fixed / known | note |`. "known" means a cosmetic difference you
judged acceptable (say what). This table is the deliverable Robert reads.

## 2. Fix what the sheets show — generically, never per posture

Expected problem classes (from the first pass and the rig's nature); fix each
in the renderer or `body.ts`, never by editing posture data:
- **Joint kinks / gaps** where a bent limb's two tubes meet (elbows, knees,
  hips in folds): the joint sphere must cover the wedge — check the sphere
  radius vs the tube radii at the joint and the `BODY_SCALE` interaction.
- **Armpit / crotch strokes** the sprite lacks (the skin modifier merges
  tubes; ellipsoids don't): tune `DEPTH_JUMP` / the normal-crease test or
  add a small blend sphere at shoulder/hip joints; verify on Stand and on a
  fold.
- **Lying postures** (savasana, wind removing, cobra, locust, full locust,
  bow, fixed firm's back, the sit-up): the ortho camera framing per stage
  (`stageCamera`) and the floor line — no floor is drawn, so the figure
  must sit where the sprite sits in the disc.
- **Twists and rolls** (spine twisting, triangle, standing separate leg
  head-to-knee): the riding clavicles must turn with the rolled spine —
  parity already proves the joints; check the STROKES read as the sprite's.
- **Hands and feet**: palm/ball/heel swellings present and not detached.
- **Guides and ghost** on every posture that has them (all but savasana's
  ghost): planes read as rectangles face-on and lines edge-on; the ghost
  sits under the figure at the right stage.
- **Stroke weight** consistent across views and sizes; jaggedness at DPR 1:
  render the edge target at 2× and downsample (supersample) if it keeps a
  blend frame under the 8 ms / 4× budget at the class-mode size — measure
  and report; otherwise leave it and say so.
- **Kapalbhati / Pranayama** breath sheets: the pulse and the scrub must
  read (check with the chips; class mode drives them from the metronome).

Unit-test anything pure you add (body recipe changes: joint coverage; camera
framing tables).

## 3. Class mode, end to end

With `RIG_LIVE` widened, run `/pace?program=short` (no flag: the live set
alone must give the rig) and the full class start (`/pace`) through the
first floor posture at least, screenshotting every ~10 s: the hand-off
BRIDGES must play as poses (standing → supine into savasana; supine →
prone into cobra; the sit-up) with no cut except the by-design
canonical-pose cut; the ghost/guide flashes on coaching lines; pause and
resume; a skip with Next. Note the dev tab throttles in the background —
keep it foregrounded or verify with the unit tests where you can't watch.
Also `/pose/<id>` for three lying postures at 360 px width.

## 4. Flip the set

`RIG_LIVE` = every posture id with rig data (derive it from the data, don't
list 26 strings; keep the export and its type). Posture pages: keep showing
sprite AND live side by side (Robert likes seeing both) — that is already
the `RIG_LIVE` behaviour. Update the `src/data/rig/index.ts` docs, the
`CLAUDE.md` rollout sentence, `rig-data.test.ts` if it pins the set, and
add a `✔` entry at the top of `CONTINUATION_PROMPT.md` (what you fixed,
the table's summary counts, measurements, what's left). Remove any dev-only
route you added.

## 5. Report

Files changed; new test count; the rollout table's counts (ok/fixed/known);
the supersampling decision with numbers; which class-mode screenshots you
took and what they showed; anything not done.
