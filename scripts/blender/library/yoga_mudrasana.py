"""
Yoga Mudrasana (the lotus seal) — library sheet, live figure only.

Baddha padmasana folded forward: from the lotus (`padmasana.py`'s
crossing, right foot first) the arms swing back and bind round the waist,
left then right; on an exhalation the trunk bends forward from the hips
and the head goes down toward the mat in front of the crossed shins; then
up again and the bind released, right arm first.

Two rig limits, drawn as far as they go and reported: the hands stop by
the far hips, short of the big toes (`_lotus.BIND`), and the chest rests
on the uppermost heel, so the head stops short of the mat
(`_lotus.FOLD`). Shape from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lotus', Path(__file__).resolve().parent / '_lotus.py')
LT = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LT)
L = LT.L
L.begin('yoga_mudrasana')

LOTUS = LT.lotus_hands_on_knees()
OUT = LT.swing_back(LT.swing_back(LT.seated_lotus(), 'L'), 'R')
LEFT = LT.swing_back(LT.bind(LT.seated_lotus(), 'L'), 'R')
BOUND = LT.bind(LT.bind(LT.seated_lotus(), 'L'), 'R')
FOLDED = LT.bind(LT.bind(LT.folded_lotus(), 'L'), 'R')

WIDE = {'center_z': 0.45, 'scale': 1.45}   # an arm swung out wide
SIDE = {'center_z': 0.3, 'scale': 1.2}    # the fold from the side

POSTURE = L.check({
    'id': 'library:yoga-mudrasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'front',
    'frame': L.LOTUS_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lotus', 'pose': LOTUS, 'hold': 4, 'notice': ['hips', 'lower-back', 'breath']},
        {'label': 'Arms swing back', 'pose': OUT, 'hold': 3, 'view': 'back', 'frame': WIDE, 'notice': ['shoulders']},
        {'label': 'Left arm round', 'pose': LEFT, 'hold': 3, 'view': 'back', 'frame': WIDE, 'notice': ['shoulders']},
        {'label': 'Bound', 'pose': BOUND, 'hold': 4, 'view': 'back', 'notice': ['shoulders', 'breath']},
        {'label': 'Fold', 'pose': FOLDED, 'hold': 14, 'view': 'side', 'frame': SIDE,
         'notice': ['lower-back', 'hips', 'shoulders', 'breath']},
        {'label': 'Come up', 'pose': BOUND, 'hold': 3, 'view': 'back', 'notice': ['lower-back']},
        {'label': 'Right arm out', 'pose': LEFT, 'hold': 3, 'view': 'back', 'frame': WIDE, 'notice': ['shoulders']},
        {'label': 'Arms out', 'pose': OUT, 'hold': 3, 'view': 'back', 'frame': WIDE, 'notice': ['shoulders']},
    ],
})
