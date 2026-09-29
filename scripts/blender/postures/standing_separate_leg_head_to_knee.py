"""
Standing Separate Leg Head to Knee — stage poses for the mannequin rig.

Arms overhead with the palms steepled, feet apart with the body squared over
the front leg (drawn as a front/back split along the facing axis, so the side
view shows it), then chin tucked and the body folds until the forehead meets
the front knee and the steepled hands touch the floor in front of the foot.
The mannequin faces -Y (screen-right in the side view). Right side first.
"""


def arms_along(axis, clav, squeeze=0.2):
    ax, ay, az = axis
    _, cy, cz = clav
    return {
        'clavicle.L': (0.9, cy, cz), 'clavicle.R': (-0.9, cy, cz),
        'upperarm.L': (ax - squeeze, ay, az), 'upperarm.R': (ax + squeeze, ay, az),
        'forearm.L': (ax - squeeze, ay, az), 'forearm.R': (ax + squeeze, ay, az),
        'hand.L': (ax - squeeze * 1.3, ay, az), 'hand.R': (ax + squeeze * 1.3, ay, az),
    }


UP = {
    **arms_along((0, 0, 1), (0, 0, 0.35)),
    'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1), 'neck': (0, 0, 1), 'head': (0, 0, 1),
}


def legs(front, back, drop=-0.2):
    return {
        'pelvis.location': (0, 0, drop),
        f'thigh.{front}': (0, -0.62, -0.78), f'shin.{front}': (0, -0.62, -0.78),
        f'thigh.{back}': (0, 0.62, -0.78), f'shin.{back}': (0, 0.62, -0.78),
        f'foot.{back}': (0, -1, -0.3),
    }



# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

def split(front, back):
    return {**UP, **legs(front, back)}


# "Keep the arms glued beside the ears, elbows locked": the split, arms
# pulled in tight.
def locked(front, back):
    return {
        **legs(front, back),
        **arms_along((0, 0, 1), (0, 0, 0.4), squeeze=0.1),
        'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1), 'neck': (0, 0, 1), 'head': (0, 0, 1),
    }


# "Tuck the chin firmly to the chest and round down from the top of the
# spine": the fold begins at the head, arms travelling with it.
def tuck(front, back):
    return {
        **legs(front, back),
        'pelvis': (0, -0.15, 1),
        'spine.lower': (0, -0.3, 0.95),
        'spine.upper': (0, -0.6, 0.8),
        'neck': (0, -0.85, 0.3), 'head': (0, -0.6, -0.8),
        **arms_along((0, -0.9, 0.2), (0, -0.3, 0.1), squeeze=0.12),
    }


def fold(front, back):
    return {
        **legs(front, back),
        # torso laid along the front thigh, forehead at the knee
        'pelvis': (0, -0.8, 0.6),
        'spine.lower': (0, -0.75, -0.66),
        'spine.upper': (0, -0.6, -0.8),
        'neck': (0, -0.3, -0.95), 'head': (0, 0.25, -0.97),
        # steepled hands reach the floor just in front of the front foot
        **arms_along((0, -0.55, -0.83), (0, -0.2, -0.3), squeeze=0.15),
    }


def fold_guides(front):
    """The front leg as the straight '1' (drawn long so it shows past the
    hip and foot), and the plumb line the tucked head drops down onto the
    front knee."""
    x = -0.1 if front == 'R' else 0.1
    return [
        {'from': (x, 0.16, 0.98), 'to': (x, -0.62, 0.0)},
        {'from': (0, -0.27, 0.38), 'to': (0, -0.27, 1.12)},
    ]


def fold_ghost(front, back):
    """Common mistake: the head reaches forward for the knee instead of the
    chin tucking -- back flatter, neck craned, forehead past the knee."""
    return {
        'pelvis': (0, -0.85, 0.52),
        'spine.lower': (0, -0.85, -0.52),
        'spine.upper': (0, -0.8, -0.6),
        'neck': (0, -0.75, -0.66), 'head': (0, -0.6, -0.8),
    }


POSTURE = {
    'id': 'standing-separate-leg-head-to-knee',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'side',
    'frame': {'center_z': 1.0, 'scale': 2.5},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
        {'label': 'Arms up', 'pose': UP, 'hold': 3},
        {'label': 'Face the right foot', 'pose': split('R', 'L'), 'hold': 4},
        {'label': 'Elbows locked', 'pose': locked('R', 'L'), 'hold': 3},
        {'label': 'Tuck the chin', 'pose': tuck('R', 'L'), 'hold': 4},
        {'label': 'Head to knee', 'pose': fold('R', 'L'), 'hold': 10,
         'guides': fold_guides('R'), 'ghost': fold_ghost('R', 'L')},
        {'label': 'Rise', 'pose': split('R', 'L'), 'hold': 3},
        {'label': 'Left side', 'pose': fold('L', 'R'), 'hold': 6,
         'guides': fold_guides('L'), 'ghost': fold_ghost('L', 'R')},
        {'label': 'Rise', 'pose': UP, 'hold': 3},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
    ],
}
