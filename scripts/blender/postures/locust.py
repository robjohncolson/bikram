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

# --- Teaching layers -------------------------------------------------------
# Guides (side view): the floor line the chin and both hips stay heavy on,
# and the straight line from the hip the lifted leg rises along (one piece,
# knee locked).
HIP_Z = 0.15


def leg_guides(leg=UP45, hip_z=HIP_Z, reach=1.25):
    lx, ly, lz = leg
    n = (ly * ly + lz * lz) ** 0.5
    return [
        {'from': (0, -1.0, 0.0), 'to': (0, 0.95, 0.0)},
        {'from': (0, Y0, hip_z), 'to': (0, Y0 + reach * ly / n, hip_z + reach * lz / n)},
    ]


def hip_hike(side):
    """Common mistake: the hip on the lifting side rolls up off the arm to
    throw the leg higher — the pelvis leaves the floor and the torso tips."""
    x = -1 if side == 'R' else 1
    return {
        'pelvis.location': at(0, Y0, FLOOR + 0.08),
        'pelvis': (0, -0.94, -0.34), 'spine.lower': (0, -0.98, -0.2),
        'spine.upper': (0, -1, -0.06),
        f'hipbone.{side}': (0.55 * x, 0, 0.85),
        f'thigh.{side}': (0, 0.68, 0.73), f'shin.{side}': (0, 0.68, 0.73),
        f'foot.{side}': (0, 0.55, 0.83),
    }


# Both legs: guides are the floor line and the legs' line; the mistake is
# swinging them up with the knees bent.
BOTH_GHOST = {
    'shin.L': (0, 0.2, 0.98), 'shin.R': (0, 0.2, 0.98),
    'foot.L': (0, -0.1, 1), 'foot.R': (0, -0.1, 1),
}

POSTURE = {
    'id': 'locust',
    'view': 'side',
    'frame': {'center_z': 0.55, 'scale': 2.3},
    'transition': 7,
    'stages': [
        {'label': 'Lie prone', 'pose': LIE, 'hold': 4},
        {'label': 'Right leg', 'pose': RIGHT, 'hold': 6,
         'guides': leg_guides(), 'ghost': hip_hike('R')},
        {'label': 'Left leg', 'pose': LEFT, 'hold': 6,
         'guides': leg_guides(), 'ghost': hip_hike('L')},
        {'label': 'Both legs', 'pose': BOTH, 'hold': 8,
         'guides': leg_guides(BOTH_LEG, hip_z=0.20), 'ghost': BOTH_GHOST},
        {'label': 'Lower', 'pose': LIE, 'hold': 4},
    ],
}
