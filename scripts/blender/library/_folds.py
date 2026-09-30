"""
The seated forward folds' own helpers (a `_` file: never exported or
previewed as a sheet): maha mudra, janu sirsasana, trianga mukhaikapada
paschimottanasana, marichyasana I, upavistha konasana, paschimottanasana.
Loads `_lib.py` (as `L`) and adds nothing to it; a module takes both:

    F = <load _folds.py>;  L = F.L;  L.begin('<id>')

The folds sit further back on the mat than `_lib.SEAT` (`SEAT`): seen from
the side the camera pivots on the Z axis, and the hips behind and the hands
at the feet in front must both stay inside the square. `FOLD_FRAME` is that
side view.

REACH. The rig's arms are a hand short of what the book asks of a deep fold
(the wrists clasped beyond the soles). `reach` never asks a limb for more
than it has: a wrist target beyond the arm is pulled back along its line to
the arm's full length, and the shortfall is kept in `SHORT` (printed only
with FOLDS_REPORT=1, so a clean module stays silent).
"""
import importlib.util
import math
import os
import sys
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)

n, add, sub, dot, dist, scale, cross = L.n, L.add, L.sub, L.dot, L.dist, L.scale, L.cross

SEAT = (0, 0.35, 0.10)                          # the pelvis joint sitting, the hips' hull on the mat
FOLD_FRAME = {'center_z': 0.42, 'scale': 1.45}  # the whole fold from the side
SPAN = L.UPPER + L.FORE                         # shoulder to wrist, straight
R_BALL = max(L.H.SKIN_FIT['ball'])
SIDES = (('L', 1), ('R', -1))
SX = {'L': 1, 'R': -1}
OTHER = {'L': 'R', 'R': 'L'}
SHORT = {}   # what a clamped reach fell short by: {label: metres}


def report():
    """Print the reach shortfalls (FOLDS_REPORT=1 only: the checks stay silent)."""
    if os.environ.get('FOLDS_REPORT'):
        for k, v in SHORT.items():
            print(f'short [{L._who[0]}] {k}: {v * 100:.1f} cm', file=sys.stderr)


def ang(deg, x=0.0):
    """A direction `deg` degrees forward (-Y) from straight up, tipped `x` toward +X."""
    a = math.radians(deg)
    return n((x, -math.sin(a), math.cos(a)))


def sit(at=SEAT):
    return L.sit(at=at)


def trunk(pose, pelvis, lower, upper, neck, head, x=0.0):
    """The trunk from the seat: each bone `deg` forward of vertical (`ang`),
    all tipped `x` toward +X (the mannequin's left) — a fold over one leg."""
    for bone, d in (('pelvis', pelvis), ('spine.lower', lower), ('spine.upper', upper), ('neck', neck), ('head', head)):
        pose[bone] = ang(d, x)
    return pose


def straight(pose, side, splay=0.0):
    """One leg straight along the mat from its hip, turned `splay` (a
    fraction, like `legs_forward`'s `apart`) out to its own side, toes up."""
    sx = SX[side]
    d = n((sx * (splay - 0.02), -1, 0))
    pose[f'thigh.{side}'] = d
    pose[f'shin.{side}'] = d
    pose[f'foot.{side}'] = n(add(scale(d, 0.35), (0, 0, 1)))
    return pose


def heel_in(pose, side, out=(1.0, 0.0, 0.0), ankle=None, foot=None):
    """One knee bent out to its own side ON the mat and the heel drawn in to
    the perineum, the sole turned against the other (straight) thigh:
    janu sirsasana's and maha mudra's folded leg. `out` (for the left leg;
    mirrored for the right) says where the knee goes: straight out to the
    side is the right angle of maha mudra, out and back the obtuse angle of
    janu sirsasana. `ankle` overrides the heel's place (x for the left leg)."""
    sx = SX[side]
    hip = L.fk(pose)[f'hip.{side}']
    ax, ay, az = ankle or (0.035, -0.19, 0.075)
    a = (sx * ax, SEAT[1] + ay, az)
    knee = L.knee_on(hip, a, (0, 0, 1), L.KNEE_FLOOR, n((sx * out[0], out[1], out[2])))
    L.set_leg(pose, side, knee, a)
    fx, fy, fz = foot or (-0.3, -1.0, -0.12)
    return L.foot_sole(pose, side, (-sx, 0, 0.15), n((sx * fx, fy, fz)))


def folded_back(pose, side, out=0.3, knee_in=0.0):
    """One leg folded back beside its hip (trianga mukhaikapada
    paschimottanasana): the thigh along the mat in front, the knee down,
    the shin laid back along the OUTER side of the thigh (`out` of it
    turned out, so the calf lies against the thigh, not through it), the
    foot pointing back, its sole up and the toes on the mat."""
    sx = SX[side]
    hip = L.fk(pose)[f'hip.{side}']
    knee = L.on_floor(hip, L.THIGH, L.KNEE_FLOOR, (-sx * knee_in, -1, 0))
    pose[f'thigh.{side}'] = n(sub(knee, hip))
    pose[f'shin.{side}'] = n((sx * out, 1, 0))
    return L.foot_sole(pose, side, (0, 0, 1), n((sx * out * 0.5, 1, -0.3)))


def shin_up(pose, side, out=0.3, knee_in=0.0):
    """The way into a leg folded back: the thigh already down along the mat
    as it will stay, the shin raised upright (a little out), the foot
    pointing back — so the shin swings up and then back down outside the
    thigh, never through the hips."""
    sx = SX[side]
    folded_back(pose, side, out=out, knee_in=knee_in)
    pose[f'shin.{side}'] = n((sx * out * 0.6, 0.25, 1))
    return L.foot_sole(pose, side, (0, 0, 1), n((sx * out * 0.4, 1, 0.2)))


def knee_up(pose, side, ankle=(0.16, -0.23, 0.085), out=0.35):
    """One knee drawn up, the sole flat on the mat in front of its hip
    (`ankle` for the left leg; mirrored), the knee over the foot, a little
    out to its side: marichyasana I's leg, and the way into a leg folded back."""
    sx = SX[side]
    a = (sx * ankle[0], SEAT[1] + ankle[1], ankle[2])
    L.leg(pose, side, a, (sx * out, -0.4, 1), (0, -1, -0.12))
    return pose


def clavicles(pose, fwd=0.45, down=0.1, only='LR'):
    """The shoulders drawn forward (a fold reaching for the feet)."""
    for s, sx in SIDES:
        if s in only:
            pose[f'clavicle.{s}'] = n((sx, -fwd, -down))
    return pose


def reach(pose, side, wrist, hint, hand, label=None):
    """Aim one arm at a wrist target, never past the arm's length: a target
    out of reach is taken along its line as far as the arm goes and the
    shortfall kept under `label` in `SHORT`. Returns the shortfall (m)."""
    sh = L.fk(pose)[f'shoulder.{side}']
    d = dist(sh, wrist)
    short = max(0.0, d - (SPAN - 0.002))
    if short > 0:
        wrist = add(sh, n(sub(wrist, sh)), SPAN - 0.002)
    L.arm(pose, side, wrist, hint, n(hand))
    if label is not None:
        SHORT[label] = short
    return short


def shortfall(pose, side, wrist, label):
    """Record (not pose) how far a wrist target lies beyond the arm: the
    book's grip the figure does not take."""
    SHORT[label] = max(0.0, dist(L.fk(pose)[f'shoulder.{side}'], wrist) - SPAN)
    return SHORT[label]


def beyond_soles(pose, feet='LR', ahead=0.05):
    """Where the wrists clasp beyond the soles of `feet`: centred between
    them, `ahead` in front of the balls, at their height."""
    at = L.fk(pose)
    b = [add(at[f'ankle.{s}'], n(sub(at[f'toes.{s}'], at[f'ankle.{s}'])), 0.10) for s in feet]
    mid = scale(b[0] if len(b) == 1 else add(b[0], b[1]), 1 / len(b))
    return (mid[0], min(p[1] for p in b) - R_BALL - ahead, mid[2])


def foot_axes(pose, side):
    """(ankle, along the foot, out to the foot's own side, the sole's facing)."""
    at = L.fk(pose)
    ankle, toes = at[f'ankle.{side}'], at[f'toes.{side}']
    d = n(sub(toes, ankle))
    out = n(add((SX[side], 0, 0), d, -dot((SX[side], 0, 0), d)))
    return ankle, d, out, L.sole_facing(pose, side)


def hold_foot(pose, foot, hand, where=0.10, around=0.0, gap=0.012, hint=None, fingers=0.5, label=None, edge=None):
    """A palm against one side of a toes-up foot: the hand of the foot's own
    side on its outer edge, the other hand on its inner edge (or `edge` =
    'in' / 'out' says which), `where` along
    the foot from the ankle, turned `around` degrees from the edge toward
    the sole (positive) or the instep; the fingers wrap forward across the
    sole by `fingers`. Returns the reach shortfall."""
    ankle, d, out, sole = foot_axes(pose, foot)
    outer = (hand == foot) if edge is None else edge == 'out'
    side = out if outer else scale(out, -1)
    t = math.radians(around)
    radial = n(add(scale(side, math.cos(t)), sole, math.sin(t)))
    palm = add(add(ankle, d, where), radial, R_BALL + L.PALM_R + gap)
    fdir = n(add(add(sole, scale(side, -fingers)), d, 0.2))
    wrist = add(palm, fdir, -L.PALM_AT)
    return reach(pose, hand, wrist, hint or (SX[hand], 0.3, -1), fdir, label)


def palm_on(pose, hand, a, b, t, ra, rb, around, fdir, gap=0.012, hint=None, label=None):
    """A palm on a limb's surface (its axis `a`→`b`, hull radius `ra`→`rb`),
    `t` along it, on the side `around` (a world direction, squared to the
    limb), the fingers along `fdir`."""
    d = n(sub(b, a))
    side = n(add(around, d, -dot(around, d)))
    c = add(a, sub(b, a), t)
    palm = add(c, side, ra + (rb - ra) * t + L.PALM_R + gap)
    f = n(add(fdir, side, -dot(fdir, side)))
    wrist = add(palm, f, -L.PALM_AT)
    return reach(pose, hand, wrist, hint or (SX[hand], 0.3, -1), f, label)


def palms_down(pose, back=0.0, out=0.17, only='LR'):
    """Sitting: the palms on the mat beside the hips (`_lib.palms_beside`, one side if asked)."""
    at = L.fk(pose)
    for s, sx in SIDES:
        if s not in only:
            continue
        hip = at[f'hip.{s}']
        wrist = (hip[0] + sx * out, hip[1] + back, 0.11)
        L.arm(pose, s, wrist, (sx, 0.5, 0), n((sx * 0.1, -0.5, -1)))
    return pose


HEEL = (0.06, -0.17, 0.075)   # a heel drawn in to the perineum (the left leg's ankle; mirrored)
SPLAY = 0.1                   # the straight leg turned a little out, clear of the bent foot
INNER_GAP = 0.02              # the far hand a little off the inner edge of the foot…
INNER_AROUND = -45            # …and up on its instep side


def one_bent(straight_side, heel=HEEL):
    """Sitting upright, `straight_side` leg long, the other heel in
    (janu sirsasana, maha mudra)."""
    pose = sit()
    straight(pose, straight_side, splay=SPLAY)
    heel_in(pose, OTHER[straight_side], ankle=heel)
    return pose


def heel_rest(pose, straight_side):
    """The hands while the heel comes in: the straight leg's palm on the
    mat beside its hip, the other hand on the bent thigh near the knee."""
    palms_down(pose, only=straight_side)
    return L.hand_on_thigh(pose, OTHER[straight_side], t=0.7)


def both_hands_on(pose, foot, where=0.09, hint_down=-0.5, prefix=''):
    """Both hands on one straight leg's foot: the near hand on its outer
    edge, the far hand just off the inner edge on the instep side (the
    trunk's travel between two such stages carries the far wrist on an arc
    that would otherwise pass through the foot — the clearance check)."""
    for h, hx in SIDES:
        near = h == foot
        hold_foot(pose, foot, h, where=where, around=15 if near else INNER_AROUND, hint=(hx, 0, hint_down),
                  fingers=0.5, gap=0.012 if near else INNER_GAP, label=f'{prefix}{foot} foot, {h} hand')
    return pose


def staff():
    """Dandasana, the start of every fold: sitting tall, legs straight and
    together, palms beside the hips."""
    pose = sit()
    straight(pose, 'L')
    straight(pose, 'R')
    return palms_down(pose)
