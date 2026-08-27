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
  probability, not a tally. The schedule is honest: only spaced retrieval
  advances a card (a blitz can't fake a week), misses come back inside
  the same session, and the "what comes next" drill chains — each answer
  becomes the next question, so a run of right answers is the class
  recited in order.
- **Knowledge map** — the sequence as a DAG: posture identities feed
  transitions, transitions feed arcs, arcs feed the whole sequence —
  each node tinted by the current estimate that you know it.
- **Pace** — a metronome-based breath pacer: 60 BPM in six-beat bars by
  default (six counts in, six out — the Pranayama pace, five breaths a
  minute), adjustable tempo and bar length down to a Kapalbhati pulse,
  plus a class pacer that walks all 26 postures on the same clock with
  spoken instructions at the right moments — sides, sets, the floor
  series' savasana and sit-up interludes — and an immersive full-screen
  class mode that keeps the screen awake. The coaching rotates day to
  day so the whole of each posture's teaching gets spoken over a week;
  Kapalbhati pulses and Pranayama keeps its six-count whatever the dial
  says; a quiet two-minute final savasana ends with the bell.
- **Rehearsal** — turn it on and the class stops telling you what comes
  next: the chime sounds, four counts pass, then the voice confirms.
  Afterwards, mark the hand-offs you didn't recall; they feed the
  knowledge map as class evidence.
- **Go deeper** — every posture page reads the shape against the classical
  repertoire as B.K.S. Iyengar documents it in *Light on Yoga*: the name's
  roots, the nearest classical asana and where 26 & 2 differs, refinements
  that transfer, hold-here stages, and the ladder of poses before and
  beyond — in our own words, with plate numbers so you can open your copy.
- **Journal** — every paced class is remembered: when, how long, what was
  rehearsed and recalled; the pacer tells you when you last practiced and
  which hand-offs to listen for, and posture pages link straight into a
  drill or a class started from that posture.

Installable as an app (PWA) and fully offline once visited — everything
is self-contained. Knowledge estimates decay honestly between sessions:
what you don't practice, the app slowly stops claiming you know.

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
