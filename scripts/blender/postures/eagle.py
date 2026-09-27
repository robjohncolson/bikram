"""
Eagle (Garurasana) — stage poses for the mannequin rig.

Right side first: the right arm crosses under the left at the elbows, the
forearms rise to palms-together in front of the face; the hips sit low on
the bent left leg while the right thigh crosses over the left and the right
foot hooks behind the left calf. The left side mirrors it. Tube limbs can't
twist around each other, so the wrap is drawn as crossed, stacked limbs.
"""


def at(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


def mirror(pose):
    """Swap .L/.R and flip X to get the other side."""
    out = {}
    for name, v in pose.items():
        if name == 'pelvis.location':
            out[name] = (-v[0], v[1], v[2])  # world offset: mirror X
            continue
        if name.endswith('.L'):
            name = name[:-2] + '.R'
        elif name.endswith('.R'):
            name = name[:-2] + '.L'
        out[name] = (-v[0], v[1], v[2])
    return out


ARMS_WIDE = {
    'upperarm.L': (1, 0, 0.1), 'upperarm.R': (-1, 0, 0.1),
    'forearm.L': (1, 0, 0.1), 'forearm.R': (-1, 0, 0.1),
    'hand.L': (1, 0, 0.1), 'hand.R': (-1, 0, 0.1),
}

RIGHT = {
    # sit low on the left leg
    'pelvis.location': at(0, 0.08, -0.29),
    'pelvis': (0, -0.3, 0.95),
    'spine.lower': (0, -0.3, 0.95),
    'spine.upper': (0, -0.15, 1),
    'neck': (0, -0.05, 1), 'head': (0, 0, 1),
    'thigh.L': (-0.03, -0.82, -0.57),
    'shin.L': (0, 0.64, -0.77),
    'foot.L': (0, -0.89, -0.45),  # flat on the floor
    # right thigh over the left, right foot hooked behind the left calf
    'thigh.R': (0.18, -0.34, -0.17),
    'shin.R': (0.08, 0.31, -0.32),
    'foot.R': (-0.8, -0.2, -0.3),  # toes wrap round the calf, off the floor
    # right arm under the left at the elbows, forearms up, palms together
    'upperarm.L': (-0.6, -0.65, -0.38),
    'upperarm.R': (0.55, -0.6, -0.58),
    'forearm.L': (-0.12, -0.2, 1),
    'forearm.R': (0.08, -0.35, 1),
    'hand.L': (-0.1, -0.1, 1),
    'hand.R': (0.05, -0.15, 1),
}

LEFT = mirror(RIGHT)

# Guides (both sides): the vertical midline the crossed arms and crossed
# legs both stack on, and the hip height to sit down to.
GUIDES = [
    {'from': (0, 0, 0.0), 'to': (0, 0, 1.62)},
    {'from': (-0.42, 0, 0.69), 'to': (0.42, 0, 0.69)},
]

# Common mistake: sitting too high — the standing knee barely bends, so the
# hips (and the whole wrap riding on them) float well above the sit line.
RIGHT_GHOST = {
    'pelvis.location': at(0, 0.04, -0.08),
    'pelvis': (0, -0.15, 1),
    'spine.lower': (0, -0.15, 1),
    'thigh.L': (-0.03, -0.45, -0.89),
    'shin.L': (0, 0.35, -0.94),
}
LEFT_GHOST = mirror(RIGHT_GHOST)

POSTURE = {
    'id': 'eagle',
    'view': 'front',
    'frame': {'center_z': 0.98, 'scale': 2.1},
    'transition': 7,
    'stages': [
        {'label': 'Arms wide', 'pose': ARMS_WIDE, 'hold': 3, 'view': 'front'},
        {'label': 'Right side', 'pose': RIGHT, 'hold': 8,
         'guides': GUIDES, 'ghost': RIGHT_GHOST},
        {'label': 'Release', 'pose': ARMS_WIDE, 'hold': 3, 'view': 'front'},
        {'label': 'Left side', 'pose': LEFT, 'hold': 8,
         'guides': GUIDES, 'ghost': LEFT_GHOST},
        {'label': 'Release', 'pose': {}, 'hold': 4, 'view': 'front'},
    ],
}
