"""
Supta Virasana (the reclining hero) — library sheet, live figure only.

From virasana: the trunk reclines onto the elbows, one and then the other,
the hands holding the feet; the arms extend and the back goes down to the
mat, the arms beside the thighs; the arms are taken over the head and
stretched out on the mat — the reclining hero, held; the arms come back
beside the trunk, the elbows press, and you sit up into virasana. Seen
from the side. The legs come from `_seated.hero_at`. Shape from the book's
photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_seated', Path(__file__).resolve().parent / '_seated.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('supta_virasana')

KNEES = -0.50       # the knees on the mat: the seat and the lying body share the frame
FRAME = {'center_z': 0.40, 'scale': 1.3}           # sitting: the camera close
LYING = {'center_z': 0.40, 'scale': 1.5}           # the back on the mat
REACH = {'center_z': 0.40, 'scale': 2.2}           # the arms over the head

# the hero: wrists on the knees
HERO = S.hero_at(KNEES)
L.hand_on_thigh(HERO, 'L', t=0.78)
L.hand_on_thigh(HERO, 'R', t=0.78)

# reclined on the elbows, the chest lifted, the hands holding the feet
ELBOWS = S.hero_at(KNEES, trunk={'pelvis': S.back_at(72), 'spine.lower': S.back_at(64), 'spine.upper': S.back_at(50),
                                 'neck': S.back_at(20), 'head': S.back_at(0)})
S.elbows_down(ELBOWS)

# the back on the mat, the arms beside the thighs
_LIE = {'pelvis': L.n((0, 1, 0.12)), 'spine.lower': L.n((0, 1, 0.02)), 'spine.upper': L.n((0, 1, -0.06)),
        'neck': L.n((0, 1, -0.02)), 'head': L.n((0, 1, 0.0)),
        'clavicle.L': L.n((1, 0.2, 0)), 'clavicle.R': L.n((-1, 0.2, 0))}
DOWN = S.hero_at(KNEES, trunk=_LIE)
S.arms_along(DOWN, -1, out=0.85, drop=0.05)

# the arms over the head, stretched out on the mat: the pose
ARMS = S.hero_at(KNEES, trunk=_LIE)
S.arms_along(ARMS, 1, out=0.08, drop=0.06)

# the common mistake: the knees lift apart off the mat as the back goes down
_KNEES_UP = {**ARMS}
for _s, _sx in (('L', 1), ('R', -1)):
    _at = L.fk(ARMS)
    # the knee lifted off the mat and out, on the circle that keeps the ankle where it was
    _knee = L.knee_on(_at[f'hip.{_s}'], _at[f'ankle.{_s}'], (0, 0, 1), 0.27, (_sx, -1, 0))
    L.set_leg(_KNEES_UP, _s, _knee, _at[f'ankle.{_s}'])
    # the foot keeps its sole where it was: its roll is taken from the new shin
    L.foot_sole(_KNEES_UP, _s, L.sole_facing(ARMS, _s), L.direction(ARMS, f'foot.{_s}'))
GHOST = L.diff(_KNEES_UP, ARMS)

GUIDES = [
    {'from': (0, KNEES - 0.15, 0.0), 'to': (0, 1.0, 0.0)},     # the knees and the shoulder blades on the one floor
]

POSTURE = S.frame_check(L.check({
    'id': 'library:supta-virasana',
    'position': {'start': 'kneeling', 'end': 'kneeling'},
    'view': 'side',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Hero', 'pose': HERO, 'hold': 4, 'notice': ['quads', 'feet']},
        {'label': 'Elbows down', 'pose': ELBOWS, 'hold': 4, 'notice': ['quads', 'lower-back']},
        {'label': 'Back down', 'pose': DOWN, 'hold': 4, 'frame': LYING, 'notice': ['quads', 'hips']},
        {'label': 'Arms overhead', 'pose': ARMS, 'hold': 14, 'frame': REACH, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['quads', 'hips', 'shoulders', 'breath']},
        {'label': 'Elbows press', 'pose': ELBOWS, 'hold': 3, 'notice': ['core']},
        {'label': 'Sit up', 'pose': HERO, 'hold': 3, 'notice': ['lower-back']},
    ],
}))
