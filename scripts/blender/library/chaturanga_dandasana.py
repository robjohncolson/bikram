"""
Chaturanga Dandasana (four-limbed staff) — library sheet, live figure only.

Face down with the palms beside the chest and the feet a foot apart, the
toes tucked; the whole body lifts a few inches, stiff as a staff and level
with the floor, on the hands and toes; then it travels forward until the
feet rest on the tops of the toes; and down. Shape from the book's two
photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_backbend', Path(__file__).resolve().parent / '_backbend.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)
L = B.L
L.begin('chaturanga-dandasana', skeleton='library')

APART = 0.06        # the thighs turned out a little: the feet about a foot apart
HAND_Y = B.PRONE_Y - 0.25     # the palms beside the lower chest
HAND_OUT = 0.25
ELBOWS = (0, 1, 0.35)          # the elbows bent back beside the ribs


def feet_apart(pose):
    for s, sx in (('L', 1), ('R', -1)):
        pose[f'thigh.{s}'] = L.n((sx * APART, 1, 0))
    return pose



# the palms beside the chest, the toes tucked under (the ankles rise)
READY = feet_apart(B.prone())
for _s, _sx in (('L', 1), ('R', -1)):
    READY[f'shin.{_s}'] = L.n((0, 1, 0.22))
    READY[f'foot.{_s}'] = B.TUCK_FOOT
B.palms_down(READY, HAND_Y, HAND_OUT, ELBOWS)
TOE_Y = L.fk(READY)['toes.L'][1]


def staff(up, toe_y, feet=None, head=(0, -1, 0.08)):
    pose = B.body_line({}, up, head=L.n(head))
    for s, sx in (('L', 1), ('R', -1)):
        pose[f'thigh.{s}'] = L.n(L.add(pose[f'thigh.{s}'], (sx * APART, 0, 0)))
    B.rest_on_toes(pose, toe_y, feet)
    return B.palms_down(pose, HAND_Y, HAND_OUT, ELBOWS)


# a few inches up, level from the head to the heels, on the hands and toes
STAFF = staff(4.5, TOE_Y)
# the body carried forward over the hands, the feet on the tops of the toes
FORWARD = staff(7.0, TOE_Y + 0.1, feet=L.n((0, 1, -0.55)), head=(0, -1, 0.15))

# the common mistake: the hips sag toward the floor, the body no longer a staff
_SAG = {**STAFF, 'pelvis': L.n((0, -1, 0.3)), 'spine.lower': L.n((0, -1, 0.2))}
for _s, _sx in (('L', 1), ('R', -1)):
    _SAG[f'thigh.{_s}'] = L.n((_sx * APART, 1, 0.1))
    _SAG[f'shin.{_s}'] = L.n((0, 1, 0.02))
B.rest_on_toes(_SAG, TOE_Y)
B.palms_down(_SAG, HAND_Y, HAND_OUT, ELBOWS)
GHOST = L.diff(_SAG, STAFF)

DOWN = READY    # lowered to the mat, the palms and tucked toes where they began

GUIDES = [
    {'from': (0, -1.0, 0.0), 'to': (0, 1.0, 0.0)},   # the mat
]

POSTURE = L.check({
    'id': 'library:chaturanga-dandasana',
    'position': {'start': 'prone', 'end': 'prone'},
    'view': 'side',
    'frame': B.PRONE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Palms by the chest', 'pose': READY, 'hold': 5, 'notice': ['wrists', 'feet', 'breath']},
        {'label': 'Staff', 'pose': STAFF, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['core', 'shoulders', 'wrists', 'breath']},
        {'label': 'Forward', 'pose': FORWARD, 'hold': 6, 'notice': ['shoulders', 'feet']},
        {'label': 'Down', 'pose': DOWN, 'hold': 4, 'notice': ['breath']},
    ],
})
