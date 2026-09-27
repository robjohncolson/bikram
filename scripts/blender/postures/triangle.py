"""
Triangle — stage poses for the mannequin rig.

Wide stance, arms out in one line; one knee bends to a right angle over its
ankle, the torso tips over that thigh, the low hand touches the floor by the
foot and the other arm points straight up — everything in one plane, so the
front view shows it. Right side first (the right side is -X).
"""


def stance(side, bend):
    """Legs for a wide stance; `side` ('R'/'L') is the bent leg when `bend`."""
    s = -1 if side == 'R' else 1          # world X sign of the working side
    o = 'L' if side == 'R' else 'R'
    if not bend:
        return {
            'pelvis.location': (0, 0, -0.13),
            'thigh.L': (0.55, 0, -0.84), 'shin.L': (0.55, 0, -0.84),
            'thigh.R': (-0.55, 0, -0.84), 'shin.R': (-0.55, 0, -0.84),
        }
    return {
        'pelvis.location': (s * 0.14, 0, -0.40),
        f'thigh.{side}': (s, 0, -0.12), f'shin.{side}': (0, 0, -1),
        f'foot.{side}': (s, -0.1, -0.3),
        f'thigh.{o}': (-s * 0.83, 0, -0.56), f'shin.{o}': (-s * 0.83, 0, -0.56),
    }


ARMS_OUT = {
    'clavicle.L': (1, 0, 0.1), 'clavicle.R': (-1, 0, 0.1),
    'upperarm.L': (1, 0, 0), 'upperarm.R': (-1, 0, 0),
    'forearm.L': (1, 0, 0), 'forearm.R': (-1, 0, 0),
    'hand.L': (1, 0, 0), 'hand.R': (-1, 0, 0),
}

OPEN = {**stance('R', False), **ARMS_OUT}


def bend(side):
    return {**stance(side, True), **ARMS_OUT}


def triangle(side):
    s = -1 if side == 'R' else 1
    o = 'L' if side == 'R' else 'R'
    spine = (s * 0.9, 0, 0.44)
    return {
        **stance(side, True),
        'pelvis': (s * 0.5, 0, 0.87),
        'spine.lower': (s * 0.85, 0, 0.53), 'spine.upper': spine,
        'neck': spine, 'head': (s * 0.7, 0, 0.7),
        f'clavicle.{side}': (s * 0.44, 0, -0.9), f'clavicle.{o}': (-s * 0.44, 0, 0.9),
        f'upperarm.{side}': (s * 0.12, 0, -1), f'forearm.{side}': (s * 0.12, 0, -1),
        f'hand.{side}': (s * 0.12, 0, -1),
        f'upperarm.{o}': (0, 0, 1), f'forearm.{o}': (0, 0, 1), f'hand.{o}': (0, 0, 1),
    }


def triangle_guides(side):
    """The pane the whole body stays in, the horizontal at the bent thigh,
    and the one vertical line of the arms."""
    s = -1 if side == 'R' else 1
    return [
        {'plane': 'y', 'at': 0.0, 'z': (0.0, 1.95), 'w': 2.3},
        {'from': (s * 0.1, 0, 0.53), 'to': (s * 0.9, 0, 0.53)},
        {'from': (s * 0.6, 0, 0.0), 'to': (s * 0.33, 0, 1.85)},
    ]


def triangle_ghost(side):
    """Common mistake: the torso tips forward out of the plane, chest to
    the floor, and the top arm drifts forward with it."""
    s = -1 if side == 'R' else 1
    o = 'L' if side == 'R' else 'R'
    return {
        'spine.lower': (s * 0.7, -0.5, 0.45),
        'spine.upper': (s * 0.6, -0.75, 0.25),
        'neck': (s * 0.6, -0.75, 0.2), 'head': (s * 0.5, -0.85, 0.0),
        f'upperarm.{o}': (s * 0.15, -0.7, 0.7), f'forearm.{o}': (s * 0.15, -0.7, 0.7),
        f'hand.{o}': (s * 0.15, -0.7, 0.7),
    }


POSTURE = {
    'id': 'triangle',
    'view': 'front',
    'frame': {'center_z': 1.0, 'scale': 2.5},
    'transition': 7,
    'stages': [
        {'label': 'Arms out', 'pose': OPEN, 'hold': 4},
        {'label': 'Bend right knee', 'pose': bend('R'), 'hold': 3},
        {'label': 'Right side', 'pose': triangle('R'), 'hold': 9,
         'guides': triangle_guides('R'), 'ghost': triangle_ghost('R')},
        {'label': 'Centre', 'pose': OPEN, 'hold': 3},
        {'label': 'Left side', 'pose': triangle('L'), 'hold': 7,
         'guides': triangle_guides('L'), 'ghost': triangle_ghost('L')},
        {'label': 'Rise', 'pose': OPEN, 'hold': 3},
    ],
}
