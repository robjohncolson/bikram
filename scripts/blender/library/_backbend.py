"""
The backbend family's own helpers (a `_` file: never exported or previewed
as a sheet). Loaded like `_lib.py`, whose copy it shares: a module takes
`L = B.L` from here, so `L.begin(...)` names the sheet for both.

The family lies face down (the locust, the bow, the cobra, the dogs and the
staff on four limbs), kneels (the camel), sits (the upward plank) and lies
on the back (the upward bow). Every sheet is seen from the side, so each
body is placed along Y with its middle near the camera's pivot (y = 0).

Lying face down: the head toward -Y, the legs toward +Y, the rig's left on
+X. The tubes are round, so the trunk lying either way is one rotation;
the feet and hands say which way the body faces.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)

n, add, sub, dot, dist, neg, scale, cross = L.n, L.add, L.sub, L.dot, L.dist, L.neg, L.scale, L.cross

# --- lying face down ------------------------------------------------------------------
PRONE_Y = -0.16          # the pelvis joint along the mat: crown to toes centred on the pivot
PRONE_Z = 0.105          # the pelvis joint's height lying down: the belly's hull on the mat
PRONE_FRAME = {'center_z': 0.42, 'scale': 2.2}
WRIST_Z = 0.045          # a palm flat on the mat: the wrist joint this high
# the fingertips a little lower than the wrist, their joint under 3 cm: the
# live figure then treats them as a floor contact shared by two stages and
# carries them straight between (`anchorToContacts`), so a palm that stays
# put never swings through the mat on the way
FINGER_Z = 0.025


def flat_hand(f):
    """A palm flat on the mat with the fingers along `f` (horizontal), tipped
    down just enough that the fingertips rest at FINGER_Z."""
    h = n((f[0], f[1], 0))
    drop = (WRIST_Z - FINGER_Z) / L.HAND
    return n(add(scale(h, math.sqrt(1 - drop * drop)), (0, 0, -drop)))
FLAT_FOOT = n((0, 1, -0.2))     # the top of the foot on the mat, the toes pointing back


def prone(**over):
    """Face down, forehead toward the mat, arms long beside the body, legs
    long and together, the tops of the feet down. `over` replaces entries."""
    pose = {
        'pelvis.location': sub((0, PRONE_Y, PRONE_Z), L.J['pelvis']),
        'pelvis': (0, -1, 0), 'spine.lower': (0, -1, 0), 'spine.upper': (0, -1, 0),
        'neck': n((0, -1, 0.02)), 'head': n((0, -1, -0.02)),
        'clavicle.L': (1, 0, 0), 'clavicle.R': (-1, 0, 0),
        'thigh.L': n((0.02, 1, 0)), 'thigh.R': n((-0.02, 1, 0)),
        'shin.L': (0, 1, 0), 'shin.R': (0, 1, 0),
        'foot.L': FLAT_FOOT, 'foot.R': FLAT_FOOT,
    }
    arms_back(pose)
    pose.update(over)
    return pose


ARM_LEN = L.UPPER + L.FORE + L.HAND
TIP_REST = 0.035         # a fingertip resting on the mat: its joint this high


def arms_back(pose, tip=TIP_REST, out=0.12):
    """Both arms stretched back toward the feet, straight, each fanned
    `out` (sideways per unit back) from the body, pitched so the fingertip
    ends at height `tip` (on the mat by default; higher for an arm held
    off it)."""
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{s}']
        drop = max(-0.95, min(0.95, (tip - sh[2]) / ARM_LEN))
        flat = math.sqrt(1 - drop * drop)
        h = n((sx * out, 1, 0))
        d = (h[0] * flat, h[1] * flat, drop)
        pose[f'upperarm.{s}'] = d
        pose[f'forearm.{s}'] = d
        pose[f'hand.{s}'] = d
    return pose


def palms_down(pose, y, out=0.25, hint=(0, 0.6, 1), fingers=(0, -1, 0)):
    """Both palms flat on the mat at `y` along it, `out` from the midline,
    the fingers along `fingers` (toward the head by default), each elbow
    bent toward `hint` (mirrored across)."""
    for s, sx in (('L', 1), ('R', -1)):
        f = n((sx * fingers[0], fingers[1], fingers[2]))
        hand = flat_hand(f)
        wrist = (sx * out, y, WRIST_Z)
        L.arm(pose, s, wrist, (sx * hint[0], hint[1], hint[2]), hand)
    return pose


def lift_off(pose, z=None):
    """Shift the whole pose so its lowest joint (tips included) sits at `z`
    (default: on the mat)."""
    at = L.fk(pose)
    low = min(p[2] for p in at.values())
    loc = pose.get('pelvis.location', (0, 0, 0))
    pose['pelvis.location'] = add(loc, (0, 0, (0.0 if z is None else z) - low))
    return pose


def grip_ankles(pose, gap=0.012):
    """Each hand round its own ankle from outside (`_lib.hand_to_ankle`)."""
    for s in 'LR':
        L.hand_to_ankle(pose, s, gap=gap)
    return pose


TUCK_FOOT = n((0, -0.3, -1))    # toes tucked under: the foot down from the ankle onto the toes
TOE_Z = 0.022                   # a toe tip resting on the mat: its joint this high


def body_line(pose, up, head=None):
    """The trunk and both legs in one straight line rising `up` degrees
    from the feet toward the head (the staff and the plank); the head
    carries on along it unless `head` gives its own direction."""
    c, s = math.cos(math.radians(up)), math.sin(math.radians(up))
    fwd = (0, -c, s)
    trunk(pose, fwd, fwd, fwd, fwd, head or fwd)
    for side, sx in (('L', 1), ('R', -1)):
        pose[f'thigh.{side}'] = n((sx * 0.02, c, -s))
        pose[f'shin.{side}'] = n((0, c, -s))
    return pose


def rest_on_toes(pose, toe_y, feet=None):
    """Aim both feet (`feet`, else toes tucked) and shift the pose so the
    toe tips rest on the mat at `toe_y` along it."""
    for side in 'LR':
        pose[f'foot.{side}'] = feet or TUCK_FOOT
    at = L.fk(pose)
    tip = at['toes.L']
    loc = pose.get('pelvis.location', (0, 0, 0))
    pose['pelvis.location'] = add(loc, (0, toe_y - tip[1], TOE_Z - tip[2]))
    return pose


STRAIGHT = L.UPPER + L.FORE - 0.004    # a straight arm, shoulder to wrist (a hair short of locked)


def straight_arms_down(pose, out=0.25, toward=(0, 1, 0), fingers=(0, -1, 0)):
    """Straight arms from the shoulders down to palms flat on the mat, each
    wrist `out` from the midline and displaced along `toward` (horizontal)
    as far as a straight arm needs. Returns the wrist spots {'L': p, 'R': p}
    so another stage can put the hands in the same place."""
    at = L.fk(pose)
    spots = {}
    h = n((toward[0], toward[1], 0))
    for s, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{s}']
        dx = sx * out - sh[0]
        dz = WRIST_Z - sh[2]
        run = math.sqrt(max(STRAIGHT * STRAIGHT - dx * dx - dz * dz, 0.0))
        if STRAIGHT * STRAIGHT - dx * dx - dz * dz < 0:
            L._warn_reach(math.hypot(dx, dz), STRAIGHT, (sx * out, sh[1], WRIST_Z))
        wrist = (sx * out, sh[1] + h[1] * run, WRIST_Z)
        f = n((sx * fingers[0], fingers[1], fingers[2]))
        L.arm(pose, s, wrist, (sx, 0, 0), flat_hand(f))
        spots[s] = wrist
    return spots


def palms_at(pose, spots, hint=(0, 0.6, 1), fingers=(0, -1, 0)):
    """Palms flat on the mat at the given wrist spots, elbows toward `hint`."""
    for s, sx in (('L', 1), ('R', -1)):
        f = n((sx * fingers[0], fingers[1], fingers[2]))
        L.arm(pose, s, spots[s], (sx * hint[0], hint[1], hint[2]), flat_hand(f))
    return pose


def trunk(pose, pelvis, lower, upper, neck, head):
    """Set the five trunk-and-head directions at once."""
    pose.update({'pelvis': n(pelvis), 'spine.lower': n(lower), 'spine.upper': n(upper),
                 'neck': n(neck), 'head': n(head)})
    return pose


def up(deg):
    """A trunk direction toward the head (-Y) risen `deg` degrees off the mat."""
    r = math.radians(deg)
    return (0, -math.cos(r), math.sin(r))


def bisect(f, lo, hi, steps=40):
    """The x in [lo, hi] where f (monotonic there) crosses zero."""
    flo = f(lo)
    for _ in range(steps):
        mid = (lo + hi) / 2
        fm = f(mid)
        if (fm > 0) == (flo > 0):
            lo, flo = mid, fm
        else:
            hi = mid
    return (lo + hi) / 2


POINTED = n((0, 1, -0.35))      # a foot on its upper side, the toes pointing straight back


def legs_down_to(pose, deg, apart=0.0, feet=POINTED):
    """Both legs straight from the hips toward +Y, `deg` degrees below the
    level, each turned `apart` out to its own side; the feet as given."""
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    for side, sx in (('L', 1), ('R', -1)):
        pose[f'thigh.{side}'] = n((sx * apart, c, -s))
        pose[f'shin.{side}'] = n((sx * apart, c, -s))
        pose[f'foot.{side}'] = feet
    return pose


def extra_at(pose, vertex):
    """Where a foot or hand swelling (`heel.L`, `ball.R`, `palm.L`…) sits in the
    solved pose: it rides its bone rigidly (`_hull.SKIN_EXTRA`)."""
    rest, head, _, bone = L.H.SKIN_EXTRA[vertex]
    s = L.H.solve(pose)
    h, _, q = s[bone]
    return add(h, L.H.q_rot(q, sub(rest, L.H.J[head])))


# --- kneeling ---------------------------------------------------------------------------
KNEE_Y = -0.28           # the knees along the mat: the camel's arch lands over the pivot
KNEE_Z = 0.06            # a knee resting on the mat (the hull just touching)
KNEEL_FRAME = {'center_z': 0.66, 'scale': 1.75}
KNEEL_FOOT = n((0, 1, -0.06))   # the tops of the feet on the mat, the soles up


def kneel(thigh=(0, 0, -1)):
    """Kneeling on the mat facing -Y, the thighs along `thigh` (down from the
    hips; straight down = upright), the knees and feet together, the shins
    and the tops of the feet flat on the mat."""
    t = n(thigh)
    pose = {'thigh.L': t, 'thigh.R': t, 'shin.L': (0, 1, 0), 'shin.R': (0, 1, 0),
            'foot.L': KNEEL_FOOT, 'foot.R': KNEEL_FOOT}
    for s, sx in (('L', 1), ('R', -1)):
        # the arms hang a little out from the hips (at rest they brush them)
        for b in ('upperarm', 'forearm', 'hand'):
            pose[f'{b}.{s}'] = n((sx * 0.16, 0.12, -1))
    pose['pelvis.location'] = (0, 0, 0)
    knee = L.fk(pose)['knee.L']
    pose['pelvis.location'] = (0, KNEE_Y - knee[1], KNEE_Z - knee[2])
    return pose


def palms_on_trunk(pose, k=0.5, theta=80.0, hint=(1, 0.8, -0.2), fingers=None, only='LR'):
    """Each palm set ON the trunk's skin between the pelvis (k = 1) and the
    waist (k = 0), `theta` degrees round from the middle of the back toward
    the arm's own side, the fingers down along the body (or `fingers`),
    each elbow toward `hint` (mirrored) — the hands on the hips. The palm is
    lifted off the skin in steps until the hand clears the drawn hull.
    `only` = 'L' or 'R' sets one hand."""
    at = L.fk(pose)
    side, up, front = L.trunk_frame(at)
    c = add(at['waist'], sub(at['pelvis'], at['waist']), k)
    wa, wb = (x + (y - x) * k for x, y in zip(L.SKIN['waist'], L.SKIN['pelvis']))
    seg = n(sub(at['waist'], at['pelvis']))
    side = n(add(side, seg, -dot(side, seg)))
    back = n(neg(add(add(front, seg, -dot(front, seg)), side, -dot(front, side))))
    t = math.radians(theta)
    for s, sx in (('L', 1), ('R', -1)):
        if s not in only:
            continue
        surf = add(add(c, back, wb * math.cos(t)), side, sx * wa * math.sin(t))
        normal = n(add(scale(back, math.cos(t) / wb), scale(side, sx * math.sin(t) / wa)))
        hand = n(fingers or neg(seg))
        hand = n(add(hand, normal, -dot(hand, normal)))
        for lift in L.PALM_LIFTS + (0.02, 0.024):
            wrist = add(add(surf, normal, L.PALM_R + lift), hand, -L.PALM_AT)
            L.arm(pose, s, wrist, (sx * hint[0], hint[1], hint[2]), hand)
            if not L.H.clashes(pose, tol=L.PALM_SINK, only=L.HAND_PIECES[s]):
                break
    return pose


def set_toes(pose, toe_y=None, z=TOE_Z):
    """Shift the pose so the left toe tip rests on the mat (at `toe_y`
    along it when given)."""
    tip = L.fk(pose)['toes.L']
    loc = pose.get('pelvis.location', (0, 0, 0))
    dy = 0.0 if toe_y is None else toe_y - tip[1]
    pose['pelvis.location'] = add(loc, (0, dy, z - tip[2]))
    return pose
