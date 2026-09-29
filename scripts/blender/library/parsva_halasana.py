"""
Parsva Halasana (side plough) — library sheet, live figure only.

From the plough, with the palms on the back, both straight legs walk round
to one side until the feet are level with the head, then back through the
centre and round to the other side. The trunk stays upright over the
shoulders; the tube rig shows the swing of the legs, not the turn of the
waist (see `notice`). Shape from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('parsva_halasana')

# +X is the mannequin's left (README): a positive swing carries the legs to its left
SWING = 0.7
CENTRE = L.plough(arms='back')
LEFT = L.plough(arms='back', side=SWING)
RIGHT = L.plough(arms='back', side=-SWING)

# the common mistake: the trunk drops toward the legs' side and the hips sink,
# instead of the trunk staying tall while only the legs travel
_TIP = L.on_shoulders(up=(0.3, 0.12, 0.95))
L.hands_on_back(_TIP)
L.plough_legs(_TIP, side=SWING - 0.08)
GHOST = L.diff(_TIP, LEFT)

GUIDES = [
    {'from': (0, L.NECK_AT[1], 0.0), 'to': (0, L.NECK_AT[1], 0.95)},   # the trunk stays upright
    {'from': (-1.1, L.NECK_AT[1] - 0.5, 0.0), 'to': (1.1, L.NECK_AT[1] - 0.5, 0.0)},   # the line the feet travel along
]

POSTURE = L.check({
    'id': 'library:parsva-halasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'notice': ['breath']},
        {'label': 'Shoulderstand', 'pose': L.shoulderstand(), 'hold': 5, 'palms': 'back', 'notice': ['neck', 'shoulders']},
        {'label': 'Plough', 'pose': CENTRE, 'hold': 5, 'view': 'quarter', 'palms': 'back', 'notice': ['hamstrings']},
        {'label': 'Legs to the left', 'pose': LEFT, 'hold': 10, 'view': 'front', 'palms': 'back', 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['lower-back', 'hips', 'core', 'breath']},
        {'label': 'Centre', 'pose': CENTRE, 'hold': 4, 'view': 'front', 'palms': 'back', 'notice': ['hamstrings']},
        {'label': 'Legs to the right', 'pose': RIGHT, 'hold': 10, 'view': 'front', 'guides': GUIDES, 'palms': 'back', 
         'notice': ['lower-back', 'hips', 'core', 'breath']},
        {'label': 'Back to centre', 'pose': CENTRE, 'hold': 4, 'view': 'quarter', 'palms': 'back', 'notice': ['hamstrings']},
        # ends rolling down onto the back; the loop's return to stage 0 lays it flat
        {'label': 'Slide down', 'pose': L.rolling_down(), 'hold': 6, 'notice': ['core', 'neck', 'breath']},
    ],
})
