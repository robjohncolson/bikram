"""
Eka Pada Sarvangasana (one-leg shoulderstand) — library sheet, live figure
only.

In the shoulderstand one straight leg lowers over the head to the mat (a
half plough) while the other stays vertical; back up, then the other side.
Shape from the book's photograph; the stages are ours. The rig's left is
+X, so from the side camera the right leg is the far one — the chips name
the side.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('eka_pada_sarvangasana')

UP = L.shoulderstand()


def one_down(side):
    """One leg to the mat over the head, the other straight up."""
    pose = L.shoulderstand()
    sx = 1 if side == 'L' else -1
    return L.one_leg_down(pose, side, (sx * 0.02, -1, 0))


RIGHT = one_down('R')
LEFT = one_down('L')

# the common mistake: the upright leg follows the lowered one over the face
# (and its knee softens), so the trunk loses its line
_DRIFT = one_down('R')
_DRIFT.update({'thigh.L': L.n((-0.03, -0.42, 1)), 'shin.L': L.n((-0.03, -0.3, 1))})
GHOST = L.diff(_DRIFT, RIGHT)

GUIDES = [
    {'from': (0, L.NECK_AT[1], 0.0), 'to': (0, L.NECK_AT[1], 1.7)},   # the upright leg stays on the trunk's line
    {'from': (0, -1.25, 0.0), 'to': (0, 1.2, 0.0)},                    # the mat
]

POSTURE = L.check({
    'id': 'library:eka-pada-sarvangasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'notice': ['breath']},
        {'label': 'Shoulderstand', 'pose': UP, 'hold': 6, 'palms': 'back', 'notice': ['neck', 'shoulders']},
        {'label': 'Right leg down', 'pose': RIGHT, 'hold': 10, 'palms': 'back', 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['hamstrings', 'quads', 'hips', 'breath']},
        {'label': 'Both up', 'pose': UP, 'hold': 4, 'palms': 'back', 'notice': ['core']},
        {'label': 'Left leg down', 'pose': LEFT, 'hold': 10, 'guides': GUIDES, 'palms': 'back', 
         'notice': ['hamstrings', 'quads', 'hips', 'breath']},
        {'label': 'Legs together', 'pose': UP, 'hold': 4, 'palms': 'back', 'notice': ['core']},
        {'label': 'Slide down', 'pose': L.rolling_down(), 'hold': 5, 'notice': ['core']},
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'notice': ['neck', 'breath']},
    ],
})
