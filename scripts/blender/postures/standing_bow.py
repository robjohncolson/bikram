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
    'upperarm.R': (0, 0.74, 0.68), 'forearm.R': (0, 0.74, 0.68), 'hand.R': (0, 0.6, 0.8),
    'upperarm.L': (0, -1, 0.1), 'forearm.L': (0, -1, 0.1), 'hand.L': (0, -1, 0.1),
}

POSTURE = {
    'id': 'standing-bow',
    'view': 'side',
    'frame': {'center_z': 1.05, 'scale': 2.5},
    'transition': 7,
    'stages': [
        {'label': 'Hold the foot', 'pose': HOLD, 'hold': 4},
        {'label': 'Arm up', 'pose': ARM_UP, 'hold': 3},
        {'label': 'Kick', 'pose': KICK, 'hold': 5},
        {'label': 'Full bow', 'pose': FULL, 'hold': 8},
        {'label': 'Release', 'pose': {}, 'hold': 3},
        {'label': 'Left side', 'pose': mirror(FULL), 'hold': 6},
        {'label': 'Release', 'pose': {}, 'hold': 3},
    ],
}
