"""
Salamba Sarvangasana I (supported shoulderstand) — library sheet, live
figure only.

From lying on the back: the legs to vertical, the hips rolled up with the
hands coming to the back, the trunk and legs stacked in one line over the
shoulders, and down the same way. The back of the head, the neck and the
shoulder line stay on the mat (toward -Y); the chest comes to the chin.
Shape from the book's photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('salamba-sarvangasana-i', skeleton='library')

_ispec = importlib.util.spec_from_file_location('_library_inversion', Path(__file__).resolve().parent / '_inversion.py')
I = importlib.util.module_from_spec(_ispec)
_ispec.loader.exec_module(I)

LIE = L.LIE
LEGS_UP = L.legs_up()
ROLL = L.rolling_up()
# the hands come to the back while the hips are still on the way up: elbows
# bent and grounded, palms on the back ribs, the trunk leaning toward the feet
HANDS = L.on_shoulders(up=(0, 0.45, 0.9))
L.hands_on_back(HANDS)
L.legs_vertical(HANDS, lean=(0, -0.55, 0.84))
UP = L.shoulderstand()

# the common mistake: the hips sag back behind the hands and the legs tip
# over the face to balance them (a bend at the hips, not one line)
_SAG = L.on_shoulders(up=(0, 0.32, 1))
L.hands_on_back(_SAG)
L.legs_vertical(_SAG, lean=(0, -0.45, 1))
GHOST = L.diff(_SAG, UP)

GUIDES = [
    {'from': (0, L.NECK_AT[1], 0.0), 'to': (0, L.NECK_AT[1], 1.7)},   # shoulders, hips and heels on one line
    {'from': (0, -1.2, 0.0), 'to': (0, 1.2, 0.0)},                    # the mat
]

POSTURE = L.check({
    'id': 'library:salamba-sarvangasana-i',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie down', 'pose': LIE, 'hold': 4, 'notice': ['breath']},
        {'label': 'Legs up', 'pose': LEGS_UP, 'hold': 5, 'notice': ['core']},
        {'label': 'Hips up', 'pose': ROLL, 'hold': 5, 'notice': ['core']},
        {'label': 'Hands lifted', 'pose': I.release_back(L, HANDS), 'hold': 3, 'notice': ['wrists']},
        {'label': 'Hands to the back', 'pose': HANDS, 'hold': 5, 'palms': 'back', 'notice': ['wrists', 'shoulders']},
        {'label': 'Shoulderstand', 'pose': UP, 'hold': 12, 'palms': 'back', 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['neck', 'shoulders', 'upper-back', 'breath']},
        {'label': 'Slide down', 'pose': L.rolling_down(), 'hold': 5, 'notice': ['core', 'lower-back']},
        {'label': 'Lie down', 'pose': LIE, 'hold': 5, 'notice': ['neck', 'breath']},
    ],
})
