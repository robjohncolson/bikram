"""
Half Moon with Hands to Feet — stage poses for the mannequin rig.

Each stage maps bone → world-space direction (head → tail). Unlisted bones
keep their rest direction. The mannequin faces -Y; its left side is +X, so
"bend to the right" tips the spine toward -X. `pelvis.location` shifts
the whole body (hips pushing the opposite way in the side bends). A stage
may name its own camera `view`; the camera orbits smoothly between views.
"""


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


UP = {
    **arms_overhead(),
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

FOLD = {
    'pelvis.location': (0, 0.05, 0.0),
    'pelvis': (0, -0.75, 0.66),
    'spine.lower': (0, -0.5, -0.87),
    'spine.upper': (0, -0.25, -0.97),
    'neck': (0, -0.15, -0.99),
    'head': (0, -0.1, -1),
    'clavicle.L': (0.9, 0.1, -0.3), 'clavicle.R': (-0.9, 0.1, -0.3),
    'upperarm.L': (-0.1, 0.5, -0.86), 'upperarm.R': (0.1, 0.5, -0.86),
    'forearm.L': (-0.05, 0.25, -0.97), 'forearm.R': (0.05, 0.25, -0.97),
    'hand.L': (0, -0.75, -0.66), 'hand.R': (0, -0.75, -0.66),
}

POSTURE = {
    'id': 'half-moon',
    'view': 'front',
    'frame': {'center_z': 1.05, 'scale': 2.5},
    'transition': 7,
    'stages': [
        {'label': 'Arms up', 'pose': UP, 'hold': 4},
        {'label': 'Right side', 'pose': RIGHT, 'hold': 8},
        {'label': 'Centre', 'pose': UP, 'hold': 3},
        {'label': 'Left side', 'pose': LEFT, 'hold': 8},
        {'label': 'Centre', 'pose': UP, 'hold': 3, 'view': 'side'},
        {'label': 'Backbend', 'pose': BACK, 'hold': 8, 'view': 'side'},
        {'label': 'Centre', 'pose': UP, 'hold': 3, 'view': 'side'},
        {'label': 'Hands to feet', 'pose': FOLD, 'hold': 8, 'view': 'quarter'},
        {'label': 'Rise', 'pose': UP, 'hold': 4, 'view': 'front'},
    ],
}
