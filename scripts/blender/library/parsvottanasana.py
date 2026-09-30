"""
Parsvottanasana (the intense side stretch) — library sheet, live figure only.

From Tadasana the palms join behind the back, fingers up between the
shoulder blades; the feet spring apart and the body faces the right foot,
the back foot turned well in, the trunk lifted and the head thrown back;
the trunk folds down over the straight right leg until the head rests
beyond the knee; it rises again, and the figure returns to Tadasana. Seen
from the side, right side only: the rig's trunk never turns about the
vertical in the library (no roll on a trunk bone), so the figure faces the
front foot from the start of the stance, and the book's swing of the trunk
round the hips to the left side is a step without a stage. Shape from the
book's photographs; the stages are ours.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('parsvottanasana')

FRONT_Y = -0.50      # the front (right) ankle ahead of the midline
BACK_Y = 0.50        # the back (left) ankle behind it (about a metre between them)
TRACK = 0.10
ANKLES = {'R': (-TRACK, FRONT_Y), 'L': (TRACK, BACK_Y)}
FEET = {'R': (0, -1), 'L': (0.97, -0.25)}   # the back foot turned in three-quarters of the way
# the fold: each trunk bone's angle from upright toward the front (degrees)
FOLD = {'pelvis': 72.0, 'spine.lower': 134.0, 'spine.upper': 156.0, 'neck': 155.0, 'head': 163.0}


def fwd(deg):
    a = math.radians(deg)
    return (0.0, -math.sin(a), math.cos(a))


def stance(pose):
    """Both legs straight to the stance's ankles, the pelvis fitted between."""
    S.fit_pelvis(pose, {f'hip.{s}': ((ANKLES[s][0], ANKLES[s][1], S.ANKLE_Z), S.LEG) for s in 'LR'}, free='y')
    for s in 'LR':
        S.straight_leg(pose, s, ANKLES[s], FEET[s])
    return pose


STAND = S.together({})
S.arms_by_thighs(STAND)

HANDS = S.namaste_back(S.together({}))
# the hands on their way round behind the back (and back again)
LOW = S.hands_low_back(S.together({}))

# the trunk lifted and the head thrown back
HEAD_BACK = {'pelvis.location': (0, 0, 0), 'spine.lower': L.n((0, 0.06, 1)), 'spine.upper': L.n((0, 0.18, 1)),
             'neck': L.n((0, 0.4, 1)), 'head': L.n((0, 0.75, 0.66))}
stance(HEAD_BACK)
S.namaste_back(HEAD_BACK)


def folded(fold=None):
    f = {**FOLD, **(fold or {})}
    pose = {'pelvis.location': (0, 0, 0)}
    for b, deg in f.items():
        pose[b] = fwd(deg)
    # the shoulder girdle folds with the chest (left at rest it would stay
    # level in the world and the joined hands would sweep through the back)
    for s, sx in (('L', 1), ('R', -1)):
        pose[f'clavicle.{s}'] = L.n(L.add((sx, 0, 0), pose['spine.upper'], 0.2))
    stance(pose)
    return S.namaste_back(pose)


FOLDED = folded()
# halfway down (and up), the back long: the fold turns the trunk ~150
# degrees, and a blend that long swings the joined hands through the back
HALFWAY = folded({b: a / 2 for b, a in FOLD.items()})
# the common mistake: the back rounds and the head drops short of the knee
# instead of the whole front of the trunk lengthening along the leg
GHOST = L.diff(folded({'pelvis': 35.0, 'spine.lower': 95.0, 'spine.upper': 150.0, 'neck': 175.0, 'head': 178.0}), FOLDED)

_AT = L.fk(FOLDED)
GUIDES = [
    {'from': _AT['hip.R'], 'to': (ANKLES['R'][0], ANKLES['R'][1], S.ANKLE_Z)},   # the front leg, straight
]

POSTURE = L.check({
    'id': 'library:parsvottanasana',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'side',
    'frame': S.STAND_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
        {'label': 'Hands behind', 'pose': LOW, 'hold': 3, 'view': 'quarter-back', 'notice': ['shoulders']},
        {'label': 'Head back', 'pose': HEAD_BACK, 'hold': 4, 'notice': ['upper-back', 'neck']},
        {'label': 'Going down', 'pose': HALFWAY, 'hold': 2, 'notice': ['hamstrings']},
        {'label': 'Fold', 'pose': FOLDED, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['hamstrings', 'hips', 'shoulders', 'breath']},
        {'label': 'Rise', 'pose': HALFWAY, 'hold': 2, 'notice': ['upper-back']},
        {'label': 'Feet together', 'pose': LOW, 'hold': 2, 'notice': ['shoulders']},
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
    ],
})
