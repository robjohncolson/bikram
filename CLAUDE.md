# 26 & 2 — hot yoga sequence guide

A web guide + memory trainer for the classic Bikram hot yoga sequence
(26 numbered items = 24 postures + 2 breathing exercises), with per-posture
chakra links and muscle-group work.

## Stack

Vite + React 19 + TypeScript + react-router-dom v7. Plain CSS with design
tokens — no CSS framework, no other runtime deps. `npm run dev` / `npm run build`
(build runs `tsc -b` first).

## Architecture

- `src/data/` is the source of truth; views import ONLY from `src/data/index.ts`
  (the access layer), never from pose files directly.
  - `types.ts` — the `Pose`/`Chakra`/`MuscleGroup` contracts, fully documented.
  - `poses/NN-<id>.ts` — one file per sequence item, assembled in class order by
    `poses/index.ts`. To match a studio variant, edit that index (keep `order`
    fields in sync).
  - `figures/` — line-art SVG strings (pose id → inner SVG, 0 0 100 100 viewBox,
    `currentColor` strokes), merged onto poses by `poses/index.ts`. Authored
    separately from content on purpose.
  - `chakras.ts` / `muscles.ts` — reference data; their `id` unions in `types.ts`
    are the contract used by pose data and the BodyMap regions.
- `src/views/` — one file pair per route: Timeline (`/`), PoseDetail
  (`/pose/:id`), Explorer (`/explore?lens=chakra|muscle&id=…`), Trainer
  (`/train`), KnowledgeMap (`/train/map`), Pacer (`/pace`).
- `src/pacer/` — the breath-pacer engine (views import only from its
  `index.ts`). `timing.ts` is pure math (settings clamp, phase/beat
  conversions, presets; unit-tested); `metronome.ts` wraps Web Audio with
  lookahead scheduling — bars alternate inhale/exhale (even/odd), 1-beat
  bars are Kapalbhati-style pulse mode. Default 60 BPM × 6-beat bars =
  the Pranayama six-count (5 breaths/min; beats land on seconds). Views
  never touch Web Audio directly. Settings persist in `yoga-pacer-v1`.
  `cues.ts` is the class-cue sequencer: compiles each posture into
  beat-addressed events (announce / guide / set / warn; pure, tested).
  `voice.ts` is the spoken sampler over browser speech synthesis
  (guarded — degrades to tones-only); `metronome.cue()` renders the
  tone events (warn tick, change chime, end bell).
- `src/trainer/` — the learning engine (pure TS, unit-tested with vitest,
  `npm test`). Views import ONLY from `src/trainer/index.ts`. Three layers:
  - `graph.ts` — the knowledge DAG: 26 identity KCs + 25 transition KCs
    (prereq edges from their two identities) + 4 arc aggregates + root;
    plus the 77 practice cards (name/pos/next) in introduction order.
  - `bkt.ts` — Bayesian knowledge tracing per leaf KC (guess/slip/learn
    tuned per card kind); aggregates are computed noisy-AND products,
    never stored. `nodeP`/`band` are the only mastery math allowed in UI.
  - `srs.ts` + `store.ts` + `engine.ts` — SM-2-lite scheduling (30m → 1d →
    3d → ×ease, lapses cost ease), versioned localStorage
    (`yoga-trainer-v2`, auto-migrates v1 tallies), and the session facade
    (`buildQueue`/`recordAnswer`/`dueCount`).
- `src/components/` — shared `PoseFigure` (figure or numbered-badge fallback)
  and `BodyMap` (front/back silhouettes, tintable muscle regions; its props
  contract is load-bearing for PoseDetail and Explorer).

## Conventions

- Styling: CSS custom properties from `src/styles/global.css` only — never
  hardcode colors (chakra colors come from data and are tuned for both themes).
  Light/dark flips automatically via `prefers-color-scheme`.
- TS: `verbatimModuleSyntax` (use `import type`), `noUnusedLocals`,
  `erasableSyntaxOnly` (no enums) are all on.
- Content voice: second-person, calm teacher. Benefits stay honest — energetic
  or traditional claims are phrased "traditionally said to…". Never reproduce
  the copyrighted Bikram dialogue verbatim; cues are always original wording.
- Muscle actions: `strengthens` = contracting/working, `stretches` = lengthening;
  `primary` emphasis entries come before `secondary`.
