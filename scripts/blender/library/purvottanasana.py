"""
Purvottanasana (intense stretch of the front) — library sheet, live figure
only.

Sitting with the legs straight, the palms on the mat by the hips and the
fingers toward the feet; the knees bend and the soles go down; the body
lifts on the hands and feet, arms and legs straight, the trunk level with
the floor and the head thrown back; and down by bending the elbows and
knees. Shape from the book's photograph; the stages are ours.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_backbend', Path(__file__).resolve().parent / '_backbend.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)
L = B.L
L.begin('purvottanasana', skeleton='library')

SEAT = (0, 0.36, 0.10)        # set back along the mat: the plank then lands over the pivot
OUT = 0.24
FINGERS = (0, -1, 0)          # the fingers toward the feet
FRAME = {'center_z': 0.46, 'scale': 1.85}
SOLE_FOOT = L.REST['foot.L']  # the sole flat on the mat


def seated(lean=0.0):
    pose = L.sit(lean, at=SEAT)
    return L.legs_forward(pose)


SIT = seated()
SPOTS = B.straight_arms_down(SIT, OUT, toward=(0, 1, 0), fingers=FINGERS)

# the knees bent, the soles and heels down on the mat, the trunk leaning back
# a little onto the hands (upright, the thighs rose through the belly)
KNEES = seated(lean=-0.3)
_at = L.fk(KNEES)
for _s, _sx in (('L', 1), ('R', -1)):
    _hip = _at[f'hip.{_s}']
    L.leg(KNEES, _s, (_hip[0], _hip[1] - 0.66, 0.10), (0, 0, 1), SOLE_FOOT)
B.palms_at(KNEES, SPOTS, hint=(1, 0.3, 0), fingers=FINGERS)


def plank(level=6.0, feet=(0, -0.75, -0.66)):
    """The trunk level over straight arms (rising `level` degrees toward the
    head), the head thrown back, straight legs down to the soles."""
    c, s = math.cos(math.radians(level)), math.sin(math.radians(level))
    t = (0, c, s)
    pose = B.trunk({}, t, t, t, (0, 0.7, -0.72), (0, 0.45, -0.9))
    sh = L.fk(pose)['shoulder.L']
    w = SPOTS['L']
    lift = math.sqrt(B.straight() ** 2 - (w[0] - sh[0]) ** 2)
    pose['pelvis.location'] = L.sub((sh[0], w[1], w[2] + lift), sh)
    B.palms_at(pose, SPOTS, hint=(1, 0, 0), fingers=FINGERS)
    at = L.fk(pose)
    f = L.n(feet)
    for side, sx in (('L', 1), ('R', -1)):
        hip = at[f'hip.{side}']
        az = B.TOE_Z - 0.16 * f[2]          # the ankle this high puts the toe tip on the mat
        run = math.sqrt(max((L.THIGH + L.SHIN - 0.004) ** 2 - (hip[2] - az) ** 2, 0.0))
        L.leg(pose, side, (hip[0], hip[1] - run, az), (0, 0, 1), f)
    return pose


PLANK = plank()

# the common mistake: the hips sag, the trunk no longer level with the floor
_SAG = plank(level=24.0)
GHOST = L.diff(_SAG, PLANK)

GUIDES = [
    {'from': (0, -0.8, 0.0), 'to': (0, 0.8, 0.0)},     # the mat
]

POSTURE = L.check({
    'id': 'library:purvottanasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'side',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 4, 'notice': ['wrists', 'lower-back']},
        {'label': 'Knees bent', 'pose': KNEES, 'hold': 4, 'notice': ['feet']},
        {'label': 'Lift', 'pose': PLANK, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['shoulders', 'wrists', 'hamstrings', 'neck', 'breath']},
        {'label': 'Knees bend', 'pose': KNEES, 'hold': 3, 'notice': ['breath']},
        {'label': 'Sit down', 'pose': SIT, 'hold': 3, 'notice': ['breath']},
    ],
})
