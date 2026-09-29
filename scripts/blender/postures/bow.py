"""
Bow — prone, bend the knees, grip the feet from the outside, then kick the
legs up and back so the chest and thighs both leave the floor: a drawn bow
rocking on the abdomen.

Prone recipe: head toward -Y, legs toward +Y, tubes resting at z≈0.12. The
arms are straight "strings" aimed from the shoulder at a point just outside
the ankle (`grip` solves it from the stage's own spine and legs); the hand
turns in so the palm wraps the outer ankle.

Refined after the reference photograph (2026-09-29): Kick up was a shallow
folded triangle; now the body rocks onto the abdomen, the thighs rise
steeply with the knees well above the hips, the shins stand nearly upright
with the soles to the ceiling, and the chest and head lift — one deeper,
even arc with the straight arms still meeting the outer ankles.
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


def _unit(v):
    m = sum(c * c for c in v) ** 0.5
    return tuple(c / m for c in v)


def _walk(pose, start, chain):
    """End point of a chain of (bone, length) from `start` in `pose`."""
    p = start
    for bone, length in chain:
        d = _unit(pose.get(bone) or HIPBONE_REST[bone])
        p = tuple(a + length * c for a, c in zip(p, d))
    return p


HIPBONE_REST = {'hipbone.L': (0.1, 0, -0.02), 'hipbone.R': (-0.1, 0, -0.02)}
SPINE = (('pelvis', 0.12), ('spine.lower', 0.15), ('spine.upper', 0.13))
ARM = 0.29 + 0.25


def grip(pose, out=0.06):
    """Straight arms aimed from each shoulder at a point just OUTSIDE its
    ankle; the hand then turns in toward the ankle, so the palm (the swelling
    just past the wrist) lies against the outer ankle and the fingers wrap — the grip from the outside."""
    loc = pose['pelvis.location']
    base = (loc[0], loc[1], 1.0 + loc[2])
    neck = _walk(pose, base, SPINE)
    arms = {}
    for side, x in (('L', 1), ('R', -1)):
        shoulder = _walk(pose, neck, ((f'clavicle.{side}', 0.204),))
        hip = _walk(pose, base, ((f'hipbone.{side}', 0.102),))
        ankle = _walk(pose, hip, ((f'thigh.{side}', 0.44), (f'shin.{side}', 0.44)))
        target = (ankle[0] + x * out, ankle[1], ankle[2])
        u = _unit(tuple(t - s for t, s in zip(target, shoulder)))
        wrist = tuple(s + ARM * c for s, c in zip(shoulder, u))
        arms[f'upperarm.{side}'] = u
        arms[f'forearm.{side}'] = u
        inward = _unit(tuple(a - w for a, w in zip(ankle, wrist)))
        arms[f'hand.{side}'] = _unit(tuple(p + q for p, q in zip(u, inward)))
    return arms


def gripping(**over):
    pose = prone(**over)
    pose.update(grip(pose))
    return pose


LIE = prone()

# Knees bend, heels come toward the hips, hands reach back to the feet;
# the chest lifts just enough to reach.
SHIN_HOLD = (0, -0.8, 0.6)
HOLD = gripping(**{
    'spine.upper': (0, -0.97, 0.22), 'neck': (0, -0.95, 0.3), 'head': (0, -0.97, 0.25),
    'shin.L': SHIN_HOLD, 'shin.R': SHIN_HOLD,
    'foot.L': (0, 0.3, 0.95), 'foot.R': (0, 0.3, 0.95),
})

# "Lie on your abdomen and bend both knees": shins up, arms still beside.
BEND = prone(**{
    'shin.L': SHIN_HOLD, 'shin.R': SHIN_HOLD,
    'foot.L': (0, 0.3, 0.95), 'foot.R': (0, 0.3, 0.95),
})

# "Bring your chin to the floor and let your knees separate to about hip
# width": the grip, knees apart, chest down.
KNEES_APART = gripping(**{
    'thigh.L': (0.12, 1, 0), 'thigh.R': (-0.12, 1, 0),
    'shin.L': (0.05, -0.8, 0.6), 'shin.R': (-0.05, -0.8, 0.6),
    'foot.L': (0, 0.3, 0.95), 'foot.R': (0, 0.3, 0.95),
})

# Kick: the legs push back into the hands, which draws the chest up; the
# body rocks forward onto the abdomen with thighs and chest off the floor.
# After the reference photograph: the thighs rise steeply (knees well
# above the hips), the shins stand nearly upright with the soles to the
# ceiling, the chest and head lift toward the ceiling, and the straight arms
# run from the shoulders up to the outer ankles — one deep, even arc.
THIGH = (0, 0.66, 0.75)
SHIN = (0, -0.45, 0.89)
KICK = gripping(**{
    'pelvis.location': at(0, -0.12, FLOOR + 0.03),
    'pelvis': (0, -1, 0.12),
    'spine.lower': (0, -0.78, 0.63), 'spine.upper': (0, -0.48, 0.88),
    'neck': (0, -0.32, 0.95), 'head': (0, -0.25, 0.97),
    'clavicle.L': (0.95, 0.15, -0.1), 'clavicle.R': (-0.95, 0.15, -0.1),
    'thigh.L': THIGH, 'thigh.R': THIGH, 'shin.L': SHIN, 'shin.R': SHIN,
    'foot.L': (0, 0.5, 0.87), 'foot.R': (0, 0.5, 0.87),
})

# --- Teaching layers -------------------------------------------------------
# Guides (side view): the hip-height line along the floor the thighs lift
# above (knees off the floor), and the vertical the kicking feet rise toward.
KICK_GUIDES = [
    {'from': (0, -0.2, 0.12), 'to': (0, 0.55, 0.12)},
    {'from': (0, 0.08, 0.3), 'to': (0, 0.08, 1.1)},
]

# Common mistake: the knees splay wide and stay on the floor; the feet only
# rise as far as the arms pull them, so the chest barely leaves the floor.
_GHOST = prone(**{
    'pelvis': (0, -1, 0.05),
    'spine.lower': (0, -0.95, 0.3), 'spine.upper': (0, -0.8, 0.6),
    'neck': (0, -0.7, 0.72), 'head': (0, -0.8, 0.6),
    'clavicle.L': (0.95, 0.15, -0.1), 'clavicle.R': (-0.95, 0.15, -0.1),
    'thigh.L': (0.28, 1, 0.06), 'thigh.R': (-0.28, 1, 0.06),
    'shin.L': (0.05, -0.35, 0.94), 'shin.R': (-0.05, -0.35, 0.94),
    'foot.L': (0, 0.6, 0.8), 'foot.R': (0, 0.6, 0.8),
})
_GHOST.update(grip(_GHOST))
KICK_GHOST = {k: v for k, v in _GHOST.items() if KICK.get(k) != v}

POSTURE = {
    'id': 'bow',
    'position': {'start': 'prone', 'end': 'prone'},
    'view': 'side',
    'frame': {'center_z': 0.45, 'scale': 2.2},
    'transition': 7,
    'stages': [
        {'label': 'Lie prone', 'pose': LIE, 'hold': 4},
        {'label': 'Bend the knees', 'pose': BEND, 'hold': 4},
        {'label': 'Hold the feet', 'pose': HOLD, 'hold': 5},
        {'label': 'Knees separate', 'pose': KNEES_APART, 'hold': 4},
        {'label': 'Kick up', 'pose': KICK, 'hold': 10,
         'guides': KICK_GUIDES, 'ghost': KICK_GHOST},
        {'label': 'Lower', 'pose': LIE, 'hold': 4},
    ],
}
