# Live figure rollout — sprite vs live, posture by posture (2026-09-29)

Every posture's live three.js figure was compared with its sprite sheet at
EVERY stage chip, side by side on `/pose/<id>?figure=rig` (DPR 2, reduced
motion so both hold still, teaching layers off, then on for every stage that
has guides or a ghost), and the 8 hand-off bridges the same way. The sheets
(one image per sheet, sprite row over live row) were looked at one by one;
an ink bounding-box diff of every stage backed the eye up (median edge
difference 11 px → 2 px of a 342 px cell after the fixes, p90 14 → 8).

What was fixed — generically, in `src/rig/body.ts` and
`src/components/figureRigScene.ts`, never in posture data:

- **Size and ends.** The tubes were built from the skin radii ×0.95, but the
  sheets draw Blender's skin AFTER subdivision, which ends a limb AT its last
  vertex (the rig drew a radius beyond it: taller head, longer feet and
  hands, lying figures ~0.05 m too long) and reshapes the torso. The mesh now
  uses `SKIN_FIT` — the subdivided hull's own sections, measured by
  sectioning Blender's evaluated body at rest with a rule per stem
  (`scripts/blender/measure_skin_fit.py` → `src/rig/fixtures/skin-fit-from-blender.json`)
  — and pulls every leaf's ellipsoid back so the rounded end stops at its vertex.
- **Stroke weight.** Freestyle's 1.7 px line lands ~3.05 px wide once
  antialiased and encoded; the live strokes were ~2/3 of that. Now matched
  by profile (`INK_PX`), scaled with the cell.
- **Fold strokes.** The normal-crease test drew every concave fold (arm
  against the head, thigh against the chest, tube into joint). A crease is
  now a stroke only where it is a contour — the nearer surface turns
  edge-on over a surface behind it — as Freestyle draws them.
- **Grazing surfaces.** A surface seen nearly edge-on (a heel tucked under
  the seat) filled with a grey block of false depth jumps; the depth test now
  measures the jump against the depth the surface's own slope predicts.
- **Hinge joints.** An elliptical joint rode one bone and showed its long
  axis past the other at a deep bend (a lumpy back in Camel); hinge joints
  now turn halfway between their two bones, and each pose sizes them to
  enclose both tube rims under bend AND roll (`jointRadii`: the fit at
  rest; the twisting spine's rolled pelvis rim no longer shows through the
  waist) — `body.test.ts`.
- **Supersampling: not done.** Rendering the edge target at 2× and scaling
  it down took a class-mode blend frame (390 px, DPR 1, 4× CPU throttle)
  from a median ~6.1 ms to ~8.8 ms batched (6 runs each), past the 8 ms
  budget; the DPR-1 strokes are the edge pass's own antialiasing.

"Worst stage edge" is the largest bounding-box difference between the two
figures' ink over a posture's stages, in px of the 342 px cell (before →
after). The live figure now lays down ~13–20 % more ink than the sprite
(was ~20 % less): the stroke profile matches (4.36 vs 4.39 px of ink across
a Tadasana scanline), the surplus is the contour where an arm lies against
the torso, which the rig draws a little longer than Freestyle does.

Differences common to every posture (not repeated per row): the body is
tubes and ellipsoids, so joints read a little more angular than the
subdivided skin; in the front Tadasana the sprite's gap between the legs is
a thin filled slit, the live one a narrow V; the live figure breathes by
moving the chest (the sprite scales the whole cell).

`ok` = matches the sprite; `fixed` = a visible defect on this posture that
the generic fixes above removed; `known` = a cosmetic difference judged
acceptable (said what).

| id | status | note |
|----|--------|------|
| pranayama | known | Exhale (side view): a small nick in the back contour at the waist where the pelvis tube meets the waist ellipsoid. Inhale/Exhale scrub reads (arms lift and fold, camera orbits quarter ↔ side). |
| half-moon | fixed | Head/feet overshoot and thin strokes (all stages); fold strokes in Hands to feet. Guides pane + ghost sit right on Right side. |
| awkward | ok | Parts one–three, ghosts and guides match (worst stage edge 12 → 6 px after the generic fixes). |
| eagle | ok | Wrapped arms and legs read as the sprite's (13 → 5 px). |
| standing-head-to-knee | fixed | Concave fold strokes along the thigh against the chest (Elbows down, Head to knee) removed. |
| standing-bow | ok | Full bow and Left side match, ghost and guides included. |
| balancing-stick | ok | Tip to horizontal and Left side match; ghost (legs dropped) under the figure. |
| standing-separate-leg-stretching | ok | Quarter view folds match; Head to floor with guides and ghost. |
| triangle | ok | Front-view lunge and twist match; the guide panes read as rectangles face-on. |
| standing-separate-leg-head-to-knee | ok | The sprite's Head to knee has a dotted shin stroke (a Freestyle artefact) the live figure does not. |
| tree | ok | Lifted foot and palms together match; ghost (hip out) under the figure. |
| toe-stand | known | Sit to the heel: the fully folded knee is a touch rounder than the sprite's (Blender's subdivision pinches a knee folded flat); otherwise matches. |
| savasana | fixed | Lying figure was ~0.05 m long and sat right of the sprite; now sits where the sprite sits in the disc. Stillness guide = the floor line. No ghost (none authored). |
| wind-removing | fixed | Same lying framing fix; knee-to-chest folds match; guides and ghost. |
| situp | ok | Arms overhead → Sit up → Fold forward → Lie back match. |
| cobra | fixed | Lying framing (was 11 px long); Lift, ghost and guides match. |
| locust | fixed | Lying framing; the three lifts and their ghosts match. |
| full-locust | known | Arms out (seen head-on, lying): the live figure draws the head end-on as a small ring inside the shoulder bump where the sprite draws one bump. |
| bow | ok | Kick up (ghost and guide lines) matches. |
| fixed-firm | known | Sit between the heels: the folded knees are a touch rounder/longer than the sprite's (subdivision pinch, as toe-stand); lying stages match. |
| half-tortoise | known | Sitting on the heels: folded knees ~0.04 m longer/rounder than the sprite's (subdivision pinch); forehead-to-floor fold matches. |
| camel | fixed | Heels in hand: the arched back was lumpy (joint ellipsoids riding one bone); now a smooth arch. A slightly fuller chest curve than the sprite remains. |
| rabbit | known | Sitting on the heels: folded knees ~0.04 m longer (subdivision pinch); Hips up reads a little rounder at the crown/back. |
| head-to-knee-stretching | fixed | A grey block under the tucked heel (grazing surface) and fold strokes; Both legs still shows the arms' tube ends where the sprite's fold hides them. |
| spine-twisting | fixed | The head stood ~19 px above the sprite's on every stage (leaf overshoot) → 3 px. Rolled spine and riding clavicles read as the sprite's; ghost and guides. |
| kapalbhati | known | Sitting on the heels: folded knees ~0.04 m further forward (subdivision pinch). Pump/Release pulse reads (a small chest pump), ghost and guide lines. |

Bridges (class-mode hand-offs):

| id | status | note |
|----|--------|------|
| bridge:standing-supine | ok | Stand → Kneel → Hands and knees → Roll → Lie; plays as poses in class mode (Toe Stand → Savasana). |
| bridge:supine-prone | ok | Roll to the side reads; plays in class mode (Sit-up → Cobra). The sprite predates the midpoint tie rule (see CLAUDE.md); held stages match. |
| bridge:prone-supine | ok | Mirror of the above; matches. |
| bridge:supine-kneeling | ok | Matches. |
| bridge:kneeling-supine | ok | Matches. |
| bridge:seated-kneeling | known | Legs to the side: the folded leg reads a little rounder (subdivision pinch). |
| bridge:seated-supine | ok | Turn on the seat (front view) matches. |
| bridge:supine-seated | ok | Matches. |

Counts (postures): ok 10 · fixed 9 · known 7. Bridges: ok 7 · known 1.

After the review fixes (measured `SKIN_FIT`, `jointRadii`) the 26 postures'
sheets were re-shot and looked at again (worst-edge median 2 px, p90 8 px,
unchanged); the bridges were not re-shot (the dev-only route that showed
them was removed) — they share the same body.
