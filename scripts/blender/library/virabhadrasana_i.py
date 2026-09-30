"""
Virabhadrasana I (warrior I) — library sheet, live figure only.

From Tadasana the arms go up and the palms join overhead; the feet spring
wide apart sideways, the body still facing the front; then the body turns
to face the right foot (the hips square to the front leg), and the right
knee bends to a right angle over the heel, the back leg straight, the
chest lifted, the head back and the eyes on the joined palms. The knee
straightens, the body turns back to the front, and the feet come
together. The heels lie on one line (the stance runs along Y) and the
feet already stand turned for the warrior (the right a quarter turn out,
the left a little in) when the legs are apart: the hips then turn on
planted feet — turned with the hips, the straight legs swing the drawn
figure 7 cm into the mat. The turn is the whole figure turned about the
vertical (`_lib.turn`, a roll of the pelvis), allowed since the
integration pass narrowed the trunk-across rule. Both sides have a separate
feet-turn stage between them. Seen from the side: the stages facing the front face on,
the warrior in profile. Shape from the book's photographs; the stages are
ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('virabhadrasana_i', skeleton='library')

STANCE = 0.61       # each ankle this far along the stance line (Y) from the middle
# the mat's FRONT is -X, toward the side camera: every stage facing the
# front is built facing -Y (the helpers' way) and turned a quarter turn
# (`_lib.turn` -90: the figure faces -X, its right foot toward +Y), so the
# book's jump shows the legs spread sideways, face on; the warriors face
# along the stance, in profile
SIDE = -90.0


def arms_joined(pose, back=0.0):
    """Arms up over the head, the palms joined, tipped `back` toward +Y."""
    return S.arms_up(pose, join=True, lean=(0, back, 1))


STAND = S.together({})
S.arms_by_thighs(STAND)
STAND = L.turn(STAND, SIDE)

# arms up shoulder-wide on the way up and down: straight from the sides to
# joined palms, the forearms swept through the hips
REACH = L.turn(S.arms_up(S.together({})), SIDE)


def lifted(pose):
    """The chest lifted and the head thrown back toward the joined palms."""
    pose.update({'pelvis': (0, 0.02, 1), 'spine.lower': L.n((0, 0.08, 1)), 'spine.upper': L.n((0, 0.2, 1)),
                 'neck': L.n((0, 0.35, 1)), 'head': L.n((0, 0.7, 0.72))})
    return pose


# the feet on the mat before the quarter turn (`sideways`): pointing the
# way the body faces, or already turned for the right warrior (the front
# foot out a quarter turn, the back foot a little in), so the hips turn on
# them — turned with the hips, the straight legs swing the drawn figure
# 7 cm into the mat on the way
FORWARD = {'R': (0, -1), 'L': (0, -1)}
FOR_RIGHT = {'R': (-1, 0), 'L': (-0.45, -0.9)}


def sideways(k, joined=True, feet=FORWARD):
    """The legs straight and spread sideways, `k` of the full stance, the feet
    on `feet` headings; palms joined overhead (or the arms up shoulder-wide)
    — then turned so the stance runs along Y."""
    ankles = {'R': (-STANCE * k, 0.0), 'L': (STANCE * k, 0.0)}
    pose = {'pelvis.location': (0, 0, 0)}
    S.arms_up(pose, join=joined)
    S.fit_pelvis(pose, {f'hip.{s}': ((ankles[s][0], ankles[s][1], S.ankle_z()), S.leg_length()) for s in 'LR'}, y=0.0)
    for s in 'LR':
        S.straight_leg(pose, s, ankles[s], feet[s])
    S.arms_up(pose, join=joined)
    return L.turn(pose, SIDE)


APART = sideways(1.0, joined=False, feet=FOR_RIGHT)
# halfway out (and back): straight legs spread from together to the full
# stance in one blend dip the drawn figure 5 cm through the mat
STEP = sideways(0.45)
# the same half step on the way back, the palms parted again so the arms can
# come down by the sides
STEP_IN = sideways(0.45, joined=False)


def warrior(front='R', bad=False):
    """The warrior facing the `front` foot: built facing -Y with that foot
    ahead; the right side then turned a half turn, to face its foot at +Y."""
    back_ = 'L' if front == 'R' else 'R'
    # the heels on one line (x = 0), so the feet stay put while the body turns;
    # the back foot turned a little in from the side, heel down
    ankles = {front: (0.0, -STANCE), back_: (0.0, STANCE)}
    feet = {front: (0, -1), back_: (0.9 if back_ == 'L' else -0.9, -0.45)}
    pose = lifted({})
    S.lunge(pose, front, ankles, feet, free='y')
    arms_joined(pose, back=0.22)
    if bad:
        # the common mistake: the back knee gives and the hips sink, the front
        # knee pushed out past the ankle
        at = L.fk(pose)
        pose['pelvis.location'] = L.add(pose['pelvis.location'], (0, -0.03, -0.07))
        L.leg(pose, front, at[f'ankle.{front}'], (0, -1, 0.2), (0, -1, 0))
        L.leg(pose, back_, at[f'ankle.{back_}'], (0, -0.3, -1), (0, -1, 0))
        for s in 'LR':
            S.flat_foot(pose, s, feet[s])
        arms_joined(pose, back=0.22)
    return L.turn(pose, 180.0) if front == 'R' else pose


APART_LEFT = sideways(1.0, joined=False, feet={'L': (1, 0), 'R': (0.45, -0.9)})
WARRIOR_LEFT = warrior('L')
WARRIOR = warrior()
GHOST = L.diff(warrior(bad=True), WARRIOR)

_AT = L.fk(WARRIOR)
GUIDES = [
    {'from': (_AT['ankle.R'][0], _AT['ankle.R'][1], 0.0), 'to': _AT['knee.R']},   # the shin upright over the heel
    {'from': _AT['knee.R'], 'to': _AT['hip.R']},                                 # the thigh level
]

POSTURE = L.check({
    'id': 'library:virabhadrasana-i',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'side',
    'frame': S.STAND_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
        {'label': 'Arms up', 'pose': REACH, 'hold': 2, 'notice': ['shoulders']},
        {'label': 'Palms joined', 'pose': STEP, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Legs apart', 'pose': APART, 'hold': 4, 'notice': ['feet', 'hips']},
        {'label': 'Warrior right', 'pose': WARRIOR, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['quads', 'hips', 'upper-back', 'breath']},
        {'label': 'Turn to the front', 'pose': APART, 'hold': 3, 'notice': ['hips']},
        {'label': 'Turn feet left', 'pose': APART_LEFT, 'hold': 3, 'notice': ['feet']},
        {'label': 'Warrior left', 'pose': WARRIOR_LEFT, 'hold': 10, 'notice': ['quads', 'hips', 'upper-back', 'breath']},
        {'label': 'Return to front', 'pose': APART_LEFT, 'hold': 3, 'notice': ['hips']},
        {'label': 'Step in', 'pose': STEP_IN, 'hold': 2, 'notice': ['shoulders']},
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
    ],
})
