"""
Padangusthasana (the big-toe hold) — library sheet, live figure only.

From Tadasana the feet part a foot's width; the trunk bends forward from
the pelvis, the head up and the back concave, the hands going down for the
big toes; then the elbows open and the trunk folds down toward the legs;
back to the concave back, and up to Tadasana. Seen from the side. Shape
from the book's photographs; the stages are ours.

TWO RIG LIMITS, drawn as far as they go and reported: the hull cannot lay
the trunk on the thighs (thick tubes, no soft tissue), so the fold stops
where the clearance check allows — the head before the knees, not between
them — and from there the arms end short of the big toes: the hands reach
toward the feet (the wrists stop 3 cm short of the toe hold in the fold,
13 cm in the concave back; `python padangusthasana.py --report`).
"""
import importlib.util
import sys
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('padangusthasana')

HALF = 0.15          # the ankles a foot apart, centre to centre
GRIP = L.n((0, -0.2, -1))   # the hand down toward the big toe, fingers wrapping it
# the deepest clearance-clean fold, and the lowest clean concave back with
# the head up (both searched over the trunk angles; degrees from upright)
FOLD = {'pelvis': 115.0, 'spine.lower': 140.0, 'spine.upper': 185.0, 'neck': 178.0, 'head': 184.0}
HOLLOW = {'pelvis': 128.0, 'spine.lower': 121.0, 'spine.upper': 121.0, 'neck': 71.0, 'head': 46.0}

STAND = S.together({})
S.arms_by_thighs(STAND)

APART = S.wide({}, HALF)
S.arms_by_thighs(APART)


def toe_wrist(at, s):
    """Where the wrist would go for the hand to take the big toe of foot `s`:
    over the toe's inner edge, the fingers reaching down round it."""
    sx = 1 if s == 'L' else -1
    tip = L.add(at[f'toes.{s}'], (sx * 0.01, -0.01, 0.065))
    return L.add(tip, GRIP, -L.HAND)


def to_toes(pose, hint):
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        S.reach_toward(pose, s, toe_wrist(at, s), (sx * hint[0], hint[1], hint[2]), GRIP)
    return pose


CONCAVE = to_toes(S.fold(HOLLOW, HALF), (1, -0.3, 0.0))


def folded(angles=None):
    pose = S.fold({**FOLD, **(angles or {})}, HALF)
    return to_toes(pose, (1, -0.3, 0.0))    # the elbows open out to the sides


FOLDED = folded()
# halfway between the concave back and the fold: blended straight from one to
# the other, the chest turning over swung the two forearms into each other
HALFWAY = to_toes(S.fold({b: (HOLLOW[b] + FOLD[b]) / 2 for b in FOLD}, HALF), (1, -0.3, 0.0))
# the common mistake the book names: rounding down from the shoulders
# instead of bending forward from the pelvis — the hips barely fold, the
# upper back humps and the head hangs
_ROUND = to_toes(S.fold({'pelvis': 100.0, 'spine.lower': 132.0, 'spine.upper': 160.0, 'neck': 150.0, 'head': 150.0}, HALF),
                 (0.3, -1, 0.1))
GHOST = L.diff(_ROUND, CONCAVE)
_AT = L.fk(FOLDED)

GUIDES = [
    {'from': (0, _AT['ankle.L'][1], 0.0), 'to': (0, _AT['ankle.L'][1], 1.0)},   # the legs upright
]

FRAME = {'center_z': 0.95, 'scale': 2.3}
LOW = {'center_z': 0.66, 'scale': 1.6}

POSTURE = L.check({
    'id': 'library:padangusthasana',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'side',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
        {'label': 'Feet apart', 'pose': APART, 'hold': 3, 'notice': ['feet']},
        {'label': 'Concave back', 'pose': CONCAVE, 'hold': 5, 'frame': LOW, 'ghost': GHOST,
         'notice': ['hamstrings', 'lower-back']},
        {'label': 'Going down', 'pose': HALFWAY, 'hold': 2, 'frame': LOW, 'notice': ['hamstrings']},
        {'label': 'Head down', 'pose': FOLDED, 'hold': 10, 'frame': LOW, 'guides': GUIDES,
         'notice': ['hamstrings', 'calves', 'breath']},
        {'label': 'Rising', 'pose': HALFWAY, 'hold': 2, 'frame': LOW, 'notice': ['lower-back']},
        {'label': 'Head up', 'pose': CONCAVE, 'hold': 3, 'frame': LOW, 'notice': ['lower-back']},
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
    ],
})

if '--report' in sys.argv:
    for name, pose in (('concave', CONCAVE), ('fold', FOLDED)):
        at = L.fk(S.fold(HOLLOW if name == 'concave' else FOLD, HALF))
        print(name, {s: round(S.shortfall(pose, s, toe_wrist(at, s)) * 100, 1) for s in 'LR'}, 'cm short of the big toes')
