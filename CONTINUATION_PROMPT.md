# CONTINUATION_PROMPT — 26 & 2 / bikram (resume here, 2026-08-28)

Read `CLAUDE.md` first (architecture + conventions; it is current). This file is the
newest-first log of where the work stands and what is still open.

**Live**: https://bikram-chi.vercel.app · **Repo**: https://github.com/robjohncolson/bikram (PUBLIC
since 2026-08-27) · deploy with `npx vercel deploy --prod --yes` · `npm test` = 88 tests / 9 files,
all green at `e7f10d3`.

---

## ★ THE ONE THING STILL OPEN AT THE TOP: 11 classical notes await their audit

All 26 `ClassicalNote` files are **written** and type-check, but only **15 passed the independent
audit**, and only audited ones are listed in `src/data/classical/index.ts` — so eleven postures
currently show **no "Go deeper" section** on their page. That is deliberate: the audits caught real
errors (see below), and unaudited notes must not ship to a public site.

**Pending (named in `PENDING_AUDIT` in `scripts/gen-classical-index.py`):**
`standing-separate-leg-head-to-knee` · `savasana` · `wind-removing` · `situp` · `fixed-firm` ·
`half-tortoise` · `camel` · `rabbit` · `head-to-knee-stretching` · `spine-twisting` · `kapalbhati`

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

Then delete the name from `PENDING_AUDIT`, run `python3 scripts/gen-classical-index.py`,
`npx tsc -b && npm test`, commit, deploy.

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
Contract, view section, index generator, and 26 notes — 15 rendering, 11 held back (top of file).

---

## -2. What is NOT done (ranked, from the 16-agent roadmap; full text in `/tmp/.../tasks/w55h4hlmi.output`)

1. **The eleven audits** (above) — the only thing blocking a complete `Go deeper` layer.
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
