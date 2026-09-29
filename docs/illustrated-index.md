# Illustrated yoga reference index

This dataset makes the supplied illustrated selection searchable and gives future figure work a local photograph lookup. It stores bibliographic facts and independently written annotations. Images, OCR, technique prose, claimed benefits and cautions stay outside the repository.

## Source

B. K. S. Iyengar, *The Illustrated Light on Yoga*, HarperCollins Publishers India. The task specification identifies 2001; the supplied scan's copyright page (PDF 7) instead identifies the tenth impression as 2005 and the first Indian publication as 1997. These records describe that supplied scan without assigning it an unsupported publication year.

The local source directory is `C:/Users/rober/Downloads/yogapic-ocr/`. Its 179 numbered text/image pairs remain there. Printed page 1 begins at PDF page 18. The posture selection runs from printed pages 41–116; breathing entries start at 123. The appendix occupies 131–137, and the photograph table is on 139–140.

## Fields and scope

The index is an ordered array. It includes all 57 numbered posture entries, including Maha Mudra, followed by four numbered breathing entries. An additional unnumbered Dhyana record resolves the meditation references in the courses.

| Field | Meaning |
| --- | --- |
| sanskrit | Display spelling with scan-supported diacritics |
| romanised | Stable ASCII identifier; word breaks use hyphens |
| english | Short independently chosen lookup label |
| page / pdfPage | Printed entry-start page / one-based scan page |
| bookNumber | Number printed beside the entry; absent for Dhyana |
| kind | asana, pranayama or meditation |
| section | Printed part heading: Yogāsanas or Prāṇāyāma |
| figures | Photograph-table assignments, including intermediate forms |
| grade | Number printed with the entry heading; absent if unassigned |
| roots | Sanskrit components or eponym identified in the entry introduction |
| note | Missing facts, source inconsistencies or scope qualifications |

There is no invented Standing/Seated taxonomy. The source does not give those as separate grouping headings in this selection. Roots are ASCII words without definitions; an empty array means the entry supplies no separate name analysis. Previously explained components are not silently added to later entries.

Figure ranges are expanded into numbers. A photograph may belong to two entries: 94 illustrates both the headstand sequence and Urdhva Dandasana. The headstand heading has grade 4; its later unsupported-entry method is marked 8. The latter appears in a note rather than replacing the heading's grade.

The course array stores `steps` in source order. Each step has an `asana` id and its index entry's printed `page`. Course-level `sourcePage` and `sourcePdfPage` locate the appendix passage; `sourcePageEnd` marks continuations. Durations use seconds, with separate minimum/maximum keys for ranges. Counts, stages, days and week endpoints remain numeric. Seat alternatives are `postureOptions`, not extra consecutive exercises; simultaneous Viloma in Savasana is represented that way. The sun-salutation table includes its breath-phase sequence.

Repeat instructions are expanded and retain an `inherits` reference. Explicit alternate-day breathing is under `alternateSteps`. Source ambiguities remain visible: the week 21/23 conjunction, overlapping week endpoints, duplicated retained-breath block, the week-10 sitting ambiguity, and the broken week-23 prefix. That last course lists only its explicit continuation and has an `unresolvedPrefix`; it is not an executable complete routine. Source errors pairing Halasana with 115 and upward bow with 114 are documented without importing those incorrect numbers as photograph assignments.

The map has exactly one top-level record per app pose. `nearestAsana` preserves the classical note's identification, including null. `asana` names the chosen illustrated entry or is null when no useful shape was identified. Its `pdfPage` locates the actual selected photograph, which can differ from the index entry-start page. `additionalMatches` handles the second seated segment of head-to-knee/stretching. Editorial shape analogies and execution differences are described in each map note.

## Rebuilding

Start with the contents and photograph table. Locate each numbered entry in the external OCR, then inspect the PNG whenever columns, accents, numbering or grades are unclear. Read appendix continuations across page boundaries; OCR misses entire lines on several course pages. Enter only names, counts, identifiers and other facts. Write all explanatory text independently.

Compare each classical note's nearest name, optional numerical reference and every before/beyond item. Keep edition numbering separate from anatomical equivalence. The companion cross-check reports these comparisons without changing existing notes.

The external progress note is `illustrated-progress-846323ab2403.txt`. The external originality checker is `illustrated-originality-gate-846323ab2403.py`. It normalizes case and punctuation and compares every eight-word window in all six deliverables against each OCR page. It reports counts without reproducing matched source passages.

From the repository root, a subsequent authorized verification run can use:

```powershell
python C:/Users/rober/Downloads/yogapic-ocr/illustrated-originality-gate-846323ab2403.py .
npx vitest run src/data/classical
npx tsc -b
```

After any wording changes, repeat the gate. Paste the actual count output below and rerun against the resulting documentation too. A zero result is required before claiming the originality check passed.

## Originality gate

Execution status: NOT RUN.

The outer subagent instruction prohibits verification commands and requires exit immediately after writing the artifacts and runner result. Therefore the checker was prepared outside the repository but not executed. No zero-hit result is claimed and no fabricated output is supplied.

## Validation status

The Vitest contract tests were authored. `npx vitest run src/data/classical` and `npx tsc -b` were not run under the same instruction. These checks, the originality gate, and its recorded output remain pending. Existing source files were left untouched.
