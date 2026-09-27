"""
Wind-Removing Pose — supine; hug the right knee, the left knee, then both.

Lying recipe from the README (head toward -Y, legs +Y). The arms are
solved with a tiny two-bone IK so the interlaced hands land on the shin
just below the knee. `pelvis.location` is in the pelvis bone's rest frame,
which maps (a, b, c) to world (a, -c, b) — `shift` converts.
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


P = (0, -0.1, 0.12)                 # pelvis joint on the mat
HIP = {'R': _add(P, (-0.10, 0, -0.02)), 'L': _add(P, (0.10, 0, -0.02))}
NECK = _add(P, (0, -0.40, 0))
CLAV = {'R': _n((-1, 0.05, 0)), 'L': _n((1, 0.05, 0))}
SHOULDER = {s: _add(NECK, CLAV[s], 0.204) for s in 'RL'}
UPPER, FORE = 0.29, 0.25

TORSO = {
    'pelvis.location': shift(0, -0.1, -0.88),
    'pelvis': (0, -1, 0),
    'spine.lower': (0, -1, 0),
    'spine.upper': (0, -1, 0),
    'neck': (0, -1, 0.05),
    'head': (0, -1, 0),
    'clavicle.R': CLAV['R'], 'clavicle.L': CLAV['L'],
}

ARMS_DOWN = {
    'upperarm.L': (0.1, 1, 0), 'upperarm.R': (-0.1, 1, 0),
    'forearm.L': (0.1, 1, 0), 'forearm.R': (-0.1, 1, 0),
    'hand.L': (0.1, 1, 0), 'hand.R': (-0.1, 1, 0),
}

LONG_LEG = {'R': {'thigh.R': (-0.03, 1, 0), 'shin.R': (-0.03, 1, 0), 'foot.R': (0, 0.3, 1)},
            'L': {'thigh.L': (0.03, 1, 0), 'shin.L': (0.03, 1, 0), 'foot.L': (0, 0.3, 1)}}

THIGH_IN = _n((0, -0.55, 0.83))     # knee pulled toward the chest
SHIN_IN = _n((0, 0.9, -0.35))


def knee(side, dx=0.0):
    t = _n((THIGH_IN[0] + dx, THIGH_IN[1], THIGH_IN[2]))
    return _add(HIP[side], t, 0.44), t


def hug(sides, lift=0.0, soft_leg=False):
    """Knee(s) in, hands interlaced on the shin(s) just below the knee.
    `lift` curls the upper back off the mat (shoulders rising); `soft_leg`
    lets the extended leg's knee bend up — both only used by the ghost."""
    pose = {**TORSO}
    shoulder = SHOULDER
    if lift:
        upper = _n((0, -1, lift))
        neck = _add(_add(P, (0, -0.27, 0)), upper, 0.13)
        shoulder = {s: _add(neck, CLAV[s], 0.204) for s in 'RL'}
        pose.update({'spine.upper': upper, 'neck': _n((0, -1, lift * 1.4)),
                     'head': _n((0, -1, lift * 1.6))})
    grips = []
    for s in 'RL':
        if s in sides:
            k, t = knee(s)
            pose[f'thigh.{s}'] = t
            pose[f'shin.{s}'] = SHIN_IN
            pose[f'foot.{s}'] = (0, 0.6, 0.8)
            grips.append(_add(k, SHIN_IN, 0.10))
        elif soft_leg:
            sx = -0.03 if s == 'R' else 0.03
            pose.update({f'thigh.{s}': (sx, 1, 0.42), f'shin.{s}': (sx, 1, -0.42),
                         f'foot.{s}': (0, 0.3, 1)})
        else:
            pose.update(LONG_LEG[s])
    gx = sum(g[0] for g in grips) / len(grips)
    gy = sum(g[1] for g in grips) / len(grips)
    gz = max(g[2] for g in grips) + 0.04          # hands wrap over the top
    spread = 0.10 if len(grips) == 1 else 0.17
    for s, sign in (('R', -1), ('L', 1)):
        wrist = (gx + sign * spread, gy, gz)
        up, fo = two_bone(shoulder[s], wrist, UPPER, FORE, (sign, 0.1, 0.1))
        pose[f'upperarm.{s}'] = up
        pose[f'forearm.{s}'] = fo
        pose[f'hand.{s}'] = (-sign, 0, 0.5)
    return pose


def diff(pose, base):
    """Only the entries of `pose` that differ from `base` (a ghost overlay)."""
    return {k: v for k, v in pose.items() if base.get(k) != v}


def ghost(sides):
    """Common mistake: yanking with the arms so the shoulders peel off the
    mat, and (one knee) the extended leg going soft at the knee."""
    return diff(hug(sides, lift=0.45, soft_leg=len(sides) == 1), hug(sides))


# Guides: the floor line the shoulders and back stay long on, and the
# vertical over the shoulder that the knee is drawn toward (the shoulder,
# not the chest).
GUIDES = [
    {'from': (0, -1.0, 0.0), 'to': (0, 1.05, 0.0)},
    {'from': (0, SHOULDER['R'][1], 0.0), 'to': (0, SHOULDER['R'][1], 0.72)},
]

FLAT = {**TORSO, **ARMS_DOWN, **LONG_LEG['R'], **LONG_LEG['L']}

POSTURE = {
    'id': 'wind-removing',
    'view': 'side',
    'frame': {'center_z': 0.35, 'scale': 2.4},
    'transition': 8,
    'stages': [
        {'label': 'Lie down', 'pose': FLAT, 'hold': 4},
        {'label': 'Right knee', 'pose': hug('R'), 'hold': 8,
         'guides': GUIDES, 'ghost': ghost('R')},
        {'label': 'Left knee', 'pose': hug('L'), 'hold': 8,
         'guides': GUIDES, 'ghost': ghost('L')},
        {'label': 'Both knees', 'pose': hug('RL'), 'hold': 10,
         'guides': GUIDES, 'ghost': ghost('RL')},
        {'label': 'Release', 'pose': FLAT, 'hold': 4},
    ],
}
