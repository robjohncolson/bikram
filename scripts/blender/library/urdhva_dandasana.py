"""
Urdhva Dandasana (headstand with the legs level) — library sheet, live
figure only.

From the forearms-down kneel, the headstand's way up, then the straight legs lowered together toward the
chest's side (+Y) until they are level with the mat, the trunk tipping a
little the other way so the hips counter the weight of the legs; the legs
lift back to vertical before the knees fold to come down. Shape
from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('urdhva_dandasana')

UP = L.headstand()
# the legs level: a staff held out from the hips, the hips drawn back over
# the head so the line from crown to hips leans away from the legs
LEVEL = L.headstand(legs=(0, 1, 0.03), spine=((0, -0.04, 1), (0, -0.1, 1), (0, -0.16, 1)))

# the common mistake: the legs are level but the back caves and the hips
# slide toward the legs, so the weight tips onto the neck
_CAVE = L.headstand(legs=(0, 1, -0.1), spine=((0, 0.1, 1), (0, 0.16, 1), (0, 0.18, 1)))
GHOST = L.diff(_CAVE, LEVEL)

_LEG_Z = round(L.fk(LEVEL)['hip.L'][2], 3)   # the hips' height: the line the legs lie along

GUIDES = [
    {'from': (0, -0.9, 0.0), 'to': (0, 0.9, 0.0)},                  # the mat
    {'from': (0, -0.3, _LEG_Z), 'to': (0, 1.05, _LEG_Z)},           # the level the legs hold
]

POSTURE = L.check({
    'id': 'library:urdhva-dandasana',
    'position': {'start': 'kneeling', 'end': 'kneeling'},
    'view': 'side',
    'frame': L.HEAD_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Forearms down', 'pose': L.head_set(), 'hold': 5, 'notice': ['wrists', 'shoulders']},
        {'label': 'Walk in', 'pose': L.head_walk(), 'hold': 4, 'notice': ['hamstrings']},
        {'label': 'Knees in', 'pose': L.head_tuck(), 'hold': 4, 'notice': ['core']},
        {'label': 'Headstand', 'pose': UP, 'hold': 6, 'notice': ['shoulders', 'neck']},
        {'label': 'Legs level', 'pose': LEVEL, 'hold': 12, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['core', 'hamstrings', 'lower-back', 'neck']},
        {'label': 'Legs up', 'pose': UP, 'hold': 5, 'notice': ['core', 'shoulders']},
        {'label': 'Knees in', 'pose': L.head_tuck(), 'hold': 4, 'notice': ['core']},
        # the feet down and the knees on the mat, a rest before the head lifts
        {'label': 'Knees down', 'pose': L.head_set(), 'hold': 6, 'notice': ['shoulders', 'breath']},
    ],
})
