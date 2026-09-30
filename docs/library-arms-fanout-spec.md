# Library arms: family migration pass

The infrastructure pass is complete. Only paschimottanasana is migrated;
55 sheets still use the original skeleton. Read CLAUDE.md,
scripts/blender/library/README.md and docs/library.md before editing.
The latter records proportions and a before/after reach probe for every
previously documented limitation. Longer arms do not establish a bind.

## Ownership

One family agent per row, in a separate worktree. Each owns its listed
`src/data/library/<id>.ts`, `scripts/blender/library/<id_with_underscores>.py`,
`src/data/rig/library/<id>.json`, new adjacent pure tests, and its family
helper/content-note files. Read other families' helpers but do not edit them.
Paschimottanasana stays the reference: seated may change it only for a
verified family integration issue, retaining its variant and proof tests.

| Family owner | Helper / notes ownership | Posture ids |
|---|---|---|
| standing | _standing.py / common-standing.ts | padahastasana, padangusthasana, parsvottanasana, prasarita-padottanasana, tadasana, uttanasana, utthita-parsvakonasana, utthita-trikonasana, virabhadrasana-i, virabhadrasana-ii |
| backbend | _backbend.py / common-backbend.ts | adho-mukha-svanasana, bhujangasana-i, chaturanga-dandasana, dhanurasana, purvottanasana, salabhasana, urdhva-dhanurasana, urdhva-mukha-svanasana, ustrasana |
| seated | _seated.py, _folds.py / common-seated.ts, common-folds.ts | ardha-navasana, baddha-konasana, dandasana, janu-sirsasana, maha-mudra, marichyasana-i, paripurna-navasana, paschimottanasana, supta-virasana, trianga-mukhaikapada-paschimottanasana, upavistha-konasana, virasana |
| lotus | _lotus.py / common-lotus.ts | ardha-baddha-padma-paschimottanasana, baddha-padmasana, matsyasana, padmasana, parvatasana, siddhasana, yoga-mudrasana |
| inversion | family-local new helper only; shared _lib.py is read-only | eka-pada-sarvangasana, halasana, karnapidasana, parsva-halasana, parsva-pindasana-in-sarvangasana, parsvaika-pada-sarvangasana, pindasana-in-sarvangasana, salamba-sarvangasana-i, salamba-sirsasana-i, setu-bandha-sarvangasana, supta-konasana, urdhva-dandasana, urdhva-padmasana-in-sarvangasana |
| twist | _twist.py / common-twist.ts | ardha-matsyendrasana, bharadvajasana, jatara-parivartanasana, marichyasana-ii, supta-padangusthasana |

The integrator alone owns `_lib.py`, `_hull.py`, `_skeleton.py`, `_selftest.py`,
`_reach_report.py`, exporter/preview code, `src/rig/`, shared types, renderer,
`common.ts`, library.test.ts, README, CLAUDE.md and docs/library.md. Family
agents supply replacement reach-table rows and evidence in their result
reports; the integrator merges those rows and refreshes the variant fixture.
If a shared helper blocks progress, report a concrete reproducer and required
change instead of modifying another owner's files.

## Migration work for every sheet

1. Call `L.begin(id, skeleton='library')` before constructing any pose.
   A posture's own `L` is also the one its family helper must use. Do not
   retain import-time copies of arm lengths, rest joints or palm offsets.
   The opt-in reaches FK, two-bone solvers, floor, palm and hull checks;
   `L.check` emits the skeleton field. No selection still means the old rig.
2. Re-author targets, shoulder orientation and elbow hints as needed.
   Rerun the book's bind or clasp with the existing solvers; measure the
   actual joint gap and hull contact. A zero reach shortfall is not proof
   that a hand avoids the head, leg or other wrist. Keep the published
   clearance tolerances and exemptions; do not introduce posture exceptions.
3. Recheck every floor contact. The hand is longer and its palm is at
   `L.PALM_AT = 0.35 * L.HAND`; use `flat_hand` for a planted palm. Recheck
   palm support on the back, rest-stage grounding, ghosts, framing and all
   transitions, including the loop. Release grips before a hand sweeps away.
4. Show both sides for the one-sided postures below, with safe neutral
   hand-offs and feet-turn stages. The cap is 12 for every library sheet.
   Reuse neutral stages where they are truly identical; do not drop safe
   entry/exit movement merely to fit a count. If 12 cannot accommodate a
   verified path, report the conflict rather than loosening the contract.
5. Keep the steps true to the demonstrated form and in stage order. Bind
   previously unbound second-side instructions to their new stages; maintain
   original, calm second-person wording. Do not copy book sentences, alter
   cautions speculatively or add unsupported technique. Record remaining
   reach limitations explicitly in the copy and in the reach-table proposal.
6. Export and preview each owned sheet. Inspect its contact sheet; the
   contact sheet alone does not test the in-betweens. Commit no unrelated
   generated sheets, sprites, manifests or fixtures to the family result.

## One-sided sheets found in the current library

The grep of unbound “other side” instructions finds ten unilateral forms:

- standing: virabhadrasana-i, parsvottanasana;
- seated: trianga-mukhaikapada-paschimottanasana, marichyasana-i,
  ardha-baddha-padma-paschimottanasana;
- inversion: parsva-pindasana-in-sarvangasana;
- twist: bharadvajasana, marichyasana-ii, ardha-matsyendrasana,
  supta-padangusthasana.

There are also seven sheets showing only one leg-crossing order, with an
unbound instruction to reverse it: siddhasana, padmasana, parvatasana,
baddha-padmasana, yoga-mudrasana, urdhva-padmasana-in-sarvangasana and
pindasana-in-sarvangasana. Their owners should demonstrate the other crossing
within the same 12-stage contract, or report a specific transition conflict.
Parsva pindasana also asks for the opposite crossing after both lateral
sides; verify that full sequence rather than assuming mirroring one side
covers it. Janu sirsasana and maha mudra already have both sides.

Reproduce the inventory with `rg -n "no stage|points at no|side only|one side"
src/data/library scripts/blender/library`; inspect the steps, since not every
unbound instruction is a missing side (for example, lying down to rest).

## Evidence and checks

For each family report which sheets migrated, stage/step changes, measured
remaining gaps (name the joints or solver targets and held stage), old/new
reach-table rows, preview paths, and any shared-code blockers.

- `python scripts/blender/library/<id>.py`: no floor, reach, contact,
  across or clearance warnings.
- `npm run rig:export`: only the owned sheets change; default class JSON,
  `RIG_LIVE`, `render_motion.py` tables and all original fixtures stay
  byte-for-byte untouched. No change to the 26 & 2 skeleton or tests.
- `npm run motion:preview library:<id>` with Blender 5.2.1; inspect the PNG.
- `npx vitest run src/data/library src/rig --maxWorkers=1`: all held poses,
  ghosts, eight transition samples, camera bounds and node regressions pass.
- Integrator: `python scripts/blender/library/_selftest.py --write`, inspect
  that only the new library fixture changes; `npx tsc -b`, `npm test`,
  `npx oxlint`, `python scripts/library-originality-gate.py` (zero hits).

Never overwrite `src/rig/fixtures/*.json`, skeleton-from-blender or skin-fit
fixtures to make a migration pass. The new library parity belongs in
`src/rig/clearance-fixtures/library-from-python.json` and adjacent variant
tests, with Python/TS FK and clearance depths within 1e-4 m. No web or DOM
needed for tests; jsdom is not installed.
