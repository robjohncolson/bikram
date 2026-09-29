# Spec — orbit the live figure by hand (2026-09-29)

The live rig (`docs/live-figure-spec.md`, rollout `07db783`) frames every stage
with the camera the sheet authored (`src/rig/camera.ts`: an azimuth about +Z,
`centerZ`, `scale`). Robert: "if the view is live, I should be able to rotate the
figures to see the angle I want." Add a hand orbit on POSTURE PAGES only. Class
mode stays exactly as it is — no controls, no numbers, the authored views — by
design.

Read `CLAUDE.md` (the `src/rig/` and `PoseMotion renderer` bullets),
`src/rig/camera.ts`, `src/components/FigureRig.tsx`, `src/components/figureRigScene.ts`,
`src/components/PoseMotion.tsx`, `src/views/PoseDetail.tsx` (the hero: sprite and
live side by side).

Ground rules as before: `npm test` (227 / 22) green, `npx tsc -b`, `npm run lint`,
`npm run build` clean; tokens only for colours; no regexes in Bash heredocs;
do not commit.

## Behaviour

- **Drag to orbit** the live figure on `/pose/<id>`: pointer down on the
  figure disc, horizontal drag turns the azimuth (about 180° across the disc's
  width), vertical drag tilts an ELEVATION (new, ±60°, clamped; 0 = the
  authored views, which are all level). Pointer events (mouse, touch, pen),
  `touch-action: none` on the disc while a drag is possible, no page scroll
  hijack when the pointer is not down. Inertia is NOT wanted; it stops when
  the finger stops.
- **Keyboard**: with the disc focused (it becomes a focusable
  `role="img"`-free control: a `<div tabIndex=0 role="group" aria-label="Figure
  view">`), arrow keys orbit by 15° / tilt by 10°; `0` (and Home) resets.
- **Reset**: a small "Reset view" text button appears beside the layer chips
  only while the view is off the authored one; clicking it eases back over
  ~400 ms (smoothstep) unless reduced motion, then instant.
- **While the demonstration plays** the authored per-stage camera still
  ORBITS between stages (that is part of the choreography); a hand offset is
  ADDED to it (azimuth offset + elevation) and persists across stages and
  across chip scrubs, until reset. Reset is the only thing that clears it.
- **Framing**: keep `centerZ`/`scale` from the stage (zoom is not asked for);
  a tilt must keep the figure inside the disc — with an ortho camera at
  elevation e the vertical extent is unchanged for a level figure, so no
  refit; just clamp elevation.
- **Sprite** beside it: untouched (it cannot orbit). A one-line
  `text-faint` hint under the live figure: "Drag to turn · arrows to orbit".
- **Reduced motion**: dragging still works (it is user-driven), reset is
  instant, no eased settle.

## Code

- `src/rig/camera.ts`: `CameraState` gains `elevation` (radians, default 0;
  `cameraAt`/`stageCamera`/`orbitBetween` carry it — interpolate linearly);
  `withOffset(cam, {azimuth, elevation})` pure; `clampElevation`. Tests.
- `figureRigScene.ts`: the camera rig applies elevation as a rotation about
  the pivot's local X after the azimuth (pivot at `(0,0,centerZ)`, camera on
  its −Y looking +Y, as today). Keep render-on-demand: an offset change is
  one render.
- `FigureRig.tsx`: a `viewOffset?: {azimuth: number; elevation: number}` prop;
  the drag/keyboard handling lives in a small hook `useOrbit(ref, opts)`
  in `src/components/useOrbit.ts` (pure state + pointer math, unit-test the
  math: px → radians, clamps, reset easing) and is wired by `PoseMotion` when
  `renderer === 'rig' && interactive` (never in class mode: `layers` prop
  present ⇒ no orbit).
- `PoseMotion.tsx`: the reset button + hint, only for the rig renderer on
  posture pages. Accessibility: the group's `aria-label`, the reset button's
  text, focus ring via `--focus-ring`.

## Verify

Screenshots (Playwright under the scratchpad, foreground): `/pose/half-moon`
live figure dragged to a three-quarter and a high view at the Right side
stage; keyboard orbit; reset; `/pose/camel` tilted from above; both themes;
360 px width with touch drag (Playwright `hasTouch`). Look at them. Confirm
class mode (`/pace?program=short`) has no orbit and the authored views
unchanged (one screenshot). Update the `PoseMotion renderer` bullet in
`CLAUDE.md` and add a line to the top entry of `CONTINUATION_PROMPT.md`.
Report: files, test count, what the screenshots showed, anything not done.
