"""
Spine Twisting (Ardha Matsyendrasana) — stage poses for the mannequin rig.

Seated (pelvis joint at z≈0.12, sit bones on the floor). Right side: the left
knee folds down in front with the left heel beside the right hip, the right
foot steps over and plants outside the left knee, the left arm hooks over the
outside of the right knee to hold the left knee, and the right hand plants
on the floor behind. The twist ROLLS the spine: `spine.lower` −25° and
`spine.upper` −35° about their own (vertical) axes, so the omitted
clavicles ride the roll and the shoulder line turns ~60° to the right while
the hips stay square. The left side is the exact mirror (`mirror`, which
flips roll signs too). Arms are solved by a small two-bone reach from the
rolled shoulder positions so the hands land on their targets. The full
twists carry teaching guides (tall midline, square hip line, turned
shoulder line) and a ghost of the common mistake.
"""
import math

PELVIS = (0.0, 0.05, 0.12)


def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def _sub(a, b):
    return tuple(x - y for x, y in zip(a, b))


def offset(x, y, z):
    """World-space body offset for `pelvis.location` (the renderer now takes
    world space directly; kept so the stage tables read as intended)."""
    return (x, y, z)


def reach(shoulder, target, pole):
    a, b = 0.29, 0.25
    v = _sub(target, shoulder)
    d = min(math.sqrt(sum(c * c for c in v)), a + b - 1e-4)
    u = _n(v)
    pd = sum(p * c for p, c in zip(pole, u))
    w = _n(tuple(p - pd * c for p, c in zip(pole, u)))
    x = (a * a - b * b + d * d) / (2 * d)
    h = math.sqrt(max(a * a - x * x, 0))
    elbow = tuple(s + x * uu + h * ww for s, uu, ww in zip(shoulder, u, w))
    end = tuple(s + d * uu for s, uu in zip(shoulder, u))
    return _n(_sub(elbow, shoulder)), _n(_sub(end, elbow))


def aim(start, target, length):
    """Direction from `start` toward `target` and the point `length` along it."""
    d = _n(_sub(target, start))
    return d, _add(start, d, length)


NECK = _add(PELVIS, (0, 0, 0.40))
HIP = {'L': (PELVIS[0] + 0.10, PELVIS[1], PELVIS[2] - 0.02),
       'R': (PELVIS[0] - 0.10, PELVIS[1], PELVIS[2] - 0.02)}

# Right-side legs (left knee down, right foot over it).
thL, kneeL = aim(HIP['L'], (0.02, PELVIS[1] - 0.44, 0.06), 0.44)
shL, _ankleL = aim(kneeL, (-0.26, PELVIS[1] - 0.02, 0.06), 0.44)
thR, kneeR = aim(HIP['R'], (-0.05, PELVIS[1] - 0.22, 0.52), 0.44)
shR, _ankleR = aim(kneeR, (0.2, PELVIS[1] - 0.42, 0.09), 0.44)
LEGS_RIGHT = {
    'thigh.L': thL, 'shin.L': shL, 'foot.L': (-0.55, 0.83, -0.05),
    'thigh.R': thR, 'shin.R': shR, 'foot.R': (0.1, -1, -0.15),
}


def neck_of(dirs):
    """World neck joint from the torso directions (tuples or roll dicts)."""
    p = PELVIS
    for bone, length in (('pelvis', 0.12), ('spine.lower', 0.15), ('spine.upper', 0.13)):
        e = dirs.get(bone, (0, 0, 1))
        p = _add(p, _n(e['dir'] if isinstance(e, dict) else e), length)
    return p


def turned(deg):
    """Rest clavicle directions (L, R) turned `deg` about the vertical — where
    the riding clavicles end up under a total spine roll of `deg`."""
    c, s_ = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    return (c, s_, 0.2), (-c, -s_, 0.2)


def arms(clav_l, clav_r, twist, neck=NECK, with_clavicles=True):
    """Left arm hooks outside the right knee to the left knee; right hand
    on the floor behind. `twist` 0..1 pulls the right hand further behind.
    With `with_clavicles=False` the clavicles are left to ride the spine
    roll (`clav_l`/`clav_r` then only locate the shoulders)."""
    sl = _add(neck, _n(clav_l), 0.2044)
    sr = _add(neck, _n(clav_r), 0.2044)
    upL, foL = reach(sl, _add(kneeL, (-0.02, 0.02, 0.12)), (-1, -0.3, 0.4))
    upR, foR = reach(sr, (-0.08 - 0.05 * twist, PELVIS[1] + 0.25 + 0.08 * twist, 0.12), (-1, 0.3, 0))
    out = {'clavicle.L': clav_l, 'clavicle.R': clav_r} if with_clavicles else {}
    out.update({
        'upperarm.L': upL, 'forearm.L': foL, 'hand.L': _n(_add(foL, (0, 0, -0.3))),
        'upperarm.R': upR, 'forearm.R': foR, 'hand.R': _n(_add(foR, (0, 0.3, -0.5))),
    })
    return out


BASE = {'pelvis.location': offset(0, PELVIS[1], PELVIS[2] - 1.0),
        'pelvis': (0, 0, 1), 'spine.lower': (0, 0, 1), 'spine.upper': (0, 0, 1)}

SIT = {
    **BASE,
    'thigh.L': (0, -1, 0), 'shin.L': (0, -1, 0), 'foot.L': (0, -0.25, 1),
    'thigh.R': (0, -1, 0), 'shin.R': (0, -1, 0), 'foot.R': (0, -0.25, 1),
    **{k: v for side, sx in (('L', 1), ('R', -1))
       for k, v in zip(('clavicle.' + side, 'upperarm.' + side, 'forearm.' + side, 'hand.' + side),
                       ((sx, 0, 0.2),
                        *reach(_add(NECK, _n((sx, 0, 0.2)), 0.2044),
                               (sx * 0.3, PELVIS[1] + 0.14, 0.09), (0.3 * sx, 1, 0)),
                        (sx * 0.2, -0.5, -0.6)))},
}

SET_RIGHT = {**BASE, **LEGS_RIGHT, 'neck': (0, 0, 1), 'head': (0, 0, 1),
             **arms((1, -0.05, 0.2), (-1, 0.05, 0.2), 0)}

# The seated arms (hands on the floor beside the hips) on their own.
SIT_ARMS = {k: v for k, v in SIT.items() if k.split('.')[0] in ('clavicle', 'upperarm', 'forearm', 'hand')}

# "Bend the left knee down to the floor, heel beside the right hip":
# only the left leg folds; the right stays long.
KNEE_DOWN = {**SIT, 'thigh.L': thL, 'shin.L': shL, 'foot.L': (-0.55, 0.83, -0.05)}

# "Step the right foot over the left knee and plant it": both legs set,
# hands still beside the hips.
FOOT_OVER = {**BASE, **LEGS_RIGHT, 'neck': (0, 0, 1), 'head': (0, 0, 1), **SIT_ARMS}

# "Bring the left arm over the outside of the right knee": the hook, the
# right hand still beside the hip.
ARM_OVER = {**SET_RIGHT, **{k: v for k, v in SIT_ARMS.items() if k.endswith('.R')}}

# The twist: the spine rolls −25° low and −35° high (≈ −60° at the
# shoulders, to the right); the clavicles ride it, left shoulder forward,
# right shoulder back. The head follows a touch over the right shoulder.
TWIST = -60
RIGHT = {**BASE, **LEGS_RIGHT,
         'spine.lower': {'dir': (0, 0, 1), 'roll': -25},
         'spine.upper': {'dir': (0, 0, 1), 'roll': -35},
         'neck': (-0.08, 0.06, 1), 'head': (-0.15, 0.12, 1),
         **arms(*turned(TWIST), 1, with_clavicles=False)}

# Guides: the vertical midline the spine grows tall on (no leaning), the
# hip line that stays square, and the shoulder line that turns.
SHOULDER_Z = PELVIS[2] + 0.44


def twist_guides(deg):
    c, s_ = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    mid = (PELVIS[0], PELVIS[1])
    return [
        {'from': (mid[0], mid[1], 0.0), 'to': (mid[0], mid[1], 1.0)},
        {'from': (mid[0] - 0.3, mid[1], PELVIS[2]), 'to': (mid[0] + 0.3, mid[1], PELVIS[2])},
        {'from': (mid[0] - 0.36 * c, mid[1] - 0.36 * s_, SHOULDER_Z),
         'to': (mid[0] + 0.36 * c, mid[1] + 0.36 * s_, SHOULDER_Z)},
    ]


RIGHT_GUIDES = twist_guides(TWIST)

# Common mistake: leaning back and sideways onto the planted hand while
# turning — the spine slumps off the midline and the turn is shallower.
_GHOST_TORSO = {
    'pelvis': (-0.08, 0.2, 0.98),
    'spine.lower': {'dir': (-0.18, 0.28, 0.94), 'roll': -15},
    'spine.upper': {'dir': (-0.22, 0.15, 0.96), 'roll': -20},
    'neck': (-0.2, 0.0, 1), 'head': (-0.2, 0.05, 1),
}
_gl, _gr = turned(-35)
RIGHT_GHOST = {**_GHOST_TORSO,
               **arms((_gl[0], _gl[1], 0.05), (_gr[0], _gr[1], -0.1), 0.6,
                      neck=neck_of(_GHOST_TORSO))}


def mirror(pose):
    """Swap left/right and flip X — the same shape on the other side."""
    out = {}
    for k, v in pose.items():
        if k == 'pelvis.location':
            out[k] = v
            continue
        name = k[:-2] + ('.R' if k.endswith('.L') else '.L') if k[-2:] in ('.L', '.R') else k
        if isinstance(v, dict):
            d = v['dir']
            out[name] = {'dir': (-d[0], d[1], d[2]), 'roll': -v['roll']}
        else:
            out[name] = (-v[0], v[1], v[2])
    return out


def mirror_guides(guides):
    return [{'from': (-g['from'][0], *g['from'][1:]), 'to': (-g['to'][0], *g['to'][1:])} for g in guides]


SET_LEFT = mirror(SET_RIGHT)
LEFT = mirror(RIGHT)
LEFT_GUIDES = mirror_guides(RIGHT_GUIDES)
LEFT_GHOST = mirror(RIGHT_GHOST)

POSTURE = {
    'id': 'spine-twisting',
    'view': 'side',
    'frame': {'center_z': 0.45, 'scale': 1.4},
    'transition': 8,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 3},
        {'label': 'Bend the knee', 'pose': KNEE_DOWN, 'hold': 4},
        {'label': 'Step the foot over', 'pose': FOOT_OVER, 'hold': 4},
        {'label': 'Arm over the knee', 'pose': ARM_OVER, 'hold': 4},
        {'label': 'Hand behind', 'pose': SET_RIGHT, 'hold': 4},
        {'label': 'Right side', 'pose': RIGHT, 'hold': 9,
         'guides': RIGHT_GUIDES, 'ghost': RIGHT_GHOST},
        {'label': 'Change', 'pose': SET_LEFT, 'hold': 4},
        {'label': 'Left side', 'pose': LEFT, 'hold': 8,
         'guides': LEFT_GUIDES, 'ghost': LEFT_GHOST},
        {'label': 'Release', 'pose': SIT, 'hold': 3},
    ],
}
