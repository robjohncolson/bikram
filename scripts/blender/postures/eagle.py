"""
Eagle (Garurasana) — stage poses for the mannequin rig.

Right side first: the right arm crosses under the left at the elbows, the
forearms rise to palms-together in front of the face; the hips sit low on
the bent left leg while the right thigh crosses over the left and the right
foot hooks behind the left calf. The left side mirrors it. Tube limbs can't
twist around each other, so the wrap is drawn as crossed, stacked limbs.

Refined after the reference photographs (2026-09-29): a deeper sit with
the hips drawn back and the torso inclined forward, both legs solved to
flat planted feet (`two_bone`); the right thigh is laid ON the standing
thigh (its knee on top of and just in front of the standing knee) and
the shin wraps down behind the standing calf, foot hooked, toes down
(`legs`, which also builds the too-high ghost); the elbows cross in front
of the chest a little below shoulder height with the forearms upright
and the palms in front of the face. Sit low and the two wrap stages take
the `quarter` view so the sit and the leg wrap read.
"""
import math
import sys
from pathlib import Path


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



# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

ARMS_WIDE = {
    'upperarm.L': (1, 0, 0.1), 'upperarm.R': (-1, 0, 0.1),
    'forearm.L': (1, 0, 0.1), 'forearm.R': (-1, 0, 0.1),
    'hand.L': (1, 0, 0.1), 'hand.R': (-1, 0, 0.1),
}

def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def _warn_reach(dist, span, target):
    """Say so (stderr) when a reach target lies more than 1 cm beyond the
    chain: the helper clamps it, and the limb silently falls short."""
    if dist > span + 0.01:
        print(f'reach warning [{Path(__file__).stem}]: target '
              f'({target[0]:.3f}, {target[1]:.3f}, {target[2]:.3f}) is '
              f'{dist - span:.3f} m out of reach', file=sys.stderr)


def two_bone(root, target, l1, l2, hint):
    """Directions of two bones from `root` reaching `target`, the middle
    joint bent toward `hint`."""
    d = _add(target, root, -1)
    raw = math.sqrt(sum(c * c for c in d))
    _warn_reach(raw, l1 + l2, target)
    dist = min(raw, l1 + l2 - 1e-3)
    u = _n(d)
    x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    r = math.sqrt(max(l1 * l1 - x * x, 0.0))
    hu = sum(h * c for h, c in zip(hint, u))
    v = _n(_add(hint, u, -hu))
    mid = _add(_add(root, u, x), v, r)
    return _n(_add(mid, root, -1)), _n(_add(target, mid, -1))


# The sit (after the reference photographs): hips drawn back and down to
# about knee-and-a-half height, the torso inclined forward over them, the
# standing shin leaning well forward over a flat foot.
SIT_LOC = (0, 0.13, -0.38)
HIP = {'L': (0.10, SIT_LOC[1], 0.98 + SIT_LOC[2]), 'R': (-0.10, SIT_LOC[1], 0.98 + SIT_LOC[2])}
ANKLE = {'L': (0.08, 0.0, 0.10), 'R': (-0.08, 0.0, 0.10)}
SIT_TORSO = {
    'pelvis.location': at(*SIT_LOC),
    'pelvis': (0, -0.45, 0.89),
    'spine.lower': (0, -0.36, 0.93),
    'spine.upper': (0, -0.2, 0.98),
    'neck': (0, -0.08, 1), 'head': (0, -0.02, 1),
}


def legs(loc):
    """Both legs for hips at `loc` (a `pelvis.location`): the standing (left)
    leg solved to its planted ankle, the right thigh laid over it — the
    knee on top of and just in front of the standing knee — and the right
    shin wrapped down behind the standing calf."""
    hip = {s: (sx, loc[1], 0.98 + loc[2]) for s, sx in (('L', 0.10), ('R', -0.10))}
    th, sh = two_bone(hip['L'], ANKLE['L'], 0.44, 0.44, (0, -1, 0))
    knee = _add(hip['L'], th, 0.44)
    cross_knee = _add(knee, (-0.01, -0.05, 0.11))
    calf_back = _add(_add(knee, sh, 0.30), (-0.01, 0.10, 0))
    return {'thigh.L': th, 'shin.L': sh,
            'thigh.R': _n(_add(cross_knee, hip['R'], -1)),
            'shin.R': _n(_add(calf_back, cross_knee, -1))}


LEG = {s: two_bone(HIP[s], ANKLE[s], 0.44, 0.44, (0, -1, 0)) for s in 'LR'}

# Arms: the elbows cross at the midline in front of the chest, a little
# below shoulder height, right elbow under the left; the forearms stand
# upright and the palms meet in front of the face.
ARMS = {
    'upperarm.L': (-0.55, -0.78, -0.22),
    'upperarm.R': (0.6, -0.68, -0.42),
    'forearm.L': (-0.1, -0.22, 1),
    'forearm.R': (0.06, -0.3, 1),
    'hand.L': (-0.08, -0.12, 1),
    'hand.R': (0.04, -0.15, 1),
}

RIGHT = {
    **SIT_TORSO,
    **legs(SIT_LOC),
    'foot.L': (0, -0.89, -0.45),  # flat on the floor
    'foot.R': (-0.55, -0.1, -0.83),  # hooked round the calf, toes down, off the floor
    **ARMS,
}

LEFT = mirror(RIGHT)

# "Cross the right arm under the left at the elbows": arms crossed in
# front, forearms still hanging forward and down.
CROSS = {
    'upperarm.L': (-0.55, -0.78, -0.22), 'upperarm.R': (0.6, -0.68, -0.42),
    'forearm.L': (-0.1, -0.75, -0.65), 'forearm.R': (0.1, -0.75, -0.65),
    'hand.L': (-0.1, -0.75, -0.65), 'hand.R': (0.1, -0.75, -0.65),
}

# "Twist the forearms around each other and press the palms together in
# front of the face": the finished arm wrap, still standing tall.
PALMS = dict(ARMS)

# "Pull the elbows down and sit the hips low": the wrap on two bent legs.
SIT_LOW = {
    **PALMS,
    **SIT_TORSO,
    'thigh.L': LEG['L'][0], 'thigh.R': LEG['R'][0],
    'shin.L': LEG['L'][1], 'shin.R': LEG['R'][1],
    'foot.L': (0, -0.89, -0.45), 'foot.R': (0, -0.89, -0.45),
}

# Guides (both sides): the vertical midline the crossed arms and crossed
# legs both stack on, and the hip height to sit down to.
GUIDES = [
    {'from': (0, 0, 0.0), 'to': (0, 0, 1.62)},
    {'from': (-0.42, 0, 0.60), 'to': (0.42, 0, 0.60)},
]

# Common mistake: sitting too high — the standing knee barely bends, so the
# hips (and the whole wrap riding on them) float well above the sit line.
GHOST_LOC = (0, 0.05, -0.12)
RIGHT_GHOST = {
    'pelvis.location': at(*GHOST_LOC),
    'pelvis': (0, -0.15, 1),
    'spine.lower': (0, -0.15, 1),
    **legs(GHOST_LOC),
}
LEFT_GHOST = mirror(RIGHT_GHOST)

POSTURE = {
    'id': 'eagle',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'front',
    'frame': {'center_z': 0.98, 'scale': 2.1},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
        {'label': 'Arms wide', 'pose': ARMS_WIDE, 'hold': 3, 'view': 'front'},
        {'label': 'Cross the arms', 'pose': CROSS, 'hold': 4, 'view': 'front'},
        {'label': 'Palms together', 'pose': PALMS, 'hold': 4, 'view': 'front'},
        {'label': 'Sit low', 'pose': SIT_LOW, 'hold': 4, 'view': 'quarter'},
        {'label': 'Right leg over', 'pose': RIGHT, 'hold': 8, 'view': 'quarter',
         'guides': GUIDES, 'ghost': RIGHT_GHOST},
        {'label': 'Release', 'pose': ARMS_WIDE, 'hold': 3, 'view': 'front'},
        {'label': 'Left side', 'pose': LEFT, 'hold': 8, 'view': 'quarter',
         'guides': GUIDES, 'ghost': LEFT_GHOST},
        {'label': 'Release', 'pose': {}, 'hold': 4, 'view': 'front'},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
    ],
}
