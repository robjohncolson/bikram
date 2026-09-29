"""
Standing Separate Leg Stretching — stage poses for the mannequin rig.

Wide straddle, arms out to the sides, hinge forward with a flat back, then
hands grip the heels from outside and the forehead drops toward the floor
between the feet. Shown from the quarter view so both the straddle and the
fold read (from the front the fold collapses onto the legs).

Refined after the reference photograph (2026-09-29): the straddle was too
narrow for the head to reach the floor and the feet floated off it; the
legs now spread ~39° each side (feet ~1.3 m apart, flat on the floor), the
hips sit low enough for the crown to reach the floor between the feet,
and the arms are solved so the hands actually hold the outer heels in
both Hold the heels and Head to floor (the palm, a palm's offset past the
wrist, on the heel). The ghost keeps the same footprint: the mistake is
soft knees and a rounded back, never a narrower stance.
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

# After the reference photograph: a genuinely wide straddle (each straight
# leg ~39° off vertical, the feet ~1.3 m apart — the class's "four feet"),
# so the hips come low enough for the head to reach the floor between the
# feet. DROP lowers the pelvis so the feet stay flat on the floor.
SPREAD = 0.75   # sideways lean of each straight leg in the straddle
_LEG = math.sqrt(SPREAD * SPREAD + 0.93 * 0.93)
DROP = 0.10 - (0.98 - 0.88 * 0.93 / _LEG)      # ankle joint at z≈0.10


def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def wide(drop=DROP):
    return {
        'pelvis.location': (0, 0, drop),
        'thigh.L': (SPREAD, 0, -0.93), 'shin.L': (SPREAD, 0, -0.93),
        'thigh.R': (-SPREAD, 0, -0.93), 'shin.R': (-SPREAD, 0, -0.93),
        'foot.L': (-0.15, -1, -0.5), 'foot.R': (0.15, -1, -0.5),
    }


def heel(sx):
    """Where the PALM lands: against the outer edge of the heel, just
    outside and behind the ankle joint, a little above the floor."""
    a = 0.88 / _LEG
    return (sx * (0.10 + SPREAD * a) + sx * 0.055, 0.04, 0.98 + DROP - 0.93 * a + 0.03)


def two_bone(root, target, pole, l1=0.29, l2=0.25):
    d = _add(target, root, -1)
    _raw = math.sqrt(sum(c * c for c in d))
    _warn_reach(_raw, l1 + l2, target)
    dist = min(_raw, l1 + l2 - 1e-3)
    u = _n(d)
    x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    r = math.sqrt(max(l1 * l1 - x * x, 0.0))
    pd = sum(p * c for p, c in zip(pole, u))
    v = _n(tuple(p - pd * c for p, c in zip(pole, u)))
    mid = _add(_add(root, u, x), v, r)
    return _n(_add(mid, root, -1)), _n(_add(target, mid, -1))


PALM = 0.035       # the palm swelling sits this far past the wrist, along the hand


def grip_heels(pose, clav=((1, 0.1, -0.3), (-1, 0.1, -0.3))):
    """Arms solved from the stage's own torso so the PALMS land on the outer
    heels (the wrist is placed a palm's offset back along the hand, and the
    hand curls down round the heel), elbows bending out and back (the pull).
    The shoulders drop toward the feet (clavicles angled down)."""
    p = (0, 0, 1.0 + pose['pelvis.location'][2])
    for bone, length in (('pelvis', 0.12), ('spine.lower', 0.15), ('spine.upper', 0.13)):
        p = _add(p, _n(pose[bone]), length)
    for side, sx, c in (('L', 1, clav[0]), ('R', -1, clav[1])):
        pose['clavicle.' + side] = c
        shoulder = _add(p, _n(c), 0.2044)
        palm = heel(sx)
        u = _n(_add(palm, shoulder, -1))
        hand = _n(_add(u, (0, 0.15, -0.5)))
        wrist = _add(palm, hand, -PALM)
        up, fo = two_bone(shoulder, wrist, (sx, 0.6, 0.3))
        pose['upperarm.' + side] = up
        pose['forearm.' + side] = fo
        pose['hand.' + side] = hand
    return pose


STANCE = {**wide()}

ARMS_OUT = {
    **wide(),
    'clavicle.L': (1, 0, 0.1), 'clavicle.R': (-1, 0, 0.1),
    'upperarm.L': (1, 0, 0), 'upperarm.R': (-1, 0, 0),
    'forearm.L': (1, 0, 0), 'forearm.R': (-1, 0, 0),
    'hand.L': (1, 0, 0), 'hand.R': (-1, 0, 0),
}

HINGE = {
    **wide(),
    'pelvis': (0, -0.9, 0.44),
    'spine.lower': (0, -1, 0), 'spine.upper': (0, -1, 0),
    'neck': (0, -1, 0.1), 'head': (0, -1, 0.1),
    'clavicle.L': (1, -0.1, 0), 'clavicle.R': (-1, -0.1, 0),
    'upperarm.L': (1, 0, -0.1), 'upperarm.R': (-1, 0, -0.1),
    'forearm.L': (1, 0, -0.1), 'forearm.R': (-1, 0, -0.1),
    'hand.L': (1, 0, -0.1), 'hand.R': (-1, 0, -0.1),
}


# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

# "Reach down and grip the heels from the outside": hinged deep from the
# hips so the hands really reach the heels (the rig's arms are short for a
# straddle this wide), eyes still forward before the head goes down.
GRIP = grip_heels({
    **wide(),
    'pelvis': (0, -0.55, -0.84),
    'spine.lower': (0, -0.15, -0.99),
    'spine.upper': (0, 0.0, -1),
    'neck': (0, -0.6, -0.8), 'head': (0, -0.8, -0.6),
})

# Head to floor: hips over the heels, the torso hanging long between the
# legs, crown to the floor, elbows bent out and back as the hands pull.
FOLD = grip_heels({
    **wide(),
    'pelvis': (0, -0.55, -0.84),
    'spine.lower': (0, -0.12, -1),
    'spine.upper': (0, 0.08, -1),
    'neck': (0, 0.15, -0.99), 'head': (0, 0.15, -0.99),
})

# Guides: the plumb line the forehead drops on, midway between the feet,
# and the floor line joining the heels.
FOLD_GUIDES = [
    {'from': (0, 0, 0.0), 'to': (0, 0, 1.25)},
    {'from': (heel(-1)[0], 0, 0.02), 'to': (heel(1)[0], 0, 0.02)},
]

# Common mistake: knees soften and the back rounds -- the fold comes from
# the waist, not the hips, and the head hangs short of the floor. The
# mistake is in the fold, not the stance: the ghost keeps the real pose's
# footprint (same ankles, same flat feet), its hips sink and draw back so
# the hip-to-ankle span shortens to GHOST_SPAN, and each knee is solved to
# bend forward over its foot.
GHOST_SPAN = 0.80           # hip → ankle with the knees soft (straight = 0.88)
GHOST_BACK = 0.08           # hips drawn back behind the heels


def _ankle(sx):
    a = 0.88 / _LEG
    return (sx * (0.10 + SPREAD * a), 0.0, 0.98 + DROP - 0.93 * a)


def _ghost():
    dx = _ankle(1)[0] - 0.10
    hip_z = _ankle(1)[2] + math.sqrt(GHOST_SPAN ** 2 - dx * dx - GHOST_BACK ** 2)
    pose = {
        'pelvis.location': (0, GHOST_BACK, hip_z + 0.02 - 1.0),   # pelvis joint 0.02 above the hips
        'pelvis': (0, -0.7, 0.7),
        'spine.lower': (0, -1, 0.1),
        'spine.upper': (0, -0.6, -0.8),
        'neck': (0, -0.1, -1), 'head': (0, 0.2, -1),
        'upperarm.L': (0.3, 0.1, -0.95), 'upperarm.R': (-0.3, 0.1, -0.95),
        'forearm.L': (0.3, 0.3, -0.9), 'forearm.R': (-0.3, 0.3, -0.9),
        'hand.L': (0.1, 0.3, -0.95), 'hand.R': (-0.1, 0.3, -0.95),
        'foot.L': (-0.15, -1, -0.5), 'foot.R': (0.15, -1, -0.5),
    }
    for side, sx in (('L', 1), ('R', -1)):
        hip = (sx * 0.10, GHOST_BACK, hip_z)
        th, sh = two_bone(hip, _ankle(sx), (0, -1, 0.2), 0.44, 0.44)
        pose['thigh.' + side] = th
        pose['shin.' + side] = sh
    return pose


FOLD_GHOST = _ghost()

POSTURE = {
    'id': 'standing-separate-leg-stretching',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'quarter',
    'frame': {'center_z': 1.0, 'scale': 2.5},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
        {'label': 'Wide stance', 'pose': STANCE, 'hold': 3},
        {'label': 'Arms out', 'pose': ARMS_OUT, 'hold': 4},
        {'label': 'Fold', 'pose': HINGE, 'hold': 4},
        {'label': 'Hold the heels', 'pose': GRIP, 'hold': 4},
        {'label': 'Head to floor', 'pose': FOLD, 'hold': 10,
         'guides': FOLD_GUIDES, 'ghost': FOLD_GHOST},
        {'label': 'Rise', 'pose': ARMS_OUT, 'hold': 4},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
    ],
}
