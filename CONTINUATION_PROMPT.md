# CONTINUATION_PROMPT — 26 & 2 / bikram (resume here, 2026-09-29)

Read `CLAUDE.md` first (architecture + conventions; it is current). This file is the
newest-first log of where the work stands and what is still open.

**Live**: https://bikram-chi.vercel.app · **Repo**: https://github.com/robjohncolson/bikram (PUBLIC
since 2026-08-27) · deploy with `npx vercel deploy --prod --yes` · `npm test` = 103+ tests / 14 files,
all green on the 2026-09-27 working tree (see the top entries). **Deploys now happen from GitHub on
push to `main` via Vercel's Git integration**; the CLI token on this machine is expired.

---

## ✔ 2026-09-29 (late night) — THE OTHER TWELVE POSTURES REFINED (uncommitted)

`docs/posing-refinement-2-spec.md`, as uncommitted working-tree changes (not reviewed, not
committed). References: Wikimedia Commons photographs and the yogajala cheat-sheet illustrations,
downloaded ONLY to `C:/Users/rober/Downloads/bikram-ref/` (outside the repo) and looked at; nothing
from them is in the repo. Output = numbers in the posture/bridge modules (docstrings say what and why):
- toe-stand — Fold folds over a bent standing knee and Sit to the heel sits lower, leaning forward:
  the fingertips now reach the floor (the hands fell 24–32 cm short; reach warning gone).
- spine-twisting — set-up only (Arm over the knee / Hand behind / Change): the shoulder girdle turns
  a first 25° so the hooking arm reaches the knee (4.7 cm short; warning gone). Twist untouched.
- eagle — deeper sit, torso inclined, legs solved to planted feet; right thigh laid ON the standing
  thigh, shin wrapped behind the calf; elbows cross in front of the chest, palms before the face;
  Sit low / Right leg over / Left side take the `quarter` view; ghost rebuilt with the same solver.
- standing-bow — Kick and Full bow solved from the holding hand (`bow_leg`): thigh steep behind,
  shin upright, foot above the head, chest level, front arm level.
- balancing-stick — the stick exactly level fingertips to heel (both ends rose slightly).
- tree — the Bikram form: lifted foot on the FRONT of the standing thigh by the hip crease, knee out
  and down; palms really meet at the chest centre (they stood apart); holding hand reaches the foot.
- awkward — already our form (arms forward throughout); Part one's chest lifts over the hinge.
- standing-head-to-knee — Elbows down / Head to knee: back domes up from the hips and the head hangs
  onto the knee; shoulders round forward; arms solved to the foot, elbows below the calf.
- wind-removing — hugged shins near level (feet above the hips); left knee and both knees as deep as
  the right. FLAT (canonical supine) untouched.
- situp — Fold forward: back domes up, head tucked with the forehead over the knees.
- rabbit — Crown to the floor and Hips up put the crown ON the floor in front of the knees (it
  hovered 8–13 cm up); hips are the top of the wheel.
- pranayama, kapalbhati — shape already right; untouched.
- `bridges/_canon.py` — `sat_up` / `swivel` hands behind planted nearer the seat (3–4 cm short).
  Canonical poses untouched. Codex review (same night): the floor-planted hands of `sat_up`, `swivel`
  and `side_sit` were aimed down from a wrist 5 cm up, putting the fingertips ~4.5 cm through the
  floor (pre-existing); they now lie flat along the floor. New `floor_check(pose, name)` in `_canon.py`
  runs FK on every MID pose and prints `floor warning [...]` for any hand/foot tip below z = -0.005
  (held midpoints only, not in-betweens). Changed bridges: seated-supine, supine-seated, seated-kneeling.
  Also: toe_stand / wind_removing / situp docstrings now say `pelvis.location` is world space and
  `shift` an identity.
Reach warnings: none left in any posture or bridge module. Re-rendered (one `npm run motion`): the 11
postures above + bridge:seated-supine + bridge:supine-seated (+ bridge:seated-kneeling after the
review; 85 files in `public/motion/`, one per
stem; manifest `position` fields unchanged). `npm run rig:export`; Blender `export_fixtures.py`
(changed: spine-twisting--hand-behind--right-side--50). `npm test` 253/25 green (no assertion
touched), `tsc -b`, lint, build clean. Sprite vs live re-shot for the 11 postures (91 stages, median
2 px / p90 6 px); bridges not re-shot (no page route), their sheets read frame by frame.
Commons files used (licences from `bikram-ref/commons/LICENSES.md`):
Bikram_Yoga_sequence_of_asanas.jpg (CC BY 4.0, BMC article figure) · Bpose12.jpg, Bpose1.jpg
(CC BY-SA 4.0, Ambermarquez31) · Ardha-Matsyendrasana / Garudasana / Natarajasana / Vriksasana /
Utkatasana / Utthita-Hasta-Padangusthasana / Paschimotanasana "Yoga-Asana Nina-Mel" (CC BY 3.0,
Kennguru) · Ardha Matsyendrasana – Half Lord of the Fishes, Garuḍāsana – Eagle Pose 2 in side view,
Utkatasana Side View (CC BY 2.0, lululemon athletica) · Garudasana.jpg (CC BY-SA 4.0, Yogini Asha) ·
Vivek Natarajasana.jpg (CC0) · Natarajasana-yoga-posture-dancer.jpg (CC BY-SA 3.0, Jfbongarçon) ·
Tuladandasana – Virabhadrasana III (CC BY-SA 4.0, Robert Lindermayr) · Tuladandasana.jpg,
Dandayamana-Janushirasana.jpg, Rabbit pose.jpg (CC BY-SA 3.0, Drchirag patel) · Yagnesh Dhruvasan.jpg
(CC BY 4.0) · A style of pavanamuktasana.JPG (CC BY-SA 3.0, Thamizhpparithi Maari).
Still open: commit + push; Codex review.

---

## ✔ 2026-09-29 (night) — POSTURES REFINED AFTER THE REFERENCE PHOTOGRAPHS (uncommitted)

`docs/posing-refinement-spec.md`, as uncommitted working-tree changes (Codex-reviewed, fixes
below; not committed). The changes are all in `scripts/blender/postures/*.py` (plus
`bridges/_canon.py`'s reach warning): stage directions and rolls, but also small reach/grip
solvers (cobra's LIFT hint, standing-separate-leg-stretching `two_bone`/`grip_heels`/ghost
solver, half-moon `_reach`/`_fold_arms`, head-to-knee `fold_clavs`/`arms_to(clavs, short)`),
two stage camera `view` strings (locust, half-moon), re-aimed guides (locust leg line,
standing-separate-leg floor line) and docstrings. Stage labels and order are untouched, and the
canonical poses PRONE/KNEEL/SIT are untouched, so no bridge changed. The reference pages were
only looked at; nothing from them is in the repo. Per posture (each module's docstring says
what and why):
- cobra — Lift: flat pelvis, curl from the low back reaching forward (shoulders over wrists),
  head back, elbows back beside the ribs (was an upright stub with flared elbows).
- locust — Right leg / Left leg: `quarter-back` view so which leg is up reads; leg at a true 45°;
  leg guide on the lifted leg's hip line. full-locust — wings level with the shoulders in the flight.
- bow — Kick up: deeper bowl (thighs steep, shins upright, soles up, chest and head lifted).
- camel — Heels in hand: head drops back toward the heels, the arc continues through the neck.
- fixed-firm — Elbows down: chest lifted, head upright; lying stages keep a gentle low-back arch.
- half-tortoise — longer fold, forehead further forward. spine-twisting — twist ~75° (was ~60°).
- head-to-knee-stretching — Hold the foot: hinged forward so the hands really reach the foot.
- standing-separate-leg-stretching — wide straddle (~39° legs, feet ~1.3 m, flat on the floor),
  head reaches the floor, arms solved to the outer heels; floor guide spans the new heels.
- standing-separate-leg-head-to-knee — arms hang steeper than the leg (the "solid band" is gone).
- triangle — pelvis/spine/head one even diagonal. half-moon — Hands to feet: `side` view, torso
  down the front of the legs, arms round to the heels. savasana — Stillness: hands away from the
  thighs, feet fall open.

Re-rendered those 14 sheets (`npm run motion …`, one run; old hashes gone, 85 files, one per stem;
manifest `position` fields unchanged), `npm run rig:export`, Blender `export_fixtures.py`
(refreshed: cobra--lift, half-moon--hands-to-feet, savasana--stillness, spine-twisting--right-side,
spine-twisting--hand-behind--right-side--50). `npm test` 253/25 green (no assertion touched),
`tsc -b`, lint, build clean. Sprite vs live re-shot for the 14 (98 stages, median 2 px / p90 8 px).
Codex review round (same night): standing-separate-leg-stretching's ghost is re-solved on the
real pose's footprint (same ankles, flat feet, knees bent forward, hips sunk and drawn back —
its toes went through the floor); its palms (not wrists) now land on the outer heels
(`PALM` = 0.035 m past the wrist). head-to-knee-stretching: both hands reach the foot in Hold
the foot, Forehead to the knee, Left leg and Both legs (shoulders protract, the far one most;
palm offset explicit in `grip`); its ghosts fall short on purpose (`short=True`). half-moon's
Hands to feet palms land behind the heels (was 7.5 cm short). Every two-bone reach helper now
prints `reach warning [...]` to stderr when a target is > 1 cm out of reach. Remaining warnings
(pre-existing, sheets untouched): spine-twisting SET_RIGHT arm hook 4.7 cm (Arm over the knee /
Hand behind / Change), toe-stand hands to the floor 24–32 cm, `_canon` bridge midpoints 3–4 cm.
Re-rendered half-moon, head-to-knee-stretching, standing-separate-leg-stretching only; rig and
fixture exports rerun (half-moon--hands-to-feet refreshed again); tests 253/25 green.
Still open: the rig's short torso limits how far Cobra and Camel can arch (the arms reach the
floor/heels only at these depths); commit + push; Codex review.

---

## ✔ 2026-09-29 (afternoon) — LIVE FIGURE ROLLED OUT TO ALL 26 (uncommitted)

`docs/live-figure-rollout-spec.md` §1–§5, as uncommitted working-tree changes (not reviewed,
not committed). `RIG_LIVE` is now every posture with rig data (derived from the generated
sheets; `rig-data.test.ts` pins it = the 26 manifest postures, no bridges, and that every
posture of the sequence draws the rig in class mode). Posture pages show sprite + live side
by side for all 26.

+ 2026-09-29 (evening, uncommitted): HAND ORBIT on posture pages (`docs/live-figure-orbit-spec.md`)
— drag/arrow keys turn and tilt the live figure (`useOrbit.ts`, `camera.ts withOffset`,
elevation ±60°), "Reset view" eases back; class mode unchanged (no orbit, authored views).
`camera.test.ts` + `useOrbit.test.ts` (+18 tests); screenshots in the session scratchpad.
Codex review fixed: one owner of the view (`orbitReducer`; a key/reset mid-drag ends the
drag), no drag without pointer capture, camera.ts tilt comment reworded.

Proof: a scratchpad Playwright script screenshotted sprite and live at every stage chip of
all 26 postures and 8 bridges (layers off, then on where a stage has guides/ghost), one sheet
per id, each looked at; the table Robert reads is `docs/live-figure-rollout.md`:
postures ok 10 · fixed 9 · known 7; bridges ok 7 · known 1. The known rows are cosmetic
(fully folded knees when sitting on the heels read ~0.04 m longer/rounder — Blender's
subdivision pinches them; a waist nick in Pranayama's side view; Full Locust's head seen
end-on as a ring). Worst per-stage ink bounding-box difference: median 11 → 2 px of 342, p90 14 → 8.

Fixed generically (no posture data touched):
- `body.ts`: the mesh is built from `SKIN_FIT` (the SUBDIVIDED skin's sections, measured by
  sectioning Blender's evaluated body) instead of skin radii × 0.95; leaves end AT their
  vertex (the head, hands, feet and lying figures were ~0.05 m long); hinge joints turn
  halfway between their bones (`placeJoint`) and cover both tube rims at any bend (Camel's
  lumpy back). `body.test.ts` (+5 tests).
- `figureRigScene.ts`: stroke width matched to the sheets' measured ink (`INK_PX` 3.05 px at
  240 — the live strokes were 2/3 as heavy); a normal crease strokes only where it is a
  contour (`GRAZING`), so concave folds draw nothing; the depth jump is measured against the
  surface's own slope (a grazing heel drew a grey block).
- Supersampling measured and NOT adopted: class-mode size 390 px, DPR 1, 4× CPU throttle,
  6 runs each: batched blend frame median 6.1 ms without / 8.8 ms with 2× supersampling;
  frame + readback latency median 11.2 / 16.0 ms.

Class mode (no flag), watched in a foreground Playwright Chrome: short class Pranayama → Half
Moon → Awkward → Eagle → Cobra → Camel → Spine Twisting → Kapalbhati with Next skips and a
pause/resume (figure frozen while paused, carries on after); full class skipped to Toe Stand →
Savasana (the standing→supine bridge plays kneel, hands and knees, roll, lie), Wind Removing
(guide flashes on coaching lines, 3 in 150 s), Sit-up posture (the sit-up plays; the
supine→prone bridge rolls into Cobra); Half Moon from the start caught a guides flash and a
ghost flash fading in. Every sampled frame after the first was the rig. `/pose/savasana`,
`/cobra`, `/locust` at 360 px: the two figures stack, no horizontal overflow, both themes.

Codex review (2 × P2) fixed, still uncommitted:
- Joints under bend + ROLL: `jointRadii` (body.ts) sizes each hinge joint per pose to enclose
  every tube rim exactly (the fit at rest; grown per axis then uniformly, whichever grows
  least); the renderer applies it per frame. Spine Twisting's waist needed > 1.01 before.
  `body.test.ts` checks the production path (`placeBone`/`placeJoint`/`jointRadii`) on every
  Spine Twisting stage and blend, both sides, and synthetic longitudinal/plain/compound turns.
- `SKIN_FIT` is now MEASURED by `scripts/blender/measure_skin_fit.py` (Blender) into
  `src/rig/fixtures/skin-fit-from-blender.json` and held to it by `body.test.ts` (pelvis
  0.14 → 0.155 across, ankle and hip re-measured; sheets re-shot, same numbers).
- Sheets never missing mid-class: `preloadRigData` (readiness promise) runs for every posture
  + the eight bridges when the Pacer opens and again on Begin; class mode HOLDS the current rig
  pose while a destination sheet loads (`holdUntilLoaded`, unit-tested with a delayed promise
  and early skips; also checked in Chrome with the Awkward sheet delayed 15 s: Half Moon's pose
  held under the Awkward header, never a sprite frame).

Not done / open:
- At class OPEN the sprite still covers the first ~0.2 s (dev server) while WebGL starts and
  compiles, even with `Pacer` now warming the rig chunks (`components/rigPreload.ts`) and class
  mode preloading every sheet; after that no sprite frame was seen, skips and hand-offs
  included. Removing it would mean an empty figure while loading, which the reviewed
  fallback design rejects.
- The known rows above (a pinched-knee model for full flexion would fix most of them).
- The live figure lays ~13–20 % more ink than the sprite (arm-against-torso contours run
  longer); stroke profile itself matches.

---

## ✔ 2026-09-29 — LIVE FIGURE (`ec7207a`, pushed; Codex-reviewed, 6 findings fixed)

Implemented `docs/live-figure-spec.md` §1–§7 as uncommitted working-tree changes (not reviewed
by Codex yet, not committed, not pushed). What shipped:
- `scripts/blender/export_rig.py` (`npm run rig:export`) → `src/data/rig/*.json` + `skeleton.json`;
  `scripts/blender/export_fixtures.py` (runs in Blender) → `src/rig/fixtures/*.json` (15 cases).
- `src/rig/`, a pure TS rig (pose/inbetween/mirror/camera/body/sheet), with a parity test against
  Blender on the PRODUCTION path (`applyStage`/`ghostPose`/`sheetPose`, no exclusions): every held
  stage, the ghost and every in-between are within ≈5e-6 m (the fixtures' 5-decimal rounding).
  After the Codex review, `render_motion.py` `midpoint_dir` got a deterministic tie rule
  (`MIDPOINT_TIE = 1e-6`: on a tie the higher way round wins, then the one further back), mirrored
  exactly in `src/rig/inbetween.ts`. Before it, an exact tie (the sweep axis X blinds the side
  term) came down to float32 noise; the supine→prone bridge's right forearm/hand was one. The
  fixtures were re-exported with the rule. **The `bridge:supine-prone` SPRITE SHEET was rendered
  before this tie-break and may differ from the rig by that one limb's sweep until the next
  `npm run motion bridge:supine-prone`** (not re-rendered yet, on purpose).
- `src/components/FigureRig.tsx` + `figureRigScene.ts` (three r186, a lazy chunk of 557.8 kB /
  140.1 kB gzip; the main bundle went 742.7 → 763.4 kB), `PoseMotion renderer/pose/breathProgress`,
  `figure.ts` `poseAt`/`figurePoseAt`/`FrameStep.blend`/cut markers, class-mode wiring, the
  PoseDetail side-by-side, and the rollout flag (`RIG_LIVE = {'half-moon'}`, `?figure=rig|sprite`).
- Tests 162 → 214 (21 files). tsc, lint and build are clean.
- Codex review fixes: `RigBoundary` (+ `rigFallback.ts` state machine) catches a rejected
  FigureRig/three chunk and keeps the sprite (smoke-tested by blocking each chunk: no page error);
  `applyFigureFlag(search)` owns the `yoga-figure-v1` side effect and `figureRenderer` is pure
  (PoseDetail, Pacer, PacerClassMode call it whatever the posture); the rig demonstration keeps
  its elapsed sheet time across pause/resume and only a chip seeks (`stageStartAt`); a cut marker
  followed at once by a travel carves its wrap window out of that travel (`poseAt`); a rig that
  fails mid-play hands the sprite the nearest frame (`frameForPose`) and keeps play/pause; the
  class-mode breath clock is shifted by the pause so the rig chest resumes without a jump;
  `export_fixtures.py` also writes `fixtures/skeleton-from-blender.json` and the skeleton test
  compares the TS rig and export_rig.py's copy with it; the edge quad is disposed.

Measured on this laptop (Intel iGPU via ANGLE D3D11, Chrome via ad-hoc Playwright): a blend frame
at the class-mode size (390 px, DPR 1) takes 1.07 ms at 1× CPU and 5.0 ms at 4× CPU throttle. That
is averaged over 120 frames, with the GPU included by one readback. Single frame + readback
latency is 2.1 ms / 7.9 ms. At 780 px it is 5.7 ms / 8.2 ms at 4×. Inside the running class, with
a readback after EVERY render, the median was ~24 ms. That number is the synchronous readback
waiting behind the page's own compositing, not the edge pass; the batched figure is the honest one.

Screenshots taken and checked: posture-page hero sprite beside live (dark + light); chips on Right
side (front, guides), Backbend (side, face to screen right), Hands to feet (quarter), and the ghost
on Right side; cobra Lift with `?figure=rig`; the 360 px phone layout; class mode Pranayama → Half
Moon (entry, right side) → Awkward. Tuning that came from them: elliptical skin radii (round tubes
looked fat from the side), BODY_SCALE 0.95, DEPTH_JUMP 0.05 m, normal crease at cos < 0.

Not done / open:
- The live figure is built from tubes and ellipsoids, not the subdivided skin. Bends show small
  kinks at joints, and in Tadasana the chest shows two short armpit strokes the sprite lacks.
- Strokes are jagged at DPR 1 (the edge pass runs on a 1× target with no supersampling).
- Reduced motion and the context-loss fallback are implemented but were not exercised in a browser.
- A class-mode BRIDGE with the rig (e.g. into savasana with `?figure=rig`) is unit-tested
  (`figurePoseAt` follows the bridge sheet) but was not screenshotted.
- At 360 px, `/pose/half-moon` overflows by 25 px because of the long timing pill. This was already
  there (69 px on HEAD); the new `minmax(0, 1fr)` header column reduced it.
- Done after this entry was written: Codex (gpt-6-astra) review — 6 findings (lazy-chunk
  boundary, flag persistence, pause continuity, parity on the production path with a
  deterministic midpoint tie-break in `render_motion.py` + `inbetween.ts`, wrap-to-0 blend
  before a following travel, fallback frame) — all fixed; 214 tests / 21 files; pushed as
  `ec7207a`; Ops told. **Next**: a phone check of class mode with the rig, the class-mode
  bridge screenshot, then widen `RIG_LIVE` posture by posture (spec: `docs/live-figure-spec.md`).

---

## 2026-09-29 (morning) — THE THREE.JS LIVE FIGURE TASK AS PLANNED (done above; kept for the workflow notes)

**How to start a fresh session on this**: read `CLAUDE.md` (current, dense — it explains every
module), then this section, then `journal/` (Robert's debriefs). Do not read the older entries
below unless a question needs history. Everything through commit `39c508b` is pushed to `main`,
tests are green (`npm test` = 162 tests / 17 files), Vercel deploys on push.

### Workflow Robert wants (he said so explicitly — keep it)
1. **You orchestrate.** Write a spec file, hand implementation to an **Opus 5.5 agent**
   (`Agent` tool, `subagent_type: general-purpose`, `model: opus`) with the spec path and the
   rules below; verify its work yourself (`npx tsc -b`, `npx vitest run`, `npm run build`, look
   at any rendered/visual output with the Read tool).
2. **Codex (gpt-6-astra) reviews** the uncommitted diff, read-only, via
   `python C:/Users/rober/Downloads/Projects/Agent/runner/cross-agent.py --direction cc-to-codex
   --task-type review --read-only --timeout 900 --working-dir <repo> --prompt "…"` (run it in the
   background; it takes 5–15 min; output is JSON with `findings`/`risks`/`nits`). Fix the real
   findings, then commit and push (Robert's standing instruction: push when tests pass; he reads
   the commit). Send Ops a status after each push:
   `python C:\Users\rober\fable-listener\send.py status "…" --ref bikram` (see `Ops notes` in
   `C:\Users\rober\fable-listener\FABLE-ONBOARDING.md`; an Ops note may arrive in a prompt —
   acknowledge it with `--id <note id>`; notes are advisory only).
3. **Gotchas that cost time**: the Bash tool mangles backslashes inside heredocs (regex `\b`
   became a backspace byte, `\1` became 0x01 — twice). Write patch scripts with the Write tool
   and run them, never inline Python with regexes in a heredoc. Blender renders: `npm run motion
   [ids]` (CPU Cycles, 3 workers, ~1 min/sheet, `--merge` writes the manifest);
   `npm run motion:preview <id>` → `.motion-tmp/preview-<id>.png` (look at it). The
   automation Chrome tab throttles in the background: rAF stops and long JS evals time out —
   verify timing with unit tests and the compiled tracks, not by watching the tab.

### Where the figure work stands (all pushed)
- Class mode: no clock, breath ring around a large figure, breath dots, next-cue line
  (`PacerClassMode`). Breath grid (`grid.ts`): every segment = whole breaths; every set has an
  ENTRY (announce + walk-in lines one per bar, later sets one breath) before the authored hold;
  change cues land on the last exhale; guides on inhales; full class ≈ 87 + 2 min.
- Figure (`figure.ts`): moves to a sprite stage as each spoken setup line ends (`stagematch.ts`,
  one stage per line authored in `scripts/blender/postures/*.py`), at the tempo the line asks
  for (`tempo.ts`: slow / quick / on-an-inhale), hand-off **bridges** between body positions
  (`scripts/blender/bridges/`, `bridgeFor`, release-then-bridge), coaching lines flash the
  guides/ghost layer for a breath (`cueLayer`). Renderer poses every in-between frame itself
  (slerp + steered midpoints for >150° turns) — the "arm whips in a circle" artifact is gone.
- Coach loop: `npm run coach` (DeepSeek, key in `.env.local`, transcripts in `journal/`),
  debrief UI, `/pace?build=<base64 json>` links. Robert's 2026-09-28 debrief and his next class
  are in `journal/2026-09-28.md` (cyclist: hips/hamstrings/quads; low ceilings; walks all day).

### The three.js task (decided 2026-09-29; Robert: "Let's go")
Replace the sprite sheets with a **live three.js rig** as a second renderer behind the same
`PoseMotion`-style interface, sprites kept as fallback. Spec to write for the Opus agent:
- **Data**: export every posture/bridge module's stage dicts (world-space bone directions, rolls,
  `pelvis.location`, guides, ghost, view, frame, position) from Python to JSON
  (`src/data/rig/*.json`, GENERATED by a script under `scripts/blender/` that imports the
  modules — no Blender needed) so the app can pose the rig itself.
- **Rig in TS**: port `BONES`/joints (`scripts/blender/render_motion.py` `J`, `BONES`) and the
  aiming routine (`apply_stage`: aim parents first, world-space directions, roll about the bone
  axis, omitted children ride a rolled parent) to a pure module with tests (`src/rig/`), plus
  the in-between math already in the renderer (`inbetween`: sign-compatible slerp, steered
  midpoints for big turns, ancestors first). Verify parity against a few known stage frames.
- **Look**: tube mannequin (capsules per bone, the hand/foot swellings) drawn as LINE ART in
  `currentColor` on transparent — an outline/edge post-pass (inverted-hull or screen-space
  edges) approximating the Freestyle look; ghost in `--ember` mix under, guides in
  `--stretches` over, as today; both themes; ortho camera with the per-stage `view`/`frame`
  orbits; reduced motion respected.
- **Player**: `FigureFrame` becomes a continuous pose: the figure plan's timeline gives
  "stage A → stage B, progress p" (extend `segmentTimeline`/`figureFrameAt` to return a
  `{from, to, t}` blend instead of a frame index; keep the sprite path working); the rig
  interpolates live at any tempo; bridges become real pose interpolation (no cuts); mirrored
  sides come from mirroring directions, not extra data; the breath swell moves the chest
  bones. Lazy-load three (~600 KB) only for class mode; measure on a phone.
- **Rollout**: one posture live first (Half Moon), side by side with its sprite, then all;
  sprites stay for posture pages until the rig is proven; `PoseMotion` chooses by a prop.
Then: Codex review, fixes, push, Ops status, and a class-mode check.

---

## ✔ 2026-09-27 (later) — TEACHING LAYERS, BREATH, SHORT CLASS, TONIGHT CARD (UNCOMMITTED until pushed)

Second pass on the figures, same pipeline (Opus implements → Codex gpt-6-astra reviews → fixes).

- **Rig**: hands/feet volumes on the skin mesh; per-bone `roll` (`{'dir', 'roll'}`; omitted children
  ride a rolled parent — how Spine Twisting's shoulder line now turns); **guides** (world-space
  lines/planes → `<id>.guides.<sha>.png`) and **ghost** (a mistake pose on a second mannequin →
  `<id>.ghost.<sha>.png`), identical frame layout to the figure sheet, blank outside their stage.
  All 26 modules carry guides + a ghost on their full-expression stages (Savasana: guide only).
  `content_address` now cleans exact stems only. README documents every key — author from it.
- **Player**: three stacked luminance-mask cells (ghost under, figure, guides over — tokens
  `--ember` mix / currentColor / `--stretches`); Guides + Mistake chips (`aria-pressed`,
  persisted `yoga-motion-layers-v1`); class mode forces guides on / ghost off, no chips.
- **Breath**: `breathPhaseFromBeat` (timing.ts, tested) → `PoseMotion.breath` → CSS transform
  transition on the stack (`data-breath`, `--breath-dur`); pulse mode = still; pause pins the
  computed transform inline (Codex finding — transitions can't pause); hero breathes at the six-count
  via `useRestingBreath`; reduced motion disables all of it.
- **Short class** (`src/pacer/programs.ts`, tested): 8 postures, first set only (segments cut from
  the first "Second set …" label; floor postures keep their savasana/sit-up exits), 15 min + final
  savasana; `buildClassTrack(bpm, from | program)`; `/pace?program=short`; picker on the idle card
  (`role=group` + `aria-pressed`); `ClassRecord.program` (optional, old records load).
- **Tonight card** on `/`: streak, days since, one primary action (short class), practised-today
  state offers the trainer's due count.
- Codex round 2: 4 findings (stale sheets → re-rendered; breath not frozen on pause → fixed;
  radiogroup without radio keyboard semantics → toggle buttons; "four standing postures" → three).

**Open:** phone-width check of the Tonight card and class-mode figure with three layers; the
Separate Leg Stretching ghost hides behind the figure at the quarter view; `mirror: True` (second
mannequin for the other side) not implemented; `.container` padding still overrides `.tl-hero`'s.

---

## ✔ 2026-09-27 — ANIMATED FIGURES: all 26 postures rendered from a Blender mannequin (UNCOMMITTED)

**What this is.** Every posture page now has a moving line-art figure in the hero (play/pause +
stage chips), and the pacer's immersive class mode shows it looping while a posture runs (withheld
with the name in rehearsal). Built as a pipeline, not hand-drawn frames — see CLAUDE.md
`src/data/motion/` and `scripts/blender/postures/README.md` (the rig contract; read it before
touching a posture module).

- **Blender 5.2.1 LTS** is a portable unzip at `C:/Tools/blender-5.2.1-windows-x64` (winget's MSI was
  403). `npm run motion [id …]` renders sheets (~1.5 min each, serial — the manifest is one generated
  file); `npm run motion:preview <id>` renders only the held stages to a contact sheet
  (`.motion-tmp/preview-<id>.png`) — the fast tuning loop.
- **Rig**: procedural tube mannequin, posed by WORLD-space bone directions per stage
  (`scripts/blender/postures/<id>.py`, 26 modules). `pelvis.location` is world space too (a bug in
  the first pass applied it bone-locally; fixed in `apply_stage`, every module's `at/shift/offset`
  helper is now an identity left in place). Camera orbits on a pivot empty so view swings stay
  centred. Side view: the face points screen-RIGHT.
- **Output**: `public/motion/<id>.<sha1:8>.png`, grayscale luminance masks (2.0 MB for all 26),
  content-addressed so the worker's cache-first `yoga-motion-v1` refreshes on re-render.
  `manifest.test.ts` pins ids, files, stage order.
- **Process**: 5 Opus agents authored the postures in parallel (previews only), 5 re-verified after
  the pelvis fix, Codex (gpt-6-astra) reviewed the code — 5 findings, all fixed: the class-mode
  figure is a LOOPING demonstration, not scrubbed to class time (segments ≠ stages, e.g. Half Moon
  9 stages / 8 segments, Awkward's Rise stages); hashed sprite names; camera pivot; `main.tsx`
  re-sends the precache list on `controllerchange`; reduced-motion is live (media-query subscription)
  and stops autonomous play.

**Known compromises (rig has no fingers, no bone roll, no joint limits):** Eagle's wraps are crossed
stacked limbs; Spine Twisting's twist is carried by the shoulder line (back view); one-sided floor
stages (Locust, Wind Removing, Head-to-Knee) look alike from the side; Cobra reads a bit upright.
Each module's docstring/report lists its own. Standing Separate Leg Head-to-Knee's fold is a solid
band. Improve by editing the module and re-previewing — never the renderer per posture.

**Not done / next:** commit + push (deploys via Vercel Git integration); phone-width check of class
mode with the figure (agent verified desktop only); the pre-existing timing-pill overflow at
≤375 px on `/pose/half-moon`; Timeline cards still use the static SVG figures (fine — the sprite is
for detail + class). Rig upgrades worth considering: hands/feet blobs, bone roll for twists.

---

## ✔ 2026-09-04 — ALL 26 "Go deeper" NOTES ARE LIVE (`de73cc1`, by Codex) — independently reviewed

**What shipped** (17 files, +516/−821): the eleven held-back notes rewritten against their sources and
indexed; `scripts/gen-classical-index.py` deleted in favour of a hand-kept `src/data/classical/index.ts`
plus `index.test.ts` (globs every `NN-*.ts`, requires each id to be indexed or listed in
`pendingClassicalAudit` — now `[]`); PoseDetail plural by digit runs plus a name normaliser (diacritics,
hyphens, trailing roman numeral) for the "same name" heading; both classical grids
`minmax(min(100%, …), 1fr)`; a ≤420 px nav rule (8 px link padding, 13.5 px). `npm test` 89/89,
`tsc -b` clean, build clean. Pushed to `main`; **Vercel's Git integration deployed it automatically**
(the CLI token on this machine is expired — `npx vercel deploy` will prompt to log in).

**Independent review** (12 agents — one per note plus one for code; every source URL fetched, 8-word
shingle originality scans, the three syllabus PDFs text-extracted, mutation tests on the gate, playwright
`isMobile` measurements at 320–425 px): **no `fail`.** `pass`: 10, 21, 25. `pass-with-fixes`: 13, 14,
15, 20, 22, 23, 24, 26, code. Every specific defect the 2026-09-03 readers flagged is fixed — Camel's
uncited hold and "Iyengar walks on…", Kapalbhati's studio-blog "Iyengar's own summary", Rabbit's
headstand contact point, Head-to-Knee's Arogya-Yoga "he warns", the Fixed Firm sit-all-the-way-down
trap, the Savasana cue the pose file lacks, Yoga Makaranda 1935, `plates plate 92`, the sameName
heading, the grid overflow, the nav. Originality holds in all rendered prose; Light on Yoga is cited by
plate/grade only.

**Punch list (do before the next content pass; only the first is user-visible today):**
- **`/pose/situp` scrolls horizontally at 320–372 px.** `15-situp.ts:116` sets `reference.plates` to
  `'153–162, as Paschimottanasana'` and `.pill` is `white-space: nowrap` (328 px pill in a 270 px
  column; measured `scrollWidth` 373 at viewports 320 and 360). Fix: `.pd-classical-ref .pill
  { white-space: normal }` (mirrors `.pd-ladder-chips .pill`) and/or keep `plates` numeric and move
  "as Paschimottanasana" into prose. The same note still carries a `reference` on an `asana: null` note
  — the E028 contract question (15 does; 12/21/23/26 refuse). (`PoseDetail.tsx:131`)
- **22-camel: the rendered contrast reads as audit narration** — "two Iyengar-association syllabi
  independently confirm plate 41"; "The book-level claim stops there: the technique below comes from
  cited modern teaching pages… not from an unchecked attribution to Iyengar himself"; "Related teaching
  sources describe the pelvic action in different language…". Sourcing commentary belongs in the comment
  block; the contrast is the teaching. Also stage 4 grips the heels before releasing the head — the pose
  file (and the note's own contrast) release the head first. (`22-camel.ts:86,98`)
- **23-rabbit: refinements 3–4 leak auditor-speak** — "the independent Rabbit source", "the pose page's
  instruction", "the local cue". Say it to the practitioner. Etymology: "related explanations" → "two
  related words". (`23-rabbit.ts:57,63,64`)
- 24: `difficulty: 6` still stands on a two-asana reference (the index gives Janu Sirsasana 5,
  Paschimottanasana 6) — drop the grade or allow two references. "The Light on Yoga index gives…" should
  read "A published index of Light on Yoga gives…" (the source is Barber's sheet, not the book's own
  index; same wording in 10). (`24:60,62`, `10:91`)
- 26: "The 26 & 2 list still identifies item 26 as a shatkarma" attributes a Wikipedia editor's
  annotation to the lineage — say "Wikipedia's table of the sequence…"; stage 4's "the authored quicker
  pace" is repo jargon. (`26:47,59`)
- 20: refinement 5 ("do not treat [the exhale] as an instruction to descend") pushes against the pose
  file's breath line ("let each exhale release you a little deeper") — not a safety clash, reword;
  "later Supta Vajrasana" → "further into the book". (`20:71,77`)
- 14: plate 287 belongs to Supta Padangusthasana II in all three syllabi (the index CSV row is
  undifferentiated); yogavastu is credited with teaching points its page lacks; Supta Baddha Konasana
  and Ananda Balasana in the ladder have no remaining source. (`14:27,43,59`)
- 13: the comment block carries a near-verbatim *Light on Pranayama* sentence ("stilling body, senses
  and mind with the intellect alert") — paraphrase even in comments; the Canada syllabus is misdescribed
  there (Gem plate 200 at Intro I; LOY 592 from Intro II). (`13:29,68`)
- 22: the comment block has an 8-word run from yogaselection ("shins press down, backs of the thighs
  lift, fronts of the thighs draw down") — paraphrase. Several other comment-level attributions
  overstate their pages (10, 15, 20, 22, 25; details in the review file). Pre-existing, not from this
  commit: a 2 px header overflow on `/pose/head-to-knee-stretching` at 320 px (`.pd-header-copy`).
- Gate hardening (optional): `index.test.ts` checks keys only, so `camel: rabbit` or swapped imports
  would pass — add, per id, `expect(Object.values(noteModules['./NN-<id>.ts'])).toContain(classicalByPose[id])`.

Per-note findings with the sources fetched and failed: `docs/audit-2026-09-03/review-de73cc1.md`
(raw JSON in this machine's session journal `wf_fa829dfa-589`).

**Still open from ★★ that this commit did not touch:** U065 (Sit-Up's `sanskritName` still shows its
own answer on the flashcard), U071 (Go deeper findable from the header / folded on phones), E048
(book-claim register), U064 (one transliteration convention — 25 mixes "Āsana" with unmarked "asana").

---

## ★★ 2026-09-03 AUDIT + BRAINSTORM (read this before the ★ item below — it changes the order of work)

A full read of the repo on the new **Windows checkout** (`C:\Users\rober\downloads\projects\bikram`), run as
one ultracode session: **10 parallel readers** (one per subsystem) → 157 issues + 116 ideas, every one
with file:line; **14 idea lenses** (hot-room practitioner, learner, teacher-trainee, engineer, scholar,
product, subtractor, accessibility, resilience, blue-sky, then critic-added phone-body, calibration,
month-twelve, public-repo) → 183 ideas; **two mergers** → **163 deduplicated candidates** (`U001–U097`
user-facing, `E001–E066` engineering). The adversarial verification pass (a grounding skeptic and a value
skeptic per batch) was started and then **stopped at the user's request**, so: items in §0.1 were verified
by the readers *running code or measuring*; everything else is a grounded proposal, not a verdict.
**No code was changed.** `npm test` 88/88, `tsc -b` clean, lockfile reverted after `npm install`.

Full material (repo-relative paths, one paragraph per candidate with sources and files):
`docs/audit-2026-09-03/candidates.md` (all 163) and `docs/audit-2026-09-03/reader-findings.md` (the 157
issues + 116 ideas index). The raw per-reader maps and lens outputs live in this machine's Claude Code
session journals (`~/.claude/projects/<this project>/…/subagents/workflows/wf_c203d24d-252` = readers,
`wf_804cabae-4e4` = lenses + mergers; `journal.jsonl`, `type: "result"` lines).

### 0.1 Confirmed defects — fix first (verified by running code / measuring; ids → candidates.md)

| # | What | Where | Id |
|---|------|-------|----|
| 1 | ✔ **Fixed in `de73cc1`** (measured 320–425 px, no overflow). Was: the nav **clips the Pace tab** at ≤386 px (375 px iPhone SE/mini clipped, 360 px Android reads "Pac", 320 px off-screen; page scrolls sideways under the sticky header). Measured with playwright `isMobile` — desktop `--window-size` screenshots clamp and lie. | `src/App.css:44-65` | U078 |
| 2 | **Any settings or cue change mid-Kapalbhati/Pranayama drops the segment's bar override** (volume drag, mute, `[`/`]`, "Say Sanskrit names"): the `[settings, cues]` effect sends the user's `beatsPerBar`, and `applySegmentPacer` refuses to re-apply because its key is unchanged. Pulse becomes 6-beat bars for the rest of the set. | `src/views/Pacer.tsx:415-424`, `276-280` | U024 / E003 |
| 3 | `walkInSteps` "always keep the last step" speaks a **later part's instruction in the first side segment**: Locust's only walk-in line is "For the final part… lift both legs" 4 s into the right-leg hold; Wind-Removing says "After the left side…" during the right knee. Verified by compiling every track. | `src/pacer/cues.ts:86` | E030 |
| 4 | `practiceStreak` steps `cursor -= DAY_MS` and **miscounts on both DST nights** (verified under `TZ=America/New_York`: Sun 8 Mar practiced → Mon 00:30 reads 0; Sun 1 Nov → Mon 23:30 reads 2). `daysSince` two functions up is DST-safe; tests pin NOW to noon so it never shows. | `src/trainer/journal.ts:142-148` | E016 / U044 |
| 5 | ✔ **Retired in `de73cc1`** (hand-kept index + `index.test.ts` gate, mutation-tested). Was: `scripts/gen-classical-index.py` **crashes on this machine** (`open()` without `encoding='utf-8'`; every note has em dashes/macrons; locale cp1252) — the exact command the ★ item says to run. Also writes CRLF, needs cwd = root, and a **typo in `PENDING_AUDIT` silently ships an unaudited note** (the loop only tests membership). | `scripts/gen-classical-index.py:9,27,59` | E006 |
| 6 | ✔ **Fixed in `de73cc1`** (plural by digit runs, name normaliser, both grids `min(100%,…)`) — but the Sit-Up plates pill now overflows at ≤372 px, see ✔ above. Was: Classical view: plural test prints **"plates plate 92, inside Virasana"** once 21 ships; `sameName` exact-string compare gives Cobra "Classical counterpart" above prose saying the names agree; **grid overflows the card below 370 px** (`minmax(280px,1fr)` where every other grid uses `min(100%,…)`); `.pd-ladder` same. | `src/views/PoseDetail.tsx:95,123`, `PoseDetail.css:613,655` | U072 / E028 / U071 |
| 7 | Service worker: **offline only works from the second online visit** (install precaches nothing); navigation fetch has **no timeout** (stalled reception = blank page while a cached shell exists); cache-first on manifest/icons so **manifest changes never reach installed users**; **no eviction** of stale assets/clips. Live site serves hashed assets and clips with `max-age=0`. | `public/sw.js:41-79`, `vercel.json` | E001 E022 E021 E056 |
| 8 | Safari fetches `<audio>` with `Range:` and refuses a 200 for a ranged request; the SW returns full 200 bodies from the voice cache → **cached clips can fail on iOS**, falling back to TTS, which on iOS is itself unprimed → silent class. Not yet observed on a device; the "383 clips cached" check was headless Chrome. | `public/sw.js:73` | E002 |
| 9 | Debrief: `poses.slice(from+1)` lists every posture after the start **including ones skipped with Next**, default is "recalled", one tap books 25 `recall` hits at `pGuess 0.05` — the strongest evidence in the system. Skip-through is also the only way to reach "done" without discarding the class. | `src/views/Pacer.tsx:1159-1182`, `bkt.ts:18` | U004 / E036 |
| 10 | **"End class" records nothing** (no ClassRecord, no practice day, no debrief) and **leaves the metronome ticking with the wake lock held**. | `src/views/Pacer.tsx:549-555` | U005 / E019 |
| 11 | Tapping any **nav link or Back during a class kills it silently** (unmount cleanup disposes audio; `finishClass` never runs; no `beforeunload`). | `src/views/Pacer.tsx:404-410`, `App.css:1-8` | U010 |
| 12 | Rehearsal leaks: the live **segment label names the posture** ("First set — 60 exhalations", "…both knees", "…right foot forward") on card, class mode and an aria-live region before the reveal; **"Preview voice" speaks the hidden posture**; posture 1 gets four dead counts though it is shown. | `src/views/Pacer.tsx:224,562,813` | U014 |
| 13 | `loadStore`/`loadJournal` **load a newer-version blob as empty and the next save overwrites it** — a schema bump plus a stale cached shell wipes data. Verified with a `{version:3}` blob. Pacer settings have no version at all. | `src/trainer/store.ts:94-111`, `journal.ts:82-93` | E005 |
| 14 | Contrast: `--text-faint` is 3.1–3.7:1 and carries the **hold timings on the class map**; chakra hex as Explorer pill text falls to **2.0:1** (solar plexus, light) / 2.7:1 (third eye, dark); `--stretches` 3.96:1; class-mode faint 3.17:1. | `global.css:17,55`, `Explorer.tsx:92`, `Timeline.css:220` | U081 |
| 15 | When the **AudioContext itself suspends** (iOS lock, a call) `currentTime` freezes, nothing is flagged `late`, and the class resumes where it stood — the code, the metronome comment and CLAUDE.md ("catches up") disagree. | `src/pacer/metronome.ts:117` | U008 / E018 |
| 16 | No `path="*"`: `/nothing`, `/pose`, `/pose/` render an **empty `<main>`**; not-found copy hard-codes posture names that already diverge from data; PoseDetail hard-codes "of 26" and calls the breaths "Posture N". | `src/App.tsx:39`, `PoseDetail.tsx:211,260` | U079 |
| 17 | Sit-Up's `sanskritName` is `'Pada-Hastasana (Sit-Up)'` — the **flashcard shows its own answer** and the voice says "Sit-Up — Pada-Hastasana (Sit-Up)". | `src/data/poses/15-situp.ts` | U065 |
| 18 | `getNeighbors`/`classOffsetSeconds` are keyed by **object identity** (`indexOf`, `===`); a spread copy (which `cues.test.ts` already passes) yields prev = undefined, next = Pranayama, offset = whole class. | `src/data/index.ts:19,40` | E034 |
| 19 | Locust's second set is **one silent 35 s segment** — no "change legs" cue, no rest tail — while the first set has three parts. | `src/data/segments/poses-14-19.ts:43` | U002 |
| 20 | `npx oxlint` with the committed `.oxlintrc.json` **reports nothing** (unknown rule names silently accepted); the "~15 React purity warnings" baseline came from a newer npx-downloaded oxlint with react-plugin defaults. With `--react-plugin -D correctness -D suspicious`: two `no-shadow` hits (`Pacer.tsx:374`, `engine.test.ts:360`). No CI; Vercel CLI deploys the working tree. | `.oxlintrc.json` | E014 |
| 21 | Clip/speech/wake-lock hygiene: superseded clips **leak their listeners** on the shared `<audio>`; an iOS interruption (call/Siri) pauses the element with neither `ended` nor `error` → `playing` stays set and **every guide queues silently** until the next announce; `speechSynthesis` is never primed by a gesture and stays paused after interruptions; wake-lock release handler nulls whichever sentinel is current (double-acquire race). | `src/pacer/clips.ts:87`, `voice.ts:64`, `wakelock.ts:29` | E019 / E020 |

### 0.2 Content errors in the spoken class (author must confirm studio practice; then ~10 clips regenerate)

- **Spine series rests face-down.** `poses-14-19.ts` models Cobra, Full Locust and Bow as *set → 20 s supine
  savasana → sit-up → set*, so a practitioner lying on the belly hears "Twenty-second savasana. Sit-up.
  Second set — palms down…". In the standard class the four belly-down postures rest prone (head turned)
  between sets and between postures; savasana + sit-up return only after Bow. `15-situp.ts` repeats the
  overstatement ("after every floor posture"). Orchestrator confirmed by reading the file. Fix = U002
  (prone-rest segments in original wording, split Locust's second set, add `Pose.orientation`, a segments
  test that refuses a sit-up after a prone rest). Settle **Wind-Removing one set or two** in the same pass.
- **The paced class is 64 minutes, not 90.** Σ `approxTotalSeconds` = 3860 s. README, `types.ts`, poses
  01/26 and classical 01/26 all say "ninety minutes"; `segments.test.ts` is titled "near the canonical 90
  minutes" and accepts 60–95. Decision U001 (say 64 everywhere / grow the segments toward the studio
  hour, mostly transitions → U060 / two tables studio90 + express60), then E062 tightens the test to ±3 min.
- **Kapalbhati promises "sixty" and "a little faster"; the metronome delivers 90 then 75 pulses at an
  unchanged tempo** (`PoseSegment.pacer` may override the count, never the BPM). U003: a `pulses` cap
  (quiet for the rest of the segment) and either subdivide the second set or drop the two words.
- Eagle "all fourteen of the largest joints" then lists six pairs (twelve). Wind-Removing's summary says
  right/left/both compresses the colon "in the order digestion actually moves" — digestion runs
  ascending → transverse → descending. U067.
- **Unhedged medical claims** in benefits/cues/summaries/chakra "why"/reference tables (Wind-Removing
  "Relieves gas, bloating, and constipation"; Pranayama "helps with sleep quality"; Fixed Firm
  "rehabilitation posture"; "fresh blood to the brain" ×2; spoken 10:25 "doing quiet work on the thyroid";
  chakras.ts "stimulate … the thyroid and parathyroid glands") and two physiologically false lines
  ("Oxygenates the blood"; "empties the residual stale air"). U066 = three-tier rule + a `poses.test.ts`
  fence ported from the sky lens's regex (E027). Non-spoken lines can be fixed now; spoken ones ride the
  next clip regeneration.
- Savasana lists spinal erectors as a *primary stretch* (so the Explorer lists Dead Body Pose under
  "stretches the spine"); `triceps` is a muscle group no posture references. U070.
- Pronunciation respellings drift file to file ('ARD-hah' vs 'AR-dah', three -asana suffix renderings,
  'jah-noo-shear-AHS-ah-nah' mis-stresses śīrṣāsana); ten classical notes use IAST diacritics, sixteen
  and every pose header use plain transliteration. U064.
- Sky copy: "once per lunar month" (README, Today ×2, this file) but the walk is 26 days; the New Moon
  note's "Depth will come back on its own over the next fortnight" is a moon-timed prediction on a page
  that promises none; "balsamic … old vocabulary" is 1960s Rudhyar; the Last Quarter Rabbit line reads
  as permission the Rabbit page corrects; the disc lights the northern limb unsaid. U052 / U053 / U054.
- ✔ **Superseded by `de73cc1` + the 2026-09-04 review** (remaining punch list in the ✔ section). Was:
  Classical notes (live and pending): sentences attribute technique to **Iyengar himself via lineage
  blogs** (Camel's uncited half-minute hold and "Iyengar walks on from Ustrasana…"; Kapalbhati's
  "Iyengar's own summary"; Rabbit's headstand contact point; Head-to-Knee's spread thighs); Camel stage 2
  tells you to practise outside the hot room; Savasana cites a class cue the pose file lacks; Standing
  Bow's "rather than merely pointing at the mirror" puts down the class cue; Yoga Makaranda 1935 vs 1934;
  Awkward's gloss uncited; three facts from search snippets. U073 = fix the live ones now, hand the eleven
  audits a punch list; E048 = a tested book-claim register so this pattern cannot recur.

### 0.3 The roadmap, tiered (orchestrator's synthesis; every id resolves in the index at the end of this section)

**NOW — small, confirmed, or unblocking (this week):**
~~E006~~ ~~U078~~ (both done in `de73cc1`; the Sit-Up pill overflow from the ✔ punch list replaces them) · U024/E003 override bug + ref-held beat handler + split settings effect · U014
rehearsal leaks · E030 cue-compiler fixes · U005 + E019 + E020 (End class records/stops; clip/speech/
wake-lock hygiene; iOS `playback` session + prime speech in the gesture) · E001 E022 E021 E056 service
worker + headers · E002 Range/206 for Safari · U004 "only hand-offs the clock delivered" (the half that
needs no decision) · E016 clock hygiene incl. the DST streak · E005 versioned-store helper (refuse newer
blobs) · U079 NotFound · U065 Sit-Up Sanskrit · U067 the two factual slips · U081 contrast pass · U087
vocabulary pass (hand-off everywhere, "Class mode", end-of-class lines that name the savasana) · E025
data-invariants test · E027 honesty fence · E026 segment-convention tests · E014 real lint config + CI
+ engine pin · E034 id-keyed access layer · U066's non-spoken lines.

**NEXT — an afternoon to a day each; several sit behind a §0.4 decision:**
- *The class itself:* U002 prone rests (+D2) · U001 class length (D1) · U003 Kapalbhati (D3) · E062 ·
  E044/U061 derive sets + timing pill from segments, retire `Pose.timing`/`sets` · E013 first (make
  `generate-voice.mjs` run here: `where` not `which`, params in the hash, `--check`).
- *Running a class on a phone:* U007/E052 one pause that suspends the context · U008 frozen-clock
  semantics (D5) · U010 Begin → class mode, nav guard (D6) · U011 sweat-proof targets + touch lock ·
  U012 glance layout (side letter, seconds under a minute, warn pulse, bright/OLED variants) · U017
  pre-flight row · U020 class first on `/pace` · U018/E023 voice download as a consented step (D13) ·
  E032 build stamp + idle "update ready" · E038 `storage.persist()` · U048 install hint (D17).
- *Learning loop:* U022 close the debrief loop (misses → drill links; "Listen for" names real misses) ·
  U032 hooks on new cards + sequence note on Review misses · U030 walk an arc / "from the top" · U029
  chain relearn with a run-up · U038 hand-off dashes on the landing strip + band-tinted rail on the
  class map · U041 "faded" ≠ "not yet practiced" + welcome-back card · U088/U089/U090 trainer/map
  ergonomics · E009 split `pLearn` by outcome (a miss must not lift P above the prior) · E024
  `questions.ts` extraction with seeded rng · E015 engine test-debt · E018 characterization tests with
  fakes · E049 `series.ts` (the old #3 leftover — do it) · U045 two named erasures + "your data" ·
  E010 practice-file export/import (D11) · E017 merge-on-save.
- *Reading surfaces:* U049 first-visit doors + hero sentence fix · U050 today strip (D8) · U071/U072/
  E028 classical section findable, folded, phone-proof, reference contract · U076 Take care as
  who/what-instead with a header count · U033 sequenceNote where the hand-off is shown · U080 per-route
  titles + OG · U082 class-map a11y · U083 px → rem · U084/U085/U086 landmarks, live regions, Explorer
  radios.
- *Content process:* ~~U073~~ + the eleven audits ✔ done in `de73cc1` (punch list in the ✔ section) · E048 book-claim register ·
  U068 chakra frame (D14) · U064 pronunciation scheme (D15) · E051 `docs/STYLE.md` + term lint · E047
  sources-block shape + `SOURCES.md` · U052/U054/E061 sky copy + fixed-hour phase.
- *Repo as a public thing:* E042 split this file into public status + gitignored `.local` diary · E043
  README as the stranger's page (numbers only where a test pins them) · E045 licence (D16) · E046
  contributing (D16) · E059 the product "no" list · E063/E064 GitHub surface + repo name.

**LATER — multi-day or dependent:**
E004 class-run reducer (then E029 split the two 1,200–1,400-line views) · U009 pocket class via
mediaSession (D7) · U013 captions + Teacher preset · U015 tone vocabulary at boundaries · U016 tick
level · U056 "Recite the order · 3 min" track · U057 `/pace/script` · U058 compact/print + class sheet ·
U059 class clock everywhere · U060 transition segments (with U001) · U062 breaths not seconds (D) ·
U028 reveal-and-self-grade `next` cards · U031 `prev:` cards + reverse walk · U034 position both
directions · U035 recite all 26 (D) · U037 in-class recall trend · U040 class recall → due cards (D9) ·
U042 "practiced in a studio today" · U043 practice record page · U044 streak → "N of the last 7" (D9) ·
E040 fold months · U063 Sanskrit clips · U074 ladder chips → postures · U075 beginner start-here (D19) ·
U077 cross-class Take care lens (D19) · E008 answer log · E012 simulated learners · E031 calibrate
script · U093 calibration card · E035 which forgetting curve (D10) · E037 parameter sheet · E039/U095
class checkpoint · U019/E041 class instrumentation (D18) · E053 Bluetooth keep-alive + latency · E060
schema fixtures · E066 code splitting · U055 reflection line · U023 defer the debrief · U006 shorter
class presets · U094 Sanskrit optional in review (D9).

**CUT — removals worth doing:**
E006 Python generator · U053 zodiac line + lunar-day count + the Moon Chorus sentence · U036 answer
streak, praise ladder and `bestStreak` flame (keep "N in a row" only in the chain walk) · U021 hover-only
tooltips and keyboard hints on touch · U091 root/arc noisy-AND products off the headline positions
("n of 51 solid", plus a `chainP` over the 25 transitions) · E050 scaffold assets (`favicon.svg`,
`icons.svg`, `hero.png`, `vite.svg`), the `~studio` branch, unconsumed barrel exports, hard-coded "26" ·
E057 strike "optimise the beat path" (write the verdict into the metronome header) · E065 the v1 store
migration · E058 rename this file to STATUS.md and drop the commit-by-commit narrative (optional) ·
U051 the Moon lens's fate (D8).

### 0.4 Decisions only the author can make (answer these and NEXT unblocks)

1. **Class length** — pace the 64 minutes as-is and say so everywhere, grow the segments toward the
   90-minute studio class (transitions, water after Eagle, between-set turns), or two tables
   studio90/express60? What does your own 60-minute class drop? (U001, U060, E062)
2. **Spine series** — between the sets of Cobra/Locust/Full Locust/Bow: rest face-down, sit-up only after
   Bow? Wind-Removing one set (R, L, both, savasana) or two? (U002)
3. **Kapalbhati** — does the second set really go faster? Subdivide to two pulses per count, or drop "a
   little faster"? (U003)
4. **Debrief** — keep one-tap "all recalled" and lower recall's `pGuess` to ≈0.3 (three clean classes →
   solid), or neutral default (untouched = no evidence) and keep 0.05 for marked hand-offs? (U004, E036)
5. **Frozen clock** — after a call or a lock: catch up to the room's clock, or pause where you left it —
   and at what gap does catch-up stop being kind? (U008)
6. **Class mode** — is it the only surface you use once Begin is pressed (card view desktop-only or gone;
   Fullscreen pill gone)? Do you ever adjust tempo/voice mid-class? (U010)
7. **Pocket class** — screen-off with the phone face-down by the mat, accepting a real-device test
   cycle? Or dimmed screen + voice only? (U009)
8. **Moon lens** — keep whole / shrink to the calendar half / delete? Zodiac line and lunar-day count?
   Posture of the day for everyone on `/`, or lens-only? Is a display-only line on the pacer idle card
   inside "changes nothing about the class"? (U050, U051, U053)
9. **Trainer semantics** — replace the consecutive-day streak with "N of the last 7 · M this month"
   (U044)? Should free practice start a card's review clock (U039)? Is Sanskrit part of "knowing the
   sequence" (U094)? May in-class recall advance a `next:` card only when it is already due (U040)?
10. **Forgetting curve** — BKT decay authoritative (derive due dates, retire SM-2) or the SM-2 ladder
    (lengthen the base half-life until decayed P at a due date ≥ 0.85)? Is a self-graded "Got it" worth
    what it is today — two taps take a name to 97 %? (E035, E037)
11. **Practice file** — backup (import replaces, one confirm) or sync (import merges; changes what Erase
    means)? (E010, E017)
12. **Studio-variant reorder** — will you ever ship a different order to the same device? Yes → key
    `tr:`/`pos:` by pose id + a sequence fingerprint (with E005). No → pin the order in a test and delete
    the "reorder here" invitation from `poses/index.ts`, README, CLAUDE.md. (E033)
13. **Voice download** — unconditional 6.7 MB on the first visit to any page, or first `/pace` visit /
    install / non-metered only, with a visible progress line? (E023, U018)
14. **Copy rules** — chakra layer: one framing sentence per surface with natural prose, or per-sentence
    hedging (U068)? Dialogue stock images ("747", "lamp post", "two panes of glass"…): allowed images,
    sentences banned — or zero drift (U069)?
15. **Classical layer** — do you own a copy of *Light on Yoga* to check book-level claims against, or
    downgrade every such sentence to "Iyengar-method teachers" (U073, E048)? May `asana: null` notes
    carry a `reference` (E028)? IAST or plain in rendered text (U064)? Go deeper collapsed on phones (U071)?
16. **Public repo** — licence: (a) explicit all-rights-reserved line, (b) PolyForm Noncommercial code +
    CC BY-NC-SA content, (c) MIT code + CC BY-NC-SA content — and are the Piper clips carved out as
    non-commercial or is `VOICE_NAME` swapped first (E045)? Contributions: issues only / content PRs under
    the audit / open (E046)? Keep the `bikram` repo + host slug with a nominative-use sentence, or rename
    to `26-and-2` (E064)?
17. **Install** — nudge installation (one-time iOS line + silent `persist()`), or keep "offline once
    visited" a README promise? Portrait lock intentional? Title-bar colour ember or page background?
    (U048, E055)
18. **Which phone runs the class** — Android (battery line possible) or iPhone (never)? Decides how much
    of the shakedown sheet stays manual. (E041, E011)
19. **Beginners and bodies** — where does a healthy beginner who cannot reach the foot look: the classical
    first stage lifted to the top, an authored `startHere` line, or inside Go deeper (U075)? Is a
    cross-class "Take care" Explorer lens inside your no-medical-advice line (U077)?
20. **Rotation** — is "floor postures breathe first" meant to survive the daily rotation (pin the breath
    line), or does rotation win (then fix the comment and CLAUDE.md)? (E030)

### 0.5 Standing facts learned this session (Windows checkout)

- Primary dev machine is now **Windows 11**: `C:\Users\rober\downloads\projects\bikram`. `npm install`
  done; `npm test` 88/88; `npx tsc -b` clean. **`piper` is not on PATH** here; Python is 3.13 with a
  cp1252 locale (`PYTHONUTF8=1` is the workaround until E006). `npx oxlint` prints nothing with the repo
  config (see §0.1 #20). `package-lock.json` drifts (libc fields) under this npm — pin `engines`, use
  `npm ci`.
- `npm audit`: `nanoid <3.3.18` (high) is **dev-only** via `vite → postcss`; zero runtime exposure.
- Phone-width screenshots: desktop Chrome `--window-size` clamps to ~500 px; use `playwright-core` with
  an `isMobile` context (a reader did, from the scratchpad, driving Edge).
- The live site serves `/assets/*` and `/voice/*.ogg` with `Cache-Control: max-age=0` (E056).
- Per E042: this public file carries a home-directory path, a `/tmp` path, a private sibling repo and a
  Railway stack — move per-machine facts to a gitignored `CONTINUATION.local.md` next time it is edited.
- The "pool padded to ≥4" leftover in §-2.3 is a no-op: every MC card already has exactly four options.
  The `prev:` cards and `series.ts` leftovers are real (U031, E049).

### 0.6 Candidate index (title only; full paragraph, sources and files in `docs/audit-2026-09-03/candidates.md`)

- U001 [decision/M/impact 5] Decide the class the pacer promises: 64 minutes of postures or the 90-minute studio hour (D)
- U002 [fix/M/impact 5] Spine series rests face-down: delete the phantom sit-ups, split Locust's second set, add body orientation (D)
- U003 [decision/M/impact 4] Kapalbhati that counts to sixty, and a second set that is honestly faster or honestly not (D)
- U004 [fix/M/impact 5] An honest rehearsal debrief: only hand-offs the clock delivered, an explicit claim, and a miss marked in the moment (D)
- U005 [fix/S/impact 4] 'End class' records the partial class, touches the practice day, debriefs, and actually stops the phone
- U006 [feature/M/impact 4] A shorter home class on purpose: 'Until' plus Standing / Floor / Whole presets
- U007 [fix/M/impact 4] One pause: silent, screen kept awake, the phone actually paused, and a count-in on Resume
- U008 [decision/M/impact 4] Decide what a frozen clock means from the mat: catch up for short gaps, pause explicitly for long ones (D)
- U009 [feature/L/impact 5] Pocket class: run the class through the media channel so the screen can be off and the lock screen shows the posture (D)
- U010 [decision/M/impact 4] Begin class opens class mode directly; the running card, the Fullscreen pill and the nav-kills-class trap go (D)
- U011 [feature/M/impact 4] Sweat-proof class mode: 44 px targets, Pause as the whole countdown, a touch lock, long-press to skip or leave
- U012 [feature/L/impact 4] Class mode readable from the back of the mat: glance layout, big side letter, seconds under a minute, warn pulse, bright / dim / OLED variants
- U013 [feature/M/impact 4] Captions for the spoken class, and a Teacher preset: voice off, ticks on, the line shown with a lead
- U014 [fix/S/impact 3] Rehearsal leaks: the segment label names the posture, Preview voice announces it, and posture 1 gets four dead counts
- U015 [feature/S/impact 4] A tone vocabulary at segment boundaries so 'other side', 'second set' and 'savasana' survive noise and a dead voice
- U016 [feature/S/impact 3] Ticks as their own level — off, soft, full — independent of the voice
- U017 [feature/M/impact 4] Pre-flight under Begin class: hear the real volume, see the voice is cached and the screen will stay on, plus the phone's own warnings in the room
- U018 [feature/M/impact 4] Studio-voice download as a visible, consented step on /pace — never a silent 6.7 MB on the home page
- U019 [feature/S/impact 3] Class health on the done screen: late counts, longest stall, backup-voice lines, battery where the API exists — saved in the journal
- U020 [fix/S/impact 3] Put the class first on /pace: class card on top, Tempo & sound folded, options above Begin, ?from= scrolls and stays in sync
- U021 [cut/S/impact 2] Cut hover-only and keyboard-only affordances from touch surfaces
- U022 [fix/S/impact 4] Close the debrief loop: missed hand-offs become drill links, and 'Listen for' names last class's real misses
- U023 [feature/M/impact 3] Defer the debrief: the bell ends the class, a form does not begin it
- U024 [fix/S/impact 4] A settings or cue change mid-Kapalbhati silently drops the segment's bar override
- U025 [fix/S/impact 3] Cue compiler fixes a practitioner hears: one line in the long savasana, the breath line survives rotation, no later-part step in the first side
- U026 [fix/S/impact 3] Survive a phone call and the silent switch: iOS playback session, primed speech synthesis, interrupted clips treated as finished
- U027 [feature/S/impact 3] Keep Bluetooth awake through rests and compensate visuals for headphone latency
- U028 [feature/M/impact 5] Reveal-and-self-grade 'next' cards: production before recognition, scaffolded by band
- U029 [fix/M/impact 4] Chain mode re-approaches a missed hand-off with a run-up instead of waiting for the lap to end
- U030 [feature/S/impact 4] Walk an arc: chain mode with a start and a stop, and 'All caught up' offers the recitation instead of a wall
- U031 [feature/M/impact 3] Recite backward: prev: cards and a reverse chain walk
- U032 [fix/S/impact 4] New cards always show their hook, and Review-mode hand-off misses show the sequence note
- U033 [content/S/impact 3] Read the thread: sequenceNotes where the hand-off is shown, and as one narrative on the Timeline
- U034 [feature/S/impact 3] Position cards in both directions: 'What number is Eagle?'
- U035 [feature/L/impact 3] Recite all 26: serial reconstruction from a chip bank (D)
- U036 [cut/S/impact 3] Cut the answer streak, the praise ladder and the 'best streak' flame; keep 'N in a row' only in the chain walk
- U037 [feature/S/impact 3] Show the in-class recall trend — the app's most honest number
- U038 [fix/S/impact 4] Show the 25 hand-offs, not only the 26 postures: dashes in the landing strip and band-tinted rail nodes on the class map
- U039 [decision/S/impact 2] Decide whether free practice starts each card's review clock (D)
- U040 [decision/S/impact 3] Let in-class recall advance a card's schedule, but only through the existing due gate (D)
- U041 [fix/M/impact 4] 'Faded' is not 'not yet practiced': an honest band word, a welcome-back card, and a floor for leaves drilled to the cap (D)
- U042 [feature/M/impact 5] 'Practiced in a studio today': a practice day and a journal line, never evidence
- U043 [feature/M/impact 4] The practice record: month rows, a plain class list and a readable text export at /pace/record — no fifth tab
- U044 [decision/S/impact 3] Retire the consecutive-day streak for 'N of the last 7 days · M this month', and fix its DST miscount either way (D)
- U045 [fix/S/impact 3] Two named erasures, a 'Your data' block, and a Reset that a debrief-only store can reach
- U046 [feature/M/impact 4] Back up and restore the practice as a shared file (and later a QR) — no server (D)
- U047 [fix/S/impact 2] Tell the learner when progress is not being saved
- U048 [feature/S/impact 3] Ask the browser to keep the data, and an Install hint that appears only where it can work (D)
- U049 [feature/S/impact 4] First-visit doors under the hero, shown only until there is evidence, and a hero sentence that agrees with its own pill
- U050 [feature/M/impact 4] A 'today' strip on the home page that answers 'what does today ask of me?' — and decide where the posture of the day belongs (D)
- U051 [decision/M/impact 3] Decide the Moon lens's fate: keep it whole, shrink it to the calendar half, or delete it (D)
- U052 [fix/S/impact 3] Sky copy that keeps the layer's own contract: 26 days not a lunar month, no fortnight prediction, 'balsamic' dated, Rabbit agrees with its page, hemisphere named
- U053 [cut/S/impact 2] Cut the zodiac line from /today: signs, degree, the lunar-day count and the Moon Chorus sentence (D)
- U054 [fix/S/impact 2] Evaluate 'Tonight's moon' at a fixed local evening hour so the card cannot flip between a morning and an evening class
- U055 [feature/S/impact 3] After the bell: one line of reflection the journal keeps
- U056 [feature/M/impact 4] Recite the order in three minutes: a names-only spoken rehearsal
- U057 [feature/M/impact 4] 'Read the class': the compiled cue track as a timestamped script page
- U058 [feature/M/impact 3] A compact 'recite' view of the Timeline, a print stylesheet, and a one-page class sheet
- U059 [feature/S/impact 3] The class clock wherever a teacher looks: start times on the Start-from options, Timeline rows, the posture header, and elapsed time in class mode
- U060 [content/M/impact 4] Let the chime mean 'move', not 'hold': a transition segment before each posture's clock starts (D)
- U061 [cut/M/impact 4] One source of truth for class structure: derive sets and the timing pill from segments, add the counted hold, retire Pose.timing and Pose.sets
- U062 [decision/M/impact 3] Count holds in breaths, not seconds — display first, then decide about the data (D)
- U063 [feature/M/impact 4] Sanskrit you can hear: 26 recorded name clips shared by the pacer, the flashcards and the posture page
- U064 [fix/M/impact 3] One pronunciation scheme with a printed key, and IAST as a field rather than a habit (D)
- U065 [fix/S/impact 3] Sit-Up's Sanskrit field answers its own flashcard
- U066 [fix/M/impact 4] Fence every physiological claim in every field with a three-tier vocabulary, and fix the lines that are false
- U067 [fix/S/impact 3] Cut the arithmetic that pretends to be fact: Eagle's twelve-of-fourteen joints and Wind-Removing's digestion order
- U068 [decision/S/impact 3] Chakra copy: hedge once by frame, not in every sentence (D)
- U069 [decision/S/impact 2] Keep the room's images, ban the room's sentences — and say so in writing (D)
- U070 [fix/S/impact 2] Let Savasana have no muscle work, and give triceps its postures or drop the lens (D)
- U071 [content/M/impact 3] Go deeper on the page: findable from the header, folded behind a one-line gist, phone-proof, with the grade explained and the lede honest (D)
- U072 [fix/S/impact 3] Classical rendering bugs on the ship path: 'plates plate 92', 'Classical counterpart' above 'the same name', page numbers, one grade for a compound (D)
- U073 [content/M/impact 3] Fix the known facts in the classical notes and hand the eleven audits a punch list, with book-level claims downgraded unless checked against a copy (D)
- U074 [feature/M/impact 2] Link the before/beyond ladder chips to the sequence's own postures
- U075 [decision/S/impact 3] Where does a healthy beginner look? A 'start here' door outside Go deeper (D)
- U076 [fix/S/impact 3] Take care as who / what-instead, counted in the header, and reachable from the top
- U077 [feature/M/impact 4] A 'Take care' reading across the whole class, per condition (D)
- U078 [fix/S/impact 4] The nav clips the Pace tab on phones narrower than ~386 px
- U079 [fix/S/impact 3] A NotFound route, and not-found copy and '26' that come from the data
- U080 [feature/M/impact 3] Per-route titles, real link previews per posture, and a Share button
- U081 [fix/S/impact 3] Contrast pass: --text-faint, chakra hex as text, --stretches, class-mode faint text, and honour prefers-contrast: more
- U082 [fix/S/impact 3] Class map for ears and colour-blind eyes: real sequence numbers, list semantics, a legend, glyphs on the pills, tappable chakra dots
- U083 [fix/M/impact 3] Let the browser's text-size setting reach the app: px to rem
- U084 [fix/M/impact 2] Landmark pass: class mode as a native <dialog>, nothing laid out under it, one <main>, named navs, a skip link
- U085 [fix/S/impact 2] Live regions: say only what the voice does not
- U086 [fix/S/impact 2] Explorer muscle lens: chips are the single control with radio semantics, the body map is the picture, and taps stop pushing history
- U087 [fix/S/impact 3] One vocabulary across screens: hand-off, class mode, item N of 26, and end-of-class lines that agree and name the savasana
- U088 [fix/S/impact 3] Trainer session ergonomics on a phone: scroll to each new card, Enter continues, the due badge refreshes, misses named at the end
- U089 [fix/S/impact 2] Drill navigation that keeps its word: the nav leaves a drill instead of relabelling it, and exits return to where the drill came from
- U090 [fix/M/impact 2] Knowledge map on a phone: open on the root, scroll the selected node into view, sync focus with the detail card (D)
- U091 [cut/S/impact 3] Take the root and arc products off the map's headline positions; show 'n of 51 solid' and the chain probability instead
- U092 [content/S/impact 3] Say 'estimate' to the learner until the surface has checked it, and stop restating engine numbers in copy
- U093 [feature/M/impact 3] A calibration card on the knowledge map that says 'not enough answers to check yet' until it can say anything (D)
- U094 [decision/S/impact 3] Decide whether Sanskrit is part of 'knowing the sequence' (D)
- U095 [feature/M/impact 3] Checkpoint the running class so a killed tab or a reload does not erase it
- U096 [feature/L/impact 2] Rehearse the instructions, not just the names: a self-test lead and a walk-in debrief
- U097 [content/S/impact 3] A footer and colophon: who made it, what leaves the phone (nothing), the voice, the sources, the build, and an idle 'update ready' note (D)
- E001 [fix/S/impact 4] Precache the app shell at install so offline is true on the first visit
- E002 [fix/M/impact 4] Serve 206 Partial Content from the voice cache so Safari can play cached clips
- E003 [fix/S/impact 4] Pin the metronome lifecycle: ref-held beat handler, split settings effect, override-aware update
- E004 [infra/L/impact 4] Extract the class run into a pure reducer with an effects list, and make the reader-found bugs its first tests
- E005 [fix/M/impact 4] One versioned-store helper for the four localStorage keys: refuse newer blobs, quarantine failures, report failed saves
- E006 [cut/S/impact 4] Retire scripts/gen-classical-index.py: a hand-kept index plus a vitest invariant that guards the hold-back
- E007 [infra/M/impact 4] One documented path for changing a word: npm entry points and the three content edit loops in CLAUDE.md
- E008 [infra/M/impact 4] An answer log in its own key so a year of use can be scored offline
- E009 [fix/S/impact 4] Split pLearn by outcome so a miss lowers P below the prior and the weak rankings stop inverting
- E010 [feature/M/impact 4] A practice file: export and import the four blobs (plus the answer log) without a server (D)
- E011 [infra/S/impact 4] The phone-shakedown recording sheet: what to write down per class, and which numbers only a human can get
- E012 [infra/M/impact 4] Simulated learners in vitest: pin what the headline means and what it does not
- E013 [fix/S/impact 3] Make generate-voice.mjs run on this machine, put the voice parameters in the clip hash, and pin the manifest to the files on disk
- E014 [infra/S/impact 3] Make npm run lint and CI mean something: a real oxlint config, a GitHub Actions gate, an engine pin, a clean lockfile
- E015 [fix/M/impact 3] Engine test-debt sprint: explicit relearn state, successor-aware adjacency, spaced-cap agreement, the uncovered branches
- E016 [fix/S/impact 3] Clock hygiene: stamps never run backwards, future stamps are clamped, one day-arithmetic owner (DST-safe streak)
- E017 [fix/M/impact 3] Merge on save: evidence counts only go up, so two tabs cannot erase each other
- E018 [infra/M/impact 3] Characterization tests for metronome, clips, voice and wake lock with fakes; tie buildPoseTrack to segmentAtBeat; fix the frozen-clock docs
- E019 [fix/S/impact 3] Clip, speech and wake-lock hygiene: detach before the token check, survive an interruption, fix the sentinel race, End class stops the phone
- E020 [fix/S/impact 3] Ask iOS for a 'playback' audio session and prime speech synthesis inside the start gesture
- E021 [fix/S/impact 3] Service worker: scope cache-first to hashed paths, prune stale assets and clips, never delete a cache newer than yourself, report what the voice cache holds
- E022 [fix/S/impact 3] Race navigation against a short timer and guard what gets cached as the shell
- E023 [fix/S/impact 3] Voice precache trigger and etiquette: fire from /pace, gate on saveData/2g, fill in one short burst (D)
- E024 [infra/M/impact 3] Move question building and the weak-first policy into src/trainer/questions.ts with a seeded rng and tests
- E025 [infra/S/impact 3] One data-invariants test file for the content layer, the most-edited surface in the repo
- E026 [infra/S/impact 3] Encode the class conventions a trainee is examined on as segment tests
- E027 [infra/S/impact 3] An honesty fence test over every rendered content string, with the widened sky regex and pinned note order
- E028 [fix/S/impact 3] Classical reference contract: numeric plates, a via field, two references for compounds, and a name-relation normaliser (D)
- E029 [infra/M/impact 2] Split Trainer.tsx and Pacer.tsx only after the logic extractions, and share the pieces that already diverged
- E030 [fix/S/impact 3] Cue-compiler correctness: the walk-in tail bug, breath-first vs rotation, rest-segment-0 walk-ins, and posture 1's rehearsal delay (D)
- E031 [infra/S/impact 4] scripts/calibrate.mjs: score an exported answer log offline, before any surface ships
- E032 [infra/S/impact 3] Build stamp, a class-aware 'update ready' hint, and CalVer tags that feed it
- E033 [decision/M/impact 3] Decide whether a studio-variant reorder is supported; then key by pose id or delete the invitation (D)
- E034 [fix/S/impact 2] Key the access layer by id and add getPoseByOrder
- E035 [decision/M/impact 4] Decide which forgetting curve is authoritative: two models disagree at every due date and the weak filler overrides both (D)
- E036 [decision/S/impact 4] Recall's pGuess 0.05 and the debrief's one-tap default are one parameter set twice (D)
- E037 [decision/S/impact 3] A parameter sheet: one exported MODEL object with a version, two parameter sets instead of four (D)
- E038 [fix/S/impact 3] Ask the browser to persist storage after the first meaningful write (D)
- E039 [feature/M/impact 3] Checkpoint the running class so a killed tab or a reload does not erase it
- E040 [fix/S/impact 3] Fold classes into month totals when the 400 cap trims, and raise the cap
- E041 [feature/S/impact 3] Instrument the class: late counts, longest stall, backup-voice lines and battery on the ClassRecord (D)
- E042 [fix/S/impact 3] Split CONTINUATION_PROMPT.md into a public status file and a gitignored .local diary — without rewriting history
- E043 [content/S/impact 3] README as the stranger's page: the live URL, two phone screenshots, and only numbers a test pins
- E044 [cut/M/impact 3] Make segments required; derive sets and the timing pill from them; delete the segment-less fallback and its orphan clip
- E045 [decision/S/impact 3] Name the legal state: explicit all-rights-reserved, or a code/content licence pair (D)
- E046 [decision/S/impact 2] Decide whether the door is open: issues only, content PRs under the audit, or fully open — and the CONTRIBUTING each answer needs (D)
- E047 [content/S/impact 2] Make '// Sources consulted' a documented shape and credit the index sheet in one place
- E048 [feature/M/impact 3] A book-claim register, tested from the raw note source, so book-level attributions can be verified or downgraded (D)
- E049 [fix/S/impact 2] One arc/series table in the data layer, consumed by graph.ts, Timeline and KnowledgeMap
- E050 [cut/S/impact 2] Delete what nothing calls: scaffold assets, the '~studio' branch, unconsumed barrel exports, hardcoded '26' and posture names
- E051 [infra/S/impact 3] docs/STYLE.md: the editorial standard, plus a term lint over src/data strings
- E052 [fix/M/impact 3] Metronome.pause()/resume(): suspend the AudioContext, release the wake lock, stop the interval while paused
- E053 [feature/S/impact 3] Audio-path hygiene for Bluetooth: a sub-audible keep-alive and output-latency compensation
- E054 [fix/S/impact 2] Nothing lays out under the portal: hide the page while immersed and move both progress bars to transform
- E055 [fix/S/impact 2] Manifest polish: id, shortcuts into practice, aligned colours, and a decision on portrait lock (D)
- E056 [infra/S/impact 2] Immutable cache headers for hashed assets and voice clips in vercel.json
- E057 [cut/S/impact 2] Cut the per-beat optimisation from the roadmap; write the verdict into the metronome header
- E058 [cut/S/impact 2] One reader per document, one home per fact: rename CONTINUATION_PROMPT to STATUS and cut the commit-by-commit narrative
- E059 [cut/S/impact 2] Write the product's 'no' list into the parked section
- E060 [infra/S/impact 2] A schema-compatibility fixture set: every blob a past build could have written must still load
- E061 [fix/S/impact 2] Sky lens engineering hygiene: fixed-hour phase, real tests, honest provenance, no hardcoded fallback (D)
- E062 [fix/S/impact 3] Tighten the class-length test and derive every 'whole class' number from classTotalSeconds once the length is chosen
- E063 [infra/S/impact 1] The GitHub surface: topics, a social card, a real package name
- E064 [decision/S/impact 1] One name on the door: keep `bikram` as the repo/host slug with a nominative-use sentence, or rename to 26-and-2 (D)
- E065 [cut/S/impact 1] Retire the v1 store migration path
- E066 [infra/M/impact 2] Route-level code splitting, only together with install-time precache

---

## ★ RESOLVED 2026-09-04 — the 11 classical notes were audited and shipped in `de73cc1` (see ✔ at the top)

Kept for the procedure, which still applies to any future or re-edited note. All 26 notes are live; the
hold-back list is now `pendingClassicalAudit` in `src/data/classical/index.ts` (empty), and
`src/data/classical/index.test.ts` fails if any authored `NN-*.ts` is neither indexed nor held back.

**The audit procedure** (one agent per file, run in parallel; the workflow script that did the first
fifteen is at `~/.claude/projects/-home-mrcolson-repos-yoga/<session>/workflows/scripts/classical-notes-sliced.js`,
whose `args: {from, to}` slices the posture list — but a plain Agent per file works just as well):

1. **Originality** — fetch every URL in the file's `// Sources consulted` block; no sentence or
   distinctive 8+-word phrase may be shared with it. Wikipedia is CC BY-SA (facts only, never
   sentences); *Light on Yoga* is in copyright (cite plates, never quote technique/effects prose).
2. **Facts** — etymology roots; the asana mapping and any name-clash explanation; `reference`
   (plates + 1–60 grade) ONLY if a citable source really gives those numbers, else delete the field.
   The plate/grade index that proved most reliable: the published "Asana Indexes for Light on Yoga"
   Google Sheet (linked from Eyal Shifroni's LoY index post), cross-checked against the Iyengar
   association syllabi (UK / Norway / Canada PDFs — all three are cited in existing files).
3. **Honesty & voice** — lineage claims hedged ("in the Iyengar method", "Iyengar-method teachers"),
   never attributed to the book unless the book says it; no medical claims; second-person calm
   teacher; **neither lineage corrects the other**.
4. **Consistency** — read `src/data/poses/NN-<id>.ts` and contradict nothing in its setup, cues, or
   "Take care" list (the classic trap: telling a Fixed Firm practitioner to sit all the way down when
   the pose data says stay on the elbows).
5. **Shape** — sizes per `ClassicalNote` in `src/data/types.ts`; sole import
   `import type { ClassicalNote } from '../types'`; export name matches; `npx tsc -b` passes.

Then move the id out of `pendingClassicalAudit`, add its import and map entry in
`src/data/classical/index.ts`, `npx tsc -b && npm test`, commit, push (Vercel deploys on push).
Step 3 gained a sixth check from the 2026-09-04 review: **no audit narration in rendered prose** — "the
sources confirm", "the independent source", "the pose page's instruction" belong in the comment block.


**What the first fifteen audits actually caught** (evidence this pass is not ceremonial): a
Sitali/Sitkari fact reversal (the mouth is used on the classical *inhale*, not the exhale); a stray
medical caution about blood pressure that violated the no-medical-claims rule; a false
"Iyengar doesn't pull / 26 & 2 pulls" contrast in Hands to Feet (the classical final stage pulls
too — the real difference is the grip); an over-claimed Malasana II description; a Vatayanasana hold
described as "longer" when it is shorter; several technique claims attributed to *Light on Yoga*
that actually come from Iyengar-method teachers; and one internally contradictory etymology.

---

## -1. 2026-08-28 OVERNIGHT: the deepening roadmap, built (`64fdd4e` → `e7f10d3`, all live)

The user said "go ahead, keep going until completion… I'm very tired and need to sleep", then slept.
Nine commits, all pushed and deployed. The Fable 5 credit limit ran out during the final content
audits (hence the eleven above); the session continued on Opus 5.

### `64fdd4e` Honest trainer sessions
- `recordAnswer` walked the SM-2 ladder on **every** answer, so a free-practice blitz pushed cards to
  week-long intervals in one afternoon. Now `schedulesOn` gates it: only new, due, or relearn cards
  advance; a miss always lapses. Every answer is still BKT evidence.
- Forgetting half-life stretches only on **spaced** correct answers (`KcState.spaced`, ≥6 h apart;
  the first answer on a leaf never counts — it might be a lucky guess). `applyEvidence` now updates
  the **decayed** posterior, so one answer after a long gap can't restore month-old certainty.
- Queues pass through `interleave` (no adjacent cards about the same posture); misses re-enter the
  live session `RELEARN_GAP` cards later via `relearnSlot`, nudged past sibling cards that would
  display the answer.
- Headline is `meanLeafP` (average over 51 leaves), not the root noisy-AND — which read `<1%` while
  every dot was solid. The map still shows the root, captioned "all 51 pieces at once".

### `14627e7` Phone-proofing (the shakedown, done as code)
- `clips.ts` reuses **one** `<audio>` element primed inside the start gesture (`unlockClips`) —
  mobile Safari refuses timer-created elements — and reports load/play failures through `fallback`
  so `sayCue` speaks the line via TTS instead of going silent.
- `metronome.ts` resumes a suspended context on `visibilitychange`/`statechange`; beats missed during
  a stall arrive flagged `late` (clock catches up silently, one orientation cue after).
- `sw.js` keeps the studio voice in its own cache (`yoga-voice-v1`), filled in batches from a clip
  list `main.tsx` posts after registration. **Verified in a preview build: 383 clips cached, offline
  clip fetch returns 200 `audio/ogg`.**

### `0de43b5` Speak the whole posture · rehearsal mode
- The coaching rotation restarted at the same lines every class and skipped segment 0, so a third of
  the authored teaching played forever and the rest never. Now rotated by day index, coaching in the
  room the walk-in leaves, over-long walk-ins trimmed **from the middle** (the last step always
  speaks), floor postures breathe first.
- **Rehearsal**: `announceDelayBeats` lands the announce 4 counts after the hand-off chime; every
  identity surface (figure, name, Sanskrit, timing, "Next:", class-mode header, dialog label) is
  withheld until then. The post-class debrief saves unrecalled hand-offs as `recall` evidence through
  BKT **only** — never the SRS schedule.

### `56510b3` Review fixes (from an adversarial review of `64fdd4e`)
Interleave repair re-scans until nothing moves and only displaces the queue head as a last resort;
a second miss while relearning restarts the step without a second lapse+ease fine (and a miss on
first exposure books no lapse at all); grandfathered `spaced` counts capped; the session-end note
speaks only of misses never recovered; an empty store shows `—`, not the 10% prior.

### `0dc2a7a` Practice journal · chained recall · doors into practice
- `src/trainer/journal.ts` (`yoga-journal-v1`): every paced class (span, length, tempo, rehearsed,
  debrief counts) plus the days anything was practiced. Pacer's idle card says when you last
  practiced, the streak, and **the two shakiest hand-offs to listen for**.
- PoseDetail gained a practice row: memory/hand-off bands + links to `/train?drill=id:<pose>`,
  `/train?drill=tr:<order>`, `/pace?from=<order>`.
- "What comes next" now **chains** — each answer becomes the next prompt, so a run of right answers
  is the class recited in order; a miss shows `sequenceNote` (why the posture follows) instead of a
  name mnemonic.

### `558c4fa` Honest class structure
`PoseSegment.pacer` lets a breathing segment override the metronome's **count** (Kapalbhati pulses
at 1, Pranayama holds 6) but never the tempo, so the class clock is unchanged. After posture 26 the
class no longer dumps you onto a bright page with the metronome ticking: one spoken `CLOSING_LINE`
opens a **quiet two-minute final savasana** (ticks silenced, class mode stays up), then the bell,
then the metronome stops and the journal records the class. 383 clips (~6.5 MB).

### `fc09817` Moon days — the opt-in lens (`/today`, off by default)
`src/sky/ephemeris.ts` is a dependency-free Meeus low-precision Sun/Moon — **the same formula
`../aim-dojo` uses**, with parity pinned in tests along with the January 2000 lunations, the 2024
eclipse, and the March equinox. Hand-written notes per moon phase and per planetary day name 2–4
postures and one thing to notice; a posture of the day walks the sequence so each gets its day once
per lunar month. A test forbids effect claims (`cures|heals|detox|…`). Changes nothing about the
class, the trainer, or any posture's cautions.
> This was the *only* survivor of the astrology assessment. The chart-driven engine was rejected:
> aim-dojo's interpretations are psychological with **zero** body content, its natal data comes from
> a third repo (`~/repos/sidereal`, FastAPI + pyswisseph on Railway), its zodiac is 13-sign
> true-sidereal under a CC BY-NC-ND boundary table, and a cross-origin natal handoff would leak the
> birth date. See `/tmp/.../tasks/wq6eqmxr1.output` if it ever comes up again.

### `7d7f18f` + `e7f10d3` The classical ("Go deeper") layer
Contract, view section, index generator, and 26 notes — 15 rendering, 11 held back at the time; all 26
live since `de73cc1` (2026-09-04), the generator retired.

---

## -2. What is NOT done (ranked, from the 16-agent roadmap; full text in `/tmp/.../tasks/w55h4hlmi.output`)

1. ~~**The eleven audits**~~ — done in `de73cc1` (2026-09-04); the review punch list is at the top.
2. **A real phone shakedown.** Everything above is code-verified and screenshot-verified in headless
   Chrome; nobody has run a class on an actual phone. Needs the user: audio unlock from the start
   button, screen locked through two postures (does the stall catch-up behave?), PWA install, clip
   loading on cellular, wake lock, and whether the rehearsal 4-count silence feels like practice or
   dead air.
3. **Roadmap #6 leftovers**: `prev:` cards (the mirror of `next:`), a `src/data/series.ts` layer to
   replace the duplicated ARCS tables, and the "pool padded to ≥4 so pGuess stays ≤0.25" refinement.
4. **Parked deliberately** (do not resurrect without a reason): Explorer `?lens=spine`;
   `shape:<pose>` MC cards; latency-based auto-"hard"; spoken contraindication modifications;
   a 1–5 depth scalar (drifts toward flexibility claims); typed free recall (wrong input on a hot
   phone); the astrology chart engine.

## -3. Standing facts worth not rediscovering

- **Licence**: no `LICENSE` file — deliberate, the user's call. Voice clips come from Piper
  `en_US-lessac-medium`, whose training data (Blizzard 2013 Lessac) is a **research/non-commercial**
  licence: fine for a free app, swap `VOICE_NAME` in `scripts/generate-voice.mjs` before any
  commercial use.
- **Regenerate the voice** after editing any spoken text: `node scripts/generate-voice.mjs`
  (needs `piper` on PATH — it is, at `~/.local/bin/piper` — and ffmpeg, resolved via
  `imageio-ffmpeg`). `clips.test.ts` fails until you do.
- **Screenshots**: no playwright in the repo; use the scratchpad pattern — `playwright-core` driving
  `/usr/bin/google-chrome`. This Chrome returns an object from `window.scrollTo()`, so a
  single-expression arrow `useEffect` that returns it crashes React ("destroy is not a function") —
  always brace the effect body.
- **The Eagle figure is approved** by the user ("looks good"); no figure work pending.
- Deploy target is the Vercel project `bikram` (`roberts-projects-19fe2013`); `vercel.json` carries
  the SPA rewrite.
