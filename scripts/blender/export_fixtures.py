"""
Parity fixtures for the TypeScript rig (`src/rig/`): Blender's own joint
positions for a handful of poses, so `src/rig/pose.test.ts` can check that
`applyStage` + `solve` (and `blend`) reproduce the renderer exactly.

Runs INSIDE Blender, from the repo root:

    C:/Tools/blender-5.2.1-windows-x64/blender.exe -b --python scripts/blender/export_fixtures.py

It reuses `render_motion.py`'s own posing functions (imported by path — it
is a Blender script) so the fixtures are the renderer's truth, not a
re-implementation. Writes `src/rig/fixtures/<case>.json`: every bone's
world HEAD and TAIL (pose space = world: the rig object sits at the
origin), rounded to 5 decimals. It also writes
`src/rig/fixtures/skeleton-from-blender.json`, the rig tables exactly as
render_motion.py holds them, so `skeleton.test.ts` checks the TS rig (and
export_rig.py's copy) against the real thing. Rerun only when the rig or
a fixture posture changes; commit the output.
"""
import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / 'src' / 'rig' / 'fixtures'

_spec = importlib.util.spec_from_file_location('render_motion', HERE / 'render_motion.py')
rm = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(rm)


def posture(pid: str) -> dict:
    return rm.load_posture(rm.module_path(pid))


def stage_of(p: dict, label: str) -> tuple[int, dict]:
    for i, st in enumerate(p['stages']):
        if st['label'] == label:
            return i, st
    raise KeyError(f"{p['id']}: no stage {label!r}")


def snapshot(rig) -> dict:
    return {
        pb.name: {
            'head': [round(c, 5) for c in pb.head],
            'tail': [round(c, 5) for c in pb.tail],
        }
        for pb in rig.pose.bones
    }


def write(name: str, meta: dict, rig) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    data = {'case': name, **meta, 'bones': snapshot(rig)}
    (OUT / f'{name}.json').write_text(json.dumps(data, indent=1) + '\n', encoding='utf-8', newline='\n')
    print(f'   fixture {name}')


def write_skeleton() -> None:
    """render_motion.py's own rig tables, JSON-shaped like export_rig.py's copy."""
    OUT.mkdir(parents=True, exist_ok=True)
    data = {
        'J': {k: list(v) for k, v in rm.J.items()},
        'BONES': [[n, h, t, p] for n, h, t, p in rm.BONES],
        'RADIUS': {k: list(v) for k, v in rm.RADIUS.items()},
        'SKIN_EXTRA': {k: [list(pos), a, b, bone] for k, (pos, a, b, bone) in rm.SKIN_EXTRA.items()},
        'VERTEX_BONE': dict(rm.VERTEX_BONE),
        'VIEWS': dict(rm.VIEWS),
        'BIG_TURN_DEG': rm.BIG_TURN_DEG,
        'FPS': rm.FPS,
    }
    (OUT / 'skeleton-from-blender.json').write_text(json.dumps(data, indent=1) + '\n', encoding='utf-8', newline='\n')
    print('   skeleton-from-blender')


def main() -> None:
    write_skeleton()
    rm.reset_scene()
    rig = rm.build_armature()
    rest = rm.rest_directions()

    held = [
        ('half-moon', 'Stand'),
        ('half-moon', 'Arms up'),
        ('half-moon', 'Right side'),
        ('half-moon', 'Hands to feet'),
        ('spine-twisting', 'Right side'),
        ('savasana', 'Stillness'),
        ('cobra', 'Lift'),
        ('camel', 'Kneel'),
    ]
    for pid, label in held:
        p = posture(pid)
        i, st = stage_of(p, label)
        rm.apply_stage(rig, st['pose'], rest)
        name = f"{rm.file_stem(pid)}--{label.lower().replace(' ', '-')}"
        write(name, {'kind': 'stage', 'id': pid, 'stage': i, 'label': label}, rig)

    # the ghost: the stage pose with the mistake's bones laid over it
    p = posture('half-moon')
    i, st = stage_of(p, 'Right side')
    rm.apply_stage(rig, rm.ghost_pose(st), rest)
    write('half-moon--right-side--ghost', {'kind': 'ghost', 'id': 'half-moon', 'stage': i, 'label': 'Right side'}, rig)

    # in-betweens, eased exactly as build_timeline eases them
    blends = [
        ('half-moon', 'Arms up', 'Right side', (0.25, 0.5, 0.75)),
        ('half-moon', 'Stand', 'Arms up', (0.5,)),              # a >150° arm turn: the steered midpoint
        ('spine-twisting', 'Hand behind', 'Right side', (0.5,)),  # rolls riding through a blend
        ('bridge:supine-prone', 'Lie on the back', 'Roll to the side', (0.5,)),
    ]
    for pid, la, lb, ss in blends:
        p = posture(pid)
        ia, sa = stage_of(p, la)
        ib, sb = stage_of(p, lb)
        rm.apply_stage(rig, sa['pose'], rest)
        pose_a = rm.capture_pose(rig)
        rm.apply_stage(rig, sb['pose'], rest)
        pose_b = rm.capture_pose(rig)
        mids = rm.steered_midpoints(rig, pose_a, pose_b)
        for s in ss:
            rm.inbetween(rig, pose_a, pose_b, mids, rm.smoothstep(s))
            name = f"{rm.file_stem(pid)}--{la.lower().replace(' ', '-')}--{lb.lower().replace(' ', '-')}--{int(s * 100):02d}"
            write(name, {
                'kind': 'inbetween', 'id': pid, 'from': ia, 'to': ib, 's': s,
                'eased': rm.smoothstep(s), 'steered': sorted(mids),
            }, rig)


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
