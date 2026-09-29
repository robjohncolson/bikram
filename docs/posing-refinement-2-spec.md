# Spec — refine the 12 postures the Iyengar book could not (2026-09-29)

The first posing pass (`docs/posing-refinement-spec.md`, commit `f237a2d`)
refined the 14 postures with a photograph in *The Illustrated Light on Yoga*.
This pass covers the other 12, from two reference sources Robert chose:

1. **Wikimedia Commons photographs** of the classical asana. Fetch into the
   LOCAL reference folder `C:/Users/rober/Downloads/bikram-ref/commons/`
   (outside the repo). For each file, open its Commons file page and record
   the licence, author and URL in `bikram-ref/commons/LICENSES.md`. Prefer
   CC0 / CC BY / CC BY-SA; skip anything without a clear free licence.
2. **The yogajala cheat-sheet illustrations** at
   `https://yogajala.com/26-bikram-yoga-poses/` (images
   `yogajala.com/wp-content/uploads/The-26-Bikram-Yoga-Poses-Free-Cheat-Sheet-N.jpg`,
   N = the posture's number in class order). They are © yogajala: download
   them ONLY into `C:/Users/rober/Downloads/bikram-ref/yogajala/` to look at
   with the Read tool, exactly as the Iyengar scans were used. Never copy,
   crop, trace or commit them; the mannequin holds numbers.

The yogajala sheet shows the 26 & 2 STUDIO FORM (arms-overhead Awkward with
heels up, interlaced-finger Pranayama, the Bikram Toe Stand, the sit-up);
the Commons photos show the classical shape and proportion. Where they
differ, the pose file `src/data/poses/NN-<id>.ts` and its `setup` steps
decide — this app teaches the 26 & 2 form.

Read first: `CLAUDE.md` (`src/data/motion/`, `src/rig/`, `src/data/rig/`),
`scripts/blender/postures/README.md`, `docs/posing-refinement-spec.md` (the
method — same here), the 2026-09-29 entries at the top of
`CONTINUATION_PROMPT.md` (the reach warnings still open), and each module you
edit. Ground rules as before: `npm test` (253 / 25) green, `npx tsc -b`,
`npm run lint`, `npm run build` clean; never weaken an assertion; never
regexes in Bash heredocs; do not commit; stage labels and order EXACTLY as
they are; feet on the floor; limbs within reach (the helpers now warn on
stderr — a warning in a module you edit must be gone when you finish).

## The 12, in this order, with what to look for

1. `toe-stand` — the reach helper warns 24–32 cm short for the hands to the
   floor: fix that first (the Bikram form: squat on one heel with the other
   foot on the thigh, fingertips to the floor, then hands to prayer).
2. `spine-twisting` — only the open warning: the arm hooking the knee is
   4.7 cm short in the setup stages (Arm over the knee, Hand behind, Change).
   Do not re-author the twist (it was refined in pass 1).
3. `eagle` — the wraps are stacked limbs; use the photos for the crossed
   thigh and the forearm cross with the hands in front of the face; the
   standing knee bent, sitting low.
4. `standing-bow` — kicking leg high behind, the arm reaching forward level,
   the chest down to level in the full expression.
5. `balancing-stick` — one straight line from fingertips to heel, level.
6. `tree` — the lifted foot on the front of the opposite thigh (the Bikram
   form), hands to prayer at the chest.
7. `awkward` — three parts: heels down, on the toes, knees together sinking;
   arms forward at shoulder height throughout (NOT overhead — check the
   pose file).
8. `standing-head-to-knee` — kicking the held leg out to level, elbows
   down, forehead to the knee.
9. `wind-removing` — one knee hugged to the chest then both, the other leg
   flat, head down.
10. `situp` — the class sit-up: arms overhead, sit up, fold to the toes.
11. `rabbit` — heels held, forehead to the knees, crown to the floor, hips
    lifted over the head.
12. `pranayama` / `kapalbhati` — only if the shape is wrong (Pranayama's
    interlaced hands under the chin, elbows meeting overhead on the exhale;
    Kapalbhati's seated pump): these are breath sheets, keep their
    Inhale/Exhale and Pump/Release stage semantics untouched.

Per posture, exactly the pass-1 method: diagnose against the references in
one line, edit directions/rolls/`pelvis.location`/stage `view`/guides/ghost
as needed, `npm run motion:preview <id>`, iterate, keep `posing2/<id>-before.png`
and `-after.png` under the scratchpad. Also fix the three bridge midpoint
reach warnings in `scripts/blender/bridges/_canon.py` (3–4 cm short) —
bridges must then be re-rendered too (`bridge:*` ids as needed; `_canon.py`
feeds all eight, so check which change with a preview before rendering).

## When the dicts are final

One `npm run motion <changed ids…>` run; `npm run rig:export`; the Blender
fixture export (`blender.exe -b --python scripts/blender/export_fixtures.py`);
`npm test`. Check `public/motion/` has one sheet per stem and the manifest's
`position` fields are unchanged. Re-shoot sprite-vs-live for every changed
sheet (`/pose/<id>?figure=rig`, every chip; Playwright under the scratchpad)
and look. Update module docstrings ("after the reference photographs" is
enough — no source text), the "known" rows of `docs/live-figure-rollout.md`
that this fixes, and add a top entry to `CONTINUATION_PROMPT.md` that lists
the Commons files used with their licences (from `LICENSES.md`).

## Report

Per posture: diagnosis, changes, before/after paths; the Commons files and
licences; the remaining reach warnings (should be none); re-rendered sheets
and refreshed fixtures; test count; the four commands; anything skipped and
why.
