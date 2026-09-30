"""
Paripurna Navasana (the full boat) — library sheet, live figure only.

From the staff: the trunk reclines a little and the straight legs rise
together, the palms still on the mat; the hands come off and the arms
stretch forward level with the shoulders, palms facing, beside the thighs
— the boat, balanced on the buttocks, the feet higher than the head, held;
the hands go down and the legs come back to the mat (lying back to rest is
a step the figure does not show). Seen from the side. The seat, boat and arms come from `_seated.py`.
Shape from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_seated', Path(__file__).resolve().parent / '_seated.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('paripurna_navasana')

Y = 0.22            # the seat along the mat (the staff and the boat both stay in frame)
RECLINE = 30        # degrees the trunk leans back from upright (the pelvis rolls back 50, the chest lifts to 22)
LEGS = 62           # degrees the legs rise from the floor (the book: 60-65)

SEATED = {'center_z': 0.42, 'scale': 1.72}
BOAT = {'center_z': 0.50, 'scale': 1.45}

# the staff: arms straight, palms by the hips, back erect
STAFF = S.seat(Y)
S.staff_legs(STAFF)
S.ground(STAFF)
S.palms_down(STAFF)


def boat():
    pose = S.boat(RECLINE, LEGS, y=Y, pelvis=50, chest=22)
    return S.ground(pose)


# the trunk back and the legs up together, the palms still pressing the mat
LIFT = boat()
S.palms_down(LIFT, back=0.04, out=0.2)

# the full boat: the arms forward, level with the shoulders, outside the thighs
FULL = boat()
S.arms_forward(FULL, wide=0.05)

# the hands down again, the legs lowered to the mat
DOWN = S.seat(Y)
S.staff_legs(DOWN)
S.ground(DOWN)
S.palms_down(DOWN, back=0.06, out=0.2)

# the common mistake: the back rounds and drops toward the floor, the legs sink
_SAG = S.ground(S.boat(RECLINE + 14, LEGS - 14, y=Y, pelvis=62, chest=40))
_SAG.update({'spine.upper': L.n((0, 0.2, 1)), 'neck': L.n((0, -0.3, 1)), 'head': L.n((0, -0.45, 1))})
S.ground(_SAG)
S.arms_forward(_SAG, wide=0.05, drop=0.15)
GHOST = L.diff(_SAG, FULL)

POSTURE = S.frame_check(L.check({
    'id': 'library:paripurna-navasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'side',
    'frame': SEATED,
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': STAFF, 'hold': 4, 'notice': ['lower-back']},
        {'label': 'Legs up', 'pose': LIFT, 'hold': 4, 'frame': BOAT, 'notice': ['core', 'quads']},
        {'label': 'Full boat', 'pose': FULL, 'hold': 14, 'frame': BOAT, 'ghost': GHOST,
         'notice': ['core', 'quads', 'lower-back', 'breath']},
        {'label': 'Legs down', 'pose': DOWN, 'hold': 3, 'notice': ['core']},
    ],
}))
