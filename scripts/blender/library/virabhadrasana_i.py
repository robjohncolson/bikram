"""
Virabhadrasana I (warrior I) — library sheet, live figure only.

From Tadasana the arms go up and the palms join overhead; the feet spring
wide apart and the body turns to face the right foot, the back foot turned
well in; the right knee bends to a right angle over the heel, the back leg
straight, the chest lifted, the head back and the eyes on the joined palms;
the knee straightens and the figure returns to Tadasana. Seen from the
side, right side only: the rig's trunk never turns about the vertical in
the library (no roll on a trunk bone), so the figure faces the front foot
from the start of the stance, the book's jump-and-turn drawn as one stage,
and the left side is a step without a stage. Shape from the book's
photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('virabhadrasana_i')

FRONT_Y = -0.60      # the front (right) ankle ahead of the midline
BACK_Y = 0.62        # the back (left) ankle behind it
TRACK = 0.11         # each foot this far out from the midline (the hips stay square)
ANKLES = {'R': (-TRACK, FRONT_Y), 'L': (TRACK, BACK_Y)}
FEET = {'R': (0, -1), 'L': (0.9, -0.45)}   # the back foot turned well in, heel down


def arms_joined(pose, back=0.0):
    """Arms up over the head, the palms joined, tipped `back` toward +Y."""
    return S.arms_up(pose, join=True, lean=(0, back, 1))


STAND = S.together({})
S.arms_by_thighs(STAND)

ARMS_UP = arms_joined(S.together({}))
# arms up shoulder-wide on the way up and down: straight from the sides to
# joined palms, the forearms swept through the hips
REACH = S.arms_up(S.together({}))


def lifted(pose):
    """The chest lifted and the head thrown back toward the joined palms."""
    pose.update({'pelvis': (0, 0.02, 1), 'spine.lower': L.n((0, 0.08, 1)), 'spine.upper': L.n((0, 0.2, 1)),
                 'neck': L.n((0, 0.35, 1)), 'head': L.n((0, 0.7, 0.72))})
    return pose


# the stance, legs straight (the pelvis over the midpoint between the feet)
APART = arms_joined({'pelvis.location': (0, 0, 0)})
S.fit_pelvis(APART, {'hip.R': ((ANKLES['R'][0], ANKLES['R'][1], S.ANKLE_Z), S.LEG),
                     'hip.L': ((ANKLES['L'][0], ANKLES['L'][1], S.ANKLE_Z), S.LEG)}, free='y')
for _s in 'LR':
    S.straight_leg(APART, _s, ANKLES[_s], FEET[_s])
arms_joined(APART)


def stance(ankles):
    """Legs straight to `ankles`, palms joined overhead."""
    pose = arms_joined({'pelvis.location': (0, 0, 0)})
    S.fit_pelvis(pose, {f'hip.{s}': ((ankles[s][0], ankles[s][1], S.ANKLE_Z), S.LEG) for s in 'LR'}, free='y')
    for s in 'LR':
        S.straight_leg(pose, s, ankles[s], FEET[s] if ankles is ANKLES else (0, -1))
    return arms_joined(pose)


# halfway out (and back): straight legs spread from together to the full
# stance in one blend dip the drawn figure 5 cm through the mat
STEP = stance({s: (ANKLES[s][0] * 0.6, ANKLES[s][1] * 0.45) for s in 'LR'})
# the same half step on the way back, the palms parted again so the arms can
# come down by the sides
STEP_IN = S.arms_up({k: v for k, v in STEP.items() if not k.startswith(('upperarm', 'forearm', 'hand', 'clavicle'))})


def warrior(bad=False):
    pose = lifted({})
    S.lunge(pose, 'R', ANKLES, FEET, free='y')
    arms_joined(pose, back=0.22)
    if bad:
        # the common mistake: the back knee gives and the hips sink, the front
        # knee pushed out past the ankle
        at = L.fk(pose)
        pose['pelvis.location'] = L.add(pose['pelvis.location'], (0, -0.03, -0.07))
        L.leg(pose, 'R', at['ankle.R'], (0, -1, 0.2), (0, -1, 0))
        L.leg(pose, 'L', at['ankle.L'], (0, -0.3, -1), (0, -1, 0))
        for s in 'LR':
            S.flat_foot(pose, s, FEET[s])
        arms_joined(pose, back=0.22)
    return pose


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
        {'label': 'Warrior', 'pose': WARRIOR, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['quads', 'hips', 'upper-back', 'breath']},
        {'label': 'Knee straight', 'pose': APART, 'hold': 3, 'notice': ['hips']},
        {'label': 'Step in', 'pose': STEP_IN, 'hold': 2, 'notice': ['shoulders']},
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
    ],
})
