"""
Tree — stage poses for the mannequin rig.

Stand on one leg; the other foot is drawn up high against the standing
thigh with the knee opened out to the side and pressing down; palms meet in
prayer at the chest. Front view. The right foot lifts first (the right side
is -X), so the left leg stands.

Refined after the reference photographs (2026-09-29), to the 26 & 2 form:
the lifted foot rests on the FRONT of the standing thigh up by the hip
crease (half lotus against the leg), the knee opened out and down — it
was pressed flat to the inner thigh at mid-height; the palms now really
meet in prayer at the centre of the chest (they stood apart at the
shoulders); the holding hand reaches the foot. Leg and arms are solved
from those targets (`two_bone`).
"""
import math
import sys
from pathlib import Path


def _n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def _add(a, b, k=1.0):
    return tuple(x + k * y for x, y in zip(a, b))


def _warn_reach(dist, span, target):
    """Say so (stderr) when a reach target lies more than 1 cm beyond the
    chain: the helper clamps it, and the limb silently falls short."""
    if dist > span + 0.01:
        print(f'reach warning [{Path(__file__).stem}]: target '
              f'({target[0]:.3f}, {target[1]:.3f}, {target[2]:.3f}) is '
              f'{dist - span:.3f} m out of reach', file=sys.stderr)


def two_bone(root, target, l1, l2, hint):
    """Directions of two bones from `root` reaching `target`, the middle
    joint bent toward `hint`."""
    d = _add(target, root, -1)
    raw = math.sqrt(sum(c * c for c in d))
    _warn_reach(raw, l1 + l2, target)
    dist = min(raw, l1 + l2 - 1e-3)
    u = _n(d)
    x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    r = math.sqrt(max(l1 * l1 - x * x, 0.0))
    hu = sum(h * c for h, c in zip(hint, u))
    v = _n(_add(hint, u, -hu))
    mid = _add(_add(root, u, x), v, r)
    return _n(_add(mid, root, -1)), _n(_add(target, mid, -1))


SHIFT = 0.03   # the pelvis slides over the standing foot


def standing_shift(stand):
    s = 1 if stand == 'L' else -1
    return {'pelvis.location': (s * 0.03, 0, 0)}


def _sx(lift):
    """X sign of the LIFTED side (right is -X)."""
    return -1 if lift == 'R' else 1


def folded_leg(lift, knee_out=1.0, hint=None):
    """The lifted leg: ankle on the front of the standing thigh just below
    the hip crease, sole turned up, toes past the outer thigh; the knee
    opens out and down (`knee_out` > 1 presses it further toward the
    floor; `hint` overrides where the knee points)."""
    s = _sx(lift)
    hip = (s * 0.10 - s * SHIFT, 0, 0.98)
    ankle = (-s * 0.04 - s * SHIFT, -0.12, 0.85)
    th, sh = two_bone(hip, ankle, 0.44, 0.44, hint or (s * 0.7, -0.25, -0.75 * knee_out))
    return {
        f'thigh.{lift}': th,
        f'shin.{lift}': sh,
        f'foot.{lift}': (-s * 0.9, -0.2, 0.35),
    }


def _arm(side, shift, wrist, hint):
    """Two-bone arm from the shoulder (pelvis slid `shift` in X) to `wrist`."""
    s = 1 if side == 'L' else -1
    return two_bone((s * 0.20 + shift, 0, 1.44), wrist, 0.29, 0.25, hint)


def prayer(stand):
    """Palms pressed together at the centre of the chest, elbows out."""
    shift = SHIFT if stand == 'L' else -SHIFT
    out = {}
    for side, s in (('L', 1), ('R', -1)):
        up, fo = _arm(side, shift, (shift + s * 0.025, -0.2, 1.17), (s, 0.2, -0.6))
        out[f'upperarm.{side}'], out[f'forearm.{side}'] = up, fo
        out[f'hand.{side}'] = (-s * 0.08, -0.08, 1)
    return out


def hold_foot(lift):
    """The lifting side's hand draws the foot up into place."""
    s = _sx(lift)
    up, fo = _arm(lift, -s * SHIFT, (-s * SHIFT, -0.14, 0.95), (s, 0.1, -0.3))
    return {
        **standing_shift('L' if lift == 'R' else 'R'),
        **folded_leg(lift),
        f'upperarm.{lift}': up,
        f'forearm.{lift}': fo,
        f'hand.{lift}': (-s * 0.8, -0.2, -0.55),
    }


def tree(lift):
    return {
        **standing_shift('L' if lift == 'R' else 'R'),
        **folded_leg(lift),
        **prayer('L' if lift == 'R' else 'R'),
    }


def tree_guides(lift):
    """The plumb line up through the standing leg (the lamp post), and the
    hip line that stays level."""
    s = 1 if lift == 'R' else -1          # X sign of the standing side
    return [
        {'from': (s * 0.13, 0, 0.0), 'to': (s * 0.13, 0, 1.85)},
        {'from': (-0.42, 0, 0.98), 'to': (0.42, 0, 0.98)},
    ]


def tree_ghost(lift):
    """Common mistake: the hip stays closed -- the folded knee points
    forward instead of out and down, and that side of the pelvis hitches up."""
    s = _sx(lift)
    leg = folded_leg(lift, hint=(s * 0.2, -1, 0.1))
    return {
        'pelvis': (-s * 0.08, 0, 1),
        f'thigh.{lift}': leg[f'thigh.{lift}'],
        f'shin.{lift}': leg[f'shin.{lift}'],
    }


# Tadasana: feet together (the rig rests hip-width, so the legs angle in
# to bring the ankles side by side), arms down.
TADASANA = {
    'thigh.L': (-0.09, 0, -1), 'thigh.R': (0.09, 0, -1),
    'shin.L': (-0.07, 0, -1), 'shin.R': (0.07, 0, -1),
}

STAND = TADASANA


# "Pour your weight into the left foot": tall on the left, right heel
# just off the floor.
WEIGHT = {
    **standing_shift('L'),
    'thigh.L': (-0.09, 0, -1), 'shin.L': (-0.07, 0, -1),
    'thigh.R': (0.09, 0, -1), 'shin.R': (0.07, 0.08, -1),
    'foot.R': (0, -0.85, -0.5),
}


def press(lift):
    """The foot in place, hand still holding it, the folded knee pressed
    further out and down toward the floor."""
    return {
        **hold_foot(lift),
        **folded_leg(lift, knee_out=1.5),
    }


POSTURE = {
    'id': 'tree',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'front',
    'frame': {'center_z': 1.0, 'scale': 2.2},
    'transition': 7,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 4},
        {'label': 'Weight on one foot', 'pose': WEIGHT, 'hold': 3},
        {'label': 'Lift right foot', 'pose': hold_foot('R'), 'hold': 3},
        {'label': 'Press the knee down', 'pose': press('R'), 'hold': 4},
        {'label': 'Palms together', 'pose': tree('R'), 'hold': 9,
         'guides': tree_guides('R'), 'ghost': tree_ghost('R')},
        {'label': 'Release', 'pose': STAND, 'hold': 3},
        {'label': 'Left side', 'pose': tree('L'), 'hold': 6,
         'guides': tree_guides('L'), 'ghost': tree_ghost('L')},
        {'label': 'Release', 'pose': STAND, 'hold': 3},
    ],
}
