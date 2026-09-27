"""
Locust — prone, arms pinned straight under the body palms down; lift the
right leg, then the left, then both legs together.

Prone recipe: the head lies toward -Y (face down), legs toward +Y, and
`pelvis.location` drops the body so the tubes rest at z≈0.12. With the head
toward -Y the rig's left stays +X, so the right leg is thigh.R (-X, the leg
nearest the side camera). The body is nudged -Y so the lifted legs sit
centred in the frame.
"""

def at(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


Y0 = -0.15          # shift toward the head so the raised legs stay in frame
FLOOR = -0.85       # pelvis joint at z≈0.15: the torso rests on the arms


def prone(**over):
    """Lying face down, chin forward, arms straight under the body toward
    the hips (hidden beneath the torso from the side), legs long."""
    pose = {
        'pelvis.location': at(0, Y0, FLOOR),
        'pelvis': (0, -1, 0),
        'spine.lower': (0, -1, 0), 'spine.upper': (0, -1, 0),
        'neck': (0, -1, 0.05), 'head': (0, -1, 0.05),
        'clavicle.L': (0.9, 0, -0.45), 'clavicle.R': (-0.9, 0, -0.45),
        'upperarm.L': (-0.3, 1, 0), 'upperarm.R': (0.3, 1, 0),
        'forearm.L': (-0.1, 1, 0), 'forearm.R': (0.1, 1, 0),
        'hand.L': (0, 1, 0), 'hand.R': (0, 1, 0),
        'thigh.L': (0, 1, 0), 'thigh.R': (0, 1, 0),
        'shin.L': (0, 1, 0), 'shin.R': (0, 1, 0),
        'foot.L': (0, 1, -0.15), 'foot.R': (0, 1, -0.15),
    }
    pose.update(over)
    return pose


LIE = prone()

# One straight leg lifts from the hip to about forty-five degrees; hips stay down.
UP45 = (0, 0.74, 0.67)
FOOT45 = (0, 0.6, 0.8)
RIGHT = prone(**{'thigh.R': UP45, 'shin.R': UP45, 'foot.R': FOOT45})
LEFT = prone(**{'thigh.L': UP45, 'shin.L': UP45, 'foot.L': FOOT45})

# Both legs: the arms press down, the pelvis lifts off the floor and the body
# pivots on the chest; legs together and high.
BOTH_LEG = (0, 0.6, 0.8)
BOTH_FOOT = (0, 0.45, 0.9)
BOTH = prone(**{
    'pelvis.location': at(0, Y0, FLOOR + 0.06),
    'pelvis': (0, -0.95, -0.3),
    'spine.lower': (0, -0.97, -0.25),
    'spine.upper': (0, -1, -0.05),
    'upperarm.L': (-0.3, 1, -0.02), 'upperarm.R': (0.3, 1, -0.02),
    'forearm.L': (-0.1, 1, 0), 'forearm.R': (0.1, 1, 0),
    'thigh.L': BOTH_LEG, 'thigh.R': BOTH_LEG,
    'shin.L': BOTH_LEG, 'shin.R': BOTH_LEG,
    'foot.L': BOTH_FOOT, 'foot.R': BOTH_FOOT,
})

POSTURE = {
    'id': 'locust',
    'view': 'side',
    'frame': {'center_z': 0.55, 'scale': 2.3},
    'transition': 7,
    'stages': [
        {'label': 'Lie prone', 'pose': LIE, 'hold': 4},
        {'label': 'Right leg', 'pose': RIGHT, 'hold': 6},
        {'label': 'Left leg', 'pose': LEFT, 'hold': 6},
        {'label': 'Both legs', 'pose': BOTH, 'hold': 8},
        {'label': 'Lower', 'pose': LIE, 'hold': 4},
    ],
}
