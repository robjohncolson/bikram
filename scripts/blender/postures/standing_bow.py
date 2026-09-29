"""
Standing Bow Pulling (Dandayamana-Dhanurasana) — stage poses for the rig.

Right leg first: stand on the locked left leg, the right hand grips the
right ankle behind; the left arm rises; then kick back and up while the
body and left arm stretch forward until the torso is level and the right
foot rises above the head. The left side repeats the full bow. Side view
from the mannequin's right, so the working leg and arm are nearest.
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



# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

# "Shift your full weight onto the left leg, locking the knee": tall on
# the left, the right heel just off the floor.
LOCK = {
    'pelvis.location': (0.03, 0, 0),
    'thigh.L': (-0.09, 0, -1), 'shin.L': (-0.07, 0, -1),
    'thigh.R': (0.09, 0, -1), 'shin.R': (0.07, 0.08, -1),
    'foot.R': (0, -0.85, -0.5),
}

# Right knee bent, right hand holding the ankle behind.
HOLD_LEG = {
    'thigh.R': (0, 0.1, -1),
    'shin.R': (0, 0.6, 0.8),
    'foot.R': (0, 0.5, 0.85),
    'upperarm.R': (0.1, 0.31, -0.55),
    'forearm.R': (0.1, 0.31, -0.55),
    'hand.R': (0.05, 0.4, -0.9),
}

HOLD = {**HOLD_LEG}

ARM_UP = {
    **HOLD_LEG,
    'upperarm.L': (-0.1, -0.2, 1), 'forearm.L': (-0.1, -0.2, 1), 'hand.L': (-0.1, -0.2, 1),
}

# Kicking: torso tipping forward, leg lifting back, left arm reaching.
KICK = {
    'pelvis': (0, -0.6, 0.8),
    'spine.lower': (0, -0.7, 0.7),
    'spine.upper': (0, -0.75, 0.65),
    'neck': (0, -0.7, 0.7), 'head': (0, -0.6, 0.8),
    'thigh.R': (0, 0.95, -0.31),
    'shin.R': (0, -0.16, 0.99),
    'foot.R': (0, 0.6, 0.8),
    'upperarm.R': (0, 1, 0), 'forearm.R': (0, 1, 0.02), 'hand.R': (0, 0.8, 0.6),
    'upperarm.L': (0, -0.8, 0.6), 'forearm.L': (0, -0.8, 0.6), 'hand.L': (0, -0.8, 0.6),
}

# Full bow: torso level, left arm straight forward, right foot kicked up
# above the head with the right arm pulled straight back.
FULL = {
    'pelvis': (0, -0.95, 0.3),
    'spine.lower': (0, -1, 0.1),
    'spine.upper': (0, -1, 0.1),
    'neck': (0, -1, 0.2), 'head': (0, -0.95, 0.3),
    'thigh.R': (0, 0.85, 0.52),
    'shin.R': (0, -0.63, 0.78),
    'foot.R': (0, 0.3, 0.95),
    # palm curls in over the inside of the ankle
    'upperarm.R': (0, 0.74, 0.68), 'forearm.R': (0, 0.74, 0.68), 'hand.R': (0.35, 0.6, 0.72),
    'upperarm.L': (0, -1, 0.1), 'forearm.L': (0, -1, 0.1), 'hand.L': (0, -1, 0.1),
}


def guides(side=1):
    """The level line the torso lies along and the kicked foot rises above,
    and the vertical lamp-post of the locked standing leg from its hip.
    `side` 1 = right leg kicking (standing on the left, +X); -1 mirrors."""
    x = 0.10 * side
    return [
        {'from': (0, 0.5, 1.2), 'to': (0, -1.1, 1.2)},
        {'from': (x, 0, 0.02), 'to': (x, 0, 1.0)},
    ]


# Common mistake: the kicking knee splays out to the side, so the hip opens
# and the foot kicks out and back instead of up — it stalls barely above
# the level line (the arm follows the ankle down).
FULL_GHOST = {
    'thigh.R': (-0.55, 0.8, 0.05),
    'shin.R': (-0.1, -0.5, 0.86),
    'foot.R': (-0.3, 0.35, 0.88),
    'upperarm.R': (-0.31, 0.84, 0.44), 'forearm.R': (-0.31, 0.84, 0.44),
    'hand.R': (0.2, 0.75, 0.6),
}

POSTURE = {
    'id': 'standing-bow',
    'view': 'side',
    'frame': {'center_z': 1.05, 'scale': 2.5},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
        {'label': 'Lock the knee', 'pose': LOCK, 'hold': 4},
        {'label': 'Hold the foot', 'pose': HOLD, 'hold': 4},
        {'label': 'Arm up', 'pose': ARM_UP, 'hold': 3},
        {'label': 'Kick', 'pose': KICK, 'hold': 5},
        {'label': 'Full bow', 'pose': FULL, 'hold': 8,
         'guides': guides(), 'ghost': FULL_GHOST},
        {'label': 'Release', 'pose': {}, 'hold': 3},
        {'label': 'Left side', 'pose': mirror(FULL), 'hold': 6,
         'guides': guides(-1), 'ghost': mirror(FULL_GHOST)},
        {'label': 'Release', 'pose': {}, 'hold': 3},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
    ],
}
