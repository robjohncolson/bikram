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
- `src/views/` — one folder-free file pair per route: Timeline (`/`),
  PoseDetail (`/pose/:id`), Explorer (`/explore?lens=chakra|muscle&id=…`),
  Trainer (`/train`, progress in localStorage `yoga-trainer-v1`).
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
