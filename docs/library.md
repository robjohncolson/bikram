# The posture library

A second collection beside the 26 & 2, never mixed into it: postures from the
wider classical repertoire, each drawn by the live figure next to our own
instructions, its cautions, and the sutras that bear on it. The first family
was the inversions (ten postures: the headstand and the shoulderstand with
their variations); the crossed-leg seats followed once the rig learned to
cross the legs (`docs/library-lotus-rig-spec.md`): siddhasana, padmasana
and the lotus in the shoulderstand. Six parallel groups then wrote the rest
of the book's asanas (`docs/library-fanout-spec.md`), and an integration
pass made them one library (`docs/library-integration-spec.md`): 56
postures in six families — standing (10), backbends and arm supports (9),
seated (12), crossed legs (7), inversions (13), twists and lying leg
stretches (5). The index discovers the posture files
(`scripts/blender/library/README.md` is the authoring contract).

## How it is built

- **Rig data** — `scripts/blender/library/<id with _>.py`, the same `POSTURE`
  contract as the posture modules, plus an optional per-stage `notice` (the
  body regions whose work the bones cannot show) and `palms: 'back'` where
  the hands carry the back. `_lib.py` holds the shared solvers. Each module ends with `check(POSTURE)`: forward kinematics over
  every stage and ghost prints a `floor warning` for any joint below
  z = −0.005, and the reach solvers print `reach warning`s. Both are silent.
- **No sprites.** `render_motion.py` only finds these for the stage preview
  (`npm run motion:preview library:halasana` →
  `.motion-tmp/preview-library.halasana.png`); the full render and the
  manifest never see them.
- **Export** — `npm run rig:export` writes `src/data/rig/library/<id>.json`, a
  subfolder, so `RIG_LIVE`'s `./*.json` glob and `rig-data.test.ts` stay as
  they were. `loadRigData('library:<id>')` loads one (its own chunk).
- **Parity** — `export_fixtures.py` adds the headstand, shoulderstand, plough
  and legs-level held stages; `pose.test.ts` holds them to 1e-4 m, and holds
  the Python helpers' rolled-trunk joints (`_selftest.py --write`:
  `src/rig/clearance-fixtures/rolled-fk-from-python.json`) to the same.
- **Rolled trunks** — any bone may roll (`{dir, roll}`); an omitted child of
  a rolled bone rides it (the renderer's rule, followed by `_lib.fk`). That
  lets the hips turn onto their side (jatara parivartanasana), the spine
  wring (the seated twists) and the whole figure turn about the vertical
  (`_lib.turn`: warrior I and parsvottanasana face the front, then turn to
  the front foot). The trunk-across rule (`library.test.ts`, `_lib.check`)
  catches only the UNASKED turn: a trunk bone aimed exactly (or nearly, off
  to the side) opposite where its parent left it turns by the shortest arc
  about a diagonal and its width swings front to back; a width that is the
  aim's level width turned by the stage's own roll, or squared back to
  level by one (`_lib.square`), passes.
- **Content** — `src/data/library/<id>.ts` (`LibraryAsana` in
  `src/data/types.ts`), joined in `index.ts` with the illustrated index's
  facts by id. Views import only from `src/data/library/index.ts`.
- **Pages** — `/library` (text cards, no WebGL) and `/library/:id`
  (`LiveFigure`: the rig path of `PoseMotion` without the sprite, driven by
  `useSheetPlayer`, so the step list follows the figure and scrubs it). Both
  routes are lazy, so the 26 & 2 never loads the book indexes.

## Crossed legs and clearance

- **Clearance.** Two limbs never pass through each other: the rendered hull
  (the live figure's own tubes and joint ellipsoids) is checked pair by
  pair, in Blender (`_hull.py`, a warning) and in `library.test.ts` (held
  stages, ghosts, and eight samples of every transition). Only named rules
  exempt a pair: a shared joint, trunk pieces at most two trunk edges apart
  (the chin on the breastbone, not the head in the pelvis), a thigh's root
  in its own socket (within 13 cm of its hip; the rest of the thigh and the
  other hip are checked), and the finger regions of two hands in a stage
  that laces them. A shared fixture holds the Python port to the
  TypeScript one. Turning it on found real faults in the
  inversions — the headstand's laced fingers 2–3 cm inside the skull, the
  plough's elbows meeting under the back, karnapidasana's thighs 8 cm
  through the chest, the side plough's thighs through each other, the
  reclining angle's forearms through the legs, and several arms swung
  through the body between stages — each fixed by re-posing or by a
  midpoint stage.
- **The lotus.** The legs are crossed in the pelvis's own frame, so the
  same solver sits, lies back or turns upside down. The first foot rests
  ON the other thigh; the second comes over and rests on the first shin
  where it crosses the lap — with both ankles on the thighs the shins pass
  3–4 cm into each other on this hull whatever the angles, a searched and
  measured fact. The soles turn up by a roll of the foot (a leaf bone, so
  no joint moves). The way in and out is one leg at a time, a lifted
  midpoint for each crossing.
- **Not yet.** The bound lotus (baddha padmasana) is out of reach: a hand
  taken behind the back stops 30 cm short of its big toe, the current sheet still using
  the 26 & 2 skeleton (the reach comparison below).

## The reach table

The original table below describes the unmigrated sheets. Only
paschimottanasana now uses the library variant; its held form clasps beyond
the soles. The comparison after this table reruns the existing solvers on
both skeletons without changing the other sheets' authoring. Distances are
joint-to-joint or the recorded solver shortfall, not guarantees that a new
bind clears the hull.

| Posture | The book's grip | Gap (cm) | What the figure holds |
|---|---|---|---|
| padangusthasana | big toes, head down | 2.6 (13 with the back concave) | the wrists just short of the toes |
| padahastasana | palms under the feet | 17 (26 concave) | the hands toward the feet, off the mat |
| uttanasana | palms on the floor beside the feet | 22 (33 concave) | the hands hanging toward the mat |
| janu-sirsasana | a wrist clasped beyond the foot | 7–13 | the foot, both hands |
| trianga-mukhaikapada-paschimottanasana | the wrists hooked beyond the foot | 8–11 | the foot, both hands |
| paschimottanasana | a wrist clasped beyond the soles | 0 after migration (formerly 6.8) | the wrist clasp, with a separate release stage |
| upavistha-konasana | the big toes, spine erect | 35 | the knees |
| marichyasana-i | the hands clasped behind the back | 54–56 (wrist to wrist) | one arm round the knee, the other behind, unclasped |
| ardha-baddha-padma-paschimottanasana | left hand round the back to the left big toe; right hand the right foot | 6–8 (left); 15 (right, folded) | the left hand by the toe; the right hand on the shin |
| baddha-padmasana | both big toes, the arms crossed behind | 30 | the hands by the far hips |
| yoga-mudrasana | the same bind, folded | 17–19 | the hands by the far hips |
| supta-padangusthasana | the big toe of the raised leg | 36 lying flat, 23 with the chin to the knee | the shin |
| supta-konasana | the big toes, legs wide over the head | 27 | the lowest point of the shins the fingers reach |
| bharadvajasana | the left hand on the right upper arm behind the back | 31 (fingertips to the right elbow) | the back of the waist; the right hand on the outer left thigh (the floor under the knee is in reach, but the arm passes through the thigh on the way) |
| marichyasana-ii | the hands clasped behind the back | 47 (wrist to wrist) | one arm hooked round the knee, the other reaching behind |
| ardha-matsyendrasana | the hands clasped behind the back | 35 (wrist to wrist) | one arm hooked round the knee, the other reaching behind |

The seated folds' figures are measured by `_folds.SHORT` (`FOLDS_REPORT=1
python scripts/blender/library/<id>.py`), the standing folds' by
`python <id>.py --report`; the rest from the held stage's joints.

## Library proportions (2026-09-30)

`L.begin(id, skeleton='library')` selects `_skeleton.py` before authoring.
No selection means the original rig. Export adds `skeleton: 'library'`
only to opted-in sheets and writes `src/data/rig/skeletons/library.json`.
It cannot sit directly beside `skeleton.json`: the frozen class tests and
`RIG_LIVE` glob every other root JSON as a sheet. This subdirectory keeps
those consumers and every original fixture unchanged.

The design starts with the usual segment-to-stature approximations of
0.186 for upper arm, 0.146 for forearm and 0.108 for the whole hand
([scaling table](https://basicmedicalkey.com/terminology-the-standard-human-and-scaling/)).
These are guides for a stylised mannequin, not simultaneous constraints
on this rig's inherited torso. Arm span is not universally identical to
height: an adult sample measured spans about 5–6 % longer
([Aggarwal et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC2700438/)).
The library uses upper arm 31.5 cm, forearm 26 cm and hand 15 cm: about
18.3 %, 15.1 % and 8.7 % of the rendered standing height. The hand remains
shorter than that reference ratio to keep the existing broad trunk and a
span near stature; this is an explicit modelling compromise, not an exact
anthropometric specimen. Shoulder X moves from ±20 to ±17 cm, shortening
the clavicles rather than widening the span further. The forearm and upper
arm rest directions open slightly outward so the hanging arm clears the hip.

| Measurement (cm) | Original | Library |
|---|---:|---:|
| Crown vertex to heel vertex, standing | 167.50 | 167.50 |
| Rendered crown-to-lowest-sole height (sampled hull) | 171.71 | 171.71 |
| Horizontal fingertip span, shoulders held at their standing positions | 168.18 | 179.00 |
| Upper arm / forearm / hand | 29.07 / 25.02 / 10.00 | 31.50 / 26.00 / 15.00 |
| Clavicle | 20.40 | 17.46 |
| Hanging fingertip world Z | 80.00 | 71.83 |
| Hanging fingertip above heel vertex | 75.50 | 67.33 |

The hip–knee midpoint is Z = 76 cm; the new fingertip is 4.2 cm below it,
still around mid-thigh. Span is 104.2 % of rendered height (106.9 % of
the crown-to-heel *vertices*, which exclude the sole). The original span
was already close to height; reach failures were not proof that all three
arm segments should simply be scaled up uniformly.

The hull rule is longitudinal scaling only. `SKIN_FIT` and `RADIUS` retain
the original measured cross-sections; tube endpoints follow the new rest
joints, the palm stays 35 % along the hand, and leaf caps still stop at the
end vertex. `jointRadii` recomputes the enclosing ellipsoid from the new
rims under bend and roll. This avoids inflating the shoulders, wrists or
hands merely because a bone is longer. Python and TS use the same rule;
the new `clearance-fixtures/library-from-python.json` exercises rest,
rolled children, crossed wrists and every proof stage, with FK and clash
depths checked within 1e-4 m. Existing fixtures are unchanged.

### What lengths alone buy

Run `python scripts/blender/library/_reach_report.py` for the detailed
numbers. It evaluates the existing authoring with the existing solvers,
once per skeleton; it writes no posture. For paschimottanasana it explicitly
reconstructs the original trunk and target, excluding this pass's changes.
Checks are suppressed only in this report: these are reach probes, not
validated migrations. All numbers below are centimetres, rounded to 0.1.

| Posture / metric | Original | Library, before re-authoring |
|---|---:|---:|
| padangusthasana, fold / concave wrist target | 2.6 / 12.7 | 0.0 / 4.8 |
| padahastasana, fold / concave wrist target | 17.0 / 25.9 | 13.5 / 22.3 |
| uttanasana, fold / concave wrist target | 22.4 / 33.2 | 18.8 / 29.8 |
| janu-sirsasana, beyond-foot wrist targets | 7.1–13.2 | 5.0–10.1 |
| trianga-mukhaikapada-paschimottanasana, wrist targets | 7.8–11.1 | 5.5–8.3 |
| paschimottanasana, original wrist target | 6.8 | 4.0 |
| upavistha-konasana, erect toe target recorded by solver | 35.3 | 34.0 |
| marichyasana-i, wrist gap, folded / upright | 53.9 / 56.4 | 53.7 / 56.2 |
| ardha-baddha-padma-paschimottanasana, left fingertip–toe, up / folded | 5.8 / 7.8 | 0.8 / 2.8 |
| same, right fingertip–toe, up / folded | 29.7 / 14.9 | 21.2 / 11.1 |
| baddha-padmasana, fingertip–toe | 29.8–30.7 | 24.8–25.7 |
| yoga-mudrasana, fingertip–toe | 17.4–19.4 | 12.4–14.4 |
| supta-padangusthasana, fingertip–toe, flat / chin lifted | 36.0 / 23.1 | 27.8 / 16.3 |
| supta-konasana, fingertip–toe | 27.1 | 20.1 |
| bharadvajasana, left fingertip–right elbow | 31.0 | 29.8 |
| marichyasana-ii, wrist gap | 47.2 | 47.1 |
| ardha-matsyendrasana, wrist gap | 34.5 | 35.2 |

The behind-back targets largely stay apart; one even moves farther apart
when the same solver placements are rerun. Shoulder movement, the trunk
turn and the path around the knee remain necessary. No other sheet has
been opted in or silently declared fixed.

Paschimottanasana keeps its original trunk angles. Its shoulders reach a
little farther forward; wrists now meet beyond the feet at different
heights, with the right fingertip on the left wrist's surface (5 cm between
those joint centres, not coincident wrists). The staff palms are flattened
for the longer hands. A seventh stage releases and separates the hands
before rising, and the camera scale is 1.65. Steps still advance through
the corresponding stages. Preview:
`.motion-tmp/preview-library.paschimottanasana.png`.

## Why the rules

- **Faithful to the lineage, in our words.** Patanjali gives no technique
  and no cautions for any posture (II.46–48 are his whole account of
  asana), so the steps, holds and cautions follow the hatha lineage as
  B.K.S. Iyengar teaches it in *The Illustrated Light on Yoga* — Robert's
  definitive guide. The book's pages were read for FACTS (who should not,
  in what order to learn, where the weight goes, how to come down) and
  every point is written in our own words with its printed page
  (`LineageNote {text, page}`; the page shows them under "What the lineage
  asks"). Nothing the book does not say is added: no modern medical list.
  Where the book and a modern habit differ (the headstand's weight is on
  the head, the forearms only guard the balance, p. 87), the page follows
  the book.
- **Sutras faithfully.** Every entry cites II.46 (steady and at ease) and
  II.47 (effort relaxing, attention on the boundless); II.48 (the pairs of
  opposites no longer disturb) only on the two long-held foundations, in
  its own meaning. II.49 is not cited for a posture: breath practice
  follows posture, which the tradition panel says in one line.
- **Honest drawing.** The rig's arms are a hand short of its feet in the
  reclining angle, so the figure holds its shins there and the step says
  so. Palms that carry the back are placed on the trunk's measured skin
  with the elbows grounded, and are contact-checked (Blender and vitest);
  the headstand's crown and the shoulderstand's upper back rest ON the
  floor guide (calibrated against the rendered hull).
- **Transitions keep their footing.** A blend is rooted at the pelvis, so
  between two stages that rest on the crown it would dip the head through
  the mat. The library's live figure draws `groundedSheetPose`: the joints
  both stages rest on travel straight between their places
  (`anchorToContacts`), with `liftToFloor` as a guard bounded to 3 cm in
  the test. The 26 & 2 draws `sheetPose` unchanged.

## Originality gate

`python scripts/library-originality-gate.py` compares every 8-word window of
every added or changed text file (from `git status --porcelain -uall`) plus
the library spec, `CLAUDE.md` and `CONTINUATION_PROMPT.md` against both local
extractions (the illustrated book and the sutras book). It prints counts only and refuses a corpus path inside
the repository. Output of the final run, this file included:

```
corpus C:\Users\rober\Downloads\yogapic-ocr: 179 pages
corpus C:\Users\rober\Downloads\yoga-ocr: 388 pages
CLAUDE.md: 0 matches
CONTINUATION_PROMPT.md: 0 matches
docs/library-fanout-spec.md: 0 matches
docs/library-integration-spec.md: 0 matches
docs/library-inversions-spec.md: 0 matches
docs/library-lotus-rig-spec.md: 0 matches
docs/library.md: 0 matches
scripts/blender/library/_backbend.py: 0 matches
scripts/blender/library/_lib.py: 0 matches
scripts/blender/library/_lotus.py: 0 matches
scripts/blender/library/_selftest.py: 0 matches
scripts/blender/library/_standing.py: 0 matches
scripts/blender/library/_twist.py: 0 matches
scripts/blender/library/jatara_parivartanasana.py: 0 matches
scripts/blender/library/parsva_halasana.py: 0 matches
scripts/blender/library/parsva_pindasana_in_sarvangasana.py: 0 matches
scripts/blender/library/parsvaika_pada_sarvangasana.py: 0 matches
scripts/blender/library/parsvottanasana.py: 0 matches
scripts/blender/library/README.md: 0 matches
scripts/blender/library/supta_virasana.py: 0 matches
scripts/blender/library/virabhadrasana_i.py: 0 matches
scripts/library-originality-gate.py: 0 matches
src/data/library/ardha-baddha-padma-paschimottanasana.ts: 0 matches
src/data/library/ardha-matsyendrasana.ts: 0 matches
src/data/library/baddha-konasana.ts: 0 matches
src/data/library/baddha-padmasana.ts: 0 matches
src/data/library/bharadvajasana.ts: 0 matches
src/data/library/bhujangasana-i.ts: 0 matches
src/data/library/chaturanga-dandasana.ts: 0 matches
src/data/library/common-lotus.ts: 0 matches
src/data/library/dandasana.ts: 0 matches
src/data/library/index.ts: 0 matches
src/data/library/janu-sirsasana.ts: 0 matches
src/data/library/jatara-parivartanasana.ts: 0 matches
src/data/library/library.test.ts: 0 matches
src/data/library/maha-mudra.ts: 0 matches
src/data/library/marichyasana-i.ts: 0 matches
src/data/library/marichyasana-ii.ts: 0 matches
src/data/library/matsyasana.ts: 0 matches
src/data/library/padahastasana.ts: 0 matches
src/data/library/padangusthasana.ts: 0 matches
src/data/library/padmasana.ts: 0 matches
src/data/library/parsva-pindasana-in-sarvangasana.ts: 0 matches
src/data/library/parsvottanasana.ts: 0 matches
src/data/library/paschimottanasana.ts: 0 matches
src/data/library/prasarita-padottanasana.ts: 0 matches
src/data/library/purvottanasana.ts: 0 matches
src/data/library/salabhasana.ts: 0 matches
src/data/library/salamba-sarvangasana-i.ts: 0 matches
src/data/library/salamba-sirsasana-i.ts: 0 matches
src/data/library/setu-bandha-sarvangasana.ts: 0 matches
src/data/library/siddhasana.ts: 0 matches
src/data/library/supta-padangusthasana.ts: 0 matches
src/data/library/tadasana.ts: 0 matches
src/data/library/trianga-mukhaikapada-paschimottanasana.ts: 0 matches
src/data/library/upavistha-konasana.ts: 0 matches
src/data/library/urdhva-mukha-svanasana.ts: 0 matches
src/data/library/urdhva-padmasana-in-sarvangasana.ts: 0 matches
src/data/library/ustrasana.ts: 0 matches
src/data/library/uttanasana.ts: 0 matches
src/data/library/utthita-parsvakonasana.ts: 0 matches
src/data/library/utthita-trikonasana.ts: 0 matches
src/data/library/virabhadrasana-i.ts: 0 matches
src/data/library/virabhadrasana-ii.ts: 0 matches
src/data/library/virasana.ts: 0 matches
src/data/library/yoga-mudrasana.ts: 0 matches
src/data/rig/library/jatara-parivartanasana.json: 0 matches
src/data/rig/library/parsva-halasana.json: 0 matches
src/data/rig/library/parsva-pindasana-in-sarvangasana.json: 0 matches
src/data/rig/library/parsvaika-pada-sarvangasana.json: 0 matches
src/data/rig/library/parsvottanasana.json: 0 matches
src/data/rig/library/supta-virasana.json: 0 matches
src/data/rig/library/virabhadrasana-i.json: 0 matches
src/rig/clearance-fixtures/rolled-fk-from-python.json: 0 matches
src/rig/pose.test.ts: 0 matches
src/views/Library.css: 0 matches
src/views/Library.tsx: 0 matches
vite.config.ts: 0 matches
TOTAL: 0 matches; 78 files; 567 source pages; 8-word windows
```
