"""
Utthita Trikonasana (the extended triangle) — library sheet, live figure only.

From Tadasana the legs spring wide apart with the arms out at shoulder
height; the right foot turns out and the left a little in; the trunk
extends sideways over the straight right leg, the right hand down by the
ankle and the left arm straight up in one vertical line with it, the whole
body in one plane; up again, the feet turned for the left side and the
same over the left leg; up, and back to Tadasana. Seen from the front.
Shape from the book's photographs; the stages are ours.

The rig's arm reaches the right shin just above the ankle with the trunk
tilted 70 degrees — the book's first form ("the palm near the ankle"); the
palm flat on the floor, which the book gives "if possible", is out of this
rig's reach without folding the trunk out of the plane.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('utthita_trikonasana')

HALF = 0.58          # the ankles this far either side of the midline
TILT = 72.0          # the trunk's sideways tilt from upright, degrees
PELVIS_TILT = 36.0   # the pelvis tips less: the rest is the side body lengthening
FWD = (0, -1)

STAND = S.together({})
S.arms_by_thighs(STAND)


def apart(feet=None):
    """Legs wide, straight, arms out at shoulder height."""
    pose = S.wide({}, HALF, feet=feet)
    return S.arms_out(pose)


def feet_for(sd):
    return S.feet_out(sd)


tilted = S.tilted


def triangle(sd, tilt=TILT, bad=False):
    """The trunk extended sideways over the `sd` leg in the frontal plane,
    the lower hand down by that ankle, the upper arm straight up."""
    s = -1 if sd == 'R' else 1
    o = 'L' if sd == 'R' else 'R'
    d, side_l = tilted(s, tilt)
    dp, hips_l = tilted(s, PELVIS_TILT)
    pose = {}
    S.trunk(pose, d)
    # the pelvis tips with the trunk (the hip line slopes, the working hip low)
    pose['pelvis'] = dp
    pose['hipbone.L'] = L.n(L.add(hips_l, dp, -0.2))
    pose['hipbone.R'] = L.n(L.add(L.neg(hips_l), dp, -0.2))
    pose['clavicle.L'] = L.n(L.add(side_l, d, 0.2))
    pose['clavicle.R'] = L.n(L.add(L.neg(side_l), d, 0.2))
    S.straight_both(pose, {'L': (HALF, 0.0), 'R': (-HALF, 0.0)}, feet_for(sd))
    # both arms in one vertical line through the shoulders
    S.arm_line(pose, sd, (0, -0.22, -1))
    S.arm_line(pose, o, (0, 0.0, 1))
    if bad:
        # the common mistake: the chest turns down toward the floor and the
        # upper arm drifts forward with it
        pose['spine.lower'] = L.n((s * 0.75, -0.45, 0.45))
        pose['spine.upper'] = L.n((s * 0.6, -0.72, 0.3))
        pose['neck'] = L.n((s * 0.6, -0.72, 0.25))
        pose['head'] = L.n((s * 0.5, -0.85, 0.1))
        S.arm_line(pose, sd, (0, -0.35, -1))
        S.arm_line(pose, o, (0, -0.6, 0.8))
    return pose


OPEN = apart()
RIGHT_FEET = apart(feet_for('R'))
LEFT_FEET = apart(feet_for('L'))
RIGHT = triangle('R')
LEFT = triangle('L')
GHOST_R = L.diff(triangle('R', bad=True), RIGHT)
GHOST_L = L.diff(triangle('L', bad=True), LEFT)


def guides(sd):
    """The pane the whole body stays in, and the one vertical line of the arms."""
    at = L.fk(triangle(sd))
    x = at[f'shoulder.{sd}'][0]
    return [
        {'plane': 'y', 'at': 0.0, 'z': (0.0, 1.9), 'w': 2.0},
        {'from': (x, 0, 0.0), 'to': (x, 0, 1.95)},
    ]


FRAME = {'center_z': 0.95, 'scale': 2.1}

POSTURE = L.check({
    'id': 'library:utthita-trikonasana',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'front',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
        {'label': 'Legs apart', 'pose': OPEN, 'hold': 4, 'notice': ['shoulders', 'breath']},
        {'label': 'Right foot out', 'pose': RIGHT_FEET, 'hold': 3, 'notice': ['feet', 'quads']},
        {'label': 'Triangle right', 'pose': RIGHT, 'hold': 10, 'guides': guides('R'), 'ghost': GHOST_R,
         'notice': ['hamstrings', 'quads', 'hips', 'breath']},
        {'label': 'Left foot out', 'pose': LEFT_FEET, 'hold': 3, 'notice': ['feet', 'quads']},
        {'label': 'Triangle left', 'pose': LEFT, 'hold': 10, 'guides': guides('L'), 'ghost': GHOST_L,
         'notice': ['hamstrings', 'quads', 'hips', 'breath']},
        {'label': 'Up', 'pose': OPEN, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
    ],
})
