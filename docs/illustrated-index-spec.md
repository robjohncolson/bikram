# Spec — an index of *The Illustrated Light on Yoga* for the classical layer

**Source**: Robert's scan of *The Illustrated Light on Yoga* (B.K.S. Iyengar,
HarperCollins India, 2001; 179 pages), OCR'd page by page into
`C:/Users/rober/Downloads/yogapic-ocr/` (`page-NNN.txt` = OCR text, `page-NNN.png`
= the page at 200 dpi, NNN = 1-based PDF page). That folder is OUTSIDE the repo
and must stay there: neither the scans nor the OCR text are ever copied into
this repository.

**The rule this repo already lives by** (`CLAUDE.md`, `src/data/classical/`):
the book is CITED, never quoted. Facts (names, page numbers, figure numbers,
grades, which asana precedes which in a course) are data; Iyengar's sentences
are not ours to reproduce. Everything committed here is either a fact or
written in original wording. No sentence, clause or distinctive phrase from the
book may appear in any committed file — if a description reads like the book,
rewrite it from the photograph, not the text.

## Deliverables

1. `src/data/classical/illustrated-index.json` — one entry per asana in the
   book, in the book's order:
   ```json
   { "sanskrit": "Utthita Trikonasana", "romanised": "utthita-trikonasana",
     "english": "extended triangle", "page": 44, "figures": [8, 9],
     "grade": 3, "section": "Standing" }
   ```
   `figures` = the photograph numbers the book prints for that asana;
   `grade` = the book's difficulty star/number when it prints one (omit the
   key when it does not — never guess); `section` = the book's own grouping
   heading. Etymology: a `roots` array of the Sanskrit words the book breaks
   the name into, e.g. `["utthita", "tri", "kona"]` — the words only, no
   gloss sentences. Also `pdfPage` (the scan page) beside `page` (the
   printed page number) so the two never get confused.
2. The **course tables** the book prints (the weekly/graded practice
   courses): `src/data/classical/illustrated-courses.json`, each course as an
   ordered list of `{ "asana": "<romanised>", "page": N }`; if the book gives
   timings or week numbers, keep them as numbers.
3. `src/data/classical/illustrated-index.test.ts`: every entry has
   `sanskrit`, `page`, `pdfPage`; pages are ascending in book order; every
   `asana` in the courses resolves to an index entry; `romanised` ids are
   unique kebab-case ASCII.
4. **Cross-check the 26 classical notes.** For every
   `src/data/classical/NN-<id>.ts`, compare its `reference` (plate/grade),
   its nearest-asana name and its before/beyond ladder with the index. Write
   `docs/illustrated-crosscheck.md`: a table `| note | claim | book | verdict |`
   (`confirmed` / `differs` / `not in this edition`). Note that the classical
   notes cite the FULL *Light on Yoga* plate numbers; this illustrated edition
   is a selection with its own figure numbers, so "not in this edition" is a
   normal verdict and NOT a defect. Do NOT edit the notes — report only.
5. A short `docs/illustrated-index.md` (the how and the why: the source, the
   rule, the fields, how to regenerate) — original wording.

## Method

- Read the OCR text page by page; when the OCR is doubtful (names with
  diacritics, figure numbers, grades) LOOK at the page PNG. Sanskrit names go
  in without diacritics in `romanised` and with the book's diacritics in
  `sanskrit` as best the scan allows (flag uncertain ones in a `note` field).
- Work through the whole book: the contents/index pages first to get the
  list, then each asana's page to confirm figures and grade.
- Keep a scratch file of your progress OUTSIDE the repo (in the OCR folder).

## Verification

`npm test` green (the new test included), `npx tsc -b` clean. Then run this
originality gate yourself and report its output: for every committed file
you wrote, every run of 8 consecutive words must NOT occur in any
`page-NNN.txt` (write a small Python script in the OCR folder for it —
lower-case, punctuation stripped). Zero hits or the task is not done.

## Out of scope

Transcribing technique text, benefits, or cautions from the book; touching
the posture pages or the coach; anything under `src/data/poses/`.

## Also: map our 26 to the book's photographs

Add `src/data/classical/illustrated-map.json`: for each of the app's 26
postures (`src/data/poses/NN-<id>.ts`, id + the classical note's nearest
asana) the book entry that shows the closest shape — `{ "pose": "cobra",
"asana": "bhujangasana", "pdfPage": 97, "figures": [61] }` — or `null` with a
`note` when the book has nothing near it (Kapalbhati, the sit-up, Toe Stand
may be such). This is a reference LOOKUP for a later task: an agent will put
the page PNG (local, never copied into the repo) beside the mannequin's
preview contact sheet and refine the posture module's bone directions by
eye. The photograph itself is never reproduced — the mannequin is a tube
figure with no face, and the module holds numbers, not an image.
