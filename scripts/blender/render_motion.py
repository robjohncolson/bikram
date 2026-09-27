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
"""
from __future__ import annotations

import importlib.util
import json
import math
import os
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[2]
POSTURES_DIR = Path(__file__).resolve().parent / 'postures'
OUT_DIR = ROOT / 'public' / 'motion'
MANIFEST = ROOT / 'src' / 'data' / 'motion' / 'manifest.ts'

FRAME_PX = 240          # each sprite cell is FRAME_PX × FRAME_PX
COLS = 10               # sprite-sheet grid columns
FPS = 12                # playback rate the app should use
LINE_PX = 1.7           # Freestyle stroke thickness in px at FRAME_PX

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
    'fingers': (0.03, 0.02),
    'hip': (0.085, 0.085), 'knee': (0.06, 0.06), 'ankle': (0.045, 0.045),
    'toes': (0.04, 0.025),
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


def build_armature() -> bpy.types.Object:
    arm = bpy.data.armatures.new('MannequinRig')
    obj = bpy.data.objects.new('Rig', arm)
    bpy.context.collection.objects.link(obj)
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


def build_body(rig: bpy.types.Object) -> bpy.types.Object:
    names = list(J.keys())
    index = {n: i for i, n in enumerate(names)}
    verts = [J[n] for n in names]
    edges = [(index[h], index[t]) for _, h, t, _ in BONES]
    mesh = bpy.data.meshes.new('MannequinBody')
    mesh.from_pydata(verts, edges, [])
    mesh.update()
    obj = bpy.data.objects.new('Body', mesh)
    bpy.context.collection.objects.link(obj)

    # Vertex groups → bones.
    for bone_name in {b[0] for b in BONES}:
        obj.vertex_groups.new(name=bone_name)
    for joint, bone_name in VERTEX_BONE.items():
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
    mat = bpy.data.materials.new('Holdout')
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    hold = nt.nodes.new('ShaderNodeHoldout')
    nt.links.new(hold.outputs[0], out.inputs[0])
    obj.data.materials.append(mat)
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


def apply_stage(rig: bpy.types.Object, stage: dict, rest_dirs: dict[str, Vector]) -> None:
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
    for name in bone_order():
        target = stage.get(name)
        if target is None:
            target = rest_dirs[name]
        target = Vector(target).normalized()
        pb = pose.bones[name]
        m = pb.matrix.copy()
        head = m.to_translation()
        current = (m.to_3x3() @ Vector((0, 1, 0))).normalized()
        rot = current.rotation_difference(target).to_matrix().to_4x4()
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


def build_timeline(rig: bpy.types.Object, cam: bpy.types.Object, posture: dict) -> list[dict]:
    """Keyframe every stage (rig + camera view) with holds and transitions.
    Returns the stage marks as 0-based sprite frame indices."""
    rest = rest_directions()
    stages = posture['stages']
    transition = posture.get('transition', 6)
    default_view = posture.get('view', 'front')
    center_z = posture.get('frame', {}).get('center_z', 0.9)
    frame = 1
    marks = []
    az = None
    pivot = cam.parent
    for i, st in enumerate(stages):
        hold = st.get('hold', 4)
        apply_stage(rig, st['pose'], rest)
        az = orbit_camera(cam, st.get('view', default_view), center_z, az)
        for f in (frame, frame + hold - 1):
            keyframe_all(rig, f)
            pivot.keyframe_insert('rotation_euler', frame=f)
        marks.append({'label': st['label'], 'frame': frame - 1})
        frame += hold - 1
        if i < len(stages) - 1:
            frame += transition
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = frame
    # Smooth ease in/out between stages.
    for fc in action_fcurves(rig) + action_fcurves(cam.parent):
        for kp in fc.keyframe_points:
            kp.interpolation = 'BEZIER'
            kp.easing = 'EASE_IN_OUT'
    return marks


# ---------------------------------------------------------------------------
# Rendering + sprite stitching
# ---------------------------------------------------------------------------
def render_frames(scene: bpy.types.Scene, tmp: Path) -> list[Path]:
    tmp.mkdir(parents=True, exist_ok=True)
    paths = []
    for f in range(scene.frame_start, scene.frame_end + 1):
        scene.frame_set(f)
        p = tmp / f'{f:04d}.png'
        scene.render.filepath = str(p)
        bpy.ops.render.render(write_still=True)
        paths.append(p)
    return paths


def load_alpha(path: Path) -> np.ndarray:
    img = bpy.data.images.load(str(path))
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
    bpy.data.images.remove(img)
    return px[::-1, :, 3]  # Blender stores bottom-up; flip to top-down


def stitch(paths: list[Path], out: Path) -> tuple[int, int]:
    n = len(paths)
    rows = math.ceil(n / COLS)
    sheet = np.zeros((rows * FRAME_PX, COLS * FRAME_PX), dtype=np.float32)
    for i, p in enumerate(paths):
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


def content_address(out: Path, pose_id: str) -> Path:
    """Rename the sheet to `<id>.<sha1[:8]>.png` and drop any older sheets
    for the same posture. The service worker caches sprites cache-first,
    so a re-render must change the URL or returning users would keep the
    old cells under new manifest metadata."""
    import hashlib
    digest = hashlib.sha1(out.read_bytes()).hexdigest()[:8]
    final = out.with_name(f'{pose_id}.{digest}.png')
    for old in OUT_DIR.glob(f'{pose_id}.*.png'):
        if old != out and old != final:
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


def render_posture(path: Path) -> dict:
    posture = load_posture(path)
    pose_id = posture['id']
    print(f'== {pose_id}')
    reset_scene()
    scene = bpy.context.scene
    configure_render(scene)
    rig = build_armature()
    build_body(rig)
    frame_box = posture.get('frame', {})
    cam = build_camera(posture.get('view', 'front'), frame_box.get('center_z', 0.9), frame_box.get('scale', 2.0))
    marks = build_timeline(rig, cam, posture)
    tmp = ROOT / '.motion-tmp' / pose_id
    frames = render_frames(scene, tmp)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f'{pose_id}.png'
    n, rows = stitch(frames, out)
    for f in frames:
        f.unlink()
    shrink(out)
    out = content_address(out, pose_id)
    print(f'   {n} frames → {out.relative_to(ROOT)} ({COLS}×{rows} grid)')
    return {
        'id': pose_id,
        'sprite': f'/motion/{out.name}',
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
        lines.append(
            f"  '{pid}': {{ sprite: '{e['sprite']}', frame: {e['frame']}, frames: {e['frames']}, "
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
    import re
    for m in re.finditer(r"'([a-z0-9-]+)': \{ sprite: '([^']+)', frame: (\d+), frames: (\d+), cols: (\d+), fps: (\d+), view: '([^']+)', stages: \[(.*?)\] \},", MANIFEST.read_text(encoding='utf-8')):
        stages = [
            {'label': json.loads(lab), 'frame': int(fr)}
            for lab, fr in re.findall(r'\{ label: ("(?:[^"\\]|\\.)*"), frame: (\d+) \}', m.group(8))
        ]
        entries[m.group(1)] = {
            'id': m.group(1), 'sprite': m.group(2), 'frame': int(m.group(3)), 'frames': int(m.group(4)),
            'cols': int(m.group(5)), 'fps': int(m.group(6)), 'view': m.group(7), 'stages': stages,
        }
    return entries


def main() -> None:
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    files = sorted(POSTURES_DIR.glob('*.py'))
    if argv:
        files = [p for p in files if p.stem.replace('_', '-') in argv or p.stem in argv]
    if not files:
        print('no posture modules matched', argv)
        sys.exit(1)
    entries = read_existing_manifest()
    for path in files:
        e = render_posture(path)
        entries[e['id']] = e
    write_manifest(entries)
    print(f'manifest → {MANIFEST.relative_to(ROOT)} ({len(entries)} postures)')


if __name__ == '__main__':
    main()
