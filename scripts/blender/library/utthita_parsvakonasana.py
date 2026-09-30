"""
Utthita Parsvakonasana (the extended side angle) — library sheet, live
figure only.

From Tadasana the legs spring wider apart than for the triangle, arms out;
the right foot turns out and the right knee bends to a right angle, the
shin upright over the ankle and the thigh level with the floor; the trunk
comes down over the thigh, the right armpit against the outside of the
knee and the right palm on the floor beside the foot, while the left arm
stretches over the left ear, so one slanting line runs from the left heel
to the left fingertips; up, the left side the same way; up, and back to
Tadasana. Seen from the front. Shape from the book's photographs; the
stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('utthita_parsvakonasana', skeleton='library')

HALF = 0.62          # the ankles either side of the midline (a wider stance than the triangle's)
TILT = 74.0          # the trunk over the bent thigh, degrees from upright
PELVIS_TILT = 40.0
CURVE = 12.0         # the spine a gentle arc, not a board (degrees either side of the tilt)
BACK = 0.14           # the trunk's plane behind the feet' line: the armpit comes down behind the knee

STAND = S.together({})
S.arms_by_thighs(STAND)


def feet_for(sd):
    return S.feet_out(sd)


def apart(feet=None):
    # a touch narrower than the lunge: the jump from feet together then never
    # dips the drawn figure through the mat on the way (the feet settle 4 cm
    # wider as the knee bends)
    return S.arms_out(S.wide({}, HALF - 0.04, feet=feet))


tilted = S.tilted


def lunge(pose, sd):
    """The `sd` knee bent to a right angle over its ankle, the other leg
    straight; the feet stay where the wide stance put them."""
    return S.lunge(pose, sd, {'L': (HALF, 0.0), 'R': (-HALF, 0.0)}, feet_for(sd))


def bent(sd):
    """The knee bent, the trunk still upright, the arms out."""
    pose = S.arms_out({})
    return lunge(pose, sd)


def side_angle(sd, tilt=TILT, ptilt=None, back=None, bad=False):
    s = -1 if sd == 'R' else 1
    o = 'L' if sd == 'R' else 'R'
    d, side_l = tilted(s, tilt)
    dp, hips_l = tilted(s, PELVIS_TILT if ptilt is None else ptilt)
    pose = {'pelvis.location': (0, BACK if back is None else back, 0)}
    S.trunk(pose, d)
    # the lower back arched up off the thigh a little, the chest reaching on
    pose['spine.lower'] = tilted(s, tilt - CURVE)[0]
    pose['spine.upper'] = tilted(s, tilt + CURVE)[0]
    pose['pelvis'] = dp
    pose['hipbone.L'] = L.n(L.add(hips_l, dp, -0.2))
    pose['hipbone.R'] = L.n(L.add(L.neg(hips_l), dp, -0.2))
    pose['clavicle.L'] = L.n(L.add(side_l, d, 0.2))
    pose['clavicle.R'] = L.n(L.add(L.neg(side_l), d, 0.2))
    lunge(pose, sd)
    at = L.fk(pose)
    # the lower palm on the mat beside the foot, on its outer (back) side
    palm = (at[f'ankle.{sd}'][0] + s * 0.07, 0.11, L.WRIST_Z + L.flat_hand((s * 0.8, 0.2, 0))[2] * L.PALM_AT)
    hand = L.flat_hand((s * 0.8, 0.2, 0))
    wrist = L.add(palm, L.n(hand), -L.PALM_AT)
    L.arm(pose, sd, wrist, (-s, 0.3, 0.2), hand)
    # the upper arm over the ear, in line with the trunk
    S.arm_line(pose, o, L.add(d, (0, 0, 0.12)))
    if bad:
        # the common mistake: the upper arm swings forward past the face
        # instead of stretching over the ear, and the head drops with it
        S.arm_line(pose, o, (s * 0.55, -0.75, 0.35))
        pose['head'] = L.n((s * 0.6, -0.5, -0.2))
    return pose


OPEN = apart()
RIGHT_BENT = bent('R')
LEFT_BENT = bent('L')
RIGHT = side_angle('R')
LEFT = side_angle('L')
GHOST_R = L.diff(side_angle('R', bad=True), RIGHT)
GHOST_L = L.diff(side_angle('L', bad=True), LEFT)


def guides(sd):
    """One slanting line from the back heel to the upper fingertips, and the
    level line of the bent thigh."""
    at = L.fk(side_angle(sd))
    o = 'L' if sd == 'R' else 'R'
    return [
        {'from': at[f'ankle.{o}'], 'to': at[f'fingers.{o}']},
        {'from': at[f'knee.{sd}'], 'to': at[f'hip.{sd}']},
    ]


FRAME = {'center_z': 0.9, 'scale': 2.5}

POSTURE = L.check({
    'id': 'library:utthita-parsvakonasana',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'front',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
        {'label': 'Legs apart', 'pose': OPEN, 'hold': 4, 'notice': ['shoulders', 'breath']},
        {'label': 'Right knee bent', 'pose': RIGHT_BENT, 'hold': 4, 'notice': ['quads', 'feet']},
        {'label': 'Side angle right', 'pose': RIGHT, 'hold': 10, 'guides': guides('R'), 'ghost': GHOST_R,
         'notice': ['quads', 'hips', 'hamstrings', 'breath']},
        {'label': 'Left knee bent', 'pose': LEFT_BENT, 'hold': 4, 'notice': ['quads', 'feet']},
        {'label': 'Side angle left', 'pose': LEFT, 'hold': 10, 'guides': guides('L'), 'ghost': GHOST_L,
         'notice': ['quads', 'hips', 'hamstrings', 'breath']},
        {'label': 'Up', 'pose': OPEN, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
    ],
})
