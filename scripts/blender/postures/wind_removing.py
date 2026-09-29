"""
Wind-Removing Pose — supine; hug the right knee, the left knee, then both.

Lying recipe from the README (head toward -Y, legs +Y). The arms are
solved with a tiny two-bone IK so the interlaced hands land on the shin
just below the knee. `pelvis.location` is a world-space offset of the
pelvis joint (the renderer maps it through the bone's rest matrix); `shift`
is an identity left in place so the stage tables read as before.

Refined after the reference photographs (2026-09-29): the hugged shins
lie near level with the feet above the hips (they sloped down to the
mat), and the left knee and both knees are drawn as deep as the right
(knee beside the ribcage toward the shoulder), the other leg flat and the
head down. FLAT (the canonical supine pose the bridges use) is unchanged.
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
THIGH_NEAR = _n((0, -0.3, 0.95))    # knee drawn up, not yet pulled in
SHIN_IN = _n((0, 0.97, -0.08))  # shins near level, feet above the hips


THIGH_DEEP = _n((0, -0.72, 0.69))   # knee pulled down beside the ribcage


def knee(side, dx=0.0, thigh=THIGH_IN):
    t = _n((thigh[0] + dx, thigh[1], thigh[2]))
    return _add(HIP[side], t, 0.44), t


def knee_up(side):
    """'Bend the knee and draw the thigh toward the chest': the knee up,
    hands not yet on it."""
    pose = {**FLAT}
    pose[f'thigh.{side}'] = THIGH_NEAR
    pose[f'shin.{side}'] = _n((0, 0.85, -0.5))
    pose[f'foot.{side}'] = (0, 0.6, 0.8)
    return pose


def hug(sides, lift=0.0, soft_leg=False, thigh=THIGH_IN):
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
            k, t = knee(s, thigh=thigh)
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


def ghost(sides, thigh=THIGH_IN):
    """Common mistake: yanking with the arms so the shoulders peel off the
    mat, and (one knee) the extended leg going soft at the knee."""
    return diff(hug(sides, lift=0.45, soft_leg=len(sides) == 1, thigh=thigh),
                hug(sides, thigh=thigh))


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
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': {'center_z': 0.35, 'scale': 2.4},
    'transition': 8,
    'stages': [
        {'label': 'Lie down', 'pose': FLAT, 'hold': 4},
        {'label': 'Right knee up', 'pose': knee_up('R'), 'hold': 4},
        {'label': 'Fingers below the knee', 'pose': hug('R'), 'hold': 4},
        {'label': 'Knee to the shoulder', 'pose': hug('R', thigh=THIGH_DEEP), 'hold': 8,
         'guides': GUIDES, 'ghost': ghost('R', THIGH_DEEP)},
        {'label': 'Left knee', 'pose': hug('L', thigh=THIGH_DEEP), 'hold': 8,
         'guides': GUIDES, 'ghost': ghost('L', THIGH_DEEP)},
        {'label': 'Both knees', 'pose': hug('RL', thigh=THIGH_DEEP), 'hold': 10,
         'guides': GUIDES, 'ghost': ghost('RL', THIGH_DEEP)},
        {'label': 'Release', 'pose': FLAT, 'hold': 4},
    ],
}
