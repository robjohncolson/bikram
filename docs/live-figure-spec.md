# Spec — the live three.js figure (2026-09-29)

Replace the sprite-sheet figures with a **live three.js rig**, as a SECOND renderer
behind the same `PoseMotion` interface. Sprites stay as the fallback and as the
default on posture pages until the rig is proven. Nothing about the class (grid,
cues, plan timing) changes; only how the figure is DRAWN.

Read `CLAUDE.md` first (architecture and conventions — they bind), then
`scripts/blender/render_motion.py` (the rig, `apply_stage`, `aim_bone`,
`inbetween`, `steered_midpoints`, the camera), `scripts/blender/postures/README.md`
(the authoring contract), `scripts/blender/postures/half_moon.py`,
`scripts/blender/bridges/_canon.py`, `src/pacer/figure.ts`,
`src/components/PoseMotion.tsx`, `src/views/PacerClassMode.tsx` (the
`useClassFigureFrame` hook and the `<PoseMotion>` call), `src/data/types.ts`
(`PoseMotion`, `MotionStage`, `Position`).

Ground rules
- `npm test` (162 tests / 17 files) stays green throughout; `npx tsc -b`,
  `npm run build` and `npm run lint` clean. Every existing test keeps passing
  unchanged in meaning (you may extend fixtures, never weaken assertions).
- Views import only from `src/data/index.ts`, `src/pacer/index.ts`, and the
  new `src/rig/index.ts`. `verbatimModuleSyntax`, `noUnusedLocals`,
  `erasableSyntaxOnly` are on (no enums, `import type`).
- Colours only via the CSS custom properties in `src/styles/global.css`
  (`currentColor`, `--stretches`, `--ember`); both themes.
- Do NOT write regexes through Bash heredocs (backslashes get mangled); write
  scripts with the Write tool and run them.
- Do NOT run `npm run motion` (no sprite re-render is needed for this task).
- Blender is at `C:/Tools/blender-5.2.1-windows-x64/blender.exe`; use it ONLY
  for the fixture export in §2 (`blender -b --python <script> -- …`).
- Windows: no colons in file names (`bridge:supine-prone` → `bridge.supine-prone`).

## 1. Data export — `scripts/blender/export_rig.py` (plain Python, no bpy)

A script importable and runnable with the system Python 3.13 (NOT Blender):
it imports every module in `scripts/blender/postures/*.py` and
`scripts/blender/bridges/*.py` (skipping `_*.py`, same `module_id`/`file_stem`
rules as `render_motion.py` — copy those two functions, don't import
`render_motion`, which imports bpy) and writes one JSON per module to
`src/data/rig/<file_stem>.json`, plus `src/data/rig/skeleton.json`.

`<file_stem>.json`:
```json
{
  "id": "half-moon",
  "view": "front",
  "frame": { "center_z": 1.05, "scale": 2.5 },
  "position": { "start": "standing", "end": "standing" },
  "transition": 7,
  "stages": [
    {
      "label": "Right side",
      "hold": 8,
      "view": "side",                       // only when the stage has one
      "frame": { "center_z": 0.35, "scale": 2.4 },   // only when the stage has one
      "pose": { "pelvis.location": [0.07, 0, 0], "pelvis": [-0.08, 0, 1],
                "spine.upper": { "dir": [0, 0, 1], "roll": -35 }, "...": "..." },
      "guides": [ { "from": [0,0,0], "to": [0,0,2.05] },
                  { "plane": "y", "at": -0.16, "z": [0, 2.05], "w": 1.5 } ],
      "ghost": { "pelvis": [0, 0, 1], "...": "..." }
    }
  ]
}
```
- Bone entries are exactly as authored: a 3-vector, or `{dir, roll}`; numbers
  rounded to 6 decimals; keys in the module's own order. Tuples → arrays.
  Omit `view`/`frame`/`guides`/`ghost` keys that a stage does not have.
- `skeleton.json`: `J`, `BONES` (as `[name, head, tail, parent|null]`), `RADIUS`,
  `SKIN_EXTRA`, `VERTEX_BONE`, `VIEWS`, `BIG_TURN_DEG`, `FPS`. Copy the literal
  tables from `render_motion.py` into the export script (a comment saying so);
  the TS test in §3 pins the TS constants to this file, so drift shows up.
- Validate `position` like `posture_position` does; fail loudly.
- `npm run rig:export` runs it (`python scripts/blender/export_rig.py`).
  Commit the generated JSON. Header the folder with `src/data/rig/README.md`
  (three lines: generated, by what, rerun when).

Add a vitest `src/data/rig/rig-data.test.ts`: every id in `motionManifest`
has a JSON file whose stage labels equal the manifest's stage labels in order
(the sprite and the rig describe the same sequence); every bone key in every
stage pose is a known bone or `pelvis.location`; every guide is a well-formed
line or plane; every `position` is a valid `Position`.

## 2. Parity fixtures — `scripts/blender/export_fixtures.py` (runs INSIDE Blender)

Ground truth for the TS port. Run once:
`blender -b --python scripts/blender/export_fixtures.py` writes
`src/rig/fixtures/<case>.json` with, for each case, every bone's world
HEAD and TAIL position (from `pb.matrix`), rounded to 5 decimals.
Reuse `render_motion.py`'s own functions (import it by path — it is a Blender
script; `build_armature`, `apply_stage`, `rest_directions`, `capture_pose`,
`steered_midpoints`, `inbetween`, `smoothstep`).

Cases (at least):
- `half-moon` stages `Stand`, `Arms up`, `Right side` (pelvis.location + bend),
  `Hands to feet` (a fold);
- `spine-twisting` its right-side stage (rolls + riding clavicles);
- `savasana` its flat stage (pelvis.location, body horizontal);
- `cobra` its lift stage (prone); `camel` its kneel stage;
- the half-moon `RIGHT` **ghost** (`ghost_pose` overlay);
- in-betweens: half-moon `Arms up` → `Right side` at s = 0.25, 0.5, 0.75
  (`smoothstep` applied as `build_timeline` does), and `Stand` → `Arms up`
  at 0.5 (a >150° arm turn — exercises the steered midpoint).
Commit the fixtures. Document the command in `src/rig/README.md`.

## 3. The rig in TypeScript — `src/rig/` (pure, no three, unit-tested)

`skeleton.ts` — `J`, `BONES`, `PARENT`, `RADIUS`, `SKIN_EXTRA`, `VERTEX_BONE`,
`VIEWS`, `BIG_TURN_DEG`, `restDirections()`. Test: deep-equals `skeleton.json`.

`math.ts` — minimal vec3/quat (no dependency): normalize, dot, cross, angle,
`rotationDifference(a, b)` (shortest arc, Blender's `rotation_difference`
semantics — handle the antiparallel case the way mathutils does: a 180° turn
about any axis perpendicular to `a`), `axisAngle`, `mul`, `conj`, `rotate`,
`slerp`, `compatible(q, ref)` (`-q` when `dot < 0`), `smoothstep`.

`pose.ts` — the posing model. Represent a posed rig as
`RigPose = { bones: Record<BoneName, { q: Quat }>, pelvisLocation: Vec3 }`
where `q` is the bone's **world-space delta rotation** from rest (rest = identity).
Forward kinematics (`solve(pose): Record<BoneName, {head: Vec3, tail: Vec3, q: Quat}>`):
`head(b) = head(parent) + rotate(q(parent), J[head_b] − J[head_parent])`
(the pelvis: `J.pelvis + pelvisLocation`), `tail(b) = head(b) + rotate(q(b), J[tail_b] − J[head_b])`.
This reproduces Blender's un-connected child bones exactly (a child's head
rides its parent's pose matrix).

`applyStage(stage): RigPose` — port `apply_stage` + `aim_bone`, in `BONES`
order, parents first:
1. start every bone at `q = q(parent)` (a bone inherits its parent's world
   rotation before it is aimed — this is what `pb.matrix` gives `aim_bone`);
   pelvis starts at identity;
2. for a listed bone (`dir` or `{dir, roll}`): `current = rotate(q, restDir)`,
   `d = rotationDifference(current, target)`, `q = d ∘ q`; then if roll:
   `q = axisAngle(target, rad(roll)) ∘ q`, and mark the bone `riding`;
3. for an OMITTED bone whose parent is `riding`: keep `q = q(parent)` and mark
   it riding (it keeps its pose relative to the rolled parent);
4. for any other omitted bone: aim at its REST direction exactly as in 2
   (shortest arc from wherever the parent left it).
`ghostPose(stage)` = `applyStage({...stage.pose, ...stage.ghost})`.

`inbetween.ts` — port `steered_midpoints` + `inbetween` + `midpoint_dir`.
Interpolate **parent-relative** quaternions: `rel(b) = conj(q(parent)) ∘ q(b)`
(the pelvis relative to identity). Blender slerps the bone's LOCAL
`rotation_quaternion`; that differs from `rel` only by a fixed conjugation
with the bone's rest matrix, and slerp commutes with a fixed conjugation, so
the results are identical — say so in a comment. For each bone: make `rel_b`
sign-compatible with `rel_a`; if the bone's WORLD direction turns more than
`BIG_TURN_DEG` between the two poses, compute its steered midpoint: with
every ancestor already at ITS midpoint (parents first, ancestors' midpoints or
their pose-A value when they have none), aim the bone (from its pose-A world
rotation, shortest arc) at `midpointDir(name, dirA, dirB)`, take its `rel`;
then `q = s < 0.5 ? slerp(relA, compat(mid, relA), 2s) : slerp(compat(mid, relB), relB, 2s − 1)`,
else `slerp(relA, relB, s)`; pelvisLocation lerped. Rebuild world `q` from
the rel chain. Export `blend(a: RigPose, b: RigPose, s: number, mids?): RigPose`
and `midpoints(a, b)` (memoisable per stage pair).

`mirror.ts` — `mirrorStage(pose)`: negate x of every dir and of
`pelvis.location`, swap `.L`/`.R` keys, negate every roll. Test: mirroring
half-moon `RIGHT` gives `LEFT` (the module authors both; compare after
`applyStage`, tolerance 1e-6), and mirroring twice is the identity.

`camera.ts` — pure: `cameraAt(view, frame)` → `{azimuth, centerZ, scale}`;
`orbitBetween(a, b, s)` eases the azimuth the SHORT way round and lerps
`centerZ`/`scale` (Blender: bezier ease-in-out; use smoothstep).

`body.ts` — the mannequin's geometry recipe, pure data for §4: for every
`BONES` entry a tube from head radius to tail radius (`RADIUS[key]` by joint
name stem, mean of `(rx, ry)`), joint spheres, and the `SKIN_EXTRA` splits and
spurs (palm on the hand tube, ball and heel on the foot) — output a list of
`{from: Vec3, to: Vec3, r0, r1, bone}` segments for a solved pose so the
three.js layer only builds meshes. Guides: `guideSegments(guides)` → lines
(a plane = its four edges) in world space.

`index.ts` — the barrel. **Parity test** `pose.test.ts`: for every fixture in
§2, `solve(applyStage(stage))` heads/tails match within 1e-4 (held stages)
and the in-between cases within 1e-3 (report the actual max error in the
test name or a comment). Load the stage dicts from `src/data/rig/*.json`.

## 4. The renderer — `src/components/FigureRig.tsx` (+ `FigureRig.css`)

three.js, **lazy-loaded** (`import('three')` inside the component, wrapped in
`React.lazy`/`Suspense` from `PoseMotion`; the sprite cell renders while it
loads). Add `three` and `@types/three` to `package.json`. Verify with
`npm run build` that `three` is a separate chunk NOT in the main bundle.

Look — LINE ART, as close to the Freestyle sheets as practical:
- Ortho camera from `camera.ts` (pivot at `(0,0,centerZ)`, azimuth about +Z,
  camera on the pivot's −Y at distance 10 looking +Y, `ortho` height = `scale`,
  square viewport; Blender's `VIEWS` mapping; side view = face to screen right —
  check against the sprite of the same stage).
- The body as capsule tubes + joint spheres from `body.ts`, smooth-shaded.
- Strokes via a **screen-space edge pass**: render normals + depth to a
  render target, then a full-screen quad shader that marks depth
  discontinuities and normal discontinuities (silhouettes AND the contour
  where an arm crosses the torso), ~1.7 px at a 240 px cell scaled with the
  cell (`LINE_PX / FRAME_PX * size`), round-ish; output = stroke coverage in
  alpha over a transparent clear. Colour: the wrapper's computed `color`
  (read `getComputedStyle` on mount and on `prefers-color-scheme` change;
  never hardcode). Ghost: a second mannequin rendered in its own edge pass
  in `color-mix(in srgb, var(--ember) 55%, transparent)` UNDER the figure;
  guides: thin `LineSegments` (`Line2` if you need width) in `--stretches`
  OVER it, drawn without the edge pass. Read those two tokens the same way.
- Transparent canvas (`alpha: true`, `premultipliedAlpha` correct), DPR capped
  at 2, size = the `size` prop, `powerPreference: 'low-power'`.
- **Render on demand**: only when the pose, camera, breath or size changes;
  a held stage renders once. No rAF loop of its own — the parent drives it.
- WebGL unavailable / context lost / `three` failed to load → report via an
  `onUnavailable` callback and `PoseMotion` falls back to the sprite silently.
- Reduced motion (`prefers-reduced-motion`): no blends — snap to the target
  stage; no breath.

Props (controlled, like the sprite's `frame`):
```ts
interface FigureRigProps {
  data: RigData;                    // the posture's JSON (lazy-loaded by id)
  size: number;
  pose: { from: number; to: number; t: number; sheet?: RigData };  // stage blend; sheet = a bridge's data when one plays
  layers: { guides: boolean; ghost: boolean };
  breath?: { phase: 'inhale' | 'exhale'; progress: number };
  onUnavailable?: () => void;
}
```
The breath moves the CHEST: on inhale ease `spine.upper` and `neck` a few
degrees toward +Y (the chest opens) and lift both clavicles ~4°, proportional
to `breath.progress` (same easing as the sprite's CSS), settling on exhale.
Apply it AFTER the blend, as a small extra rotation, never to the authored data.
Guides show for the stage they belong to plus the nearer half of a blend into
or out of it (`t < 0.5` shows `from`'s guides, else `to`'s — matching
`nearest_stage`); the ghost shows only when `t === 0 || t === 1` on a stage
that has one (a hold), unless `layers.ghost` is off.

## 5. The player — continuous poses in `src/pacer/figure.ts`

Keep every existing export and every existing test's numbers. Add:
- `FrameStep` gains an optional `blend?: { from: number; to: number; start: number }`
  — the stage-to-stage travel a hop step belongs to (`start` = seconds the
  travel began; a hold step has none). Set it in `stagedTimeline`,
  `spokenTimeline` and `bridgeSteps` wherever hop frames are emitted (the
  release frames and the bridge's own frames included: a bridge's frames are
  blends between ITS consecutive stages, each transition spanning its
  `transition` frames — compute from the manifest stage frames, the same way
  `hopFrames` does).
- `poseAt(steps, t): FigurePose` where
  `FigurePose = { motion: PoseMotion; from: number; to: number; t: number }`:
  inside a blend step, `t = smoothstep((now − start) / (end − start))` over the
  WHOLE travel (all its hop steps together, not per frame); on a hold,
  `from = to = stage, t = 1`. The **cut** back to stage 0 (`hopFrames` returns
  `[]`) becomes, for the rig only, a blend over `TRANSITION_FRAMES / fps`
  seconds: emit a zero-frame "cut" marker the sprite ignores (its frame stays
  the target's first frame) and `poseAt` blends from the previous stage to 0
  over that window. A bridge's cut from the canonical pose into the next
  sheet's first stage stays a cut (the poses are the same by construction).
- `figurePoseAt(seg, clock, steps?)`: the continuous counterpart of
  `figureFrameAt` — stages via `poseAt`; breath segments blend
  `exhale → inhale` with `easeInOut(progress)` (and the reverse on exhale);
  pulse segments Pump→Release→Pump within the beat (`p < 0.5` toward
  Release, else back). Bridges: while `clock.seconds < bridge.end`, `poseAt`
  on the bridge steps (they carry the bridge sheet as `motion`).
- Export `poseAt`, `figurePoseAt`, `FigurePose` from `src/pacer/index.ts`.
- Tests (`figure.test.ts`, extend): a staged timeline's blends cover exactly
  its hop steps and `t` runs 0→1 across each travel; `poseAt` at a hold gives
  `from === to`; the half-moon spoken entry (an existing test) gives the same
  stage sequence via `poseAt` as via `frameAt`; the cut-back blend exists for
  the rig and leaves `frameAt` unchanged; breath and pulse blends at
  progress 0 / 0.5 / 1.

## 6. Wiring — `PoseMotion` chooses by a prop

- `PoseMotion` gets `renderer?: 'sprite' | 'rig'` (default `'sprite'`) and
  a `pose?: FigurePose` prop (the rig's controlled input; `frame` stays for
  the sprite). With `renderer: 'rig'` it lazy-loads the posture's rig JSON
  (`src/data/rig/index.ts`: `loadRigData(id): Promise<RigData>` via
  `import.meta.glob('./*.json')`; a bridge id maps to `bridge.<a>-<b>.json`)
  and mounts `<FigureRig>` in the same stack box, sprite cells hidden; the
  stage chips, play/pause, layer chips and breath keep working (autonomous
  play in rig mode = walk the stages with each hold and transition at the
  sheet's `fps`, using the same `blend`; reduced motion stops it).
  Falls back to the sprite when the rig reports unavailable.
- **Rollout flag**: `src/data/rig/index.ts` exports `RIG_LIVE: ReadonlySet<string>`
  = `{'half-moon'}` and `figureRenderer(id, search): 'sprite' | 'rig'`:
  `?figure=rig` forces the rig for everything (persist in
  `localStorage['yoga-figure-v1']`; `?figure=sprite` clears it); otherwise
  `RIG_LIVE` postures get the rig in CLASS MODE only. Posture pages keep the
  sprite hero; for `RIG_LIVE` postures (and for all when the flag is on)
  `PoseDetail` shows the rig figure BESIDE the sprite in the hero, same size,
  same breath, labelled "sprite" / "live" in `text-faint` — the side-by-side
  Robert asked for (`.pd-figurewrap` twice inside a flex row that wraps at
  phone width; check 360 px).
- `PacerClassMode`: compute `figurePoseAt` alongside `figureFrameAt` in
  `useClassFigureFrame` (return both; same rerender guard — a hold produces
  no new object), pass `pose` + `renderer` to `<PoseMotion>`; the rig's
  `breath` comes from the class breath phase + progress the hook already
  computes; layer flashes (`fadeLayers`) work the same (the rig fades its
  guides/ghost with the same 400 ms CSS on `data-on`). Bridges: the pose's
  `motion` is the bridge sheet → `PoseMotion` loads that bridge's rig JSON
  (preload the eight bridges' JSON when class mode mounts with the rig).
- Service worker: add the rig JSON URLs to nothing (they are bundled chunks,
  cached by the existing runtime caching); just confirm `npm run build`
  emits them as chunks and the app works offline-ish as before.

## 7. Verification you must do and report

- `npm test`, `npx tsc -b`, `npm run build`, `npm run lint` clean; list the
  new test count.
- `npm run dev`, then screenshots (Chrome MCP tools or Playwright — the repo
  has none; `npx playwright` is fine to install ad hoc under the scratchpad,
  NOT as a dependency) of: `/pose/half-moon` hero (sprite beside live, both
  themes), `/pose/half-moon?figure=rig` chips scrubbing to `Right side`,
  `Backbend` (side view), `Hands to feet` (quarter view) — compare each to
  the sprite cell of the same stage and fix the camera until they match
  (orientation, framing, line weight); `/pace?program=short&figure=rig`
  class mode running through Half Moon into the next posture. Look at the
  screenshots yourself with the Read tool. Note the automation tab
  throttles in the background: verify timing with unit tests, not by
  watching it.
- Performance: in Chrome with 4× CPU throttling, report the ms per render
  of the edge pass at the class-mode size (`performance.now()` around
  `renderer.render`), and the size of the `three` chunk. Target: a blend
  frame under 8 ms at 4× on this laptop's integrated GPU.
- Update `CLAUDE.md` (a `src/rig/` bullet, the `src/data/rig/` generation
  note, `PoseMotion renderer`, the flag) and add a short entry at the top of
  `CONTINUATION_PROMPT.md` under a new `✔ 2026-09-29 — LIVE FIGURE (uncommitted)`
  heading: what shipped, what you measured, what is not done. Do NOT commit.

## 8. Out of scope

Replacing the sprite pipeline, re-rendering sheets, touching the cue grid or
the coach, fingers/joint limits on the rig, the Timeline cards' static SVGs.
