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
  taken behind the back stops 30 cm short of its big toe, the bones being
  the 26 & 2's and not to be lengthened (the reach table below).

## The reach table

The rig's arms are the 26 & 2's, and a hand short of its own feet: every
grip below is drawn as far as the arm goes, and each step describes the
book's full form. Gaps are measured on the held stage from the joint
positions (fingertip to toe tip, wrist to wrist, or the solver's own
clamped reach where a module records it), in cm. This is the evidence for
a decision not made yet: whether the library's figure gets arms of its own.
Bone lengths are unchanged.

| Posture | The book's grip | Gap (cm) | What the figure holds |
|---|---|---|---|
| padangusthasana | big toes, head down | 2.6 (13 with the back concave) | the wrists just short of the toes |
| padahastasana | palms under the feet | 17 (26 concave) | the hands toward the feet, off the mat |
| uttanasana | palms on the floor beside the feet | 22 (33 concave) | the hands hanging toward the mat |
| janu-sirsasana | a wrist clasped beyond the foot | 7–13 | the foot, both hands |
| trianga-mukhaikapada-paschimottanasana | the wrists hooked beyond the foot | 8–11 | the foot, both hands |
| paschimottanasana | a wrist clasped beyond the soles | 6.8 | the soles |
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
