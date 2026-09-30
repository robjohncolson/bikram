"""
Baddha Konasana (the bound angle) — library sheet, live figure only.

From the staff: the knees bend out and the feet come in toward the trunk,
the hands reaching over them; the soles and heels meet and the hands take
the feet near the toes; the heels drawn in to the perineum, the thighs
widen until the knees are down, the fingers lace round the feet and the
spine stands erect — the bound angle, held; the elbows press the thighs
and the trunk folds forward, the head toward the floor; up again; the
knees come up, the feet are let go, and the legs go out straight (the loop
back). Seen from the front for the opened legs, from the side for the
staff and the fold. The legs come from `_seated.angle_legs`. Shape from
the book's photographs; the stages are ours.

The hands and the legs move in separate stages where they would cross: a
hand carried from a knee to the toes passes through the shin, and one
carried to the feet while the heels come in meets the rising heel, so the
hands wait high over the feet while the knees bend, and take the toes with
the legs still.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_seated', Path(__file__).resolve().parent / '_seated.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('baddha_konasana')

Y = 0.25            # the seat along the mat
FRONT = {'center_z': 0.40, 'scale': 1.2}     # the knees wide, from the front
SIDE = {'center_z': 0.42, 'scale': 1.6}      # the staff, from the side
FOLD_FRAME = {'center_z': 0.30, 'scale': 1.0}

# the staff, the hands resting on the thighs near the knees (from the mat
# behind the hips a hand carried to the feet passes through a rising thigh)
STAFF = S.seat(Y)
S.staff_legs(STAFF)
S.ground(STAFF)
S.hands_on_thighs(STAFF, t=0.85)

# the soles and heels together, the hands holding the feet near the toes, the
# knees still up (from the knees bent up in front, the thighs turn too far
# from their rest: the blend twists the shins round and swings the heels
# back through the pelvis)
SOLES = S.seat(Y, lean=0.3)
S.angle_legs(SOLES, ahead=0.27, ankle_x=0.075, knee_z=0.30)
S.ground(SOLES)
S.angle_legs(SOLES, ahead=0.27, ankle_x=0.075, knee_z=0.30)
S.hands_round_feet(SOLES, lace=0.09, up=0.09)

# the same legs, the hands held high over the feet, fingers forward: they
# come here from the thighs while the knees bend, clear of the rising heels
BENT = {**SOLES}
S.hands_over_feet(BENT, along=0.08, up=0.2, lace=0.1, point=(0.1, 1.0, 0.2))

# the bound angle: soles together at the perineum, knees down, the hands round the feet
BOUND = S.seat(Y, lean=0.2)
S.angle_legs(BOUND, ankle_x=0.075)
S.ground(BOUND)
S.angle_legs(BOUND, ankle_x=0.075)
S.hands_round_feet(BOUND)

# the common mistake: the knees stay up off the mat and the back rounds
_UP = S.seat(Y, lean=0.2)
_UP.update({'spine.upper': L.n((0, -0.45, 1)), 'neck': L.n((0, -0.55, 1)), 'head': L.n((0, -0.35, 1))})
S.angle_legs(_UP, ankle_x=0.075, knee_z=0.26)
S.ground(_UP)
S.angle_legs(_UP, ankle_x=0.075, knee_z=0.26)
S.hands_round_feet(_UP)
GHOST = L.diff(_UP, BOUND)


def fwd(deg):
    """A trunk direction `deg` degrees forward from upright (toward -Y)."""
    return S.back_at(-deg)


# folded forward, the elbows on the thighs, the head down toward the floor
# (searched on the hull: the crown just in front of the toes, nothing through the legs;
# the hands a little wider round the feet so the head comes down between the forearms)
FOLD = {**BOUND, 'pelvis': fwd(30), 'spine.lower': fwd(50), 'spine.upper': fwd(70), 'neck': fwd(115),
        'head': fwd(160), 'clavicle.L': L.n((1, 0, -0.1)), 'clavicle.R': L.n((-1, 0, -0.1))}
S.hands_round_feet(FOLD, lace=0.09, up=0.06)

GUIDES = [
    {'from': (0, Y, 0.0), 'to': (0, Y, 0.95)},      # the spine erect over the seat
]

POSTURE = S.frame_check(L.check({
    'id': 'library:baddha-konasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'front',
    'frame': FRONT,
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': STAFF, 'hold': 3, 'view': 'side', 'frame': SIDE, 'notice': ['lower-back']},
        {'label': 'Knees bent', 'pose': BENT, 'hold': 3, 'notice': ['hips']},
        {'label': 'Soles together', 'pose': SOLES, 'hold': 3, 'notice': ['hips', 'feet']},
        {'label': 'Bound angle', 'pose': BOUND, 'hold': 14, 'hands': 'laced', 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['hips', 'lower-back', 'breath']},
        {'label': 'Forward', 'pose': FOLD, 'hold': 8, 'hands': 'laced', 'view': 'side', 'frame': FOLD_FRAME,
         'notice': ['hips', 'lower-back']},
        {'label': 'Rise', 'pose': BOUND, 'hold': 3, 'hands': 'laced', 'notice': ['lower-back']},
        {'label': 'Knees up', 'pose': SOLES, 'hold': 2, 'notice': ['hips']},
        {'label': 'Let go', 'pose': BENT, 'hold': 2, 'notice': ['hips']},
    ],
}))
