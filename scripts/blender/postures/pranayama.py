"""
Standing Deep Breathing (Pranayama) — stage poses for the mannequin rig.

Feet together, fingers interlaced with the knuckles under the chin. Inhale:
the elbows rise together out and up like wings, the hands stay at the chin.
Exhale: the head drops back while the wrists press the chin up and the
elbows swing together in front of the face. Quarter view shows the wings.
"""


def to(a, b):
    """Direction from point a to point b."""
    return (b[0] - a[0], b[1] - a[1], b[2] - a[2])


FEET_TOGETHER = {
    'thigh.L': (-0.12, 0, -1), 'thigh.R': (0.12, 0, -1),
    'shin.L': (-0.02, 0, -1), 'shin.R': (0.02, 0, -1),
    # rest foot pitch so the toes rest on the floor (z≈0.02)
    'foot.L': (-0.05, -0.89, -0.45), 'foot.R': (0.05, -0.89, -0.45),
}


def arms(elbow_l, wrist_l, head_back=False, sh_l=(0.20, 0, 1.44)):
    """Mirror both arms from the left elbow/wrist target points (and the left
    shoulder point, when the clavicles are posed away from rest)."""
    ex, ey, ez = elbow_l
    wx, wy, wz = wrist_l
    sh_r = (-sh_l[0], sh_l[1], sh_l[2])
    return {
        'upperarm.L': to(sh_l, elbow_l), 'upperarm.R': to(sh_r, (-ex, ey, ez)),
        'forearm.L': to(elbow_l, wrist_l), 'forearm.R': to((-ex, ey, ez), (-wx, wy, wz)),
        # interlaced fingers: each hand runs across toward the other side
        'hand.L': (-0.9, -0.25, 0.35), 'hand.R': (0.9, -0.25, 0.35),
    }


START = {
    **FEET_TOGETHER,
    **arms((0.07, -0.17, 1.22), (0.05, -0.13, 1.47)),
}

INHALE = {
    **FEET_TOGETHER,
    **arms((0.36, -0.12, 1.62), (0.08, -0.14, 1.50)),
}

EXHALE = {
    **FEET_TOGETHER,
    'spine.lower': (0, 0.06, 1),
    'spine.upper': (0, 0.3, 1),
    'neck': (0, 0.6, 0.8),
    'head': (0, 0.9, 0.44),
    **arms((0.06, -0.28, 1.43), (0.04, -0.12, 1.56)),
}

# Inhale guides: the frontal pane through the chin the elbows lift along
# (not out to the sides behind the body), and the height they rise to —
# level with the ears.
INHALE_GUIDES = [
    {'plane': 'y', 'at': -0.13, 'z': (1.2, 1.78), 'w': 0.9},
    {'from': (-0.5, -0.13, 1.63), 'to': (0.5, -0.13, 1.63)},
]

# Common mistake on the inhale: the shoulders hunch up toward the ears and
# the elbows stall low, so the chest never widens.
INHALE_GHOST = {
    'clavicle.L': (0.8, 0, 0.6), 'clavicle.R': (-0.8, 0, 0.6),
    **arms((0.34, -0.1, 1.40), (0.08, -0.14, 1.50), sh_l=(0.16, 0, 1.52)),
}

# Exhale guide: the vertical line in front of the face the elbows, wrists
# and forearms close onto.
EXHALE_GUIDES = [
    {'from': (0, -0.21, 1.1), 'to': (0, -0.21, 1.75)},
]

# Common mistake on the exhale: the elbows drift apart and sag, so the
# forearms never meet in front of the face.
EXHALE_GHOST = {
    **arms((0.2, -0.12, 1.26), (0.05, -0.05, 1.55)),
}

POSTURE = {
    'id': 'pranayama',
    'view': 'quarter',
    'frame': {'center_z': 0.98, 'scale': 2.1},
    'transition': 8,
    'stages': [
        {'label': 'Stand', 'pose': {**FEET_TOGETHER}, 'hold': 4},
        {'label': 'Knuckles under the chin', 'pose': START, 'hold': 4},
        {'label': 'Inhale', 'pose': INHALE, 'hold': 7,
         'guides': INHALE_GUIDES, 'ghost': INHALE_GHOST},
        {'label': 'Exhale', 'pose': EXHALE, 'hold': 7, 'view': 'side',
         'guides': EXHALE_GUIDES, 'ghost': EXHALE_GHOST},
        {'label': 'Inhale', 'pose': INHALE, 'hold': 5},
        {'label': 'Exhale', 'pose': EXHALE, 'hold': 5, 'view': 'side'},
        {'label': 'Release', 'pose': {**FEET_TOGETHER}, 'hold': 4},
        {'label': 'Stand', 'pose': {**FEET_TOGETHER}, 'hold': 4},
    ],
}
