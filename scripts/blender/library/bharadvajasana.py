"""
Bharadvajasana (the twist dedicated to the sage Bharadvaja) — library sheet,
live figure only.

From sitting with the legs straight, both knees bend and the feet go back
to the right, beside the right hip; seated on the floor, the trunk turns
about 45 degrees to the left, the straight right arm reaches across to the
outside of the left knee and the right hand slides under it onto the
floor; the left arm swings behind the back toward the right arm; the head
turns to look over the right shoulder. The book turns to the left first;
the sheet shows that side (the other is the mirror image; its step is
unbound).

On this hull the legs fold as a Z: the right shin lies back beside the
right hip, the left shin across the front, its foot out to the right in
front of the right knee (a left shin laid all the way back to the right
foot passes through the right thigh). The right leg folds first (its knee
lifted, the shin out to the side: swept straight back it passes through
the seat), and the hands move by way of the thighs and the mat, a quarter
turn at a time (an arm swung straight across passes through a thigh or the
trunk). The trunk's turn is a rolled spine (`_twist.twist`). The right
hand rests on the outside of the left thigh near the knee (the floor
under the knee is just within reach, but the arm reaching there passes
through the thigh); the left hand rests on the back of the waist, the
rig's arm ~30 cm short of the right upper arm the book has it take.
Shape from the book's photographs; the stages are ours.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_twist', Path(__file__).resolve().parent / '_twist.py')
T = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(T)
L = T.L
L.begin('bharadvajasana')

OUT = 0.3      # palms on the mat this far out from the hips while the legs move
TURN = 45.0    # the book's turn of the trunk, to the left
KNEE_T = 0.6
HALF_TURN = 20.0   # the first part of the turn, the hands on their way  # the right palm on the outside of the left thigh, this far toward the knee


def yaw(deg):
    """A level direction `deg` degrees from straight ahead (-Y) toward the right (-X)."""
    t = math.radians(deg)
    return (-math.sin(t), -math.cos(t), 0.0)


def staff():
    """Sitting tall, legs long, the palms resting on the thighs (they ride
    the thighs as the legs fold: from the mat, a hand is swept through the
    rising knee)."""
    pose = L.sit()
    L.legs_forward(pose)
    for side in 'LR':
        L.hand_on_thigh(pose, side, t=0.55)
    return pose


def knees_up(pose, reach=0.62):
    """Both knees bent up, the feet flat on the mat in front of the hips:
    the midpoint between the straight legs and the folded ones (swung
    straight across, the shins pass through each other)."""
    at = L.fk(pose)
    for side in 'LR':
        hip = at[f'hip.{side}']
        L.leg(pose, side, (hip[0], hip[1] - reach, 0.08), (0, -0.3, 1), L.n((0, -1, -0.35)))
    return pose


def z_legs(pose):
    """Both feet to the right: the right shin folded back beside the right
    hip, the left shin across the front, its foot out to the right."""
    at = L.fk(pose)
    kR = L.on_floor(at['hip.R'], L.THIGH, L.KNEE_FLOOR, yaw(33))
    aR = L.add(kR, yaw(186), L.SHIN)
    L.set_leg(pose, 'R', kR, aR)
    d = L.n(L.sub(aR, kR))
    pose['foot.R'] = L.n((d[0], d[1], -0.15))
    kL = L.on_floor(at['hip.L'], L.THIGH, L.KNEE_FLOOR, yaw(3))
    h = yaw(90)
    zL = 0.08
    run = math.sqrt(L.SHIN ** 2 - zL ** 2)
    aL = (kL[0] + h[0] * run, kL[1] + h[1] * run, L.KNEE_FLOOR + zL)
    L.set_leg(pose, 'L', kL, aL)
    d = L.n(L.sub(aL, kL))
    pose['foot.L'] = L.n((d[0], d[1], -0.15))
    return pose


def turned_axes(deg):
    """The trunk's front and its own right side once turned `deg` to the left."""
    front = T.turn_about((0, -1, 0), (0, 0, 1), deg)
    right = T.turn_about((-1, 0, 0), (0, 0, 1), deg)
    return front, right


def hand_to_knee(pose, t=None, up=0.9):
    """The straight right arm across to the left knee: the palm on the thigh
    `t` of the way to the knee, on its outer side (`up` = how far the side
    tips toward the top; large = on top of the knee). Returns the pose and
    how far the fingers still are from the floor under the knee."""
    at = L.fk(pose)
    hip, k = at['hip.L'], at['knee.L']
    sh = at['shoulder.R']
    t = KNEE_T if t is None else t
    axis = L.n(L.sub(k, hip))
    side = (1, 0, up)
    out = L.n(L.add(side, axis, -L.dot(side, axis)))
    r = L.R_HIP + (L.R_KNEE - L.R_HIP) * t
    palm = L.add(L.add(hip, L.sub(k, hip), t), out, r + L.PALM_R + 0.025)
    hand = L.n(L.add(L.neg(out), axis, 0.8))
    hand = L.n(L.add(hand, out, -L.dot(hand, out)))
    wrist = L.add(palm, hand, -L.PALM_AT)
    L.arm(pose, 'R', wrist, (-0.3, -0.5, -1), hand)
    # how far the hand would still have to go to reach the floor under the knee
    under = (k[0] + 0.02, k[1], 0.05)
    return pose, L.dist(sh, under) - (L.UPPER + L.FORE + L.HAND)


def palm_behind(pose, side='L', back=0.22, out=0.12):
    """A palm on the mat behind the hip, fingers pointing back, the arm long."""
    sx = 1 if side == 'L' else -1
    hip = L.fk(pose)[f'hip.{side}']
    L.arm(pose, side, (hip[0] + sx * out, hip[1] + back, 0.11), (sx, 0.3, 0), L.n((sx * 0.2, 1, -0.6)))
    return pose


def arm_behind(pose, deg, across=0.08, gap=0.035, up=0.04):
    """The left arm swung behind the back, the back of the hand against the
    back of the waist, reaching toward the right side."""
    at = L.fk(pose)
    front, right = turned_axes(deg)
    back = L.neg(front)
    w = L.add(at['waist'], (0, 0, up))
    r = L.SKIN['waist'][1] + L.PALM_R + gap
    palm = L.add(L.add(w, back, r), right, across)
    hand = L.n(L.add(right, back, 0.2))
    wrist = L.add(palm, hand, -L.PALM_AT)
    L.arm(pose, 'L', wrist, L.n(L.add(back, (0, 0, -0.3), 1.0)), hand)
    return pose


def twisted(deg=TURN):
    pose = z_legs(L.sit())
    T.shoulders(pose, deg)
    pose['neck'] = (0, 0, 1)
    pose['head'] = (0, 0, 1)
    pose, short = hand_to_knee(pose)
    arm_behind(pose, deg)
    T.twist(pose, deg, gaze=-(deg + 50))
    return pose, short


def turning(deg=HALF_TURN):
    """On the way round: the trunk a first part of the turn, the right palm
    on top of the left thigh, the left palm on the mat out beside the hip
    (the right arm swung straight from its own thigh to the outside of the
    left knee dips through the left thigh; the left arm swung straight from
    its thigh to behind the back passes through the trunk)."""
    pose = z_legs(L.sit())
    T.shoulders(pose, deg)
    pose['neck'] = (0, 0, 1)
    pose['head'] = (0, 0, 1)
    hand_to_knee(pose, t=0.5, up=3.0)
    at = L.fk(pose)
    hip = at['hip.L']
    L.arm(pose, 'L', (hip[0] + OUT + 0.05, hip[1] + 0.12, 0.11), (1, 0.5, 0), L.n((0.1, -0.5, -1)))
    return T.twist(pose, deg)


def right_leg(pose, shin, knee=L.KNEE_FLOOR):
    """The right knee out (as in the Z; on the mat, or lifted to `knee`),
    the shin down to the mat along yaw `shin`."""
    at = L.fk(pose)
    kR = L.on_floor(at['hip.R'], L.THIGH, knee, yaw(33))
    drop = knee - L.KNEE_FLOOR
    h = yaw(shin)
    run = math.sqrt(L.SHIN ** 2 - drop ** 2)
    aR = (kR[0] + h[0] * run, kR[1] + h[1] * run, L.KNEE_FLOOR)
    L.set_leg(pose, 'R', kR, aR)
    d = L.n(L.sub(aR, kR))
    pose['foot.R'] = L.n((d[0], d[1], -0.15))
    return pose


def one_leg(shin, knee=L.KNEE_FLOOR):
    """The right leg folding, the left still long; the right palm on its
    own thigh, the left palm beside the left hip."""
    pose = L.sit()
    L.legs_forward(pose)
    right_leg(pose, shin, knee)
    for side in 'LR':
        L.hand_on_thigh(pose, side, t=0.55)
    return pose


SIT = staff()
# the right shin swings out to the side before it folds back: swept
# straight from the front to the back it passes through the seat
RIGHT_OUT = one_leg(115, knee=0.26)
RIGHT_BACK = one_leg(186)
# the legs in the Z, the palms riding the thighs (an arm swung from the front of the body
# straight round behind the back passes through the trunk)
FEET_RIGHT = z_legs(L.sit())
for _s in 'LR':
    L.hand_on_thigh(FEET_RIGHT, _s, t=0.55, gap=0.025)
TWIST, TWIST_SHORT = twisted()
TURNING = turning()

POSTURE = T.check({
    'id': 'library:bharadvajasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'quarter-back',
    'frame': L.SEATED_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 3, 'notice': ['lower-back', 'breath']},
        {'label': 'Right knee out', 'pose': RIGHT_OUT, 'hold': 2, 'notice': ['hips']},
        {'label': 'Feet to the right', 'pose': FEET_RIGHT, 'hold': 3, 'notice': ['hips']},
        {'label': 'Hand to the knee', 'pose': TURNING, 'hold': 2, 'notice': ['upper-back']},
        {'label': 'Turn left', 'pose': TWIST, 'hold': 8, 'notice': ['upper-back', 'lower-back', 'neck']},
        {'label': 'Unwind', 'pose': TURNING, 'hold': 2, 'notice': ['breath']},
        {'label': 'Face front', 'pose': FEET_RIGHT, 'hold': 3, 'notice': ['breath']},
        {'label': 'Right leg out', 'pose': RIGHT_OUT, 'hold': 2, 'notice': ['breath']},
    ],
})
