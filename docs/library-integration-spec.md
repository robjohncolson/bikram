# Spec — integrating the library fan-out (2026-09-30)

The six fan-out groups (`docs/library-fanout-spec.md`) are merged into
`main`: 56 library sheets, 56 entries. This pass makes the merged library
whole. Read `CLAUDE.md`, `scripts/blender/library/README.md` and both
earlier library specs first. Ground rules as before: the checks stay
silent; tests, tsc, lint and build clean; the gate at zero; never weaken
an assertion except where this spec narrows one to its stated intent; the
26 & 2 stays byte-for-byte unaffected; no regexes in Bash heredocs;
Playwright only under the scratchpad; do not commit.

## 1. Shared tests

- **Trunk across (`library.test.ts` "keeps the hips and chest across the
  body").** Its intent is to catch a trunk bone aimed EXACTLY opposite its
  rest direction: the shortest arc then turns about a diagonal, and the
  trunk's width swings front to back. As written, it caps every sideways
  tilt past ~26° and every roll. That rules out the triangles and side
  angles (group A fails it now) and the twists (group E posed jatara at
  8° instead of the book's full lie to keep it green). Narrow it to that
  intent: the trunk's width axis must stay within a bound of the width
  the stage's AUTHORED direction and roll imply (an aim-plus-roll that
  ends where it was asked to is fine; an unasked diagonal turn is not).
  Keep teeth: a synthetic trunk aimed exactly (0, 0, −1) with no roll must
  still fail.
- **Timeout.** "keeps every limb out of every other in every held stage
  and ghost" needs an explicit timeout, like the transition test's
  (`180_000`). Check the other heavy tests too.
- **Final counts.** Pin 56 entries and each family's membership by id
  (standing 10, backbend 9, seated 12, lotus 7, inversion 13, twist 5),
  in the book's order.
- `vitest` must never collect `.claude/**` (agent worktrees): exclude it in
  the vitest config, and add `.claude/worktrees/` to `.gitignore`.

## 2. Shared helpers the groups reported

- Move group E's rolled-trunk support (`_twist.py`'s `roll`, roll-aware
  `fk`, the checks) into `_lib.py` as the SHARED way to roll non-leaf
  bones, with the riding-children rule and the TS-parity proof as a
  permanent test (a Python fixture of rolled stages matched by `pose.ts`
  within 1e-4, as `_selftest.py --write` does for clearance). Keep
  `_twist.py` as a thin import, or delete it and update the imports. Update
  the README's "rolls only on leaf bones" rule.
- Add to `_lib.py`: a lying-back body with the head toward +Y (group D
  built its own in `_lotus.py`); clavicles that follow the chest in deep
  folds (group A); the planted-contact rule (a hand or foot is held in
  place between stages only when that joint is within 3 cm of the floor,
  group B's `flat_hand`/`FINGER_Z`), documented in the README.
- Do not re-pose sheets merely to use the new helpers. The exception is 3.

## 3. Re-pose where the narrowed test allows the book's form

- `jatara-parivartanasana`: the legs lie together at the side, as the book
  has it (group E measured a clean 75° pelvis roll).
- With the trunk able to turn about the vertical, `virabhadrasana-i` and
  `parsvottanasana` get the book's turn (hips square to the front leg) if
  that reads better. Two sides only if it fits in 8 stages.
- `parsva-pindasana-in-sarvangasana`: group D said the figure puts the
  RIGHT knee nearer the head, while the book, for the side it shows, has
  the LEFT knee by the right ear. Check the book's photograph and text
  (facts only) and make the figure match its own step text.
- Any other sheet the new test or helpers let you bring closer to the
  book: name each one in the report, and keep the changes small.

## 4. Content across the groups

The groups could only link to ids in their own group. Now fill in
`prepares`/`counter` across the whole library where the book's own course
tables and sequences (`illustrated-courses.json`, facts only) or the
obvious lineage links support it: dandasana before the seated folds,
tadasana before the standing poses, the shoulderstand cycle, and so on.
Every link must resolve. Check every family's steps against its sheet
(every stage-bound step describes the pose on screen) and every caution's
page.

## 5. Families on the page

`FAMILY_TEXT`, in our words: `backbend` also holds the arm-support poses
(chaturanga, the dogs, purvottanasana), and `twist` also holds the
reclining leg stretches (supta padangusthasana). Retitle and re-blurb
them to say so. `/library` with 56 cards must stay usable at 360 px. If
it isn't, add a small in-page family index (links to the section
headings); no new dependency.

## 6. The reach report

Collect every group's reach shortfalls into ONE table in `docs/library.md`
(posture, the book's grip, the gap in cm, what the figure holds). This is
the evidence for a decision Robert has not made yet: whether the library
figure should get its own arm proportions. Do NOT change bone lengths.

## 7. Verify and report

`npm run rig:export`; `_selftest.py`; every module silent; tests, tsc, lint,
build; the gate (its `ALWAYS` list gains the fan-out and integration
specs). Look at the preview of every sheet you changed. Screenshots at
360 px, both themes, under the scratchpad: `/library` (top and one scrolled
view), and one posture page per family at its held stage. Look at each
with the Read tool. Also confirm `/pose/half-moon` looks as before. Update
`CLAUDE.md` (the library bullet: 56 postures, six families, the rolled-trunk
helpers, the planted-contact rule) and add a top entry to
`CONTINUATION_PROMPT.md`.

Report:
- files and test count;
- the trunk test before and after (which sheets it caught, how it was narrowed);
- each re-posed sheet and why;
- the parsva pindasana finding;
- links added;
- the reach table;
- the gate output;
- what each screenshot showed;
- anything not done.
