# Spec — a sutra index and a practice brief from *Light on the Yoga Sutras of Patanjali*

**Source**: Robert's PDF `C:/Users/rober/Downloads/yoga.pdf` (B.K.S. Iyengar, *Light
on the Yoga Sutras of Patanjali*, Thorsons; 388 pages, text layer present — read
it with `pypdf`, no OCR needed). The PDF stays where it is; no page text is
copied into this repository.

**The rule** (`CLAUDE.md`, the classical layer, `docs/illustrated-index.md`): the
book is CITED, never quoted. Patanjali's sutras are ancient and public domain;
Iyengar's translation and commentary are not. So: the Sanskrit sutra
(transliterated) is data; every English word committed here is OURS — a label,
a summary, a note — never his rendering, and no sentence, clause or distinctive
phrase from the book. If a line reads like the book, rewrite it from the
Sanskrit and from general knowledge of the Sutras.

## Deliverables

1. `src/data/classical/sutras-index.json` — all 196 sutras in order:
   ```json
   { "id": "II.46", "pada": 2, "n": 46, "sanskrit": "sthira sukham asanam",
     "topic": "asana: steady and at ease", "page": 149 }
   ```
   `sanskrit` = the transliteration as the book prints it (diacritics dropped
   to ASCII, words separated as printed); `topic` = 3–8 words of OUR wording;
   `page` = the printed page where the book's treatment of that sutra begins
   (also `pdfPage`). Add a `theme` from a small fixed set you define
   (`samadhi`, `limbs`, `yama-niyama`, `asana`, `pranayama`, `pratyahara`,
   `dharana`, `dhyana`, `kleshas`, `karma`, `siddhis`, `kaivalya`, `other`).
2. `src/data/classical/sutras-brief.md` — the practice brief for the coach,
   ≤ 700 words, original wording, each paragraph citing the sutras it rests
   on by id (e.g. "II.46–48"): the eight limbs and their order; asana as
   steadiness and ease, effort relaxed and attention on the boundless;
   pranayama as what follows asana; withdrawal of the senses; the kleshas
   as what practice wears down; practice and non-attachment as the two
   means (I.12–16). Nothing about effects on the body beyond what the
   Sutras themselves claim, and those phrased "the tradition holds".
3. `src/data/classical/sutras-index.test.ts`: 196 entries, ids unique and in
   order (I.1–51, II.1–55, III.1–56, IV.1–34), pages non-decreasing, every
   `theme` in the set, every id cited in the brief exists.
4. Wire the brief into the coach: `src/coach/prompt.ts` appends the brief
   under a heading "The tradition (Patanjali, as read by Iyengar)" with the
   instruction that the coach may cite a sutra by id when it names a
   principle, and must not present tradition as physiology. Keep the
   existing prompt tests green; add one that the brief and heading are
   present.
5. `docs/sutras-index.md`: source, rule, fields, how regenerated — original
   wording. Include the originality-gate output.

## Originality gate

Extract every page's text with `pypdf` to a scratch folder OUTSIDE the repo
(`C:/Users/rober/Downloads/yoga-ocr/page-NNN.txt`), then run an 8-word
window check (lower-case, punctuation stripped) of every committed file you
wrote against all pages — the script pattern from
`C:/Users/rober/Downloads/yogapic-ocr/illustrated-originality-gate-*.py`.
The Sanskrit transliterations WILL match the book by construction: exclude
the `sanskrit` field from the check, and prove separately that the field
holds only transliterated Sanskrit (no English words). Zero other hits or
the task is not done. Then `npx vitest run src/data/classical src/coach`
and `npx tsc -b`.

## Out of scope

Iyengar's commentary, his translations, the Sanskrit-word glossary, and any
UI (a "sutra of the day" lens is a later task). Do not touch `journal/`.
