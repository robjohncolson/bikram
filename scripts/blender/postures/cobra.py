"""
Cobra Pose — prone, palms under the shoulders, the chest lifts on the
strength of the back while the legs stay together on the floor.

Prone recipe from the README (face toward -Y, legs +Y). The pelvis joint
stays on the mat; the spine curls up from it. The hands stay planted: the
arms are placed with a small two-bone IK from a forward-kinematics estimate
of the shoulders, elbows bent back and in. `pelvis.location` is in the
pelvis bone's rest frame ((a, b, c) -> world (a, -c, b)); `shift` converts.

Refined after the reference photograph (2026-09-29), keeping the 26 & 2 form
(hands under the shoulders, elbows bent and in): Lift was a steep, upright
stub with the elbows flaring; now the pelvis stays flat, the curl rises
from the low back and reaches forward so the shoulders sit over the wrists,
the head tips back to look up, and the elbows point back beside the ribs.
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



P = (0, -0.1, 0.12)                 # pelvis joint on the mat
UPPER, FORE = 0.29, 0.25
LOC = shift(0, -0.1, -0.88)
WRIST = {'R': (-0.24, -0.47, 0.035), 'L': (0.24, -0.47, 0.035)}   # palms under the shoulders

LEGS = {
    'thigh.L': (0.02, 1, 0), 'thigh.R': (-0.02, 1, 0),
    'shin.L': (0.0, 1, 0), 'shin.R': (0.0, 1, 0),
    'foot.L': (0, 1, -0.12), 'foot.R': (0, 1, -0.12),     # tops of the feet down, toes pointed
}


def body(pelvis, lower, upper, neck, head, clav_up=0.0):
    pose = {
        'pelvis.location': LOC,
        'pelvis': pelvis, 'spine.lower': lower, 'spine.upper': upper,
        'neck': neck, 'head': head,
        'clavicle.L': (1, 0, clav_up), 'clavicle.R': (-1, 0, clav_up),
        **LEGS,
    }
    return pose


def hands_down(pose, hint=None):
    base = _add(P, pose.get('pelvis.location', LOC), 1.0)
    base = _add(base, LOC, -1.0)
    p = _add(base, _n(pose['pelvis']), 0.12)
    p = _add(p, _n(pose['spine.lower']), 0.15)
    neck = _add(p, _n(pose['spine.upper']), 0.13)
    for s, sign in (('R', -1), ('L', 1)):
        shoulder = _add(neck, _n(pose[f'clavicle.{s}']), 0.204)
        h = hint or (0.05, 0.35, 1)
        up, fo = two_bone(shoulder, WRIST[s], UPPER, FORE, (sign * h[0], h[1], h[2]))
        pose[f'upperarm.{s}'] = up
        pose[f'forearm.{s}'] = fo
        pose[f'hand.{s}'] = (0, -1, -0.05)
    return pose


FLAT = ((0, -1, 0), (0, -1, 0), (0, -1, 0), (0, -1, 0.1), (0, -1, 0.1))

PRONE = {
    **body(*FLAT),
    'upperarm.L': (0.12, 1, 0), 'upperarm.R': (-0.12, 1, 0),
    'forearm.L': (0.12, 1, 0), 'forearm.R': (-0.12, 1, 0),
    'hand.L': (0.12, 1, 0), 'hand.R': (-0.12, 1, 0),
}

HANDS = hands_down(body(*FLAT))
# "Hug the elbows in against the ribs": the same hands, elbows tucked.
ELBOWS_IN = hands_down(body(*FLAT), hint=(-0.15, 0.4, 1))

# The half cobra: the pelvis stays flat and the navel on the mat, the curl
# rises from the low back and travels forward as much as up (the chest
# reaches past the hands' line, shoulders over the wrists), the neck follows
# the arch and the head tips back so the eyes find the ceiling. The elbows
# stay bent, pinned to the ribs and pointing back.
LIFT = hands_down(body(
    (0, -1, 0.04), (0, -0.93, 0.37), (0, -0.7, 0.71), (0, -0.33, 0.94), (0, 0.4, 0.92),
    clav_up=0.05,
), hint=(-0.12, 1, 0.55))



def diff(pose, base):
    """Only the entries of `pose` that differ from `base` (a ghost overlay)."""
    return {k: v for k, v in pose.items() if base.get(k) != v}


# Common mistake: pressing up with the arms — elbows lock nearly straight,
# the chest rises higher and more upright and the hips peel off the floor.
_ghost = {
    **body((0, -0.85, 0.53), (0, -0.55, 0.84), (0, -0.25, 0.97), (0, -0.2, 0.98), (0, -0.2, 0.98),
           clav_up=0.15),
    'pelvis.location': _add(LOC, (0, 0, 0.09)),
    'thigh.L': (0.02, 1, -0.2), 'thigh.R': (-0.02, 1, -0.2),
}
LIFT_GHOST = diff(hands_down(_ghost, hint=(0.05, 1, 0.1)), LIFT)

# Guides: the hip-height line the hips and navel stay under (on the floor)
# while the chest lifts, and the vertical over the palms (under the shoulders).
LIFT_GUIDES = [
    {'from': (0, -0.35, 0.25), 'to': (0, 1.05, 0.25)},
    {'from': (0, WRIST['R'][1], 0.0), 'to': (0, WRIST['R'][1], 0.75)},
]

POSTURE = {
    'id': 'cobra',
    'position': {'start': 'prone', 'end': 'prone'},
    'view': 'side',
    'frame': {'center_z': 0.35, 'scale': 2.4},
    'transition': 8,
    'stages': [
        {'label': 'Lie prone', 'pose': PRONE, 'hold': 4},
        {'label': 'Hands under shoulders', 'pose': HANDS, 'hold': 5},
        {'label': 'Elbows in', 'pose': ELBOWS_IN, 'hold': 4},
        {'label': 'Lift', 'pose': LIFT, 'hold': 10,
         'guides': LIFT_GUIDES, 'ghost': LIFT_GHOST},
        {'label': 'Lower', 'pose': HANDS, 'hold': 4},
    ],
}
