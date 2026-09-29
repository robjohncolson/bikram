"""
Standing Head to Knee (Dandayamana-Janushirasana) — stage poses for the rig.

Right leg first: stand on the locked left leg, fold forward and hold the
right foot with interlaced hands; kick the right leg out level with the
floor; bend the elbows down below the calf; round forward until the
forehead meets the knee. The left side repeats the full expression.
Side view from the mannequin's right, so the working leg is nearest.

Refined after the reference photographs (2026-09-29): in Elbows down and
Head to knee the back rounds UP from the hips into a dome over the level
leg and the head hangs from it, so the forehead comes down onto the knee
(it lay flat along the leg, the head at hip height); the shoulders round
forward and both arms are solved (`hold_foot`) so the interlaced hands
really hold the foot, the elbows bent down below the calf. Kick out's
straight arms are solved to the foot too.
"""
import math
import sys
from pathlib import Path


def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def _warn_reach(dist, span, target):
    """Say so (stderr) when a reach target lies more than 1 cm beyond the
    chain: the helper clamps it, and the limb silently falls short."""
    if dist > span + 0.01:
        print(f'reach warning [{Path(__file__).stem}]: target '
              f'({target[0]:.3f}, {target[1]:.3f}, {target[2]:.3f}) is '
              f'{dist - span:.3f} m out of reach', file=sys.stderr)


def two_bone(root, target, l1, l2, hint):
    """Directions of two bones from `root` reaching `target`, the middle
    joint bent toward `hint`."""
    d = _add(target, root, -1)
    raw = math.sqrt(sum(c * c for c in d))
    _warn_reach(raw, l1 + l2, target)
    dist = min(raw, l1 + l2 - 1e-3)
    u = _n(d)
    x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    r = math.sqrt(max(l1 * l1 - x * x, 0.0))
    hu = sum(h * c for h, c in zip(hint, u))
    v = _n(_add(hint, u, -hu))
    mid = _add(_add(root, u, x), v, r)
    return _n(_add(mid, root, -1)), _n(_add(target, mid, -1))


def neck_at(torso):
    """World neck joint for torso directions (pelvis joint at rest, 1.0 m)."""
    p = (0.0, 0.0, 1.0)
    for bone, length in (('pelvis', 0.12), ('spine.lower', 0.15), ('spine.upper', 0.13)):
        p = _add(p, _n(torso[bone]), length)
    return p


def hold_foot(torso, clav, reach_y, reach_z, elbow_hint, hand):
    """Both arms from shoulders set by clavicle direction `clav` (x mirrored)
    to wrists either side of the held (right) foot at (y, z) = (reach_y,
    reach_z); the hands (`hand`, x mirrored inward) wrap under the foot."""
    neck = neck_at(torso)
    out = {}
    for side, s in (('L', 1), ('R', -1)):
        c = _n((s * clav[0], clav[1], clav[2]))
        shoulder = _add(neck, c, 0.204)
        wrist = (-0.10 + s * 0.035, reach_y, reach_z)
        up, fo = two_bone(shoulder, wrist, 0.29, 0.25, elbow_hint)
        out[f'clavicle.{side}'] = c
        out[f'upperarm.{side}'], out[f'forearm.{side}'] = up, fo
        out[f'hand.{side}'] = (-s * hand[0], hand[1], hand[2])
    return out


def mirror(pose):
    """Swap .L/.R and flip X to get the other side."""
    out = {}
    for name, v in pose.items():
        if name.endswith('.L'):
            name = name[:-2] + '.R'
        elif name.endswith('.R'):
            name = name[:-2] + '.L'
        out[name] = (-v[0], v[1], v[2])
    return out


def both_arms(upper, fore, hand):
    """Both arms reach for the one foot together (interlaced fingers)."""
    return {
        'upperarm.L': (-0.12, upper[1], upper[2]), 'upperarm.R': (0.12, upper[1], upper[2]),
        'forearm.L': (-0.1, fore[1], fore[2]), 'forearm.R': (0.1, fore[1], fore[2]),
        'hand.L': (-0.4, hand[1], hand[2]), 'hand.R': (0.4, hand[1], hand[2]),
    }



# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

# "Fix all your weight into one leg and lock that knee": standing tall
# on the left, the right heel just off the floor.
LOCK = {
    'pelvis.location': (0.03, 0, 0),
    'thigh.L': (-0.09, 0, -1), 'shin.L': (-0.07, 0, -1),
    'thigh.R': (0.09, 0, -1), 'shin.R': (0.07, 0.08, -1),
    'foot.R': (0, -0.85, -0.5),
}

# Knee lifted, torso folded, straight arms holding the foot.
HOLD = {
    'pelvis': (0, -0.5, 0.87),
    'spine.lower': (0, -0.7, 0.71),
    'spine.upper': (0, -0.8, 0.6),
    'neck': (0, -0.85, 0.3), 'head': (0, -0.7, -0.2),
    'thigh.R': (0, -0.95, 0.3),
    'shin.R': (0, -0.5, -0.87),
    'foot.R': (0, -0.9, 0.4),
    **both_arms((0, -0.55, -0.83), (0, -0.55, -0.83), (0, -0.7, -0.6)),
}

# The right leg kicks straight out, level with the floor, heel pushing
# away; straight arms hold the foot.
KICK_TORSO = {
    'pelvis': (0, -0.6, 0.8),
    'spine.lower': (0, -0.8, 0.6),
    'spine.upper': (0, -0.9, 0.45),
}
KICK = {
    **KICK_TORSO,
    'neck': (0, -0.9, 0.3), 'head': (0, -0.9, 0.2),
    'thigh.R': (0, -1, 0.04), 'shin.R': (0, -1, 0.04),
    'foot.R': (0, -0.2, 1),
    **hold_foot(KICK_TORSO, (0.85, -0.5, 0.1), -0.80, 1.02, (0, 0.2, -1), (0.4, -0.5, 0.75)),
}

# Elbows bend down below the calf, the back starts to round up over the leg.
ELBOWS_TORSO = {
    'pelvis': (0, -0.45, 0.89),
    'spine.lower': (0, -0.8, 0.6),
    'spine.upper': (0, -0.97, 0.2),
}
ELBOWS = {
    **ELBOWS_TORSO,
    'neck': (0, -0.95, 0), 'head': (0, -0.95, -0.2),
    'thigh.R': (0, -1, 0.06), 'shin.R': (0, -1, 0.06),
    'foot.R': (0, -0.2, 1),
    **hold_foot(ELBOWS_TORSO, (0.8, -0.6, 0), -0.80, 1.05, (0, 0.3, -1), (0.4, -0.4, 0.8)),
}

# Forehead to the knee: the back domes up from the hips and the head hangs
# from it onto the knee; shoulders rounded forward, elbows below the calf.
HEAD_TO_KNEE_TORSO = {
    'pelvis': (0, -0.3, 0.95),
    'spine.lower': (0, -0.62, 0.78),
    'spine.upper': (0, -0.99, 0.1),
}
HEAD_TO_KNEE = {
    **HEAD_TO_KNEE_TORSO,
    'neck': (0, -0.35, -0.94), 'head': (0, -0.2, -0.98),
    'thigh.R': (0, -1, 0.06), 'shin.R': (0, -1, 0.06),
    'foot.R': (0, -0.25, 1),
    **hold_foot(HEAD_TO_KNEE_TORSO, (0.8, -0.6, 0), -0.80, 1.05, (0, 0.3, -1), (0.4, -0.4, 0.8)),
}

def guides(side=1):
    """The hip-height horizontal the kicked leg must reach, and the vertical
    line of the locked standing leg. `side` 1 = right leg kicking (standing
    on the left, +X); -1 mirrors it."""
    x = 0.10 * side
    return [
        {'from': (0, 0.35, 0.98), 'to': (0, -1.05, 0.98)},
        {'from': (x, 0, 0.02), 'to': (x, 0, 1.0)},
    ]


# Kick-out mistake: the kicked leg sags below hip height.
KICK_GHOST = {
    'thigh.R': (0, -1, -0.3), 'shin.R': (0, -1, -0.3),
}

# Head-to-knee mistake: the standing knee softens to buy the forehead its
# reach, so the hips drop and the kicked leg sags with them.
HEAD_TO_KNEE_GHOST = {
    'pelvis.location': (0, 0, -0.07),
    'thigh.L': (0, -0.4, -0.92), 'shin.L': (0, 0.4, -0.92),
    'thigh.R': (0, -1, -0.12), 'shin.R': (0, -1, -0.12),
}

POSTURE = {
    'id': 'standing-head-to-knee',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'side',
    'frame': {'center_z': 1.0, 'scale': 2.4},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
        {'label': 'Lock the knee', 'pose': LOCK, 'hold': 4},
        {'label': 'Hold the foot', 'pose': HOLD, 'hold': 4},
        {'label': 'Kick out', 'pose': KICK, 'hold': 5,
         'guides': guides(), 'ghost': KICK_GHOST},
        {'label': 'Elbows down', 'pose': ELBOWS, 'hold': 5},
        {'label': 'Head to knee', 'pose': HEAD_TO_KNEE, 'hold': 8,
         'guides': guides(), 'ghost': HEAD_TO_KNEE_GHOST},
        {'label': 'Release', 'pose': {}, 'hold': 3},
        {'label': 'Left side', 'pose': mirror(HEAD_TO_KNEE), 'hold': 6,
         'guides': guides(-1), 'ghost': mirror(HEAD_TO_KNEE_GHOST)},
        {'label': 'Release', 'pose': {}, 'hold': 3},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
    ],
}
