"""
The lotus family's own helpers (a `_` file: never exported or previewed as
a sheet). Group D of the library fan-out: the seated lotus variations
(parvatasana, matsyasana, baddha padmasana, yoga mudrasana, ardha baddha
padma paschimottanasana) and the folded lotus in the shoulderstand
(pindasana, parsva pindasana).

It loads `_lib.py` ONCE and hands it on as `L`, so a sheet that loads this
file shares the helper's state (`L.begin` names the sheet in the warnings):

    _spec = importlib.util.spec_from_file_location('_library_lotus', Path(__file__).resolve().parent / '_lotus.py')
    LT = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(LT)
    L = LT.L

Everything here builds on `_lib`'s pelvis-frame lotus (`lotus`,
`half_lotus`, `carry_foot`, `lift_shin`), so the crossing is the one
`padmasana.py` draws, carried into lying back, folding forward and turning
upside down.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)

n, add, sub, dot, dist, neg, scale, fk = L.n, L.add, L.sub, L.dot, L.dist, L.neg, L.scale, L.fk

# --- the seated lotus (padmasana.py's own recipe) ---------------------------------
def seated_lotus(lean=0.0):
    """Sitting in the lotus, right foot first (padmasana.py's `LOTUS` legs),
    the trunk tipped `lean` toward the front; arms left for the caller."""
    pose = L.sit(lean)
    return L.lotus(pose, first='R')


def lotus_hands_on_knees():
    """Padmasana's held form: the lotus, the backs of the wrists on the knees."""
    return L.hands_on_knees(seated_lotus())


def tipped(deg):
    """A trunk direction tipped `deg` degrees from straight up toward the
    front (-Y): 90 is level forward, beyond it the bone points down."""
    a = math.radians(deg)
    return (0, -math.sin(a), math.cos(a))


# THE FOLDED LOTUS (yoga mudrasana), measured with the clearance check: the
# pelvis tipped 45 degrees, the spine arching over the crossed shins, the
# neck and head hanging down in front of them. The chest comes to rest ON
# the uppermost heel (it cannot sink into it as the belly does in the book),
# so the crown stops about 9 cm above the mat — the nearest the head comes
# on this hull (a search over pelvis, spine, neck and head angles; lower,
# the head passes through the left shin or the chest through the heel).
# Degrees from upright toward the front: pelvis, spine.lower, spine.upper,
# neck, head.
FOLD = (45, 45, 65, 120, 165)


def folded_lotus(fold=FOLD):
    """The lotus folded forward from the hips: the lap kept level (`lap`'s
    `flex` follows the pelvis's tip, so the crossing is the seated one) and
    the knees set back on the mat. Arms left for the caller."""
    a, b, c, nk, hd = fold
    pose = {'pelvis.location': sub(L.SEAT, L.J['pelvis']), 'pelvis': tipped(a), 'spine.lower': tipped(b),
            'spine.upper': tipped(c), 'neck': tipped(nk), 'head': tipped(hd)}
    L.lotus(pose, first='R', flex=90 + a)
    at = fk(pose)
    kz = min(at['knee.L'][2], at['knee.R'][2])
    loc = pose['pelvis.location']
    pose['pelvis.location'] = (loc[0], loc[1], loc[2] + L.KNEE_FLOOR - kz)
    return pose


def lotus_knees_down(pose, flex, front=None, drop=0.04):
    """`_lib.lotus` (right foot first) with the knees set ON the mat: the
    crossing solved once, then again with the drop corrected by how far the
    knees missed (the knee height follows the drop almost one for one)."""
    trial = L.lotus({**pose}, first='R', flex=flex, drop=drop, front=front)
    at = fk(trial)
    kz = min(at['knee.L'][2], at['knee.R'][2])
    return L.lotus(pose, first='R', flex=flex, drop=drop + kz - L.KNEE_FLOOR, front=front)


# --- ardha baddha padma paschimottanasana: half lotus, one arm bound, a fold -----
# THE HALF-LOTUS FOLD, measured: the left foot on the right thigh near its
# root (`_lib.half_lotus`) sits in front of the belly, and the trunk
# folding over the straight right leg comes to rest on that foot. The
# deepest clean fold (a search over the five trunk angles with the
# clearance check) leaves the head about 21 cm from the right knee and
# the right shoulder 0.69 m from the right ankle, beyond the arm's reach:
# the right hand takes the shin as near the ankle as it reaches. Degrees
# from upright toward the front: pelvis, spine.lower, spine.upper, neck,
# head.
HALF_FOLD = (25, 35, 90, 130, 110)
# sitting up with the back concave and the gaze lifted (the catch)
HALF_UP = (25, 25, 25, 5, -10)
# the left arm round the back toward the left big toe in the half lotus
# (the foot lies nearer the right hip than in the full lotus): the fingers
# stop about 6 cm short sitting up and 8 cm short folded (searched, as BIND)
HALF_BIND_UP = {'wrist': (-0.15, 0.13, 0.08), 'hint': (1, 0.3, 1)}
HALF_BIND_FOLD = {'wrist': (-0.15, 0.24, 0.08), 'hint': (1, 1, 0.5)}


def half_seat(fold=(0, 0, 0, 0, 0)):
    """Sitting with the right leg straight and the left foot in half lotus
    on the right thigh (sole up), the trunk tipped by the five `fold`
    angles; the lap kept level under a tipped pelvis. Arms left for the
    caller."""
    a, b, c, nk, hd = fold
    pose = {'pelvis.location': sub(L.SEAT, L.J['pelvis']), 'pelvis': tipped(a), 'spine.lower': tipped(b),
            'spine.upper': tipped(c), 'neck': tipped(nk), 'head': tipped(hd)}
    L.legs_forward(pose)
    return L.half_lotus(pose, 'L', flex=90 + a)


def palm_behind(pose, side, out=0.24, back=0.26):
    """Sitting: one palm flat on the mat behind and outside its hip, the
    fingers pointing back (the hand then goes round the waist without
    sweeping through the pelvis)."""
    sx = 1 if side == 'L' else -1
    hip = fk(pose)[f'hip.{side}']
    L.arm(pose, side, (hip[0] + sx * out, hip[1] + back, 0.11), (sx, 0.5, 0), n((sx * 0.1, 0.5, -1)))
    return pose


def hand_down_leg(pose, side, gap=0.012, margin=0.01, out=0.8):
    """One hand on its own straight leg as near the ankle as the arm
    reaches (the shin, when the foot is beyond reach), the palm on the
    outer upper side of the leg (`out`: 0 on top, larger further round to
    the outside, where the hand arrives from the mat without passing
    through the shin), the fingers along the leg toward the foot."""
    sx = 1 if side == 'L' else -1
    at = fk(pose)
    sh, hip, knee, ankle = at[f'shoulder.{side}'], at[f'hip.{side}'], at[f'knee.{side}'], at[f'ankle.{side}']
    d = n(sub(ankle, hip))
    face = n((sx * out, 0, 1))
    top = n(add(face, d, -dot(face, d)))
    best = None
    for i in range(101):
        t = i / 100
        p = add(hip, sub(ankle, hip), t)
        r = L.R_HIP + (L.R_KNEE - L.R_HIP) * min(1.0, 2 * t) if t < 0.5 else L.R_KNEE + (L.R_ANKLE - L.R_KNEE) * (2 * t - 1)
        palm = add(p, top, r + L.PALM_R + gap)
        wrist = add(palm, d, -L.PALM_AT)
        if dist(sh, wrist) <= L.UPPER + L.FORE - margin:
            best = wrist
    L.arm(pose, side, best, (sx, 0.3, 0.3), d)
    return pose


# --- matsyasana: lying back in the lotus ------------------------------------------
# Matsyasana lies straight BACK from the seated lotus, so its body is the
# seated one turned about X: the head toward +Y, the chest to the ceiling,
# the left still +X (not the library's mirror-labelled LIE, whose head is
# toward -Y). The seat is moved forward so the lying body sits across the
# camera's pivot.
BACK_SEAT = (0, -0.22, 0.10)
BACK_CLAVICLE = {'clavicle.L': (1, 0.2, 0), 'clavicle.R': (-1, 0.2, 0)}   # the rest shoulder line, laid back
BACK_HIPBONE = {'hipbone.L': (1, -0.2, 0), 'hipbone.R': (-1, -0.2, 0)}


def back(deg):
    """A trunk direction for the body lying back (head toward +Y), lifted
    `deg` degrees off the mat; negative dips it toward the floor (the neck
    and head of the arch). 90 is sitting upright."""
    a = math.radians(deg)
    return (0, math.cos(a), math.sin(a))


# the arch, measured: the pelvis on the mat tipped 25 degrees, the chest
# lifted, the neck and head dropping back so the crown rests on the mat
# (its joint within a centimetre of it; a search over the five angles with
# the clearance check). Degrees off the mat: pelvis, spine.lower,
# spine.upper, neck, head.
ARCH = (25, 55, 0, -50, -100)
FLAT = (0, 0, 0, 0, 0)


def lying_lotus(arch=FLAT):
    """On the back in the lotus, the knees on the mat; `arch` gives the five
    trunk angles (ARCH: the chest lifted onto the crown). The pelvis joint
    sits at the lying height of `_lib.LIE`. The lap follows the
    pelvis's tip (`flex`), so the crossing is the seated one laid down.
    Arms left for the caller."""
    tp, tl, tu, tn, th = arch
    z = L.LIE_AT['pelvis'][2]
    pose = {'pelvis.location': sub((BACK_SEAT[0], BACK_SEAT[1] + 0.02, z), L.J['pelvis']),
            'pelvis': back(tp), 'spine.lower': back(tl), 'spine.upper': back(tu), 'neck': back(tn), 'head': back(th),
            **BACK_CLAVICLE, **BACK_HIPBONE}
    return lotus_knees_down(pose, flex=tp)


def arms_on_mat(pose, spread=0.5):
    """Lying back: both arms long on the mat, angled `spread` out from the
    sides toward the feet (clear of the lotus's wide thighs), palms down."""
    for s, sx in (('L', 1), ('R', -1)):
        d = n((sx * spread, -1, 0))
        pose[f'upperarm.{s}'] = d
        pose[f'forearm.{s}'] = d
        pose[f'hand.{s}'] = n((sx * spread, -1, -0.05))
    return pose


# the hands on the crossed legs in the arch (plate 55's grip, as the arms
# reach): each hand round the OTHER leg's foot, which lies on its own side
# of the lap — `along` from that ankle toward the toes, the wrist `out` to
# the arm's side and `back` toward the head; elbow hint (out, back, up).
# Searched with the clearance check for the lowest elbow.
HOLD = {'L': {'along': 0.6, 'out': 0.09, 'back': 0.08, 'hint': (1, 0, -1)},
        'R': {'along': 0.9, 'out': 0.09, 'back': 0.08, 'hint': (-1, 0, -1)}}


def hold_feet(pose):
    """Lying back: the left hand holding the right foot and the right hand
    the left foot, the palms round them toward the knees."""
    at = fk(pose)
    for s, sx, other in (('L', 1, 'R'), ('R', -1, 'L')):
        g = HOLD[s]
        a, t = at[f'ankle.{other}'], at[f'toes.{other}']
        wrist = add(add(a, sub(t, a), g['along']), (sx * g['out'], g['back'], 0))
        L.arm(pose, s, wrist, g['hint'], n((-sx * 0.2, -0.6, -0.4)))
    return pose


def on_elbows(lean=26.0):
    """Leaning back from the lotus onto the elbows: the trunk `lean` degrees
    off the mat, each elbow under its shoulder on the mat and the forearm
    along it toward the knees, palms down."""
    pose = {'pelvis.location': sub(BACK_SEAT, L.J['pelvis']), 'pelvis': back(lean), 'spine.lower': back(lean),
            'spine.upper': back(lean), 'neck': back(lean + 15), 'head': back(lean + 25)}
    lotus_knees_down(pose, flex=lean)
    at = fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{s}']
        elbow = L.on_floor(sh, L.UPPER, 0.045, (sx * 0.15, 0.3, 0))
        pose[f'upperarm.{s}'] = n(sub(elbow, sh))
        pose[f'forearm.{s}'] = n((sx * 0.25, -1, 0.02))
        pose[f'hand.{s}'] = n((sx * 0.25, -1, -0.05))
    return pose


# --- pindasana: the lotus folded down over the face in the shoulderstand ---------
# (the shoulderstand poses are mirror-labelled: the chest's direction is
# given to `lap`, as `urdhva_padmasana_in_sarvangasana.py` does)
CHEST = (0, -1, 0)
LOTUS_UP_FLEX = -10.0     # urdhva padmasana: the crossed thighs in line with the trunk, a little behind it
# THE FOLDED LOTUS UPSIDE DOWN, measured: the hips a little over the face
# and the crossed thighs folded 122 degrees from the trunk line; folded
# further, the crossed feet press into the belly (the clearance check), so
# the knees stop about 44 cm from the head instead of resting on it.
PINDA_FLEX = 122.0
PINDA_UP = (0, -0.1, 1)
# the palms higher up the back and nearer the spine with the hips over the
# face (the plough's own hands: `_lib.plough`), so the elbows stay grounded
PINDA_HANDS = {'f': 1.0, 'theta': 36.0}


def lotus_up():
    """Urdhva padmasana in sarvangasana: the shoulderstand, palms on the
    back, the crossed legs stretched up (right foot first)."""
    pose = L.on_shoulders(up=(0, 0.05, 1))
    L.hands_on_back(pose)
    return L.lotus(pose, first='R', flex=LOTUS_UP_FLEX, front=CHEST)


def half_up():
    """On the way into (and out of) the lotus upside down: the right foot on
    the left thigh, the left leg still straight up."""
    pose = L.on_shoulders(up=(0, 0.05, 1))
    L.hands_on_back(pose)
    L.legs_vertical(pose, lean=(0, -0.03, 1))
    return L.half_lotus(pose, 'R', flex=LOTUS_UP_FLEX, front=CHEST)


def pinda(up=PINDA_UP, flex=PINDA_FLEX, hips=None):
    """Pindasana: the crossed legs folded down from the hips over the face,
    the palms on the back. `hips` = (turn, tilt) degrees turns the hip line
    about the upright trunk and tips it (parsva pindasana)."""
    pose = L.on_shoulders(up=up)
    if hips:
        turn, tilt = (math.radians(a) for a in hips)
        side = (math.cos(turn) * math.cos(tilt), math.sin(turn) * math.cos(tilt), math.sin(tilt))
        pose['hipbone.L'] = n(add(side, (0, 0, 0.15)))
        pose['hipbone.R'] = n(add(neg(side), (0, 0, 0.15)))
    L.hands_on_back(pose, **PINDA_HANDS)
    return L.lotus(pose, first='R', flex=flex, front=CHEST)


# PARSVA PINDASANA, measured: the folded lotus carried round to the right
# (-X, the side of the R-labelled shoulder) — the hip line turned 60
# degrees about the upright trunk and tipped 10. The trunk itself cannot
# lean to the side: a trunk bone aimed off the exact upside-down line
# sideways turns about a diagonal and the hips swing front to back (the
# library test's "hips and chest across the body"). The knees come down
# only part way: the right knee to about 27 cm off the mat beside the
# head, the left knee staying up over it, some 38 cm high (the book's left
# knee by the right ear, both knees on the floor, needs the thighs folded
# further than the crossed feet allow on this hull; a search over turn,
# tip and fold). `side='L'` mirrors it.
PARSVA = {'up': (0.0, -0.1, 1), 'hips': (-60, 10)}


def parsva_pinda(side='R'):
    """Parsva pindasana, the folded lotus swung down toward `side`."""
    sx = 1 if side == 'R' else -1
    up = (sx * PARSVA['up'][0], PARSVA['up'][1], PARSVA['up'][2])
    turn, tilt = PARSVA['hips']
    return pinda(up=up, hips=(sx * turn, sx * tilt))


# --- parvatasana: the arms stretched overhead, fingers laced ----------------------
# the wrists this far either side of the midline: closer (7 cm) the palms
# pass into the other hand's fingers (the laced-hands rule exempts only the
# finger regions); the hands tipped up a little, as a roof over the head
LACE_X = 0.09
LACE_TILT = 0.3
BOWED = {'neck': n((0, -0.5, 0.85)), 'head': n((0, -0.75, 0.6))}   # the chin down on the breastbone


def laced_up(pose, reach=0.53, x=LACE_X, tilt=LACE_TILT):
    """Both arms stretched straight up over the head, the wrists `x` either
    side of the midline and the hands turned in to lace (palms up)."""
    at = fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{s}']
        L.arm(pose, s, (sx * x, sh[1] + 0.02, sh[2] + reach), (sx, 0, 0), n((-sx, 0, tilt)))
    return pose


def laced_forward(pose, reach=0.5, x=LACE_X, drop=0.02):
    """Both arms stretched forward at shoulder height, the fingers laced, the
    palms turned out (the hands point in toward each other)."""
    at = fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{s}']
        L.arm(pose, s, (sx * x, sh[1] - reach, sh[2] - drop), (sx, 0, -0.3), n((-sx, -LACE_TILT, 0)))
    return pose


def in_pelvis(pose, a, b, c, front=None):
    """A point `a` toward the mannequin's left, `b` up the trunk and `c`
    behind the back from the hips' midpoint, in the pelvis's own frame (so
    it rides into a fold). `front` as `_lib.lap` (mirror-labelled poses)."""
    o, side, up, fr = L.pelvis_frame(pose)
    if front is not None:
        fr = n(add(add(front, up, -dot(front, up)), side, -dot(front, side)))
    return add(add(add(o, side, a), up, b), fr, -c)


def pelvis_dir(pose, a, b, c):
    """A direction `a` left, `b` up, `c` back in the pelvis's own frame."""
    _, side, up, fr = L.pelvis_frame(pose)
    return n(add(add(scale(side, a), up, b), fr, -c))


# --- the bind behind the back (baddha padmasana) ----------------------------------
# THE ARMS ARE SHORT OF THE FEET: in this rig's lotus the feet rest well in
# front of the hip line (the measured crossing, `_lib.lotus`), and a hand
# carried round the back stops beside the opposite hip — about 30 cm short
# of its big toe sitting up, 17-19 cm folded forward (searched over wrist
# places and elbow hints, the clearance check on). The bind is drawn as far as it goes:
# each forearm across the back to the far hip, the hand turned toward its
# foot. The first arm crosses closer to the back and higher, the second
# further out and lower, so the two forearms stack instead of meeting.
# Wrist places and elbow hints in the pelvis frame: (left, up, back).
BIND = {
    'L': {'wrist': (-0.15, 0.18, 0.13), 'hint': (1, 0.3, 1)},
    'R': {'wrist': (0.05, 0.12, 0.23), 'hint': (-1, 0.3, 1)},
}


def bind(pose, side, spec=None):
    """One arm swung back round the waist, the hand by the far hip, turned
    toward the big toe of the same side's foot (as far as the arm reaches)."""
    g = spec or BIND[side]
    wrist = in_pelvis(pose, *g['wrist'])
    toe = fk(pose)[f'toes.{side}']
    L.arm(pose, side, wrist, pelvis_dir(pose, *g['hint']), n(sub(toe, wrist)))
    return pose


SWING = (0.6, -0.7, 0.8)    # an arm swung back from the shoulder: out, a little down, back (the lead-in to a bind)


def swing_back(pose, side, d=SWING, reach=0.5):
    """One arm swung out and back from the shoulder, nearly straight, the
    hand clear of the knee and the hip: the midpoint between the hand on the
    knee and the hand behind the back (a straight blend drags the hand
    through the thigh)."""
    sx = 1 if side == 'L' else -1
    sh = fk(pose)[f'shoulder.{side}']
    dd = pelvis_dir(pose, sx * d[0], d[1], d[2])
    L.arm(pose, side, add(sh, dd, reach), pelvis_dir(pose, 0, -0.3, 1), dd)
    return pose


def bind_shortfall(pose, side):
    """How far the fingertips stop short of the big toe (metres) — the gap
    the report records; never printed by a sheet."""
    at = fk(pose)
    return dist(at[f'fingers.{side}'], at[f'toes.{side}'])
