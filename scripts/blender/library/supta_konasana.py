"""
Supta Konasana (reclining angle) — library sheet, live figure only.

The plough with the straight legs opened wide, toes on the mat, each hand
taking hold of its leg so the arms and legs frame a wide triangle over the
head. Seen from the front (the camera at the head's end) so the opening
reads. Shape from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('supta_konasana')

SPREAD = 0.72


def wide(hold_toes=True):
    """The legs opened into a wide V on the mat; the hands on the big toes
    (or still on the back on the way in)."""
    pose = L.on_shoulders(up=(0, 0.03, 1))
    if hold_toes:
        L.plough_legs(pose, spread=SPREAD)
        at = L.fk(pose)
        for side in 'LR':
            ankle, knee = at[f'ankle.{side}'], at[f'knee.{side}']
            sh = at[f'shoulder.{side}']
            # the book's hands hold the big toes; this rig's arms are a hand
            # short of its feet, so the grip is the lowest point of the shin
            # the fingers reach (the steps offer the shins for the same reason)
            span = L.UPPER + L.FORE + L.HAND - 0.01
            grip = next(g for g in (L.add(ankle, L.sub(knee, ankle), k / 50) for k in range(51))
                        if L.dist(sh, g) <= span)
            grip = L.add(grip, (0, 0, 0.05))
            way = L.n(L.sub(grip, sh))
            L.arm(pose, side, L.add(sh, way, L.dist(sh, grip) - L.HAND), (0, 0, 1), way)
    else:
        L.hands_on_back(pose)
        L.plough_legs(pose, spread=SPREAD)
    return pose


OPEN = wide(hold_toes=False)
TOES = wide()


def reaching():
    """On the way from the back to the toes: the hands leave the back and the
    straight arms rise over the chest before they reach down the legs (a
    straight swing from the back to the shins would pass through the floor)."""
    pose = wide(hold_toes=False)
    for side, sx in (('L', 1), ('R', -1)):
        d = L.n((sx * 0.25, -0.35, 1))
        pose[f'upperarm.{side}'] = d
        pose[f'forearm.{side}'] = d
        pose[f'hand.{side}'] = d
    return pose


REACH = reaching()

GUIDES = [
    {'from': (-1.0, -0.85, 0.0), 'to': (1.0, -0.85, 0.0)},   # the mat under the feet
]

POSTURE = L.check({
    'id': 'library:supta-konasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'quarter',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'view': 'side', 'notice': ['breath']},
        {'label': 'Shoulderstand', 'pose': L.shoulderstand(), 'hold': 5, 'view': 'side', 'palms': 'back',
         'notice': ['neck', 'shoulders']},
        {'label': 'Plough', 'pose': L.plough(arms='back'), 'hold': 5, 'view': 'side', 'palms': 'back', 'notice': ['hamstrings']},
        {'label': 'Legs wide', 'pose': OPEN, 'hold': 5, 'palms': 'back', 'notice': ['hips', 'hamstrings']},
        {'label': 'Reach', 'pose': REACH, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Take hold', 'pose': TOES, 'hold': 12, 'guides': GUIDES,
         'notice': ['hamstrings', 'hips', 'upper-back', 'breath']},
        {'label': 'Legs together', 'pose': L.plough(arms='back'), 'hold': 4, 'view': 'side', 'palms': 'back',
         'notice': ['core']},
        # ends sliding down onto the back; the loop's return to stage 0 lays it flat
        {'label': 'Slide down', 'pose': L.rolling_down(), 'hold': 6, 'view': 'side', 'notice': ['core', 'breath']},
    ],
})
