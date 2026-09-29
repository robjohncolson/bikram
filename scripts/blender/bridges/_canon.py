"""
Shared pieces for the hand-off bridges (not rendered: `_` files are helpers).

A bridge carries the figure from the CANONICAL pose of one body position to
the canonical pose of another, so the class figure never jumps from one
sheet's last frame into a sheet that opens somewhere else. The canonical
poses are imported from the posture modules that own them, never re-authored:

    standing = TADASANA  (postures/awkward.py)
    supine   = FLAT      (postures/wind_removing.py)
    prone    = PRONE     (postures/cobra.py)
    kneeling = KNEEL     (postures/camel.py)
    seated   = SIT       (postures/spine_twisting.py)

Every sheet keeps the head toward -Y when lying and the face toward -Y
when upright, so a body that has to reverse (lie down with the head where
the face was, sit with the legs where the head was) either rolls through
the side and onto the hands and knees, or sits up and swivels on the seat.
The midpoints below are the authored in-between poses; each bridge module
strings canonical → midpoints → canonical with `bridge()`.

Each stage carries its own camera `frame`: the bridge opens on the framing
of the sheets that end in its start position and finishes on the framing
of the sheets that open in its end position, so the cut into the next
sheet changes the pose by a frame and never the zoom.
"""
import importlib.util
import math
from pathlib import Path
import sys


def _warn_reach(dist, span, target):
    """Say so (stderr) when a reach target lies more than 1 cm beyond the
    chain: the helper clamps it, and the limb silently falls short."""
    if dist > span + 0.01:
        print(f'reach warning [{Path(__file__).stem}]: target '
              f'({target[0]:.3f}, {target[1]:.3f}, {target[2]:.3f}) is '
              f'{dist - span:.3f} m out of reach', file=sys.stderr)

POSTURES = Path(__file__).resolve().parent.parent / 'postures'


def _posture_module(name):
    spec = importlib.util.spec_from_file_location(f'_bridge_src_{name}', POSTURES / f'{name}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


CANON = {
    'standing': _posture_module('awkward').TADASANA,
    'supine': _posture_module('wind_removing').FLAT,
    'prone': _posture_module('cobra').PRONE,
    'kneeling': _posture_module('camel').KNEEL,
    'seated': _posture_module('spine_twisting').SIT,
}

LABEL = {
    'standing': 'Stand',
    'supine': 'Lie on the back',
    'prone': 'Lie on the front',
    'kneeling': 'Kneel',
    'seated': 'Sit',
}

# default canonical ortho framing (center_z, scale) per position — the sheets
# themselves are framed per posture, so the hand-off may still change zoom
FRAME = {
    'standing': {'center_z': 0.95, 'scale': 2.3},
    'supine': {'center_z': 0.35, 'scale': 2.4},
    'prone': {'center_z': 0.35, 'scale': 2.4},
    'kneeling': {'center_z': 0.6, 'scale': 1.8},
    'seated': {'center_z': 0.5, 'scale': 2.2},   # the long legs reach far forward
}


# --- small vector helpers ----------------------------------------------------
def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, s=1.0):
    return tuple(x + s * y for x, y in zip(a, b))


def _dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def two_bone(root, target, l1, l2, hint):
    """Directions of two bones from `root` reaching `target`, the middle
    joint bent toward `hint` (straight when the target is out of reach)."""
    d = _add(target, root, -1)
    _raw = math.sqrt(_dot(d, d))
    _warn_reach(_raw, l1 + l2, target)
    dist = min(_raw, l1 + l2 - 1e-3)
    u = _n(d)
    x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    r = math.sqrt(max(l1 * l1 - x * x, 0.0))
    v = _n(_add(hint, u, -_dot(hint, u)))
    mid = _add(_add(root, u, x), v, r)
    return _n(_add(mid, root, -1)), _n(_add(target, mid, -1))


UPPER, FORE, THIGH, SHIN = 0.29, 0.25, 0.44, 0.44


def chain(p, dirs, bones):
    """Forward kinematics along `bones` (name, length) from point p."""
    for bone, length in bones:
        p = _add(p, _n(dirs[bone]), length)
    return p


TORSO = (('pelvis', 0.12), ('spine.lower', 0.15), ('spine.upper', 0.13))


def arm(pose, side, shoulder, wrist, hint, hand):
    up, fo = two_bone(shoulder, wrist, UPPER, FORE, hint)
    pose[f'upperarm.{side}'] = up
    pose[f'forearm.{side}'] = fo
    pose[f'hand.{side}'] = hand


def leg(pose, side, hip, ankle, hint, foot):
    th, sh = two_bone(hip, ankle, THIGH, SHIN, hint)
    pose[f'thigh.{side}'] = th
    pose[f'shin.{side}'] = sh
    pose[f'foot.{side}'] = foot


def shoulders(pose, pelvis_at):
    neck = chain(pelvis_at, pose, TORSO)
    return {s: _add(neck, _n(pose[f'clavicle.{s}']), 0.2044) for s in 'LR'}


# --- midpoints -----------------------------------------------------------------
def side_lying():
    """Rolled onto the right side on the way between lying on the back and
    lying on the front: hips and shoulders stacked, the under arm folded
    forward on the floor as a pillow, the top hand on the floor in front
    of the chest, the top knee drawn forward onto the floor."""
    at = (0, -0.1, 0.20)                                  # pelvis joint
    pose = {
        'pelvis.location': (0, -0.1, at[2] - 1.0),
        'pelvis': (0, -1, 0.2), 'spine.lower': (0, -1, 0.2), 'spine.upper': (0, -1, 0.15),
        'neck': (0, -1, 0.0), 'head': (0, -1, -0.12),
        'hipbone.L': (0, 0.2, 1), 'hipbone.R': (0, 0.2, -1),
        'clavicle.L': (0, 0.05, 1), 'clavicle.R': (0, 0.05, -1),
    }
    sh = shoulders(pose, at)
    # under arm forward along the floor, the forearm folded under the head
    pose.update({'upperarm.R': (-0.8, -0.6, -0.05), 'forearm.R': (0.2, -1, 0), 'hand.R': (0.3, -1, 0)})
    arm(pose, 'L', sh['L'], (-0.26, sh['L'][1] - 0.02, 0.06), (0, 0.4, 0.3), (-0.2, -1, -0.1))
    hip_l = _add(at, _n(pose['hipbone.L']), 0.102)
    hip_r = _add(at, _n(pose['hipbone.R']), 0.102)
    leg(pose, 'R', hip_r, (0, hip_r[1] + 0.86, 0.07), (0, 0, 1), (-0.5, 0.4, 0))
    leg(pose, 'L', hip_l, (-0.12, hip_l[1] + 0.62, 0.16), (-0.6, -0.3, 0), (-0.5, 0.4, 0))
    return pose


def hands_and_knees():
    """Tabletop: knees under the hips (the kneel's knee line), hands under
    the shoulders, back long and level, facing -Y."""
    knee_y = -0.15
    at = (0, knee_y, 0.52)
    pose = {
        'pelvis.location': (0, knee_y, at[2] - 1.0),
        'pelvis': (0, -1, 0.08), 'spine.lower': (0, -1, 0.1), 'spine.upper': (0, -1, 0.12),
        'neck': (0, -1, 0.15), 'head': (0, -1, 0.05),
        'clavicle.L': (1, 0, -0.1), 'clavicle.R': (-1, 0, -0.1),
        'thigh.L': (0, 0, -1), 'thigh.R': (0, 0, -1),
        'shin.L': (0, 1, 0), 'shin.R': (0, 1, 0),
        'foot.L': (0, 1, -0.05), 'foot.R': (0, 1, -0.05),
    }
    sh = shoulders(pose, at)
    for s in 'LR':
        arm(pose, s, sh[s], (sh[s][0], sh[s][1] - 0.18, 0.05), (0, 1, 0), (0, -1, -0.1))
    return pose


def sat_up():
    """Sat up from lying on the back: the torso rises over the hips, knees
    bent and feet flat — facing the way the feet were (+Y) — hands on the
    floor behind."""
    at = (0, -0.1, 0.12)
    pose = {
        'pelvis.location': (0, -0.1, at[2] - 1.0),
        'pelvis': (0, 0.2, 1), 'spine.lower': (0, 0.12, 1), 'spine.upper': (0, 0.05, 1),
        'neck': (0, 0.05, 1), 'head': (0, 0.05, 1),
        'clavicle.L': (1, 0, 0.1), 'clavicle.R': (-1, 0, 0.1),
    }
    for s, sx in (('L', 1), ('R', -1)):
        hip = (sx * 0.10, at[1], at[2] - 0.02)
        leg(pose, s, hip, (sx * 0.1, at[1] + 0.56, 0.08), (0, 0, 1), (0, 1, -0.2))
    sh = shoulders(pose, at)
    for s, sx in (('L', 1), ('R', -1)):
        arm(pose, s, sh[s], (sx * 0.26, at[1] - 0.26, 0.05), (0, -1, 0), (0, -0.3, -1))
    return pose


def swivel():
    """Half-way round on the seat: knees up and pointing sideways, feet
    flat, hands on the floor behind — the body turns from facing its feet
    (+Y, after sitting up) to facing forward (-Y, seated)."""
    at = (0, -0.03, 0.12)
    pose = {
        'pelvis.location': (0, at[1], at[2] - 1.0),
        'pelvis': (0.12, 0, 1), 'spine.lower': (0.06, 0, 1), 'spine.upper': (0, 0, 1),
        'neck': (-0.05, 0, 1), 'head': (-0.1, 0, 1),
        'clavicle.L': (0.2, -1, 0.1), 'clavicle.R': (-0.2, 1, 0.1),
    }
    for s, sy in (('L', -1), ('R', 1)):
        hip = (0.10 if s == 'L' else -0.10, at[1], at[2] - 0.02)
        leg(pose, s, hip, (-0.66, at[1] + sy * 0.12, 0.08), (0, 0, 1), (-1, 0, -0.2))
    sh = shoulders(pose, at)
    for s, sy in (('L', -1), ('R', 1)):
        arm(pose, s, sh[s], (0.28, at[1] + sy * 0.22, 0.05), (1, 0, 0), (0.3, 0, -1))
    return pose


def knees_up():
    """Seated facing forward (-Y) with the knees drawn up and the feet flat —
    the swivel lands here, then the legs slide long into the seat. Hip and
    ankle sit at the same height, so straightening keeps the heels on the
    floor all the way (a direct swivel → sit sank them through it)."""
    seat = CANON['seated']
    at = (0, 0.05, 0.12)
    pose = {k: v for k, v in seat.items() if not k.startswith(('thigh', 'shin', 'foot'))}
    for s, sx in (('L', 1), ('R', -1)):
        hip = (sx * 0.10, at[1], at[2] - 0.02)
        leg(pose, s, hip, (sx * 0.10, at[1] - 0.62, hip[2]), (0, 0, 1), (0, -1, -0.2))
    return pose


def knees_down():
    """From knees up, both knees fall to the left and the feet stay on the
    floor in front: the shins then sweep round along the floor into the
    side sit instead of swinging down through it."""
    at = (0, 0.02, 0.13)
    pose = {k: v for k, v in knees_up().items() if not k.startswith(('thigh', 'shin', 'foot'))}
    pose['pelvis.location'] = (0, at[1], at[2] - 1.0)
    pose['pelvis'] = (-0.06, 0, 1)
    leg(pose, 'L', (0.10, at[1], 0.11), (-0.02, at[1] - 0.52, 0.06), (1, 0, 0.15), (-0.3, -1, 0.2))
    leg(pose, 'R', (-0.10, at[1], 0.11), (-0.16, at[1] - 0.58, 0.06), (1, 0, 0.35), (-0.3, -1, 0.2))
    return pose


def side_sit():
    """Legs folded to one side on the way from sitting to kneeling: both
    knees forward, both feet tucked back beside the left hip, the right
    hand on the floor and the torso leaning onto it."""
    at = (0, -0.02, 0.14)
    pose = {
        'pelvis.location': (0, at[1], at[2] - 1.0),
        'pelvis': (-0.12, 0, 1), 'spine.lower': (-0.1, 0, 1), 'spine.upper': (-0.05, 0, 1),
        'neck': (0, 0, 1), 'head': (0, 0, 1),
        'clavicle.L': (1, 0, 0.1), 'clavicle.R': (-1, 0, 0.05),
    }
    # toes turned up: a foot pointed back would flip down through the
    # floor on the way in from the knees-down feet (turned the other way)
    leg(pose, 'L', (0.10, at[1], 0.12), (0.42, at[1] + 0.12, 0.06), (0.2, -1, 0.1), (0.3, 0.4, 1))
    leg(pose, 'R', (-0.10, at[1], 0.12), (0.26, at[1] + 0.02, 0.06), (0.1, -1, 0.1), (0.3, 0.4, 1))
    sh = shoulders(pose, at)
    arm(pose, 'R', sh['R'], (-0.40, at[1] - 0.05, 0.05), (1, 0.3, 0), (-0.3, -0.2, -1))
    arm(pose, 'L', sh['L'], (0.26, at[1] - 0.30, 0.20), (1, 0, -0.2), (0, -0.6, -1))
    return pose


MID = {
    'side': ('Roll to the side', side_lying(), {'center_z': 0.35, 'scale': 2.4}),
    'fours': ('Hands and knees', hands_and_knees(), {'center_z': 0.45, 'scale': 2.2}),
    'sat-up': ('Sit up', sat_up(), {'center_z': 0.4, 'scale': 2.1}),
    'swivel': ('Turn on the seat', swivel(), {'center_z': 0.42, 'scale': 1.9}),
    'side-sit': ('Legs to the side', side_sit(), {'center_z': 0.45, 'scale': 1.9}),
    'knees-up': ('Knees up', knees_up(), {'center_z': 0.44, 'scale': 1.9}),
    'knees-down': ('Knees to the side', knees_down(), {'center_z': 0.45, 'scale': 1.75}),
    'kneel': ('Kneel down', CANON['kneeling'], {'center_z': 0.7, 'scale': 2.3}),
}


def bridge(start, end, mids, views=None, end_frame=None):
    """A bridge POSTURE: canonical `start` → the named midpoints → canonical
    `end`. Short on purpose (transition 6, holds 2–3): it plays in the
    seconds before a line such as "Lie on your stomach" lands. `views`
    maps stage index → camera view; `end_frame` overrides the closing
    framing when the one sheet the bridge feeds is framed differently."""
    views = views or {}
    stages = [{'label': LABEL[start], 'pose': CANON[start], 'hold': 2, 'frame': FRAME[start]}]
    for m in mids:
        label, pose, frame = MID[m]
        stages.append({'label': label, 'pose': pose, 'hold': 2, 'frame': frame})
    stages.append({'label': LABEL[end], 'pose': CANON[end], 'hold': 3, 'frame': end_frame or FRAME[end]})
    for i, v in views.items():
        stages[i]['view'] = v
    return {
        'id': f'bridge:{start}-{end}',
        'position': {'start': start, 'end': end},
        'view': 'side',
        'frame': FRAME[start],
        'transition': 6,
        'stages': stages,
    }
