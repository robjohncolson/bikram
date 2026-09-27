"""
Bow — prone, bend the knees, grip the feet from the outside, then kick the
legs up and back so the chest and thighs both leave the floor: a drawn bow
rocking on the abdomen.

Prone recipe: head toward -Y, legs toward +Y, tubes resting at z≈0.12. The
arms are straight "strings" aimed from the shoulder at the ankle; the tube
hand has no fingers, so the grip is the hand ending at the ankle (a little
outside it, for the grip from the outside).
"""


def at(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


FLOOR = -0.88       # pelvis joint at z≈0.12


def prone(**over):
    """Face down, chin forward, arms along the sides, legs long."""
    pose = {
        'pelvis.location': at(0, -0.12, FLOOR),
        'pelvis': (0, -1, 0),
        'spine.lower': (0, -1, 0), 'spine.upper': (0, -1, 0),
        'neck': (0, -1, 0.05), 'head': (0, -1, 0.05),
        'clavicle.L': (0.95, 0, -0.3), 'clavicle.R': (-0.95, 0, -0.3),
        'upperarm.L': (0.05, 1, 0), 'upperarm.R': (-0.05, 1, 0),
        'forearm.L': (0.02, 1, 0), 'forearm.R': (-0.02, 1, 0),
        'hand.L': (0, 1, 0), 'hand.R': (0, 1, 0),
        'thigh.L': (0, 1, 0), 'thigh.R': (0, 1, 0),
        'shin.L': (0, 1, 0), 'shin.R': (0, 1, 0),
        'foot.L': (0, 1, -0.15), 'foot.R': (0, 1, -0.15),
    }
    pose.update(over)
    return pose


def string(d, inward=0.08):
    """Both arms straight along `d` (the side-view direction shoulder →
    ankle), converging slightly so the hands land just outside the ankles —
    the grip from the outside."""
    _, y, z = d
    return {
        'upperarm.L': (-inward, y, z), 'upperarm.R': (inward, y, z),
        'forearm.L': (-inward, y, z), 'forearm.R': (inward, y, z),
        'hand.L': (-inward, y, z), 'hand.R': (inward, y, z),
    }


LIE = prone()

# Knees bend, heels come toward the hips, hands reach back to the feet;
# the chest lifts just enough to reach.
SHIN_HOLD = (0, -0.8, 0.6)
HOLD = prone(**{
    **string((0, 0.87, 0.48)),
    'spine.upper': (0, -0.97, 0.22), 'neck': (0, -0.95, 0.3), 'head': (0, -0.97, 0.25),
    'shin.L': SHIN_HOLD, 'shin.R': SHIN_HOLD,
    'foot.L': (0, 0.3, 0.95), 'foot.R': (0, 0.3, 0.95),
})

# Kick: the legs push back into the hands, which draws the chest up; the
# body rocks on the abdomen with thighs and chest off the floor.
THIGH = (0, 0.8, 0.6)
SHIN = (0, -0.5, 0.87)
KICK = prone(**{
    **string((0, 0.68, 0.73)),
    'pelvis': (0, -1, 0.15),
    'spine.lower': (0, -0.85, 0.52), 'spine.upper': (0, -0.6, 0.8),
    'neck': (0, -0.5, 0.87), 'head': (0, -0.6, 0.8),
    'clavicle.L': (0.95, 0.15, -0.1), 'clavicle.R': (-0.95, 0.15, -0.1),
    'thigh.L': THIGH, 'thigh.R': THIGH, 'shin.L': SHIN, 'shin.R': SHIN,
    'foot.L': (0, 0.75, 0.66), 'foot.R': (0, 0.75, 0.66),
})

POSTURE = {
    'id': 'bow',
    'view': 'side',
    'frame': {'center_z': 0.45, 'scale': 2.2},
    'transition': 7,
    'stages': [
        {'label': 'Lie prone', 'pose': LIE, 'hold': 4},
        {'label': 'Hold the feet', 'pose': HOLD, 'hold': 5},
        {'label': 'Kick up', 'pose': KICK, 'hold': 10},
        {'label': 'Lower', 'pose': LIE, 'hold': 4},
    ],
}
