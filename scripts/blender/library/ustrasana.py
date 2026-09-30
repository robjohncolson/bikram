"""
Ustrasana (camel) — library sheet, live figure only.

Kneeling with the thighs and feet together, the tops of the feet on the
mat; the palms on the hips; the thighs stretched and the spine curving
back; then the palms on the soles, the thighs upright, the spine pushed
toward them and the head thrown back; and out one hand at a time to the
hips. Shape from the book's two photographs; the stages are ours.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_backbend', Path(__file__).resolve().parent / '_backbend.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)
L = B.L
L.begin('ustrasana')


def back(deg):
    """A trunk direction leaning back (toward the heels, +Y) `deg` degrees from upright."""
    r = math.radians(deg)
    return (0, math.sin(r), math.cos(r))


# the palms on the back of the hips, high and toward the spine: from the side
# of the pelvis a hand going down to the heel swept through the hip joint
ON_HIPS = {'k': 0.3, 'theta': 45.0}

KNEEL = B.kneel()

HIPS = B.kneel()
B.palms_on_trunk(HIPS, **ON_HIPS)

# the thighs upright, the chest lifted and the spine curving back, hands on the hips
ARCH = B.kneel((0, 0.12, -1))
B.trunk(ARCH, back(4), back(14), back(28), back(40), back(55))
B.palms_on_trunk(ARCH, **ON_HIPS)

GRIP = L.n((0, 1, -0.35))    # the hand along the sole toward the toes


def camel(a):
    """The arch scaled by `a`: the pelvis over the knees, each spine bone
    further back, the neck and head thrown back toward the feet."""
    pose = B.kneel()
    B.trunk(pose, back(10 * a), back(55 * a), back(100 * a), back(125), back(150))
    return pose


def palm_on_heel(pose, side):
    """The wrist that sets the palm on top of the heel (the soles face up)."""
    heel = B.extra_at(pose, f'heel.{side}')
    sx = 1 if side == 'L' else -1
    # a little to the outside of the heel: the two hands arriving together
    # behind the back stay clear of each other
    palm = L.add(heel, (sx * 0.02, 0, L.H.SKIN_FIT['heel'][0] + L.PALM_R + 0.004))
    return L.add(palm, GRIP, -L.PALM_AT)


def reach(a):
    pose = camel(a)
    return L.dist(L.fk(pose)['shoulder.L'], palm_on_heel(pose, 'L')) - B.STRAIGHT


CAMEL = camel(B.bisect(reach, 0.5, 1.2))
for _s, _sx in (('L', 1), ('R', -1)):
    L.arm(CAMEL, _s, palm_on_heel(CAMEL, _s), (_sx, 0, -0.3), GRIP)

# on the way to the heels and back: the arms reaching back and wide, the
# chest going over (straight from the hips to the heels, the two hands met
# behind the back)
REACH = camel(0.8)
for _s, _sx in (('L', 1), ('R', -1)):
    _h = palm_on_heel(CAMEL, _s)
    L.arm(REACH, _s, (_sx * 0.3, _h[1] - 0.12, 0.42), (_sx, 0, -0.3), L.n((_sx * 0.3, 0.6, -0.75)))

# the common mistake: the hips sink back toward the heels and the thighs tip
# back, so the bend folds at the low back instead of lifting the chest
def sunk(a):
    pose = B.kneel((0, -0.35, -0.94))
    return B.trunk(pose, back(25 * a), back(45 * a), back(75 * a), back(125), back(150))


_SINK = sunk(B.bisect(lambda a: L.dist(L.fk(sunk(a))['shoulder.L'], palm_on_heel(sunk(a), 'L')) - B.STRAIGHT, 0.3, 1.6))
for _s, _sx in (('L', 1), ('R', -1)):
    L.arm(_SINK, _s, palm_on_heel(_SINK, _s), (_sx, 0, -0.3), GRIP)
GHOST = L.diff(_SINK, CAMEL)

GUIDES = [
    {'from': (0, B.KNEE_Y, 0.0), 'to': (0, B.KNEE_Y, 1.0)},   # the thighs upright over the knees
]

POSTURE = L.check({
    'id': 'library:ustrasana',
    'position': {'start': 'kneeling', 'end': 'kneeling'},
    'view': 'side',
    'frame': B.KNEEL_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Kneel', 'pose': KNEEL, 'hold': 4, 'notice': ['feet', 'breath']},
        {'label': 'Hands on hips', 'pose': HIPS, 'hold': 4, 'notice': ['quads']},
        {'label': 'Arch back', 'pose': ARCH, 'hold': 5, 'notice': ['upper-back', 'quads']},
        {'label': 'Reach back', 'pose': REACH, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Camel', 'pose': CAMEL, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['quads', 'upper-back', 'neck', 'breath']},
        {'label': 'Hands up', 'pose': REACH, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Hands on hips', 'pose': ARCH, 'hold': 3, 'notice': ['upper-back']},
        {'label': 'Upright', 'pose': HIPS, 'hold': 3, 'notice': ['breath']},
    ],
})
