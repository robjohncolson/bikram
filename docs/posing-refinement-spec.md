# Spec — refine the mannequin's postures against the reference photographs

`src/data/classical/illustrated-map.json` (commit `8eb7959`) says, for each of
the app's 26 items, which page of Robert's local scan of *The Illustrated
Light on Yoga* shows the closest shape. The page images live OUTSIDE the repo
at `C:/Users/rober/Downloads/yogapic-ocr/page-NNN.png` (NNN = `pdfPage`,
200 dpi). Use them as an artist uses a reference photo: look, then author
better bone directions for our own tube mannequin. NOTHING from the scan is
copied, traced, cropped or committed — the output of this task is numbers in
`scripts/blender/postures/<id>.py`, the re-rendered sprite sheets, and the
re-exported rig JSON. The mannequin has no face and no anatomy; it cannot
reproduce a photograph and must not try to.

Read `CLAUDE.md` (`src/data/motion/`, `src/rig/`, `src/data/rig/`),
`scripts/blender/postures/README.md` (the authoring contract — the rig,
world-space directions, rolls, guides/ghost, the preview workflow),
`scripts/blender/render_motion.py` (`apply_stage`), `docs/live-figure-rollout.md`
(the "known" rows), the "Known compromises" paragraph in `CONTINUATION_PROMPT.md`
(2026-09-27 entry), and the module you are about to edit.

Ground rules: `npm test` (253 / 25) green, `npx tsc -b`, `npm run lint`,
`npm run build` clean; never regexes in Bash heredocs; do not commit. Blender is
at `C:/Tools/blender-5.2.1-windows-x64/blender.exe`; `npm run motion:preview <id>`
→ `.motion-tmp/preview-<id>.png` is the tuning loop; `npm run motion <ids…>`
re-renders sheets (3 workers, ~1 min each; it rewrites `src/data/motion/manifest.ts`).

## Which postures

Only those with a real photograph in the map (`asana` not null), and among
them start with the documented compromises. In this order:

1. `cobra` (reads too upright; the photo shows the pelvis on the floor, the
   lift from the back, elbows bent in the 26 & 2 form — keep OUR form: hands
   under the shoulders, elbows in, the note in the map says the book's
   elbows are extended, do not copy that).
2. `locust`, `full-locust` (the one-sided floor stages "look alike from the
   side": use the photo for the leg height and the hip line; consider a
   stage `view` change so one leg up READS).
3. `bow`, `camel`, `fixed-firm`, `half-tortoise`, `spine-twisting`,
   `head-to-knee-stretching`, `standing-separate-leg-stretching`,
   `standing-separate-leg-head-to-knee`, `triangle`, `half-moon` (fold
   stage only), `savasana`.
4. Skip `standing-head-to-knee`, `wind-removing`, `situp` (the map's own
   notes say the photograph is a poor analogue) and every null-mapped
   posture.

## Per posture

- Look at the page PNG and at `npm run motion:preview <id>`'s contact
  sheet side by side (Read tool). List, in one line each in your report,
  what the mannequin gets wrong relative to the photograph in OUR form
  (the 26 & 2 execution as the pose file `src/data/poses/NN-<id>.ts` and its
  `setup` steps describe it — the photograph informs shape and proportion,
  the pose file decides the form when the two differ).
- Edit the stage dicts (directions, rolls, `pelvis.location`, stage `view`
  where a different camera shows the shape better; guides/ghost only if a
  stage's guide plane no longer matches the new pose). Keep stage labels
  and their order EXACTLY (the manifest, `stagematch.test.ts`, `figure.test.ts`
  and `rig-data.test.ts` pin them). Keep feet on the floor and limbs within
  the rig's reach (README).
- Re-preview; iterate until the strip reads right; keep the before/after
  preview PNGs under the scratchpad `posing/<id>-before.png` / `-after.png`.

## When the dicts are final

- `npm run motion <all changed ids>` (one run at the end, not per posture),
  then `npm run rig:export`, then
  `C:/Tools/blender-5.2.1-windows-x64/blender.exe -b --python scripts/blender/export_fixtures.py`
  (the parity fixtures are Blender's own positions for specific stages — a
  changed stage must refresh its fixture; `pose.test.ts` then proves the TS
  rig still matches). `npm test` must be green afterwards with no assertion
  changed.
- Check `public/motion/` holds exactly one sheet per stem (old hashes gone),
  and that the manifest's `position` fields are unchanged.
- Re-shoot the sprite-vs-live contact sheet for each changed posture the way
  the rollout did (`/pose/<id>?figure=rig`, every chip; Playwright under the
  scratchpad) and look at it: sprite and live must still agree.
- Update each changed module's docstring (what was refined and why — in
  your words, "after the reference photograph" is enough; no page text).
  Update the "known" rows in `docs/live-figure-rollout.md` that this fixes,
  and add a top entry to `CONTINUATION_PROMPT.md`.

## Report

Per posture: the one-line diagnosis, what changed (bones, views), before/
after preview paths. The full list of re-rendered sheets and refreshed
fixtures; test count; the four commands' status; anything skipped and why.
