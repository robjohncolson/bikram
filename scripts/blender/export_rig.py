"""
Export the authored posture and bridge modules as JSON for the live
three.js figure (`src/rig/`, `src/components/FigureRig.tsx`).

Plain Python — NO bpy: run with the system interpreter from the repo root,

    python scripts/blender/export_rig.py        (npm run rig:export)

It imports every module in `postures/` and `bridges/` (skipping `_*.py`
helpers, exactly as `render_motion.py` does), and writes

    src/data/rig/<file_stem>.json   one per module: the stages as authored
    src/data/rig/skeleton.json      the rig tables (joints, bones, radii…)
    src/data/rig/library/<id>.json  the posture library (`library/`, live figure
                                    only: a subfolder, so RIG_LIVE's `./*.json`
                                    glob never sees it)

The rig tables below are COPIED from `render_motion.py` (which imports bpy
and so cannot be imported here). `src/rig/skeleton.test.ts` compares the
TypeScript constants with this copy (`skeleton.json`) AND with
`src/rig/fixtures/skeleton-from-blender.json`, which
`export_fixtures.py` writes from inside Blender out of render_motion.py's
own tables — so a drift in either copy fails a test once both exports are
rerun.
Rerun after editing any posture or bridge module.
"""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
POSTURES_DIR = HERE / 'postures'
BRIDGES_DIR = HERE / 'bridges'
MODULE_DIRS = (POSTURES_DIR, BRIDGES_DIR)
LIBRARY_DIR = HERE / 'library'
POSITIONS = ('standing', 'supine', 'prone', 'kneeling', 'seated')
OUT_DIR = ROOT / 'src' / 'data' / 'rig'
LIBRARY_OUT = OUT_DIR / 'library'

# --- copied from render_motion.py (keep in sync; skeleton.test.ts compares this
# copy and the TS rig with skeleton-from-blender.json, written inside Blender) ----
FPS = 12
BIG_TURN_DEG = 150.0

J = {
    'pelvis': (0, 0, 1.00),
    'waist': (0, 0, 1.12),
    'chest': (0, 0, 1.27),
    'neck': (0, 0, 1.40),
    'head': (0, 0, 1.52),
    'crown': (0, 0, 1.72),
    'shoulder.L': (0.20, 0, 1.44), 'shoulder.R': (-0.20, 0, 1.44),
    'elbow.L': (0.22, 0, 1.15), 'elbow.R': (-0.22, 0, 1.15),
    'wrist.L': (0.23, 0, 0.90), 'wrist.R': (-0.23, 0, 0.90),
    'fingers.L': (0.23, 0, 0.80), 'fingers.R': (-0.23, 0, 0.80),
    'hip.L': (0.10, 0, 0.98), 'hip.R': (-0.10, 0, 0.98),
    'knee.L': (0.10, 0, 0.54), 'knee.R': (-0.10, 0, 0.54),
    'ankle.L': (0.10, 0, 0.10), 'ankle.R': (-0.10, 0, 0.10),
    'toes.L': (0.10, -0.16, 0.02), 'toes.R': (-0.10, -0.16, 0.02),
}

BONES = [
    ('pelvis', 'pelvis', 'waist', None),
    ('spine.lower', 'waist', 'chest', 'pelvis'),
    ('spine.upper', 'chest', 'neck', 'spine.lower'),
    ('neck', 'neck', 'head', 'spine.upper'),
    ('head', 'head', 'crown', 'neck'),
    ('clavicle.L', 'neck', 'shoulder.L', 'spine.upper'),
    ('clavicle.R', 'neck', 'shoulder.R', 'spine.upper'),
    ('upperarm.L', 'shoulder.L', 'elbow.L', 'clavicle.L'),
    ('upperarm.R', 'shoulder.R', 'elbow.R', 'clavicle.R'),
    ('forearm.L', 'elbow.L', 'wrist.L', 'upperarm.L'),
    ('forearm.R', 'elbow.R', 'wrist.R', 'upperarm.R'),
    ('hand.L', 'wrist.L', 'fingers.L', 'forearm.L'),
    ('hand.R', 'wrist.R', 'fingers.R', 'forearm.R'),
    ('hipbone.L', 'pelvis', 'hip.L', 'pelvis'),
    ('hipbone.R', 'pelvis', 'hip.R', 'pelvis'),
    ('thigh.L', 'hip.L', 'knee.L', 'hipbone.L'),
    ('thigh.R', 'hip.R', 'knee.R', 'hipbone.R'),
    ('shin.L', 'knee.L', 'ankle.L', 'thigh.L'),
    ('shin.R', 'knee.R', 'ankle.R', 'thigh.R'),
    ('foot.L', 'ankle.L', 'toes.L', 'shin.L'),
    ('foot.R', 'ankle.R', 'toes.R', 'shin.R'),
]

RADIUS = {
    'pelvis': (0.14, 0.10), 'waist': (0.11, 0.09), 'chest': (0.15, 0.10),
    'neck': (0.05, 0.05), 'head': (0.09, 0.10), 'crown': (0.07, 0.08),
    'shoulder': (0.06, 0.06), 'elbow': (0.045, 0.045), 'wrist': (0.035, 0.035),
    'fingers': (0.03, 0.02), 'palm': (0.05, 0.035),
    'hip': (0.085, 0.085), 'knee': (0.06, 0.06), 'ankle': (0.045, 0.045),
    'toes': (0.04, 0.025), 'ball': (0.045, 0.03), 'heel': (0.038, 0.038),
}

SKIN_EXTRA = {
    'palm.L': ((0.23, 0, 0.865), 'wrist.L', 'fingers.L', 'hand.L'),
    'palm.R': ((-0.23, 0, 0.865), 'wrist.R', 'fingers.R', 'hand.R'),
    'ball.L': ((0.10, -0.11, 0.035), 'ankle.L', 'toes.L', 'foot.L'),
    'ball.R': ((-0.10, -0.11, 0.035), 'ankle.R', 'toes.R', 'foot.R'),
    'heel.L': ((0.10, 0.035, 0.045), 'ankle.L', None, 'foot.L'),
    'heel.R': ((-0.10, 0.035, 0.045), 'ankle.R', None, 'foot.R'),
}

VERTEX_BONE = {
    'pelvis': 'pelvis', 'waist': 'spine.lower', 'chest': 'spine.upper',
    'neck': 'neck', 'head': 'head', 'crown': 'head',
    'shoulder.L': 'upperarm.L', 'shoulder.R': 'upperarm.R',
    'elbow.L': 'forearm.L', 'elbow.R': 'forearm.R',
    'wrist.L': 'hand.L', 'wrist.R': 'hand.R',
    'fingers.L': 'hand.L', 'fingers.R': 'hand.R',
    'hip.L': 'thigh.L', 'hip.R': 'thigh.R',
    'knee.L': 'shin.L', 'knee.R': 'shin.R',
    'ankle.L': 'foot.L', 'ankle.R': 'foot.R',
    'toes.L': 'foot.L', 'toes.R': 'foot.R',
}

VIEWS = {'front': 0.0, 'quarter': -35.0, 'side': -90.0, 'quarter-back': -145.0, 'back': 180.0}
# --- end of the copy ----------------------------------------------------------


def module_files() -> list[Path]:
    """Every exported module: postures, then bridges (`_*.py` are helpers)."""
    return [p for d in MODULE_DIRS if d.exists() for p in sorted(d.glob('*.py')) if not p.name.startswith('_')]


def library_files() -> list[Path]:
    """The posture library's sheets (`_lib.py` is their shared helper)."""
    return sorted(p for p in LIBRARY_DIR.glob('*.py') if not p.name.startswith('_')) if LIBRARY_DIR.exists() else []


def module_id(path: Path) -> str:
    """`toe_stand.py` → `toe-stand`, `bridges/supine_prone.py` → `bridge:supine-prone`,
    `library/halasana.py` → `library:halasana` (copied from render_motion.py)."""
    stem = path.stem.replace('_', '-')
    if path.parent == LIBRARY_DIR:
        return f'library:{stem}'
    return f'bridge:{stem}' if path.parent == BRIDGES_DIR else stem


def file_stem(pose_id: str) -> str:
    """`bridge:supine-prone` → `bridge.supine-prone` (no colons in Windows
    file names; copied from render_motion.py)."""
    return pose_id.replace(':', '.')


def load_posture(path: Path) -> dict:
    spec = importlib.util.spec_from_file_location(path.stem, path)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    return mod.POSTURE


def posture_position(posture: dict) -> dict:
    """The module's `position`, validated like render_motion.py does."""
    pos = posture.get('position') or {}
    for k in ('start', 'end'):
        if pos.get(k) not in POSITIONS:
            raise ValueError(f"{posture['id']}: position {k} must be one of {POSITIONS}, got {pos.get(k)!r}")
    return {'start': pos['start'], 'end': pos['end']}


def clean(v):
    """JSON-ready copy: tuples → lists, floats rounded to 6 decimals, dict
    key order kept (the module's own order)."""
    if isinstance(v, dict):
        return {k: clean(x) for k, x in v.items()}
    if isinstance(v, (list, tuple)):
        return [clean(x) for x in v]
    if isinstance(v, bool):
        return v
    if isinstance(v, float):
        r = round(v, 6)
        return 0.0 if r == 0 else r
    return v


def export_module(path: Path) -> dict:
    posture = load_posture(path)
    pid = posture['id']
    if pid != module_id(path):
        raise ValueError(f'{path.name}: id {pid!r} does not match its file ({module_id(path)!r})')
    out = {
        'id': pid,
        'view': posture.get('view', 'front'),
        # the renderer's defaults (stage_frame) folded in, so the app never guesses
        'frame': clean({'center_z': 0.9, 'scale': 2.0, **posture.get('frame', {})}),
        'position': posture_position(posture),
        'transition': posture.get('transition', 6),
        'stages': [],
    }
    for st in posture['stages']:
        s = {'label': st['label'], 'hold': st.get('hold', 4)}
        for k in ('view', 'frame'):
            if k in st:
                s[k] = clean(st[k])
        s['pose'] = clean(st['pose'])
        for k in ('guides', 'ghost', 'notice', 'palms'):
            if st.get(k):
                s[k] = clean(st[k])
        out['stages'].append(s)
    return out


def skeleton() -> dict:
    return clean({
        'J': J,
        'BONES': [[n, h, t, p] for n, h, t, p in BONES],
        'RADIUS': RADIUS,
        'SKIN_EXTRA': {k: [pos, a, b, bone] for k, (pos, a, b, bone) in SKIN_EXTRA.items()},
        'VERTEX_BONE': VERTEX_BONE,
        'VIEWS': VIEWS,
        'BIG_TURN_DEG': BIG_TURN_DEG,
        'FPS': FPS,
    })


def dump(v, depth: int = 0) -> str:
    """Indented JSON with every leaf-only list or small dict on one line
    (a bone entry reads as `"thigh.L": [-0.09, 0, -1]`), so diffs stay
    readable when a posture is re-authored."""
    pad = '  ' * (depth + 1)
    if isinstance(v, list):
        if all(not isinstance(x, (list, dict)) for x in v):
            return json.dumps(v, ensure_ascii=False)
        return '[\n' + ',\n'.join(pad + dump(x, depth + 1) for x in v) + '\n' + '  ' * depth + ']'
    if isinstance(v, dict):
        flat = all(not isinstance(x, (dict, list)) or (isinstance(x, list) and all(not isinstance(y, (list, dict)) for y in x))
                   for x in v.values())
        if flat and len(v) <= 4 and all(not isinstance(x, list) for x in v.values()) or flat and 'dir' in v:
            return json.dumps(v, ensure_ascii=False, separators=(', ', ': '))
        items = [f'{pad}{json.dumps(k, ensure_ascii=False)}: {dump(x, depth + 1)}' for k, x in v.items()]
        return '{\n' + ',\n'.join(items) + '\n' + '  ' * depth + '}'
    return json.dumps(v, ensure_ascii=False)


def write(path: Path, data: dict) -> None:
    path.write_text(dump(data) + '\n', encoding='utf-8', newline='\n')


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    files = module_files()
    if not files:
        sys.exit('no posture modules found')
    written = set()
    for p in files:
        data = export_module(p)
        name = f"{file_stem(data['id'])}.json"
        write(OUT_DIR / name, data)
        written.add(name)
    write(OUT_DIR / 'skeleton.json', skeleton())
    written.add('skeleton.json')
    # a deleted module must not leave a stale JSON behind
    for old in OUT_DIR.glob('*.json'):
        if old.name not in written:
            old.unlink()
    # the library: `library:<id>` → library/<id>.json
    lib = library_files()
    LIBRARY_OUT.mkdir(parents=True, exist_ok=True)
    kept = set()
    for p in lib:
        data = export_module(p)
        name = f"{data['id'].split(':', 1)[1]}.json"
        write(LIBRARY_OUT / name, data)
        kept.add(name)
    for old in LIBRARY_OUT.glob('*.json'):
        if old.name not in kept:
            old.unlink()
    print(f'rig data -> {OUT_DIR.relative_to(ROOT)} ({len(files)} modules + skeleton, {len(lib)} library sheets)')


if __name__ == '__main__':
    main()
