"""
Salamba Sirsasana I (supported headstand) — library sheet, live figure only.

Shape from the book's photographs (the kneel, the forearm tripod, the
tucked lift and the straight vertical line); the stages and their wording
are ours; the sheet opens on the forearms-down kneel (the kneel itself
is the first step's words). From a kneel facing -Y the body folds forward onto the crown, so
upside down the chest faces +Y and the fingers cup the back of the head.
The upper arms stand almost vertical: in this rig the head and neck are
about an upper arm long, so the elbows reach the mat only with the
shoulders a little toward it — the photographs show the same stack.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('salamba-sirsasana-i', skeleton='library')

SET = L.head_set()
WALK = L.head_walk()
TUCK = L.head_tuck()
KNEES_UP = L.head_knees_up()
UP = L.headstand()

# the common mistake: the shoulders sag onto the neck and the lower back
# arches, so the legs drift away from the chest instead of stacking
_SAG = L.headstand(legs=(0, -0.14, 1), spine=((0, 0.08, 1), (0, 0.0, 1), (0, -0.12, 1)))
_SAG.update({'clavicle.L': (1, 0, -0.45), 'clavicle.R': (-1, 0, -0.45)})
L.place(_SAG, 'crown', L.CROWN)
L.forearm_tripod(_SAG)
for side, sx in (('L', 1), ('R', -1)):
    _SAG[f'hand.{side}'] = L.n((sx * 0.2, -0.5, 1))
GHOST = L.diff(_SAG, UP)

GUIDES = [
    {'from': (0, L.CROWN[1], 0.0), 'to': (0, L.CROWN[1], 1.95)},   # one plumb line, crown to heels
    {'from': (0, -0.9, 0.0), 'to': (0, 0.9, 0.0)},                  # the mat
]

CHILD = L.childs_pose()
for side, sx in (('L', 1), ('R', -1)):
    CHILD[f'hand.{side}'] = L.n((sx * 0.2, -0.5, 1))

POSTURE = L.check({
    'id': 'library:salamba-sirsasana-i',
    'position': {'start': 'kneeling', 'end': 'kneeling'},
    'view': 'side',
    'frame': L.HEAD_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Forearms down', 'pose': SET, 'hold': 6, 'notice': ['wrists', 'shoulders']},
        {'label': 'Walk in', 'pose': WALK, 'hold': 5, 'notice': ['hamstrings', 'shoulders']},
        {'label': 'Knees in', 'pose': TUCK, 'hold': 5, 'notice': ['core']},
        {'label': 'Knees up', 'pose': KNEES_UP, 'hold': 4, 'notice': ['core', 'lower-back']},
        {'label': 'Headstand', 'pose': UP, 'hold': 12, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['shoulders', 'neck', 'core', 'breath']},
        {'label': 'Knees in', 'pose': TUCK, 'hold': 4, 'notice': ['core']},
        # the feet down and the knees on the mat before the head lifts
        {'label': 'Knees down', 'pose': SET, 'hold': 5, 'notice': ['shoulders', 'breath']},
        {'label': 'Rest', 'pose': CHILD, 'hold': 6, 'notice': ['neck', 'breath']},
    ],
})
