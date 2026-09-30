"""
Dandasana (the staff) — library sheet, live figure only.

Sitting with the legs stretched out in front; the palms go down on the mat
by the hips, fingers toward the feet; the arms straighten and the back
comes up erect — the staff, held; then the hands come back to the thighs.
Seen from the side, where the right angle of trunk and legs reads. The
seat and arms come from `_seated.py`. Shape from the book's photograph;
the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_seated', Path(__file__).resolve().parent / '_seated.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('dandasana')

Y = 0.40   # the seat along the mat: the side view centres the whole L of the body

# the side view of a long sitting: a little wider than SEATED_FRAME
FRAME = {'center_z': 0.42, 'scale': 1.4}


def sitting(round_back=False):
    pose = S.seat(Y)
    S.staff_legs(pose)
    if round_back:
        # the back let go: the lower back sags behind the seat, the chest caves, the head drops a little
        pose.update({'pelvis': L.n((0, 0.25, 1)), 'spine.lower': L.n((0, -0.2, 1)),
                     'spine.upper': L.n((0, -0.6, 1)), 'neck': L.n((0, -0.7, 1)), 'head': L.n((0, -0.45, 1))})
    return S.ground(pose)


# arrived: legs out, the hands resting on the thighs, the back not yet lifted
SIT = sitting(round_back=True)
S.hands_on_thighs(SIT)

# the palms down by the hips, the elbows still soft, the back still low
PALMS = sitting(round_back=True)
S.palms_down(PALMS, bend=0.05)

# the staff: arms straight, palms pressing, the back erect
STAFF = sitting()
S.palms_down(STAFF)

# the hands back on the thighs, the back kept tall
REST = sitting()
S.hands_on_thighs(REST)

# the common mistake: the back slumps behind the seat while the arms press
GHOST = L.diff(PALMS, STAFF)

GUIDES = [
    {'from': (0, Y, 0.0), 'to': (0, Y, 0.95)},     # the back erect over the seat
]

POSTURE = S.frame_check(L.check({
    'id': 'library:dandasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'side',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 4, 'notice': ['hamstrings']},
        {'label': 'Palms down', 'pose': PALMS, 'hold': 4, 'notice': ['wrists']},
        {'label': 'Staff', 'pose': STAFF, 'hold': 14, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['lower-back', 'core', 'hamstrings', 'breath']},
        {'label': 'Hands to thighs', 'pose': REST, 'hold': 4, 'notice': ['lower-back']},
    ],
}))
