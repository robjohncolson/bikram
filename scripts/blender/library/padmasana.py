"""
Padmasana (lotus) — library sheet, live figure only.

From sitting with the legs straight, one leg at a time as the book orders
it: the right knee bends and the foot is carried up and set on the left
thigh near its root, sole up; then the left foot is carried over the right
shin and set down on it, above the right thigh; the lotus held, knees on
the mat, spine erect, the backs of the wrists on the knees; and out the
same way, left foot first. Every crossing is a lifted midpoint (a straight
blend from the floor to the other thigh sweeps one shin through the other
leg). The legs come from `_lib.lotus` / `half_lotus` / `carry_foot`, in the
pelvis's own frame. Shape from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('padmasana')

UP = (0, 0, 1)   # sitting: the lap's upper face
# the palms on the mat wide of the hips while the legs cross: from there the
# arms reach the knees outside the thighs (from beside the hips they swept
# through the left thigh)
OUT = 0.3


def staff():
    """Sitting tall, legs straight and together, palms beside the hips."""
    pose = L.sit()
    L.legs_forward(pose)
    return L.palms_beside(pose, out=OUT)


SIT = staff()

# the right foot on the left thigh, the left leg still straight
HALF = L.sit()
L.legs_forward(HALF)
L.half_lotus(HALF, 'R')
L.palms_beside(HALF, out=OUT)

# on its way: the right knee bent up and out, the foot lifted over its landing
RIGHT_UP = L.sit()
L.legs_forward(RIGHT_UP)
L.carry_foot(RIGHT_UP, 'R', L.fk(HALF)['ankle.R'], UP, up=0.12, hint=(-1, -0.2, 0.8))
L.palms_beside(RIGHT_UP, out=OUT)

# the full lotus
LOTUS = L.sit()
L.lotus(LOTUS, first='R')
L.hands_on_knees(LOTUS)

# the left knee bent out onto the mat as in the lotus (the right foot riding
# on that thigh), the shin raised so the foot hangs over the right shin
LEFT_UP = {**LOTUS}
L.lift_shin(LEFT_UP, 'L', L.fk(LOTUS)['ankle.L'], UP)
L.palms_beside(LEFT_UP, out=OUT)

# the common mistake: the back slumps and the head drops forward (the
# crossed legs are the same)
_SLUMP = {**LOTUS, 'spine.lower': L.n((0, -0.25, 1)), 'spine.upper': L.n((0, -0.5, 0.9)),
          'neck': L.n((0, -0.6, 0.8)), 'head': L.n((0, -0.45, 0.9))}
L.hands_on_knees(_SLUMP)
GHOST = L.diff(_SLUMP, LOTUS)

GUIDES = [
    {'from': (0, L.SEAT[1], 0.0), 'to': (0, L.SEAT[1], 0.95)},   # the spine erect over the seat
]

POSTURE = L.check({
    'id': 'library:padmasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'front',
    'frame': L.LOTUS_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 4, 'view': 'quarter', 'frame': L.SEATED_FRAME,
         'notice': ['lower-back', 'breath']},
        {'label': 'Right foot up', 'pose': RIGHT_UP, 'hold': 4, 'notice': ['hips']},
        {'label': 'Right foot down', 'pose': HALF, 'hold': 4, 'notice': ['hips', 'feet']},
        {'label': 'Left foot over', 'pose': LEFT_UP, 'hold': 4, 'notice': ['hips']},
        {'label': 'Lotus', 'pose': LOTUS, 'hold': 14, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['hips', 'feet', 'lower-back', 'breath']},
        {'label': 'Left foot off', 'pose': LEFT_UP, 'hold': 3, 'notice': ['hips']},
        {'label': 'Right foot only', 'pose': HALF, 'hold': 3, 'notice': ['hips']},
        {'label': 'Right foot off', 'pose': RIGHT_UP, 'hold': 3, 'notice': ['hips']},
    ],
})
