"""
Full Locust — prone, arms out to the sides like wings, then chest, arms and
legs all lift at once: the airplane, balanced on the abdomen.

Prone recipe: head toward -Y, legs toward +Y, tubes resting at z≈0.12. The
side view shows the lift (the airplane's banana curve, arms as swept fins);
the camera swings to the front for "Arms out" so the wings read, then back
to the side for the flight. (The quarter views collapse the wings onto the
body line, so they are avoided.)

Refined after the reference photograph (2026-09-29): in the flight the
wings were lifted well above the shoulders and crossed the torso as a
diagonal from the side; they now reach out level with the shoulders
(on the shoulder guide line), so the banana curve of chest and legs reads.
"""


def at(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


Y0 = -0.16          # centre the lying body on the camera's orbit axis
FLOOR = -0.88       # pelvis joint at z≈0.12


def prone(**over):
    """Face down, chin forward, arms along the sides palms up, legs long."""
    pose = {
        'pelvis.location': at(0, Y0, FLOOR),
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


def wings(lift=0.0, sweep=0.12):
    """Arms straight out from the shoulders, slightly swept back."""
    return {
        'upperarm.L': (1, sweep, lift), 'upperarm.R': (-1, sweep, lift),
        'forearm.L': (1, sweep, lift), 'forearm.R': (-1, sweep, lift),
        'hand.L': (1, sweep, lift), 'hand.R': (-1, sweep, lift),
    }


LIE = prone()
ARMS = prone(**wings())
# "Bring your legs together, knees straight, toes pointed."
TOES = prone(**{**wings(), 'foot.L': (0, 0.95, -0.3), 'foot.R': (0, 0.95, -0.3)})

LEG = (0, 0.9, 0.42)
FLY = prone(**{
    **wings(lift=0.12, sweep=0.3),
    'spine.lower': (0, -0.94, 0.33),
    'spine.upper': (0, -0.8, 0.6),
    'neck': (0, -0.6, 0.8), 'head': (0, -0.55, 0.84),
    'clavicle.L': (0.95, 0.1, 0.1), 'clavicle.R': (-0.95, 0.1, 0.1),
    'thigh.L': LEG, 'thigh.R': LEG, 'shin.L': LEG, 'shin.R': LEG,
    'foot.L': (0, 0.9, 0.25), 'foot.R': (0, 0.9, 0.25),
})

# --- Teaching layers -------------------------------------------------------
# Guides (side view): the wing line at shoulder height (the arms reach out
# from it, never hanging below), and the line through the arc's two high
# points — crown and toes lift to the same height, a banana, not a seesaw.
SHOULDER_Z = 0.27
FLY_GUIDES = [
    {'from': (0, -0.8, SHOULDER_Z), 'to': (0, 0.1, SHOULDER_Z)},
    {'from': (0, -0.9, 0.53), 'to': (0, 0.95, 0.53)},
]

# Common mistake: only the chest and arms fly; the legs stay on the floor.
FLY_GHOST = {
    'thigh.L': (0, 1, 0), 'thigh.R': (0, 1, 0),
    'shin.L': (0, 1, 0), 'shin.R': (0, 1, 0),
    'foot.L': (0, 1, -0.15), 'foot.R': (0, 1, -0.15),
}

POSTURE = {
    'id': 'full-locust',
    'position': {'start': 'prone', 'end': 'prone'},
    'view': 'side',
    'frame': {'center_z': 0.4, 'scale': 2.3},
    'transition': 7,
    'stages': [
        {'label': 'Lie prone', 'pose': LIE, 'hold': 4},
        {'label': 'Arms out', 'pose': ARMS, 'hold': 5, 'view': 'front'},
        {'label': 'Toes pointed', 'pose': TOES, 'hold': 4},
        {'label': 'Lift off the floor', 'pose': FLY, 'hold': 10,
         'guides': FLY_GUIDES, 'ghost': FLY_GHOST},
        {'label': 'Lower', 'pose': ARMS, 'hold': 4},
    ],
}
