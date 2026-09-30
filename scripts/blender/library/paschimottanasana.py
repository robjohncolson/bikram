"""
Paschimottanasana (the back of the body stretched) — library sheet, live
figure only.

From the staff (legs straight and together, palms beside the hips): the
hands take the feet with the back extended and hollowed, head up; the
elbows widen and the trunk comes down, forehead to the knees; then the
full stretch, the trunk long over the legs and the head beyond the knees,
the hands round the soles; up again with the back long, and back to the
staff. Side view, the face to screen-right. Shape from the book's
photographs; the stages are ours.

Reach: the book's last grip clasps one wrist beyond the soles. This rig's
arms stop at the soles (`_folds.SHORT`: the clasp beyond them would need
more than the arm has), so the full stage holds the soles, the book's
previous stage.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_folds', Path(__file__).resolve().parent / '_folds.py')
F = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(F)
L = F.L
L.begin('paschimottanasana')


def legs(pose):
    F.straight(pose, 'L')
    F.straight(pose, 'R')
    return pose


SIT = F.staff()

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

# the full stretch: the head beyond the knees, the palms round the soles
FULL = legs(F.sit())
F.trunk(FULL, 35, 60, 105, 105, 110)
F.clavicles(FULL, fwd=0.55, down=0.2)
for s, sx in F.SIDES:
    F.shortfall(FULL, s, F.beyond_soles(FULL), f'the book: wrist clasped beyond the soles, {s}')
    F.hold_foot(FULL, s, s, where=0.10, around=10, hint=(sx, 0, -0.4), fingers=0.5, label=f'soles {s}')

POSTURE = L.check({
    'id': 'library:paschimottanasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'side',
    'frame': F.FOLD_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': SIT, 'hold': 4, 'notice': ['lower-back', 'breath']},
        {'label': 'Take the toes', 'pose': TOES, 'hold': 5, 'notice': ['lower-back', 'hamstrings']},
        {'label': 'Forehead to knees', 'pose': DOWN, 'hold': 5, 'notice': ['hamstrings', 'shoulders']},
        {'label': 'Full stretch', 'pose': FULL, 'hold': 14, 'notice': ['hamstrings', 'lower-back', 'calves', 'breath']},
        {'label': 'Head up', 'pose': TOES, 'hold': 3, 'notice': ['lower-back']},
        {'label': 'Release', 'pose': SIT, 'hold': 3, 'notice': ['breath']},
    ],
})
F.report()
