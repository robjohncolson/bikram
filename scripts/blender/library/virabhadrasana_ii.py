"""
Virabhadrasana II (warrior II) — library sheet, live figure only.

From Tadasana the legs spring wide apart, arms out at shoulder height; the
right foot turns out and the left a little in; the right knee bends to a
right angle, the shin upright over the heel and the thigh level, while the
trunk stays upright between the legs and the arms stretch out to either
side as if pulled apart; up, the feet turned for the left side and the
same to the left; up, and back to Tadasana. Seen from the front. Shape
from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('virabhadrasana_ii', skeleton='library')

HALF = 0.62          # the lunge's ankles either side of the midline
APART = HALF - 0.04  # the straight-legged stance, a touch narrower (the drawn jump never dips through the mat)

STAND = S.together({})
S.arms_by_thighs(STAND)


def apart(feet=None):
    return S.arms_out(S.wide({}, APART, feet=feet))


def warrior(sd, bad=False):
    """The `sd` knee bent to a right angle over its heel, the other leg
    straight, the trunk upright and the arms level."""
    s = -1 if sd == 'R' else 1
    pose = S.arms_out({})
    if bad:
        # the common mistake: the trunk leans out over the bent knee (the
        # hips and the back no longer in one line) and the arms tip with it
        d, side_l = S.tilted(s, 14)
        S.trunk(pose, d)
        pose['clavicle.L'] = L.n(L.add(side_l, d, 0.12))
        pose['clavicle.R'] = L.n(L.add(L.neg(side_l), d, 0.12))
        S.arm_line(pose, 'L', side_l)
        S.arm_line(pose, 'R', L.neg(side_l))
    S.lunge(pose, sd, {'L': (HALF, 0.0), 'R': (-HALF, 0.0)}, S.feet_out(sd))
    return pose


OPEN = apart()
RIGHT_FEET = apart(S.feet_out('R'))
LEFT_FEET = apart(S.feet_out('L'))
RIGHT = warrior('R')
LEFT = warrior('L')
GHOST_R = L.diff(warrior('R', bad=True), RIGHT)
GHOST_L = L.diff(warrior('L', bad=True), LEFT)


def guides(sd):
    """The level of the bent thigh, the upright shin over the heel, and the
    one line of the arms."""
    at = L.fk(warrior(sd))
    o = 'L' if sd == 'R' else 'R'
    return [
        {'from': at[f'knee.{sd}'], 'to': at[f'hip.{sd}']},
        {'from': (at[f'ankle.{sd}'][0], 0, 0.0), 'to': at[f'knee.{sd}']},
        {'from': at[f'fingers.{sd}'], 'to': at[f'fingers.{o}']},
    ]


FRAME = {'center_z': 0.9, 'scale': 2.2}

POSTURE = L.check({
    'id': 'library:virabhadrasana-ii',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'front',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
        {'label': 'Legs apart', 'pose': OPEN, 'hold': 4, 'notice': ['shoulders', 'breath']},
        {'label': 'Right foot out', 'pose': RIGHT_FEET, 'hold': 3, 'notice': ['feet', 'hamstrings']},
        {'label': 'Warrior right', 'pose': RIGHT, 'hold': 10, 'guides': guides('R'), 'ghost': GHOST_R,
         'notice': ['quads', 'hamstrings', 'shoulders', 'breath']},
        {'label': 'Left foot out', 'pose': LEFT_FEET, 'hold': 3, 'notice': ['feet', 'hamstrings']},
        {'label': 'Warrior left', 'pose': LEFT, 'hold': 10, 'guides': guides('L'), 'ghost': GHOST_L,
         'notice': ['quads', 'hamstrings', 'shoulders', 'breath']},
        {'label': 'Up', 'pose': OPEN, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
    ],
})
