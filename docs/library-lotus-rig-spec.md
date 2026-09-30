# Spec — a lotus-capable rig, and the library ready to fan out (2026-09-29)

Robert: build the whole Light on Yoga repertoire into the library, and
"work on designing the rig to handle the lotus family first". The first
library task left out the lotus postures, saying "the tube rig cannot weave
crossed legs". That was never tested. This task tests it, gives the rig
what it needs, proves it on three postures, and gets the library ready for
the remaining ~44 postures to be written by parallel agents.

Read first: `CLAUDE.md` (all of it), `docs/library-inversions-spec.md` and
`docs/library.md` (the library contract this extends),
`scripts/blender/postures/README.md` (the rig contract),
`scripts/blender/library/_lib.py`, `src/data/library/` (`index.ts`,
`common.ts`, `library.test.ts`), `src/rig/` (`pose.ts`, `body.ts`),
`src/data/types.ts` (`LibraryAsana`, `LibraryFamily`, `RigStage`).

Ground rules, as before: `npm test`, `npx tsc -b`, `npm run lint` and
`npm run build` clean; never weaken an assertion; the 26 & 2 stays
byte-for-byte unaffected (`RIG_LIVE`, the sprite manifest, `public/motion/`,
the posture/bridge modules and their JSON, the trainer, class and coach);
no regexes in Bash heredocs (write patch scripts with the Write tool);
Playwright only under the scratchpad; do not commit.

## What the probe found (orchestrator, before this spec)

A throwaway `padmasana.py` in the library folder, rendered with
`npm run motion:preview`. The probe is in the scratchpad
(`padmasana-probe.py`, and `preview-library.padmasana.png` beside it). The
scratchpad is
`C:/Users/rober/AppData/Local/Temp/claude/C--Users-rober-Downloads-Projects-not-school-bikram/05b48cf7-9ed3-4810-aa4d-f02af64383e8/scratchpad/`.

1. **The naive solve fails.** `_lib.leg()` (two-bone with a knee hint) sent
   the knees up and forward, 18–26 cm off the floor, and the legs
   interpenetrated by 2–11 cm. The render was one blob.
2. **The geometry is the constraint, not the rig.** The thigh and the shin
   are both 0.44 m. A knee that is a thigh-length from its own hip AND a
   shin-length from its ankle lies on a circle, the intersection of the two
   spheres. With the ankle deep in the opposite groin, that circle sits
   near the midline, so wide knees cannot happen. Putting the ankle about
   20–28 cm in front of the hip line, on top of the opposite thigh, lets
   the knees rest wide on the floor.
3. **A clean lotus exists.** The probe used `knee_on(hip, ankle, z, out)`:
   the circle's point at the floor height z = 0.06, on the `out` side. The
   pelvis joint was at (0, 0.05, 0.14), the right ankle at (0.08, −0.15,
   0.18) (the right foot goes first, on the left thigh) and the left ankle
   at (−0.08, −0.23, 0.30), over it. The knees came out 0.57 m apart, both
   on the floor. With rough capsule radii (thigh 0.065, shin 0.05, foot
   0.04), shin–shin cleared by +0.9 cm, shin-on-thigh by +1.2 cm and
   foot-on-thigh by +0.5 cm. The render reads as crossed legs from the
   front: an X of shins over the lap, knees wide.
4. **What is still missing.** The soles do not face up (a foot needs a
   roll, and `_lib.direction` refuses rolls). There is no interpenetration
   check, so step 1's blob would have passed every existing test. The arms
   reaching for the knees were 1.4–4.7 cm short. The figure is small in a
   seated frame.

## 1. Rig capability (`scripts/blender/library/_lib.py` + tests)

- **Leg solvers, in the PELVIS'S OWN FRAME**, so one lotus rides into any
  trunk orientation: seated, lying back (matsyasana), upside down (the
  lotus shoulderstands) and folded (pindasana). All legs-only:
  - `knee_on` (above, generalised: a knee plane or height in the pelvis
    frame, and an `out` side).
  - `lotus(pose, first='R', …)`: full lotus, each ankle resting ON the
    opposite thigh's rendered surface, and the second shin passing OVER
    the first.
  - `half_lotus(pose, side, other=…)`: one foot on the opposite thigh,
    the other leg as given.
  - `siddha(pose)`: one heel at the perineum, the other heel stacked just
    above it, the shins crossed and the knees on the floor.
  - `foot_sole(pose, side, facing)`: aims and ROLLS a foot so its sole
    faces `facing` (up in lotus), using the rig's own heel and ball
    swellings. Prove it with a test that the ball/heel vertices of the
    solved pose sit on the sole side.
  - Radii come from `SKIN_FIT` (the rendered hull), not guesses.
- **Rolls in the library.** Let `_lib.direction`/`fk` accept `{dir, roll}`
  at least on LEAF bones (foot, hand). A roll on a leaf never moves a
  joint, so the Python FK stays exact; say so in the docstring. If you
  allow rolls anywhere else, the Python FK must follow the renderer's
  riding-children rule, and a test must prove it.
- **A clearance check: limbs never pass through each other.**
  - Python: `check(POSTURE)` gains a `clearance warning` (stderr, silent
    on a clean export) for every pair of body tubes that are not adjacent
    in the skeleton (not sharing a joint) and interpenetrate by more than
    1 cm. Held stages and ghosts both.
  - TS: `library.test.ts` gets the same test on the RENDERED hull
    (`bodyRecipe` + `placeBone`/`placeJoint`/`jointRadii`, as `hullLow`
    does). Run it over every held stage AND over sampled in-betweens
    (`groundedSheetPose`, the path the library draws, at least 8 samples
    per transition). Give the test teeth: step 1's naive lotus must fail
    it.
  - Pairs that share a joint are exempt (a deep knee bend folds the calf
    into the hamstring). Any other exemption has to be a named,
    documented rule. Never set the tolerance per posture.
  - Run it over the ten existing inversions. Fix any violation by
    re-posing (karnapidasana's knees by the ears, the plough's hips over
    the face are the likely ones). Report what you found and fixed.
- **Transitions.** Blending a sitting pose into a lotus sweeps one shin
  straight through the other. The way in is authored one leg at a time,
  with midpoints: the knee lifts, the foot is carried over, the foot is
  set down. The in-between clearance test must pass.
- **Framing.** A `SEATED_FRAME` (and whatever the lotus inversions need)
  big enough that the crossed legs read in the app's disc at 360 px.
- **Parity.** Add a Blender fixture for padmasana's held stage (a rolled
  leaf and crossed chains) to `export_fixtures.py`. `pose.test.ts` must
  hold it to 1e-4.

## 2. Three proof postures (full library entries)

Each is a complete library entry, the same contract as the inversions
(sheet, content, lineage cautions with printed pages, sutras II.46/II.47
(+ II.48 only in its own meaning), steps walking the sheet forward):
- `padmasana` (book no. 25): the way in one leg at a time, the held lotus,
  the way out.
- `siddhasana` (no. 21): stacked heels, crossed shins.
- `urdhva-padmasana-in-sarvangasana` (no. 48): the lotus UPSIDE DOWN in
  the shoulderstand (the pelvis-frame solver pays off here). Reuse the
  inversion helpers.

Book photographs are for SHAPE ONLY: `illustrated-index.json`'s `pdfPage`
→ `C:/Users/rober/Downloads/yogapic-ocr/page-NNN.png`, looked at with the
Read tool. Steps, holds and cautions follow the book's teaching, read for
facts and never copied (see `docs/library.md` and the memory rule: lineage
cautions only, attributed and page-cited, no modern boilerplate). Look at
every stage in `npm run motion:preview library:<id>`. A yoga teacher
should name each posture from the strip without its label, and the front
view of the lotus must show the feet on the thighs, soles up.

**Arm reach, a report only.** Baddha padmasana binds the hands behind the
back to the big toes. Probe whether the rig's arms can reach the lotus
toes behind the back without a clearance or reach warning, and report the
shortfall in cm if they cannot. Do not change bone lengths: that would
break the 26 & 2's sprite parity.

## 3. Ready the library for the fan-out

The next task writes ~44 postures in parallel, one agent per family, and
those agents must never have to edit the same file:
- `LibraryFamily` = `'standing' | 'backbend' | 'seated' | 'lotus' |
  'inversion' | 'twist'`. The lotus shoulderstands (nos. 48–50) belong to
  `inversion`, as the book groups them. `FAMILY_TEXT` gets a title and
  blurb for each, in our words, in that order on `/library`.
  `libraryFamilies` lists only non-empty families.
- `src/data/library/index.ts` DISCOVERS the posture files
  (`import.meta.glob('./*.ts', { eager: true })`, keeping modules whose
  exports include a `LibraryAsana`; `index`/`common`/`*.test` excluded)
  and orders `libraryAsanas` by the illustrated index's `bookNumber`.
  Adding a posture is then two new files (content + rig module) and
  nothing shared. Keep the other exports and their behaviour the same.
- `common.ts` stays the home of shared lineage notes. Families that need
  their own go in `common-<family>.ts`, so parallel agents never touch
  each other's files. Same in Blender: family helpers go in
  `scripts/blender/library/_<family>.py`, importing `_lib.py`, and
  `_lib.py` is not edited in the fan-out.
- Generalise the tests that name the inversions
  (`groups the ten inversions under one family` → every family's members
  in book order, inversions still ten + the lotus one). Loosen nothing
  else.
- Write `scripts/blender/library/README.md`: the library authoring
  contract for the fan-out agents (solvers available, the checks and
  what silent means, framing per position, the lotus rules, the
  one-leg-at-a-time transitions, `notice`/`palms`, the content rules,
  preview command, the gate). Keep it short and exact, like
  `postures/README.md`.
- The originality gate's `ALWAYS` list gains this spec.

## 4. Verify and report

`npm run rig:export`. Tests, tsc, lint, build. The originality gate at
zero. Previews of all three proof postures, looked at with the Read tool.
Playwright screenshots under the scratchpad: `/library` (the new family
headings), `/library/padmasana` at the held stage (front and orbited to a
three-quarter view), `/library/urdhva-padmasana-in-sarvangasana`, both
themes, 360 px. Then update `CLAUDE.md` (the library bullet: lotus
solvers, clearance check, discovery index, families) and add a top entry
to `CONTINUATION_PROMPT.md`.

Report:
- files and test count;
- the clearance findings on the inversions and how they were fixed;
- the gate output;
- the floor/reach/contact/clearance check output (must be silent);
- what each preview and screenshot showed;
- the baddha padmasana reach result;
- anything not done.
