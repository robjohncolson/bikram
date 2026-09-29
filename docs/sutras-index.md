# Sutra reference and coaching context

This index links 196 numbered sutras to the supplied edition. Its short topics are navigation aids written for this application. The accompanying brief provides context for coaching; it is not a translation.

## Source and boundaries

B. K. S. Iyengar, *Light on the Yoga Sutras of Patanjali*, Thorsons. The publication leaf identifies this edition as 2002, with ISBN 978-0-00-714516-4. The supplied file is `C:/Users/rober/Downloads/yoga.pdf`, containing 388 PDF pages.

Only the ancient Sanskrit text and bibliographic facts are transcribed. The English topics and practice brief were composed for this project. Neither the author's translations nor his explanations are included. The Sanskrit values contain romanized sutra text, without definitions, translations, or commentary. A topic describing a traditional power identifies the text's subject; it does not assert that power as an established fact.

The sequence uses 51 entries in chapter I, 55 in II, 56 in III, and 34 in IV. In particular, III.22 is retained in this edition's numbering. References to other editions must account for numbering differences.

## Record fields

| Field | Purpose |
| --- | --- |
| id | Roman chapter label followed by the sutra number |
| pada | Chapter number, from 1 through 4 |
| n | Position within that chapter |
| sanskrit | ASCII transliteration of the numbered Sanskrit heading |
| topic | Independently composed label of three to eight words |
| page | Printed page on which the numbered treatment starts |
| pdfPage | Corresponding PDF page, counted from one |
| theme | One value from the vocabulary below |

The fixed theme vocabulary is `samadhi`, `limbs`, `yama-niyama`, `asana`, `pranayama`, `pratyahara`, `dharana`, `dhyana`, `kleshas`, `karma`, `siddhis`, `kaivalya`, and `other`. These are editorial lookup categories, not headings taken from the book. A sutra can concern several subjects; its record selects one.

The printed and PDF page numbers differ by 22 throughout these treatments. Chapter openings are I.1 at 48/70, II.1 at 108/130, III.1 at 178/200, and IV.1 at 246/268. II.46 begins at 157/179: the specification's example value of 149 is not its location in this copy. IV.34 begins at 283/305.

## Rebuilding the data

Use Python 3.13 and pypdf to extract the supplied PDF into `C:/Users/rober/Downloads/yoga-ocr/page-NNN.txt`. All 388 page texts were extracted there during authoring. No extracted page text or source image belongs in this repository.

Read the numbered treatments in order and record their starting pages. Transcribe the romanized headings, discard accent marks, and retain printed word boundaries and compound spelling. Join wrapped heading lines with spaces. Write the English topics separately, using the sutra's subject rather than recasting the adjacent English rendering.

The text layer contains recognition errors despite being extractable. For example, some Roman numerals become digits, accented vowels become unrelated letters, and a few pale headings disappear. Page crops made with PyMuPDF were read where needed; they remain in the external scratch directory as `heading-source-*.png`, `heading-extra-*.png`, and `heading-final.png`. Use the image when extraction and the printed heading disagree. The alphabetical appendix is a locator, not a replacement for the treatment's word spacing.

The brief cites each paragraph's sources, including chapter-local ranges. It covers the ordered limbs, posture, breath, sensory withdrawal, affliction, practice, and nonattachment. The coach imports the Markdown through Vite's raw loader and appends it after the posture data, with explicit permission to cite sutra identifiers and an instruction separating tradition from physiology.

## Originality and Sanskrit review

`docs/sutras-originality-gate.py` follows the illustrated index checker: Unicode normalization, lowercase, punctuation removal, and comparisons of eight consecutive words against every external page. It checks all seven application/documentation files produced or edited for this task, including its own code and the complete coach prompt. Only the JSON records' `sanskrit` fields are removed from comparison. Runner state is not a content deliverable.

The Sanskrit was transcribed from the numbered Sanskrit headings, with damaged readings resolved from page images. No English glosses were intentionally entered. Review the field separately against those headings before accepting the dataset: the machine screen enforces ASCII transliteration shape and flags common English contamination, but a character pattern is not proof of language or source fidelity. Ordinary English homographs are not a useful language test for isolated Sanskrit tokens.

For an authorized verification run, execute from the repository root:

```powershell
py -3.13 docs/sutras-originality-gate.py . --extract
npx vitest run src/data/classical src/coach
npx tsc -b
```

The extraction option refreshes the external texts using pypdf. Without that option the checker reads the existing extraction. It prints counts and identifiers, never matched passages. Correct any non-Sanskrit match before accepting the work. Paste actual output below, then rerun the checker so that the updated documentation is covered too.

### Gate output

NOT RUN. The outer subagent instruction forbids verification commands and requires exit after applying the changes and writing the result. No zero-match result is claimed. Automated screening and final Sanskrit source review remain pending.

### Build and test results

- `npx vitest run src/data/classical src/coach`: NOT RUN under that instruction.
- `npx tsc -b`: NOT RUN under that instruction.

The authored tests cover complete numbering, uniqueness, ordering, both page systems, themes, label lengths, transliteration shape, the brief's length, citation ranges, and coach integration. Acceptance remains pending until the originality gate, Sanskrit review, tests, and TypeScript build have been completed.
