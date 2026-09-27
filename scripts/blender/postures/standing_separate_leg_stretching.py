"""
Standing Separate Leg Stretching — stage poses for the mannequin rig.

Wide straddle, arms out to the sides, hinge forward with a flat back, then
hands grip the heels from outside and the forehead drops toward the floor
between the feet. Shown from the quarter view so both the straddle and the
fold read (from the front the fold collapses onto the legs).
"""

SPREAD = 0.42   # sideways lean of each straight leg in the straddle


def wide(drop=-0.06):
    return {
        'pelvis.location': (0, 0, drop),
        'thigh.L': (SPREAD, 0, -0.93), 'shin.L': (SPREAD, 0, -0.93),
        'thigh.R': (-SPREAD, 0, -0.93), 'shin.R': (-SPREAD, 0, -0.93),
        'foot.L': (-0.15, -1, -0.3), 'foot.R': (0.15, -1, -0.3),
    }


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

FOLD = {
    **wide(-0.1),
    'pelvis': (0, -0.75, -0.66),
    'spine.lower': (0, -0.1, -1),
    'spine.upper': (0, 0.1, -1),
    'neck': (0, 0.2, -0.98), 'head': (0, 0.2, -0.98),
    'clavicle.L': (1, 0.1, -0.1), 'clavicle.R': (-1, 0.1, -0.1),
    'upperarm.L': (0.75, 0.2, -0.6), 'upperarm.R': (-0.75, 0.2, -0.6),
    'forearm.L': (0.45, 0.2, -0.87), 'forearm.R': (-0.45, 0.2, -0.87),
    'hand.L': (-0.2, 0.3, -0.9), 'hand.R': (0.2, 0.3, -0.9),
}

POSTURE = {
    'id': 'standing-separate-leg-stretching',
    'view': 'quarter',
    'frame': {'center_z': 1.0, 'scale': 2.5},
    'transition': 7,
    'stages': [
        {'label': 'Wide stance', 'pose': STANCE, 'hold': 3},
        {'label': 'Arms out', 'pose': ARMS_OUT, 'hold': 4},
        {'label': 'Fold', 'pose': HINGE, 'hold': 4},
        {'label': 'Head to floor', 'pose': FOLD, 'hold': 10},
        {'label': 'Rise', 'pose': ARMS_OUT, 'hold': 4},
    ],
}
