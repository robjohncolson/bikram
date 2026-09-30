"""
Ardha Navasana (the half boat) — library sheet, live figure only.

From the staff: the fingers are laced on the back of the head just above
the neck; the trunk reclines and the straight legs rise together, low —
the half boat, the legs about a third of the way up, the crown level with
the toes, balanced on the buttocks, held; the legs come back down. Seen
from the side. The seat, boat and hands come from `_seated.py`. Shape
from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_seated', Path(__file__).resolve().parent / '_seated.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('ardha_navasana')

Y = 0.20            # the seat along the mat: the long low boat stays centred
RECLINE = 48        # the trunk back from upright (the pelvis rolls back 62, the chest 40)
LEGS = 32           # degrees the legs rise from the floor (the book: 30-35)

FRAME = {'center_z': 0.42, 'scale': 1.72}

# the staff: arms straight, palms by the hips, back erect
STAFF = S.seat(Y)
S.staff_legs(STAFF)
S.ground(STAFF)
S.palms_down(STAFF)

# sitting tall, the fingers laced behind the head, elbows wide
HANDS = S.seat(Y)
S.staff_legs(HANDS)
S.ground(HANDS)
S.hands_behind_head(HANDS)

# the half boat: the trunk back, the legs low, the crown in line with the toes
BOAT = S.ground(S.boat(RECLINE, LEGS, y=Y, pelvis=62, chest=40))
BOAT.update({'neck': L.n(L.add(S.back_at(40), (0, -0.35, 0))), 'head': L.n(L.add(S.back_at(40), (0, -0.4, 0)))})
S.hands_behind_head(BOAT)

# the common mistake: the back lets go onto the mat side, the legs sag toward it
_SAG = S.ground(S.boat(RECLINE + 12, LEGS - 12, y=Y, pelvis=72, chest=58))
S.hands_behind_head(_SAG)
GHOST = L.diff(_SAG, BOAT)

# the legs down again, the hands still behind the head
DOWN = {**HANDS}

POSTURE = S.frame_check(L.check({
    'id': 'library:ardha-navasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'side',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': STAFF, 'hold': 4, 'notice': ['lower-back']},
        {'label': 'Hands behind head', 'pose': HANDS, 'hold': 4, 'hands': 'laced', 'notice': ['shoulders']},
        {'label': 'Half boat', 'pose': BOAT, 'hold': 14, 'hands': 'laced', 'ghost': GHOST,
         'notice': ['core', 'lower-back', 'quads', 'breath']},
        {'label': 'Legs down', 'pose': DOWN, 'hold': 4, 'hands': 'laced', 'notice': ['core']},
    ],
}))
