"""
Halasana (plough) — library sheet, live figure only.

Up through the shoulderstand, then both straight legs lowered over the head
until the tucked toes rest on the mat beyond the crown; the palms leave the
back and the arms stretch long on the mat the other way, fingers laced.
Out as the book has it: the legs back up to the shoulderstand, then a slow slide down.
Shape from the book's photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('halasana')

TOES = L.plough(arms='back')
APART = L.plough(arms='apart')
LONG = L.plough(arms='long')
BACK_UP = L.shoulderstand()
BACK_UP.update(L.ARMS_FLAT)

# the common mistake: the back rounds and the hips drop over the face, so the
# weight slides onto the neck and the knees give to find the floor
_CURL = L.on_shoulders(up=(0, -0.4, 0.92))
L.arms_long(_CURL)
_at = L.fk(_CURL)
for _s, _sx in (('L', 1), ('R', -1)):
    _hip = _at[f'hip.{_s}']
    L.leg(_CURL, _s, (_sx * 0.06, _hip[1] - 0.7, 0.19), (0, -0.3, -1), (0, -0.3, -1))   # (at 0.62 the thighs folded into the belly)
GHOST = L.diff(_CURL, LONG)

GUIDES = [
    {'from': (0, L.NECK_AT[1], 0.0), 'to': (0, L.NECK_AT[1], 0.95)},  # the trunk stands over the shoulders
    {'from': (0, -1.25, 0.0), 'to': (0, 1.2, 0.0)},                    # the mat
]

POSTURE = L.check({
    'id': 'library:halasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'notice': ['breath']},
        {'label': 'Shoulderstand', 'pose': L.shoulderstand(), 'hold': 6, 'palms': 'back', 'notice': ['neck', 'shoulders']},
        {'label': 'Toes down', 'pose': TOES, 'hold': 6, 'palms': 'back', 'notice': ['hamstrings', 'lower-back']},
        # the hands leave the back to the mat first, then lace (straight from
        # the back to the laced hands, one forearm swings through the other)
        {'label': 'Arms out', 'pose': APART, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Arms long', 'pose': LONG, 'hold': 12, 'hands': 'laced', 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['neck', 'shoulders', 'hamstrings', 'breath']},
        # the book's way out: the hands released, the legs back up over the
        # shoulders, then slide down
        {'label': 'Back up', 'pose': BACK_UP, 'hold': 4, 'notice': ['core', 'shoulders']},
        {'label': 'Slide down', 'pose': L.rolling_down(), 'hold': 5, 'notice': ['core', 'lower-back']},
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 5, 'notice': ['neck', 'breath']},
    ],
})
