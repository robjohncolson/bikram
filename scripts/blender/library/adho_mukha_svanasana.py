"""
Adho Mukha Svanasana (downward-facing dog) — library sheet, live figure only.

Face down, the feet a foot apart, the palms beside the chest; the trunk
rises on straight arms, the head moves in toward the feet and the crown
rests on the mat, the legs straight and the heels and soles flat; then the
head lifts, the trunk stretches forward and the body lowers to the mat.
Shape from the book's photographs (side and back); the stages are ours.

This rig's trunk is short for its legs: with the crown on the mat the hips
cannot rise as high as the photograph's, so the legs slope more gently.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_backbend', Path(__file__).resolve().parent / '_backbend.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)
L = B.L
L.begin('adho-mukha-svanasana', skeleton='library')

APART = 0.06        # the feet about a foot apart
OUT = 0.25
HAND_Y = B.PRONE_Y - 0.25      # the palms beside the chest
FEET_X = 0.135                 # the ankles as far apart as the tucked feet were
CROWN_Z = 0.008                # the crown's skin ends at its vertex: on the mat
STAND_FOOT = L.REST['foot.L']  # a foot flat on the mat, as standing


def lying():
    pose = B.prone()
    for s, sx in (('L', 1), ('R', -1)):
        pose[f'thigh.{s}'] = L.n((sx * APART, 1, 0))
    return pose


def dog(trunk_deg, head=((0, 0.05, -1), (0, 0.15, -1)), crown=True):
    """The inverted V: the trunk straight, sloping `trunk_deg` below the level
    from the hips down toward the head, the crown on the mat (or, with
    `crown` False, the head lifted in line with the trunk), straight arms to
    the palms at HAND_Y, straight legs down to flat feet."""
    c, s = math.cos(math.radians(trunk_deg)), math.sin(math.radians(trunk_deg))
    t = (0, -c, -s)
    pose = B.trunk({}, t, t, t, head[0], head[1])
    pose.update({'clavicle.L': L.n((1, 0.1, 0.1)), 'clavicle.R': L.n((-1, 0.1, 0.1)),
                 'hipbone.L': (1, 0, 0), 'hipbone.R': (-1, 0, 0)})
    L.place(pose, 'crown', (0, 0, CROWN_Z))
    sh = L.fk(pose)['shoulder.L']
    run = math.sqrt(max(B.straight() ** 2 - (OUT - sh[0]) ** 2 - (B.WRIST_Z - sh[2]) ** 2, 0.0))
    # slide the whole body so the straight arm lands on the palm's spot
    pose['pelvis.location'] = L.add(pose['pelvis.location'], (0, HAND_Y + run - sh[1], 0))
    spots = {'L': (OUT, HAND_Y, B.WRIST_Z), 'R': (-OUT, HAND_Y, B.WRIST_Z)}
    B.palms_at(pose, spots, hint=(1, 0, 0))
    at = L.fk(pose)
    for side, sx in (('L', 1), ('R', -1)):
        hip = at[f'hip.{side}']
        dx = sx * FEET_X - hip[0]
        ankle = (sx * FEET_X, hip[1] + math.sqrt(max((L.THIGH + L.SHIN - 0.004) ** 2 - (hip[2] - 0.10) ** 2 - dx * dx, 0)), 0.10)
        L.leg(pose, side, ankle, (0, -1, 0.3), STAND_FOOT)
    return pose


# the palms beside the chest, the toes tucked under ready to take the feet
PALMS = lying()
for _s in 'LR':
    PALMS[f'shin.{_s}'] = L.n((0, 1, 0.22))
    PALMS[f'foot.{_s}'] = B.TUCK_FOOT
B.palms_down(PALMS, HAND_Y, OUT, (0, 0.35, 1))

TOE_Y = L.fk(PALMS)['toes.L'][1]


def arms_straight(up):
    """The body in one line on the palms and tucked toes, pivoted up about
    the toes `up` degrees (the arms straighten, lifting the trunk)."""
    pose = B.body_line({}, up, head=L.n((0, -1, -0.1)))
    for s, sx in (('L', 1), ('R', -1)):
        pose[f'thigh.{s}'] = L.n(L.add(pose[f'thigh.{s}'], (sx * APART, 0, 0)))
    return B.rest_on_toes(pose, TOE_Y)


def arm_gap(up):
    sh = L.fk(arms_straight(up))['shoulder.L']
    return L.dist(sh, (OUT, HAND_Y, B.WRIST_Z)) - B.straight()


# the arms straightened: the body lifts in one line on the palms and tucked
# toes (from here the hips go up; lying straight into the dog, the pelvis-
# rooted blend swung the legs through the mat)
PLANK = arms_straight(B.bisect(arm_gap, 3.0, 40.0))
B.palms_down(PLANK, HAND_Y, OUT, (1, 0, 0))

# the trunk's slope that sets the toes down where they were tucked: the live
# figure then keeps them in place as the hips go up
DOG = dog(B.bisect(lambda a: L.fk(dog(a))['toes.L'][1] - TOE_Y, 45.0, 85.0))

_pat = L.fk(PLANK)
PLANK_ANKLES = {s: _pat[f'ankle.{s}'] for s in 'LR'}
WRIST_L = (OUT, HAND_Y, B.WRIST_Z)


def half_v(a):
    """Halfway between the straight line and the dog: the trunk sloping `a`
    degrees down toward the head, the head in line with it, straight arms to
    the palms and straight legs to the tucked toes, all where they were."""
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
    t = (0, -c, -s)
    pose = B.trunk({}, t, t, t, t, t)
    pose['pelvis.location'] = (0, 0.0, -0.5)

    def err(p):
        pose['pelvis.location'] = p
        at = L.fk(pose)
        return (L.dist(at['hip.L'], PLANK_ANKLES['L']) - (L.THIGH + L.SHIN - 0.004),
                L.dist(at['shoulder.L'], WRIST_L) - B.straight())
    p = list(pose['pelvis.location'])
    for _ in range(30):
        e = err(tuple(p))
        if abs(e[0]) + abs(e[1]) < 1e-6:
            break
        h = 1e-5
        ey = err((p[0], p[1] + h, p[2]))
        ez = err((p[0], p[1], p[2] + h))
        j = ((ey[0] - e[0]) / h, (ez[0] - e[0]) / h, (ey[1] - e[1]) / h, (ez[1] - e[1]) / h)
        det = j[0] * j[3] - j[1] * j[2]
        p[1] -= (e[0] * j[3] - e[1] * j[1]) / det
        p[2] -= (j[0] * e[1] - j[2] * e[0]) / det
    pose['pelvis.location'] = tuple(p)
    B.palms_down(pose, HAND_Y, OUT, (1, 0, 0))
    for side, sx in (('L', 1), ('R', -1)):
        L.leg(pose, side, PLANK_ANKLES[side], (0, -1, 0.3), B.TUCK_FOOT)
    return pose


# on the way into the dog and out of it: the hips half up, the head in line
HIPS_UP = half_v(25.0)

# the head lifts off the mat and the trunk comes forward: the hips half up again
HEAD_UP = HIPS_UP

# the common mistake: the knees bend and the heels lift off the mat
_BENT = {**DOG}
_at = L.fk(DOG)
for _s, _sx in (('L', 1), ('R', -1)):
    _a = _at[f'ankle.{_s}']
    L.leg(_BENT, _s, (_a[0], _a[1] + 0.02, 0.19), (0, -1, 0.2), L.n((0, -0.45, -1)))
GHOST = L.diff(_BENT, DOG)

DOWN = {**PALMS}

GUIDES = [
    {'from': (0, -1.0, 0.0), 'to': (0, 1.1, 0.0)},   # the mat: palms, crown, heels and soles on it
]

POSTURE = L.check({
    'id': 'library:adho-mukha-svanasana',
    'position': {'start': 'prone', 'end': 'prone'},
    'view': 'side',
    'frame': B.PRONE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Palms by the chest', 'pose': PALMS, 'hold': 5, 'notice': ['wrists', 'feet', 'breath']},
        {'label': 'Arms straight', 'pose': PLANK, 'hold': 3, 'notice': ['wrists', 'core']},
        {'label': 'Hips up', 'pose': HIPS_UP, 'hold': 3, 'notice': ['hamstrings']},
        {'label': 'Downward dog', 'pose': DOG, 'hold': 12, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['hamstrings', 'calves', 'shoulders', 'breath']},
        {'label': 'Head up', 'pose': HEAD_UP, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Forward', 'pose': PLANK, 'hold': 3, 'notice': ['core']},
        {'label': 'Down', 'pose': DOWN, 'hold': 4, 'notice': ['breath']},
    ],
})
