"""
Urdhva Mukha Svanasana (upward-facing dog) — library sheet, live figure only.

Face down, the feet a foot apart with the toes pointing back, the palms
beside the waist; the arms straighten and the trunk and head go up and
back, the knees and thighs off the mat, the weight on the palms and the
tops of the toes alone; and down with bent elbows. Shape from the book's
photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_backbend', Path(__file__).resolve().parent / '_backbend.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)
L = B.L
L.begin('urdhva-mukha-svanasana', skeleton='library')

APART = 0.06        # the feet about a foot apart
OUT = 0.25


def lying():
    pose = B.prone()
    for s, sx in (('L', 1), ('R', -1)):
        pose[f'thigh.{s}'] = L.n((sx * APART, 1, 0))
    return pose


LIE = lying()
TOE_Y = L.fk(LIE)['toes.L'][1]
ARCH = (B.up(22), B.up(42), B.up(62), (0, 0.15, 0.99), (0, 0.5, 0.87))


def dog(deg):
    pose = B.trunk(lying(), *ARCH)
    B.legs_down_to(pose, deg, APART)
    return B.set_toes(pose, TOE_Y - 0.06)


def shoulder_over(deg):
    """How far the shoulders sit above a straight arm's height (0 = the arm hangs plumb)."""
    return L.fk(dog(deg))['shoulder.L'][2] - (B.WRIST_Z + B.straight() - 0.01)


# the leg angle at which straight arms stand just under the shoulders
UP = dog(B.bisect(shoulder_over, 2.0, 35.0))
SPOTS = B.straight_arms_down(UP, OUT)

# lying, the palms beside the waist where the arms will press, elbows up
PALMS = B.palms_at(lying(), SPOTS, hint=(0.3, 0.3, 1))

# on the way up and down: the head and chest half raised, the elbows still bent
RISE = B.trunk(lying(), B.up(8), B.up(20), B.up(34), (0, -0.7, 0.7), (0, -0.55, 0.83))
B.palms_at(RISE, SPOTS, hint=(0.4, 0.3, 1))

# the common mistake: the knees and thighs drop to the mat and the lower back takes it
_SAG = B.trunk(lying(), B.up(30), B.up(50), B.up(62), (0, 0.15, 0.99), (0, 0.5, 0.87))
for _s, _sx in (('L', 1), ('R', -1)):
    _SAG[f'thigh.{_s}'] = L.n((_sx * APART, 1, -0.16))
    _SAG[f'shin.{_s}'] = L.n((0, 1, 0))
    _SAG[f'foot.{_s}'] = B.POINTED
B.set_toes(_SAG, TOE_Y - 0.06)
B.palms_at(_SAG, SPOTS, hint=(1, 0, 0))
GHOST = L.diff(_SAG, UP)

GUIDES = [
    {'from': (0, -1.0, 0.0), 'to': (0, 1.0, 0.0)},   # the mat: only the palms and toes on it
]

POSTURE = L.check({
    'id': 'library:urdhva-mukha-svanasana',
    'position': {'start': 'prone', 'end': 'prone'},
    'view': 'side',
    'frame': B.PRONE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Palms by the waist', 'pose': PALMS, 'hold': 5, 'notice': ['feet', 'wrists', 'breath']},
        {'label': 'Rise', 'pose': RISE, 'hold': 3, 'notice': ['upper-back']},
        {'label': 'Upward dog', 'pose': UP, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['upper-back', 'quads', 'wrists', 'neck', 'breath']},
        {'label': 'Lower', 'pose': RISE, 'hold': 3, 'notice': ['breath']},
    ],
})
