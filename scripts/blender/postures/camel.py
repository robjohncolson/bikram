"""
Camel (Ustrasana) — stage poses for the mannequin rig.

Kneeling base: shins flat on the floor pointing back, knees anchored at
y=KNEE_Y, z≈0.06. `kneel(thigh)` solves `pelvis.location` from the thigh
direction so the knees stay planted while the hips press forward.
Side view: the face points screen-right (-Y), the heels sit screen-left.
The heel grip is solved (`arms_to_heels`) so the palms land on the heels.
The full expression carries teaching guides and a ghost (the mistake).
"""
import math

KNEE_Y = -0.15


def offset(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


def kneel(thigh):
    """Kneeling legs + the pelvis offset that keeps the knees on the floor."""
    tx, ty, tz = thigh
    n = math.sqrt(tx * tx + ty * ty + tz * tz)
    ty, tz = ty / n, tz / n
    return {
        'pelvis.location': offset(0, KNEE_Y - 0.44 * ty, 0.06 + 0.02 - 0.44 * tz - 1.0),
        'thigh.L': (0, ty, tz), 'thigh.R': (0, ty, tz),
        'shin.L': (0, 1, 0), 'shin.R': (0, 1, 0),
        'foot.L': (0, 1, -0.05), 'foot.R': (0, 1, -0.05),
    }


HANDS_ON_HIPS = {
    'clavicle.L': (1, 0.15, 0.1), 'clavicle.R': (-1, 0.15, 0.1),
    'upperarm.L': (0.05, 0.5, -0.86), 'upperarm.R': (-0.05, 0.5, -0.86),
    'forearm.L': (-0.1, -0.25, -0.96), 'forearm.R': (0.1, -0.25, -0.96),
    'hand.L': (-0.1, 0, -1), 'hand.R': (0.1, 0, -1),
}

KNEEL = {
    **kneel((0, 0, -1)),
}

HIPS = {
    **kneel((0, 0, -1)),
    **HANDS_ON_HIPS,
}

# "Lift the chest, press the hips forward, and begin arching the upper
# spine back": hands still on the hips, the arch just starting.
ARCH = {
    **kneel((0, 0.06, -1)),
    'pelvis': (0, 0.05, 1),
    'spine.lower': (0, 0.15, 0.99),
    'spine.upper': (0, 0.3, 0.95),
    'neck': (0, 0.4, 0.92), 'head': (0, 0.5, 0.87),
    **HANDS_ON_HIPS,
}

HEAD_BACK = {
    **kneel((0, 0.12, -1)),
    'pelvis': (0, 0.1, 1),
    'spine.lower': (0, 0.3, 0.95),
    'spine.upper': (0, 0.55, 0.83),
    'neck': (0, 0.8, 0.6),
    'head': (0, 0.95, 0.25),
    'clavicle.L': (1, 0.2, 0.1), 'clavicle.R': (-1, 0.2, 0.1),
    'upperarm.L': (0.05, 0.5, -0.87), 'upperarm.R': (-0.05, 0.5, -0.87),
    'forearm.L': (-0.1, -0.7, -0.7), 'forearm.R': (0.1, -0.7, -0.7),
    'hand.L': (-0.1, -0.2, -1), 'hand.R': (0.1, -0.2, -1),
}

def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def reach(shoulder, target, pole, b=0.35):
    """Upper-arm / forearm directions from `shoulder` to `target`, elbow
    bending toward `pole`. Upper arm 0.29; `b` is 0.35 to the fingertips
    (forearm + hand in line) or 0.25 to the wrist."""
    a = 0.29
    v = tuple(t - s for t, s in zip(target, shoulder))
    d = min(math.sqrt(sum(c * c for c in v)), a + b - 1e-4)
    u = _n(v)
    pd = sum(p * c for p, c in zip(pole, u))
    w = _n(tuple(p - pd * c for p, c in zip(pole, u)))
    x = (a * a - b * b + d * d) / (2 * d)
    h = math.sqrt(max(a * a - x * x, 0))
    elbow = tuple(s + x * uu + h * ww for s, uu, ww in zip(shoulder, u, w))
    end = tuple(s + d * uu for s, uu in zip(shoulder, u))
    return _n(tuple(e - s for e, s in zip(elbow, shoulder))), _n(tuple(e - l for e, l in zip(end, elbow)))


# Palm on the heel, fingers along the upturned sole toward the toes. The
# feet lie pointed (top of the foot on the floor), so the heel spur sits on
# top of the ankle at about (±0.10, KNEE_Y + 0.44, 0.13).
GRIP_HAND = _n((0, 0.6, -0.8))


def arms_to_heels(thigh, dirs):
    """Both palms onto the heels from the torso directions: the wrist is
    placed so the palm swelling (0.035 past it) sits on top of the heel."""
    t = _n(thigh)
    p = (0.0, KNEE_Y - 0.44 * t[1], 0.08 - 0.44 * t[2])
    for bone, length in (('pelvis', 0.12), ('spine.lower', 0.15), ('spine.upper', 0.13)):
        p = _add(p, _n(dirs[bone]), length)
    out = {}
    for side, sx in (('L', 1), ('R', -1)):
        clav = _n((sx, 0.1, -0.12))                    # shoulders drawn back and down
        out['clavicle.' + side] = clav
        shoulder = _add(p, clav, 0.2044)
        palm = (sx * 0.11, KNEE_Y + 0.44, 0.20)
        wrist = _add(palm, GRIP_HAND, -0.035)
        up, fo = reach(shoulder, wrist, (0, -1, 0), b=0.25)
        out['upperarm.' + side] = up
        out['forearm.' + side] = fo
        out['hand.' + side] = GRIP_HAND
    return out


def stage(thigh, torso):
    return {**kneel(thigh), **torso, **arms_to_heels(thigh, torso)}


HEELS_THIGH = (0, 0.12, -1)
HEELS_TORSO = {
    'pelvis': (0, 0.3, 0.95),
    'spine.lower': (0, 0.72, 0.7),
    'spine.upper': (0, 1, 0.02),
    'neck': (0, 0.55, -0.83),
    'head': (0, 0.25, -0.97),
}
HEELS = stage(HEELS_THIGH, HEELS_TORSO)


def arc(center, r, a0, a1, steps=7):
    """A sagittal arc (x = 0) as short guide lines; angles in degrees from
    +Y (behind) toward +Z (up)."""
    cy, cz = center
    pts = [(0.0, cy + r * math.cos(math.radians(a)), cz + r * math.sin(math.radians(a)))
           for a in (a0 + (a1 - a0) * i / steps for i in range(steps + 1))]
    return [{'from': p, 'to': q} for p, q in zip(pts, pts[1:])]


# Guides: the vertical plane at the knees (edge-on from the side) the hips
# stay forward of, and the arc the chest lifts along — up and over a
# barrel, not a fold at one hinge.
HEELS_GUIDES = [
    {'plane': 'y', 'at': KNEE_Y, 'z': (0.0, 1.05), 'w': 0.6},
    *arc((0.0, 0.52), 0.34, 165, 55),
]

# Common mistake: the hips sink back toward the heels, so the thighs tip
# back and the bend folds at the low back instead of lifting the chest.
GHOST_THIGH = (0, -0.45, -0.89)
HEELS_GHOST = {
    k: v for k, v in stage(GHOST_THIGH, {
        'pelvis': (0, 0.2, 0.98),
        'spine.lower': (0, 0.6, 0.8),
        'spine.upper': (0, 0.95, 0.1),
        'neck': (0, 0.45, -0.89),
        'head': (0, 0.2, -0.98),
    }).items() if HEELS.get(k) != v
}

POSTURE = {
    'id': 'camel',
    'position': {'start': 'kneeling', 'end': 'kneeling'},
    'view': 'side',
    'frame': {'center_z': 0.6, 'scale': 1.8},
    'transition': 8,
    'stages': [
        {'label': 'Kneel', 'pose': KNEEL, 'hold': 4},
        {'label': 'Hands on hips', 'pose': HIPS, 'hold': 5},
        {'label': 'Arch back', 'pose': ARCH, 'hold': 4},
        {'label': 'Head back', 'pose': HEAD_BACK, 'hold': 5},
        {'label': 'Heels in hand', 'pose': HEELS, 'hold': 10,
         'guides': HEELS_GUIDES, 'ghost': HEELS_GHOST},
        {'label': 'Rise', 'pose': HIPS, 'hold': 4},
    ],
}
