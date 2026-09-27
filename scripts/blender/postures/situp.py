"""
Sit-up — from supine with the arms overhead, swing up and fold forward over
straight legs, hands to the feet, forehead toward the knees.

Lying recipe from the README (head toward -Y). The pelvis joint stays on
the mat through every stage — only its direction changes — so the body
hinges in place. Arms are placed with a small two-bone IK from a forward
kinematics estimate of the shoulders. `pelvis.location` is in the pelvis
bone's rest frame ((a, b, c) -> world (a, -c, b)); `shift` converts.
"""
import math


def _n(v):
    l = math.sqrt(sum(c * c for c in v))
    return tuple(c / l for c in v)


def _add(a, b, s=1.0):
    return tuple(x + s * y for x, y in zip(a, b))


def _dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def two_bone(root, target, l1, l2, hint):
    """Directions of the two bones from `root` reaching `target`, the middle
    joint bent toward `hint`."""
    d = _add(target, root, -1)
    dist = min(math.sqrt(_dot(d, d)), l1 + l2 - 1e-3)
    u = _n(d)
    x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    r = math.sqrt(max(l1 * l1 - x * x, 0.0))
    v = _n(_add(hint, u, -_dot(hint, u)))
    mid = _add(_add(root, u, x), v, r)
    return _n(_add(mid, root, -1)), _n(_add(target, mid, -1))


def shift(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)



P = (0, 0.0, 0.12)                  # pelvis joint on the mat (centred: arms overhead reach screen-right)
UPPER, FORE = 0.29, 0.25
LOC = shift(0, 0.0, -0.88)


def neck_of(pelvis, lower, upper):
    """Forward kinematics of the torso chain from the pelvis joint."""
    p = _add(P, _n(pelvis), 0.12)
    p = _add(p, _n(lower), 0.15)
    return _add(p, _n(upper), 0.13)


LEGS = {
    'thigh.L': (0.03, 1, 0), 'thigh.R': (-0.03, 1, 0),
    'shin.L': (0.03, 1, 0), 'shin.R': (-0.03, 1, 0),
    'foot.L': (0, 0.3, 1), 'foot.R': (0, 0.3, 1),
}

SUPINE = {
    'pelvis.location': LOC,
    'pelvis': (0, -1, 0), 'spine.lower': (0, -1, 0), 'spine.upper': (0, -1, 0),
    'neck': (0, -1, 0.05), 'head': (0, -1, 0),
    **LEGS,
}

ARMS_OVERHEAD = {
    'clavicle.L': (1, -0.1, 0), 'clavicle.R': (-1, -0.1, 0),
    'upperarm.L': (0.08, -1, 0), 'upperarm.R': (-0.08, -1, 0),
    'forearm.L': (0.03, -1, 0), 'forearm.R': (-0.03, -1, 0),
    'hand.L': (0, -1, 0), 'hand.R': (0, -1, 0),
}

ARMS_DOWN = {
    'clavicle.L': (1, 0.05, 0), 'clavicle.R': (-1, 0.05, 0),
    'upperarm.L': (0.12, 1, 0), 'upperarm.R': (-0.12, 1, 0),
    'forearm.L': (0.12, 1, 0), 'forearm.R': (-0.12, 1, 0),
    'hand.L': (0.12, 1, 0), 'hand.R': (-0.12, 1, 0),
}

# Half-way up: torso rising, arms swinging overhead and forward.
SIT_UP = {
    'pelvis.location': LOC,
    'pelvis': (0, -0.25, 0.97), 'spine.lower': (0, -0.12, 0.99), 'spine.upper': (0, -0.02, 1),
    'neck': (0, 0.1, 1), 'head': (0, 0.15, 1),
    **LEGS,
    'clavicle.L': (1, 0, 0.1), 'clavicle.R': (-1, 0, 0.1),
    'upperarm.L': (0.05, 0.45, 0.89), 'upperarm.R': (-0.05, 0.45, 0.89),
    'forearm.L': (0.03, 0.55, 0.83), 'forearm.R': (-0.03, 0.55, 0.83),
    'hand.L': (0, 0.6, 0.8), 'hand.R': (0, 0.6, 0.8),
}


def fold():
    pelvis, lower, upper = (0, 0.5, 0.87), (0, 0.8, 0.6), (0, 0.9, 0.4)
    neck = neck_of(pelvis, lower, upper)
    pose = {
        'pelvis.location': LOC,
        'pelvis': pelvis, 'spine.lower': lower, 'spine.upper': upper,
        'neck': (0, 0.95, 0.3), 'head': (0, 0.97, 0.2),
        **LEGS,
    }
    for s, sign in (('R', -1), ('L', 1)):
        clav = _n((sign * 0.95, 0.3, -0.1))
        shoulder = _add(neck, clav, 0.204)
        wrist = (sign * 0.16, 0.74, 0.26)             # hands around the balls of the feet
        up, fo = two_bone(shoulder, wrist, UPPER, FORE, (sign * 0.5, 0, -1))
        pose[f'clavicle.{s}'] = clav
        pose[f'upperarm.{s}'] = up
        pose[f'forearm.{s}'] = fo
        pose[f'hand.{s}'] = (-sign * 0.3, 0.6, 0.4)
    return pose


POSTURE = {
    'id': 'situp',
    'view': 'side',
    'frame': {'center_z': 0.35, 'scale': 2.4},
    'transition': 8,
    'stages': [
        {'label': 'Arms overhead', 'pose': {**SUPINE, **ARMS_OVERHEAD}, 'hold': 5},
        {'label': 'Sit up', 'pose': SIT_UP, 'hold': 5},
        {'label': 'Fold forward', 'pose': fold(), 'hold': 10},
        {'label': 'Lie back', 'pose': {**SUPINE, **ARMS_DOWN}, 'hold': 5},
    ],
}
