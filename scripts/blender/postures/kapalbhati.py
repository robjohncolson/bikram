"""
Kapalbhati in Firm (Blowing in Firm) — stage poses for the mannequin rig.

Sitting on the heels (knees planted at y=KNEE_Y, z≈0.06, shins flat and
pointing back), hands on the knees, arms long. The breath is nearly still:
each "Pump" stage is the belly snapping in, shown as a small forward flex of
`spine.lower` (and a slight tuck of the pelvis); "Release" returns to tall.
The arms are solved each stage (`arms_to_knees`) so the hands stay on the
knees while the trunk moves. Side view: the face points screen-right (-Y).
The Pump stages carry teaching guides and a ghost of the common mistake.
"""
import math

KNEE_Y = -0.15
KNEE_Z = 0.06


def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def offset(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


THIGH = _n((0, -0.93, -0.36))
PELVIS = (0.0, KNEE_Y - 0.44 * THIGH[1], KNEE_Z + 0.02 - 0.44 * THIGH[2])

LEGS = {
    'pelvis.location': offset(0, PELVIS[1], PELVIS[2] - 1.0),
    'thigh.L': THIGH, 'thigh.R': THIGH,
    'shin.L': (0, 1, 0), 'shin.R': (0, 1, 0),
    'foot.L': (0, 1, -0.05), 'foot.R': (0, 1, -0.05),
}


def arms_to_knees(dirs, clav=(0.0, 0.2)):
    """Point each arm (upper, fore, hand in one line, elbow barely soft) from
    the shoulder to the top of the knee. `clav` is the clavicles' (y, z)
    lean — raise z to hunch the shoulders up."""
    p = _add(PELVIS, _n(dirs.get('pelvis', (0, 0, 1))), 0.12)
    p = _add(p, _n(dirs.get('spine.lower', (0, 0, 1))), 0.15)
    neck = _add(p, _n(dirs.get('spine.upper', (0, 0, 1))), 0.13)
    out = {}
    for side, sx in (('L', 1), ('R', -1)):
        c = _n((sx, clav[0], clav[1]))
        out['clavicle.' + side] = c
        shoulder = _add(neck, c, 0.2044)
        knee = (sx * 0.12, KNEE_Y + 0.02, KNEE_Z + 0.08)
        d = _n(tuple(k - s for k, s in zip(knee, shoulder)))
        out['upperarm.' + side] = _n(_add(d, (0, 0.06, 0)))
        out['forearm.' + side] = _n(_add(d, (0, -0.04, 0)))
        out['hand.' + side] = _n(_add(d, (0, -0.4, 0)))
    return out


def seated(torso, clav=(0.0, 0.2)):
    return {**LEGS, **torso, **arms_to_knees(torso, clav)}


TALL = seated({'pelvis': (0, 0, 1), 'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1),
               'neck': (0, -0.05, 1), 'head': (0, -0.05, 1)})

PUMP = seated({'pelvis': (0, 0.12, 1), 'spine.lower': (0, -0.38, 0.92), 'spine.upper': (0, -0.1, 1),
               'neck': (0, -0.12, 1), 'head': (0, -0.1, 1)})

# Guides: the vertical from the sitting bones up through the crown (sit
# tall — a slump muffles the pump) and the level the shoulders stay at
# (only the belly moves).
SHOULDER = PELVIS[2] + 0.40 + 0.04
PUMP_GUIDES = [
    {'from': (0, PELVIS[1], 0.0), 'to': (0, PELVIS[1], 1.05)},
    {'from': (0, PELVIS[1] - 0.24, SHOULDER), 'to': (0, PELVIS[1] + 0.2, SHOULDER)},
]

# Common mistake: the shoulders hitch up toward the ears with each blow and
# the spine slumps, the head poking forward.
PUMP_GHOST = {
    k: v for k, v in seated({'pelvis': (0, 0.3, 0.95), 'spine.lower': (0, -0.15, 0.99),
                             'spine.upper': (0, -0.45, 0.89), 'neck': (0, -0.5, 0.87),
                             'head': (0, -0.3, 0.95)}, clav=(0.05, 0.6)).items()
    if PUMP.get(k) != v
}

POSTURE = {
    'id': 'kapalbhati',
    'position': {'start': 'kneeling', 'end': 'kneeling'},
    'view': 'side',
    'frame': {'center_z': 0.55, 'scale': 1.4},
    'transition': 4,
    'stages': [
        {'label': 'Sit on the heels', 'pose': TALL, 'hold': 5},
        {'label': 'Pump', 'pose': PUMP, 'hold': 3,
         'guides': PUMP_GUIDES, 'ghost': PUMP_GHOST},
        {'label': 'Release', 'pose': TALL, 'hold': 3},
        {'label': 'Pump', 'pose': PUMP, 'hold': 3,
         'guides': PUMP_GUIDES, 'ghost': PUMP_GHOST},
        {'label': 'Release', 'pose': TALL, 'hold': 5},
    ],
}
