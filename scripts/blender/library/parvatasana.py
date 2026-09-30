"""
Parvatasana (the lotus with the arms raised, "mountain") — library sheet,
live figure only.

From the lotus (`padmasana.py`'s crossing, right foot first): the fingers
laced and the arms stretched forward, then straight up over the head with
the palms turned up and the head bowed, the chin on the breastbone; and
down the same way to the knees. The legs come from `_lib.lotus`; the arms
from `_lotus.laced_*`. Shape from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lotus', Path(__file__).resolve().parent / '_lotus.py')
LT = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LT)
L = LT.L
L.begin('parvatasana', skeleton='library')

LOTUS = LT.lotus_hands_on_knees()

FORWARD = LT.laced_forward(LT.seated_lotus())

DIAGONAL = LT.seated_lotus()
for side, sx in [('L', 1), ('R', -1)]:
    sh = L.fk(DIAGONAL)['shoulder.' + side]
    L.arm(DIAGONAL, side, (sx * LT.LACE_X, sh[1] - 0.38, sh[2] + 0.38),
          (sx, 0, 0), L.n((-sx, -0.2, 0.2)))

UP = LT.laced_up({**LT.seated_lotus(), **LT.BOWED})

# the common mistake: the lower back sags and the arms lean forward, the
# elbows soft, instead of the arms lifting straight up out of the waist
_SAG = {**LT.seated_lotus(), **LT.BOWED, 'spine.lower': L.n((0, -0.2, 1)), 'spine.upper': L.n((0, -0.3, 1))}
LT.laced_up(_SAG, reach=0.48)
GHOST = L.diff(_SAG, UP)

GUIDES = [
    {'from': (0, L.SEAT[1], 0.0), 'to': (0, L.SEAT[1], 1.2)},   # the spine and the arms on one upright line
]

POSTURE = L.check({
    'id': 'library:parvatasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'front',
    'frame': {'center_z': 0.60, 'scale': 1.4},
    'transition': 10,
    'stages': [
        {'label': 'Lotus', 'pose': LOTUS, 'hold': 4, 'notice': ['hips', 'lower-back', 'breath']},
        {'label': 'Fingers laced', 'pose': FORWARD, 'hold': 3, 'hands': 'laced', 'view': 'quarter',
         'notice': ['shoulders', 'wrists']},
        {'label': 'Lift the arms', 'pose': DIAGONAL, 'hold': 3, 'hands': 'laced', 'notice': ['shoulders']},
        {'label': 'Arms up', 'pose': UP, 'hold': 14, 'hands': 'laced', 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['shoulders', 'upper-back', 'neck', 'breath']},
        {'label': 'Lower the arms', 'pose': DIAGONAL, 'hold': 3, 'hands': 'laced', 'notice': ['shoulders']},
        {'label': 'Arms forward', 'pose': FORWARD, 'hold': 3, 'hands': 'laced', 'view': 'quarter',
         'notice': ['shoulders']},
    ],
})
