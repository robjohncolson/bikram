"""
Spine Twisting (Ardha Matsyendrasana) — stage poses for the mannequin rig.

Seated (pelvis joint at z≈0.12, sit bones on the floor). Right side: the left
knee folds down in front with the left heel beside the right hip, the right
foot steps over and plants outside the left knee, the left arm hooks over the
outside of the right knee to hold the left knee, and the right hand plants
on the floor behind. The twist itself is shown by rotating the shoulder
line (the clavicles) toward the right-back — the rig's bones are pure
directions with no roll, so the spine cannot visibly corkscrew and the tube
head has no face to turn; the shoulder line and the arms carry the read.
The left side is the exact mirror (`mirror`). Arms are solved by a small
two-bone reach so the hands land on their targets.
"""
import math

PELVIS = (0.0, 0.05, 0.12)


def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def _sub(a, b):
    return tuple(x - y for x, y in zip(a, b))


def offset(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


def reach(shoulder, target, pole):
    a, b = 0.29, 0.25
    v = _sub(target, shoulder)
    d = min(math.sqrt(sum(c * c for c in v)), a + b - 1e-4)
    u = _n(v)
    pd = sum(p * c for p, c in zip(pole, u))
    w = _n(tuple(p - pd * c for p, c in zip(pole, u)))
    x = (a * a - b * b + d * d) / (2 * d)
    h = math.sqrt(max(a * a - x * x, 0))
    elbow = tuple(s + x * uu + h * ww for s, uu, ww in zip(shoulder, u, w))
    end = tuple(s + d * uu for s, uu in zip(shoulder, u))
    return _n(_sub(elbow, shoulder)), _n(_sub(end, elbow))


def aim(start, target, length):
    """Direction from `start` toward `target` and the point `length` along it."""
    d = _n(_sub(target, start))
    return d, _add(start, d, length)


NECK = _add(PELVIS, (0, 0, 0.40))
HIP = {'L': (PELVIS[0] + 0.10, PELVIS[1], PELVIS[2] - 0.02),
       'R': (PELVIS[0] - 0.10, PELVIS[1], PELVIS[2] - 0.02)}

# Right-side legs (left knee down, right foot over it).
thL, kneeL = aim(HIP['L'], (0.02, PELVIS[1] - 0.44, 0.06), 0.44)
shL, _ankleL = aim(kneeL, (-0.26, PELVIS[1] - 0.02, 0.06), 0.44)
thR, kneeR = aim(HIP['R'], (-0.05, PELVIS[1] - 0.22, 0.52), 0.44)
shR, _ankleR = aim(kneeR, (0.2, PELVIS[1] - 0.42, 0.09), 0.44)
LEGS_RIGHT = {
    'thigh.L': thL, 'shin.L': shL, 'foot.L': (-0.55, 0.83, -0.05),
    'thigh.R': thR, 'shin.R': shR, 'foot.R': (0.1, -1, -0.15),
}


def arms(clav_l, clav_r, twist):
    """Left arm hooks outside the right knee to the left knee; right hand
    on the floor behind. `twist` 0..1 pulls the right hand further behind."""
    sl = _add(NECK, _n(clav_l), 0.2044)
    sr = _add(NECK, _n(clav_r), 0.2044)
    upL, foL = reach(sl, _add(kneeL, (-0.02, 0.02, 0.12)), (-1, -0.3, 0.4))
    upR, foR = reach(sr, (-0.08 - 0.05 * twist, PELVIS[1] + 0.25 + 0.08 * twist, 0.12), (-1, 0.3, 0))
    return {
        'clavicle.L': clav_l, 'clavicle.R': clav_r,
        'upperarm.L': upL, 'forearm.L': foL, 'hand.L': _n(_add(foL, (0, 0, -0.3))),
        'upperarm.R': upR, 'forearm.R': foR, 'hand.R': _n(_add(foR, (0, 0.3, -0.5))),
    }


BASE = {'pelvis.location': offset(0, PELVIS[1], PELVIS[2] - 1.0),
        'pelvis': (0, 0, 1), 'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1)}

SIT = {
    **BASE,
    'thigh.L': (0, -1, 0), 'shin.L': (0, -1, 0), 'foot.L': (0, -0.25, 1),
    'thigh.R': (0, -1, 0), 'shin.R': (0, -1, 0), 'foot.R': (0, -0.25, 1),
    **{k: v for side, sx in (('L', 1), ('R', -1))
       for k, v in zip(('clavicle.' + side, 'upperarm.' + side, 'forearm.' + side, 'hand.' + side),
                       ((sx, 0, 0.2),
                        *reach(_add(NECK, _n((sx, 0, 0.2)), 0.2044),
                               (sx * 0.3, PELVIS[1] + 0.14, 0.09), (0.3 * sx, 1, 0)),
                        (sx * 0.2, -0.5, -0.6)))},
}

SET_RIGHT = {**BASE, **LEGS_RIGHT, 'neck': (0, 0, 1), 'head': (0, 0, 1),
             **arms((1, -0.05, 0.2), (-1, 0.05, 0.2), 0)}

# Shoulder line turned ~60 degrees to the right: left shoulder forward,
# right shoulder back; the head follows a touch over the right shoulder.
RIGHT = {**BASE, **LEGS_RIGHT, 'neck': (-0.08, 0.06, 1), 'head': (-0.15, 0.12, 1),
         **arms((0.5, -0.87, 0.2), (-0.5, 0.87, 0.2), 1)}


def mirror(pose):
    """Swap left/right and flip X — the same shape on the other side."""
    out = {}
    for k, v in pose.items():
        if k == 'pelvis.location':
            out[k] = v
            continue
        name = k[:-2] + ('.R' if k.endswith('.L') else '.L') if k[-2:] in ('.L', '.R') else k
        out[name] = (-v[0], v[1], v[2])
    return out


SET_LEFT = mirror(SET_RIGHT)
LEFT = mirror(RIGHT)

POSTURE = {
    'id': 'spine-twisting',
    'view': 'back',
    'frame': {'center_z': 0.45, 'scale': 1.4},
    'transition': 8,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 3},
        {'label': 'Set the legs', 'pose': SET_RIGHT, 'hold': 4},
        {'label': 'Right side', 'pose': RIGHT, 'hold': 9},
        {'label': 'Change', 'pose': SET_LEFT, 'hold': 4},
        {'label': 'Left side', 'pose': LEFT, 'hold': 8},
        {'label': 'Release', 'pose': SIT, 'hold': 3},
    ],
}
