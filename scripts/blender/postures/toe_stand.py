"""
Toe Stand — from Tree, fold forward, bend the standing knee and sit down on
the lifted heel, balanced on the ball of the foot; hands to prayer.

Right side first: the right foot sits in the left hip crease (half lotus),
the left leg is the standing leg. Everything is placed from WORLD positions
of a few landmarks (pelvis joint, standing ankle, hands) and solved with a
tiny two-bone IK, so the standing foot stays planted while the hips drop.
`pelvis.location` is in the pelvis bone's rest frame ((a, b, c) -> world
(a, -c, b)); `shift` converts. `mirror` builds the left side.
"""
import math


def _n(v):
    l = math.sqrt(sum(c * c for c in v))
    return tuple(c / l for c in v)


def _add(a, b, s=1.0):
    return tuple(x + s * y for x, y in zip(a, b))


def _dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def two_bone(root, target, l1, l2, hint):
    """Directions of the two bones from `root` reaching `target`, the middle
    joint bent toward `hint`."""
    d = _add(target, root, -1)
    dist = min(math.sqrt(_dot(d, d)), l1 + l2 - 1e-3)
    u = _n(d)
    x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    r = math.sqrt(max(l1 * l1 - x * x, 0.0))
    v = _n(_add(hint, u, -_dot(hint, u)))
    mid = _add(_add(root, u, x), v, r)
    return _n(_add(mid, root, -1)), _n(_add(target, mid, -1))


def shift(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)



REST_PELVIS = (0, 0, 1.00)
HIPBONE = {'L': (0.10, 0, -0.02), 'R': (-0.10, 0, -0.02)}   # rest offsets, kept in world
CLAV = {'L': _n((0.20, 0, 0.04)), 'R': _n((-0.20, 0, 0.04))}
THIGH, SHIN, UPPER, FORE = 0.44, 0.44, 0.29, 0.25


def torso_chain(pelvis_at, pelvis, lower, upper):
    p = _add(pelvis_at, _n(pelvis), 0.12)
    p = _add(p, _n(lower), 0.15)
    return _add(p, _n(upper), 0.13)


def build(pelvis_at, spine, neck, head, stand_ankle, stand_foot, knee_hint,
          tree_thigh, wrists, hands, elbow_hint):
    """Right-side stage: left leg standing, right foot in the left hip crease."""
    pelvis, lower, upper = spine
    pose = {
        'pelvis.location': shift(*_add(pelvis_at, REST_PELVIS, -1)),
        'pelvis': pelvis, 'spine.lower': lower, 'spine.upper': upper,
        'neck': neck, 'head': head,
    }
    hip = {s: _add(pelvis_at, HIPBONE[s]) for s in 'LR'}
    # Standing (left) leg: hip -> planted ankle.
    th, sh = two_bone(hip['L'], stand_ankle, THIGH, SHIN, knee_hint)
    pose['thigh.L'], pose['shin.L'], pose['foot.L'] = th, sh, stand_foot
    # Tree (right) leg: knee out to the side, foot on top of the left thigh.
    target = _add(_add(hip['L'], th, 0.13), (-0.04, 0, 0.10))
    knee = _add(hip['R'], _n(tree_thigh), THIGH)
    pose['thigh.R'] = _n(tree_thigh)
    pose['shin.R'] = _n(_add(target, knee, -1))
    pose['foot.R'] = (0.85, -0.2, 0.45)
    # Arms.
    neck_at = torso_chain(pelvis_at, pelvis, lower, upper)
    for s, sign in (('R', -1), ('L', 1)):
        shoulder = _add(neck_at, CLAV[s], 0.204)
        w = (sign * wrists[0], wrists[1], wrists[2])
        up, fo = two_bone(shoulder, w, UPPER, FORE, (sign * elbow_hint[0], elbow_hint[1], elbow_hint[2]))
        pose[f'upperarm.{s}'] = up
        pose[f'forearm.{s}'] = fo
        pose[f'hand.{s}'] = (sign * hands[0], hands[1], hands[2])
    return pose


UPRIGHT = ((0, 0, 1), (0, 0, 1), (0, 0, 1))
FLAT_FOOT = (0, -1, -0.5)
TOE_FOOT = (0, -0.3, -0.95)          # heel lifted: balanced on the ball of the foot

TREE = build(
    pelvis_at=(0, 0, 1.0), spine=UPRIGHT, neck=(0, 0, 1), head=(0, 0, 1),
    stand_ankle=(0.10, 0, 0.10), stand_foot=FLAT_FOOT, knee_hint=(0, -1, 0),
    tree_thigh=(-0.75, -0.15, -0.65),
    wrists=(0.05, -0.2, 1.22), hands=(-0.15, -0.1, 1), elbow_hint=(1, 0.3, -0.6),
)

FOLD = build(
    pelvis_at=(0, 0.18, 0.62), spine=((0, -0.55, 0.83), (0, -0.85, 0.35), (0, -0.9, -0.1)),
    neck=(0, -0.7, -0.6), head=(0, -0.5, -0.85),
    stand_ankle=(0.10, 0, 0.10), stand_foot=FLAT_FOOT, knee_hint=(0, -1, 0.2),
    tree_thigh=(-0.85, -0.3, -0.4),
    wrists=(0.2, -0.58, 0.06), hands=(0, -0.8, -0.6), elbow_hint=(0.3, 1, 0),
)

SIT = build(
    pelvis_at=(0, 0.05, 0.34), spine=((0, -0.35, 0.94), (0, -0.3, 0.95), (0, -0.2, 0.98)),
    neck=(0, -0.2, 0.98), head=(0, -0.3, 0.95),
    stand_ankle=(0.10, 0, 0.17), stand_foot=TOE_FOOT, knee_hint=(0, -1, 0.1),
    tree_thigh=(-0.9, -0.45, 0.05),
    wrists=(0.2, -0.4, 0.06), hands=(0, -0.8, -0.6), elbow_hint=(0.3, 1, 0),
)

PRAYER = build(
    pelvis_at=(0, 0.05, 0.34), spine=((0, -0.1, 1), (0, 0, 1), (0, 0, 1)),
    neck=(0, 0, 1), head=(0, 0, 1),
    stand_ankle=(0.10, 0, 0.17), stand_foot=TOE_FOOT, knee_hint=(0, -1, 0.1),
    tree_thigh=(-0.9, -0.45, 0.05),
    wrists=(0.05, -0.2, 0.62), hands=(-0.15, -0.1, 1), elbow_hint=(1, 0.3, -0.6),
)


def mirror(pose):
    """Right side -> left side: swap .L/.R and negate world X."""
    out = {}
    for k, v in pose.items():
        if k.endswith('.L'):
            k = k[:-2] + '.R'
        elif k.endswith('.R'):
            k = k[:-2] + '.L'
        out[k] = (-v[0], v[1], v[2])
    return out


def diff(pose, base):
    """Only the entries of `pose` that differ from `base` (a ghost overlay)."""
    return {k: v for k, v in pose.items() if base.get(k) != v}


def mirror_guides(guides):
    return [{**g, 'from': (-g['from'][0], *g['from'][1:]), 'to': (-g['to'][0], *g['to'][1:])}
            for g in guides]


# Guides (right side, left leg standing): the balance line straight up from
# the ball of the standing foot through the crown, and the level the folded
# knee reaches toward (hip height, across the lap).
PRAYER_GUIDES = [
    {'from': (0.06, -0.03, 0.0), 'to': (0.06, -0.03, 1.40)},
    {'from': (-0.62, 0.05, 0.36), 'to': (0.30, 0.05, 0.36)},
]

# Common mistake: collapsing forward over the fingertips — the chest drops,
# the head pitches past the balance line and the hands hover low in front.
PRAYER_GHOST = diff(build(
    pelvis_at=(0, 0.08, 0.34), spine=((0, -0.4, 0.92), (0, -0.5, 0.87), (0, -0.45, 0.89)),
    neck=(0, -0.5, 0.87), head=(0, -0.5, 0.87),
    stand_ankle=(0.10, 0, 0.17), stand_foot=TOE_FOOT, knee_hint=(0, -1, 0.1),
    tree_thigh=(-0.9, -0.45, -0.2),
    wrists=(0.05, -0.45, 0.50), hands=(-0.15, -0.4, 0.9), elbow_hint=(1, 0.3, -0.6),
), PRAYER)



# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

POSTURE = {
    'id': 'toe-stand',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'quarter',
    'frame': {'center_z': 0.9, 'scale': 2.1},
    'transition': 8,
    'stages': [
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
        {'label': 'Tree', 'pose': TREE, 'hold': 4},
        {'label': 'Fold', 'pose': FOLD, 'hold': 5},
        {'label': 'Sit to the heel', 'pose': SIT, 'hold': 5},
        {'label': 'Prayer', 'pose': PRAYER, 'hold': 10,
         'guides': PRAYER_GUIDES, 'ghost': PRAYER_GHOST},
        {'label': 'Rise', 'pose': TREE, 'hold': 4},
        {'label': 'Left side', 'pose': mirror(PRAYER), 'hold': 8,
         'guides': mirror_guides(PRAYER_GUIDES), 'ghost': mirror(PRAYER_GHOST)},
        {'label': 'Stand', 'pose': TADASANA, 'hold': 4},
    ],
}
