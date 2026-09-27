"""
Half Tortoise — kneel sitting on the heels, arms overhead with the palms
together, then fold forward in one piece until the forehead and the little
fingers touch the floor; the hips stay on the heels.

Kneeling recipe: shins flat on the floor pointing back (+Y), knees at
z≈0.06; sitting on the heels puts the hip a thigh's length behind and above
the knee, just over the ankles. The mannequin faces -Y, so the fold goes
forward toward -Y and down; the figure is nudged +Y so the folded body stays
centred.
"""


def at(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


def arms_overhead(axis=(0, 0, 1), squeeze=0.22):
    """Arms straight beside the ears along `axis`, converging so the palms
    press together beyond the crown (as in half_moon.py)."""
    ax, ay, az = axis
    return {
        'clavicle.L': (0.9, 0, 0.35), 'clavicle.R': (-0.9, 0, 0.35),
        'upperarm.L': (ax - squeeze, ay, az), 'upperarm.R': (ax + squeeze, ay, az),
        'forearm.L': (ax - squeeze, ay, az), 'forearm.R': (ax + squeeze, ay, az),
        'hand.L': (ax - squeeze * 1.3, ay, az), 'hand.R': (ax + squeeze * 1.3, ay, az),
    }


Y0 = 0.25

# Seat on the heels: thighs slope from the hip down and forward to the knee,
# shins and the tops of the feet flat on the floor behind.
SEATED = {
    'pelvis.location': at(0, Y0, -0.76),
    'thigh.L': (0, -0.93, -0.37), 'thigh.R': (0, -0.93, -0.37),
    'shin.L': (0, 1, 0), 'shin.R': (0, 1, 0),
    'foot.L': (0, 1, -0.1), 'foot.R': (0, 1, -0.1),
}
UPRIGHT = {'pelvis': (0, 0, 1), 'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1),
           'neck': (0, 0, 1), 'head': (0, 0, 1)}

SIT = {
    **SEATED, **UPRIGHT,
    'upperarm.L': (0.05, -0.2, -1), 'upperarm.R': (-0.05, -0.2, -1),
    'forearm.L': (0.03, -0.9, -0.4), 'forearm.R': (-0.03, -0.9, -0.4),
    'hand.L': (0, -0.9, -0.4), 'hand.R': (0, -0.9, -0.4),
}

UP = {**SEATED, **UPRIGHT, **arms_overhead()}

# Folded: belly on the thighs, spine long, forehead down beyond the knees,
# arms stretched forward along the floor with the palms together.
ARMS_FWD = (0, -1, -0.33)
FOLD = {
    **SEATED,
    'pelvis': (0, -0.7, 0.35),
    'spine.lower': (0, -1, 0),
    'spine.upper': (0, -0.9, -0.4),
    'neck': (0, -0.5, -0.86),
    'head': (0, -0.94, -0.35),
    **arms_overhead(axis=ARMS_FWD, squeeze=0.2),
    'clavicle.L': (0.9, -0.3, 0), 'clavicle.R': (-0.9, -0.3, 0),
}

POSTURE = {
    'id': 'half-tortoise',
    'view': 'side',
    'frame': {'center_z': 0.65, 'scale': 1.9},
    'transition': 7,
    'stages': [
        {'label': 'Sit on the heels', 'pose': SIT, 'hold': 4},
        {'label': 'Arms up', 'pose': UP, 'hold': 5},
        {'label': 'Fold', 'pose': FOLD, 'hold': 10},
        {'label': 'Rise', 'pose': UP, 'hold': 4},
    ],
}
