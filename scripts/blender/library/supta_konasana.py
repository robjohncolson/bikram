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
L.begin('supta-konasana', skeleton='library')

_ispec = importlib.util.spec_from_file_location('_library_inversion', Path(__file__).resolve().parent / '_inversion.py')
I = importlib.util.module_from_spec(_ispec)
_ispec.loader.exec_module(I)
I.configure(L)

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
            # The longer library arms still stop short of the big toes.
            # Place the grip at the lowest point of the shin
            # the fingers reach (the steps offer the shins for the same reason),
            # taken from below and outside: an arm along the inside of the
            # leg lies in the shin (the clearance check)
            sx = 1 if side == 'L' else -1
            span = L.UPPER + L.FORE + L.HAND - 0.01
            grip = next(g for g in (L.add(L.add(ankle, L.sub(knee, ankle), k / 50), (sx * 0.07, 0, -0.07))
                                    for k in range(51)) if L.dist(sh, g) <= span)
            way = L.n(L.sub(grip, sh))
            L.arm(pose, side, L.add(sh, way, L.dist(sh, grip) - L.HAND), (sx, 0, 0), way)
    else:
        L.hands_on_back(pose)
        L.plough_legs(pose, spread=SPREAD)
    return pose


OPEN = wide(hold_toes=False)
TOES = wide()


def reaching():
    """On the way from the back to the toes: the hands leave the back and the
    straight arms open out along the mat to the sides before they reach up
    to the legs (a straight swing from the back to the shins would pass
    through the floor; arms raised over the chest would pass through the
    thighs)."""
    pose = wide(hold_toes=False)
    for side, sx in (('L', 1), ('R', -1)):
        d = L.n((sx, -0.35, -0.04))
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
        # back into the plough, the arms long on the mat (from the shins
        # straight to the back, a forearm swings through the other)
        {'label': 'Legs together', 'pose': L.plough(arms='apart'), 'hold': 4, 'view': 'side',
         'notice': ['core']},
        # ends sliding down onto the back; the loop's return to stage 0 lays it flat
        {'label': 'Slide down', 'pose': L.rolling_down(), 'hold': 6, 'view': 'side', 'notice': ['core', 'breath']},
    ],
})
