# Posture motion files — authoring contract

One Python module per posture, named `<pose-id with - → _>.py`, exporting a
`POSTURE` dict. `half_moon.py` is the reference. Rendered by
`../render_motion.py` (see its docstring); tuned with the stage preview.

## The rig (read this before posing)

A tube mannequin, ~1.72 m tall, standing at the origin, **facing -Y**, +Z up.
Its **LEFT** side is **+X** (from the `front` camera the left hand is on
screen-right, as in a mirror). Joints/bones (head → tail, parent):

| bone | from → to | parent |
|---|---|---|
| `pelvis` | pelvis (0,0,1.00) → waist (0,0,1.12) | — (root; also takes `pelvis.location`) |
| `spine.lower` | waist → chest (0,0,1.27) | pelvis |
| `spine.upper` | chest → neck (0,0,1.40) | spine.lower |
| `neck` | neck → head (0,0,1.52) | spine.upper |
| `head` | head → crown (0,0,1.72) | neck |
| `clavicle.L/R` | neck → shoulder (±0.20,0,1.44) | spine.upper |
| `upperarm.L/R` | shoulder → elbow (±0.22,0,1.15) | clavicle |
| `forearm.L/R` | elbow → wrist (±0.23,0,0.90) | upperarm |
| `hand.L/R` | wrist → fingers (±0.23,0,0.80) | forearm |
| `hipbone.L/R` | pelvis → hip (±0.10,0,0.98) | pelvis |
| `thigh.L/R` | hip → knee (±0.10,0,0.54) | hipbone |
| `shin.L/R` | knee → ankle (±0.10,0,0.10) | thigh |
| `foot.L/R` | ankle → toes (±0.10,-0.16,0.02) | shin |

Segment lengths: upper arm 0.29, forearm 0.25, hand 0.10, thigh 0.44, shin
0.44, foot 0.16, torso (pelvis→neck) 0.40, head 0.20.

## A stage is a dict of WORLD-SPACE directions

`bone → (x, y, z)` = the direction the bone points (head → tail) in world
space, any length (normalised for you). Bones you omit keep their **rest**
direction (standing, arms down). There is no local-axis or parent math to
think about: say where each segment points and the renderer solves it,
parents first. Optional `'pelvis.location': (x, y, z)` translates the whole
body from rest, also in WORLD space (e.g. `(0, 0, -0.88)` lowers the
pelvis 0.88 m; the renderer maps it through the pelvis bone's rest matrix,
so you never touch bone-local axes). Older modules carry an identity
helper (`at`/`shift`/`offset`) from before that mapping existed — harmless.

Cheat sheet (directions):
- straight up `(0,0,1)`, straight down `(0,0,-1)`
- forward (the way the face points) `(0,-1,0)`, backward `(0,1,0)`
- to the mannequin's left `(1,0,0)`, right `(-1,0,0)`
- "bend to the right" tips spine bones toward -X; a backbend tips them +Y;
  a forward fold tips them -Y then down.
- Lying supine (Savasana): `pelvis` → `(0,-1,0)` (waist is toward the head,
  which lies toward -Y), spine bones `(0,-1,0)`, thighs/shins `(0,1,0)`,
  feet `(0,0.3,1)`, arms `(0,1,0)` beside the body, `pelvis.location`
  ≈ `(0, 0, -0.88)` so the body rests at z≈0.12 (tube radius).
- Lying prone (Cobra/Locust/Bow): same torso line as supine (head toward
  -Y); tube limbs have no front/back, so only the feet tell them apart —
  toes up `(0,0.3,1)` reads supine, toes pointed `(0,0.3,-0.3)` reads prone.
- Kneeling (Fixed Firm/Camel/Rabbit): thighs `(0,0,-1)` shortened by sitting
  isn't possible — instead thighs `(0,-0.2,-0.98)`, shins `(0,1,0)` flat on
  the floor pointing back, feet `(0,1,0)`, and lower `pelvis.location` so the
  knees touch z≈0.06.

Helper functions: every `.py` in this folder is rendered as a posture, so
there is no shared helper module — keep small solvers (two-bone reach,
kneel height) inside the module that uses them.

The renderer does NOT enforce joint limits or floor contact — you keep
things plausible (feet on the floor, no hyper-extensions, limbs the rig can
actually reach: a hand can't grab a foot unless the arm path gets there).
Tube limbs have no fingers, so "grip" = hand direction meeting the target.

## POSTURE dict

```python
POSTURE = {
    'id': 'half-moon',                       # the Pose id, exactly
    'view': 'front',                         # default camera: front | quarter | side | quarter-back | back
    'frame': {'center_z': 1.05, 'scale': 2.5},   # ortho camera: height it centres on, metres visible top-to-bottom
    'transition': 7,                         # frames between stages (12 fps)
    'stages': [                              # held stages, in class order
        {'label': 'Arms up', 'pose': UP, 'hold': 4},
        {'label': 'Right side', 'pose': RIGHT, 'hold': 8, 'view': 'side'},   # a stage may take its own view; the camera orbits to it
        ...
    ],
}
```

- `view` names: `front` (0°), `quarter` (-35°), `side` (-90°, the face
  points screen-RIGHT), `quarter-back` (-145°), `back` (180°).
- `frame.center_z` / `scale`: for standing work `1.05 / 2.5`; kneeling
  `0.6 / 1.8`; lying `0.35 / 2.4` (tall wide bodies need scale ≥ length).
  Everything must stay inside the square frame in every stage AND during
  transitions (arms swing wide between stages).
- Labels are what the app shows as chips: short, class-language, Title
  case first word (`'Right side'`, `'Hands to feet'`, `'Rise'`). Mirror the
  posture's `segments` in `src/data/segments/` (sides, sets) at a coarser
  grain: 4–10 stages, holds 3–8, the full expression gets the longest hold.
  Two-sided postures show the right side then the left; two sets don't
  need to be repeated in the sprite.
- Keep total frames under ~110 (sprite grid is 10 wide; 240 px cells).

## Workflow

```bash
npm run motion:preview <pose-id>     # renders each held stage as a still → .motion-tmp/preview-<pose-id>.png
```

Look at the contact sheet (it's a dark strip, one cell per stage, labelled),
fix directions, repeat. Do NOT run the full `npm run motion` from parallel
agents — the orchestrator renders all sheets serially at the end (the
manifest is a single generated file).

Quality bar: a yoga teacher glancing at the strip should name the posture
and every stage without the labels. Silhouette over anatomy: pick the view
that shows the shape (side bends → front; folds/backbends → side; twists →
quarter or back). Keep limbs from overlapping into a blob in the chosen view.
