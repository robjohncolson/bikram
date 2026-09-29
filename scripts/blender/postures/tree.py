"""
Tree — stage poses for the mannequin rig.

Stand on one leg; the other foot is drawn up high against the standing
thigh with the knee opened out to the side and pressing down; palms meet in
prayer at the chest. Front view. The right foot lifts first (the right side
is -X), so the left leg stands.
"""


def standing_shift(stand):
    s = 1 if stand == 'L' else -1
    return {'pelvis.location': (s * 0.03, 0, 0)}


def folded_leg(lift):
    s = -1 if lift == 'R' else 1
    return {
        f'thigh.{lift}': (s * 0.62, -0.25, -0.75),
        f'shin.{lift}': (-s * 0.85, -0.1, 0.52),
        f'foot.{lift}': (-s * 0.15, -0.3, -0.95),
    }


PRAYER = {
    'upperarm.L': (0.3, -0.35, -0.89), 'upperarm.R': (-0.3, -0.35, -0.89),
    'forearm.L': (-0.8, -0.45, 0.4), 'forearm.R': (0.8, -0.45, 0.4),
    'hand.L': (-0.1, -0.1, 1), 'hand.R': (0.1, -0.1, 1),
}


def hold_foot(lift):
    """The lifting side's hand draws the foot up into place."""
    s = -1 if lift == 'R' else 1
    return {
        **standing_shift('L' if lift == 'R' else 'R'),
        **folded_leg(lift),
        f'upperarm.{lift}': (s * 0.1, -0.2, -1),
        f'forearm.{lift}': (-s * 0.5, -0.3, -0.8),
        f'hand.{lift}': (-s * 0.6, -0.1, -0.8),
    }


def tree(lift):
    return {
        **standing_shift('L' if lift == 'R' else 'R'),
        **folded_leg(lift),
        **PRAYER,
    }


def tree_guides(lift):
    """The plumb line up through the standing leg (the lamp post), and the
    hip line that stays level."""
    s = 1 if lift == 'R' else -1          # X sign of the standing side
    return [
        {'from': (s * 0.13, 0, 0.0), 'to': (s * 0.13, 0, 1.85)},
        {'from': (-0.42, 0, 0.98), 'to': (0.42, 0, 0.98)},
    ]


def tree_ghost(lift):
    """Common mistake: the hip stays closed -- the folded knee points
    forward instead of out and down, and that side of the pelvis hitches up."""
    s = -1 if lift == 'R' else 1
    return {
        'pelvis': (-s * 0.08, 0, 1),
        f'thigh.{lift}': (s * 0.22, -0.72, -0.66),
        f'shin.{lift}': (-s * 0.6, 0.3, 0.2),
    }



# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

STAND = TADASANA


# "Pour your weight into the left foot": tall on the left, right heel
# just off the floor.
WEIGHT = {
    **standing_shift('L'),
    'thigh.L': (-0.09, 0, -1), 'shin.L': (-0.07, 0, -1),
    'thigh.R': (0.09, 0, -1), 'shin.R': (0.07, 0.08, -1),
    'foot.R': (0, -0.85, -0.5),
}


def press(lift):
    """The foot in place, hand still holding it, the folded knee pressed
    further out and down toward the floor."""
    s = -1 if lift == 'R' else 1
    return {
        **hold_foot(lift),
        f'thigh.{lift}': (s * 0.72, -0.2, -0.66),
        f'shin.{lift}': (-s * 0.85, -0.1, 0.52),
    }

POSTURE = {
    'id': 'tree',
    'view': 'front',
    'frame': {'center_z': 1.0, 'scale': 2.2},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 4},
        {'label': 'Weight on one foot', 'pose': WEIGHT, 'hold': 3},
        {'label': 'Lift right foot', 'pose': hold_foot('R'), 'hold': 3},
        {'label': 'Press the knee down', 'pose': press('R'), 'hold': 4},
        {'label': 'Palms together', 'pose': tree('R'), 'hold': 9,
         'guides': tree_guides('R'), 'ghost': tree_ghost('R')},
        {'label': 'Release', 'pose': STAND, 'hold': 3},
        {'label': 'Left side', 'pose': tree('L'), 'hold': 6,
         'guides': tree_guides('L'), 'ghost': tree_ghost('L')},
        {'label': 'Release', 'pose': STAND, 'hold': 3},
    ],
}
