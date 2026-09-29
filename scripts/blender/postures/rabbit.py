"""
Rabbit (Sasangasana) — stage poses for the mannequin rig.

Kneeling base with the knees planted at y=KNEE_Y, z≈0.06 and the shins flat
on the floor pointing back (+Y). The hands hold the heels throughout the
curl, so the arms are solved each stage by a tiny two-bone reach
(`arms_to_heels`) from the torso directions instead of being hand-aimed.
Side view: the face points screen-right (-Y), the heels sit screen-left.
The palms land on the heels (`GRIP_HAND`); "Hips up" carries teaching
guides and a ghost of the common mistake.
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


def reach(shoulder, target, pole, b=0.25):
    """Upper arm / forearm directions from `shoulder` to `target` (the
    wrist), elbow bending toward `pole`. Lengths 0.29 and `b`."""
    a = 0.29
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


# The feet lie pointed (tops on the floor), so the heel spur sits on top of
# the ankle at about (±0.10, KNEE_Y + SHIN, 0.13). The grip puts the palm
# swelling (0.035 past the wrist) on the outside-top of each heel, fingers
# wrapping back and down around it.
GRIP_HAND = _n((0, 0.45, -0.9))


def arms_to_heels(pelvis_joint, dirs, pole=(0, 1, 0), clav=(0.0, 0.2), hand=GRIP_HAND):
    """Both palms onto the heels from the torso directions. `clav` is the
    clavicles' (y, z) lean: (0.45, -0.3) draws the shoulders back toward the
    heels, which the curled stages need for the straight arms to arrive."""
    neck = spine(pelvis_joint, dirs)
    out = {}
    for side, sx in (('L', 1), ('R', -1)):
        c = _n((sx, clav[0], clav[1]))
        out['clavicle.' + side] = c
        shoulder = _add(neck, c, 0.2044)
        palm = (sx * 0.13, KNEE_Y + SHIN - 0.01, 0.18)
        wrist = _add(palm, hand, -0.035)
        up, fo = reach(shoulder, wrist, pole)
        out['upperarm.' + side] = up
        out['forearm.' + side] = fo
        out['hand.' + side] = hand
    return out


def stage(thigh, torso, pole=(0, 1, 0), arms=None, clav=(0.0, 0.2)):
    legs, pj = kneel(thigh)
    pose = {**legs, **torso}
    pose.update(arms if arms is not None else arms_to_heels(pj, torso, pole, clav))
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

# "Tuck the chin tightly to the chest": still sitting, holding the heels.
TUCK = stage(SIT_THIGH, {**UPRIGHT, 'neck': (0, -0.6, 0.8), 'head': (0, -0.92, 0.4)})

ROLL = stage((0, -0.75, -0.66), {
    'pelvis': (0, -0.55, 0.83),
    'spine.lower': (0, -0.95, 0.3),
    'spine.upper': (0, -0.8, -0.6),
    'neck': (0, -0.2, -0.98),
    'head': (0, 0.35, -0.94),
})

HIPS_UP_THIGH = (0, -0.1, -1)
HIPS_UP = stage(HIPS_UP_THIGH, {
    'pelvis': (0, -0.7, 0.72),
    'spine.lower': (0, -0.75, -0.66),
    'spine.upper': (0, -0.05, -1),
    'neck': (0, 0.45, -0.9),
    'head': (0, 0.35, -0.94),
}, pole=(0, 0, 1), clav=(0.45, -0.3))
_, _HIPS_UP_PJ = kneel(HIPS_UP_THIGH)

# Guides: the vertical at the knees (edge-on pane from the side) — the
# crown lands at its foot and the hips stack straight up it — and the
# height the hips lift to, carried back over the heels the hands pull on.
HIPS_UP_GUIDES = [
    {'plane': 'y', 'at': KNEE_Y, 'z': (0.0, 0.85), 'w': 0.6},
    {'from': (0, KNEE_Y - 0.12, _HIPS_UP_PJ[2] + 0.1), 'to': (0, KNEE_Y + SHIN + 0.1, _HIPS_UP_PJ[2] + 0.1)},
]

# Common mistake: the hips stay low toward the heels, the head takes the
# weight further forward and the arms go slack (elbows bent, no pull).
GHOST_THIGH = (0, -0.5, -0.87)
HIPS_UP_GHOST = {
    k: v for k, v in stage(GHOST_THIGH, {
        'pelvis': (0, -0.85, 0.52),
        'spine.lower': (0, -0.9, -0.3),
        'spine.upper': (0, -0.3, -0.95),
        'neck': (0, 0.2, -0.98),
        'head': (0, 0.3, -0.95),
    }, pole=(0, -0.2, -1)).items() if HIPS_UP.get(k) != v
}

POSTURE = {
    'id': 'rabbit',
    'view': 'side',
    'frame': {'center_z': 0.55, 'scale': 1.6},
    'transition': 8,
    'stages': [
        {'label': 'Sit on the heels', 'pose': SIT, 'hold': 4},
        {'label': 'Hold the heels', 'pose': HOLD, 'hold': 4},
        {'label': 'Tuck the chin', 'pose': TUCK, 'hold': 4},
        {'label': 'Crown to the floor', 'pose': ROLL, 'hold': 5},
        {'label': 'Hips up', 'pose': HIPS_UP, 'hold': 10,
         'guides': HIPS_UP_GUIDES, 'ghost': HIPS_UP_GHOST},
        {'label': 'Rise', 'pose': HOLD, 'hold': 4},
    ],
}
