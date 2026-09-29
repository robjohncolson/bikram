"""
Standing Head to Knee (Dandayamana-Janushirasana) — stage poses for the rig.

Right leg first: stand on the locked left leg, fold forward and hold the
right foot with interlaced hands; kick the right leg out level with the
floor; bend the elbows down below the calf; round forward until the
forehead meets the knee. The left side repeats the full expression.
Side view from the mannequin's right, so the working leg is nearest.
"""


def mirror(pose):
    """Swap .L/.R and flip X to get the other side."""
    out = {}
    for name, v in pose.items():
        if name.endswith('.L'):
            name = name[:-2] + '.R'
        elif name.endswith('.R'):
            name = name[:-2] + '.L'
        out[name] = (-v[0], v[1], v[2])
    return out


def both_arms(upper, fore, hand):
    """Both arms reach for the one foot together (interlaced fingers)."""
    return {
        'upperarm.L': (-0.12, upper[1], upper[2]), 'upperarm.R': (0.12, upper[1], upper[2]),
        'forearm.L': (-0.1, fore[1], fore[2]), 'forearm.R': (0.1, fore[1], fore[2]),
        'hand.L': (-0.4, hand[1], hand[2]), 'hand.R': (0.4, hand[1], hand[2]),
    }



# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

# "Fix all your weight into one leg and lock that knee": standing tall
# on the left, the right heel just off the floor.
LOCK = {
    'pelvis.location': (0.03, 0, 0),
    'thigh.L': (-0.09, 0, -1), 'shin.L': (-0.07, 0, -1),
    'thigh.R': (0.09, 0, -1), 'shin.R': (0.07, 0.08, -1),
    'foot.R': (0, -0.85, -0.5),
}

# Knee lifted, torso folded, straight arms holding the foot.
HOLD = {
    'pelvis': (0, -0.5, 0.87),
    'spine.lower': (0, -0.7, 0.71),
    'spine.upper': (0, -0.8, 0.6),
    'neck': (0, -0.85, 0.3), 'head': (0, -0.7, -0.2),
    'thigh.R': (0, -0.95, 0.3),
    'shin.R': (0, -0.5, -0.87),
    'foot.R': (0, -0.9, 0.4),
    **both_arms((0, -0.55, -0.83), (0, -0.55, -0.83), (0, -0.7, -0.6)),
}

# The right leg kicks straight out, level with the floor, heel pushing away.
KICK = {
    'pelvis': (0, -0.6, 0.8),
    'spine.lower': (0, -0.8, 0.6),
    'spine.upper': (0, -0.9, 0.45),
    'neck': (0, -0.9, 0.3), 'head': (0, -0.9, 0.2),
    'thigh.R': (0, -1, 0.04), 'shin.R': (0, -1, 0.04),
    'foot.R': (0, -0.2, 1),
    **both_arms((0, -0.94, -0.35), (0, -0.94, -0.3), (0, -0.8, 0.5)),
}

# Elbows bend down below the calf, chest lowers toward the thigh.
ELBOWS = {
    'pelvis': (0, -0.75, 0.66),
    'spine.lower': (0, -0.95, 0.3),
    'spine.upper': (0, -0.98, 0.12),
    'neck': (0, -0.95, 0), 'head': (0, -0.95, -0.2),
    'thigh.R': (0, -1, 0.06), 'shin.R': (0, -1, 0.06),
    'foot.R': (0, -0.2, 1),
    **both_arms((0, -0.65, -0.76), (0, -0.99, 0.12), (0, -0.9, 0.4)),
}

# Forehead to the knee: spine rounded down over the level leg.
HEAD_TO_KNEE = {
    'pelvis': (0, -0.85, 0.52),
    'spine.lower': (0, -1, 0.1),
    'spine.upper': (0, -0.98, -0.12),
    'neck': (0, -0.8, -0.6), 'head': (0, -0.75, -0.66),
    'thigh.R': (0, -1, 0.08), 'shin.R': (0, -1, 0.08),
    'foot.R': (0, -0.25, 1),
    **both_arms((0, -0.56, -0.83), (0, -0.92, 0.38), (0, -0.8, 0.6)),
}

def guides(side=1):
    """The hip-height horizontal the kicked leg must reach, and the vertical
    line of the locked standing leg. `side` 1 = right leg kicking (standing
    on the left, +X); -1 mirrors it."""
    x = 0.10 * side
    return [
        {'from': (0, 0.35, 0.98), 'to': (0, -1.05, 0.98)},
        {'from': (x, 0, 0.02), 'to': (x, 0, 1.0)},
    ]


# Kick-out mistake: the kicked leg sags below hip height.
KICK_GHOST = {
    'thigh.R': (0, -1, -0.3), 'shin.R': (0, -1, -0.3),
}

# Head-to-knee mistake: the standing knee softens to buy the forehead its
# reach, so the hips drop and the kicked leg sags with them.
HEAD_TO_KNEE_GHOST = {
    'pelvis.location': (0, 0, -0.07),
    'thigh.L': (0, -0.4, -0.92), 'shin.L': (0, 0.4, -0.92),
    'thigh.R': (0, -1, -0.12), 'shin.R': (0, -1, -0.12),
}

POSTURE = {
    'id': 'standing-head-to-knee',
    'view': 'side',
    'frame': {'center_z': 1.0, 'scale': 2.4},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
        {'label': 'Lock the knee', 'pose': LOCK, 'hold': 4},
        {'label': 'Hold the foot', 'pose': HOLD, 'hold': 4},
        {'label': 'Kick out', 'pose': KICK, 'hold': 5,
         'guides': guides(), 'ghost': KICK_GHOST},
        {'label': 'Elbows down', 'pose': ELBOWS, 'hold': 5},
        {'label': 'Head to knee', 'pose': HEAD_TO_KNEE, 'hold': 8,
         'guides': guides(), 'ghost': HEAD_TO_KNEE_GHOST},
        {'label': 'Release', 'pose': {}, 'hold': 3},
        {'label': 'Left side', 'pose': mirror(HEAD_TO_KNEE), 'hold': 6,
         'guides': guides(-1), 'ghost': mirror(HEAD_TO_KNEE_GHOST)},
        {'label': 'Release', 'pose': {}, 'hold': 3},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
    ],
}
