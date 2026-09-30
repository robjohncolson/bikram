"""
Marichyasana II, the seated twist, with both sides on the library skeleton.

One foot stands beside the long opposite leg. The trunk turns, the arm
extends beyond the knee, then hooks around it. The rear hand reaches
behind the waist without a clasp. Release the hook before turning forward;
a neutral seat with hands clear of the thighs allows the other knee to rise.

The hook sits farther outside the knee so the longer fingers clear the
thigh throughout its approach. Direct clasp probes are recorded in the
family report; joint reach alone does not establish the behind-back bind.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_twist', Path(__file__).resolve().parent / '_twist.py')
T = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(T)
L = T.L
L.begin('marichyasana_ii', skeleton='library')

TURN = 90.0      # the book's turn of the spine, to the left
LEAN = -0.3      # the trunk sits back this much (its forward lean, `L.sit`)
ANKLE_X = 0.05   # the bent leg's ankle: just left of the midline, by the right thigh
ANKLE_Y = 0.40   # ... and this far in front of the hips
KNEE_OUT = 0.45  # how far the knee opens toward its own side


def bent_left(pose):
    """The left knee up, the foot flat on the mat in front of the seat,
    beside the straight right thigh."""
    at = L.fk(pose)
    hip = at['hip.L']
    ankle = (ANKLE_X, hip[1] - ANKLE_Y, 0.09)
    d = L.dist(hip, ankle)
    u = L.n(L.sub(ankle, hip))
    x = (L.THIGH ** 2 - L.SHIN ** 2 + d * d) / (2 * d)
    r = math.sqrt(max(L.THIGH ** 2 - x * x, 0))
    hint = L.n((KNEE_OUT, -0.2, 1))
    v = L.n(L.add(hint, u, -L.dot(hint, u)))
    knee = L.add(L.add(hip, u, x), v, r)
    L.set_leg(pose, 'L', knee, ankle)
    pose['foot.L'] = L.n((0.0, -1, -0.12))
    return pose


def seat(lean=LEAN, bent=True):
    pose = L.sit(lean=lean)
    L.legs_forward(pose)
    if bent:
        bent_left(pose)
    return pose


def left_palm_out(pose):
    """The left hand raised out to the side, a little behind the hip:
    clear of the knee as it rises, and the way the arm goes behind the back
    (swung straight from the front, it passes through the trunk)."""
    hip = L.fk(pose)['hip.L']
    L.arm(pose, 'L', (hip[0] + 0.27, hip[1] + 0.20, 0.18), (1, 0.5, 0), (0, -1, 0))
    return pose


def staff():
    pose = seat(0.0, bent=False)
    L.hand_on_thigh(pose, 'R', t=0.55)
    return left_palm_out(pose)


def knee_up():
    pose = seat()
    L.hand_on_thigh(pose, 'R', t=0.55)
    return left_palm_out(pose)


def turned(deg):
    pose = seat()
    T.shoulders(pose, deg)
    pose['neck'] = L.direction(pose, 'spine.upper')
    pose['head'] = L.direction(pose, 'spine.upper')
    return pose


def palm_back(pose, back=0.36, out=0.06):
    """The left palm on the mat behind the seat, fingers pointing back."""
    hip = L.fk(pose)['hip.L']
    L.arm(pose, 'L', (hip[0] + out, hip[1] + back, 0.11), (1, 0.3, 0), L.n((0.1, 1, -0.6)))
    return pose


def reach_past(deg=TURN):
    """The spine turned, the right arm over the left thigh and stretched
    forward past the outside of the knee, the left arm already behind the
    back."""
    pose = turned(deg)
    k = L.fk(pose)['knee.L']
    L.arm(pose, 'R', L.add(k, REACH_AT), (0.3, 0.2, 1), L.n((0.25, -1, -0.1)))
    behind(pose, deg)
    return T.twist(pose, deg, gaze=-(deg - 20))


def wrap(deg=TURN):
    """The right arm hooked round the outside of the knee, the hand behind
    it; the left arm swung behind the back toward it."""
    pose = turned(deg)
    k = L.fk(pose)['knee.L']
    t = math.radians(HOOK_ROUND)
    wrist = L.add(k, (HOOK_R * math.sin(t), -HOOK_R * math.cos(t), -0.03))
    hand = L.n((-math.cos(t) * 0.3 - math.sin(t), math.cos(t) * 0.3 + math.sin(t) * 0.8, -0.2))
    # the elbow swings out and forward round the knee, so the forearm wraps it
    L.arm(pose, 'R', wrist, (1, -0.5, 0.5), hand)
    behind(pose, deg)
    return T.twist(pose, deg, gaze=-(deg - 20))


def behind(pose, deg, gap=0.065, up=0.08, across=0.1):
    """The left hand behind the back at the waist, reaching toward the right."""
    at = L.fk(pose)
    front = T.turn_about((0, -1, 0), (0, 0, 1), deg)
    right = T.turn_about((-1, 0, 0), (0, 0, 1), deg)
    back = L.neg(front)
    w = L.add(at['waist'], (0, 0, up))
    palm = L.add(L.add(w, back, L.SKIN['waist'][1] + L.PALM_R + gap), right, across)
    hand = L.n(L.add(right, back, 0.2))
    L.arm(pose, 'L', L.add(palm, hand, -L.PALM_AT), L.n(L.add(back, (0, 0, -0.3))), hand)
    return pose


REACH_AT = (0.1, -0.25, -0.05)   # the right wrist from the knee: forward and outside it
HOOK_ROUND = 150.0   # the right wrist round the knee: degrees from its front, toward its outside
HOOK_R = 0.14        # ... this far from the knee joint

SIT = T.open_hands(seat(0.0, bent=False))
KNEE_UP = knee_up()
REACH = reach_past()
WRAP = wrap()

POSTURE = T.check({
    'id': 'library:marichyasana-ii',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'front',
    'frame': L.SEATED_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Left knee up', 'pose': KNEE_UP, 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Arm past left knee', 'pose': REACH, 'hold': 3, 'notice': ['upper-back', 'shoulders', 'breath']},
        {'label': 'Wrap left knee', 'pose': WRAP, 'hold': 8, 'notice': ['upper-back', 'lower-back', 'shoulders', 'breath']},
        {'label': 'Unwrap left knee', 'pose': REACH, 'hold': 3, 'notice': ['upper-back', 'shoulders', 'breath']},
        {'label': 'Face front', 'pose': KNEE_UP, 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Legs long', 'pose': SIT, 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Right knee up', 'pose': T.mirror(KNEE_UP), 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Arm past right knee', 'pose': T.mirror(REACH), 'hold': 3, 'notice': ['upper-back', 'shoulders', 'breath']},
        {'label': 'Wrap right knee', 'pose': T.mirror(WRAP), 'hold': 8, 'notice': ['upper-back', 'lower-back', 'shoulders', 'breath']},
        {'label': 'Unwrap right knee', 'pose': T.mirror(REACH), 'hold': 3, 'notice': ['upper-back', 'shoulders', 'breath']},
        {'label': 'Face front again', 'pose': T.mirror(KNEE_UP), 'hold': 3, 'notice': ['hips', 'breath']},
    ],
})
