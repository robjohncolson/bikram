"""
Shared pieces for the posture LIBRARY sheets (a `_` file: a helper, never
exported or previewed as a sheet).

The library is a second collection beside the 26 & 2, drawn only by the
live figure: `export_rig.py` writes these modules to
`src/data/rig/library/<id>.json`, the stage preview renders them
(`npm run motion:preview library:<id>`), and `render_motion.py`'s full
render never sees them (no sprites). Each module exports the same
`POSTURE` dict as `../postures/` (README there), with an extra optional
per-stage `notice`: the body regions whose work the bones cannot show,
from the fixed `NOTICE` vocabulary below. The app renders them as text for
now; a later task will draw them.

Every module ends with `check(POSTURE)`: forward kinematics over every
stage (and ghost) warns on stderr when any joint — the hand, foot and head
tips included — sinks below the floor (z < -0.005), and an unknown
`notice` term fails loudly. The reach solvers warn like the posture
modules' do. A stage that says `'palms': 'back'` (the hands carry the back)
is also contact-checked: each palm must sit within 2 cm of the torso's
skin (`contact warning` otherwise). A clean export or preview prints none
of these.

Poses are world-space bone directions (no rolls here: the direction chain
below is then exactly the renderer's forward kinematics).
"""
import importlib.util
import math
import sys
from pathlib import Path

POSTURES = Path(__file__).resolve().parent.parent / 'postures'

# regions whose work the bones cannot show (the app's chips; a later task draws them)
NOTICE = ('neck', 'shoulders', 'upper-back', 'lower-back', 'core', 'hips',
          'hamstrings', 'quads', 'calves', 'feet', 'wrists', 'breath')

FLOOR = -0.005
_who = ['library']


def begin(name):
    """Name the sheet the warnings below speak for."""
    _who[0] = name


def _posture_module(name):
    spec = importlib.util.spec_from_file_location(f'_library_src_{name}', POSTURES / f'{name}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# --- vectors --------------------------------------------------------------------
def n(v):
    m = math.sqrt(sum(c * c for c in v))
    return tuple(c / m for c in v)


def add(a, b, s=1.0):
    return tuple(x + s * y for x, y in zip(a, b))


def sub(a, b):
    return tuple(x - y for x, y in zip(a, b))


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def dist(a, b):
    return math.sqrt(dot(sub(a, b), sub(a, b)))


def neg(v):
    return tuple(-c for c in v)


# --- the rig (README table; copied lengths, rest directions) -----------------------
J = {
    'pelvis': (0, 0, 1.00), 'waist': (0, 0, 1.12), 'chest': (0, 0, 1.27), 'neck': (0, 0, 1.40),
    'head': (0, 0, 1.52), 'crown': (0, 0, 1.72),
    'shoulder.L': (0.20, 0, 1.44), 'shoulder.R': (-0.20, 0, 1.44),
    'elbow.L': (0.22, 0, 1.15), 'elbow.R': (-0.22, 0, 1.15),
    'wrist.L': (0.23, 0, 0.90), 'wrist.R': (-0.23, 0, 0.90),
    'fingers.L': (0.23, 0, 0.80), 'fingers.R': (-0.23, 0, 0.80),
    'hip.L': (0.10, 0, 0.98), 'hip.R': (-0.10, 0, 0.98),
    'knee.L': (0.10, 0, 0.54), 'knee.R': (-0.10, 0, 0.54),
    'ankle.L': (0.10, 0, 0.10), 'ankle.R': (-0.10, 0, 0.10),
    'toes.L': (0.10, -0.16, 0.02), 'toes.R': (-0.10, -0.16, 0.02),
}
BONES = [
    ('pelvis', 'pelvis', 'waist'), ('spine.lower', 'waist', 'chest'), ('spine.upper', 'chest', 'neck'),
    ('neck', 'neck', 'head'), ('head', 'head', 'crown'),
    ('clavicle.L', 'neck', 'shoulder.L'), ('clavicle.R', 'neck', 'shoulder.R'),
    ('upperarm.L', 'shoulder.L', 'elbow.L'), ('upperarm.R', 'shoulder.R', 'elbow.R'),
    ('forearm.L', 'elbow.L', 'wrist.L'), ('forearm.R', 'elbow.R', 'wrist.R'),
    ('hand.L', 'wrist.L', 'fingers.L'), ('hand.R', 'wrist.R', 'fingers.R'),
    ('hipbone.L', 'pelvis', 'hip.L'), ('hipbone.R', 'pelvis', 'hip.R'),
    ('thigh.L', 'hip.L', 'knee.L'), ('thigh.R', 'hip.R', 'knee.R'),
    ('shin.L', 'knee.L', 'ankle.L'), ('shin.R', 'knee.R', 'ankle.R'),
    ('foot.L', 'ankle.L', 'toes.L'), ('foot.R', 'ankle.R', 'toes.R'),
]
LENGTH = {b: dist(J[h], J[t]) for b, h, t in BONES}
REST = {b: n(sub(J[t], J[h])) for b, h, t in BONES}
UPPER, FORE, HAND = LENGTH['upperarm.L'], LENGTH['forearm.L'], LENGTH['hand.L']
THIGH, SHIN = LENGTH['thigh.L'], LENGTH['shin.L']
TORSO = LENGTH['pelvis'] + LENGTH['spine.lower'] + LENGTH['spine.upper']
# the skin's measured half-widths at the trunk joints, [across, front-back]
# (src/rig/body.ts SKIN_FIT, from Blender) and the palm swelling's own
SKIN = {'pelvis': (0.155, 0.083), 'waist': (0.119, 0.086), 'chest': (0.129, 0.092), 'neck': (0.125, 0.094)}
PALM_R = 0.035          # the palm swelling's half-thickness (SKIN_FIT palm, 0.03 × 0.04)
PALM_AT = 0.035         # the palm vertex sits this far down the hand bone from the wrist
CONTACT = 0.02          # a supporting palm's skin within 2 cm of the back's
TRUNK = ('pelvis', 'waist', 'chest', 'neck')


def direction(pose, bone):
    e = pose.get(bone)
    if e is None:
        return REST[bone]
    if isinstance(e, dict):
        raise ValueError(f'{_who[0]}: {bone} has a roll; the library keeps to plain directions')
    return n(e)


def fk(pose):
    """Every joint's world position (the renderer's own forward kinematics
    when no bone is rolled: an omitted bone points along its rest direction)."""
    at = {'pelvis': add(J['pelvis'], pose.get('pelvis.location', (0, 0, 0)))}
    for bone, head, tail in BONES:
        at[tail] = add(at[head], direction(pose, bone), LENGTH[bone])
    return at


def place(pose, joint, where):
    """Set `pelvis.location` so `joint` lands at `where` (the pose is shifted whole)."""
    pose['pelvis.location'] = (0, 0, 0)
    pose['pelvis.location'] = sub(where, fk(pose)[joint])
    at = fk(pose)
    return at


# --- solvers --------------------------------------------------------------------
def _warn_reach(d, span, target):
    """Say so (stderr) when a reach target lies more than 1 cm beyond the
    chain: the solver clamps it, and the limb silently falls short."""
    if d > span + 0.01:
        print(f'reach warning [library/{_who[0]}]: target '
              f'({target[0]:.3f}, {target[1]:.3f}, {target[2]:.3f}) is '
              f'{d - span:.3f} m out of reach', file=sys.stderr)


def two_bone(root, target, l1, l2, hint):
    """Directions of two bones from `root` reaching `target`, the middle
    joint bent toward `hint` (straight when the target is out of reach)."""
    d = sub(target, root)
    raw = math.sqrt(dot(d, d))
    _warn_reach(raw, l1 + l2, target)
    far = min(raw, l1 + l2 - 1e-3)
    u = n(d)
    x = (l1 * l1 - l2 * l2 + far * far) / (2 * far)
    r = math.sqrt(max(l1 * l1 - x * x, 0.0))
    v = n(add(hint, u, -dot(hint, u)))
    mid = add(add(root, u, x), v, r)
    return n(sub(mid, root)), n(sub(target, mid))


def one_bone(root, target, length):
    """The direction from `root` to `target` for a single bone, warning when
    the bone would end more than a centimetre from the target."""
    d = dist(root, target)
    if abs(d - length) > 0.01:
        print(f'reach warning [library/{_who[0]}]: a {length:.3f} m bone cannot end at '
              f'({target[0]:.3f}, {target[1]:.3f}, {target[2]:.3f}); it is {d:.3f} m away',
              file=sys.stderr)
    return n(sub(target, root))


def arm(pose, side, wrist, hint, hand):
    """Aim one arm so its wrist reaches `wrist`, elbow toward `hint`."""
    shoulder = fk(pose)[f'shoulder.{side}']
    up, fo = two_bone(shoulder, wrist, UPPER, FORE, hint)
    pose[f'upperarm.{side}'], pose[f'forearm.{side}'], pose[f'hand.{side}'] = up, fo, hand


def leg(pose, side, ankle, hint, foot):
    """Aim one leg so its ankle reaches `ankle`, knee toward `hint`."""
    hip = fk(pose)[f'hip.{side}']
    th, sh = two_bone(hip, ankle, THIGH, SHIN, hint)
    pose[f'thigh.{side}'], pose[f'shin.{side}'], pose[f'foot.{side}'] = th, sh, foot


def on_floor(root, length, z, toward):
    """Where a bone of `length` from `root` meets the height `z`, heading
    horizontally along `toward` (a knee put down, an elbow set on the floor)."""
    drop = root[2] - z
    run = math.sqrt(max(length * length - drop * drop, 0.0))
    if drop > length + 0.01:
        _warn_reach(drop, length, (root[0], root[1], z))
    h = n((toward[0], toward[1], 0))
    return (root[0] + h[0] * run, root[1] + h[1] * run, z)


# --- floor check ------------------------------------------------------------------
def floor_check(pose, where):
    """Warn (stderr) for any joint below the floor — the hand, foot and head
    tips included — so a pose can never sink a limb silently."""
    for joint, p in fk(pose).items():
        if p[2] < FLOOR:
            print(f'floor warning [library/{_who[0]}]: {where} {joint} at z = {p[2]:.3f} m, '
                  f'below the floor', file=sys.stderr)


def check(posture):
    """Floor-check every stage and ghost; refuse an unknown `notice` term."""
    for i, st in enumerate(posture['stages']):
        where = f"#{i} {st['label']!r}"
        floor_check(st['pose'], where)
        if st.get('ghost'):
            floor_check({**st['pose'], **st['ghost']}, f'{where} ghost')
        for term in st.get('notice', ()):
            if term not in NOTICE:
                raise ValueError(f"{posture['id']} {where}: notice {term!r} is not one of {NOTICE}")
        if st.get('palms') == 'back':
            contact_check(st['pose'], where)
    return posture


def trunk_frame(at):
    """The trunk's own axes from a solved pose: `side` toward the mannequin's
    left (shoulder line), `up` toward the head; `front` = side × up (at rest
    -Y, the way the face points)."""
    side = n(sub(at['shoulder.L'], at['shoulder.R']))
    up = n(sub(at['neck'], at['waist']))
    side = n(add(side, up, -dot(side, up)))
    front = (side[1] * up[2] - side[2] * up[1], side[2] * up[0] - side[0] * up[2], side[0] * up[1] - side[1] * up[0])
    return side, up, front


def skin_gap(at, point):
    """How far `point` lies outside the trunk's skin (negative = inside):
    nearest point on the pelvis-waist-chest-neck line, the skin's elliptical
    section there (half-widths interpolated between the joints)."""
    side0, _, _ = trunk_frame(at)
    best = None
    for a, b in zip(TRUNK, TRUNK[1:]):
        pa, pb = at[a], at[b]
        seg = sub(pb, pa)
        k = max(0.0, min(1.0, dot(sub(point, pa), seg) / dot(seg, seg)))
        c = add(pa, seg, k)
        d = dist(point, c)
        if best is None or d < best[0]:
            ra = tuple(x + (y - x) * k for x, y in zip(SKIN[a], SKIN[b]))
            best = (d, c, ra, n(seg))
    d, c, (wa, wb), u = best
    # the section's own axes, square to this segment (the trunk may arch)
    side = n(add(side0, u, -dot(side0, u)))
    front = (side[1] * u[2] - side[2] * u[1], side[2] * u[0] - side[0] * u[2], side[0] * u[1] - side[1] * u[0])
    r = sub(point, c)
    rs, rf = dot(r, side), dot(r, front)
    rho = max(1e-9, (rs * rs + rf * rf) ** 0.5)
    surface = 1 / (((rs / rho) / wa) ** 2 + ((rf / rho) / wb) ** 2) ** 0.5
    return rho - surface


def palm_point(pose, side):
    """The palm swelling's centre: PALM_AT down the hand bone from the wrist."""
    at = fk(pose)
    return add(at[f'wrist.{side}'], direction(pose, f'hand.{side}'), PALM_AT)


def contact_check(pose, where):
    """Warn (stderr) when a supporting palm is not on the back: its skin
    more than CONTACT from the trunk's skin, either way."""
    at = fk(pose)
    for side in 'LR':
        gap = skin_gap(at, palm_point(pose, side)) - PALM_R
        if abs(gap) > CONTACT:
            print(f'contact warning [library/{_who[0]}]: {where} palm.{side} is {gap * 100:+.1f} cm '
                  f'from the back (limit {CONTACT * 100:.0f} cm)', file=sys.stderr)


def diff(pose, base):
    """Only the entries of `pose` that differ from `base` (a ghost overlay)."""
    return {k: v for k, v in pose.items() if base.get(k) != v}


# --- lying on the back ------------------------------------------------------------
# The canonical supine pose (wind_removing.FLAT), moved along the mat so the
# inversions over the head stay inside the square frame: the camera pivots
# on the Y axis, and a plough reaches a long way past the crown.
SHIFT_Y = 0.24
_FLAT = _posture_module('wind_removing').FLAT
LIE = {**_FLAT, 'pelvis.location': add(_FLAT['pelvis.location'], (0, SHIFT_Y, 0))}
LIE_AT = fk(LIE)
# where the neck joint rests once the body is on its shoulders
# the neck joint's rendered ellipsoid turns halfway between the upright trunk
# and the level neck (body.ts placeJoint), reaching ~0.11 below the joint:
# resting it here puts the upper back ON the mat (measured on the rendered
# hull in library.test.ts; at 0.075 it sank 3-4 cm through the floor guide)
NECK_AT = (0, LIE_AT['neck'][1] + 0.02, 0.112)
SUPINE_FRAME = {'center_z': 0.62, 'scale': 2.6}

ARMS_FLAT = {  # arms long on the mat beside the body, palms down
    'upperarm.L': (0.08, 1, 0), 'upperarm.R': (-0.08, 1, 0),
    'forearm.L': (0.08, 1, 0), 'forearm.R': (-0.08, 1, 0),
    'hand.L': (0.08, 1, -0.04), 'hand.R': (-0.08, 1, -0.04),
}


def legs_up():
    """On the back, both legs lifted to vertical, arms long on the mat."""
    pose = {**LIE}
    pose.update({'thigh.L': (-0.03, 0, 1), 'thigh.R': (0.03, 0, 1),
                 'shin.L': (-0.03, 0, 1), 'shin.R': (0.03, 0, 1),
                 'foot.L': (0, -0.2, 1), 'foot.R': (0, -0.2, 1)})
    return pose


def on_shoulders(up=(0, 0.02, 1), spine=None, neck=NECK_AT):
    """The trunk standing on the shoulders: `up` is the line from the neck to
    the pelvis (straight up is a shoulderstand; tipped toward -Y the hips
    travel over the face, toward +Y they sink back), or `spine` gives the
    three trunk directions (neck → chest, chest → waist, waist → pelvis) for
    a curved one. The back of the head and neck lie on the mat toward -Y,
    the shoulder line flat on it; the chest faces the chin (-Y)."""
    s = spine or (up, up, up)
    pose = {
        'spine.upper': neg(n(s[0])), 'spine.lower': neg(n(s[1])), 'pelvis': neg(n(s[2])),
        'neck': (0, -1, -0.12), 'head': (0, -1, 0),   # down to the mat: the back of the head rests on it
        'clavicle.L': (1, 0.1, 0), 'clavicle.R': (-1, 0.1, 0),
        'hipbone.L': (1, 0, 0.15), 'hipbone.R': (-1, 0, 0.15),
    }
    place(pose, 'neck', neck)
    return pose


def grounded_elbow(shoulder, wrist, sx, z=0.043):
    """An elbow on the mat (its joint at `z`, the skin just touching) that is
    an upper arm from `shoulder` and a forearm from `wrist`: where the two
    spheres cross the floor plane, the point further out to the arm's own
    side. None when they do not meet (the caller then warns)."""
    r1 = UPPER * UPPER - (shoulder[2] - z) ** 2
    r2 = FORE * FORE - (wrist[2] - z) ** 2
    if r1 <= 0 or r2 <= 0:
        return None
    r1, r2 = r1 ** 0.5, r2 ** 0.5
    a, b = (shoulder[0], shoulder[1]), (wrist[0], wrist[1])
    d = ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) ** 0.5
    if d > r1 + r2 or d < abs(r1 - r2) or d == 0:
        return None
    x = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
    h = max(r1 * r1 - x * x, 0.0) ** 0.5
    ux, uy = (b[0] - a[0]) / d, (b[1] - a[1]) / d
    mx, my = a[0] + ux * x, a[1] + uy * x
    cands = [(mx - uy * h, my + ux * h, z), (mx + uy * h, my - ux * h, z)]
    return max(cands, key=lambda p: p[0] * sx)


def palms_to_back(pose, back, f=0.8, theta=42.0, fingers=0.3):
    """The hands carrying the back: each palm set ON the trunk's skin — `f`
    along the trunk line (0 = waist, 1 = chest, negative = down toward the
    pelvis), `theta` degrees round from the middle of the back toward the
    arm's own side — the fingers along the back toward the hips (and
    `fingers` of the way in toward the spine), and the elbow grounded on
    the mat. `back` is the world side the back faces (the lying poses are
    mirror-labelled — FLAT's left is +X — so the trunk's own handedness
    cannot say which side is the back; the arms can: it is where they are). Replaces the old fixed forearm directions, which left the
    palms floating off the back."""
    import math
    at = fk(pose)
    side, up, _ = trunk_frame(at)
    if f >= 0:
        c = add(at['waist'], sub(at['chest'], at['waist']), f)
        wa, wb = (x + (y - x) * f for x, y in zip(SKIN['waist'], SKIN['chest']))
        seg = n(sub(at['chest'], at['waist']))
    else:
        c = add(at['waist'], sub(at['pelvis'], at['waist']), -f)
        wa, wb = (x + (y - x) * -f for x, y in zip(SKIN['waist'], SKIN['pelvis']))
        seg = n(sub(at['waist'], at['pelvis']))
    # the section square to this part of the trunk (an arched back tilts it)
    side = n(add(side, seg, -dot(side, seg)))
    back = n(add(back, seg, -dot(back, seg)))
    back = n(add(back, side, -dot(back, side)))
    t = math.radians(theta)
    for s_, sx in (('L', 1), ('R', -1)):
        # a point on the elliptical section, and its outward normal
        surf = add(add(c, back, wb * math.cos(t)), side, sx * wa * math.sin(t))
        normal = n(add(tuple(bk * math.cos(t) / wb for bk in back),
                       tuple(sd * sx * math.sin(t) / wa for sd in side)))
        palm = add(surf, normal, PALM_R)
        # fingers toward the hips, tipped in toward the spine, flat to the back
        hand = add(neg(up), side, -sx * fingers)
        hand = n(add(hand, normal, -dot(hand, normal)))
        wrist = add(palm, hand, -PALM_AT)
        sh = at[f'shoulder.{s_}']
        elbow = grounded_elbow(sh, wrist, sx)
        if elbow is None:
            print(f'reach warning [library/{_who[0]}]: no grounded elbow reaches the {s_} palm target '
                  f'({wrist[0]:.3f}, {wrist[1]:.3f}, {wrist[2]:.3f})', file=sys.stderr)
            up_, fo = two_bone(sh, wrist, UPPER, FORE, (sx, 0.3, -1))
        else:
            up_, fo = n(sub(elbow, sh)), n(sub(wrist, elbow))
        pose[f'upperarm.{s_}'], pose[f'forearm.{s_}'], pose[f'hand.{s_}'] = up_, fo, hand
    return pose


def hands_on_back(pose, f=0.95):
    """Shoulderstand support: palms on the back ribs toward the shoulder
    blades, the back facing away from the head (+Y)."""
    return palms_to_back(pose, (0, 1, 0), f=f)


def arms_long(pose, clasp=True):
    """Arms straight along the mat away from the head (toward +Y), hands
    together (fingers interlaced) or shoulder-wide."""
    at = fk(pose)
    for side, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{side}']
        wrist = add(sh, n((-sx * (0.3 if clasp else 0.0), 1, -0.08)), UPPER + FORE - 0.002)
        arm(pose, side, wrist, (0, 0, 1), (-sx * (0.3 if clasp else 0.0), 1, -0.1))
    return pose


def legs_to(pose, ankles, foot, hint=(0, 0, 1)):
    """Both legs to ankle targets {'L': p, 'R': p}, knees toward `hint`."""
    for side in 'LR':
        leg(pose, side, ankles[side], hint, foot if isinstance(foot, tuple) and len(foot) == 3 else foot[side])
    return pose


def legs_vertical(pose, lean=(0, 0, 1)):
    """Both legs straight along `lean` from the hips, together, toes pointed."""
    for side, sx in (('L', 1), ('R', -1)):
        d = n((lean[0] - sx * 0.03, lean[1], lean[2]))
        pose[f'thigh.{side}'] = d
        pose[f'shin.{side}'] = d
        pose[f'foot.{side}'] = n(add(d, (0, -0.15, 0)))
    return pose


def plough_legs(pose, spread=0.0, side=0.0, toe_z=0.03):
    """Both legs straight over the head to the mat beyond the crown, on the
    tucked toes: `spread` opens them into a V (metres between the ankles'
    centre line and each ankle), `side` carries both toward one side (+X is
    the mannequin's left)."""
    at = fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        hip = at[f'hip.{s}']
        ankle_z = toe_z + 0.175   # the tucked foot stands almost upright under the ankle
        drop = hip[2] - ankle_z
        run = math.sqrt(max((THIGH + SHIN - 0.004) ** 2 - drop * drop, 0.0))
        lat = side + sx * (spread or 0.05)
        along = math.sqrt(max(run * run - (lat - hip[0]) ** 2, 0.0))
        ankle = (lat, hip[1] - along, ankle_z)
        th, sh = two_bone(hip, ankle, THIGH, SHIN, (0, 0, 1))
        pose[f'thigh.{s}'], pose[f'shin.{s}'] = th, sh
        # toes tucked under: the foot hangs from the ankle down to the mat
        pose[f'foot.{s}'] = n((sh[0] * 0.3, sh[1] * 0.3 - 0.1, -1))
    return pose


# --- the headstand -----------------------------------------------------------------
# From a kneel facing -Y the body folds forward, so upside down the chest
# faces +Y (the knees' side) and the back of the head sits in the hands.
KNEE_Y = 0.30
TUCK_SHIN = n((0, 1, 0.3))      # knee on the mat, the shin rising to a lifted heel
TUCK_FOOT = n((0, -0.35, -1))   # the foot down from the ankle onto the tucked toes
CROWN = (0, -0.20, 0.008)   # the crown's skin ends at its vertex (body.ts jointCenter): on the mat
HEAD_FRAME = {'center_z': 0.9, 'scale': 2.3}


def kneel(lean=0.0):
    """Upright kneeling facing -Y, knees at KNEE_Y, shins long on the mat
    (camel.py's kneel, moved back so the headstand lands mid-frame)."""
    t = n((0, -lean, -1))
    return {
        'pelvis.location': (0, KNEE_Y - THIGH * t[1], 0.08 - THIGH * t[2] - 1.0),
        'thigh.L': t, 'thigh.R': t,
        # toes tucked under all through the headstand family: the feet then
        # keep one aim from the kneel to the walk-in and back to the rest
        'shin.L': TUCK_SHIN, 'shin.R': TUCK_SHIN,
        'foot.L': TUCK_FOOT, 'foot.R': TUCK_FOOT,
    }


def inverted_trunk(spine, neck=(0, 0.25, -1), head=(0, 0.1, -1), crown=CROWN):
    """The crown on the mat and the trunk rising from it: `spine` gives
    the three trunk directions measured UP from the neck (neck → chest,
    chest → waist, waist → pelvis). Shoulders lifted off the floor a little,
    hips square."""
    pose = {
        'spine.upper': neg(n(spine[0])), 'spine.lower': neg(n(spine[1])), 'pelvis': neg(n(spine[2])),
        'neck': n(neck), 'head': n(head),
        'clavicle.L': (1, 0, -0.08), 'clavicle.R': (-1, 0, -0.08),
        'hipbone.L': (1, 0, 0.15), 'hipbone.R': (-1, 0, 0.15),
    }
    place(pose, 'crown', crown)
    return pose


def forearm_tripod(pose):
    """Elbows on the mat under the shoulders, forearms angled in, fingers
    interlaced round the back of the head (the -Y side of the crown)."""
    at = fk(pose)
    c = at['crown']
    for side, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{side}']
        elbow = on_floor(sh, UPPER, 0.043, (0, 1, 0))
        elbow = (sx * max(abs(elbow[0]), 0.19), elbow[1], elbow[2])
        pose[f'upperarm.{side}'] = n(sub(elbow, sh))
        aim = (sx * 0.05, c[1] - 0.11, 0.035)
        wrist = add(elbow, n(sub(aim, elbow)), FORE)
        pose[f'forearm.{side}'] = n(sub(wrist, elbow))
        pose[f'hand.{side}'] = n((-sx * 0.6, 0.35, 1))
    return pose


def kneel_legs(pose, tuck=False):
    """Knees put down on the mat below the hips, shins long behind (+Y).
    `tuck`: the toes tucked under (heels up, the shin rising to the ankle),
    ready to straighten the legs and walk in — the foot then keeps its aim
    into Walk in instead of turning through the mat."""
    at = fk(pose)
    for side in 'LR':
        hip = at[f'hip.{side}']
        knee = on_floor(hip, THIGH, 0.06, (0, 1, 0))
        pose[f'thigh.{side}'] = n(sub(knee, hip))
        pose[f'shin.{side}'] = TUCK_SHIN if tuck else (0, 1, 0)
        pose[f'foot.{side}'] = TUCK_FOOT if tuck else (0, 1, -0.05)
    return pose


# a hair toward the chest: exactly opposite its rest, a bone's shortest arc
# turns about a diagonal and the trunk's width swings front to back
HEAD_UP = ((0, 0.02, 1), (0, 0.02, 1), (0, 0.02, 1))


def headstand(legs=(0, 0, 1), spine=HEAD_UP, knees=None):
    """The headstand: trunk up from the crown, legs along `legs` (straight),
    or with `knees` = (thigh, shin) directions, folded."""
    pose = inverted_trunk(spine, neck=(0, 0.04, -1), head=(0, 0.02, -1))
    forearm_tripod(pose)
    for side, sx in (('L', 1), ('R', -1)):
        if knees:
            th, sh = knees
            pose[f'thigh.{side}'] = n((th[0] - sx * 0.02, th[1], th[2]))
            pose[f'shin.{side}'] = n(sh)
            pose[f'foot.{side}'] = n(add(n(sh), (0, 0.15, 0)))
        else:
            d = n((legs[0] - sx * 0.03, legs[1], legs[2]))
            pose[f'thigh.{side}'] = d
            pose[f'shin.{side}'] = d
            pose[f'foot.{side}'] = n(add(d, (0, 0.2, 0)))
    return pose


def head_set():
    """Forearms down: the knees still on the mat, the trunk sloping from the
    hips down to the crown, the fingers laced round the back of the head."""
    pose = inverted_trunk(((0, 0.92, 0.38), (0, 0.95, 0.3), (0, 0.98, 0.1)),
                          neck=(0, 0.32, -0.95), head=(0, 0.14, -0.99))
    forearm_tripod(pose)
    return kneel_legs(pose, tuck=True)


def head_walk():
    """Knees straight, up on the toes, the hips walked in over the shoulders."""
    pose = inverted_trunk(((0, 0.2, 1), (0, 0.22, 1), (0, 0.3, 1)))
    forearm_tripod(pose)
    at = fk(pose)
    for side in 'LR':
        hip = at[f'hip.{side}']
        ankle = on_floor(hip, THIGH + SHIN - 0.004, 0.19, (0, 1, 0))
        leg(pose, side, ankle, (0, -1, 0.3), n((0, -0.35, -1)))
    return pose


def head_tuck():
    """The knees drawn to the chest, both feet off the mat together."""
    return headstand(spine=((0, 0.05, 1), (0, 0.05, 1), (0, 0.1, 1)),
                     knees=((0, 0.62, -0.78), (0, -0.35, 0.94)))


def head_knees_up():
    """The knees rise toward the ceiling, the heels still folded in behind."""
    return headstand(knees=((0, 0.12, 1), (0, -0.75, -0.66)))


def childs_pose():
    """Rest after the headstand: kneeling, the hips back toward the heels,
    the forehead down on the mat, arms long beside the shins."""
    t = n((0, 0.55, -0.83))
    pose = {
        'thigh.L': t, 'thigh.R': t,
        'shin.L': TUCK_SHIN, 'shin.R': TUCK_SHIN,
        'foot.L': TUCK_FOOT, 'foot.R': TUCK_FOOT,
        'hipbone.L': (1, -0.2, 0.1), 'hipbone.R': (-1, -0.2, 0.1),
        'pelvis': n((0, -0.75, 0.1)), 'spine.lower': n((0, -0.9, -0.15)),
        'spine.upper': n((0, -0.8, -0.45)), 'neck': n((0, -0.5, -0.87)), 'head': n((0, -0.3, -0.95)),
        'clavicle.L': (1, 0, -0.2), 'clavicle.R': (-1, 0, -0.2),
    }
    # the knees on the mat at KNEE_Y - they carry the whole fold
    pose['pelvis.location'] = (0, 0, 0)
    knee = fk(pose)['knee.L']
    place(pose, 'pelvis', add(fk(pose)['pelvis'], ((0 - 0), KNEE_Y - knee[1], 0.06 - knee[2])))
    # the forearms and laced hands stay where the headstand had them, so the
    # way down (and the loop back up) never turns a hand through the floor
    forearm_tripod(pose)
    return pose


# --- the shoulderstand family ------------------------------------------------------
def shoulderstand(lean=(0, -0.03, 1)):
    """Trunk and legs stacked over the shoulders, palms on the back."""
    pose = on_shoulders(up=(0, 0.05, 1))
    hands_on_back(pose)
    return legs_vertical(pose, lean=lean)


def rolling_up():
    """On the way up: the legs swung over the face, the hips lifting off the
    mat, the hands pressing down beside the body."""
    pose = on_shoulders(up=(0, 0.55, 0.83))
    pose.update(ARMS_FLAT)
    return legs_vertical(pose, lean=(0, -0.75, 0.66))


def rolling_down():
    """On the way down: the back unrolls onto the mat from the shoulders,
    the legs held over the face as a counterweight, the palms pressing."""
    pose = on_shoulders(spine=((0, 0.35, 1), (0, 0.8, 0.6), (0, 0.95, 0.3)))
    pose.update(ARMS_FLAT)
    return legs_vertical(pose, lean=(0, -0.62, 0.78))


def plough(arms='back', spread=0.0, side=0.0):
    """Halasana's frame: the hips over the head, both legs straight over it
    to the mat. `arms` = 'back' (palms on the back) or 'long' (straight on the
    mat behind, fingers laced)."""
    pose = on_shoulders(up=(0, -0.12, 1))
    if arms == 'back':
        hands_on_back(pose, f=1.0)   # the hips over the head tip the back: the palms higher up it
    else:
        arms_long(pose)
    return plough_legs(pose, spread=spread, side=side)


def one_leg_down(pose, side, toward, toe_z=0.03):
    """One leg straight from its hip down to the mat along the horizontal
    heading `toward`, on the tucked toes (the other leg is left as it is)."""
    hip = fk(pose)[f'hip.{side}']
    ankle = on_floor(hip, THIGH + SHIN - 0.004, toe_z + 0.175, toward)
    th, sh = two_bone(hip, ankle, THIGH, SHIN, (0, 0, 1))
    pose[f'thigh.{side}'], pose[f'shin.{side}'] = th, sh
    h = n((toward[0], toward[1], 0))
    pose[f'foot.{side}'] = n((h[0] * 0.3, h[1] * 0.3, -1))
    return pose


def hands_under_waist(pose):
    """Bridge support: elbows on the mat, the palms under the back at the
    waist carrying the arch."""
    return palms_to_back(pose, (0, 0, -1), f=0.4, theta=38.0, fingers=0.4)
