"""
Maha mudra (the great seal) — library sheet, live figure only.

From the staff: the left knee bends out to the side on the mat and the
heel comes in to the perineum; the arms stretch to the right foot and hook
the big toe, the back long; the head lowers until the chin rests at the
top of the breastbone and the seal is held; up again; then the legs change
over and the seal is held over the left leg; up, and the loop returns to
the staff. As in janu sirsasana (the same seated leg), the camera watches
each side from behind its bent knee. Shape from the book's photograph; the
stages are ours. The abdominal grip and the held breath are the work the
figure cannot show (`notice`).

The ankle sits outside the heel: the rolled foot brings the heel inward
near the perineum while the bent thigh opens to a right angle.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_folds', Path(__file__).resolve().parent / '_folds.py')
F = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(F)
L = F.L
L.begin('maha-mudra', skeleton='library')

HEEL = (0.12, -0.17, 0.075)   # ankle target; the rolled heel lies 6 cm further inward


def open_knee(pose, straight_side):
    side = F.OTHER[straight_side]
    F.heel_in(pose, side, ankle=HEEL)
    # Turn the thigh outward so the knee bends above the mat on the way in.
    L.roll(pose, {f'thigh.{side}': -90 * F.SX[side]})
    return L.foot_sole(pose, side, (-F.SX[side], 0, 0.15))


def knee_in(straight_side):
    return F.heel_rest(open_knee(F.one_bent(straight_side, heel=HEEL), straight_side), straight_side)


def toe(straight_side, bowed):
    """The big toe hooked by both hands, arms straight, the back long; the
    head up (`bowed` False) or lowered into the chin lock."""
    pose = F.one_bent(straight_side, heel=HEEL)
    neck, head = (95, 150) if bowed else (34, 8)
    F.trunk(pose, 36, 48, 62, neck, head, x=F.SX[straight_side] * 0.1)
    open_knee(pose, straight_side)
    F.clavicles(pose, fwd=0.75, down=0.15)
    return F.both_hands_on(pose, straight_side, where=0.12, prefix=f"{'seal' if bowed else 'toe'} ")


SIT = F.staff()

POSTURE = L.check({
    'id': 'library:maha-mudra',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'quarter-back',
    'frame': {'center_z': 0.44, 'scale': 1.5},
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': SIT, 'hold': 3, 'notice': ['lower-back', 'breath']},
        {'label': 'Left heel in', 'pose': knee_in('R'), 'hold': 4, 'notice': ['hips']},
        {'label': 'Hook the toe', 'pose': toe('R', False), 'hold': 4, 'notice': ['lower-back', 'hamstrings']},
        {'label': 'Great seal', 'pose': toe('R', True), 'hold': 12, 'notice': ['neck', 'core', 'breath']},
        {'label': 'Come up', 'pose': knee_in('R'), 'hold': 3, 'notice': ['breath']},
        {'label': 'Right heel in', 'pose': knee_in('L'), 'hold': 3, 'view': 'quarter', 'notice': ['hips']},
        {'label': 'Left side', 'pose': toe('L', True), 'hold': 12, 'view': 'quarter', 'notice': ['neck', 'core', 'breath']},
        {'label': 'Up again', 'pose': knee_in('L'), 'hold': 3, 'view': 'quarter', 'notice': ['breath']},
    ],
})
F.report()
