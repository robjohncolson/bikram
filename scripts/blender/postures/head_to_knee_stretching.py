"""
Head to Knee with Stretching Pose (Janushirasana + Paschimottanasana) —
stage poses for the mannequin rig.

Seated: the pelvis joint sits at z≈0.12 so the sit bones rest on the floor,
legs reach forward (-Y). One leg straight with the toes pulled back, the
other folded with its sole against the straight leg's inner thigh; the fold
rounds the back and brings the forehead down to the knee while the hands
hold the foot. Then both legs straight and the flat fold. The arms are
solved by a small two-bone reach (`reach`) from the torso directions so the
hands land on the feet. Side view: the face points screen-right (-Y); the
camera sits on the mannequin's right (-X), so the right leg is nearest.
"""
import math

PELVIS = (0.0, 0.33, 0.12)
THIGH, SHIN, FOOT = 0.44, 0.44, 0.1644


def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def offset(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


def neck_of(dirs):
    p = _add(PELVIS, _n(dirs.get('pelvis', (0, 0, 1))), 0.12)
    p = _add(p, _n(dirs.get('spine.lower', (0, 0, 1))), 0.15)
    return _add(p, _n(dirs.get('spine.upper', (0, 0, 1))), 0.13)


def reach(shoulder, target, pole):
    """Upper-arm / forearm directions from `shoulder` to `target` (wrist),
    elbow bending toward `pole`."""
    a, b = 0.29, 0.25
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


def straight_leg(side, sx, splay=0.0):
    """Straight leg forward (splayed by `splay` toward its own side), toes
    pulled back. Returns (bones, world position of the ball of the foot)."""
    d = _n((sx * splay, -1, 0))
    hip = (PELVIS[0] + sx * 0.10, PELVIS[1], PELVIS[2] - 0.02)
    ankle = _add(hip, d, THIGH + SHIN)
    foot = _n((d[0] * 0.3, d[1] * 0.3, 1))
    ball = _add(ankle, foot, 0.12)
    return {'thigh.' + side: d, 'shin.' + side: d, 'foot.' + side: foot}, ball


def folded_leg(side, sx):
    """Knee out to its own side on the floor, sole against the other thigh."""
    return {
        'thigh.' + side: (sx * 0.78, -0.62, -0.08),
        'shin.' + side: (-sx * 0.97, -0.25, 0),
        'foot.' + side: (-sx * 0.35, -0.93, 0.05),
    }


def arms_to(dirs, targets, pole):
    """Hands to world targets (wrists placed just behind each target)."""
    neck = neck_of(dirs)
    out = {}
    for side, sx in (('L', 1), ('R', -1)):
        clav = _n((sx, -0.1, 0.2))
        out['clavicle.' + side] = clav
        shoulder = _add(neck, clav, 0.2044)
        tgt = targets[side]
        up, fo = reach(shoulder, tgt, pole)
        out['upperarm.' + side] = up
        out['forearm.' + side] = fo
        out['hand.' + side] = _n(_add(fo, (0, -0.3, 0.4)))
    return out


BASE = {'pelvis.location': offset(0, PELVIS[1], PELVIS[2] - 1.0)}

# --- Sit: both legs long, spine tall, hands on the thighs.
_legs_both, _ = straight_leg('L', 1)
_r, _ = straight_leg('R', -1)
_legs_both.update(_r)
TALL = {'pelvis': (0, 0, 1), 'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1),
        'neck': (0, 0, 1), 'head': (0, 0, 1)}
SIT = {**BASE, **_legs_both, **TALL,
       **arms_to(TALL, {'L': (0.14, PELVIS[1] - 0.35, 0.2), 'R': (-0.14, PELVIS[1] - 0.35, 0.2)}, (0, 1, 0))}


def head_to_knee(side, sx):
    """`side` is the straight leg; the torso folds over it."""
    other, ox = ('L', 1) if side == 'R' else ('R', -1)
    legs, ball = straight_leg(side, sx, splay=0.12)
    legs.update(folded_leg(other, ox))
    torso = {
        'pelvis': (sx * 0.06, -0.5, 0.87),
        'spine.lower': (sx * 0.1, -0.7, 0.7),
        'spine.upper': (sx * 0.1, -0.85, 0.3),
        'neck': (sx * 0.05, -0.5, -0.87),
        'head': (0, -0.7, -0.7),
    }
    wrist = _add(ball, (0, 0.06, 0.02))
    arms = arms_to(torso, {'L': _add(wrist, (0.07, 0, 0)), 'R': _add(wrist, (-0.07, 0, 0))}, (0, 0.2, -1))
    return {**BASE, **legs, **torso, **arms}


RIGHT = head_to_knee('R', -1)
LEFT = head_to_knee('L', 1)

_legs, _ballL = straight_leg('L', 1)
_r, _ballR = straight_leg('R', -1)
_legs.update(_r)
FOLD_TORSO = {
    'pelvis': (0, -0.55, 0.83),
    'spine.lower': (0, -1, 0.1),
    'spine.upper': (0, -1, 0),
    'neck': (0, -0.95, -0.3),
    'head': (0, -0.95, -0.3),
}
FOLD = {**BASE, **_legs, **FOLD_TORSO,
        **arms_to(FOLD_TORSO, {'L': _add(_ballL, (0.06, 0.06, 0.02)), 'R': _add(_ballR, (-0.06, 0.06, 0.02))},
                  (0, 0, -1))}

POSTURE = {
    'id': 'head-to-knee-stretching',
    'view': 'side',
    'frame': {'center_z': 0.42, 'scale': 1.45},
    'transition': 8,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 4},
        {'label': 'Right leg', 'pose': RIGHT, 'hold': 7},
        {'label': 'Left leg', 'pose': LEFT, 'hold': 7},
        {'label': 'Both legs', 'pose': FOLD, 'hold': 9},
        {'label': 'Release', 'pose': SIT, 'hold': 4},
    ],
}
