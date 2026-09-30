# The posture library

A second collection beside the 26 & 2, never mixed into it: postures from the
wider classical repertoire, each drawn by the live figure next to our own
instructions, its cautions, and the sutras that bear on it. The first family
was the inversions (ten postures: the headstand and the shoulderstand with
their variations); the crossed-leg seats followed once the rig learned to
cross the legs (`docs/library-lotus-rig-spec.md`): siddhasana, padmasana
and the lotus in the shoulderstand. Families: standing, backbend, seated,
lotus, inversion, twist; the index discovers the posture files, so the
rest of the book is written family by family without shared edits
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
  and legs-level held stages; `pose.test.ts` holds them to 1e-4 m. No trunk
  bone is ever aimed EXACTLY opposite its rest: there the shortest arc turns
  about a diagonal and the hips come out wide front to back (a test pins
  it).
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
  taken behind the back stops 26 cm (left) and 15 cm (right) short of its
  big toe, the bones being the 26 & 2's and not to be lengthened.

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
docs/library-inversions-spec.md: 0 matches
docs/library.md: 0 matches
scripts/blender/export_fixtures.py: 0 matches
scripts/blender/export_rig.py: 0 matches
scripts/blender/library/_lib.py: 0 matches
scripts/blender/library/eka_pada_sarvangasana.py: 0 matches
scripts/blender/library/halasana.py: 0 matches
scripts/blender/library/karnapidasana.py: 0 matches
scripts/blender/library/parsva_halasana.py: 0 matches
scripts/blender/library/parsvaika_pada_sarvangasana.py: 0 matches
scripts/blender/library/salamba_sarvangasana_i.py: 0 matches
scripts/blender/library/salamba_sirsasana_i.py: 0 matches
scripts/blender/library/setu_bandha_sarvangasana.py: 0 matches
scripts/blender/library/supta_konasana.py: 0 matches
scripts/blender/library/urdhva_dandasana.py: 0 matches
scripts/blender/render_motion.py: 0 matches
scripts/library-originality-gate.py: 0 matches
src/App.tsx: 0 matches
src/components/figurePrefs.ts: 0 matches
src/components/FigureRig.tsx: 0 matches
src/components/LiveFigure.tsx: 0 matches
src/components/PoseMotion.tsx: 0 matches
src/components/useSheetPlayer.test.ts: 0 matches
src/components/useSheetPlayer.ts: 0 matches
src/data/library/common.ts: 0 matches
src/data/library/eka-pada-sarvangasana.ts: 0 matches
src/data/library/halasana.ts: 0 matches
src/data/library/index.ts: 0 matches
src/data/library/karnapidasana.ts: 0 matches
src/data/library/library.test.ts: 0 matches
src/data/library/parsva-halasana.ts: 0 matches
src/data/library/parsvaika-pada-sarvangasana.ts: 0 matches
src/data/library/salamba-sarvangasana-i.ts: 0 matches
src/data/library/salamba-sirsasana-i.ts: 0 matches
src/data/library/setu-bandha-sarvangasana.ts: 0 matches
src/data/library/supta-konasana.ts: 0 matches
src/data/library/urdhva-dandasana.ts: 0 matches
src/data/rig/index.ts: 0 matches
src/data/rig/library/eka-pada-sarvangasana.json: 0 matches
src/data/rig/library/halasana.json: 0 matches
src/data/rig/library/karnapidasana.json: 0 matches
src/data/rig/library/parsva-halasana.json: 0 matches
src/data/rig/library/parsvaika-pada-sarvangasana.json: 0 matches
src/data/rig/library/salamba-sarvangasana-i.json: 0 matches
src/data/rig/library/salamba-sirsasana-i.json: 0 matches
src/data/rig/library/setu-bandha-sarvangasana.json: 0 matches
src/data/rig/library/supta-konasana.json: 0 matches
src/data/rig/library/urdhva-dandasana.json: 0 matches
src/data/rig/README.md: 0 matches
src/data/types.ts: 0 matches
src/rig/fixtures/library.halasana--arms-long.json: 0 matches
src/rig/fixtures/library.salamba-sarvangasana-i--shoulderstand.json: 0 matches
src/rig/fixtures/library.salamba-sirsasana-i--headstand.json: 0 matches
src/rig/fixtures/library.urdhva-dandasana--legs-level.json: 0 matches
src/rig/index.ts: 0 matches
src/rig/pose.test.ts: 0 matches
src/rig/sheet.ts: 0 matches
src/views/Explorer.css: 0 matches
src/views/Explorer.tsx: 0 matches
src/views/Library.css: 0 matches
src/views/Library.tsx: 0 matches
src/views/LibraryPose.css: 0 matches
src/views/LibraryPose.tsx: 0 matches
src/views/Timeline.tsx: 0 matches
TOTAL: 0 matches; 66 files; 567 source pages; 8-word windows
```
