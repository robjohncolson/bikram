"""
Trianga mukhaikapada paschimottanasana (three limbs, face to one foot) —
library sheet, live figure only.

From the staff: the right leg folds back, the foot beside the right hip
pointing back, sole up, the calf against the outer thigh, the weight
carried toward the bent knee; the hands take the left foot, the back long
and the head up; the trunk folds down the left leg, the chin to the knee,
the elbows wide and off the mat; up again; the legs change over and the
trunk folds down the right leg; up, and the loop returns to the staff.
Each side is watched from the front quarter on the side of its folded
leg's partner, as in janu sirsasana. Shape from the book's photographs;
the stages are ours.

Reach: the book hooks the wrists round the outstretched foot; the figure
holds the sides of the foot (the clasp beyond it is short, `_folds.SHORT`).
Going straight from a fold back to the staff swung the folded leg's knee
through the mat (the trunk and the leg turning at once), so each fold
rises first with the leg still folded.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_folds', Path(__file__).resolve().parent / '_folds.py')
F = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(F)
L = F.L
L.begin('trianga-mukhaikapada-paschimottanasana', skeleton='library')


def legs(straight_side):
    """Sitting upright, `straight_side` leg long, the other folded back."""
    pose = F.sit()
    F.straight(pose, straight_side)
    F.folded_back(pose, F.OTHER[straight_side])
    return pose


def hands(pose, straight_side):
    """The straight leg's palm on the mat beside its hip, the other hand on
    the folded thigh (a palm beside that hip would sit on the folded foot)."""
    F.palms_down(pose, out=0.24, only=straight_side)
    return L.hand_on_thigh(pose, F.OTHER[straight_side], t=0.35, nrm=L.n((F.SX[F.OTHER[straight_side]] * 0.6, 0, 1)), gap=0.03)


def leg_back(straight_side):
    """Balancing on the folded leg: the palms on the mat beside the hips."""
    return hands(legs(straight_side), straight_side)


def hold(straight_side):
    """The sides of the foot held, the back long and hollowed, head up; the
    trunk inclined a little toward the folded leg."""
    pose = legs(straight_side)
    F.trunk(pose, 36, 48, 66, 34, 8, x=-F.SX[straight_side] * 0.04)
    F.clavicles(pose, fwd=0.75, down=0.15)
    return F.both_hands_on(pose, straight_side, where=0.09, prefix='hold ')


def fold(straight_side):
    """The chin toward the knee of the straight leg, elbows wide."""
    pose = legs(straight_side)
    F.trunk(pose, 35, 42, 105, 105, 112, x=F.SX[straight_side] * 0.05)
    F.clavicles(pose, fwd=0.6, down=0.2)
    for h in 'LR':
        F.shortfall(pose, h, F.beyond_soles(pose, straight_side), f'the book: wrists hooked beyond the {straight_side} foot, {h} hand')
    return F.both_hands_on(pose, straight_side, prefix='fold ')


SIT = F.staff()

# the way in and out: the right knee drawn up, the foot flat (a straight
# blend from the long leg to the folded one swept the shin through the hips)
KNEE_UP = hands(F.shin_up(F.straight(F.sit(), 'L'), 'R'), 'L')

POSTURE = L.check({
    'id': 'library:trianga-mukhaikapada-paschimottanasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'quarter',
    'frame': {'center_z': 0.44, 'scale': 1.3},
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': SIT, 'hold': 3, 'notice': ['lower-back', 'breath']},
        {'label': 'Right shin up', 'pose': KNEE_UP, 'hold': 3, 'notice': ['quads']},
        {'label': 'Right leg back', 'pose': leg_back('L'), 'hold': 4, 'notice': ['quads', 'feet']},
        {'label': 'Hold the foot', 'pose': hold('L'), 'hold': 4, 'notice': ['lower-back', 'hamstrings']},
        {'label': 'Chin to knee', 'pose': fold('L'), 'hold': 12, 'notice': ['hamstrings', 'quads', 'breath']},
        {'label': 'Come up', 'pose': leg_back('L'), 'hold': 3, 'notice': ['breath']},
        {'label': 'Shin up', 'pose': KNEE_UP, 'hold': 3, 'notice': ['quads']},
        {'label': 'Left shin up', 'pose': L.mirror(KNEE_UP), 'hold': 3, 'notice': ['quads']},
        {'label': 'Left leg back', 'pose': leg_back('R'), 'hold': 4, 'notice': ['quads', 'feet']},
        {'label': 'Right side fold', 'pose': fold('R'), 'hold': 12, 'notice': ['hamstrings', 'quads', 'breath']},
        {'label': 'Rise on second side', 'pose': leg_back('R'), 'hold': 3, 'notice': ['breath']},
        {'label': 'Left shin forward', 'pose': L.mirror(KNEE_UP), 'hold': 3, 'notice': ['quads']},
    ],
})
F.report()
