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

Every held stage and ghost is also CLEARANCE-checked on the rendered hull
(`_hull.py`, a port of the live figure's body): any two pieces of the body
that are not exempt by a named rule (shared joint, trunk neighbours, hip
socket, laced hands — see `src/rig/clearance.ts`) and interpenetrate by
more than 1 cm print a `clearance warning`. A stage whose fingers lace says
`'hands': 'laced'`; only then are the two hands' finger regions exempt. `library.test.ts` checks the same on the
real hull, over the in-betweens too.

Poses are world-space bone directions. A LEAF bone (head, hand, foot) may
take `{'dir': ..., 'roll': degrees}`: a roll turns the bone about its own
axis, which never moves a joint (a leaf has no children to carry), so the
direction chain below stays exactly the renderer's forward kinematics.
Rolls anywhere else are refused.
"""
import importlib.util
import math
import sys
from pathlib import Path

POSTURES = Path(__file__).resolve().parent.parent / 'postures'
_hspec = importlib.util.spec_from_file_location('_library_hull', Path(__file__).resolve().parent / '_hull.py')
H = importlib.util.module_from_spec(_hspec)
_hspec.loader.exec_module(H)

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
        if bone not in H.LEAVES:
            raise ValueError(f'{_who[0]}: {bone} has a roll; only leaf bones {H.LEAVES} may roll')
        return n(e['dir'])
    return n(e)


def fk(pose):
    """Every joint's world position (the renderer's own forward kinematics:
    an omitted bone points along its rest direction, and a roll — leaf
    bones only — moves no joint)."""
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


def clearance_check(pose, where, laced=False):
    """Warn (stderr) for every pair of hull pieces that pass more than
    1 cm into each other (`_hull.clashes`: the rendered hull, the named
    rules only; `laced` = the stage laces the fingers)."""
    for a, b, d in H.clashes(pose, laced=laced):
        print(f'clearance warning [library/{_who[0]}]: {where} {a} and {b} '
              f'interpenetrate by {d * 100:.1f} cm', file=sys.stderr)


def check(posture):
    """Floor- and clearance-check every stage and ghost; refuse an unknown
    `notice` term."""
    for i, st in enumerate(posture['stages']):
        where = f"#{i} {st['label']!r}"
        laced = st.get('hands') == 'laced'
        if st.get('hands') not in (None, 'laced'):
            raise ValueError(f"{posture['id']} {where}: hands {st['hands']!r} is not 'laced'")
        floor_check(st['pose'], where)
        clearance_check(st['pose'], where, laced)
        if st.get('ghost'):
            floor_check({**st['pose'], **st['ghost']}, f'{where} ghost')
            clearance_check({**st['pose'], **st['ghost']}, f'{where} ghost', laced)
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
# the arms a hand's width from the sides (FLAT keeps them close): lifting the
# legs from here, the thighs never brush through the palms (clearance)
LIE = {**_FLAT, 'pelvis.location': add(_FLAT['pelvis.location'], (0, SHIFT_Y, 0)),
       'upperarm.L': (0.16, 1, 0), 'upperarm.R': (-0.16, 1, 0),
       'forearm.L': (0.16, 1, 0), 'forearm.R': (-0.16, 1, 0),
       'hand.L': (0.16, 1, -0.04), 'hand.R': (-0.16, 1, -0.04)}
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


ELBOW_X = 0.06         # an elbow at least this far out from the midline: two elbows never meet under the back
ELBOW_LIFT = 0.058     # a grounded elbow's joint no higher than this (library.test.ts: < 0.06)


def elbow_circle(shoulder, wrist, sx):
    """Where an elbow may go: the circle an upper arm from `shoulder` and a
    forearm from `wrist` meet on. Of its points at least ELBOW_X out to
    the arm's own side (`sx`) and clear of the mat, the lowest; None when
    there is none."""
    d = dist(shoulder, wrist)
    if d >= UPPER + FORE or d <= abs(UPPER - FORE):
        return None
    u = n(sub(wrist, shoulder))
    x = (UPPER * UPPER - FORE * FORE + d * d) / (2 * d)
    r = math.sqrt(max(UPPER * UPPER - x * x, 0.0))
    c = add(shoulder, u, x)
    a = (1, 0, 0) if abs(u[0]) < 0.9 else (0, 1, 0)
    e1 = n(add(a, u, -dot(a, u)))
    e2 = (u[1] * e1[2] - u[2] * e1[1], u[2] * e1[0] - u[0] * e1[2], u[0] * e1[1] - u[1] * e1[0])
    pts = [add(add(c, e1, r * math.cos(t)), e2, r * math.sin(t)) for t in (k / 720 * 2 * math.pi for k in range(720))]
    ok = [p for p in pts if sx * p[0] >= ELBOW_X and p[2] >= 0.043]
    return min(ok, key=lambda p: p[2]) if ok else None


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
        # fingers toward the hips, tipped in toward the spine, flat to the back
        hand = add(neg(up), side, -sx * fingers)
        hand = n(add(hand, normal, -dot(hand, normal)))
        sh = at[f'shoulder.{s_}']
        for lift in PALM_LIFTS:
            wrist = add(add(surf, normal, PALM_R + lift), hand, -PALM_AT)
            elbow, why = _back_elbow(sh, wrist, sx)
            if elbow is None:
                up_, fo = two_bone(sh, wrist, UPPER, FORE, (sx, 0.3, -1))
            else:
                up_, fo = n(sub(elbow, sh)), n(sub(wrist, elbow))
            pose[f'upperarm.{s_}'], pose[f'forearm.{s_}'], pose[f'hand.{s_}'] = up_, fo, hand
            if not H.clashes(pose, tol=PALM_SINK, only=HAND_PIECES[s_]):
                break
        if why:
            print(f'reach warning [library/{_who[0]}]: {why} ({s_} palm target '
                  f'{wrist[0]:.3f}, {wrist[1]:.3f}, {wrist[2]:.3f})', file=sys.stderr)
    return pose


# a palm set on the measured skin can still sink into the DRAWN hull where a
# tipped trunk grows its joints (jointRadii): it is lifted off the back in
# steps until the hand clears the trunk (the contact check still holds it
# within 2 cm)
PALM_LIFTS = (0.0, 0.004, 0.008, 0.012, 0.016)
PALM_SINK = 0.006
HAND_PIECES = {s: {f'wrist.{s}', f'palm.{s}', f'fingers.{s}', f'wrist.{s}>palm.{s}', f'palm.{s}>fingers.{s}'} for s in 'LR'}


def _back_elbow(sh, wrist, sx):
    """The grounded elbow for a palm on the back, and what is wrong (or '')."""
    elbow = grounded_elbow(sh, wrist, sx)
    if elbow is not None and sx * elbow[0] < ELBOW_X:
        # the grounded elbows would meet under the back: the lowest elbow
        # out at ELBOW_X instead, which must still be on the mat
        elbow = elbow_circle(sh, wrist, sx)
        if elbow is not None and elbow[2] > ELBOW_LIFT:
            return elbow, f'the elbow cannot stay on the mat out at {ELBOW_X} m ({elbow[2]:.3f} m up)'
    if elbow is None:
        return None, 'no grounded elbow reaches the palm'
    return elbow, ''


def hands_on_back(pose, f=0.95, theta=42.0):
    """Shoulderstand support: palms on the back ribs toward the shoulder
    blades, the back facing away from the head (+Y)."""
    return palms_to_back(pose, (0, 1, 0), f=f, theta=theta)


CLASP = 0.3   # how far the straight arms converge toward the laced hands


def arms_long(pose, clasp=True):
    """Arms straight along the mat away from the head (toward +Y), hands
    together (fingers interlaced) or shoulder-wide."""
    at = fk(pose)
    for side, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{side}']
        wrist = add(sh, n((-sx * (CLASP if clasp else 0.0), 1, -0.08)), UPPER + FORE - 0.002)
        arm(pose, side, wrist, (0, 0, 1), (-sx * (CLASP if clasp else 0.0), 1, -0.1))
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
    interlaced round the back of the head (the -Y side of the crown). The
    wrists sit 13 cm behind the crown and the fingers rise along the head
    rather than into it (the clearance check: at 11 cm, fingers aimed at
    the head, they sank up to 2.7 cm into the skull)."""
    at = fk(pose)
    c = at['crown']
    for side, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{side}']
        elbow = on_floor(sh, UPPER, 0.043, (0, 1, 0))
        elbow = (sx * max(abs(elbow[0]), 0.19), elbow[1], elbow[2])
        pose[f'upperarm.{side}'] = n(sub(elbow, sh))
        aim = (sx * 0.08, c[1] - 0.13, 0.035)
        wrist = add(elbow, n(sub(aim, elbow)), FORE)
        pose[f'forearm.{side}'] = n(sub(wrist, elbow))
        pose[f'hand.{side}'] = n((-sx * 0.4, -0.1, 1))
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
    """The knees drawn toward the chest, both feet off the mat together (the
    thighs stop short of the belly: folded further they sank 2 cm into it)."""
    return headstand(spine=((0, 0.05, 1), (0, 0.05, 1), (0, 0.1, 1)),
                     knees=((0, 0.8, -0.6), (0, -0.35, 0.94)))


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


def turn_hips(pose, deg):
    """Turn the hip line `deg` degrees about the upright trunk (on the
    shoulders): positive brings the right hip toward the face (-Y) and the
    left hip back — the pelvis turning under legs carried over to the left
    (+X), so the right thigh crosses in front of the pelvis instead of
    through it (the clearance check)."""
    t = math.radians(deg)
    pose['hipbone.L'] = (math.cos(t), math.sin(t), 0.15)
    pose['hipbone.R'] = (-math.cos(t), -math.sin(t), 0.15)
    return pose


def plough(arms='back', spread=0.0, side=0.0, hip_turn=0.0):
    """Halasana's frame: the hips over the head, both legs straight over it
    to the mat. `arms` = 'back' (palms on the back), 'long' (straight on the
    mat behind, fingers laced) or 'apart' (straight on the mat, shoulder-wide:
    the way between the two — a forearm swung straight from the back to the
    laced hands passes through the other arm, the clearance check says)."""
    pose = on_shoulders(up=(0, -0.12, 1))
    if hip_turn:
        turn_hips(pose, hip_turn)
    if arms == 'back':
        # the hips over the head tip the back: the palms higher up it, nearer
        # the spine, so the elbows stay shoulder-wide on the mat (clearance)
        hands_on_back(pose, f=1.0, theta=36.0)
    else:
        arms_long(pose, clasp=arms == 'long')
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


# --- sitting, and the crossed legs of the lotus family ----------------------------
# The seated body sits back along the mat (the camera pivots on the Z axis:
# a long sitting with the legs forward then stays inside the frame in side
# view), its pelvis joint low enough that the hips' hull rests ON the mat.
SEAT = (0, 0.25, 0.10)
# the whole seated figure, legs forward (side view); and a closer one for the
# crossed legs (front view), so they read in the app's disc at 360 px
SEATED_FRAME = {'center_z': 0.42, 'scale': 1.3}
LOTUS_FRAME = {'center_z': 0.40, 'scale': 1.02}
# the lotus upside down: the shoulderstand's crossed legs, framed close from
# the mat up past the knees
INVERTED_LOTUS_FRAME = {'center_z': 0.58, 'scale': 1.3}
KNEE_FLOOR = 0.06       # a knee resting on the mat: its joint this high (the hull just touching)
# measured hull radii (SKIN_FIT, via _hull.py): the thigh's section at the
# hip and at the knee, the ankle's
R_HIP = sum(H.SKIN_FIT['hip']) / 2
R_KNEE = sum(H.SKIN_FIT['knee']) / 2
R_ANKLE = max(H.SKIN_FIT['ankle'])


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def scale(a, s):
    return tuple(x * s for x in a)


def sit(lean=0.0, at=SEAT):
    """Sitting upright on the mat, the pelvis joint at `at`; `lean` tips the
    trunk toward the front. Legs and arms are left for the caller."""
    t = n((0, -lean, 1))
    return {'pelvis.location': sub(at, J['pelvis']), 'pelvis': t, 'spine.lower': t, 'spine.upper': t}


def pelvis_frame(pose):
    """The pelvis's own axes from a solved pose: the midpoint of the hips,
    `side` toward the mannequin's left, `up` toward the waist, `front` =
    side × up (at rest -Y, the way the face points). The lotus solvers work
    in these axes, so one crossing of the legs rides into any trunk: sitting,
    lying back, upside down or folded."""
    at = fk(pose)
    o = add(at['hip.L'], sub(at['hip.R'], at['hip.L']), 0.5)
    side = n(sub(at['hip.L'], at['hip.R']))
    up = n(sub(at['waist'], at['pelvis']))
    up = n(add(up, side, -dot(up, side)))
    return o, side, up, cross(side, up)


def lap(pose, flex=90.0, front=None):
    """The lap's axes for hips flexed `flex` degrees (90 = sitting, the thighs
    square to the trunk; 0 = the thighs in line with it, as in the lotus
    shoulderstands; toward 180 = folded onto the trunk): (origin, side, fwd,
    nrm) — `fwd` the way the thighs go, `nrm` the lap's upper face (the way
    crossed feet turn their soles). `front` overrides the way the belly
    faces: the lying and upside-down poses are mirror-labelled (their left
    is +X, as FLAT's is), so side × up points to the BACK there — pass the
    world direction the chest faces (the shoulderstands: -Y)."""
    o, side, up, front0 = pelvis_frame(pose)
    front = front0 if front is None else n(add(add(front, up, -dot(front, up)), side, -dot(front, side)))
    c, s = math.cos(math.radians(flex)), math.sin(math.radians(flex))
    fwd = n(add(scale(up, -c), front, s))
    nrm = n(add(scale(front, c), up, s))
    return o, side, fwd, nrm


def knee_on(hip, ankle, axis, height, out):
    """The knee a thigh from `hip` and a shin from `ankle`: the two spheres
    meet in a circle, and of its points at `height` along `axis` (a plane in
    whatever frame the caller measures), the one furthest along `out`.
    The circle's basis starts from the Cartesian axis least aligned with
    hip → ankle, so any direction works. When the circle lies square to
    `axis` its height is one number: at that height every point qualifies
    and the one furthest along `out` is taken; elsewhere, as whenever the
    circle never reaches `height`, a reach warning says how far off it is
    and the nearest points are used."""
    d = dist(hip, ankle)
    if d >= THIGH + SHIN:
        _warn_reach(d, THIGH + SHIN, ankle)
        return add(hip, n(sub(ankle, hip)), THIGH)
    u = n(sub(ankle, hip))
    x = (THIGH * THIGH - SHIN * SHIN + d * d) / (2 * d)
    r = math.sqrt(max(THIGH * THIGH - x * x, 0.0))
    c = add(hip, u, x)
    ref = min(((1, 0, 0), (0, 1, 0), (0, 0, 1)), key=lambda e: abs(dot(e, u)))
    e1 = n(add(ref, u, -dot(ref, u)))
    e2 = cross(u, e1)
    a1, a2 = r * dot(e1, axis), r * dot(e2, axis)
    rr = math.hypot(a1, a2)
    want = height - dot(c, axis)

    def on_circle(th):
        return add(add(c, e1, r * math.cos(th)), e2, r * math.sin(th))
    if rr < 1e-9:
        # the circle is square to `axis`: all of it sits at one height
        if abs(want) > 0.005:
            print(f'reach warning [library/{_who[0]}]: a knee cannot come to {height:.3f} m along '
                  f'({axis[0]:.2f}, {axis[1]:.2f}, {axis[2]:.2f}); the circle is {abs(want):.3f} m away',
                  file=sys.stderr)
        return on_circle(math.atan2(dot(out, e2), dot(out, e1)))
    if abs(want) > rr + 0.005:
        print(f'reach warning [library/{_who[0]}]: a knee cannot come to {height:.3f} m along '
              f'({axis[0]:.2f}, {axis[1]:.2f}, {axis[2]:.2f}); it is {abs(want) - rr:.3f} m short',
              file=sys.stderr)
    base = math.atan2(a2, a1)
    spread = math.acos(max(-1.0, min(1.0, want / rr)))
    return max((on_circle(base + spread), on_circle(base - spread)), key=lambda p: dot(p, out))


def knee_out(hip, side, fwd, nrm, sx, spread, drop):
    """A knee a thigh from `hip`, `spread` degrees out from `fwd` toward its
    own side (`sx` = +1 left, -1 right) and `drop` below the hip along the
    lap's `nrm` (on the mat, sitting)."""
    b = math.asin(max(-1.0, min(1.0, drop / THIGH)))
    h = add(scale(fwd, math.cos(math.radians(spread))), side, sx * math.sin(math.radians(spread)))
    return add(hip, add(scale(h, math.cos(b)), nrm, -math.sin(b)), THIGH)


def rest_on(a, b, ra, rb, knee, around, lift, nrm, toward, pick='near'):
    """An ankle resting ON a limb's rendered surface: the limb's axis runs
    from `a` (hull radius `ra`) to `b` (`rb`); the ankle sits on the side
    facing `nrm` turned `around` degrees toward `toward` (the midline, for a
    crossed leg), `lift` clear of the two hulls — and a shin's length from
    `knee`, so the leg reaches it. Of the places along the limb that satisfy
    both, the one nearest `a` (`pick='near'`) or `b` ('far'). Returns
    (ankle, the surface's outward direction there, t along the limb), or
    Nones when the shin cannot reach the limb at that angle."""
    d = n(sub(b, a))
    top = n(add(nrm, d, -dot(nrm, d)))
    w = add(toward, d, -dot(toward, d))
    w = n(add(w, top, -dot(w, top)))
    th = math.radians(around)
    v = n(add(scale(top, math.cos(th)), w, math.sin(th)))

    def at_t(t):
        return add(add(a, sub(b, a), t), v, ra + (rb - ra) * t + R_ANKLE + lift)

    def f(t):
        return dist(at_t(t), knee) - SHIN
    roots = []
    ts = [i / 200 for i in range(201)]
    for lo, hi in zip(ts, ts[1:]):
        if f(lo) * f(hi) <= 0:
            for _ in range(40):
                m = (lo + hi) / 2
                lo, hi = (lo, m) if f(lo) * f(m) <= 0 else (m, hi)
            roots.append((lo + hi) / 2)
    if not roots:
        return None, None, None
    t = roots[0] if pick == 'near' else roots[-1]
    return at_t(t), v, t


def _rest_or_warn(found, what):
    if found[0] is None:
        print(f'reach warning [library/{_who[0]}]: {what}: the shin cannot reach it', file=sys.stderr)
    return found


def set_leg(pose, side, knee, ankle):
    """Aim a thigh at `knee` and its shin at `ankle` (the caller keeps the lengths)."""
    hip = fk(pose)[f'hip.{side}']
    pose[f'thigh.{side}'] = n(sub(knee, hip))
    pose[f'shin.{side}'] = n(sub(ankle, knee))
    return pose


def _sole_rest():
    """The sole at rest: the side of the foot where the rig's own heel spur and
    ball swelling lie (`_hull.SKIN_EXTRA`), square to the foot."""
    ankle, toes = H.J['ankle.L'], H.J['toes.L']
    d = n(sub(toes, ankle))
    s = (0.0, 0.0, 0.0)
    for v in ('heel.L', 'ball.L'):
        s = add(s, sub(H.SKIN_EXTRA[v][0], ankle))
    return n(add(s, d, -dot(s, d)))


SOLE_REST = _sole_rest()


def foot_sole(pose, side, facing, dir=None):
    """Aim `foot.<side>` along `dir` (else its current direction) and ROLL it
    so its sole — the heel and ball side — faces `facing` as nearly as the
    foot's direction allows. The roll is the right-handed turn about the
    foot's own axis that the renderer applies after aiming; the shin's world
    rotation (`_hull.apply_stage`) says where the sole starts."""
    bone = f'foot.{side}'
    d = n(dir) if dir is not None else direction(pose, bone)
    q, _ = H.apply_stage({**pose, bone: d})
    sole = H.q_rot(q[bone], SOLE_REST)
    sole = n(add(sole, d, -dot(sole, d)))
    want = n(add(facing, d, -dot(facing, d)))
    ang = math.degrees(math.atan2(dot(cross(sole, want), d), dot(sole, want)))
    pose[bone] = {'dir': d, 'roll': round(ang, 3)}
    return pose


def sole_facing(pose, side):
    """Where the sole of `foot.<side>` faces in the solved pose (a unit vector)."""
    q, _ = H.apply_stage(pose)
    d = direction(pose, f'foot.{side}')
    s = H.q_rot(q[f'foot.{side}'], SOLE_REST)
    return n(add(s, d, -dot(s, d)))


def crossed_foot(pose, side, nrm, radial, hug=0.3):
    """A crossed foot lying over the other thigh: it carries on from its shin
    across the thigh, along the thigh's surface where the ankle rests
    (`radial` = the surface's outward normal there), bending `hug` round it,
    the sole turned up (toward `nrm`)."""
    sh = direction(pose, f'shin.{side}')
    d = n(add(add(sh, radial, -dot(sh, radial)), radial, -hug))
    return foot_sole(pose, side, nrm, d)


# THE LOTUS ON THIS HULL (measured with the clearance check, 2026-09-29):
# with both knees on the mat and both ankles resting on the thighs, the two
# shins cross at almost the same height and pass 3-4 cm into each other
# whatever the angles (a search over knee spread, where each ankle sits
# round its thigh and how far along it). What clears is the book's own
# order: the first foot rests ON the other thigh (on its inner upper side,
# a third of the way to the knee), and the second foot comes over it and
# rests ON the first shin where that shin lies across the lap, its ankle
# above the first leg's thigh. Knees ~30 degrees out from straight ahead,
# 0.64 m apart, on the mat.
LOTUS_SPREAD = (27.8, 31.2)     # degrees out from forward: the first knee, the second
LOTUS_FIRST = {'around': 68.4, 'lift': 0.006, 'pick': 'far'}    # on the other thigh
LOTUS_SECOND = {'around': 7.9, 'lift': 0.005, 'pick': 'near'}   # on the first shin
R_SHIN = (R_KNEE, sum(H.SKIN_FIT['ankle']) / 2)                 # the shin's hull at the knee, the ankle


def lotus(pose, first='R', flex=90.0, drop=0.02, spread=LOTUS_SPREAD, first_on=None, second_on=None, front=None):
    """Padmasana's legs, in the pelvis's own frame (`lap`), so the same
    crossing rides into any trunk: the `first` foot ON the other thigh near
    its root (`rest_on` the thigh's hull), then the second foot brought over
    it and resting ON the first shin as it crosses the lap, the second shin
    passing OVER the first. Both knees `drop` below the hips along the lap
    (on the mat, sitting) and `spread` degrees out from forward. The soles
    turn up (`foot_sole`), each foot lying along the limb it rests on."""
    second = 'L' if first == 'R' else 'R'
    o, side, fwd, nrm = lap(pose, flex, front)
    sx = {'L': 1, 'R': -1}
    at = fk(pose)
    hips = {s_: at[f'hip.{s_}'] for s_ in 'LR'}
    knees = {first: knee_out(hips[first], side, fwd, nrm, sx[first], spread[0], drop),
             second: knee_out(hips[second], side, fwd, nrm, sx[second], spread[1], drop)}
    p1 = {**LOTUS_FIRST, **(first_on or {})}
    p2 = {**LOTUS_SECOND, **(second_on or {})}
    ank1, v1, _ = _rest_or_warn(rest_on(hips[second], knees[second], R_HIP, R_KNEE, knees[first], p1['around'],
                                        p1['lift'], nrm, scale(side, -sx[second]), p1['pick']),
                                f'the {first} ankle on the {second} thigh')
    if ank1 is None:
        return pose
    set_leg(pose, first, knees[first], ank1)
    ank2, v2, _ = _rest_or_warn(rest_on(knees[first], ank1, R_SHIN[0], R_SHIN[1], knees[second], p2['around'],
                                        p2['lift'], nrm, scale(side, -sx[first]), p2['pick']),
                                f'the {second} ankle over the {first} shin')
    if ank2 is None:
        return pose
    set_leg(pose, second, knees[second], ank2)
    crossed_foot(pose, first, nrm, v1)
    crossed_foot(pose, second, nrm, v2)
    return pose


HALF_LOTUS = {'around': 20.0, 'lift': 0.004, 'pick': 'near'}   # on a thigh reaching straight forward


def half_lotus(pose, side, flex=90.0, drop=0.02, spread=30.0, on=None, front=None):
    """One foot (`side`) ON the other thigh near its root, sole up; the other
    leg stays exactly as the pose has it (`HALF_LOTUS` suits a straight
    other leg; pass `on=LOTUS_FIRST` over a bent one)."""
    other = 'L' if side == 'R' else 'R'
    o, s_, fwd, nrm = lap(pose, flex, front)
    p = {**HALF_LOTUS, **(on or {})}
    sx = 1 if side == 'L' else -1
    at = fk(pose)
    knee = knee_out(at[f'hip.{side}'], s_, fwd, nrm, sx, spread, drop)
    ankle, v, _ = _rest_or_warn(rest_on(at[f'hip.{other}'], at[f'knee.{other}'], R_HIP, R_KNEE, knee, p['around'],
                                        p['lift'], nrm, scale(s_, sx), p['pick']),
                                f'the {side} ankle on the {other} thigh')
    if ankle is None:
        return pose
    set_leg(pose, side, knee, ankle)
    return crossed_foot(pose, side, nrm, v)


SIDDHA = {'fwd': 0.2, 'stack': 0.095, 'ahead': 0.02}


def siddha(pose, first='L', flex=90.0, drop=0.02, out=0.45, both=True, **kw):
    """Siddhasana's legs: the `first` heel drawn in to the perineum (low, on
    the mat, just in front of the pelvis at the midline), the other heel
    stacked just above it at the pubic bone, its shin crossing over the
    first; both knees on the mat, wide. The lower foot lies forward along
    the other thigh, its sole turned to that thigh; the upper foot tucks in
    toward the first leg, between its thigh and calf, sole up and back.
    `both=False` sets only the first leg."""
    g = {**SIDDHA, **kw}
    second = 'R' if first == 'L' else 'L'
    o, side, fwd, nrm = lap(pose, flex)
    sx = {'L': 1, 'R': -1}
    base = add(o, fwd, g['fwd'])
    # the first ankle's hull just clear of the lap's floor (the mat, sitting)
    floor_h = dot(o, nrm) - drop - KNEE_FLOOR + R_ANKLE + 0.008
    ank = {first: add(base, nrm, floor_h - dot(base, nrm))}
    ank[second] = add(add(ank[first], nrm, g['stack']), fwd, g['ahead'])
    at = fk(pose)
    legs = (first, second) if both else (first,)
    for s in legs:
        hip = at[f'hip.{s}']
        knee = knee_on(hip, ank[s], nrm, dot(hip, nrm) - drop, add(scale(side, sx[s] * out), fwd, 1 - out))
        set_leg(pose, s, knee, ank[s])
    lo = legs[0]
    foot_sole(pose, lo, n(add(scale(side, -sx[lo]), nrm, 0.3)),
              n(add(add(fwd, side, -sx[lo] * 0.25), nrm, -0.15)))
    if both:
        foot_sole(pose, second, n(add(nrm, fwd, -0.6)),
                  n(add(add(scale(side, -sx[second]), fwd, 0.3), nrm, -0.2)))
    return pose


def hands_on_knees(pose, nrm=(0, 0, 1), only='LR'):
    """Arms stretched to the knees, the backs of the wrists resting on them,
    fingers forward and out (`only` = 'L' or 'R' for one hand)."""
    at = fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        if s not in only:
            continue
        k = at[f'knee.{s}']
        # on top of the knee, a little back along the thigh toward the hip
        wrist = add(add(k, nrm, R_KNEE + 0.05), n(sub(at[f'hip.{s}'], k)), 0.04)
        arm(pose, s, wrist, (sx, 0.4, -0.4), n((sx * 0.6, -1, -0.1)))
    return pose


def carry_foot(pose, side, landing, nrm, up=0.16, out=(0, 0, 0), hint=None):
    """One leg bent, the foot lifted clear above where it will be set down
    (`landing` + `up` along the lap's `nrm`, shifted by `out`), knee up and
    out, the sole already turned up — the midpoint of placing a crossed foot
    (a straight blend from the floor to the other thigh sweeps one shin
    through the other leg)."""
    sx = 1 if side == 'L' else -1
    hip = fk(pose)[f'hip.{side}']
    target = add(add(landing, nrm, up), out)
    th, sh = two_bone(hip, target, THIGH, SHIN, hint or add(nrm, (sx, 0, 0), 0.8))
    pose[f'thigh.{side}'], pose[f'shin.{side}'] = th, sh
    return foot_sole(pose, side, nrm, n(add(add(sh, nrm, -dot(sh, nrm)), (sx * -0.3, 0, 0))))


def lift_shin(pose, side, landing, nrm, up=0.14):
    """The thigh left where it is (the knee down), the shin raised so the
    foot hangs `up` above its landing along `nrm`, sole already up: how a
    second foot is carried over the first leg without lifting the thigh that
    leg rests on."""
    knee = fk(pose)[f'knee.{side}']
    sh = n(sub(add(landing, nrm, up), knee))
    pose[f'shin.{side}'] = sh
    return foot_sole(pose, side, nrm, n(add(sh, nrm, -dot(sh, nrm))))


def hand_on_thigh(pose, side, t=0.5, nrm=(0, 0, 1), gap=0.012):
    """A palm resting on top of its own thigh, `t` of the way to the knee,
    the fingers pointing along it toward the knee."""
    sx = 1 if side == 'L' else -1
    at = fk(pose)
    hip, knee = at[f'hip.{side}'], at[f'knee.{side}']
    d = n(sub(knee, hip))
    top = n(add(nrm, d, -dot(nrm, d)))
    palm = add(add(hip, sub(knee, hip), t), top, R_HIP + (R_KNEE - R_HIP) * t + PALM_R + gap)
    wrist = add(palm, d, -PALM_AT)
    arm(pose, side, wrist, (sx, 0.5, -0.3), d)
    return pose


def hand_to_ankle(pose, side, hand=None, gap=0.012):
    """One hand (`hand`, else the same side) cupping a lifted ankle from
    outside: the palm's hull just clear of the ankle's, the fingers along
    the foot."""
    hand = hand or side
    sx = 1 if hand == 'L' else -1
    at = fk(pose)
    ankle, toes = at[f'ankle.{side}'], at[f'toes.{side}']
    foot = n(sub(toes, ankle))
    out = n(add((sx, 0, 0), foot, -dot((sx, 0, 0), foot)))
    palm = add(ankle, out, R_ANKLE + PALM_R + gap)
    wrist = add(palm, foot, -PALM_AT)
    arm(pose, hand, wrist, (sx, 0.5, -0.3), foot)
    return pose


def palms_beside(pose, back=0.0, out=0.17):
    """Sitting: the palms flat on the mat beside the hips (`out` from each
    hip joint, `back` behind it), fingers forward."""
    at = fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        hip = at[f'hip.{s}']
        wrist = (hip[0] + sx * out, hip[1] + back, 0.11)
        arm(pose, s, wrist, (sx, 0.5, 0), n((sx * 0.1, -0.5, -1)))
    return pose


def legs_forward(pose, apart=0.0):
    """Sitting with the legs straight out in front, together (or each turned
    `apart` out toward its own side), toes up."""
    for s, sx in (('L', 1), ('R', -1)):
        d = n((sx * (apart - 0.02), -1, 0.0))
        pose[f'thigh.{s}'] = d
        pose[f'shin.{s}'] = d
        pose[f'foot.{s}'] = n((0, -0.35, 1))
    return pose
