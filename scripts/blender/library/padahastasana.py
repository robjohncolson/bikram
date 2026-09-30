"""
Padahastasana (hands under the feet) — library sheet, live figure only.

From Tadasana the feet part a foot's width; the trunk bends forward and
the hands go down to slide under the feet, palms up; the head lifts and the
back goes concave; then the elbows bend and the trunk is drawn down toward
the legs; back to the concave back, and up to Tadasana. Seen from the side.
Shape from the book's photographs; the stages are ours.

The rigid trunk stops before the thighs. The longer arms approach above
the feet with palms up; they cannot take the under-foot target. Keeping
the hands above the foot hull leaves 17.0 cm of wrist-target shortfall in
the concave back and 11.5 cm in the fold. Run with --report to measure it.
"""
import importlib.util
import sys
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('padahastasana', skeleton='library')

HALF = 0.15          # the ankles a foot apart
UNDER = (0, 1, 0)  # the hand sliding in under the foot, fingers toward the heel
# the deepest clearance-clean fold and the lowest clean concave back (searched with
# Padangusthasana's stance; degrees from upright)
FOLD = {'pelvis': 115.0, 'spine.lower': 140.0, 'spine.upper': 185.0, 'neck': 178.0, 'head': 184.0}
HOLLOW = {'pelvis': 128.0, 'spine.lower': 121.0, 'spine.upper': 121.0, 'neck': 71.0, 'head': 46.0}

STAND = S.together({})
S.arms_by_thighs(STAND)

APART = S.wide({}, HALF)
S.arms_by_thighs(APART)


def under_wrist(at, s):
    """Where the wrist would go with the palm flat under the ball of foot `s`."""
    return (at[f'toes.{s}'][0], at[f'toes.{s}'][1] - L.PALM_AT, L.PALM_R)


def to_soles(pose, hint):
    L.clavicles_follow(pose)
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        # The soles cannot accept a palm through the mat; approach above
        # the foot hull until the under-foot target is reachable.
        wrist = under_wrist(at, s)
        wrist = (wrist[0], wrist[1], max(wrist[2], 0.15))
        S.reach_toward(pose, s, wrist, (sx * hint[0], hint[1], hint[2]), UNDER)
    return pose


CONCAVE = to_soles(S.fold(HOLLOW, HALF), (1, -0.3, 0.0))
# the elbows bend back and out, drawing the head down
FOLDED = to_soles(S.fold(FOLD, HALF), (1, -0.3, 0.0))

HALFWAY = to_soles(S.fold({b: (HOLLOW[b] + FOLD[b]) / 2 for b in FOLD}, HALF), (1, -0.3, 0.0))

# the common mistake: rounding down from the shoulders instead of bending
# forward from the pelvis — the hips barely fold and the upper back humps
_ROUND = to_soles(S.fold({'pelvis': 100.0, 'spine.lower': 132.0, 'spine.upper': 160.0, 'neck': 150.0, 'head': 150.0}, HALF),
                  (0.3, -1, 0.1))
GHOST = L.diff(_ROUND, CONCAVE)
_AT = L.fk(FOLDED)

GUIDES = [
    {'from': (0, _AT['ankle.L'][1], 0.0), 'to': (0, _AT['ankle.L'][1], 1.0)},   # the legs upright
]

FRAME = {'center_z': 0.95, 'scale': 2.3}
LOW = {'center_z': 0.66, 'scale': 1.6}

POSTURE = L.check({
    'id': 'library:padahastasana',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'side',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
        {'label': 'Feet apart', 'pose': APART, 'hold': 3, 'notice': ['feet']},
        {'label': 'Concave back', 'pose': CONCAVE, 'hold': 5, 'frame': LOW, 'ghost': GHOST,
         'notice': ['hamstrings', 'wrists']},
        {'label': 'Going down', 'pose': HALFWAY, 'hold': 2, 'frame': LOW, 'notice': ['hamstrings']},
        {'label': 'Head down', 'pose': FOLDED, 'hold': 10, 'frame': LOW, 'guides': GUIDES,
         'notice': ['hamstrings', 'calves', 'breath']},
        {'label': 'Rising', 'pose': HALFWAY, 'hold': 2, 'frame': LOW, 'notice': ['lower-back']},
        {'label': 'Head up', 'pose': CONCAVE, 'hold': 3, 'frame': LOW, 'notice': ['lower-back']},
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
    ],
})

if '--report' in sys.argv:
    for name, pose, base in (('concave', CONCAVE, HOLLOW), ('fold', FOLDED, FOLD)):
        at = L.fk(S.fold(base, HALF))
        print(name, {s: round(S.shortfall(pose, s, under_wrist(at, s)) * 100, 1) for s in 'LR'}, 'cm short of palms under the feet')
