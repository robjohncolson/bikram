"""
Parsvaika Pada Sarvangasana (side-leg shoulderstand) — library sheet, live
figure only.

In the shoulderstand one straight leg swings out to its own side and down
toward the mat, in line with the trunk, while the other stays vertical;
back up, then the other side. Seen from the head's end so the sideways
line reads. Shape from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('parsvaika_pada_sarvangasana')

UP = L.shoulderstand()


def to_side(side):
    """One leg out to its own side (+X is the mannequin's left) and down to
    the mat, level with the trunk."""
    pose = L.shoulderstand()
    sx = 1 if side == 'L' else -1
    return L.one_leg_down(pose, side, (sx, 0, 0))


RIGHT = to_side('R')
LEFT = to_side('L')

# the common mistake: the hips follow the leg sideways, so the upright leg
# tips toward it and the trunk leans off the shoulders
_LEAN = L.on_shoulders(up=(-0.2, 0.05, 1))
L.hands_on_back(_LEAN)
L.legs_vertical(_LEAN, lean=(-0.3, -0.03, 1))
L.one_leg_down(_LEAN, 'R', (-1, 0, 0))
GHOST = L.diff(_LEAN, RIGHT)

GUIDES = [
    {'from': (0, L.NECK_AT[1], 0.0), 'to': (0, L.NECK_AT[1], 1.7)},       # the upright leg's line
    {'from': (-1.1, L.NECK_AT[1], 0.0), 'to': (1.1, L.NECK_AT[1], 0.0)},  # the line across the mat the foot finds
]

POSTURE = L.check({
    'id': 'library:parsvaika-pada-sarvangasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'front',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'view': 'side', 'notice': ['breath']},
        {'label': 'Shoulderstand', 'pose': UP, 'hold': 6, 'view': 'side', 'palms': 'back', 'notice': ['neck', 'shoulders']},
        {'label': 'Right leg out', 'pose': RIGHT, 'hold': 10, 'palms': 'back', 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['hips', 'hamstrings', 'core', 'breath']},
        {'label': 'Both up', 'pose': UP, 'hold': 4, 'palms': 'back', 'notice': ['core']},
        {'label': 'Left leg out', 'pose': LEFT, 'hold': 10, 'guides': GUIDES, 'palms': 'back', 
         'notice': ['hips', 'hamstrings', 'core', 'breath']},
        {'label': 'Legs together', 'pose': UP, 'hold': 4, 'palms': 'back', 'notice': ['core']},
        {'label': 'Slide down', 'pose': L.rolling_down(), 'hold': 5, 'view': 'side', 'notice': ['core']},
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'view': 'side', 'notice': ['neck', 'breath']},
    ],
})
