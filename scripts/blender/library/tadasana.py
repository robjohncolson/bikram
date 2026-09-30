"""
Tadasana (the mountain, also samasthiti) — library sheet, live figure only.

From an easy stance the feet come together, the knees and ankles touching;
the figure stands tall with the arms by the thighs (seen from the side,
one plumb line from the ear to the ankle), then stretches the arms up
over the head, the fuller form the book prefers, and lowers them again.
Shape from the book's photograph; the stages are ours. The legs come from
`_standing.together`, the feet flat on the mat.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('tadasana', skeleton='library')

EASY = {}                       # the rig's rest: feet hip-width, arms down

TOGETHER = S.together({})
S.arms_by_thighs(TOGETHER)

UP = S.together({})
S.arms_up(UP)

# the common mistake the book describes: the weight thrown back on the
# heels — the hips slide forward, the belly pushes out, the chest hangs back
_AT = L.fk(TOGETHER)
_HEELS = {**TOGETHER, 'pelvis.location': L.add(TOGETHER['pelvis.location'], (0, -0.05, 0.0))}
S.trunk(_HEELS, (0, 0.2, 1), neck=(0, 0.05, 1), head=(0, -0.05, 1))
for _s in 'LR':
    L.leg(_HEELS, _s, _AT[f'ankle.{_s}'], (0, -1, 0), (0, -1, 0))
    S.flat_foot(_HEELS, _s, (0, -1))
S.arms_by_thighs(_HEELS)
GHOST = L.diff(_HEELS, TOGETHER)

_ANKLE_Y = _AT['ankle.L'][1]
GUIDES = [
    {'from': (0, _ANKLE_Y, 0.0), 'to': (0, _ANKLE_Y, 1.9)},   # the plumb line through the ankle
]

POSTURE = L.check({
    'id': 'library:tadasana',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'front',
    'frame': S.STAND_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Stand', 'pose': EASY, 'hold': 3, 'notice': ['feet']},
        {'label': 'Feet together', 'pose': TOGETHER, 'hold': 5, 'notice': ['feet', 'quads']},
        {'label': 'Stand tall', 'pose': TOGETHER, 'hold': 10, 'view': 'side', 'guides': GUIDES,
         'ghost': GHOST, 'notice': ['feet', 'quads', 'core', 'breath']},
        {'label': 'Arms overhead', 'pose': UP, 'hold': 8, 'view': 'side', 'notice': ['shoulders', 'core']},
        {'label': 'Arms down', 'pose': TOGETHER, 'hold': 4, 'notice': ['shoulders']},
    ],
})
