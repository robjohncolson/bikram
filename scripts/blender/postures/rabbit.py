"""
Rabbit (Sasangasana) — stage poses for the mannequin rig.

Kneeling base with the knees planted at y=KNEE_Y, z≈0.06 and the shins flat
on the floor pointing back (+Y). The hands hold the heels throughout the
curl, so the arms are solved each stage by a tiny two-bone reach
(`arms_to_heels`) from the torso directions instead of being hand-aimed.
Side view: the face points screen-right (-Y), the heels sit screen-left.
"""
import math

KNEE_Y = -0.28
KNEE_Z = 0.06
SHIN = 0.44


def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def offset(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


def kneel(thigh):
    """Kneeling legs; returns (pose dict, world pelvis joint)."""
    t = _n(thigh)
    pelvis = (0.0, KNEE_Y - 0.44 * t[1], KNEE_Z + 0.02 - 0.44 * t[2])
    pose = {
        'pelvis.location': offset(0, pelvis[1], pelvis[2] - 1.0),
        'thigh.L': t, 'thigh.R': t,
        'shin.L': (0, 1, 0), 'shin.R': (0, 1, 0),
        'foot.L': (0, 1, -0.05), 'foot.R': (0, 1, -0.05),
    }
    return pose, pelvis


def spine(pelvis_joint, dirs):
    """World position of the neck joint from the torso directions."""
    p = _add(pelvis_joint, _n(dirs.get('pelvis', (0, 0, 1))), 0.12)
    p = _add(p, _n(dirs.get('spine.lower', (0, 0, 1))), 0.15)
    return _add(p, _n(dirs.get('spine.upper', (0, 0, 1))), 0.13)


def reach(shoulder, target, pole):
    """Upper arm / forearm+hand directions from `shoulder` to `target`,
    elbow bending toward `pole`. Lengths 0.29 and 0.35 (forearm + hand)."""
    a, b = 0.29, 0.35
    v = tuple(t - s for t, s in zip(target, shoulder))
    d = min(math.sqrt(sum(c * c for c in v)), a + b - 1e-4)
    u = _n(v)
    # component of pole perpendicular to u
    pd = sum(p * c for p, c in zip(pole, u))
    w = _n(tuple(p - pd * c for p, c in zip(pole, u)))
    x = (a * a - b * b + d * d) / (2 * d)
    h = math.sqrt(max(a * a - x * x, 0))
    elbow = tuple(s + x * uu + h * ww for s, uu, ww in zip(shoulder, u, w))
    end = tuple(s + d * uu for s, uu in zip(shoulder, u))
    up = _n(tuple(e - s for e, s in zip(elbow, shoulder)))
    fo = _n(tuple(e - l for e, l in zip(end, elbow)))
    return up, fo


def arms_to_heels(pelvis_joint, dirs, pole=(0, 1, 0), grip_z=0.12):
    neck = spine(pelvis_joint, dirs)
    out = {}
    for side, sx in (('L', 1), ('R', -1)):
        clav = _n((sx, 0.0, 0.2))
        out['clavicle.' + side] = clav
        shoulder = _add(neck, clav, 0.2044)
        heel = (sx * 0.12, KNEE_Y + SHIN - 0.02, grip_z)
        up, fo = reach(shoulder, heel, pole)
        out['upperarm.' + side] = up
        out['forearm.' + side] = fo
        out['hand.' + side] = fo
    return out


def stage(thigh, torso, pole=(0, 1, 0), arms=None):
    legs, pj = kneel(thigh)
    pose = {**legs, **torso}
    pose.update(arms if arms is not None else arms_to_heels(pj, torso, pole))
    return pose


SIT_THIGH = (0, -0.93, -0.36)
UPRIGHT = {'pelvis': (0, 0, 1), 'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1),
           'neck': (0, 0, 1), 'head': (0, 0, 1)}

HANDS_ON_THIGHS = {
    'upperarm.L': (0, -0.25, -0.97), 'upperarm.R': (0, -0.25, -0.97),
    'forearm.L': (-0.05, -0.85, -0.5), 'forearm.R': (0.05, -0.85, -0.5),
    'hand.L': (0, -0.9, -0.4), 'hand.R': (0, -0.9, -0.4),
}

SIT = stage(SIT_THIGH, UPRIGHT, arms=HANDS_ON_THIGHS)

HOLD = stage(SIT_THIGH, {**UPRIGHT, 'neck': (0, -0.5, 0.87), 'head': (0, -0.7, 0.7)})

ROLL = stage((0, -0.75, -0.66), {
    'pelvis': (0, -0.55, 0.83),
    'spine.lower': (0, -0.95, 0.3),
    'spine.upper': (0, -0.8, -0.6),
    'neck': (0, -0.2, -0.98),
    'head': (0, 0.35, -0.94),
})

HIPS_UP = stage((0, -0.05, -1), {
    'pelvis': (0, -0.75, 0.66),
    'spine.lower': (0, -0.8, -0.6),
    'spine.upper': (0, -0.15, -0.99),
    'neck': (0, 0.4, -0.92),
    'head': (0, 0.6, -0.8),
}, pole=(0, 0, 1))

POSTURE = {
    'id': 'rabbit',
    'view': 'side',
    'frame': {'center_z': 0.55, 'scale': 1.6},
    'transition': 8,
    'stages': [
        {'label': 'Sit on the heels', 'pose': SIT, 'hold': 4},
        {'label': 'Hold the heels', 'pose': HOLD, 'hold': 4},
        {'label': 'Roll forward', 'pose': ROLL, 'hold': 5},
        {'label': 'Hips up', 'pose': HIPS_UP, 'hold': 10},
        {'label': 'Rise', 'pose': HOLD, 'hold': 4},
    ],
}
