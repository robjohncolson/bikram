"""
Savasana (Dead Body Pose) — lying supine, arms by the sides, palms up.

Lying recipe from the README: head toward -Y, pelvis bone and spine point
-Y, legs point +Y, pelvis.location drops the body so the tubes rest at the
floor. Nearly still: the motion is the knees sliding long and the arms and
feet letting go.
"""



def shift(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


# Pelvis to the floor, body centred on the mat in the side view.
LIFT = shift(0, -0.1, -0.88)

TORSO = {
    'pelvis.location': LIFT,
    'pelvis': (0, -1, 0),
    'spine.lower': (0, -1, 0),
    'spine.upper': (0, -1, 0),
    'neck': (0, -1, 0.05),
    'head': (0, -1, 0),
}


def arms(spread=0.12):
    """Arms long beside the body, hands a little away from the hips."""
    return {
        'clavicle.L': (1, 0.05, 0), 'clavicle.R': (-1, 0.05, 0),
        'upperarm.L': (spread, 1, 0), 'upperarm.R': (-spread, 1, 0),
        'forearm.L': (spread, 1, 0), 'forearm.R': (-spread, 1, 0),
        'hand.L': (spread, 1, 0), 'hand.R': (-spread, 1, 0),
    }


LIE_DOWN = {
    **TORSO,
    **arms(0.05),
    'thigh.L': (0.05, 0.55, 0.83), 'thigh.R': (-0.05, 0.55, 0.83),
    'shin.L': (0, 0.55, -0.83), 'shin.R': (0, 0.55, -0.83),
    'foot.L': (0, 1, -0.15), 'foot.R': (0, 1, -0.15),
}

SETTLE = {
    **TORSO,
    **arms(0.1),
    'thigh.L': (0.03, 1, 0), 'thigh.R': (-0.03, 1, 0),
    'shin.L': (0.03, 1, 0), 'shin.R': (-0.03, 1, 0),
    'foot.L': (0, 0.3, 1), 'foot.R': (0, 0.3, 1),
}

STILL = {
    **TORSO,
    **arms(0.16),
    'thigh.L': (0.06, 1, 0), 'thigh.R': (-0.06, 1, 0),
    'shin.L': (0.06, 1, 0), 'shin.R': (-0.06, 1, 0),
    'foot.L': (0.35, 0.45, 0.8), 'foot.R': (-0.35, 0.45, 0.8),
}

# Guide: one line — the floor under the body, which from the side is also
# the midline the relaxed feet fall away from. No ghost: stillness has no
# single wrong shape worth drawing.
STILL_GUIDES = [
    {'from': (0, -1.05, 0.0), 'to': (0, 1.1, 0.0)},
]

POSTURE = {
    'id': 'savasana',
    'view': 'side',
    'frame': {'center_z': 0.35, 'scale': 2.4},
    'transition': 9,
    'stages': [
        {'label': 'Lie down', 'pose': LIE_DOWN, 'hold': 5},
        {'label': 'Settle', 'pose': SETTLE, 'hold': 6},
        {'label': 'Stillness', 'pose': STILL, 'hold': 12, 'guides': STILL_GUIDES},
    ],
}
