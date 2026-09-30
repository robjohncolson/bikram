# Spec — the library fan-out: the rest of The Illustrated Light on Yoga (2026-09-29)

Robert: "fan out and do the same with the rest of the asanas from Iyengar".
The library holds 13 postures (ten inversions, siddhasana, padmasana, the
lotus shoulderstand). This task adds the remaining 43 asanas of the
illustrated index, one agent per group, IN PARALLEL, each in its own git
worktree. `savasana` is left out: its id is already a 26 & 2 posture, and
the library never shares an id with the sequence (tested). Pranayama and
dhyana entries are not asanas and stay out.

## Read first (every agent)

`CLAUDE.md` (all of it), `scripts/blender/library/README.md` (THE
authoring contract: files, checks, solvers, lotus rules, framing, content
rules), `scripts/blender/postures/README.md` (the rig), `docs/library.md`,
`docs/library-lotus-rig-spec.md` (what the last task found), and the
reference sheets `padmasana.py`, `salamba_sarvangasana_i.py`,
`salamba_sirsasana_i.py` with their `src/data/library/*.ts`. Where the 26 & 2
has a posture module for the same shape (for example `triangle.py`,
`camel.py`, `cobra.py`, `locust.py`, `bow.py`, `head_to_knee_stretching.py`,
`spine_twisting.py`, `fixed_firm.py`), you may IMPORT canonical poses from
it the way `_lib._posture_module` does. Never edit it. The library's form
is Iyengar's: where it differs from the 26 & 2 execution, pose the book's.

## The groups

| agent | family | ids (illustrated-index `romanised`) | own helper files |
|---|---|---|---|
| A | `standing` | tadasana, utthita-trikonasana, utthita-parsvakonasana, virabhadrasana-i, virabhadrasana-ii, parsvottanasana, prasarita-padottanasana, padangusthasana, padahastasana, uttanasana | `_standing.py`, `common-standing.ts` |
| B | `backbend` | salabhasana, dhanurasana, chaturanga-dandasana, bhujangasana-i, urdhva-mukha-svanasana, adho-mukha-svanasana, ustrasana, purvottanasana, urdhva-dhanurasana | `_backbend.py`, `common-backbend.ts` |
| C1 | `seated` | dandasana, paripurna-navasana, ardha-navasana, virasana, supta-virasana, baddha-konasana | `_seated.py`, `common-seated.ts` |
| C2 | `seated` | maha-mudra, janu-sirsasana, trianga-mukhaikapada-paschimottanasana, marichyasana-i, upavistha-konasana, paschimottanasana | `_folds.py`, `common-folds.ts` |
| D | `lotus` / `inversion` | parvatasana, matsyasana, baddha-padmasana, yoga-mudrasana, ardha-baddha-padma-paschimottanasana (`lotus`); pindasana-in-sarvangasana, parsva-pindasana-in-sarvangasana (`inversion`) | `_lotus.py`, `common-lotus-bound.ts` |
| E | `twist` | jatara-parivartanasana, supta-padangusthasana, bharadvajasana, marichyasana-ii, ardha-matsyendrasana | `_twist.py`, `common-twist.ts` |

Per posture you write exactly two files: `scripts/blender/library/<id with
_>.py` and `src/data/library/<id>.ts`. Beyond those you may write your
group's own helper files (the table) and the generated
`src/data/rig/library/<id>.json` from `npm run rig:export`.

**Do not edit ANY shared file:** `_lib.py`, `_hull.py`, `_selftest.py`,
the library README, `src/rig/**`, `src/data/types.ts`,
`src/data/library/index.ts`, `common.ts`, `common-lotus.ts`,
`library.test.ts`, views, CSS, docs, `CLAUDE.md`, `CONTINUATION_PROMPT.md`,
the gate, or anything of the 26 & 2. If a shared helper is wrong or
missing, work around it in your own helper file and REPORT it; the
integration pass fixes shared code. Other agents are writing the other
groups at the same time.

## The bar for every posture

- Stages: 4–8, the way in, the held form (longest hold), the way out.
  Two-sided postures show the right side and then the left; if that does
  not fit in 8 stages, show one side and leave the "repeat on the other
  side" step UNBOUND (no `stage`). Every stage-bound step must describe
  the pose on screen.
- Silent checks: `python scripts/blender/library/<id>.py`,
  `npm run rig:export` and `npm run motion:preview library:<id>` print no
  floor/reach/contact/clearance warning. `npm test` green in your worktree,
  including the transition clearance and framing tests.
- LOOK at every preview with the Read tool, and at the book's photograph
  (`illustrated-index.json` `pdfPage` →
  `C:/Users/rober/Downloads/yogapic-ocr/page-NNN.png`), which is for SHAPE
  ONLY. A yoga teacher should name the posture and every stage from the
  strip without the labels. Pick the view that shows the shape (folds and
  backbends from the side, side bends from the front, twists from the
  quarter or back).
- Content per the README's content rules: steps, holds and cautions
  follow the book, read for facts (the OCR `page-NNN.txt`) and written in
  our own words; every caution attributed to its printed page
  (printed = PDF − 17); no modern safety boilerplate; the book giving no
  caution means none is invented. Sutras: II.46 and II.47 always, II.48
  only in its own meaning. `prepares`/`counter`/`related` must resolve
  (library ids from ANY group are fine to name only if they are in the
  table above or already in the library; `related` is 26 & 2 ids only).
- Originality: `python scripts/library-originality-gate.py` → 0 matches.

## Known rig limits (decide, don't fight)

- The arms are a hand short of the feet: the bound lotus (baddha padmasana,
  yoga mudrasana, ardha baddha padma paschimottanasana) cannot hold the toes
  behind the back (the bind was measured 15–26 cm short). Show the hands
  behind the back reaching toward the feet as far as the rig reaches,
  silently, and REPORT the shortfall. In the step text, describe the book's
  full form; the report is where the gap is recorded. Forward folds that
  clasp beyond the feet (paschimottanasana) take the shins, ankles or feet
  as far as reach allows; report which.
- The second lotus foot rests on the first shin (the README).
- No breath on the figure; `notice: ['breath']` is how to say it.

## Worktree mechanics

Your worktree has no `node_modules`: first run
`cmd //c mklink /J node_modules "C:\Users\rober\Downloads\Projects\not-school\bikram\node_modules"`
from the worktree root (a junction; do not `npm install`). Blender 5.2.1 is
found by the npm scripts. Several Blenders run at once across the agents,
so preview only the sheet you are tuning, never `npm run motion`. No regexes
in Bash heredocs; write patch scripts with the Write tool. Playwright is
not needed in the fan-out; the integration pass takes the screenshots.

When done, COMMIT your files on your worktree branch (one commit, message
"Library: <family> — <ids>", ending with the line
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). Do NOT push or
merge.

## Report (short, factual)

Per posture: stages, view, what the preview shows, any compromise. Plus:
the reach shortfalls, any shared-helper problem you worked around, test
count, gate output, the branch name and commit hash.

## Integration (the orchestrator, after all groups)

Merge the branches, `npm run rig:export`, pin the final counts in
`library.test.ts` (43 + 13 = 56 entries; the family membership), retitle
the families (`backbend` also holds the arm-support poses, `twist` also
holds the reclining leg stretches), update the docs, run the full checks
and screenshots, send the diff to Codex for review, then fix, commit and push.
