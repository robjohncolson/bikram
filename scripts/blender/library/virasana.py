"""
Virasana (the hero) — library sheet, live figure only.

Kneeling with the knees together and the feet apart; the buttocks go down
to the mat between the feet, the feet beside the thighs, toes back, and
the wrists rest on the knees — the hero, held; the fingers lace and the
arms stretch up, palms to the ceiling; then the trunk folds forward, the
chin to the knees, the palms on the soles; and up again. A quarter view:
the knees together in front and the feet outside the hips both read. The
legs come from `_seated.hero_kneel` / `hero_legs`. Shape from the book's
photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_seated', Path(__file__).resolve().parent / '_seated.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('virasana')

KNEES = -0.18       # the knees on the mat, a little in front of the centre
FRAME = {'center_z': 0.52, 'scale': 1.25}
TALL = {'center_z': 0.72, 'scale': 1.55}      # the arms up
LOW = {'center_z': 0.30, 'scale': 0.95}       # folded forward

# kneeling, knees together, feet apart, the hands by the sides
KNEEL = S.hero_kneel(KNEES)


def fwd(deg):
    """A trunk direction `deg` degrees forward from upright (90 = level, toward -Y)."""
    return S.back_at(-deg)


def hero(lift=0.0, ankle_x=S.ANKLE_X):
    """Sitting between the feet, trunk upright, knees at KNEES (`lift`
    raises the seat off the mat, `ankle_x` brings the feet in)."""
    pose = S.seat(0.0)
    S.hero_legs(pose, ankle_x=ankle_x)
    # slide along the mat so the knees land where the kneel had them
    k = L.fk(pose)['knee.L']
    loc = pose['pelvis.location']
    pose['pelvis.location'] = (loc[0], loc[1] + KNEES - k[1], loc[2])
    S.ground(pose)
    loc = pose['pelvis.location']
    pose['pelvis.location'] = (loc[0], loc[1], loc[2] + lift)
    return S.hero_legs(pose, ankle_x=ankle_x)


# the hero: wrists on the knees
SEAT = hero()
L.hand_on_thigh(SEAT, 'L', t=0.78)
L.hand_on_thigh(SEAT, 'R', t=0.78)

# the common mistake: the seat on the feet instead of on the mat between them
_ON_FEET = hero(lift=0.13, ankle_x=0.09)
L.hand_on_thigh(_ON_FEET, 'L', t=0.6)
L.hand_on_thigh(_ON_FEET, 'R', t=0.6)
GHOST = L.diff(_ON_FEET, SEAT)

# fingers laced, arms up, palms to the ceiling
UP = hero()
S.arms_up_laced(UP)

# upright, the palms down on the upturned soles (from the arms up the hands
# come down beside the body here before the fold, and come back up here)
SOLES = hero()
S.palms_on_soles(SOLES, gap=0.03)

# the back rounds forward from the seat, the head down past the knees
# (searched on the hull: the crown in front of the knees, nothing through
# the thighs), the palms on the upturned soles
FOLD = hero()
FOLD.update({'pelvis': fwd(30), 'spine.lower': fwd(70), 'spine.upper': fwd(100), 'neck': fwd(100), 'head': fwd(130),
             'clavicle.L': L.n((1, 0, -0.1)), 'clavicle.R': L.n((-1, 0, -0.1))})
S.palms_on_soles(FOLD, gap=0.03)

POSTURE = S.frame_check(L.check({
    'id': 'library:virasana',
    'position': {'start': 'kneeling', 'end': 'kneeling'},
    'view': 'quarter',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Kneel', 'pose': KNEEL, 'hold': 4, 'frame': TALL, 'notice': ['quads', 'feet']},
        {'label': 'Hero', 'pose': SEAT, 'hold': 14, 'ghost': GHOST, 'notice': ['quads', 'feet', 'lower-back', 'breath']},
        {'label': 'Arms up', 'pose': UP, 'hold': 8, 'hands': 'laced', 'frame': TALL,
         'notice': ['shoulders', 'breath']},
        {'label': 'Palms on soles', 'pose': SOLES, 'hold': 3, 'notice': ['feet']},
        {'label': 'Forward', 'pose': FOLD, 'hold': 8, 'view': 'side', 'frame': LOW, 'notice': ['lower-back', 'feet']},
        {'label': 'Sit up', 'pose': SOLES, 'hold': 3, 'notice': ['lower-back']},
    ],
}))
