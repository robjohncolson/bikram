"""
Balancing Stick — stage poses for the mannequin rig.

Arms overhead with the palms steepled, a big step forward, then the whole
body tips as one stick to horizontal on the standing leg: a T seen from the
side. The mannequin faces -Y (screen-right in the side view); its right side
is -X. Right foot forward first, so the right leg stands and the left lifts.

Refined after the reference photographs (2026-09-29): the stick is one
exactly level line fingertips to heel (arms, spine, head and lifted leg
all horizontal; both ends rose slightly before).
"""


def arms_along(axis, clav, squeeze=0.2):
    """Arms locked beside the ears along `axis`, hands meeting past the crown.
    `clav` gives the clavicles' lift toward the head (y, z used)."""
    ax, ay, az = axis
    _, cy, cz = clav
    return {
        'clavicle.L': (0.9, cy, cz), 'clavicle.R': (-0.9, cy, cz),
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
    **arms_along((0, 0, 1), (0, 0, 0.35)),
    'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1), 'neck': (0, 0, 1), 'head': (0, 0, 1),
}

# "Stretch the whole body up toward the ceiling": the same reach, lifted
# out of the waist, arms pulled in tight.
STRETCH = {
    **arms_along((0, 0, 1), (0, 0, 0.4), squeeze=0.1),
    'pelvis.location': (0, 0, 0.03),
    'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1), 'neck': (0, 0, 1), 'head': (0, 0, 1),
}


def step(front, back):
    return {
        **UP,
        'pelvis.location': (0, 0, -0.05),
        f'thigh.{front}': (0, -0.3, -0.95), f'shin.{front}': (0, -0.3, -0.95),
        f'thigh.{back}': (0, 0.3, -0.95), f'shin.{back}': (0, 0.3, -0.95),
        f'foot.{back}': (0, -0.6, -0.8),
    }


def stick(stand, lift):
    # One straight, level line fingertips to heel (after the reference
    # photographs): arms, spine, head and the lifted leg all exactly
    # horizontal — the old slight rise at both ends made a shallow V.
    fwd = (0, -1, 0)
    return {
        **arms_along(fwd, (0, -0.35, 0)),
        'pelvis': (0, -1, 0),
        'spine.lower': fwd, 'spine.upper': fwd, 'neck': fwd, 'head': fwd,
        f'thigh.{stand}': (0, 0, -1), f'shin.{stand}': (0, 0, -1),
        f'thigh.{lift}': (0, 1, 0), f'shin.{lift}': (0, 1, 0),
        f'foot.{lift}': (0, 0.35, -0.94),
    }


def stick_guides(stand):
    """The one horizontal line fingertips to heel, and the standing leg's
    vertical pillar under it."""
    x = -0.1 if stand == 'R' else 0.1
    return [
        {'from': (0, -1.2, 1.0), 'to': (0, 1.0, 1.0)},
        {'from': (x, 0, 0.0), 'to': (x, 0, 1.0)},
    ]


def stick_ghost(stand, lift):
    """Common mistake: the stick breaks -- arms droop below the line, the
    middle sags and the lifted leg drops."""
    down = (0, -1, -0.28)
    return {
        **arms_along(down, (0, -0.35, -0.1)),
        'spine.lower': (0, -1, -0.12), 'spine.upper': (0, -1, -0.2),
        'neck': (0, -1, -0.1), 'head': (0, -1, 0.05),
        f'thigh.{lift}': (0, 1, -0.3), f'shin.{lift}': (0, 1, -0.3),
    }


POSTURE = {
    'id': 'balancing-stick',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'side',
    'frame': {'center_z': 1.05, 'scale': 2.6},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
        {'label': 'Arms up', 'pose': UP, 'hold': 4},
        {'label': 'Stretch up', 'pose': STRETCH, 'hold': 4},
        {'label': 'Step forward', 'pose': step('R', 'L'), 'hold': 3},
        {'label': 'Tip to horizontal', 'pose': stick('R', 'L'), 'hold': 10,
         'guides': stick_guides('R'), 'ghost': stick_ghost('R', 'L')},
        {'label': 'Rise', 'pose': UP, 'hold': 3},
        {'label': 'Left side', 'pose': stick('L', 'R'), 'hold': 6,
         'guides': stick_guides('L'), 'ghost': stick_ghost('L', 'R')},
        {'label': 'Rise', 'pose': UP, 'hold': 4},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
    ],
}
