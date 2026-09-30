"""
Paschimottanasana (the back of the body stretched) — library sheet, live
figure only.

From the staff (legs straight and together, palms beside the hips): the
hands take the feet with the back extended and hollowed, head up; the
elbows widen and the trunk comes down, forehead to the knees; then the
full stretch, the trunk long over the legs and the head beyond the knees,
one hand around the opposite wrist beyond the soles; up again with the back long, and back to the
staff. Side view, the face to screen-right. Shape from the book's
photographs; the stages are ours.

The library skeleton reaches the final wrist clasp beyond the soles.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_folds', Path(__file__).resolve().parent / '_folds.py')
F = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(F)
L = F.L
L.begin('paschimottanasana', skeleton='library')


def legs(pose):
    F.straight(pose, 'L')
    F.straight(pose, 'R')
    return pose


SIT = F.staff()
for s, sx in F.SIDES:
    L.arm(SIT, s, (sx * 0.27, F.SEAT[1], L.WRIST_Z), (sx, 0.5, 0), L.flat_hand((0, -1, 0)))

# the back hollowed, the head up, the big toes held (thumb and two fingers)
TOES = legs(F.sit())
F.trunk(TOES, 35, 52, 58, 30, 0)
F.clavicles(TOES, fwd=0.5, down=0.1)
for s, sx in F.SIDES:
    F.hold_foot(TOES, s, s, where=0.12, around=20, hint=(sx * 0.3, 0.3, -1), fingers=0.6, label=f'toes {s}')

# elbows wide, the forehead to the knees
DOWN = legs(F.sit())
F.trunk(DOWN, 30, 45, 75, 115, 125)
F.clavicles(DOWN, fwd=0.7, down=0.2)
for s, sx in F.SIDES:
    F.hold_foot(DOWN, s, s, where=0.07, around=35, hint=(sx, 0, -0.5), fingers=0.6, label=f'forehead {s}')

# the full stretch: one hand beside the other wrist, beyond the soles
FULL = legs(F.sit())
F.trunk(FULL, 35, 60, 105, 105, 110)
F.clavicles(FULL, fwd=0.7, down=0.2)
target = F.beyond_soles(FULL, ahead=0.025)
L.arm(FULL, 'L', L.add(target, (0.055, 0, 0.11)), (1, 0, 1), (0, -1, 0))
L.arm(FULL, 'R', L.add(target, (-0.095, 0, 0.16)), (-1, 0, 1), (1, 0, 0))

UNCLASP = {**FULL}
L.arm(UNCLASP, 'L', L.add(target, (0.20, 0.02, 0.11)), (1, 0, 1), (0, -1, 0))
L.arm(UNCLASP, 'R', L.add(target, (-0.22, 0.02, 0.16)), (-1, 0, 1), (0, -1, 0))

POSTURE = L.check({
    'id': 'library:paschimottanasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'side',
    'frame': {**F.FOLD_FRAME, 'scale': 1.65},
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': SIT, 'hold': 4, 'notice': ['lower-back', 'breath']},
        {'label': 'Take the toes', 'pose': TOES, 'hold': 5, 'notice': ['lower-back', 'hamstrings']},
        {'label': 'Forehead to knees', 'pose': DOWN, 'hold': 5, 'notice': ['hamstrings', 'shoulders']},
        {'label': 'Full stretch', 'pose': FULL, 'hold': 14, 'notice': ['hamstrings', 'lower-back', 'calves', 'breath']},
        {'label': 'Release clasp', 'pose': UNCLASP, 'hold': 3, 'notice': ['wrists']},
        {'label': 'Head up', 'pose': TOES, 'hold': 3, 'notice': ['lower-back']},
        {'label': 'Release', 'pose': SIT, 'hold': 3, 'notice': ['breath']},
    ],
})
F.report()
