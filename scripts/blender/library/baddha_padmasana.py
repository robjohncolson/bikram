"""
Baddha Padmasana (the bound lotus) — library sheet, live figure only.

From the lotus (`padmasana.py`'s crossing, right foot first, so the left
foot is uppermost and its toe is caught first): the left arm swings back
round the waist toward the right hip, then the right arm round toward the
left hip, the forearms crossing behind the back; the head thrown back; and
the right hand, then the left, returned to the knees.

The library figure still stops by the far hip, its fingertips 24.8-25.7 cm
from the big toes they should hold (`_lotus.BIND`, reported, not hidden in
the text). Shape from the book's photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lotus', Path(__file__).resolve().parent / '_lotus.py')
LT = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LT)
L = LT.L
L.begin('baddha_padmasana', skeleton='library')

LOTUS = LT.lotus_hands_on_knees()
LIFT = LT.swing_back(LT.swing_back(LT.seated_lotus(), 'L', d=(1, 0, 0.2), reach=0.45), 'R', d=(1, 0, 0.2), reach=0.45)

# both arms swung out and back from the shoulders, ready to go round
OUT = LT.swing_back(LT.swing_back(LT.seated_lotus(), 'L'), 'R')

# the left arm round the back, the right still out
LEFT = LT.swing_back(LT.bind(LT.seated_lotus(), 'L'), 'R')

BOUND = LT.bind(LT.bind(LT.seated_lotus(), 'L'), 'R')

HEAD_BACK = LT.bind(LT.bind({**LT.seated_lotus(), 'neck': L.n((0, 0.45, 0.9)), 'head': L.n((0, 0.8, 0.6))}, 'L'), 'R')

# one arm or both swung out wide: the frame opens to keep the hands in
WIDE = {'center_z': 0.45, 'scale': 1.75}

POSTURE = L.check({
    'id': 'library:baddha-padmasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'front',
    'frame': L.LOTUS_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lotus', 'pose': LOTUS, 'hold': 4, 'notice': ['hips', 'lower-back', 'breath']},
        {'label': 'Hands away from knees', 'pose': LIFT, 'hold': 3, 'frame': WIDE, 'notice': ['shoulders']},
        {'label': 'Arms swing back', 'pose': OUT, 'hold': 3, 'view': 'back', 'frame': WIDE, 'notice': ['shoulders']},
        {'label': 'Left arm round', 'pose': LEFT, 'hold': 4, 'view': 'back', 'frame': WIDE, 'notice': ['shoulders']},
        {'label': 'Both arms bound', 'pose': BOUND, 'hold': 6, 'view': 'back', 'notice': ['shoulders', 'upper-back']},
        {'label': 'Head back', 'pose': HEAD_BACK, 'hold': 12, 'view': 'front',
         'notice': ['shoulders', 'upper-back', 'neck', 'breath']},
        {'label': 'Right arm out', 'pose': LEFT, 'hold': 3, 'view': 'back', 'frame': WIDE, 'notice': ['shoulders']},
        {'label': 'Arms out', 'pose': OUT, 'hold': 3, 'view': 'back', 'frame': WIDE, 'notice': ['shoulders']},
        {'label': 'Hands forward', 'pose': LIFT, 'hold': 3, 'frame': WIDE, 'notice': ['shoulders']},
    ],
})
