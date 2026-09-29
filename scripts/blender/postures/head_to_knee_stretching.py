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
        # rolled so the sole turns in against the other thigh (and the heel
        # spur stays off the floor)
        'foot.' + side: {'dir': (-sx * 0.35, -0.93, 0.05), 'roll': -sx * 70},
    }


def arms_to(dirs, targets, pole, hands=None):
    """Wrists to world targets; `hands` (side → direction) aims the hands,
    otherwise they carry on from the forearm, tipped up a little."""
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
        out['hand.' + side] = hands[side] if hands else _n(_add(fo, (0, -0.3, 0.4)))
    return out


def grip(ball, sx):
    """Wrist on the `sx` side of a toes-up foot, just heel-ward of the ball;
    the hand wraps round in front of the sole so the palm swelling sits on
    the foot's edge and the fingers cross the sole (interlaced)."""
    return _add(ball, (sx * 0.075, 0.04, -0.01)), _n((-sx * 0.55, -0.83, 0.0))


BASE = {'pelvis.location': offset(0, PELVIS[1], PELVIS[2] - 1.0)}

# --- Sit: both legs long, spine tall, hands on the thighs.
_legs_both, _ = straight_leg('L', 1)
_r, _ = straight_leg('R', -1)
_legs_both.update(_r)
TALL = {'pelvis': (0, 0, 1), 'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1),
        'neck': (0, 0, 1), 'head': (0, 0, 1)}
SIT = {**BASE, **_legs_both, **TALL,
       **arms_to(TALL, {'L': (0.14, PELVIS[1] - 0.35, 0.2), 'R': (-0.14, PELVIS[1] - 0.35, 0.2)}, (0, 1, 0))}


def fold_torso(sx):
    """The head-to-knee fold over the `sx` leg: hinged at the hips, the back
    rounding over the thigh, forehead down on the knee."""
    return {
        'pelvis': (sx * 0.06, -0.65, 0.76),
        'spine.lower': (sx * 0.1, -0.85, 0.5),
        'spine.upper': (sx * 0.08, -0.9, 0.0),
        'neck': (sx * 0.03, -0.6, -0.8),
        'head': (0, -0.8, -0.6),
    }


def head_to_knee(side, sx, torso=None):
    """`side` is the straight leg; the torso folds over it, forehead to the
    knee, both hands wrapping the foot."""
    other, ox = ('L', 1) if side == 'R' else ('R', -1)
    legs, ball = straight_leg(side, sx, splay=0.12)
    legs.update(folded_leg(other, ox))
    torso = torso or fold_torso(sx)
    (w_out, h_out), (w_in, h_in) = grip(ball, sx), grip(ball, -sx)
    targets = {side: w_out, other: w_in}
    hands = {side: h_out, other: h_in}
    arms = arms_to(torso, targets, (0, 0.2, -1), hands)
    return {**BASE, **legs, **torso, **arms}


def diff(pose, base):
    return {k: v for k, v in pose.items() if base.get(k) != v}


def leg_line(side, sx, splay=0.0):
    """Floor line under a straight leg, from behind the hip to past the toes."""
    d = _n((sx * splay, -1, 0))
    hip = (PELVIS[0] + sx * 0.10, PELVIS[1], 0.02)
    return {'from': _add(hip, d, -0.08), 'to': _add(hip, d, THIGH + SHIN + 0.2)}


def knee_guides(side, sx):
    """The floor line the straight leg stays flat along, and the vertical at
    the knee the forehead comes down to."""
    knee = _add((PELVIS[0] + sx * 0.10, PELVIS[1], 0.0), _n((sx * 0.12, -1, 0)), THIGH)
    return [leg_line(side, sx, 0.12),
            {'from': knee, 'to': (knee[0], knee[1], 0.45)}]


def knee_ghost(side, sx):
    """Common mistake: the hips stay upright and the back humps to reach the
    foot, so the head hangs over the thigh, short of the knee."""
    return diff(head_to_knee(side, sx, {
        'pelvis': (sx * 0.03, -0.25, 0.97),
        'spine.lower': (sx * 0.08, -0.6, 0.8),
        'spine.upper': (sx * 0.06, -0.95, 0.3),
        'neck': (sx * 0.02, -0.6, -0.8),
        'head': (0, -0.35, -0.94),
    }), head_to_knee(side, sx))


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
        **arms_to(FOLD_TORSO, {'L': grip(_ballL, 1)[0], 'R': grip(_ballR, -1)[0]}, (0, 0, -1),
                  {'L': grip(_ballL, 1)[1], 'R': grip(_ballR, -1)[1]})}

FOLD_GUIDES = [
    leg_line('R', -1),
    # the long, flat line the back lies along: belly, then chest, then head
    {'from': (0, PELVIS[1] - 0.05, 0.36), 'to': (0, PELVIS[1] - 0.95, 0.36)},
]

# Common mistake: sitting back on the tailbone and hunching to reach the
# feet — the back humps up above the flat line, the hands fall short.
_FOLD_GHOST_TORSO = {
    'pelvis': (0, -0.2, 0.98),
    'spine.lower': (0, -0.6, 0.8),
    'spine.upper': (0, -0.95, 0.3),
    'neck': (0, -0.6, -0.8),
    'head': (0, -0.35, -0.94),
}
FOLD_GHOST = diff({**FOLD, **_FOLD_GHOST_TORSO, **arms_to(
    _FOLD_GHOST_TORSO, {'L': grip(_ballL, 1)[0], 'R': grip(_ballR, -1)[0]}, (0, 0, -1),
    {'L': grip(_ballL, 1)[1], 'R': grip(_ballR, -1)[1]})}, FOLD)

# "Square the torso over the extended leg and interlace your fingers
# around the ball of the right foot": sitting tall, reaching for the foot.
HOLD_FOOT = head_to_knee('R', -1, torso={
    'pelvis': (0, -0.25, 0.97),
    'spine.lower': (0, -0.35, 0.94),
    'spine.upper': (0, -0.4, 0.92),
    'neck': (0, -0.3, 0.95),
    'head': (0, -0.35, 0.94),
})

POSTURE = {
    'id': 'head-to-knee-stretching',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'side',
    'frame': {'center_z': 0.42, 'scale': 1.45},
    'transition': 8,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 4},
        {'label': 'Hold the foot', 'pose': HOLD_FOOT, 'hold': 4},
        {'label': 'Forehead to the knee', 'pose': RIGHT, 'hold': 7,
         'guides': knee_guides('R', -1), 'ghost': knee_ghost('R', -1)},
        {'label': 'Left leg', 'pose': LEFT, 'hold': 7,
         'guides': knee_guides('L', 1), 'ghost': knee_ghost('L', 1)},
        {'label': 'Both legs', 'pose': FOLD, 'hold': 9,
         'guides': FOLD_GUIDES, 'ghost': FOLD_GHOST},
        {'label': 'Release', 'pose': SIT, 'hold': 4},
    ],
}
