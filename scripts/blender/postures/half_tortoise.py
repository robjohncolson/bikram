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
# arms stretched forward along the floor. The arms converge until the wrists
# nearly meet, and the steepled hands tip down so their little-finger edges
# rest on the floor.
ARMS_FWD = (0, -1, -0.33)


def reach(axis=ARMS_FWD):
    arms = arms_overhead(axis=axis, squeeze=0.3)
    arms['hand.L'] = (-0.3, -1, -0.45)
    arms['hand.R'] = (0.3, -1, -0.45)
    arms['clavicle.L'] = (0.9, -0.3, 0)
    arms['clavicle.R'] = (-0.9, -0.3, 0)
    return arms


FOLD = {
    **SEATED,
    'pelvis': (0, -0.7, 0.35),
    'spine.lower': (0, -1, 0),
    'spine.upper': (0, -0.9, -0.4),
    'neck': (0, -0.5, -0.86),
    'head': (0, -0.94, -0.35),
    **reach(),
}

# --- Teaching layers -------------------------------------------------------
# Guides (side view): the vertical over the heels the hips stay glued to,
# and the floor line the forehead and the little fingers reach along.
HEEL_Y = 0.28
FOLD_GUIDES = [
    {'from': (0, HEEL_Y, 0.0), 'to': (0, HEEL_Y, 0.6)},
    {'from': (0, -0.95, 0.0), 'to': (0, -0.2, 0.0)},
]

# Common mistake: the seat lifts off the heels and the body slides forward
# over the knees, so the fold happens by tipping rather than hinging.
# (Knees stay put: thigh steeper, hip raised and forward along it.)
FOLD_GHOST = {
    'pelvis.location': at(0, 0.105, -0.57),
    'thigh.L': (0, -0.6, -0.8), 'thigh.R': (0, -0.6, -0.8),
    'pelvis': (0, -0.8, -0.2),
    'spine.lower': (0, -0.8, -0.5),
    'spine.upper': (0, -0.7, -0.7),
    'neck': (0, -0.4, -0.9),
    'head': (0, -0.9, -0.4),
    **reach(),
}

POSTURE = {
    'id': 'half-tortoise',
    'view': 'side',
    'frame': {'center_z': 0.65, 'scale': 1.9},
    'transition': 7,
    'stages': [
        {'label': 'Sit on the heels', 'pose': SIT, 'hold': 4},
        {'label': 'Arms up', 'pose': UP, 'hold': 5},
        {'label': 'Fold', 'pose': FOLD, 'hold': 10,
         'guides': FOLD_GUIDES, 'ghost': FOLD_GHOST},
        {'label': 'Rise', 'pose': UP, 'hold': 4},
    ],
}
