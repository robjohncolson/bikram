# src/rig — the live figure's rig (pure TypeScript)

A port of the Blender mannequin in `scripts/blender/render_motion.py`:
`skeleton.ts` (joints, bones, radii, views), `pose.ts` (`applyStage` /
`solve`, the posing model), `inbetween.ts` (`blend`, steered midpoints),
`mirror.ts`, `camera.ts`, `body.ts` (tube + guide geometry recipes) and
`sheet.ts` (cached stage poses). No three.js here — the renderer is
`src/components/FigureRig.tsx`. Views import only from `index.ts`.

## Parity fixtures

`fixtures/*.json` are Blender's own joint positions for a set of poses
(held stages, a ghost, in-betweens). `pose.test.ts` checks the port
lands on them (held stages within 1e-4 m, in-betweens within 1e-3 m).
Regenerate — only when the rig or a fixture posture changes — with,
from the repo root:

    C:/Tools/blender-5.2.1-windows-x64/blender.exe -b --python scripts/blender/export_fixtures.py

A known wrinkle: when a big turn's two ways round score exactly equal
and the sweep axis is X, `midpoint_dir`'s side tie-break cannot separate
them and Blender's pick is float32 noise. The port keeps the first way;
the parity test names such cases and replays Blender's picks to show the
rest of the port is exact.
