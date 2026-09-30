"""
Parsvottanasana (the intense side stretch) — library sheet, live figure only.

From Tadasana the palms join behind the back, fingers up between the
shoulder blades; the feet spring apart sideways, the body still facing the
front; then it turns to face the right foot (the hips square to the front
leg), the back foot turned well in, the trunk lifted and the head thrown
back; the trunk folds down over the straight right leg until the head
rests beyond the knee; the head and trunk come back to the centre, the
trunk rises, and the feet come together. The feet stand turned for the fold
(the right a quarter turn out, the left well in) from the jump to the way
out, so the hips turn on planted feet (turned with the hips, the straight
legs swing the drawn figure 3-6 cm into the mat). The turn is the whole
figure turned about the vertical (`_lib.turn`, a roll of the pelvis), allowed since the integration pass narrowed the
trunk-across rule. Seen from the side, right side only (the book's swing of
the folded trunk round to the left side is a step without a stage): the
stages facing the front face +X, away from the side camera, so the joined
palms show on the back; the stages facing the right foot are in profile.
Shape from the book's photographs; the stages are ours.
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
TRACK = 0.10         # the front leg a little to the right of the head's line (it folds beside the leg)
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


# the mat's FRONT is +X: the stages facing the front are built facing -Y
# (the helpers' way) and turned a quarter turn (`_lib.turn` 90: the figure
# faces +X, its right foot toward -Y, its back to the side camera)
SIDE = 90.0

STAND = S.together({})
S.arms_by_thighs(STAND)
STAND = L.turn(STAND, SIDE)

# the hands on their way round behind the back (and back again)
LOW = L.turn(S.hands_low_back(S.together({})), SIDE)


def sideways(fold=None):
    """The feet jumped apart sideways, the body facing the front, the palms
    joined behind the back — upright, or with the trunk bent forward by the
    `fold` angles (the head brought back to the centre before rising);
    turned so the stance runs along Y."""
    # the same two footprints as the fold's stance, seen before the quarter
    # turn: the feet stay put while the body turns
    ankles = {s: (ANKLES[s][1], -ANKLES[s][0]) for s in 'LR'}
    pose = {'pelvis.location': (0, 0, 0)}
    for b, deg in (fold or {}).items():
        pose[b] = fwd(deg)
    if fold:
        for s, sx in (('L', 1), ('R', -1)):
            pose[f'clavicle.{s}'] = L.n(L.add((sx, 0, 0), pose['spine.upper'], 0.2))
    S.fit_pelvis(pose, {f'hip.{s}': ((ankles[s][0], ankles[s][1], S.ANKLE_Z), S.LEG) for s in 'LR'}, y=0.0)
    # the feet stay turned for the fold (the right a quarter turn out, the
    # left well in), so the turn of the hips pivots on them: turned together
    # with the hips, the straight legs swing the figure 3-6 cm into the mat
    # on the way (they turn to the front as the feet come together)
    feet = {s: (FEET[s][1], -FEET[s][0]) for s in 'LR'}
    for s in 'LR':
        S.straight_leg(pose, s, ankles[s], feet[s])
    return L.turn(S.namaste_back(pose), SIDE)


APART = sideways()

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

# the head and trunk back to the centre, still bent forward: the book's way
# up (the trunk rises facing the front); 0.7 of the fold — shallower, the
# turn out of the fold swings the figure 3-5 cm into the mat on the way
CENTRE = sideways({b: a * 0.7 for b, a in FOLD.items()})

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
        {'label': 'Legs apart', 'pose': APART, 'hold': 3, 'notice': ['shoulders', 'feet']},
        {'label': 'Head back', 'pose': HEAD_BACK, 'hold': 4, 'notice': ['upper-back', 'neck']},
        {'label': 'Going down', 'pose': HALFWAY, 'hold': 2, 'notice': ['hamstrings']},
        {'label': 'Fold', 'pose': FOLDED, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['hamstrings', 'hips', 'shoulders', 'breath']},
        {'label': 'Back to the centre', 'pose': CENTRE, 'hold': 3, 'view': 'back', 'notice': ['upper-back']},
        # the loop back to Stand lowers the hands by the sides
        {'label': 'Feet together', 'pose': LOW, 'hold': 2, 'notice': ['shoulders']},
    ],
})
