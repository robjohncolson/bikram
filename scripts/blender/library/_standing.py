"""
The standing family's own helpers (a `_` file: loaded like `_lib.py`, never
exported or previewed as a sheet). Group A of the library fan-out owns it.

Every standing sheet stands on the mat with its ankle joints at the rest
height (ANKLE_Z) and its feet flat (`flat_foot`: the rest pitch, any
heading, the sole rolled to face the floor), so the heel, ball and toes
rest on the mat whatever way a foot turns. Legs are either STRAIGHT (thigh
and shin one line, from the hip down to an ankle on the mat) or BENT with
the shin upright over its ankle (the lunges). The trunk is authored first;
the legs are solved under it; `ground` then sets the pelvis height so the
standing ankles sit on the mat.

The helpers build every stance facing -Y. The postures that face the front
foot (Virabhadrasana I, Parsvottanasana) put the front foot there, the
stance along Y, seen from the side; since the integration pass their
front-facing stages are the same builds turned a quarter turn about the
vertical (`_lib.turn`), so the figure jumps apart facing the mat's front
and then turns to the foot, as the book does.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)

n, add, sub, dot, fk = L.n, L.add, L.sub, L.dot, L.fk

ANKLE_Z = L.J['ankle.L'][2]          # the rest ankle height: the flat foot's hull on the mat
LEG = L.THIGH + L.SHIN - 0.002       # a straight leg, a hair inside reach
_REST_FOOT = L.REST['foot.L']
FOOT_PITCH = _REST_FOOT[2]           # the flat foot's downward slope (heel up at the ankle, toes on the mat)
FOOT_RUN = math.hypot(_REST_FOOT[0], _REST_FOOT[1])

# the whole standing figure, arms overhead included; and the folds, closer
STAND_FRAME = {'center_z': 1.06, 'scale': 2.45}
WIDE_FRAME = {'center_z': 0.98, 'scale': 2.6}
FOLD_FRAME = {'center_z': 0.9, 'scale': 2.1}

# feet together: the knees and the ankles just touching (their hulls meet)
KNEE_X = 0.058
ANKLE_X = 0.05


def flat_foot(pose, side, heading):
    """The foot flat on the mat (the rest pitch) pointing along the horizontal
    `heading`, the sole rolled to face the floor."""
    h = n((heading[0], heading[1], 0.0))
    return L.foot_sole(pose, side, (0, 0, -1), (h[0] * FOOT_RUN, h[1] * FOOT_RUN, FOOT_PITCH))


def ground(pose, sides='LR'):
    """Shift the whole figure up or down so the lower of the standing ankles
    (`sides`) sits at ANKLE_Z."""
    at = fk(pose)
    z = min(at[f'ankle.{s}'][2] for s in sides)
    loc = pose.get('pelvis.location', (0, 0, 0))
    pose['pelvis.location'] = (loc[0], loc[1], loc[2] + ANKLE_Z - z)
    return pose


def straight_leg(pose, side, ankle_xy, heading):
    """A straight leg from its hip to the ankle at (x, y) on the mat: the hip
    height is whatever the leg's length leaves (call `hip_height_for` first
    to put the pelvis there); returns the ankle."""
    hip = fk(pose)[f'hip.{side}']
    ankle = (ankle_xy[0], ankle_xy[1], ANKLE_Z)
    d = n(sub(ankle, hip))
    pose[f'thigh.{side}'] = d
    pose[f'shin.{side}'] = d
    flat_foot(pose, side, heading)
    return ankle


def set_pelvis(pose, xy, side, ankle_xy):
    """Put the pelvis over (x, y) at the height where the `side` leg, straight,
    ends with its ankle on the mat at `ankle_xy`."""
    loc = pose.get('pelvis.location', (0, 0, 0))
    pose['pelvis.location'] = (xy[0] - L.J['pelvis'][0], xy[1] - L.J['pelvis'][1], loc[2])
    hip = fk(pose)[f'hip.{side}']
    run = math.hypot(ankle_xy[0] - hip[0], ankle_xy[1] - hip[1])
    want = ANKLE_Z + math.sqrt(max(LEG * LEG - run * run, 0.0))
    loc = pose['pelvis.location']
    pose['pelvis.location'] = (loc[0], loc[1], loc[2] + want - hip[2])
    return pose


def bent_leg(pose, side, ankle_xy, heading, hint):
    """A leg reaching the ankle at (x, y) on the mat with the knee bent toward
    `hint` (two-bone)."""
    ankle = (ankle_xy[0], ankle_xy[1], ANKLE_Z)
    L.leg(pose, side, ankle, hint, (0, -1, 0))
    flat_foot(pose, side, heading)
    return ankle


TURN_IN = 0.27       # a back foot turned in a little toward the front one (as a heading's x)


def feet_out(sd, turn_in=TURN_IN):
    """Headings for a wide stance working the `sd` side: that foot turned out
    a quarter turn, the other a little in."""
    s = -1 if sd == 'R' else 1
    o = 'L' if sd == 'R' else 'R'
    return {sd: (s, 0), o: (s * turn_in, -1)}


def tilted(s, deg):
    """A direction tipped `deg` from upright toward side `s` (-1 the
    mannequin's right, +1 its left) in the frontal plane, and the trunk's own
    left square to it (for the clavicles and hipbones of a side bend)."""
    a = math.radians(deg)
    return (s * math.sin(a), 0.0, math.cos(a)), (math.cos(a), 0.0, -s * math.sin(a))


def straight_both(pose, ankles, feet, y=0.0):
    """Both legs straight to the ankles {'L': (x, y), 'R': (x, y)} on the mat:
    the pelvis (kept at `y`) is moved across and up until each hip is exactly
    a leg's length from its ankle (Newton on the pelvis's x and height; the
    hips go wherever the pose's hipbones put them)."""
    fit_pelvis(pose, {f'hip.{s}': ((ankles[s][0], ankles[s][1], ANKLE_Z), LEG) for s in 'LR'}, y=y)
    for s in 'LR':
        straight_leg(pose, s, ankles[s], feet[s])
    return pose


def fit_pelvis(pose, reach, y=None, free='x'):
    """Move the pelvis along the `free` horizontal axis ('x' across, 'y' front
    to back) and up until each named joint is exactly its length from its
    point: `reach` = {joint: (point, length)}, two of them (Newton). The
    other horizontal coordinate stays where the pose has it (or `y`, for
    `free='x'`)."""
    loc = list(pose.get('pelvis.location', (0, 0, 0)))
    if y is not None:
        loc[1] = y - L.J['pelvis'][1]
    k = 0 if free == 'x' else 1
    items = list(reach.items())

    def put(ph, pz):
        v = list(loc)
        v[k], v[2] = ph, pz
        pose['pelvis.location'] = tuple(v)

    def err(ph, pz):
        put(ph, pz)
        at = fk(pose)
        return [L.dist(at[j], p) - ln for j, (p, ln) in items]
    px, pz = loc[k], loc[2]
    for _ in range(30):
        e = err(px, pz)
        if max(abs(v) for v in e) < 1e-7:
            break
        h = 1e-5
        ex, ez = err(px + h, pz), err(px, pz + h)
        a, b, c, d = (ex[0] - e[0]) / h, (ez[0] - e[0]) / h, (ex[1] - e[1]) / h, (ez[1] - e[1]) / h
        det = a * d - b * c
        if abs(det) < 1e-12:
            raise ValueError(f'fit_pelvis: no pelvis reaches {list(reach)}')
        px -= (d * e[0] - b * e[1]) / det
        pz -= (-c * e[0] + a * e[1]) / det
    if max(abs(v) for v in err(px, pz)) > 1e-5:
        raise ValueError(f'fit_pelvis: no pelvis reaches {list(reach)}')
    return pose


def lunge(pose, front, ankles, feet, free='x'):
    """The `front` knee bent with its shin upright over the ankle, the other
    leg straight, both ankles on the mat where `ankles` says ({'L': (x, y),
    'R': (x, y)}): the pelvis is fitted between them along `free` (the
    stance's own axis: 'x' for the sideways lunges, 'y' when the front foot
    is ahead), the pose's trunk and hipbones deciding how, so the feet never
    move from stage to stage."""
    back = 'L' if front == 'R' else 'R'
    fa = (ankles[front][0], ankles[front][1], ANKLE_Z)
    knee = (fa[0], fa[1], ANKLE_Z + L.SHIN)
    ba = (ankles[back][0], ankles[back][1], ANKLE_Z)
    fit_pelvis(pose, {f'hip.{front}': (knee, L.THIGH), f'hip.{back}': (ba, LEG)}, free=free)
    hip = fk(pose)[f'hip.{front}']
    pose[f'thigh.{front}'] = n(sub(knee, hip))
    pose[f'shin.{front}'] = (0, 0, -1)
    flat_foot(pose, front, feet[front])
    straight_leg(pose, back, ankles[back], feet[back])
    return pose


def wide(pose, half, y=0.0, feet=None):
    """Both legs straight, the ankles `half` out to each side of the midline
    (at `y`), the pelvis centred over them; `feet` = {'L': heading, 'R':
    heading} (default: both forward)."""
    feet = feet or {'L': (0, -1), 'R': (0, -1)}
    set_pelvis(pose, (0.0, y), 'L', (half, y))
    straight_leg(pose, 'L', (half, y), feet['L'])
    straight_leg(pose, 'R', (-half, y), feet['R'])
    return pose


def together(pose, y=0.0):
    """Feet together (the knees and ankles touching), legs straight, toes
    forward, the pelvis over the feet at `y`."""
    loc = pose.get('pelvis.location', (0, 0, 0))
    pose['pelvis.location'] = (loc[0], y, loc[2])
    at = fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        # the knee a thigh straight below the hip, drawn in to KNEE_X; the ankle a shin below it
        dx = sx * KNEE_X - at[f'hip.{s}'][0]
        pose[f'thigh.{s}'] = n((dx, 0.0, -math.sqrt(L.THIGH ** 2 - dx * dx)))
        dx2 = sx * (ANKLE_X - KNEE_X)
        pose[f'shin.{s}'] = n((dx2, 0.0, -math.sqrt(L.SHIN ** 2 - dx2 * dx2)))
        flat_foot(pose, s, (0, -1))
    return ground(pose)


def arm_line(pose, side, d, hand=None):
    """The whole arm straight along `d` (the hand too, unless given)."""
    d = n(d)
    pose[f'upperarm.{side}'] = d
    pose[f'forearm.{side}'] = d
    pose[f'hand.{side}'] = n(hand) if hand is not None else d
    return pose


def arms_out(pose, up=0.0):
    """Arms stretched sideways in line with the shoulders, palms down."""
    for s, sx in (('L', 1), ('R', -1)):
        pose[f'clavicle.{s}'] = (sx, 0, 0.12)
        arm_line(pose, s, (sx, 0, up))
    return pose


def arms_by_thighs(pose):
    """Arms hanging by the sides, the palms against the outer thighs."""
    for s, sx in (('L', 1), ('R', -1)):
        pose[f'clavicle.{s}'] = (sx, 0, 0.12)
        arm_line(pose, s, (sx * 0.06, 0, -1), (sx * 0.02, 0, -1))
    return pose


def arms_up(pose, join=False, lean=(0, 0, 1)):
    """Arms stretched overhead along the trunk's line `lean`, shoulder-wide
    or (`join`) converging so the palms meet above the head."""
    up = n(lean)
    at = fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        pose[f'clavicle.{s}'] = n(add((sx, 0, 0.0), up, 0.35))
    at = fk(pose)
    side = n(sub(at['shoulder.L'], at['shoulder.R']))
    for s, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{s}']
        if join:
            mid = add(add(at['shoulder.L'], sub(at['shoulder.R'], at['shoulder.L']), 0.5), up, 0.5)
            wrist = add(mid, side, sx * 0.045)
            d = n(sub(wrist, sh))
            arm_line(pose, s, d, up)
        else:
            arm_line(pose, s, add(up, side, sx * 0.06))
    return pose


def reach_toward(pose, side, wrist, hint, hand):
    """Aim one arm at `wrist`; when it lies beyond the arm, stop the wrist
    where the straight arm ends on the way there (silently: the caller
    reports the shortfall — see `shortfall`)."""
    sh = fk(pose)[f'shoulder.{side}']
    d = L.dist(sh, wrist)
    span = L.UPPER + L.FORE - 0.003
    if d > span:
        wrist = add(sh, n(sub(wrist, sh)), span)
    L.arm(pose, side, wrist, hint, hand)
    return pose


def shortfall(pose, side, wrist):
    """How far (m) the `side` wrist ended from where it was sent."""
    return L.dist(fk(pose)[f'wrist.{side}'], wrist)


def fwd(deg):
    """A direction `deg` from upright toward the front (-Y), in the body's
    own plane: 90 is straight ahead, 180 straight down, beyond that down and
    back."""
    a = math.radians(deg)
    return (0.0, -math.sin(a), math.cos(a))


def fold(angles, half=None):
    """A standing forward bend: each trunk bone at its angle from upright
    toward the front (`angles` = {bone: degrees}), the legs straight and
    upright under the hips — the feet together (`half` None) or the ankles
    `half` either side of the midline — the pelvis over the ankles."""
    pose = {'pelvis.location': (0, 0, 0)}
    for b, deg in angles.items():
        pose[b] = fwd(deg)
    if half is None:
        return together(pose)
    return wide(pose, half)


def hands_low_back(pose, gap=0.16):
    """The hands brought round behind the buttocks, fingers pointing across
    toward each other (half the turn to joining up the back), a little
    apart: the way the arms travel between hanging by the sides and joining
    up the back (straight from one to the other they swing through the
    trunk)."""
    at = fk(pose)
    side, up, front = L.trunk_frame(at)
    back = L.neg(front)
    for s, sx in (('L', 1), ('R', -1)):
        wrist = add(add(add(at['pelvis'], back, L.SKIN['pelvis'][1] + 0.10), side, sx * gap), up, 0.02)
        L.arm(pose, s, wrist, add(L.scale(side, sx), back, 0.6), n(add(back, up, -0.4)))
    return pose


def namaste_back(pose, below=0.05, gap=0.008, half=0.05):
    """The palms joined behind the back (Parsvottanasana's reverse namaste),
    in the trunk's own frame, so the hands ride any fold: the palms just off
    the back of the chest `below` under the chest joint, pressed together
    either side of the spine, the fingers pointing toward the head; the
    elbows out, back and down (a searched, clearance-clean set: higher up the
    back the forearms pass into the shoulders on this hull)."""
    at = fk(pose)
    side, up, front = L.trunk_frame(at)
    back = L.neg(front)
    base = add(at['chest'], up, -below)
    for s, sx in (('L', 1), ('R', -1)):
        palm = add(add(base, back, L.SKIN['chest'][1] + L.PALM_R + gap), side, sx * half)
        wrist = add(palm, up, -L.PALM_AT)
        hint = add(add(L.scale(side, sx), back, 0.3), up, -0.5)
        L.arm(pose, s, wrist, hint, up)
    return pose


def trunk(pose, d, neck=None, head=None):
    """The trunk's three bones along `d` (the neck and head too, unless given)."""
    d = n(d)
    pose['pelvis'] = d
    pose['spine.lower'] = d
    pose['spine.upper'] = d
    pose['neck'] = n(neck) if neck is not None else d
    pose['head'] = n(head) if head is not None else d
    return pose
