"""
Uttanasana (the intense forward stretch) — library sheet, live figure only.

From Tadasana, knees tight, the trunk bends forward and the hands go down
beside the feet; the head lifts and the spine stretches (the concave back);
the trunk moves down toward the legs and is held there; the head comes up
again with the hands still down, and the figure rises to Tadasana. Seen
from the side. Shape from the book's photograph; the stages are ours.

RIG LIMITS, drawn as far as they go and reported: the hull cannot lay the
trunk on the thighs (thick tubes, no soft tissue), so the fold stops where
the clearance check allows, the head before the knees; and from there the
hands reach down beside the feet but stop short of the floor behind the
heels (`python uttanasana.py --report` prints by how much).
"""
import importlib.util
import sys
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('uttanasana', skeleton='library')

FLAT = L.flat_hand((0, -1, 0))    # the palm flat on the mat, fingers forward
# the deepest clearance-clean fold and the lowest clean concave back with the
# feet together (both searched over the trunk angles; degrees from upright)
FOLD = {'pelvis': 115.0, 'spine.lower': 134.0, 'spine.upper': 178.0, 'neck': 186.0, 'head': 192.0}
HOLLOW = {'pelvis': 126.0, 'spine.lower': 123.0, 'spine.upper': 119.0, 'neck': 69.0, 'head': 44.0}

STAND = S.together({})
S.arms_by_thighs(STAND)


def floor_wrist(at, s):
    """Where the wrist would go with the palm on the mat beside the foot,
    level with the back of the heel."""
    sx = 1 if s == 'L' else -1
    return (at[f'ankle.{s}'][0] + sx * 0.11, at[f'ankle.{s}'][1] + 0.04, L.WRIST_Z)


def to_floor(pose, hint):
    L.clavicles_follow(pose)
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        S.reach_toward(pose, s, floor_wrist(at, s), (sx * hint[0], hint[1], hint[2]), FLAT)
    return pose


CONCAVE = to_floor(S.fold(HOLLOW), (1, -0.3, 0.0))
FOLDED = to_floor(S.fold(FOLD), (1, -0.3, 0.0))

# the common mistake: rounding down from the shoulders with the hips barely
# folded, instead of stretching the spine from the pelvis
_ROUND = to_floor(S.fold({'pelvis': 100.0, 'spine.lower': 132.0, 'spine.upper': 160.0, 'neck': 150.0, 'head': 150.0}),
                  (0.3, -1, 0.1))
GHOST = L.diff(_ROUND, CONCAVE)
_AT = L.fk(FOLDED)

GUIDES = [
    {'from': (0, _AT['ankle.L'][1], 0.0), 'to': (0, _AT['ankle.L'][1], 1.0)},   # the legs perpendicular to the floor
]

FRAME = {'center_z': 0.95, 'scale': 2.3}
LOW = {'center_z': 0.66, 'scale': 1.6}

POSTURE = L.check({
    'id': 'library:uttanasana',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'side',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['quads', 'feet']},
        {'label': 'Concave back', 'pose': CONCAVE, 'hold': 5, 'frame': LOW, 'ghost': GHOST,
         'notice': ['hamstrings', 'lower-back']},
        {'label': 'Fold', 'pose': FOLDED, 'hold': 12, 'frame': LOW, 'guides': GUIDES,
         'notice': ['hamstrings', 'calves', 'breath']},
        {'label': 'Head up', 'pose': CONCAVE, 'hold': 4, 'frame': LOW, 'notice': ['lower-back', 'breath']},
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
    ],
})

if '--report' in sys.argv:
    for name, pose, base in (('concave', CONCAVE, HOLLOW), ('fold', FOLDED, FOLD)):
        at = L.fk(S.fold(base))
        print(name, {s: round(S.shortfall(pose, s, floor_wrist(at, s)) * 100, 1) for s in 'LR'}, 'cm short of the palms on the floor')
