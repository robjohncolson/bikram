"""
Standing Bow Pulling (Dandayamana-Dhanurasana) — stage poses for the rig.

Right leg first: stand on the locked left leg, the right hand grips the
right ankle behind; the left arm rises; then kick back and up while the
body and left arm stretch forward until the torso is level and the right
foot rises above the head. The left side repeats the full bow. Side view
from the mannequin's right, so the working leg and arm are nearest.

Refined after the reference photographs (2026-09-29): in Kick and Full
bow the kicking leg is placed from the hand that holds it — the right
arm reaches straight up and back from a drawn-back right shoulder, the
ankle sits in the hand (`bow_leg`, a two-bone solve), so the thigh rises
steeply behind, the shin stands upright and the foot climbs above the
head while the chest comes down to level and the left arm reaches
forward level. Before, the foot sat low behind the hips, out of the
hand's reach.
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


GRIP = 0.60   # shoulder to the held ankle along a straight arm (arm 0.54 + palm)


def bow_leg(torso, clav_r, arm_r, knee_hint=(0, 1, 0.2)):
    """The kicking (right) leg and holding arm for a torso: the right arm
    points `arm_r` straight from the shoulder (the clavicle drawn to
    `clav_r`), the ankle sits in the hand, and the thigh and shin are
    solved from the hip to that ankle, the knee bent toward `knee_hint`."""
    p = (0.0, 0.0, 1.0)
    for bone, length in (('pelvis', 0.12), ('spine.lower', 0.15), ('spine.upper', 0.13)):
        p = _add(p, _n(torso[bone]), length)
    shoulder = _add(p, _n(clav_r), 0.204)
    arm = _n(arm_r)
    ankle = _add(shoulder, arm, GRIP)
    thigh, shin = two_bone((-0.10, 0.0, 0.98), ankle, 0.44, 0.44, knee_hint)
    return {'thigh.R': thigh, 'shin.R': shin, 'clavicle.R': _n(clav_r),
            'upperarm.R': arm, 'forearm.R': arm}


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



# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

# "Shift your full weight onto the left leg, locking the knee": tall on
# the left, the right heel just off the floor.
LOCK = {
    'pelvis.location': (0.03, 0, 0),
    'thigh.L': (-0.09, 0, -1), 'shin.L': (-0.07, 0, -1),
    'thigh.R': (0.09, 0, -1), 'shin.R': (0.07, 0.08, -1),
    'foot.R': (0, -0.85, -0.5),
}

# Right knee bent, right hand holding the ankle behind.
HOLD_LEG = {
    'thigh.R': (0, 0.1, -1),
    'shin.R': (0, 0.6, 0.8),
    'foot.R': (0, 0.5, 0.85),
    'upperarm.R': (0.1, 0.31, -0.55),
    'forearm.R': (0.1, 0.31, -0.55),
    'hand.R': (0.05, 0.4, -0.9),
}

HOLD = {**HOLD_LEG}

ARM_UP = {
    **HOLD_LEG,
    'upperarm.L': (-0.1, -0.2, 1), 'forearm.L': (-0.1, -0.2, 1), 'hand.L': (-0.1, -0.2, 1),
}

# Kicking: torso tipping forward, leg lifting back, left arm reaching.
KICK_TORSO = {
    'pelvis': (0, -0.6, 0.8),
    'spine.lower': (0, -0.7, 0.7),
    'spine.upper': (0, -0.75, 0.65),
}
KICK = {
    **KICK_TORSO,
    'neck': (0, -0.7, 0.7), 'head': (0, -0.6, 0.8),
    **bow_leg(KICK_TORSO, (-0.85, 0.35, 0.2), (0, 0.9, 0.44), knee_hint=(0, 0.3, -1)),
    'foot.R': (0, 0.6, 0.8),
    'hand.R': (0.3, 0.8, 0.5),
    'upperarm.L': (0, -0.8, 0.6), 'forearm.L': (0, -0.8, 0.6), 'hand.L': (0, -0.8, 0.6),
}

# Full bow: torso level, left arm straight forward, right foot kicked up
# above the head with the right arm drawn straight up and back to it.
FULL_TORSO = {
    'pelvis': (0, -0.95, 0.3),
    'spine.lower': (0, -1, 0.1),
    'spine.upper': (0, -1, 0.1),
}
FULL = {
    **FULL_TORSO,
    'neck': (0, -1, 0.2), 'head': (0, -0.95, 0.3),
    **bow_leg(FULL_TORSO, (-0.7, 0.45, 0.45), (0, 0.5, 0.87)),
    'foot.R': (0, 0.45, 0.9),
    # palm curls in over the inside of the ankle
    'hand.R': (0.35, 0.45, 0.82),
    'upperarm.L': (0, -1, 0.1), 'forearm.L': (0, -1, 0.1), 'hand.L': (0, -1, 0.1),
}


def guides(side=1):
    """The level line the torso lies along and the kicked foot rises above,
    and the vertical lamp-post of the locked standing leg from its hip.
    `side` 1 = right leg kicking (standing on the left, +X); -1 mirrors."""
    x = 0.10 * side
    return [
        {'from': (0, 0.5, 1.2), 'to': (0, -1.1, 1.2)},
        {'from': (x, 0, 0.02), 'to': (x, 0, 1.0)},
    ]


# Common mistake: the kicking knee splays out to the side, so the hip opens
# and the foot kicks out and back instead of up — it stalls barely above
# the level line (the arm follows the ankle down).
FULL_GHOST = {
    **bow_leg(FULL_TORSO, (-0.8, 0.3, 0.3), (-0.4, 0.82, 0.42), knee_hint=(-1, 0.4, 0)),
    'foot.R': (-0.3, 0.35, 0.88),
    'hand.R': (0.2, 0.75, 0.6),
}

POSTURE = {
    'id': 'standing-bow',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'side',
    'frame': {'center_z': 1.05, 'scale': 2.5},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
        {'label': 'Lock the knee', 'pose': LOCK, 'hold': 4},
        {'label': 'Hold the foot', 'pose': HOLD, 'hold': 4},
        {'label': 'Arm up', 'pose': ARM_UP, 'hold': 3},
        {'label': 'Kick', 'pose': KICK, 'hold': 5},
        {'label': 'Full bow', 'pose': FULL, 'hold': 8,
         'guides': guides(), 'ghost': FULL_GHOST},
        {'label': 'Release', 'pose': {}, 'hold': 3},
        {'label': 'Left side', 'pose': mirror(FULL), 'hold': 6,
         'guides': guides(-1), 'ghost': mirror(FULL_GHOST)},
        {'label': 'Release', 'pose': {}, 'hold': 3},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
    ],
}
