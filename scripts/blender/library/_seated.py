"""
Helpers for the SEATED family's library sheets (a `_` file: a helper,
never exported or previewed as a sheet): dandasana, the two boats, the
hero and its reclining form, the bound angle. Loaded like `_lib.py`, which
it imports; `_lib.py` stays untouched.

- `hull_low` / `ground`: the rendered hull's lowest point (`_hull`'s own
  samples, the live figure's body) and a whole-body shift that rests it ON
  the mat, so a seat sits on the buttocks' skin, not on the bones.
- `frame_excess` / `frame_check`: the library test's framing rule in
  Python (the hull inside the camera square, a 4 % margin, clear of the
  disc's rounded corners), a `frame warning` before the sheet is exported.
- Seats: `seat` (upright at a place along the mat: the camera pivots on
  the Z axis, so a long sitting is centred by where it sits), `staff_legs`,
  `palms_down` (palms flat by the hips, fingers toward the feet),
  `hands_on_thighs` (on the outer top, so a hand leaves them outside the
  leg), `boat` / `back_at` (balanced on the buttocks, the pelvis rolled
  back further than the chest so the hip crease stays open: at one angle
  the thighs pass into the belly), `arms_forward`, `hands_behind_head`.
- The hero: `hero_legs` (knees together, the shins folded back along the
  mat outside the hips, soles up), `hero_kneel`, `hero_at` (the seat
  placed by its knees, any trunk: upright, on the elbows, lying back),
  `elbows_down`, `arms_along`, `arms_up_laced`, `palms_on_soles`.
- The bound angle: `angle_legs` (the soles together, the heels in, the
  knees out and down, or up at `knee_z`), `hands_over_feet`,
  `hands_round_feet`.
"""
import importlib.util
import math
import sys
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
H = L.H

n, add, sub, dot, dist, scale = L.n, L.add, L.sub, L.dot, L.dist, L.scale

VIEW_DEG = {'front': 0, 'quarter': -35, 'side': -90, 'quarter-back': -145, 'back': 180}


# --- the rendered hull ------------------------------------------------------------
ARM_BONES = {f'{b}.{s}' for b in ('upperarm', 'forearm', 'hand') for s in 'LR'}


def hull_points(pose, skip=()):
    """Every sample point of the rendered hull (`clearance.ts hullPoints`),
    leaving out the pieces carried by the bones in `skip`."""
    s = H.solve(pose)
    pts = []
    for p in H.PIECES:
        bone = p['tube']['bone'] if 'tube' in p else p['joint']['bone']
        if bone in skip:
            continue
        pts.extend(H._samples(p, H._place(s, p)))
    return pts


def hull_low(pose, skip=()):
    return min(p[2] for p in hull_points(pose, skip))


def ground(pose, rest=0.002, arms=False):
    """Shift the whole body up or down so the hull's lowest point rests
    `rest` above the mat (the arms left out unless `arms`: they are posed
    after the seat is set down)."""
    loc = pose.get('pelvis.location', (0, 0, 0))
    low = hull_low(pose, () if arms else ARM_BONES)
    pose['pelvis.location'] = (loc[0], loc[1], loc[2] + rest - low)
    return pose


def frame_excess(pose, view, frame):
    """How far (a fraction of the half-frame) the hull pokes outside the
    camera square with the library test's 4 % margin and rounded corners:
    <= 0 fits."""
    az = math.radians(VIEW_DEG[view])
    half = frame['scale'] / 2
    lim, c = 0.96, 0.15
    worst = -1e9
    for p in hull_points(pose):
        a = abs(p[0] * math.cos(az) + p[1] * math.sin(az)) / half
        b = abs(p[2] - frame['center_z']) / half
        e = max(a, b) - lim if (a <= lim - c or b <= lim - c) else math.hypot(a - (lim - c), b - (lim - c)) - c
        worst = max(worst, e)
    return worst


def frame_check(posture):
    """Warn (stderr) for a held stage whose hull leaves its camera square."""
    for i, st in enumerate(posture['stages']):
        view = st.get('view', posture['view'])
        frame = {**posture['frame'], **st.get('frame', {})}
        e = frame_excess(st['pose'], view, frame)
        if e > 0:
            print(f"frame warning [{posture['id']}]: #{i} {st['label']!r} {e * 100:.1f} % of the half-frame "
                  f'outside', file=sys.stderr)
    return posture


# --- sitting ---------------------------------------------------------------------------
def seat(y, lean=0.0):
    """Sitting upright (or leaning `lean` toward the front) with the pelvis
    joint over the mat at `y`; lowered onto the mat by `ground` later."""
    return L.sit(lean, at=(0, y, L.SEAT[2]))


def staff_legs(pose, apart=0.0):
    """The legs straight out in front, together, knees and feet up (toes to
    the ceiling)."""
    return L.legs_forward(pose, apart)


def palms_down(pose, back=None, out=0.19, z=0.045, bend=0.0):
    """Palms flat on the mat by the hips, fingers toward the feet (-Y): each
    wrist `out` from its hip. With `back` (metres behind the hip joint) the
    wrist goes exactly there and the elbow bends back; without it the arm
    is straight (`bend` metres short of straight: the elbows soften) and
    its length says how far behind the wrist lands."""
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        sh, hip = at[f'shoulder.{s}'], at[f'hip.{s}']
        x = hip[0] + sx * out
        if back is not None:
            L.arm(pose, s, (x, hip[1] + back, z), (sx * 0.4, 1, 0.1), L.flat_hand((sx * 0.08, -1, 0)))
            continue
        reach = L.UPPER + L.FORE - 0.003 - bend
        # the wrist on the mat at height z, `out` across, at the arm's length
        dz, dx = sh[2] - z, sh[0] - x
        run = reach * reach - dz * dz - dx * dx
        y = sh[1] + (math.sqrt(run) if run > 0 else 0.0)
        wrist = (x, y, z)
        L.arm(pose, s, wrist, (sx * 0.3, 1, 0), L.flat_hand((sx * 0.08, -1, 0)))
    return pose


def hands_on_thighs(pose, t=0.45, out=0.8):
    """Each palm resting on its thigh, on the outer top (`out` of the way
    round toward its own side): from there the hand reaches the mat outside
    the thigh, never through it."""
    for s, sx in (('L', 1), ('R', -1)):
        L.hand_on_thigh(pose, s, t=t, nrm=n((sx * out, 0, 1)))
    return pose


def back_at(deg):
    """A trunk direction `deg` degrees back from upright (toward +Y)."""
    r = math.radians(deg)
    return (0, math.sin(r), math.cos(r))


def boat(recline, legs, y=0.30, pelvis=None, chest=None):
    """Balanced on the buttocks: the trunk reclined `recline` degrees back
    from upright (the pelvis rolled back further, `pelvis` degrees, and the
    chest lifted, `chest` degrees, if given: the hip crease stays open), the
    straight legs raised `legs` degrees from the floor, toes pointing on;
    set down on the mat later (`ground`)."""
    t = back_at(recline)
    pose = L.sit(0.0, at=(0, y, L.SEAT[2]))
    pose.update({'pelvis': back_at(pelvis if pelvis is not None else recline), 'spine.lower': t,
                 'spine.upper': back_at(chest if chest is not None else recline),
                 'neck': n(add(t, (0, -0.25, 0))), 'head': n(add(t, (0, -0.3, 0)))})
    g = math.radians(legs)
    for s, sx in (('L', 1), ('R', -1)):
        d = n((-sx * 0.02, -math.cos(g), math.sin(g)))
        pose[f'thigh.{s}'] = d
        pose[f'shin.{s}'] = d
        pose[f'foot.{s}'] = n(add(d, (0, -0.25, 0.05)))
    return pose


def arms_forward(pose, wide=0.03, drop=0.0):
    """Arms stretched forward level with the shoulders (palms facing), a
    little wider than the shoulders so they pass outside the thighs."""
    for s, sx in (('L', 1), ('R', -1)):
        d = n((sx * wide, -1, -drop))
        pose[f'upperarm.{s}'] = d
        pose[f'forearm.{s}'] = d
        pose[f'hand.{s}'] = d
    return pose


def hands_behind_head(pose, back=0.035, low=0.03, elbow_out=1.0):
    """Fingers laced on the back of the head just above the neck: each palm
    against the skull behind the ear line, the fingers meeting at the
    middle, the elbows out wide."""
    at = L.fk(pose)
    head, crown = at['head'], at['crown']
    up = n(sub(crown, head))
    side, _, front = L.trunk_frame(at)
    bk = L.neg(front)
    bk = n(add(bk, up, -dot(bk, up)))
    side = n(add(side, up, -dot(side, up)))
    # the back of the skull's skin, a little above the neck
    c = add(head, up, 0.06 - low)
    rb = H.SKIN_FIT['head'][1] + L.PALM_R + back
    for s, sx in (('L', 1), ('R', -1)):
        palm = add(add(c, bk, rb * 0.9), side, sx * 0.085)
        hand = n(add(add(scale(side, -sx), bk, 0.25), up, 0.1))   # fingers toward the middle
        wrist = add(palm, hand, -L.PALM_AT)
        sh = at[f'shoulder.{s}']
        hint = n(add(add(scale(side, sx * elbow_out), front, 0.35), up, 0.2))
        L.arm(pose, s, wrist, hint, hand)
    return pose


# --- the hero: knees together, shins folded back outside the hips ------------------
KNEES_X = 0.062      # each knee this far from the midline: the two knees touch
ANKLE_X = 0.225      # each ankle this far out: the calf beside (not in) the hip
ANKLE_Z = 0.062      # the instep on the mat


def _shin_back(knee, sx, ankle_x, ankle_z):
    """The ankle a shin back (+Y) from `knee`, `ankle_x` out from the midline."""
    ex, ez = sx * ankle_x - knee[0], ankle_z - knee[2]
    return (sx * ankle_x, knee[1] + math.sqrt(max(L.SHIN ** 2 - ex * ex - ez * ez, 0.0)), ankle_z)


def _instep_down(pose, s, sx):
    """The foot pointing straight back from the ankle, its top on the mat,
    the sole turned up."""
    L.foot_sole(pose, s, (0, 0, 1), n((sx * 0.25, 1, -0.2)))


def hero_legs(pose, knee_z=0.062, ankle_x=ANKLE_X, ankle_z=ANKLE_Z):
    """Virasana's legs: the thighs forward and together, the knees on the
    mat, each shin folded back along the mat so its foot lies outside the
    hip, toes pointing back, soles up."""
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        hip = at[f'hip.{s}']
        # the knee a thigh ahead of the hip, together with the other
        dx, dz = sx * KNEES_X - hip[0], knee_z - hip[2]
        knee = (sx * KNEES_X, hip[1] - math.sqrt(max(L.THIGH ** 2 - dx * dx - dz * dz, 0.0)), knee_z)
        L.set_leg(pose, s, knee, _shin_back(knee, sx, ankle_x, ankle_z))
        _instep_down(pose, s, sx)
    return pose


def hero_kneel(y, knee_z=0.062, ankle_x=ANKLE_X, ankle_z=ANKLE_Z, lean=0.0):
    """Kneeling upright on the way into virasana: the knees together on the
    mat at `y`, the thighs rising to the hips, the shins back along the mat
    with the feet apart, soles up."""
    t = n((0, -lean, 1))
    pose = {'pelvis': t, 'spine.lower': t, 'spine.upper': t}
    for s, sx in (('L', 1), ('R', -1)):
        # the hip straight over its knee (a hair back), the knee in to the other
        d = n((sx * KNEES_X - sx * 0.10, -0.03, -1))
        pose[f'thigh.{s}'] = d
    pose['pelvis.location'] = (0, 0, 0)
    knee0 = L.fk(pose)['knee.L']
    pose['pelvis.location'] = (0, y - knee0[1], knee_z - knee0[2])
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        knee = at[f'knee.{s}']
        L.set_leg(pose, s, knee, _shin_back(knee, sx, ankle_x, ankle_z))
        _instep_down(pose, s, sx)
    return pose


def hero_at(knees_y, lift=0.0, ankle_x=ANKLE_X, trunk=None):
    """Virasana placed along the mat so the knees sit at `knees_y`, the seat
    on the mat (`lift` raises it; `ankle_x` brings the feet in). `trunk`
    gives the pelvis / spine.lower / spine.upper / neck / head directions
    (a reclined or lying hero); the legs are re-solved under it."""
    pose = seat(0.0)
    if trunk:
        pose.update(trunk)
    hero_legs(pose, ankle_x=ankle_x)
    k = L.fk(pose)['knee.L']
    loc = pose['pelvis.location']
    pose['pelvis.location'] = (loc[0], loc[1] + knees_y - k[1], loc[2])
    ground(pose)
    loc = pose['pelvis.location']
    pose['pelvis.location'] = (loc[0], loc[1], loc[2] + lift)
    hero_legs(pose, ankle_x=ankle_x)
    # the legs re-solved from the settled hips may lift the seat off the mat: settle again
    ground(pose)
    return hero_legs(pose, ankle_x=ankle_x) if not lift else pose


def elbows_down(pose, grip=None):
    """Reclined on the elbows: each elbow on the mat behind, the forearm
    forward to the hand holding its foot beside the hip (`grip` = a wrist
    target per side, else just above the ankle)."""
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{s}']
        wrist = grip[s] if grip else add(at[f'ankle.{s}'], (sx * 0.045, -0.02, 0.115))
        elbow = L.grounded_elbow(sh, wrist, sx, z=0.045)
        if elbow is None:
            L.arm(pose, s, wrist, (sx * 0.3, 1, -1), n((0, -1, -0.3)))
            continue
        pose[f'upperarm.{s}'] = n(sub(elbow, sh))
        pose[f'forearm.{s}'] = n(sub(wrist, elbow))
        pose[f'hand.{s}'] = n((sx * 0.1, -1, -0.35))
    return pose


def arms_along(pose, way, out=0.1, drop=0.08):
    """Both arms straight along the mat from the shoulders, toward `way`
    (+1 over the head, -1 toward the feet), opening `out` to the sides and
    tipped `drop` down onto the mat."""
    for s, sx in (('L', 1), ('R', -1)):
        d = n((sx * out, way, -drop))
        pose[f'upperarm.{s}'] = d
        pose[f'forearm.{s}'] = d
        pose[f'hand.{s}'] = n((sx * out, way, -drop * 0.5))
    return pose


def arms_up_laced(pose, meet=0.13, fwd=0.0):
    """Both arms straight up over the head, the fingers laced and the palms
    turned to the ceiling: each wrist `meet` from the midline (the fingers
    cross), the hands pointing in toward each other."""
    at = L.fk(pose)
    reach = L.UPPER + L.FORE - 0.003
    for s, sx in (('L', 1), ('R', -1)):
        sh = at[f'shoulder.{s}']
        dx = sh[0] - sx * meet
        up = math.sqrt(max(reach * reach - dx * dx - fwd * fwd, 0.0))
        wrist = (sx * meet, sh[1] - fwd, sh[2] + up)
        L.arm(pose, s, wrist, (sx, 0.2, 0), n((-sx, 0, 0.12)))
    return pose


def palms_on_soles(pose, along=0.07, gap=0.008, hint=None):
    """Each palm on its own upturned sole, `along` down the foot from the
    ankle, the fingers along the foot toward the toes."""
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        ankle, toes = at[f'ankle.{s}'], at[f'toes.{s}']
        d = n(sub(toes, ankle))
        up = L.sole_facing(pose, s)
        thick = H.SKIN_FIT['ball'][1] + 0.01
        palm = add(add(ankle, d, along), up, thick + L.PALM_R + gap)
        wrist = add(palm, d, -L.PALM_AT)
        L.arm(pose, s, wrist, hint or (sx, 0, 1), d)
    return pose


# --- the bound angle: soles together at the perineum, knees out ----------------------
def angle_legs(pose, ahead=0.20, ankle_x=0.05, ankle_z=0.075, knee_z=0.075, out=None):
    """Baddha konasana's legs: the heels drawn in toward the perineum
    (`ahead` in front of the pelvis joint, `ankle_x` either side of the
    midline: the soles pressed together), the outer edges of the feet on
    the mat, the knees wide and down (`knee_z`), the soles turned to face
    each other."""
    at = L.fk(pose)
    o = at['pelvis']
    fwd = (0, -1, 0)
    for s, sx in (('L', 1), ('R', -1)):
        hip = at[f'hip.{s}']
        ankle = (sx * ankle_x, o[1] - ahead, ankle_z)
        knee = L.knee_on(hip, ankle, (0, 0, 1), knee_z, out or (sx, -0.25, 0))
        L.set_leg(pose, s, knee, ankle)
        # the foot forward and a little out, sole to the other sole
        L.foot_sole(pose, s, (-sx, 0, 0.15), n((sx * 0.25, -1, -0.05)))
    return pose


def hands_over_feet(pose, along=0.03, up=0.12, lace=0.07, point=(0.3, 0.6, 1.0)):
    """Each hand over its own foot, `along` down the foot from the ankle and
    `up` above it, the fingers forward and down over the instep, the elbow
    inside the knee (holding the feet as the heels come in)."""
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        ankle, toes = at[f'ankle.{s}'], at[f'toes.{s}']
        d = n(sub(toes, ankle))
        p = add(ankle, d, along)
        wrist = (sx * lace, p[1], p[2] + up)
        L.arm(pose, s, wrist, (sx * 0.3, -1, 0.2), n((-sx * point[0], -point[1], -point[2])))
    return pose


def hands_round_feet(pose, lace=0.083, up=0.055, ahead=0.02, elbow=(1, 0.1, 0.1)):
    """The fingers laced round the front of the feet: each wrist just in
    front of the toes and a little above them, `lace` from the midline, the
    hands turned down and in round the toes."""
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        toes = at[f'toes.{s}']
        wrist = (sx * lace, toes[1] - ahead, toes[2] + up)
        L.arm(pose, s, wrist, (sx * elbow[0], elbow[1], elbow[2]), n((-sx * 0.7, 0.35, -1)))
    return pose

