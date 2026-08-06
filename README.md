# 26 & 2 — the hot yoga sequence

A visual guide and memory trainer for the classic Bikram hot yoga sequence:
26 items in order — 24 postures plus 2 breathing exercises — with every
posture's technique, benefits, chakra connections, and muscle-group work.

## Features

- **Sequence** — the full 90-minute class as a visual timeline: opening breath,
  standing series, floor series, closing breath, with a class clock.
- **Pose pages** — setup steps, alignment cues, breath, benefits, cautions,
  chakra links with the *why*, and a body map of what each posture
  strengthens and stretches.
- **Explore** — flip the lens: browse by chakra (root to crown) or by muscle
  group (clickable body map) to see which postures work each one.
- **Train** — memorize the sequence: a spaced-repetition review queue
  (SM-2-style intervals) over three card types — "what comes next?",
  English↔Sanskrit, and "which posture is #N?" — plus free-practice drills.
  Every answer feeds Bayesian knowledge tracing, so mastery is a real
  probability, not a tally.
- **Knowledge map** — the sequence as a DAG: posture identities feed
  transitions, transitions feed arcs, arcs feed the whole sequence —
  each node tinted by the current estimate that you know it.

## Run it

```sh
npm install
npm run dev
```

Build for any static host with `npm run build` (output in `dist/`).

## Editing the sequence

Every posture is one file in `src/data/poses/`, assembled in class order by
`src/data/poses/index.ts` — drop, reorder, or swap entries there to match a
studio variant. See `CLAUDE.md` for the data model and conventions.
