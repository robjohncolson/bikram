"""
The subdivided skin's own cross-sections at each joint — the ground truth
for `SKIN_FIT` in `src/rig/body.ts` (the live figure's body is built from
these, because the sprite sheets draw the skin AFTER its subdivision
surface, which is not the skin radii).

Runs INSIDE Blender, from the repo root:

    C:/Tools/blender-5.2.1-windows-x64/blender.exe -b --python scripts/blender/measure_skin_fit.py

It builds the mannequin with `render_motion.py`'s own `build_armature` +
`build_body` (imported by path), evaluates the Skin + Subdivision stack in
the REST pose, and sections the evaluated mesh with a plane through every
joint stem (the .L side), perpendicular to the limb there, and measures
the ring around the limb's axis (the loop whose centre is nearest it) about
its own centre: half-extent across the body (world X) and front–back (world
Y) — for the foot's vertices, which lie along Y, across and sole thickness
(world Z). Each stem has a RULE (`rules()`): `at` = the ring through the
joint; `cap` = a leaf, which ends AT its vertex, takes the widest ring over
its end cap; `round` = the ankle, whose ring through the joint still
carries the heel's bulge, takes the first round ring up the shin;
`separate` = a limb root merged into the torso (shoulder, hip)
takes the first ring down the limb that stands clear of it; `base` = the
neck, merged into the shoulders at its joint, takes the first ring up that
is no wider than the chest (the base of the neck, where the shoulders'
slope comes in to the torso's width); `buried` = the heel spur, inside the
foot's hull, keeps its skin radius rounded in by subdivision's ~8 %. Written,
rounded to 4 decimals with its rule, to
`src/rig/fixtures/skin-fit-from-blender.json`; `src/rig/body.test.ts` holds
`SKIN_FIT` to it. Rerun when `RADIUS`, `J`, `SKIN_EXTRA` or the modifier
stack changes; commit the output.
"""
import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / 'src' / 'rig' / 'fixtures' / 'skin-fit-from-blender.json'

_spec = importlib.util.spec_from_file_location('render_motion', HERE / 'render_motion.py')
rm = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(rm)

import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

FOOT = ('toes', 'ball', 'heel')


def evaluated_mesh():
    rm.reset_scene()
    rig = rm.build_armature()
    body = rm.build_body(rig)
    bpy.context.view_layer.update()
    ev = body.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = ev.to_mesh()
    verts = [body.matrix_world @ v.co for v in mesh.vertices]
    faces = [list(f.vertices) for f in mesh.polygons]
    ev.to_mesh_clear()
    return verts, faces


def section(verts, faces, origin, normal):
    """Loops (lists of points) where the plane (origin, normal) cuts the mesh, joined through shared faces."""
    parent = {}

    def find(a):
        parent.setdefault(a, a)
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    pts = {}
    for f in faces:
        hits = []
        for i in range(len(f)):
            a, b = f[i], f[(i + 1) % len(f)]
            da = (verts[a] - origin).dot(normal)
            db = (verts[b] - origin).dot(normal)
            if (da <= 0 < db) or (db <= 0 < da):
                key = (min(a, b), max(a, b))
                t = da / (da - db)
                pts[key] = verts[a] + (verts[b] - verts[a]) * t
                hits.append(key)
        for k in hits[1:]:
            ra, rb = find(hits[0]), find(k)
            if ra != rb:
                parent[ra] = rb
    loops = {}
    for k, p in pts.items():
        loops.setdefault(find(k), []).append(p)
    return list(loops.values())


def half_extents(loop, ax1, ax2):
    a = [p.dot(ax1) for p in loop]
    b = [p.dot(ax2) for p in loop]
    return (max(a) - min(a)) / 2, (max(b) - min(b)) / 2, ((max(a) + min(a)) / 2, (max(b) + min(b)) / 2)


def cross_axes(stem, normal):
    ax1 = Vector((1, 0, 0))
    ax2 = Vector((0, 0, 1)) if stem in FOOT else Vector((0, 1, 0))
    ax1 = (ax1 - normal * ax1.dot(normal)).normalized()
    ax2 = (ax2 - normal * ax2.dot(normal) - ax1 * ax2.dot(ax1)).normalized()
    return ax1, ax2


def ring(verts, faces, stem, origin, normal):
    """The loop around the plane's axis point (the one whose centre is nearest it): (h1, h2, off-axis distance)."""
    ax1, ax2 = cross_axes(stem, normal)
    loops = section(verts, faces, origin, normal)
    if not loops:
        return None
    o = (origin.dot(ax1), origin.dot(ax2))
    best = None
    for lp in loops:
        h1, h2, c = half_extents(lp, ax1, ax2)
        d = ((c[0] - o[0]) ** 2 + (c[1] - o[1]) ** 2) ** 0.5
        if best is None or d < best[2]:
            best = (h1, h2, d)
    return best


STEP = 0.005
SEPARATE = 0.012   # a ring is the limb's own once its centre is this close to the limb's axis


def measure(verts, faces, stem, at, normal, rule, limit=None):
    """One stem's fitted section by its rule (see RULES)."""
    rx, ry = rm.RADIUS[stem]
    if rule == 'at':
        h1, h2, _ = ring(verts, faces, stem, at, normal)
        return h1, h2
    if rule == 'cap':
        # a leaf ends at its vertex: the widest ring over its end cap
        best = (0.0, 0.0)
        for k in range(1, 9):
            r = ring(verts, faces, stem, at - normal * (min(rx, ry) * k / 8), normal)
            if r and r[2] < SEPARATE:
                best = (max(best[0], r[0]), max(best[1], r[1]))
        return best
    if rule == 'separate':
        # walk along the limb until its ring stands clear of the branch
        for k in range(0, 60):
            r = ring(verts, faces, stem, at + normal * (STEP * k), normal)
            if r and r[2] < SEPARATE:
                return r[0], r[1]
        raise RuntimeError(f'{stem}: no separate ring found')
    if rule == 'base':
        # the neck: at its joint the hull is the shoulders' full width, so
        # walk up (1 mm steps) to the first ring no wider than the torso
        # below it (`limit`, the chest's measured width) — the base of the
        # neck, where the shoulders' slope comes in to the torso
        for k in range(0, 200):
            r = ring(verts, faces, stem, at + normal * (0.001 * k), normal)
            if r and r[2] < SEPARATE and r[0] <= limit:
                return r[0], r[1]
        raise RuntimeError(f'{stem}: no base ring found')
    if rule == 'round':
        # walk up the limb until its ring is round (within 5 %): the ankle,
        # whose ring through the joint still carries the heel's bulge
        for k in range(0, 60):
            r = ring(verts, faces, stem, at + normal * (STEP * k), normal)
            if r and r[2] < SEPARATE and abs(r[0] - r[1]) <= 0.05 * max(r[0], r[1]):
                return r[0], r[1]
        raise RuntimeError(f'{stem}: no round ring found')
    if rule == 'buried':
        # a spur inside another limb's hull (the heel in the foot) has no
        # ring of its own: the skin radius, rounded in as subdivision does
        return rx * SUBSURF_SHRINK, ry * SUBSURF_SHRINK
    raise ValueError(rule)


SUBSURF_SHRINK = 0.92
Z = Vector((0, 0, 1))
DOWN = Vector((0, 0, -1))


def foot_dir():
    return (Vector(rm.J['toes.L']) - Vector(rm.J['ankle.L'])).normalized()


def rules():
    """stem → (vertex measured, plane normal, rule). The .L side; .R mirrors it."""
    return {
        'pelvis': ('pelvis', Z, 'at'),
        'waist': ('waist', Z, 'at'),
        'chest': ('chest', Z, 'at'),
        'neck': ('neck', Z, 'base'),
        'head': ('head', Z, 'at'),
        'crown': ('crown', Z, 'cap'),
        'shoulder': ('shoulder.L', DOWN, 'separate'),
        'elbow': ('elbow.L', DOWN, 'at'),
        'wrist': ('wrist.L', DOWN, 'at'),
        'palm': ('palm.L', DOWN, 'at'),
        'fingers': ('fingers.L', DOWN, 'cap'),
        'hip': ('hip.L', DOWN, 'separate'),
        'knee': ('knee.L', DOWN, 'at'),
        'ankle': ('ankle.L', Z, 'round'),
        'ball': ('ball.L', foot_dir(), 'at'),
        'toes': ('toes.L', foot_dir(), 'cap'),
        'heel': ('heel.L', None, 'buried'),
    }


def main() -> None:
    verts, faces = evaluated_mesh()
    rest = {**{n: Vector(p) for n, p in rm.J.items()}, **{n: Vector(e[0]) for n, e in rm.SKIN_EXTRA.items()}}
    data = {}
    for stem, (vertex, normal, rule) in rules().items():
        limit = data['chest']['fit'][0] if rule == 'base' else None
        h1, h2 = measure(verts, faces, stem, rest[vertex], normal, rule, limit)
        data[stem] = {'fit': [round(h1, 4), round(h2, 4)], 'rule': rule, 'vertex': vertex}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=1) + '\n', encoding='utf-8', newline='\n')
    for k, v in data.items():
        print(f'   {k:10s} {v["fit"]}  ({v["rule"]})')


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
