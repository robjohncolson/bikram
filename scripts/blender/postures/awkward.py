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

# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

# Part one: flat feet, shins angled forward, thighs toward level, chest
# leaning forward over the knees.
PART_1 = {
    **ARMS_FORWARD,
    'pelvis.location': at(0, 0.25, -0.28),
    'pelvis': (0, -0.45, 0.89),
    'spine.lower': (0, -0.5, 0.87),
    'spine.upper': (0, -0.4, 0.92),
    'neck': (0, -0.1, 1), 'head': (0, -0.05, 1),
    'thigh.L': (0, -0.9, -0.42), 'thigh.R': (0, -0.9, -0.42),
    # shins steep enough that the knees stay over (not past) the toes
    'shin.L': (0, 0.35, -0.94), 'shin.R': (0, 0.35, -0.94),
    'foot.L': (0, -0.89, -0.45), 'foot.R': (0, -0.89, -0.45),  # flat: heel + toes down
}

# Part one guides: the level line the thighs sit down toward (knee height)
# and the vertical at the toes the knees must not pass.
PART_1_GUIDES = [
    {'from': (0, 0.5, 0.51), 'to': (0, -0.55, 0.51)},
    {'from': (0, -0.16, 0.0), 'to': (0, -0.16, 1.25)},
]

# Common mistake: the heels peel up and the hips slide forward, so the
# knees shoot out past the toes and the weight leaves the heels.
PART_1_GHOST = {
    'pelvis.location': at(0, 0.13, -0.31),
    'thigh.L': (0, -0.95, -0.3), 'thigh.R': (0, -0.95, -0.3),
    'shin.L': (0, 0.5, -0.87), 'shin.R': (0, 0.5, -0.87),
    'foot.L': (0, -0.45, -0.89), 'foot.R': (0, -0.45, -0.89),
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

# Part two guide: thighs level with the floor (hip height).
PART_2_GUIDES = [
    {'from': (0, 0.5, 0.58), 'to': (0, -0.55, 0.58)},
]

# Common mistake: only half-way up the toes — the heels sag, the hips stay
# high and back so the thighs slope down, and the torso tips forward.
PART_2_GHOST = {
    'pelvis.location': at(0, 0.33, -0.35),
    'pelvis': (0, -0.55, 0.84),
    'spine.lower': (0, -0.6, 0.8),
    'spine.upper': (0, -0.5, 0.87),
    'neck': (0, -0.2, 1), 'head': (0, -0.1, 1),
    'thigh.L': (0, -0.97, -0.24), 'thigh.R': (0, -0.97, -0.24),
    'shin.L': (0, 0.4, -0.92), 'shin.R': (0, 0.4, -0.92),
    'foot.L': (0, -0.7, -0.7), 'foot.R': (0, -0.7, -0.7),
}

# Part three guide: the wall the spine slides down — a vertical through the
# hips and head.
PART_3_GUIDES = [
    {'from': (0, 0.10, 0.2), 'to': (0, 0.10, 1.3)},
]

# Common mistake: the chest pitches forward off the wall as the hips drop.
PART_3_GHOST = {
    'pelvis': (0, -0.35, 0.94),
    'spine.lower': (0, -0.45, 0.89),
    'spine.upper': (0, -0.4, 0.92),
    'neck': (0, -0.2, 1), 'head': (0, -0.1, 1),
}

POSTURE = {
    'id': 'awkward',
    'view': 'side',
    'frame': {'center_z': 1.0, 'scale': 2.3},
    'transition': 8,
    'stages': [
        # the walk-in, one stage per spoken line: feet, then arms, then the sit
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4, 'view': 'front'},
        {'label': 'Feet apart', 'pose': {}, 'hold': 4, 'view': 'front'},
        {'label': 'Arms to shoulder height', 'pose': ARMS_FORWARD, 'hold': 4, 'view': 'side'},
        {'label': 'Part one', 'pose': PART_1, 'hold': 7,
         'guides': PART_1_GUIDES, 'ghost': PART_1_GHOST},
        {'label': 'Rise', 'pose': STAND, 'hold': 3},
        {'label': 'Part two', 'pose': PART_2, 'hold': 7,
         'guides': PART_2_GUIDES, 'ghost': PART_2_GHOST},
        {'label': 'Rise', 'pose': STAND, 'hold': 3},
        {'label': 'Part three', 'pose': PART_3, 'hold': 8,
         'guides': PART_3_GUIDES, 'ghost': PART_3_GHOST},
        {'label': 'Rise', 'pose': STAND, 'hold': 4},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4, 'view': 'front'},
    ],
}
