"""
Self-test of the library's Python helpers (a `_` file: never exported or
previewed as a sheet). Plain Python, no bpy:

    python scripts/blender/library/_selftest.py            check (exit 1 on failure)
    python scripts/blender/library/_selftest.py --write    also rewrite the clash fixture

`scripts/library-helpers.test.mjs` runs the check, so `npm test` covers it.

1. `knee_on` — the valid case with hip → ankle along X and the height axis
   along it too (the circle square to the axis: every point at one height),
   the same off that height (infeasible: a warning, a point still on the
   circle), and hip → ankle along X with the height axis across it.
2. CROSS-LANGUAGE CLASH FIXTURES — a few poses, clean and colliding, whose
   clashes `_hull.clashes` finds; written to
   `src/rig/clearance-fixtures/clashes-from-python.json`, which
   `library.test.ts` holds `src/rig/clearance.ts` to (pairs and depths
   within 1 mm). The check here fails when the committed fixture no longer
   matches what the Python port computes.
"""
import contextlib
import importlib.util
import io
import json
import math
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
FIXTURE = ROOT / 'src' / 'rig' / 'clearance-fixtures' / 'clashes-from-python.json'


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


L = _load('_library_lib', HERE / '_lib.py')
H = L.H
FAILS = []


def expect(ok, what):
    if not ok:
        FAILS.append(what)


def knee_cases():
    hip, ankle = (0.0, 0.0, 0.0), (0.5, 0.0, 0.0)
    x = (L.THIGH ** 2 - L.SHIN ** 2 + 0.25) / 1.0
    r = math.sqrt(L.THIGH ** 2 - x * x)

    def on_both(k):
        return abs(L.dist(k, hip) - L.THIGH) < 1e-9 and abs(L.dist(k, ankle) - L.SHIN) < 1e-9

    # (a) valid, X-parallel: the circle is square to the X axis, all at x = 0.25
    err = io.StringIO()
    with contextlib.redirect_stderr(err):
        k = L.knee_on(hip, ankle, (1, 0, 0), 0.25, (0, 0, 1))
    expect(on_both(k), f'knee_on X-parallel: knee {k} not on both spheres')
    expect(abs(k[0] - 0.25) < 1e-9 and abs(k[2] - r) < 1e-9, f'knee_on X-parallel: {k} is not the top of the circle')
    expect(err.getvalue() == '', 'knee_on X-parallel: warned on a feasible height')
    # (b) infeasible: the same circle asked for a height it never has
    err = io.StringIO()
    with contextlib.redirect_stderr(err):
        k = L.knee_on(hip, ankle, (1, 0, 0), 0.4, (0, 1, 0))
    expect('reach warning' in err.getvalue(), 'knee_on infeasible: no warning')
    expect(on_both(k) and k[1] > r - 1e-9, f'knee_on infeasible: {k} not the circle point toward out')
    # (c) X-parallel, the height axis across it: the knee at z = 0.2 on the +Y side
    err = io.StringIO()
    with contextlib.redirect_stderr(err):
        k = L.knee_on(hip, ankle, (0, 0, 1), 0.2, (0, 1, 0))
    expect(on_both(k) and abs(k[2] - 0.2) < 1e-9 and k[1] > 0, f'knee_on across: {k}')
    expect(err.getvalue() == '', 'knee_on across: warned on a feasible height')


def _pose(path_id):
    mod = _load(f'_selftest_{path_id}', HERE / f'{path_id}.py')
    return mod


def cases():
    """Poses for the cross-language fixture: clean and deliberately colliding."""
    pad = _load('_selftest_padmasana', HERE / 'padmasana.py')
    naive = {'pelvis.location': (0, 0.05, -0.86), 'pelvis': (0, 0, 1), 'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1),
             'thigh.R': (-0.3297, -0.6251, 0.7075), 'shin.R': (0.7842, 0.3296, -0.5257), 'foot.R': (0.9535, 0.0953, 0.286),
             'thigh.L': (0.449, -0.6205, 0.643), 'shin.L': (-0.9035, 0.2796, -0.3248), 'foot.L': (-0.9535, 0.0953, 0.286)}
    crossed = {'upperarm.L': (0, -1, 0), 'forearm.L': (-0.8, -0.6, 0), 'hand.L': (-0.8, -0.6, 0),
               'upperarm.R': (0, -1, 0), 'forearm.R': (0.8, -0.6, 0), 'hand.R': (0.8, -0.6, 0)}
    return [
        ('rest', {}, False),
        ('padmasana lotus', pad.LOTUS, False),
        ('naive lotus', naive, False),
        # the head folded down through the trunk to the pelvis (not trunk neighbours)
        ('head through the pelvis', {'spine.upper': (0, 0.02, -1), 'neck': (0, 0, -1), 'head': (0, 0, -1)}, False),
        # a thigh swung across the body: its DISTAL part through the pelvis and the other hip
        ('distal thigh through the pelvis', {'thigh.L': (-1, 0, 0.05), 'shin.L': (-1, 0, 0.05), 'foot.L': (-1, 0, 0.3)}, False),
        # wrists crossed in front of the chest: tested even in a laced stage
        ('crossed wrists', crossed, False),
        ('crossed wrists, laced', crossed, True),
    ]


def compute():
    out = []
    for name, pose, laced in cases():
        cl = H.clashes(pose, tol=0.0, laced=laced)
        out.append({'case': name, 'laced': laced, 'pose': L_clean(pose),
                    'clashes': [[a, b, round(d, 5)] for a, b, d in cl if d > 0.001]})
    return out


def L_clean(pose):
    def c(v):
        if isinstance(v, dict):
            return {k: c(x) for k, x in v.items()}
        if isinstance(v, (tuple, list)):
            return [round(float(x), 6) for x in v]
        return v
    return {k: c(v) for k, v in pose.items()}


def main():
    knee_cases()
    data = compute()
    names = {d['case']: d for d in data}
    expect(names['rest']['clashes'] == [], 'rest pose clashes')
    expect(names['padmasana lotus']['clashes'] == [] or max(c[2] for c in names['padmasana lotus']['clashes']) <= 0.01,
           'the lotus clashes past the tolerance')
    for bad in ('naive lotus', 'head through the pelvis', 'distal thigh through the pelvis', 'crossed wrists', 'crossed wrists, laced'):
        expect(any(c[2] > 0.01 for c in names[bad]['clashes']), f'{bad}: no clash found')
    expect(any('crown' in (c[0] + c[1]) and 'pelvis' in (c[0] + c[1]) for c in names['head through the pelvis']['clashes']),
           'head through the pelvis: no crown/pelvis clash')
    own = ('pelvis', 'pelvis>waist', 'pelvis>hip.L', 'waist')
    expect(any('hip.L>knee.L' in (c[0], c[1]) and (c[0] in own or c[1] in own) for c in names['distal thigh through the pelvis']['clashes']),
           'distal thigh: no clash with its own pelvis pieces')
    expect(any('wrist' in c[0] and 'wrist' in c[1] for c in names['crossed wrists, laced']['clashes']),
           'crossed wrists, laced: the wrists were exempt')
    text = json.dumps(data, indent=1) + '\n'
    if '--write' in sys.argv:
        FIXTURE.parent.mkdir(parents=True, exist_ok=True)
        FIXTURE.write_text(text, encoding='utf-8', newline='\n')
        print(f'wrote {FIXTURE.relative_to(ROOT)}')
    elif not FIXTURE.is_file() or FIXTURE.read_text(encoding='utf-8') != text:
        FAILS.append(f'{FIXTURE.relative_to(ROOT)} is stale: rerun with --write')
    for f in FAILS:
        print(f'selftest FAIL: {f}', file=sys.stderr)
    print(f'selftest: {len(FAILS)} failures')
    sys.exit(1 if FAILS else 0)


if __name__ == '__main__':
    main()
