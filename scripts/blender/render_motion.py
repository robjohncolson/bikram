"""
Blender motion renderer for the 26 & 2 figures.

Builds a procedural mannequin (armature + skin-modifier tube body), poses
it from world-space bone directions defined per posture in
`scripts/blender/postures/<id>.py`, renders each frame as Freestyle line
art on a transparent background, and stitches the frames into one PNG
sprite sheet per posture under `public/motion/`. It also regenerates the
manifest `src/data/motion/manifest.ts` (GENERATED — do not hand-edit).

Run from the repo root:

    blender -b --python scripts/blender/render_motion.py -- [pose-id ...]

With no ids every posture module in `postures/` is rendered. Blender is
expected at C:/Tools/blender-5.2.1-windows-x64/blender.exe on this
machine; `npm run motion` wraps the call.

The app masks with `mask-mode: luminance` over `background: currentColor`,
so the sheet is stored as an 8-bit grayscale PNG (luminance = the render's
alpha; see `shrink`) and both themes work from one render.

Optional extra sheets, same frame layout (see postures/README.md):
  * `<id>.guides.<sha8>.png` — thin reference lines/planes from stage
    `guides` (body hidden), shown for that stage's hold plus the nearer
    half of each neighbouring transition.
  * `<id>.ghost.<sha8>.png` — a second mannequin in a stage's `ghost` pose
    (the common mistake), drawn only during that stage's hold.
Each pass solos one render collection (Figure / Guides / Ghost).
"""
from __future__ import annotations

import importlib.util
import json
import math
import os
import re
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector

ROOT = Path(__file__).resolve().parents[2]
POSTURES_DIR = Path(__file__).resolve().parent / 'postures'
OUT_DIR = ROOT / 'public' / 'motion'
MANIFEST = ROOT / 'src' / 'data' / 'motion' / 'manifest.ts'

FRAME_PX = 240          # each sprite cell is FRAME_PX × FRAME_PX
COLS = 10               # sprite-sheet grid columns
FPS = 12                # playback rate the app should use
LINE_PX = 1.7           # Freestyle stroke thickness in px at FRAME_PX
GUIDE_PX = 1.0          # thinner strokes for the guides pass
GUIDE_LINE_W = 0.004    # a guide line is a thin quad pair this wide (m)

# ---------------------------------------------------------------------------
# Rig definition: joints (name → rest position) and bones (name, head joint,
# tail joint, parent). Character stands at the origin, faces -Y, +Z up.
# The mannequin's LEFT side is +X (so from the front camera it is on screen
# right, as a mirror would show it).
# ---------------------------------------------------------------------------
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
    # name, head, tail, parent
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

# Skin-modifier tube radius at each joint (x, y) — the body's silhouette.
RADIUS = {
    'pelvis': (0.14, 0.10), 'waist': (0.11, 0.09), 'chest': (0.15, 0.10),
    'neck': (0.05, 0.05), 'head': (0.09, 0.10), 'crown': (0.07, 0.08),
    'shoulder': (0.06, 0.06), 'elbow': (0.045, 0.045), 'wrist': (0.035, 0.035),
    'fingers': (0.03, 0.02), 'palm': (0.05, 0.035),
    'hip': (0.085, 0.085), 'knee': (0.06, 0.06), 'ankle': (0.045, 0.045),
    'toes': (0.04, 0.025), 'ball': (0.045, 0.03), 'heel': (0.038, 0.038),
}

# Extra skin vertices that give the hands and feet some volume so grips and
# stances read. They are NOT joints: no bones are added, and each rides an
# existing `hand.*` / `foot.*` bone. name → (rest position, from-joint,
# to-joint, bone). With a to-joint the vertex splits that tube edge
# (from → vertex → to); with None it is a short spur off from-joint.
SKIN_EXTRA = {
    'palm.L': ((0.23, 0, 0.865), 'wrist.L', 'fingers.L', 'hand.L'),
    'palm.R': ((-0.23, 0, 0.865), 'wrist.R', 'fingers.R', 'hand.R'),
    'ball.L': ((0.10, -0.11, 0.035), 'ankle.L', 'toes.L', 'foot.L'),
    'ball.R': ((-0.10, -0.11, 0.035), 'ankle.R', 'toes.R', 'foot.R'),
    'heel.L': ((0.10, 0.035, 0.045), 'ankle.L', None, 'foot.L'),
    'heel.R': ((-0.10, 0.035, 0.045), 'ankle.R', None, 'foot.R'),
}

# Which bone a joint vertex follows: the bone whose head sits at the joint,
# or (for chain ends) the bone whose tail does.
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

# Camera azimuths (degrees around +Z; 0 = looking at the mannequin's front).
VIEWS = {'front': 0.0, 'quarter': -35.0, 'side': -90.0, 'quarter-back': -145.0, 'back': 180.0}


# ---------------------------------------------------------------------------
# Scene construction
# ---------------------------------------------------------------------------
def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def render_layer(name: str) -> bpy.types.Collection:
    """A top-level collection; each render pass solos one (see `solo`)."""
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col


def solo(layers: dict[str, bpy.types.Collection], name: str) -> None:
    for n, col in layers.items():
        col.hide_render = n != name


def holdout_material() -> bpy.types.Material:
    """Holdout: surfaces cut a hole in the alpha, only Freestyle strokes
    survive, but the geometry stays present for line detection."""
    mat = bpy.data.materials.get('Holdout')
    if mat is not None:
        return mat
    mat = bpy.data.materials.new('Holdout')
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    hold = nt.nodes.new('ShaderNodeHoldout')
    nt.links.new(hold.outputs[0], out.inputs[0])
    return mat


def build_armature(collection: bpy.types.Collection | None = None) -> bpy.types.Object:
    arm = bpy.data.armatures.new('MannequinRig')
    obj = bpy.data.objects.new('Rig', arm)
    (collection or bpy.context.collection).objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    edit = {}
    for name, head, tail, parent in BONES:
        b = arm.edit_bones.new(name)
        b.head = Vector(J[head])
        b.tail = Vector(J[tail])
        if parent:
            b.parent = edit[parent]
            b.use_connect = False
        edit[name] = b
    bpy.ops.object.mode_set(mode='OBJECT')
    for pb in obj.pose.bones:
        pb.rotation_mode = 'QUATERNION'
    return obj


def build_body(rig: bpy.types.Object, collection: bpy.types.Collection | None = None) -> bpy.types.Object:
    names = list(J.keys()) + list(SKIN_EXTRA)
    index = {n: i for i, n in enumerate(names)}
    verts = [J[n] for n in J] + [SKIN_EXTRA[n][0] for n in SKIN_EXTRA]
    edges = [(index[h], index[t]) for _, h, t, _ in BONES]
    for name, (_, a, b, _) in SKIN_EXTRA.items():
        if b is not None:
            edges.remove((index[a], index[b]))
            edges.append((index[a], index[name]))
            edges.append((index[name], index[b]))
        else:
            edges.append((index[a], index[name]))
    mesh = bpy.data.meshes.new('MannequinBody')
    mesh.from_pydata(verts, edges, [])
    mesh.update()
    obj = bpy.data.objects.new('Body', mesh)
    (collection or bpy.context.collection).objects.link(obj)

    # Vertex groups → bones.
    for bone_name in {b[0] for b in BONES}:
        obj.vertex_groups.new(name=bone_name)
    vertex_bone = {**VERTEX_BONE, **{n: e[3] for n, e in SKIN_EXTRA.items()}}
    for joint, bone_name in vertex_bone.items():
        obj.vertex_groups[bone_name].add([index[joint]], 1.0, 'REPLACE')

    obj.parent = rig
    arm_mod = obj.modifiers.new('Armature', 'ARMATURE')
    arm_mod.object = rig
    skin = obj.modifiers.new('Skin', 'SKIN')
    skin.use_smooth_shade = True
    sub = obj.modifiers.new('Subdivision', 'SUBSURF')
    sub.levels = 2
    sub.render_levels = 2

    # Skin radii (the modifier adds the layer when created).
    sv = mesh.skin_vertices[0].data
    for joint, i in index.items():
        key = joint.split('.')[0]
        rx, ry = RADIUS[key]
        sv[i].radius = (rx, ry)
        sv[i].use_root = joint == 'pelvis'

    # Holdout material: the body cuts a hole in the alpha, only Freestyle
    # strokes survive. Body remains fully present for silhouette detection.
    obj.data.materials.append(holdout_material())
    return obj


def build_guides(guides: list[dict], collection: bpy.types.Collection, name: str = 'Guides') -> bpy.types.Object:
    """One holdout mesh holding a stage's guides; Freestyle traces the quad
    borders. A line is two crossed quads GUIDE_LINE_W wide (reads as one
    stroke from any view); a plane is one rectangle."""
    verts: list = []
    faces: list = []
    for g in guides:
        if 'plane' in g:
            ax, at = g['plane'], float(g['at'])
            lo, hi = g.get('z', (0.0, 2.0))
            w = float(g.get('w', 1.0)) / 2
            if ax == 'y':
                quads = [[(-w, at, lo), (w, at, lo), (w, at, hi), (-w, at, hi)]]
            elif ax == 'x':
                quads = [[(at, -w, lo), (at, w, lo), (at, w, hi), (at, -w, hi)]]
            else:
                raise ValueError(f"guide plane must be 'x' or 'y', got {ax!r}")
        else:
            a, b = Vector(g['from']), Vector(g['to'])
            d = (b - a).normalized()
            s1 = d.cross(Vector((0, 0, 1)))
            if s1.length < 1e-6:
                s1 = d.cross(Vector((1, 0, 0)))
            s1 = s1.normalized() * (GUIDE_LINE_W / 2)
            s2 = d.cross(s1).normalized() * (GUIDE_LINE_W / 2)
            quads = [[a - s, b - s, b + s, a + s] for s in (s1, s2)]
        for q in quads:
            base = len(verts)
            verts += [tuple(v) for v in q]
            faces.append(tuple(range(base, base + 4)))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    obj.data.materials.append(holdout_material())
    return obj


def orbit_camera(cam: bpy.types.Object, view: str, center_z: float, prev_az: float | None = None) -> float:
    """Turn the camera's pivot to `view`. The camera hangs off a pivot empty
    at the frame centre, so between keyframes the ORBIT is interpolated
    (one angle), never a chord across it — the figure stays centred while
    the view swings. Returns the azimuth used (radians); pass the previous
    stage's azimuth so the turn takes the short way round."""
    az = math.radians(VIEWS[view])
    if prev_az is not None:
        while az - prev_az > math.pi:
            az -= 2 * math.pi
        while az - prev_az < -math.pi:
            az += 2 * math.pi
    pivot = cam.parent
    pivot.location = (0, 0, center_z)
    pivot.rotation_euler = (0, 0, az)
    return az


def build_camera(view: str, center_z: float, scale: float) -> bpy.types.Object:
    pivot = bpy.data.objects.new('CamPivot', None)
    pivot.rotation_mode = 'XYZ'
    bpy.context.collection.objects.link(pivot)
    cam_data = bpy.data.cameras.new('Cam')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = scale
    cam = bpy.data.objects.new('Camera', cam_data)
    bpy.context.collection.objects.link(cam)
    cam.parent = pivot
    cam.rotation_mode = 'XYZ'
    cam.location = (0, -10.0, 0)              # on the pivot's -Y, looking +Y
    cam.rotation_euler = (math.radians(90), 0, 0)
    orbit_camera(cam, view, center_z)
    bpy.context.scene.camera = cam
    return cam


def configure_render(scene: bpy.types.Scene) -> None:
    # Only the Freestyle strokes survive (holdout body on a transparent
    # film), so the engine underneath just resolves visibility. Cycles on
    # the CPU at one sample gives identical strokes, three times faster than
    # EEVEE on an integrated GPU, and scales across cores and parallel
    # workers — so it is the default; MOTION_ENGINE=EEVEE brings EEVEE back.
    if os.environ.get('MOTION_ENGINE', 'CYCLES').upper() == 'CYCLES':
        scene.render.engine = 'CYCLES'
        scene.cycles.device = 'CPU'
        scene.cycles.samples = 1
        scene.cycles.use_adaptive_sampling = False
        scene.cycles.use_denoising = False
        scene.cycles.max_bounces = 0
    else:
        scene.render.engine = 'BLENDER_EEVEE'
        scene.eevee.taa_render_samples = 4
    scene.render.resolution_x = FRAME_PX
    scene.render.resolution_y = FRAME_PX
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '8'
    scene.render.use_freestyle = True
    scene.render.line_thickness_mode = 'ABSOLUTE'
    scene.render.line_thickness = LINE_PX
    scene.view_settings.view_transform = 'Standard'
    fs = scene.view_layers[0].freestyle_settings
    fs.use_culling = False
    ls = fs.linesets.new('Figure') if not fs.linesets else fs.linesets[0]
    if ls.linestyle is None:
        ls.linestyle = bpy.data.linestyles.new('FigureStyle')
    ls.select_silhouette = True
    ls.select_border = True
    ls.select_crease = False
    ls.select_contour = True
    ls.select_external_contour = True
    ls.linestyle.color = (1.0, 1.0, 1.0)
    ls.linestyle.thickness = LINE_PX
    ls.linestyle.caps = 'ROUND'
    # Fill the shader-less world so Freestyle still has geometry to trace.
    world = bpy.data.worlds.new('World')
    scene.world = world


# ---------------------------------------------------------------------------
# Posing: each stage maps bone name → world-space direction of the bone
# (head → tail). 'pelvis.location' may also be given as an (x, y, z) offset
# from the rest position; 'pelvis' direction rotates the whole body.
# ---------------------------------------------------------------------------
def bone_order() -> list[str]:
    return [b[0] for b in BONES]


PARENT = {b[0]: b[3] for b in BONES}


def stage_entry(value) -> tuple:
    """A bone entry is a direction tuple or {'dir': (x, y, z), 'roll': deg}."""
    if isinstance(value, dict):
        return value['dir'], float(value.get('roll', 0.0))
    return value, 0.0


def apply_stage(rig: bpy.types.Object, stage: dict, rest_dirs: dict[str, Vector]) -> None:
    """Aim every bone at its world direction, parents first. A `roll`
    (degrees, right-handed about the bone's own head → tail axis) is
    applied after aiming; an OMITTED bone whose parent is rolled (or is
    itself riding along) keeps its pose relative to that parent instead of
    snapping back to its rest direction — that is how a rolled
    `spine.upper` turns the shoulder line. Without rolls this is exactly
    the old behaviour."""
    pose = rig.pose
    for pb in pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()
    # `pelvis.location` is authored in WORLD space; a pose bone's location is
    # in its own rest frame, so map through the bone's rest matrix.
    loc = Vector(stage.get('pelvis.location', (0, 0, 0)))
    rest = rig.data.bones['pelvis'].matrix_local.to_3x3()
    pose.bones['pelvis'].location = rest.inverted() @ loc
    bpy.context.view_layer.update()
    riding: set[str] = set()
    for name in bone_order():
        entry = stage.get(name)
        if entry is None and PARENT[name] in riding:
            riding.add(name)        # carried by a rolled ancestor
            continue
        target, roll = stage_entry(entry) if entry is not None else (rest_dirs[name], 0.0)
        target = Vector(target).normalized()
        pb = pose.bones[name]
        m = pb.matrix.copy()
        head = m.to_translation()
        current = (m.to_3x3() @ Vector((0, 1, 0))).normalized()
        q = current.rotation_difference(target)
        if roll:
            q = Quaternion(target, math.radians(roll)) @ q
            riding.add(name)
        rot = q.to_matrix().to_4x4()
        pb.matrix = Matrix.Translation(head) @ rot @ Matrix.Translation(-head) @ m
        bpy.context.view_layer.update()


def keyframe_all(rig: bpy.types.Object, frame: int) -> None:
    for pb in rig.pose.bones:
        pb.keyframe_insert('rotation_quaternion', frame=frame)
        pb.keyframe_insert('location', frame=frame)


def rest_directions() -> dict[str, Vector]:
    return {n: (Vector(J[t]) - Vector(J[h])).normalized() for n, h, t, _ in BONES}


# ---------------------------------------------------------------------------
# Timeline: stages with hold frames, transitions between them.
# ---------------------------------------------------------------------------
def action_fcurves(obj: bpy.types.Object) -> list:
    action = obj.animation_data.action if obj.animation_data else None
    if action is None:
        return []
    if hasattr(action, 'layers'):  # Blender 4.4+ layered actions
        return [fc for layer in action.layers for strip in layer.strips
                for bag in strip.channelbags for fc in bag.fcurves]
    return list(action.fcurves)


def stage_spans(posture: dict) -> list[tuple[int, int]]:
    """(first, last) 1-based scene frame of each stage's hold."""
    stages = posture['stages']
    transition = posture.get('transition', 6)
    frame = 1
    spans = []
    for i, st in enumerate(stages):
        hold = st.get('hold', 4)
        spans.append((frame, frame + hold - 1))
        frame += hold - 1
        if i < len(stages) - 1:
            frame += transition
    return spans


def nearest_stage(spans: list[tuple[int, int]], f: int) -> int:
    """The stage a frame belongs to for the guides layer: the one whose hold
    is nearest (inside a hold = that stage; a transition splits in half,
    ties going to the later stage)."""
    best, dist = 0, None
    for i, (a, b) in enumerate(spans):
        d = 0 if a <= f <= b else min(abs(f - a), abs(f - b))
        if dist is None or d <= dist:
            best, dist = i, d
    return best


def build_timeline(rig: bpy.types.Object, cam: bpy.types.Object, posture: dict) -> list[dict]:
    """Keyframe every stage (rig + camera view) with holds and transitions.
    Returns the stage marks as 0-based sprite frame indices."""
    rest = rest_directions()
    stages = posture['stages']
    default_view = posture.get('view', 'front')
    center_z = posture.get('frame', {}).get('center_z', 0.9)
    marks = []
    az = None
    pivot = cam.parent
    spans = stage_spans(posture)
    for st, (first, last) in zip(stages, spans):
        apply_stage(rig, st['pose'], rest)
        az = orbit_camera(cam, st.get('view', default_view), center_z, az)
        for f in (first, last):
            keyframe_all(rig, f)
            pivot.keyframe_insert('rotation_euler', frame=f)
        marks.append({'label': st['label'], 'frame': first - 1})
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = spans[-1][1]
    # Smooth ease in/out between stages.
    for fc in action_fcurves(rig) + action_fcurves(cam.parent):
        for kp in fc.keyframe_points:
            kp.interpolation = 'BEZIER'
            kp.easing = 'EASE_IN_OUT'
    return marks


# ---------------------------------------------------------------------------
# Rendering + sprite stitching
# ---------------------------------------------------------------------------
def render_frames(scene: bpy.types.Scene, tmp: Path, show=None) -> list[Path | None]:
    """Render every scene frame. `show(f)` (optional) prepares frame f for a
    layer pass and returns False when nothing is visible — that cell is
    left blank (None) without rendering."""
    tmp.mkdir(parents=True, exist_ok=True)
    paths: list[Path | None] = []
    for f in range(scene.frame_start, scene.frame_end + 1):
        scene.frame_set(f)
        if show is not None and not show(f):
            paths.append(None)
            continue
        p = tmp / f'{f:04d}.png'
        scene.render.filepath = str(p)
        bpy.ops.render.render(write_still=True)
        paths.append(p)
    return paths


def guide_strokes(scene: bpy.types.Scene, on: bool) -> None:
    """Stroke style for the guides pass: thinner, and hidden lines drawn too
    (a pane's holdout face would otherwise occlude the lines behind it)."""
    px = GUIDE_PX if on else LINE_PX
    scene.render.line_thickness = px
    for ls in scene.view_layers[0].freestyle_settings.linesets:
        ls.linestyle.thickness = px
        ls.select_by_visibility = not on


def load_alpha(path: Path) -> np.ndarray:
    img = bpy.data.images.load(str(path))
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
    bpy.data.images.remove(img)
    return px[::-1, :, 3]  # Blender stores bottom-up; flip to top-down


def stitch(paths: list[Path | None], out: Path) -> tuple[int, int]:
    n = len(paths)
    rows = math.ceil(n / COLS)
    sheet = np.zeros((rows * FRAME_PX, COLS * FRAME_PX), dtype=np.float32)
    for i, p in enumerate(paths):
        if p is None:
            continue            # blank cell (layer pass with nothing shown)
        a = load_alpha(p)
        r, c = divmod(i, COLS)
        sheet[r * FRAME_PX:(r + 1) * FRAME_PX, c * FRAME_PX:(c + 1) * FRAME_PX] = a
    # Write via a Blender image: white RGB + alpha (bottom-up).
    img = bpy.data.images.new('sheet', COLS * FRAME_PX, rows * FRAME_PX, alpha=True)
    rgba = np.ones((rows * FRAME_PX, COLS * FRAME_PX, 4), dtype=np.float32)
    rgba[..., 3] = sheet
    img.pixels = rgba[::-1].ravel().tolist()
    img.filepath_raw = str(out)
    img.file_format = 'PNG'
    img.save()
    bpy.data.images.remove(img)
    return n, rows


def shrink(out: Path) -> None:
    """Re-encode the RGBA sheet as an 8-bit GRAYSCALE PNG whose luminance is
    the old alpha (about 3× smaller). The app masks with
    `mask-mode: luminance`, which reads both encodings identically, so a
    machine without ffmpeg simply keeps the RGBA file."""
    import shutil
    import subprocess
    if not shutil.which('ffmpeg'):
        print('   (ffmpeg not found; keeping RGBA sheet)')
        return
    tmp = out.with_suffix('.lum.png')
    r = subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-i', str(out), '-vf', 'alphaextract',
         '-pix_fmt', 'gray', '-compression_level', '100', '-pred', 'mixed', str(tmp)],
    )
    if r.returncode == 0 and tmp.exists() and tmp.stat().st_size < out.stat().st_size:
        tmp.replace(out)
    elif tmp.exists():
        tmp.unlink()


def hashed_sheets(stem: str) -> list[Path]:
    """Existing `<stem>.<sha8>.png` sheets (exact stem: `bow` never matches
    `bow.guides.<sha8>.png` or `standing-bow.<sha8>.png`)."""
    pat = re.compile(rf'^{re.escape(stem)}\.[0-9a-f]{{8}}\.png$')
    return [p for p in OUT_DIR.glob(f'{stem}.*.png') if pat.match(p.name)]


def content_address(out: Path, stem: str) -> Path:
    """Rename the sheet to `<stem>.<sha1[:8]>.png` (stem = `<id>` or
    `<id>.guides` / `<id>.ghost`) and drop older sheets with that stem.
    The service worker caches sprites cache-first, so a re-render must
    change the URL or returning users would keep the old cells under new
    manifest metadata."""
    import hashlib
    digest = hashlib.sha1(out.read_bytes()).hexdigest()[:8]
    final = out.with_name(f'{stem}.{digest}.png')
    for old in hashed_sheets(stem):
        if old != final:
            old.unlink()
    if final.exists():
        out.unlink()
    else:
        out.replace(final)
    return final


def load_posture(path: Path) -> dict:
    spec = importlib.util.spec_from_file_location(path.stem, path)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    return mod.POSTURE


def build_scene(posture: dict) -> dict:
    """Scene for one posture: the figure, one guides mesh per stage that has
    `guides` (None otherwise) and — when any stage has a `ghost` — a second
    mannequin, each in its own render collection. Shared by the preview."""
    reset_scene()
    scene = bpy.context.scene
    configure_render(scene)
    layers = {n: render_layer(n) for n in ('Figure', 'Guides', 'Ghost')}
    rig = build_armature(layers['Figure'])
    build_body(rig, layers['Figure'])
    guides = [build_guides(st['guides'], layers['Guides'], f'Guides{i:02d}') if st.get('guides') else None
              for i, st in enumerate(posture['stages'])]
    ghost = None
    if any(st.get('ghost') for st in posture['stages']):
        ghost = build_armature(layers['Ghost'])
        build_body(ghost, layers['Ghost'])
    frame_box = posture.get('frame', {})
    cam = build_camera(posture.get('view', 'front'), frame_box.get('center_z', 0.9), frame_box.get('scale', 2.0))
    solo(layers, 'Figure')
    return {'scene': scene, 'layers': layers, 'rig': rig, 'guides': guides, 'ghost': ghost, 'cam': cam}


def ghost_pose(stage: dict) -> dict:
    """The ghost's pose: the stage pose with the ghost's bones laid over it."""
    return {**stage['pose'], **stage['ghost']}


def show_guides(guides: list, index: int | None) -> bool:
    """Show only stage `index`'s guides; False when it has none."""
    for i, g in enumerate(guides):
        if g is not None:
            g.hide_render = i != index
    return index is not None and guides[index] is not None


def write_sheet(frames: list[Path | None], stem: str) -> tuple[Path, int, int]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f'{stem}.png'
    n, rows = stitch(frames, out)
    for f in frames:
        if f is not None:
            f.unlink()
    shrink(out)
    out = content_address(out, stem)
    print(f'   {n} frames → {out.relative_to(ROOT)} ({COLS}×{rows} grid)')
    return out, n, rows


def render_posture(path: Path) -> dict:
    posture = load_posture(path)
    pose_id = posture['id']
    print(f'== {pose_id}')
    built = build_scene(posture)
    scene, layers, guides, ghost = built['scene'], built['layers'], built['guides'], built['ghost']
    marks = build_timeline(built['rig'], built['cam'], posture)
    spans = stage_spans(posture)
    tmp = ROOT / '.motion-tmp' / pose_id
    out, n, rows = write_sheet(render_frames(scene, tmp), pose_id)
    extra = {}

    # Guides pass: body hidden, each stage's guides for its hold + the nearer
    # half of the transitions either side.
    if any(g is not None for g in guides):
        solo(layers, 'Guides')
        guide_strokes(scene, True)
        frames = render_frames(scene, tmp, lambda f: show_guides(guides, nearest_stage(spans, f)))
        guide_strokes(scene, False)
        extra['guides'] = f"/motion/{write_sheet(frames, f'{pose_id}.guides')[0].name}"
    else:
        for old in hashed_sheets(f'{pose_id}.guides'):
            old.unlink()

    # Ghost pass: the second mannequin in the mistake pose, hold frames only.
    if ghost is not None:
        solo(layers, 'Ghost')
        rest = rest_directions()
        posed = {'stage': None}

        def show_ghost(f: int) -> bool:
            i = next((k for k, (a, b) in enumerate(spans) if a <= f <= b), None)
            if i is None or not posture['stages'][i].get('ghost'):
                return False
            if posed['stage'] != i:
                apply_stage(ghost, ghost_pose(posture['stages'][i]), rest)
                posed['stage'] = i
            return True

        frames = render_frames(scene, tmp, show_ghost)
        extra['ghost'] = f"/motion/{write_sheet(frames, f'{pose_id}.ghost')[0].name}"
    else:
        for old in hashed_sheets(f'{pose_id}.ghost'):
            old.unlink()
    solo(layers, 'Figure')

    return {
        'id': pose_id,
        'sprite': f'/motion/{out.name}',
        **extra,
        'frame': FRAME_PX,
        'frames': n,
        'cols': COLS,
        'fps': FPS,
        'view': posture.get('view', 'front'),
        'stages': marks,
    }


def write_manifest(entries: dict[str, dict]) -> None:
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        '/**',
        ' * GENERATED by scripts/blender/render_motion.py — do not edit.',
        ' * Sprite-sheet motion figures rendered from the Blender mannequin rig.',
        ' */',
        "import type { PoseMotion } from '../types';",
        '',
        'export const motionManifest: Record<string, PoseMotion> = {',
    ]
    for pid in sorted(entries):
        e = entries[pid]
        stages = ', '.join(
            f"{{ label: {json.dumps(s['label'])}, frame: {s['frame']} }}" for s in e['stages']
        )
        layers = ''.join(f", {k}: '{e[k]}'" for k in ('guides', 'ghost') if e.get(k))
        lines.append(
            f"  '{pid}': {{ sprite: '{e['sprite']}'{layers}, frame: {e['frame']}, frames: {e['frames']}, "
            f"cols: {e['cols']}, fps: {e['fps']}, view: '{e['view']}', stages: [{stages}] }},"
        )
    lines.append('};')
    lines.append('')
    MANIFEST.write_text('\n'.join(lines), encoding='utf-8', newline='\n')


def read_existing_manifest() -> dict[str, dict]:
    """Keep entries for postures not re-rendered this run."""
    if not MANIFEST.exists():
        return {}
    entries = {}
    row = re.compile(
        r"'(?P<id>[a-z0-9-]+)': \{ sprite: '(?P<sprite>[^']+)'"
        r"(?:, guides: '(?P<guides>[^']+)')?(?:, ghost: '(?P<ghost>[^']+)')?"
        r", frame: (?P<frame>\d+), frames: (?P<frames>\d+), cols: (?P<cols>\d+), fps: (?P<fps>\d+)"
        r", view: '(?P<view>[^']+)', stages: \[(?P<stages>.*?)\] \},"
    )
    for m in row.finditer(MANIFEST.read_text(encoding='utf-8')):
        stages = [
            {'label': json.loads(lab), 'frame': int(fr)}
            for lab, fr in re.findall(r'\{ label: ("(?:[^"\\]|\\.)*"), frame: (\d+) \}', m['stages'])
        ]
        e = {
            'id': m['id'], 'sprite': m['sprite'], 'frame': int(m['frame']), 'frames': int(m['frames']),
            'cols': int(m['cols']), 'fps': int(m['fps']), 'view': m['view'], 'stages': stages,
        }
        for k in ('guides', 'ghost'):
            if m[k]:
                e[k] = m[k]
        entries[m['id']] = e
    return entries


ENTRIES_DIR = ROOT / '.motion-tmp' / 'entries'


def merge_entries() -> None:
    """Fold every worker's JSON sidecar into the manifest (and clear them)."""
    entries = read_existing_manifest()
    for f in sorted(ENTRIES_DIR.glob('*.json')) if ENTRIES_DIR.exists() else []:
        e = json.loads(f.read_text(encoding='utf-8'))
        entries[e['id']] = e
        f.unlink()
    write_manifest(entries)
    print(f'manifest → {MANIFEST.relative_to(ROOT)} ({len(entries)} postures)')


def main() -> None:
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    # `--merge`: only fold the workers' sidecars into the manifest
    if argv == ['--merge']:
        merge_entries()
        return
    # `--entry-only <ids>`: render, but leave the entries as sidecars for a
    # later merge (the node wrapper runs one Blender per posture in parallel,
    # and parallel writers must not race on the manifest)
    entry_only = '--entry-only' in argv
    argv = [a for a in argv if a != '--entry-only']
    files = sorted(POSTURES_DIR.glob('*.py'))
    if argv:
        files = [p for p in files if p.stem.replace('_', '-') in argv or p.stem in argv]
    if not files:
        print('no posture modules matched', argv)
        sys.exit(1)
    if entry_only:
        ENTRIES_DIR.mkdir(parents=True, exist_ok=True)
        for path in files:
            e = render_posture(path)
            (ENTRIES_DIR / f"{e['id']}.json").write_text(json.dumps(e), encoding='utf-8')
        return
    entries = read_existing_manifest()
    for path in files:
        e = render_posture(path)
        entries[e['id']] = e
    write_manifest(entries)
    print(f'manifest → {MANIFEST.relative_to(ROOT)} ({len(entries)} postures)')


if __name__ == '__main__':
    main()
