"""
Matsyasana (the fish) — library sheet, live figure only.

From the lotus (`padmasana.py`'s crossing, right foot first) the body
lies back: down onto the elbows, then flat on the back with the crossed
legs on the mat; the chest lifts and the head drops back until the crown
rests on the mat, the hands holding the crossed legs; then the back of the
head down again, flat, up onto the elbows and back to sitting.

The book's next step, the forearms folded on the mat beyond the head, is
not drawn: the rig's forearms (0.25 m) cannot each reach the other elbow
beyond the head without crossing through each other (searched; see the
group's report), so the figure holds the arch with the hands on the legs.
The body here lies BACK from the seat (head toward +Y), not in the
library's mirror-labelled LIE (`_lotus.lying_lotus`). Shape from the
book's photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lotus', Path(__file__).resolve().parent / '_lotus.py')
LT = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LT)
L = LT.L
L.begin('matsyasana')

# sitting in the lotus, moved forward to the lying sheet's seat
LOTUS = L.hands_on_knees(L.lotus(L.sit(at=LT.BACK_SEAT), first='R'))
ELBOWS = LT.on_elbows()
FLAT = LT.arms_on_mat(LT.lying_lotus())
ARCHED = LT.hold_feet(LT.lying_lotus(LT.ARCH))

FRAME = {'center_z': 0.36, 'scale': 1.42}

POSTURE = L.check({
    'id': 'library:matsyasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'side',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lotus', 'pose': LOTUS, 'hold': 4, 'view': 'quarter', 'notice': ['hips', 'breath']},
        {'label': 'Down on the elbows', 'pose': ELBOWS, 'hold': 3, 'notice': ['core']},
        {'label': 'Lie back', 'pose': FLAT, 'hold': 4, 'notice': ['breath']},
        {'label': 'Arch onto the crown', 'pose': ARCHED, 'hold': 14,
         'notice': ['neck', 'upper-back', 'lower-back', 'breath']},
        {'label': 'Head down', 'pose': FLAT, 'hold': 4, 'notice': ['neck', 'breath']},
        {'label': 'Up on the elbows', 'pose': ELBOWS, 'hold': 3, 'notice': ['core']},
    ],
})
