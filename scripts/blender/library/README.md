# Library sheets — authoring contract

One module per posture of the posture LIBRARY (the wider repertoire, never
the 26 & 2), named `<illustrated-index id with - → _>.py`, exporting the same
`POSTURE` dict as `../postures/` (read `../postures/README.md` first: the rig,
directions, views, frames, guides, ghosts). Live figure only: no sprites.
`padmasana.py` (seated, crossed legs), `salamba_sarvangasana_i.py` (lying,
inverted) and `salamba_sirsasana_i.py` (the headstand) are the references.

## Files — who may edit what

- `_lib.py` — the shared solvers and checks. NOT edited in the fan-out.
- `_hull.py` — the rendered hull in Python (a port of `src/rig/`). NOT edited.
- `_<family>.py` — a family's own helpers (`_standing.py`, `_backbend.py`,
  `_seated.py`, `_twist.py`…), loaded like `_lib.py` and importing it. One
  agent per family file.
- Content: `src/data/library/<id>.ts` (one `LibraryAsana` export, found by
  the index on its own), shared lineage notes in `common.ts` (read-only in
  the fan-out) or the family's `common-<family>.ts`.

Adding a posture is two new files and nothing shared. Families:
`standing | backbend | seated | lotus | inversion | twist` (the lotus
shoulderstands are `inversion`, as the book groups them).

## The module

```python
_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(L)
L.begin('padmasana')                     # names the sheet in the warnings
...
POSTURE = L.check({'id': 'library:padmasana', 'position': {...}, 'view': ..., 'frame': ...,
                   'transition': 10, 'stages': [...]})
```

4–8 stages: the way in, the held form (the longest hold), the way out.
Per stage, optionally: `notice` (from `L.NOTICE`: neck, shoulders,
upper-back, lower-back, core, hips, hamstrings, quads, calves, feet, wrists,
breath — the work the bones cannot show) and `palms: 'back'` (the hands carry
the back; contact-checked).

## The checks — silent means done

`L.check` runs over every stage AND ghost; a clean module prints nothing
(`python <module>.py`, `npm run rig:export`, the preview):

- `floor warning` — a joint (tips included) below z = −0.005.
- `reach warning` — a solver's target is out of reach (the limb falls short).
- `contact warning` — a `palms: 'back'` palm more than 2 cm off the back.
- `clearance warning` — two pieces of the RENDERED hull pass more than 1 cm
  into each other. Exempt only by the named rules (`src/rig/clearance.ts`):
  SHARED JOINT (pieces meeting at a skin vertex; the heel, ball and palm
  swellings count as their bone's joint), TRUNK NEIGHBOURS (trunk pieces
  at most two trunk edges apart — head and chest, not head and pelvis),
  HIP SOCKET (a thigh against its own pelvis pieces, counted only beyond
  13 cm of its hip; the other hip is checked in full), LACED HANDS (the
  two finger regions only, and only in a stage marked `'hands': 'laced'`;
  wrists and palms are checked). One tolerance for every sheet; never add
  a per-posture exemption. `python scripts/blender/library/_selftest.py`
  checks the helpers and that the shared clash fixture is current
  (`--write` after changing `_hull.py`).

Framing: `library.test.ts` also keeps every held stage's whole hull inside
its camera square with a 4 % margin and clear of the disc's rounded
corners — choose `frame` so it passes.

`library.test.ts` checks the same on the real hull, plus every transition
(8 samples each, the loop back too) on the path the library draws
(`groundedSheetPose`). A held stage can be clean and its blend not: a limb
swung straight between two stages may pass through another. Fix it with a
midpoint STAGE (the knee lifts, the foot is carried over, the hand moves
first), never by loosening a check.

## Solvers (`_lib.py`)

- Joints: `fk`, `place`, `diff` (a ghost overlay).
- Reach: `two_bone`, `one_bone`, `arm`, `leg`, `on_floor`, `knee_on(hip,
  ankle, axis, height, out)` (the knee on the thigh/shin circle at a height
  along any axis, on the `out` side).
- Seated: `sit(lean, at=SEAT)` (the hip hull on the mat), `legs_forward`,
  `palms_beside`, `hands_on_knees`, `hand_on_thigh`, `hand_to_ankle`.
- Crossed legs, all in the PELVIS'S OWN FRAME (`pelvis_frame`, `lap(pose,
  flex, front)`: `flex` 90 sitting, 0 thighs in line with the trunk, toward
  180 folded), so one crossing rides into any trunk: `lotus(pose, first)`,
  `half_lotus(pose, side)`, `siddha(pose, first)`, `rest_on` (an ankle ON a
  limb's hull), `knee_out`, `carry_foot` / `lift_shin` (the lifted midpoints).
- Feet: `foot_sole(pose, side, facing, dir)` aims a foot and ROLLS it so the
  sole (the heel/ball side) faces `facing`; `sole_facing` reads it back.
  Rolls are allowed on LEAF bones only (head, hands, feet): they move no
  joint, so the Python FK stays exact.
- Lying and inverted: `LIE`, `on_shoulders`, `palms_to_back`, `hands_on_back`,
  `arms_long`, `plough`, `plough_legs`, `legs_vertical`, `shoulderstand`,
  `rolling_up/down`, `kneel`, `headstand`, `forearm_tripod`, …

## The lotus rules

- First foot ON the other thigh (its hull, near the root, sole up); the
  second foot comes OVER and rests on the first shin where it crosses the
  lap. On this hull both ankles on the thighs forces the shins 3–4 cm into
  each other; that is measured, not assumed — do not "fix" it by lifting a
  foot into the air.
- The lying and upside-down poses are MIRROR-LABELLED (left is +X, as in
  FLAT): pass `front=` (the world way the chest faces) to `lap`/`lotus`.
- The way in and out is one leg at a time: `carry_foot` lifts the knee and
  foot over the landing, `lift_shin` raises only the shin (the thigh under
  the first foot must not lift), the hands move while the legs are still.

## Framing per position

`SUPINE_FRAME` (lying, inversions over the shoulders), `HEAD_FRAME` (the
headstand), `SEATED_FRAME` (sitting, legs forward, quarter view),
`LOTUS_FRAME` (crossed legs, front view: reads at 360 px),
`INVERTED_LOTUS_FRAME`. A stage may carry its own `frame`; the zoom travels.

## Content rules (`src/data/library/<id>.ts`)

Steps (5–9, second person, calm) walk the stages forward; holds, cautions
and steps follow the book (The Illustrated Light on Yoga), read for FACTS,
written in our own words, every caution with its printed page (printed =
PDF page − 17). No modern safety boilerplate. Sutras: II.46 and II.47
always, II.48 only in its own meaning, never II.49 on a posture.

## Workflow

```bash
python scripts/blender/library/<module>.py         # the checks, fast
npm run motion:preview library:<id>                # → .motion-tmp/preview-library.<id>.png (look at it)
npm run rig:export                                 # → src/data/rig/library/<id>.json
npx vitest run src/data/library                    # the contract, clearance over the blends
python scripts/library-originality-gate.py         # zero matches, both books
```
