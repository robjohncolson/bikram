"""
Janu sirsasana (head to knee) — library sheet, live figure only.

From the staff: the left knee bends out to the side on the mat and the
heel comes in to the perineum, the sole against the right thigh; the
hands take the right foot with the back long and the head up; the trunk
folds down the right leg, the head beyond the knee, the elbows wide; up
again; then the legs change over and the trunk folds down the left leg;
up, and the loop returns to the staff. The camera watches each side from
behind its bent knee (quarter-back for the right leg, quarter for the
left), so both the knee out to the side and the long fold read. Shape from
the book's photographs; the stages are ours.

Two compromises, both the rig's: the bent knee reaches about 65 degrees
out from the straight leg (thigh and shin are the same length here, so a
knee pushed further back cannot also keep its heel at the perineum), and
the hands hold the foot rather than clasping a wrist beyond it (the arms
are short of that; `_folds.SHORT`). A fold that went straight back to the
staff dipped the bent knee through the mat on the way (the trunk and the
leg turning at once), so each fold rises first with the heel still in.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_folds', Path(__file__).resolve().parent / '_folds.py')
F = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(F)
L = F.L
L.begin('janu-sirsasana')


def knee_in(straight_side):
    return F.heel_rest(F.one_bent(straight_side), straight_side)


def hold(straight_side):
    """The foot held in both hands, the back long and hollowed, head up."""
    pose = F.one_bent(straight_side)
    F.trunk(pose, 36, 48, 66, 34, 8, x=F.SX[straight_side] * 0.1)
    F.clavicles(pose, fwd=0.75, down=0.15)
    return F.both_hands_on(pose, straight_side, prefix='hold ')


def fold(straight_side):
    """The trunk down the straight leg, the head beyond its knee, elbows wide."""
    pose = F.one_bent(straight_side)
    F.trunk(pose, 35, 42, 105, 105, 112, x=F.SX[straight_side] * 0.15)
    F.clavicles(pose, fwd=0.6, down=0.2)
    for h in 'LR':
        F.shortfall(pose, h, F.beyond_soles(pose, straight_side), f'the book: wrist clasped beyond the {straight_side} foot, {h} hand')
    return F.both_hands_on(pose, straight_side, prefix='fold ')


SIT = F.staff()

POSTURE = L.check({
    'id': 'library:janu-sirsasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'quarter-back',   # the right-side work: the bent left knee and the long fold both read
    'frame': {'center_z': 0.44, 'scale': 1.3},
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': SIT, 'hold': 3, 'notice': ['lower-back', 'breath']},
        {'label': 'Left heel in', 'pose': knee_in('R'), 'hold': 4, 'notice': ['hips']},
        {'label': 'Hold the foot', 'pose': hold('R'), 'hold': 4, 'notice': ['lower-back', 'hamstrings']},
        {'label': 'Head beyond knee', 'pose': fold('R'), 'hold': 10, 'notice': ['hamstrings', 'lower-back', 'breath']},
        {'label': 'Come up', 'pose': knee_in('R'), 'hold': 3, 'notice': ['breath']},
        {'label': 'Right heel in', 'pose': knee_in('L'), 'hold': 3, 'view': 'quarter', 'notice': ['hips']},
        {'label': 'Left side', 'pose': fold('L'), 'hold': 10, 'view': 'quarter', 'notice': ['hamstrings', 'lower-back', 'breath']},
        {'label': 'Up again', 'pose': knee_in('L'), 'hold': 3, 'view': 'quarter', 'notice': ['breath']},
    ],
})
F.report()
