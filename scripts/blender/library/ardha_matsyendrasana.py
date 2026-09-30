"""
Ardha Matsyendrasana, with both sides on the library skeleton.

The seat stays beside the folded foot, the book's alternative when sitting
on it is not possible. Each knee-out stage carries the foot around the
seat; the opposite foot crosses as the arm extends beyond its knee. The
hands release to that extended position before the legs unfold. A shared
neutral seat keeps the hands clear while the second side begins.

The rear hand still reaches toward the hooked arm without a clasp. Direct
clasp targets can be within joint reach yet collide with the trunk or the
other forearm. The report records those probes and the remaining gap.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_twist', Path(__file__).resolve().parent / '_twist.py')
T = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(T)
L = T.L
L.begin('ardha_matsyendrasana', skeleton='library')

TURN = -90.0      # a right angle, to the right
LEAN = -0.3       # the trunk sits back this much (its forward lean, `L.sit`)
LEFT_KNEE = -33.0  # the left knee's heading on the mat (degrees from ahead toward the right)
LEFT_SHIN = -186.0  # the left shin's heading, folded back beside the left hip
RIGHT_FOOT = (0.25, -0.25)   # the right ankle on the mat outside the left thigh (x, y)
RIGHT_OUT = -0.4  # the right knee's lean toward its own side (-X)
HOOK_ROUND = 150.0   # the left wrist round the right knee: degrees from its front toward its outside
HOOK_Z = 0.06        # ... and this high above it
HOOK_R = 0.12        # ... this far from the knee joint
REACH_AT = (-0.13, -0.12, 0.12)  # the left wrist from the knee, stretched forward past its outside


def yaw(deg):
    """A level direction `deg` degrees from straight ahead (-Y) toward the right (-X)."""
    t = math.radians(deg)
    return (-math.sin(t), -math.cos(t), 0.0)


def knee_toward(hip, ankle, hint):
    """The knee a thigh from `hip` and a shin from `ankle`, bent toward `hint`."""
    d = L.dist(hip, ankle)
    u = L.n(L.sub(ankle, hip))
    x = (L.THIGH ** 2 - L.SHIN ** 2 + d * d) / (2 * d)
    r = math.sqrt(max(L.THIGH ** 2 - x * x, 0))
    v = L.n(L.add(hint, u, -L.dot(hint, u)))
    return L.add(L.add(hip, u, x), v, r)


def left_in(pose, shin=LEFT_SHIN, knee=L.KNEE_FLOOR):
    """The left knee forward on the mat, the shin folded back beside the
    left hip, the heel by the left buttock (the seat on the mat beside the
    foot: the book's way for those who cannot yet sit on it). `shin`/`knee`
    give the midpoint on the way: the knee lifted, the shin out to the side
    (swept straight back, the foot passes through the seat)."""
    at = L.fk(pose)
    k = L.on_floor(at['hip.L'], L.THIGH, knee, yaw(LEFT_KNEE))
    drop = knee - L.KNEE_FLOOR
    h = yaw(shin)
    run = math.sqrt(L.SHIN ** 2 - drop ** 2)
    a = (k[0] + h[0] * run, k[1] + h[1] * run, L.KNEE_FLOOR)
    L.set_leg(pose, 'L', k, a)
    d = L.n(L.sub(a, k))
    pose['foot.L'] = L.n((d[0], d[1], -0.15))
    return pose


def right_over(pose, foot=RIGHT_FOOT):
    """The right foot flat on the mat (outside the left thigh), the knee up."""
    at = L.fk(pose)
    ankle = (foot[0], foot[1], 0.09)
    knee = knee_toward(at['hip.R'], ankle, L.n((RIGHT_OUT, -0.3, 1)))
    L.set_leg(pose, 'R', knee, ankle)
    pose['foot.R'] = L.n((0.1, -1, -0.12))
    return pose


def seat(lean=LEAN, left=True, right=True):
    pose = L.sit(lean=lean)
    L.legs_forward(pose)
    if left:
        left_in(pose)
    if right:
        right_over(pose)
    return pose


def palm_out(pose, side, out=0.27, back=0.20):
    """A raised hand beside and behind the hip, ready to travel around the back."""
    sx = 1 if side == 'L' else -1
    hip = L.fk(pose)[f'hip.{side}']
    L.arm(pose, side, (hip[0] + sx * out, hip[1] + back, 0.18), (sx, 0.5, 0), (0, -1, 0))
    return pose


def hands(pose):
    """While the legs move: the left palm rides the left thigh (from the mat,
    the hand on its way round the right knee and back passes through the
    left leg), the right hand raised beside the right hip."""
    L.hand_on_thigh(pose, 'L', t=0.55, gap=0.02)
    return palm_out(pose, 'R')


def staff():
    return hands(seat(0.0, left=False, right=False))


def legs_set():
    """Both legs set, the hands as they wait."""
    return hands(seat())


def turned(deg):
    pose = seat()
    T.shoulders(pose, deg)
    pose['neck'] = L.direction(pose, 'spine.upper')
    pose['head'] = L.direction(pose, 'spine.upper')
    return pose


def behind(pose, deg, gap=0.065, up=0.08, across=0.1):
    """The right hand behind the back at the waist, reaching toward the left."""
    at = L.fk(pose)
    front = T.turn_about((0, -1, 0), (0, 0, 1), deg)
    left = T.turn_about((1, 0, 0), (0, 0, 1), deg)
    back = L.neg(front)
    w = L.add(at['waist'], (0, 0, up))
    palm = L.add(L.add(w, back, L.SKIN['waist'][1] + L.PALM_R + gap), left, across)
    hand = L.n(L.add(left, back, 0.2))
    L.arm(pose, 'R', L.add(palm, hand, -L.PALM_AT), L.n(L.add(back, (0, 0, -0.3))), hand)
    return pose


def reach_past(deg=TURN):
    """Turned to the right, the left arm stretched forward past the outside
    of the right knee, the right hand behind the back."""
    pose = turned(deg)
    k = L.fk(pose)['knee.R']
    L.arm(pose, 'L', L.add(k, REACH_AT), (-0.3, 0.2, 1), L.n((-0.25, -1, -0.1)))
    behind(pose, deg)
    return T.twist(pose, deg, gaze=-(deg + 20))


def wrap(deg=TURN):
    """The left arm hooked round the outside of the right knee, the hand
    behind it; the right hand behind the back reaching toward it."""
    pose = turned(deg)
    k = L.fk(pose)['knee.R']
    t = math.radians(HOOK_ROUND)
    wrist = L.add(k, (-HOOK_R * math.sin(t), -HOOK_R * math.cos(t), HOOK_Z))
    # the elbow swings out and forward round the knee, so the forearm wraps
    # it; the fingers point back along the outside of the thigh
    L.arm(pose, 'L', wrist, (-1, -0.5, 0.5), L.n((-0.5, 0.8, -0.2)))
    behind(pose, deg)
    return T.twist(pose, deg, gaze=-(deg + 20))


def left_only(shin=LEFT_SHIN, knee=L.KNEE_FLOOR):
    """The left leg folding (or folded), the right still long, the hands waiting."""
    pose = L.sit(lean=LEAN)
    L.legs_forward(pose)
    left_in(pose, shin, knee)
    hands(pose)
    return pose


# the knee-out midpoint reaches further to the side than the seat's frame
WIDE = {'center_z': 0.42, 'scale': 1.5}

SIT = T.open_hands(seat(0.0, left=False, right=False))
LEFT_OUT = palm_out(T.open_hands(left_only(-145.0, knee=0.26)), 'R')
LEFT_IN = left_only()
LEGS = legs_set()
REACH = reach_past()
WRAP = wrap()

POSTURE = T.check({
    'id': 'library:ardha-matsyendrasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'front',
    'frame': {**L.SEATED_FRAME, 'scale': 1.7},
    'transition': 10,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Left knee out', 'pose': LEFT_OUT, 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Right foot over, arm forward', 'pose': REACH, 'hold': 3, 'notice': ['upper-back', 'shoulders', 'breath']},
        {'label': 'Wrap right knee', 'pose': WRAP, 'hold': 8, 'notice': ['upper-back', 'lower-back', 'shoulders', 'breath']},
        {'label': 'Release right hook', 'pose': REACH, 'hold': 3, 'notice': ['upper-back', 'shoulders', 'breath']},
        {'label': 'Left leg out', 'pose': LEFT_OUT, 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Legs long', 'pose': SIT, 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Right knee out', 'pose': T.mirror(LEFT_OUT), 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Left foot over, arm forward', 'pose': T.mirror(REACH), 'hold': 3, 'notice': ['upper-back', 'shoulders', 'breath']},
        {'label': 'Wrap left knee', 'pose': T.mirror(WRAP), 'hold': 8, 'notice': ['upper-back', 'lower-back', 'shoulders', 'breath']},
        {'label': 'Release left hook', 'pose': T.mirror(REACH), 'hold': 3, 'notice': ['upper-back', 'shoulders', 'breath']},
        {'label': 'Right leg out', 'pose': T.mirror(LEFT_OUT), 'hold': 3, 'notice': ['hips', 'breath']},
    ],
})
