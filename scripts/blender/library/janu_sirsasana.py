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

The ankle sits outside the heel: the rolled foot brings the heel inward
near the perineum while the bent thigh opens beyond a right angle. The
hands clasp beyond the sole with the chest lifted clear of the arms. A fold that went straight back to the
staff dipped the bent knee through the mat on the way (the trunk and the
leg turning at once), so each fold rises first with the heel still in.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_folds', Path(__file__).resolve().parent / '_folds.py')
F = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(F)
L = F.L
L.begin('janu-sirsasana', skeleton='library')

HEEL = (0.14, -0.17, 0.075)   # ankle target; the rolled heel lies 6 cm further inward


def open_knee(pose, straight_side):
    side = F.OTHER[straight_side]
    F.heel_in(pose, side, ankle=HEEL)
    # Turn the thigh outward so the knee bends above the mat on the way in.
    L.roll(pose, {f'thigh.{side}': -90 * F.SX[side]})
    return L.foot_sole(pose, side, (-F.SX[side], 0, 0.15))


def knee_in(straight_side):
    return F.heel_rest(open_knee(F.one_bent(straight_side, heel=HEEL), straight_side), straight_side)


def hold(straight_side):
    """The foot held in both hands, the back long and hollowed, head up."""
    pose = F.one_bent(straight_side, heel=HEEL)
    F.trunk(pose, 36, 48, 66, 34, 8, x=F.SX[straight_side] * 0.1)
    open_knee(pose, straight_side)
    F.clavicles(pose, fwd=0.75, down=0.15)
    return F.both_hands_on(pose, straight_side, prefix='hold ')


def fold(straight_side, release=False):
    """A wrist clasp beyond the left sole, mirrored for the right leg.
    Lift the chest enough to keep the head clear of the reaching arms."""
    pose = F.one_bent('L', heel=HEEL)
    F.trunk(pose, 35, 42, 85, 90, 105, x=0.15)
    pose['neck'] = F.ang(90, 0.05)
    pose['head'] = F.ang(105, 0.05)
    open_knee(pose, 'L')
    F.clavicles(pose, fwd=0.8, down=0.2)
    target = F.beyond_soles(pose, 'L', ahead=0.005)
    for side, offset, hand in (
        ('L', (0.055, 0, 0.11), (0, -1, 0)),
        ('R', (-0.095, 0, 0.16), (1, 0, 0)),
    ):
        if release:
            offset = (0.18 if side == 'L' else -0.22, 0.08, offset[2])
            hand = (0, -1, 0)
        L.arm(pose, side, L.add(target, offset), (F.SX[side], 0, 1), hand)
    return pose if straight_side == 'L' else L.mirror(pose)


SIT = F.staff()

POSTURE = L.check({
    'id': 'library:janu-sirsasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'quarter-back',   # the right-side work: the bent left knee and the long fold both read
    'frame': {'center_z': 0.44, 'scale': 1.5},
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': SIT, 'hold': 3, 'notice': ['lower-back', 'breath']},
        {'label': 'Left heel in', 'pose': knee_in('R'), 'hold': 4, 'notice': ['hips']},
        {'label': 'Head beyond knee', 'pose': fold('R'), 'hold': 10, 'notice': ['hamstrings', 'lower-back', 'breath']},
        {'label': 'Release right clasp', 'pose': fold('R', release=True), 'hold': 3, 'notice': ['wrists']},
        {'label': 'Come up', 'pose': knee_in('R'), 'hold': 3, 'notice': ['breath']},
        {'label': 'Right heel in', 'pose': knee_in('L'), 'hold': 3, 'view': 'quarter', 'notice': ['hips']},
        {'label': 'Left side', 'pose': fold('L'), 'hold': 10, 'view': 'quarter', 'notice': ['hamstrings', 'lower-back', 'breath']},
        {'label': 'Release left clasp', 'pose': fold('L', release=True), 'hold': 3, 'view': 'quarter', 'notice': ['wrists']},
        {'label': 'Up again', 'pose': knee_in('L'), 'hold': 3, 'view': 'quarter', 'notice': ['breath']},
    ],
})
F.report()
