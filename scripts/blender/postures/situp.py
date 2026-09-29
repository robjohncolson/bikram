"""
Sit-up — from supine with the arms overhead, swing up and fold forward over
straight legs, hands to the feet, forehead toward the knees.

Lying recipe from the README (head toward -Y). The pelvis joint stays on
the mat through every stage — only its direction changes — so the body
hinges in place. Arms are placed with a small two-bone IK from a forward
kinematics estimate of the shoulders. `pelvis.location` is a world-space
offset of the pelvis joint (the renderer maps it through the bone's rest
matrix); `shift` is an identity left in place so the tables read as before.

Refined after the reference photographs (2026-09-29): in Fold forward the
back rounds up from the hips into a dome and the head tucks down toward
the knees, the forehead over the knees (the torso lay long and flat with the head up, reaching past
the knees); arms still solved to the balls of the feet.
"""
import math
import sys
from pathlib import Path


def _warn_reach(dist, span, target):
    """Say so (stderr) when a reach target lies more than 1 cm beyond the
    chain: the helper clamps it, and the limb silently falls short."""
    if dist > span + 0.01:
        print(f'reach warning [{Path(__file__).stem}]: target '
              f'({target[0]:.3f}, {target[1]:.3f}, {target[2]:.3f}) is '
              f'{dist - span:.3f} m out of reach', file=sys.stderr)


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
    _raw = math.sqrt(_dot(d, d))
    _warn_reach(_raw, l1 + l2, target)
    dist = min(_raw, l1 + l2 - 1e-3)
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


def fold(bent=False):
    """The forward fold. `bent` is the ghost: knees bent up off the floor,
    the low back rounded and upright, the head dropped toward the knees."""
    if bent:
        pelvis, lower, upper = (0, 0.2, 0.98), (0, 0.6, 0.8), (0, 0.9, 0.35)
        head_dirs = {'neck': (0, 0.8, -0.6), 'head': (0, 0.6, -0.8)}
    else:
        # after the reference photographs: the back domes up from the
        # hips and the head tucks down toward the knees
        pelvis, lower, upper = (0, 0.3, 0.95), (0, 0.7, 0.71), (0, 0.99, 0.1)
        head_dirs = {'neck': (0, 0.9, -0.42), 'head': (0, 0.85, -0.52)}
    neck = neck_of(pelvis, lower, upper)
    pose = {
        'pelvis.location': LOC,
        'pelvis': pelvis, 'spine.lower': lower, 'spine.upper': upper,
        **head_dirs,
        **LEGS,
    }
    feet_y, feet_z = 0.74, 0.26
    if bent:
        th, sh = _n((0, 0.82, 0.57)), _n((0, 0.82, -0.57))
        for s, sign in (('R', -1), ('L', 1)):
            pose[f'thigh.{s}'] = (sign * 0.03, th[1], th[2])
            pose[f'shin.{s}'] = (sign * 0.03, sh[1], sh[2])
        ankle = _add(_add((0, 0.02, 0.10), th, 0.44), sh, 0.44)
        feet_y, feet_z = ankle[1], ankle[2] + 0.16
    for s, sign in (('R', -1), ('L', 1)):
        clav = _n((sign * 0.95, 0.3, -0.1))
        shoulder = _add(neck, clav, 0.204)
        wrist = (sign * 0.16, feet_y, feet_z)         # hands around the balls of the feet
        up, fo = two_bone(shoulder, wrist, UPPER, FORE, (sign * 0.5, 0, -1))
        pose[f'clavicle.{s}'] = clav
        pose[f'upperarm.{s}'] = up
        pose[f'forearm.{s}'] = fo
        pose[f'hand.{s}'] = (-sign * 0.3, 0.6, 0.4)
    return pose


def diff(pose, base):
    """Only the entries of `pose` that differ from `base` (a ghost overlay)."""
    return {k: v for k, v in pose.items() if base.get(k) != v}


FOLD = fold()
FOLD_GHOST = diff(fold(bent=True), FOLD)

# Guides: the floor line the straight legs and heels stay on, and the
# vertical over the knees the forehead dives toward.
FOLD_GUIDES = [
    {'from': (0, -0.3, 0.0), 'to': (0, 1.1, 0.0)},
    {'from': (0, 0.44, 0.0), 'to': (0, 0.44, 0.62)},
]

POSTURE = {
    'id': 'situp',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': {'center_z': 0.35, 'scale': 2.4},
    'transition': 8,
    'stages': [
        {'label': 'Arms overhead', 'pose': {**SUPINE, **ARMS_OVERHEAD}, 'hold': 5},
        {'label': 'Sit up', 'pose': SIT_UP, 'hold': 5},
        {'label': 'Fold forward', 'pose': FOLD, 'hold': 10,
         'guides': FOLD_GUIDES, 'ghost': FOLD_GHOST},
        {'label': 'Lie back', 'pose': {**SUPINE, **ARMS_DOWN}, 'hold': 5},
    ],
}
