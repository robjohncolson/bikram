"""
Half Moon with Hands to Feet — stage poses for the mannequin rig.

Each stage maps bone → world-space direction (head → tail). Unlisted bones
keep their rest direction. The mannequin faces -Y; its left side is +X, so
"bend to the right" tips the spine toward -X. `pelvis.location` shifts
the whole body (hips pushing the opposite way in the side bends). A stage
may name its own camera `view`; the camera orbits smoothly between views.

Refined after the reference photograph (2026-09-29), fold stage only: Hands
to feet was a hunched blob from the quarter view with the hands in the
air; it is now seen from the side, hips high over the feet, the torso
hanging down the front of the straight legs, arms reaching round behind
to the heels, the palms low behind them and the shoulders dropping.
"""
import sys
from pathlib import Path


def _warn_reach(dist, span, target):
    """Say so (stderr) when a reach target lies more than 1 cm beyond the
    chain: the helper clamps it, and the limb silently falls short."""
    if dist > span + 0.01:
        print(f'reach warning [{Path(__file__).stem}]: target '
              f'({target[0]:.3f}, {target[1]:.3f}, {target[2]:.3f}) is '
              f'{dist - span:.3f} m out of reach', file=sys.stderr)



def arms_overhead(axis=(0, 0, 1), squeeze=0.22):
    """Arms locked beside the ears along `axis` (the head's direction),
    converging so the steepled hands meet above the crown."""
    ax, ay, az = axis
    return {
        'clavicle.L': (0.9, 0, 0.35), 'clavicle.R': (-0.9, 0, 0.35),
        'upperarm.L': (ax - squeeze, ay, az), 'upperarm.R': (ax + squeeze, ay, az),
        'forearm.L': (ax - squeeze, ay, az), 'forearm.R': (ax + squeeze, ay, az),
        'hand.L': (ax - squeeze * 1.3, ay, az), 'hand.R': (ax + squeeze * 1.3, ay, az),
    }



# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

UP = {
    **arms_overhead(),
    'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1), 'neck': (0, 0, 1), 'head': (0, 0, 1),
}

# "Lock the elbows and squeeze the arms in tight against the ears": the
# same reach, arms pulled in to the head.
SQUEEZE = {
    **arms_overhead(squeeze=0.08),
    'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1), 'neck': (0, 0, 1), 'head': (0, 0, 1),
}

RIGHT = {
    **arms_overhead(axis=(-0.62, 0, 0.78)),
    'pelvis.location': (0.07, 0, 0),
    'pelvis': (-0.08, 0, 1),
    'spine.lower': (-0.28, 0, 0.96),
    'spine.upper': (-0.48, 0, 0.88),
    'neck': (-0.58, 0, 0.81),
    'head': (-0.62, 0, 0.78),
}

# Guides for the right side: the centre line the hips push away from, and
# the two panes of glass (front and back) the body bends between.
RIGHT_GUIDES = [
    {'from': (0, 0, 0), 'to': (0, 0, 2.05)},
    {'plane': 'y', 'at': -0.16, 'z': (0.0, 2.05), 'w': 1.5},
    {'plane': 'y', 'at': 0.16, 'z': (0.0, 2.05), 'w': 1.5},
]

# Common mistake: the hips stay centred, so the bend is only in the upper
# back and the arms barely leave vertical.
RIGHT_GHOST = {
    **arms_overhead(axis=(-0.38, 0, 0.92)),
    'pelvis.location': (0, 0, 0),
    'pelvis': (0, 0, 1),
    'spine.lower': (-0.05, 0, 1),
    'spine.upper': (-0.3, 0, 0.95),
    'neck': (-0.38, 0, 0.92),
    'head': (-0.38, 0, 0.92),
}

LEFT = {
    **arms_overhead(axis=(0.62, 0, 0.78)),
    'pelvis.location': (-0.07, 0, 0),
    'pelvis': (0.08, 0, 1),
    'spine.lower': (0.28, 0, 0.96),
    'spine.upper': (0.48, 0, 0.88),
    'neck': (0.58, 0, 0.81),
    'head': (0.62, 0, 0.78),
}

BACK = {
    **arms_overhead(axis=(0, 0.8, 0.6)),
    'pelvis.location': (0, -0.08, 0),
    'pelvis': (0, 0.15, 1),
    'spine.lower': (0, 0.35, 0.94),
    'spine.upper': (0, 0.6, 0.8),
    'neck': (0, 0.75, 0.66),
    'head': (0, 0.85, 0.53),
}

def _n(v):
    m = sum(c * c for c in v) ** 0.5
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def _reach(root, target, pole, l1=0.29, l2=0.25):
    """Upper-arm / forearm directions from `root` toward `target`, the elbow
    bending toward `pole` (straight if the target is out of reach)."""
    d = _add(target, root, -1)
    _raw = sum(c * c for c in d) ** 0.5
    _warn_reach(_raw, l1 + l2, target)
    dist = min(_raw, l1 + l2 - 1e-3)
    u = _n(d)
    x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    r = max(l1 * l1 - x * x, 0.0) ** 0.5
    pd = sum(p * c for p, c in zip(pole, u))
    v = _n(tuple(p - pd * c for p, c in zip(pole, u)))
    mid = _add(_add(root, u, x), v, r)
    return _n(_add(mid, root, -1)), _n(_add(target, mid, -1))


# Hands to feet, after the reference photograph: the hips stay high over
# the feet and the torso hangs down the FRONT of the straight legs, belly
# against the thighs, head toward the shins; the arms go round behind to
# the heels, palms sliding under the feet, elbows bending back as they pull.
# Seen from the side, where a fold reads.
FOLD_LOC = (0, 0.05, 0.0)
FOLD = {
    'pelvis.location': FOLD_LOC,
    'pelvis': (0, -0.95, -0.3),
    'spine.lower': (0, -0.3, -0.95),
    'spine.upper': (0, -0.05, -1),
    'neck': (0, 0.1, -1),
    'head': (0, 0.12, -0.99),
    # shoulders drop toward the floor as the hands pull on the heels
    'clavicle.L': (0.85, 0.2, -0.5), 'clavicle.R': (-0.85, 0.2, -0.5),
}


PALM = 0.035       # the palm swelling sits this far past the wrist, along the hand
FOLD_HAND = (0, -0.5, -0.87)   # fingers pointing forward and down under the heel


def _fold_arms(pose):
    """Arms from the stage's own torso so each PALM lands behind and beside
    its heel, low, with the hand turned to slide under the foot (the wrist
    sits a palm's offset back along the hand)."""
    p = _add((0, 0, 1.0), pose['pelvis.location'])
    for bone, length in (('pelvis', 0.12), ('spine.lower', 0.15), ('spine.upper', 0.13)):
        p = _add(p, _n(pose[bone]), length)
    hand = _n(FOLD_HAND)
    for side, sx in (('L', 1), ('R', -1)):
        shoulder = _add(p, _n(pose['clavicle.' + side]), 0.2044)
        palm = (sx * 0.12, 0.10 + pose['pelvis.location'][1], 0.10)   # behind the heel
        up, fo = _reach(shoulder, _add(palm, hand, -PALM), (sx * 0.3, 1, 0.2))
        pose['upperarm.' + side] = up
        pose['forearm.' + side] = fo
        pose['hand.' + side] = hand
    return pose


FOLD = _fold_arms(FOLD)

POSTURE = {
    'id': 'half-moon',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'front',
    'frame': {'center_z': 1.05, 'scale': 2.5},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
        {'label': 'Arms up', 'pose': UP, 'hold': 4},
        {'label': 'Squeeze the arms', 'pose': SQUEEZE, 'hold': 4},
        {'label': 'Right side', 'pose': RIGHT, 'hold': 8,
         'guides': RIGHT_GUIDES, 'ghost': RIGHT_GHOST},
        {'label': 'Centre', 'pose': UP, 'hold': 3},
        {'label': 'Left side', 'pose': LEFT, 'hold': 8},
        {'label': 'Centre', 'pose': UP, 'hold': 3, 'view': 'side'},
        {'label': 'Backbend', 'pose': BACK, 'hold': 8, 'view': 'side'},
        {'label': 'Centre', 'pose': UP, 'hold': 3, 'view': 'side'},
        {'label': 'Hands to feet', 'pose': FOLD, 'hold': 8, 'view': 'side'},
        {'label': 'Rise', 'pose': UP, 'hold': 4, 'view': 'front'},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
    ],
}
