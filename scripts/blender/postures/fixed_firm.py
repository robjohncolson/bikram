"""
Fixed Firm — kneel, sit down between the heels, lean back onto the elbows,
then lie flat with the arms overhead holding opposite elbows.

Kneeling recipe: thighs (0,-0.2,-0.98), shins flat on the floor pointing
back (+Y), knees at z≈0.06. Sitting between the heels, the thighs lie
forward along the floor and the shins fold back beside the hips (angled
outward so the seat is between the feet). The body faces -Y, so leaning
back goes toward +Y; the whole figure is nudged -Y so the reclined body stays
centred in the frame.
"""


def at(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


Y0 = -0.15

UPRIGHT = {'pelvis': (0, 0, 1), 'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1),
           'neck': (0, 0, 1), 'head': (0, 0, 1)}

# Shins back along the floor, tops of the feet down, soles up.
SHINS = {'shin.L': (0.25, 1, 0), 'shin.R': (-0.25, 1, 0),
         'foot.L': (0.1, 1, -0.1), 'foot.R': (-0.1, 1, -0.1)}

KNEEL = {
    **UPRIGHT, **SHINS,
    'pelvis.location': at(0, Y0, -0.49),
    'shin.L': (0.12, 1, 0), 'shin.R': (-0.12, 1, 0),
    'thigh.L': (0, -0.2, -0.98), 'thigh.R': (0, -0.2, -0.98),
    'upperarm.L': (0.05, 0.05, -1), 'upperarm.R': (-0.05, 0.05, -1),
    'forearm.L': (0.03, 0.1, -1), 'forearm.R': (-0.03, 0.1, -1),
}

# Seat on the floor between the feet; thighs forward, hands on the soles.
THIGHS_FLAT = {'thigh.L': (0, -1, -0.05), 'thigh.R': (0, -1, -0.05)}
SIT = {
    **UPRIGHT, **SHINS, **THIGHS_FLAT,
    'pelvis.location': at(0, Y0, -0.90),
    'upperarm.L': (0.2, 0.25, -1), 'upperarm.R': (-0.2, 0.25, -1),
    'forearm.L': (0.15, 0.6, -0.8), 'forearm.R': (-0.15, 0.6, -0.8),
    'hand.L': (0.1, 1, -0.1), 'hand.R': (-0.1, 1, -0.1),
}

# Reclined onto the elbows: upper arms vertical, forearms flat on the floor
# pointing toward the hips, torso about forty degrees off the floor.
BACK = (0, 0.77, 0.64)
ELBOWS = {
    **SHINS, **THIGHS_FLAT,
    'pelvis.location': at(0, Y0, -0.90),
    'pelvis': BACK, 'spine.lower': BACK, 'spine.upper': BACK,
    'neck': (0, 0.4, 0.92), 'head': (0, 0.3, 0.95),
    'clavicle.L': (0.95, 0.1, 0.2), 'clavicle.R': (-0.95, 0.1, 0.2),
    'upperarm.L': (0, 0.02, -1), 'upperarm.R': (0, 0.02, -1),
    'forearm.L': (-0.05, -1, 0), 'forearm.R': (0.05, -1, 0),
    'hand.L': (0, -1, -0.05), 'hand.R': (0, -1, -0.05),
}

# Flat on the back, arms overhead on the floor, holding opposite elbows:
# the forearms cross one on top of the other (the right elbow rests a little
# higher so the left forearm passes under it), and each hand curls around the
# outside of the opposite elbow.
FLAT = (0, 1, 0)
LIE = {
    **SHINS, **THIGHS_FLAT,
    'pelvis.location': at(0, Y0, -0.88),
    'pelvis': FLAT, 'spine.lower': FLAT, 'spine.upper': FLAT,
    'neck': FLAT, 'head': (0, 1, -0.02),
    'clavicle.L': (0.95, 0.3, 0), 'clavicle.R': (-0.95, 0.3, 0),
    'upperarm.L': (-0.26, 1, -0.02), 'upperarm.R': (0.26, 1, 0.2),
    'forearm.L': (-1, 0, 0), 'forearm.R': (1, 0, 0),
    'hand.L': (-0.3, 0, 1), 'hand.R': (0.3, 0, -1),
}

# --- Teaching layers -------------------------------------------------------
# Guides (side view): the floor line the knees stay down on, and the floor
# line the shoulders settle onto — the arch of the low back lives between.
LIE_GUIDES = [
    {'from': (0, -0.8, 0.0), 'to': (0, -0.2, 0.0)},
    {'from': (0, 0.15, 0.0), 'to': (0, 0.75, 0.0)},
]

# Common mistake: going too deep too soon — the back reaches the floor but
# the knees peel up and apart, the shins tilting off the floor behind them.
LIE_GHOST = {
    'thigh.L': (0.12, -0.92, 0.38), 'thigh.R': (-0.12, -0.92, 0.38),
    'shin.L': (0.25, 0.9, -0.48), 'shin.R': (-0.25, 0.9, -0.48),
    'foot.L': (0.1, 1, -0.2), 'foot.R': (-0.1, 1, -0.2),
}

POSTURE = {
    'id': 'fixed-firm',
    'view': 'side',
    'frame': {'center_z': 0.55, 'scale': 2.0},
    'transition': 7,
    'stages': [
        {'label': 'Kneel', 'pose': KNEEL, 'hold': 4},
        {'label': 'Sit between the heels', 'pose': SIT, 'hold': 5},
        {'label': 'Elbows down', 'pose': ELBOWS, 'hold': 5},
        {'label': 'Lie back', 'pose': LIE, 'hold': 10,
         'guides': LIE_GUIDES, 'ghost': LIE_GHOST},
        {'label': 'Rise', 'pose': SIT, 'hold': 4},
    ],
}
