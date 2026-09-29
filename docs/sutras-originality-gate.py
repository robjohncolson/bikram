"""Count source overlaps without displaying any matching passages."""
from pathlib import Path
import argparse
import json
import re
import unicodedata

FILES = (
    "src/data/classical/sutras-index.json",
    "src/data/classical/sutras-brief.md",
    "src/data/classical/sutras-index.test.ts",
    "src/coach/prompt.ts",
    "src/coach/prompt.test.ts",
    "docs/sutras-index.md",
    "docs/sutras-originality-gate.py",
)


def words(text):
    folded = unicodedata.normalize("NFKC", text).lower()
    return re.sub(r"[^\w\s]", "", folded).replace("_", "").split()


def windows(tokens):
    return (tuple(tokens[i:i + 8]) for i in range(len(tokens) - 7))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", type=Path)
    parser.add_argument("--scratch", type=Path,
                        default=Path("C:/Users/rober/Downloads/yoga-ocr"))
    parser.add_argument("--pdf", type=Path,
                        default=Path("C:/Users/rober/Downloads/yoga.pdf"))
    parser.add_argument("--extract", action="store_true")
    args = parser.parse_args()
    repo = args.repo.resolve()
    scratch = args.scratch.resolve()
    if scratch == repo or scratch.is_relative_to(repo):
        raise SystemExit("Source scratch must stay outside the repository")
    if args.extract:
        from pypdf import PdfReader
        reader = PdfReader(args.pdf)
        if len(reader.pages) != 388:
            raise SystemExit("Unexpected source length")
        scratch.mkdir(parents=True, exist_ok=True)
        for n, page in enumerate(reader.pages, 1):
            (scratch / f"page-{n:03}.txt").write_text(
                page.extract_text(), encoding="utf-8")
    sources = [scratch / f"page-{n:03}.txt" for n in range(1, 389)]
    if any(not page.is_file() for page in sources):
        raise SystemExit("Need the complete 388-page external extraction")
    corpus = set()
    for page in sources:
        corpus.update(windows(words(page.read_text(encoding="utf-8-sig"))))

    total = 0
    bad_sanskrit = []
    for relative in FILES:
        path = repo / relative
        text = path.read_text(encoding="utf-8-sig")
        if relative.endswith("sutras-index.json"):
            records = json.loads(text)
            if len(records) != 196:
                raise SystemExit("Unexpected sutra count")
            for record in records:
                value = record.pop("sanskrit")
                if (
                    not isinstance(value, str)
                    or not re.fullmatch(r"[A-Za-z]+(?:[ -][A-Za-z]+)*", value)
                    or re.search(
                        r"\b(?:the|and|of|with|which|consciousness|knowledge|meditation)\b",
                        value, re.I,
                    )
                ):
                    bad_sanskrit.append(record["id"])
            text = json.dumps(records, ensure_ascii=False)
        hits = sum(window in corpus for window in windows(words(text)))
        total += hits
        print(f"{relative}: {hits} matches")
    print(f"TOTAL: {total} matches; {len(FILES)} files; {len(sources)} source pages")
    print(f"SANSKRIT SCREEN: 196 fields; {len(bad_sanskrit)} flagged")
    if bad_sanskrit:
        print("Flagged identifiers: " + ", ".join(bad_sanskrit))
    print("Language identification also requires comparison with the source headings.")
    return 1 if total or bad_sanskrit else 0


if __name__ == "__main__":
    raise SystemExit(main())
