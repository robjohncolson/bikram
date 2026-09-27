"""
Awkward Pose (Utkatasana) — stage poses for the mannequin rig.

Arms straight forward at shoulder height throughout. Part one sits back
into a chair on flat feet; part two sits on the toes with the thighs level;
part three presses the knees together on the toes and lowers until the hips
hover just above the heels, spine straight. The side view shows the sit.
Feet stay hip-width (the rest stance); the knees-together squeeze of part
three is drawn with the thighs angled in.
"""

def at(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


ARMS_FORWARD = {
    'upperarm.L': (0, -1, 0), 'upperarm.R': (0, -1, 0),
    'forearm.L': (0, -1, 0), 'forearm.R': (0, -1, 0),
    'hand.L': (0, -1, 0), 'hand.R': (0, -1, 0),
}

STAND = {**ARMS_FORWARD}

# Part one: flat feet, shins angled forward, thighs toward level, chest
# leaning forward over the knees.
PART_1 = {
    **ARMS_FORWARD,
    'pelvis.location': at(0, 0.20, -0.31),
    'pelvis': (0, -0.45, 0.89),
    'spine.lower': (0, -0.5, 0.87),
    'spine.upper': (0, -0.4, 0.92),
    'neck': (0, -0.1, 1), 'head': (0, -0.05, 1),
    'thigh.L': (0, -0.9, -0.42), 'thigh.R': (0, -0.9, -0.42),
    'shin.L': (0, 0.5, -0.87), 'shin.R': (0, 0.5, -0.87),
    'foot.L': (0, -0.89, -0.45), 'foot.R': (0, -0.89, -0.45),  # flat: heel + toes down
}

# Part two: high on the toes, thighs level, torso upright.
PART_2 = {
    **ARMS_FORWARD,
    'pelvis.location': at(0, 0.24, -0.40),
    'pelvis': (0, -0.1, 1),
    'spine.lower': (0, -0.08, 1),
    'spine.upper': (0, -0.04, 1),
    'thigh.L': (0, -1, -0.09), 'thigh.R': (0, -1, -0.09),
    'shin.L': (0, 0.57, -0.82), 'shin.R': (0, 0.57, -0.82),
    'foot.L': (0, -0.45, -0.89), 'foot.R': (0, -0.45, -0.89),
}

# Part three: knees together, hips hovering just above the lifted heels,
# spine straight up.
PART_3 = {
    **ARMS_FORWARD,
    'pelvis.location': at(0, 0.10, -0.62),
    'thigh.L': (-0.2, -0.97, 0.1), 'thigh.R': (0.2, -0.97, 0.1),
    'shin.L': (0.2, 0.87, -0.5), 'shin.R': (-0.2, 0.87, -0.5),
    'foot.L': (0, -0.3, -0.95), 'foot.R': (0, -0.3, -0.95),
}

POSTURE = {
    'id': 'awkward',
    'view': 'side',
    'frame': {'center_z': 1.0, 'scale': 2.3},
    'transition': 8,
    'stages': [
        {'label': 'Part one', 'pose': PART_1, 'hold': 7},
        {'label': 'Rise', 'pose': STAND, 'hold': 3},
        {'label': 'Part two', 'pose': PART_2, 'hold': 7},
        {'label': 'Rise', 'pose': STAND, 'hold': 3},
        {'label': 'Part three', 'pose': PART_3, 'hold': 8},
        {'label': 'Rise', 'pose': STAND, 'hold': 4},
    ],
}
