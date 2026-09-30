"""
Urdhva Dhanurasana (upward bow, the wheel) — library sheet, live figure only.

On the back; the knees bend and the feet come to the hips, the elbows rise
over the head and the palms go down under the shoulders, fingers toward
the feet; the trunk lifts onto the crown of the head; then the arms
straighten and the body arches up on the palms and soles; and down by
bending the knees and elbows. Shape from the book's photographs; the
stages are ours.

The lying poses are mirror-labelled (the rig's left is +X, as in FLAT), so
the soles are turned down by `foot_sole` rather than by direction alone.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_backbend', Path(__file__).resolve().parent / '_backbend.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)
L = B.L
L.begin('urdhva-dhanurasana', skeleton='library')

SHIFT = -0.22                  # the lying body moved along the mat: the wheel lands over the pivot
FEET_X = 0.12
HANDS_X = 0.21                 # the palms no wider than the shoulders
DOWN = (0, 0, -1)


def lying():
    pose = {**L.LIE}
    pose['pelvis.location'] = L.add(L.LIE['pelvis.location'], (0, SHIFT, 0))
    return pose


LIE = lying()
_at = L.fk(LIE)
ANKLES = {s: (sx * FEET_X, _at[f'hip.{s}'][1] + 0.34, 0.10) for s, sx in (('L', 1), ('R', -1))}
WRISTS = {s: (sx * HANDS_X, _at[f'shoulder.{s}'][1] - 0.10, B.WRIST_Z) for s, sx in (('L', 1), ('R', -1))}
HAND = B.flat_hand((0, 1, 0))  # the fingers toward the feet
# the sole flat, the toes toward +Y: the toe tip under 3 cm, a floor contact the
# live figure keeps in place between stages
FLAT_FOOT = L.n((0, 0.87, -(0.10 - B.FINGER_Z) / 0.16))


def feet_down(pose, knee=(0, 1, 0.6)):
    """Both legs from the hips to the ankles by the buttocks, knees up, soles flat."""
    for s, sx in (('L', 1), ('R', -1)):
        L.leg(pose, s, ANKLES[s], (sx * 0.1, knee[1], knee[2]), FLAT_FOOT)
        L.foot_sole(pose, s, DOWN)
    return pose


def hands_down(pose, hint=(0.15, -0.35, 1)):
    for s, sx in (('L', 1), ('R', -1)):
        L.arm(pose, s, WRISTS[s], (sx * hint[0], hint[1], hint[2]), L.n(HAND))
    return pose


# Lift the arms clear of the mat before turning the palms over the shoulders.
ARMS_UP = feet_down(lying())
for _s, _sx in (('L', 1), ('R', -1)):
    L.arm(ARMS_UP, _s, L.add(WRISTS[_s], (_sx * 0.16, -0.04, 0.25)),
          (_sx * 0.15, -0.35, 1), HAND)

SET = hands_down(feet_down(lying()))


def hips_up(lift):
    """On the way up: the hips pressed up off the mat, the shoulders and the
    head still down where they lay (lying straight onto the crown, the
    pelvis-rooted blend swung the head through the mat)."""
    pose = lying()
    neck = L.fk(pose)['neck']
    B.trunk(pose, (0, -1, -lift), (0, -1, -lift * 1.1), (0, -1, -lift * 0.6), (0, -1, 0.05), (0, -1, 0))
    L.place(pose, 'neck', neck)
    return hands_down(feet_down(pose))


HIPS_UP = hips_up(B.bisect(lambda k: L.dist(L.fk(hips_up(k))['hip.L'], ANKLES['L']) - 0.62, 0.05, 1.5))


def arch(a, rise):
    """The trunk arched over the hands: `a` scales the arch, `rise` how high
    the shoulders stand over the wrists (straight arms = B.straight())."""
    def d(deg):
        r = math.radians(deg)
        return (0, -math.cos(r), math.sin(r))
    pose = B.trunk({}, d(12 * a), d(-38 * a), d(-72 * a), (0, 0.25, -0.97), (0, 0.45, -0.89))
    pose['clavicle.L'], pose['clavicle.R'] = L.n((1, 0, -0.1)), L.n((-1, 0, -0.1))
    sh = L.fk(pose)['shoulder.L']
    w = WRISTS['L']
    pose['pelvis.location'] = L.sub((sh[0], w[1] + 0.04, w[2] + rise), sh)
    return pose


def leg_room(a, rise):
    at = L.fk(arch(a, rise))
    return L.dist(at['hip.L'], ANKLES['L']) - 0.80


def on_crown(a):
    """The trunk lifted onto the crown of the head, between the hands."""
    def d(deg):
        r = math.radians(deg)
        return (0, -math.cos(r), math.sin(r))
    pose = B.trunk({}, d(10 * a), d(-30 * a), d(-65 * a), (0, 0.05, -1), (0, -0.2, -0.98))
    pose['clavicle.L'], pose['clavicle.R'] = L.n((1, 0, -0.1)), L.n((-1, 0, -0.1))
    L.place(pose, 'crown', (0, WRISTS['L'][1] + 0.02, 0.008))
    return pose


def crown_leg_room(a):
    return L.dist(L.fk(on_crown(a))['hip.L'], ANKLES['L']) - 0.70


CROWN = on_crown(B.bisect(crown_leg_room, 0.3, 2.0))
hands_down(CROWN, hint=(0.15, -1, 0.7))
feet_down(CROWN, knee=(0, 1, 0.4))

WHEEL = arch(B.bisect(lambda a: leg_room(a, B.straight() - 0.01), 0.3, 2.0), B.straight() - 0.01)
hands_down(WHEEL, hint=(1, 0, 0))
feet_down(WHEEL, knee=(0, 1, 0.3))

# Solve the hands and feet again halfway through the press, so the longer
# arms do not swing their planted fingers below the mat.
PRESS = {k: (L.scale(L.add(v, WHEEL[k]), 0.5) if k == 'pelvis.location'
             else L.n(L.add(v, WHEEL[k]))) for k, v in CROWN.items()
         if k in ('pelvis.location', 'pelvis', 'spine.lower', 'spine.upper', 'neck', 'head', 'clavicle.L', 'clavicle.R')}
hands_down(PRESS, hint=(0.6, -0.5, 0.5))
feet_down(PRESS, knee=(0, 1, 0.35))

# the common mistake: the elbows never straighten, so the arch stays low,
# hardly above the crown's height
_LOW = arch(B.bisect(lambda a: leg_room(a, 0.42), 0.3, 2.0), 0.42)
hands_down(_LOW, hint=(0.15, -1, 0.7))
feet_down(_LOW, knee=(0, 1, 0.3))
GHOST = L.diff(_LOW, WHEEL)

GUIDES = [
    {'from': (0, -1.0, 0.0), 'to': (0, 1.0, 0.0)},   # the mat: palms and soles on it
]

POSTURE = L.check({
    'id': 'library:urdhva-dhanurasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': B.PRONE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie on the back', 'pose': LIE, 'hold': 3, 'notice': ['breath']},
        {'label': 'Arms up', 'pose': ARMS_UP, 'hold': 3, 'notice': ['shoulders', 'wrists']},
        {'label': 'Hands and feet set', 'pose': SET, 'hold': 4, 'notice': ['wrists', 'feet']},
        {'label': 'Hips up', 'pose': HIPS_UP, 'hold': 3, 'notice': ['quads']},
        {'label': 'Crown down', 'pose': CROWN, 'hold': 4, 'notice': ['neck', 'breath']},
        {'label': 'Press up', 'pose': PRESS, 'hold': 3, 'notice': ['shoulders', 'wrists']},
        {'label': 'Wheel', 'pose': WHEEL, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['shoulders', 'upper-back', 'quads', 'wrists', 'breath']},
        {'label': 'Bend the arms', 'pose': PRESS, 'hold': 3, 'notice': ['wrists']},
        {'label': 'Lower', 'pose': CROWN, 'hold': 3, 'notice': ['neck']},
        {'label': 'Come down', 'pose': HIPS_UP, 'hold': 3, 'notice': ['breath']},
        {'label': 'Hips down', 'pose': SET, 'hold': 3, 'notice': ['breath']},
        {'label': 'Lift the hands', 'pose': ARMS_UP, 'hold': 3, 'notice': ['wrists']},
    ],
})
