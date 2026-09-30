"""
Jatara Parivartanasana (the belly turned) — library sheet, live figure only.

Lying on the back, the straight legs raised to the vertical, the arms
stretched out along the mat in line with the shoulders (a cross); then both
legs, knees tight and together, lowered to the left until the feet come
near the left hand, the shoulders kept on the mat; back up to the vertical,
the same to the right, back up, and down. The book lowers the legs to the
left first; so does the sheet.

The hips turn onto their side under the lowered legs, the right leg over
the left: the pelvis rolls 75 degrees (`_lib.roll`), the hip bones stack,
and the spine rolls back the other way so the chest stays flat on the
mat; the legs lie together at the side, as the book has them. (Until the
integration pass the library test capped any trunk roll at ~25 degrees,
and the sheet rode the upper leg 8 degrees above the lower one; the
narrowed trunk-across rule lets a roll that is asked for through.)
Shape from the book's photographs; the
stages are ours. Seen from a quarter round, so the cross of the arms and
the legs' swing both read.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_twist', Path(__file__).resolve().parent / '_twist.py')
T = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(T)
L = T.L
L.begin('jatara_parivartanasana')

LIE = L.LIE
LIE_AT = L.fk(LIE)
ARM_DROP = -0.11     # the straight arms slope from the shoulders down to the mat


def cross(pose):
    """The arms stretched out along the mat in line with the shoulders, palms down."""
    for side, sx in (('L', 1), ('R', -1)):
        d = L.n((sx, 0, ARM_DROP))
        pose[f'upperarm.{side}'] = d
        pose[f'forearm.{side}'] = d
        pose[f'hand.{side}'] = L.n((sx, 0, -0.25))
    return pose


def legs_up(arms_out=True):
    pose = L.legs_up()
    return cross(pose) if arms_out else pose


# the hips turned onto their side under the lowered legs: the pelvis's own
# roll (its hull), the hip bones stacked further, the spine rolled back so
# the chest stays square on the mat; the pelvis lifted to rest the lower hip
# on the mat
PELVIS_ROLL = 75.0   # the hip line onto its side (measured clean; 24 before the integration)
HIP_TILT = 2.5       # the hip line's rise over its run, the upper hip over the lower
SPREAD_Y = 0.30      # how far toward the head the feet travel for each metre out
UPPER_LEG = 0.0      # the legs together, the upper one on the lower
REST_ON = 0.003      # the lowest point of the hull this far above the mat


def to_side(side, theta=88.0):
    """Both legs lowered `theta` degrees from the vertical to `side` ('L' =
    the mannequin's left, +X), the other leg over the first. The pelvis
    rises just enough for the lower hip to rest on the mat, tipping about
    the waist so the chest stays where it lay."""
    sx = 1 if side == 'L' else -1
    other = 'R' if side == 'L' else 'L'
    pose = cross({**LIE})
    pose[f'hipbone.{side}'] = L.n((sx, 0, -HIP_TILT))
    pose[f'hipbone.{other}'] = L.n((-sx, 0, HIP_TILT))
    for s, th in ((side, theta), (other, theta - UPPER_LEG)):
        t = math.radians(th)
        d = L.n((sx * math.sin(t), -SPREAD_Y * math.sin(t), math.cos(t)))
        pose[f'thigh.{s}'] = d
        pose[f'shin.{s}'] = d
        pose[f'foot.{s}'] = L.n(L.add(d, (0, -0.3, 0)))
    waist = L.fk(pose)['waist']
    lift = 0.0
    for _ in range(4):
        # the lying pose is mirror-labelled (left is +X, the chest up): a roll
        # about the pelvis's own axis (toward the head, -Y) that lifts the
        # right hip is negative; the spine rolls back so the chest stays flat
        s_ = min(lift / L.LENGTH['pelvis'], 0.9)
        trial = {**pose, 'pelvis': (0, -math.sqrt(1 - s_ * s_), -s_)}
        trial['pelvis.location'] = (0, 0, 0)
        L.place(trial, 'waist', waist)
        T.roll(trial, {'pelvis': -sx * PELVIS_ROLL, 'spine.lower': sx * PELVIS_ROLL})
        lift += REST_ON - T.hull_low(trial)
    return trial


FLAT = LIE
UP_SIDES = legs_up(arms_out=False)
UP = legs_up()
LEFT = to_side('L')
RIGHT = to_side('R')
DOWN = cross({**LIE})

POSTURE = T.check({
    'id': 'library:jatara-parivartanasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'quarter',
    'frame': {'center_z': 0.5, 'scale': 2.2},
    'transition': 10,
    'stages': [
        {'label': 'Lie flat', 'pose': FLAT, 'hold': 3, 'notice': ['breath']},
        {'label': 'Legs up', 'pose': UP_SIDES, 'hold': 3, 'notice': ['quads', 'core']},
        {'label': 'Arms out', 'pose': UP, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Legs to the left', 'pose': LEFT, 'hold': 8, 'notice': ['core', 'lower-back', 'shoulders']},
        {'label': 'Legs up', 'pose': UP, 'hold': 3, 'notice': ['quads']},
        {'label': 'Legs to the right', 'pose': RIGHT, 'hold': 8, 'notice': ['core', 'lower-back', 'shoulders']},
        {'label': 'Legs up', 'pose': UP, 'hold': 3, 'notice': ['quads']},
        {'label': 'Lower', 'pose': DOWN, 'hold': 3, 'notice': ['breath']},
    ],
})
