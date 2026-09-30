"""Originality gate for the posture library: count 8-word overlaps with the
two local book extractions, never printing a matched passage.

    python scripts/library-originality-gate.py            (from the repo root)

Every text file the working tree adds or changes (`git status --porcelain
-uall`: content, rig modules, views, styles, generated JSON, docs, this
script), plus the library specs and the two living docs that carry library
prose (CLAUDE.md, CONTINUATION_PROMPT.md) whether or not they changed, is folded like the earlier gates (NFKC, lower case, punctuation
dropped) and every window of eight consecutive words is looked up among
the windows of every extracted page of BOTH books:

    C:/Users/rober/Downloads/yogapic-ocr/page-*.txt   The Illustrated Light on Yoga
    C:/Users/rober/Downloads/yoga-ocr/page-*.txt      Light on the Yoga Sutras

The corpora stay outside the repository (the script refuses a corpus path
inside it). Exit status 1 on any match. Logic only: no source text lives here.
"""
from pathlib import Path
import argparse
import re
import subprocess
import sys
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
CORPORA = (
    Path('C:/Users/rober/Downloads/yogapic-ocr'),
    Path('C:/Users/rober/Downloads/yoga-ocr'),
)
TEXT = {'.ts', '.tsx', '.css', '.md', '.py', '.json', '.mjs', '.js', '.html', '.txt'}
ALWAYS = ('docs/library-inversions-spec.md', 'docs/library-lotus-rig-spec.md', 'CLAUDE.md', 'CONTINUATION_PROMPT.md')
WINDOW = 8


def words(text):
    folded = unicodedata.normalize('NFKC', text).lower()
    return re.sub(r'[^\w\s]', '', folded).replace('_', '').split()


def windows(tokens):
    return (tuple(tokens[i:i + WINDOW]) for i in range(len(tokens) - WINDOW + 1))


def changed_files(repo):
    """Added, modified and untracked text files, from git itself (so nothing
    new can be left off a hand-kept list)."""
    out = subprocess.run(['git', 'status', '--porcelain', '-uall'], cwd=repo, capture_output=True,
                         text=True, encoding='utf-8', check=True).stdout
    for line in out.splitlines():
        code, path = line[:2], line[3:].strip().strip('"')
        if ' -> ' in path:
            path = path.split(' -> ', 1)[1]
        if 'D' in code:
            continue
        p = repo / path
        if p.is_file() and p.suffix.lower() in TEXT:
            yield p


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--repo', type=Path, default=ROOT)
    args = parser.parse_args()
    repo = args.repo.resolve()
    corpus = set()
    pages = 0
    for d in CORPORA:
        d = d.resolve()
        if d == repo or d.is_relative_to(repo):
            raise SystemExit(f'refusing a corpus inside the repository: {d}')
        found = sorted(d.glob('page-*.txt'))
        if not found:
            raise SystemExit(f'no extracted pages in {d}')
        for page in found:
            corpus.update(windows(words(page.read_text(encoding='utf-8-sig', errors='replace'))))
        pages += len(found)
        print(f'corpus {d}: {len(found)} pages')

    files = sorted(set(changed_files(repo)) | {repo / f for f in ALWAYS if (repo / f).is_file()})
    total = 0
    for path in files:
        tokens = words(path.read_text(encoding='utf-8-sig'))
        hits = sum(w in corpus for w in windows(tokens))
        total += hits
        print(f'{path.relative_to(repo).as_posix()}: {hits} matches')
    print(f'TOTAL: {total} matches; {len(files)} files; {pages} source pages; {WINDOW}-word windows')
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())
