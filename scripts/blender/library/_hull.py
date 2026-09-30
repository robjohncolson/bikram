"""
The rendered hull in plain Python, for the library's CLEARANCE check and
the foot's sole (a `_` file: a helper, never exported or previewed).

A port of the live figure's posing and body recipe (`src/rig/pose.ts`,
`src/rig/body.ts`, `src/rig/clearance.ts`), so a module can check, while it
is authored, what `library.test.ts` checks on the real thing:

- `apply_stage` / `solve`: every bone's WORLD rotation (mathutils'
  `rotation_difference`, including its antiparallel half turn) and joints.
  A roll turns the bone about its own axis; bones omitted under a rolled
  parent ride it (the renderer's rule), so the joints stay exact.
- `body_recipe`, `place_bone`, `place_joint`, `joint_radii`: the tubes and
  joint ellipsoids FigureRig draws, with `SKIN_FIT`'s measured sections.
- `clashes(stage)`: every pair of hull pieces that interpenetrates by more
  than `CLEARANCE_TOL`, under the same named rules as
  `src/rig/clearance.ts` (read its docstring): SHARED JOINT, TRUNK
  NEIGHBOURS (two trunk edges), HIP SOCKET (own side, outside `SOCKET_R`),
  LACED HANDS (finger regions, only in a `hands: 'laced'` stage). Nothing
  else, and one tolerance for every sheet. `_selftest.py` holds this port to
  the TypeScript one through shared clash fixtures.

The tables are copied from `src/rig/skeleton.ts` / `body.ts`;
`library.test.ts` holds this file's `SKIN_FIT` to the TypeScript one.
"""
import math

# --- the rig ----------------------------------------------------------------------
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
    ('pelvis', 'pelvis', 'waist', None), ('spine.lower', 'waist', 'chest', 'pelvis'),
    ('spine.upper', 'chest', 'neck', 'spine.lower'), ('neck', 'neck', 'head', 'spine.upper'),
    ('head', 'head', 'crown', 'neck'),
    ('clavicle.L', 'neck', 'shoulder.L', 'spine.upper'), ('clavicle.R', 'neck', 'shoulder.R', 'spine.upper'),
    ('upperarm.L', 'shoulder.L', 'elbow.L', 'clavicle.L'), ('upperarm.R', 'shoulder.R', 'elbow.R', 'clavicle.R'),
    ('forearm.L', 'elbow.L', 'wrist.L', 'upperarm.L'), ('forearm.R', 'elbow.R', 'wrist.R', 'upperarm.R'),
    ('hand.L', 'wrist.L', 'fingers.L', 'forearm.L'), ('hand.R', 'wrist.R', 'fingers.R', 'forearm.R'),
    ('hipbone.L', 'pelvis', 'hip.L', 'pelvis'), ('hipbone.R', 'pelvis', 'hip.R', 'pelvis'),
    ('thigh.L', 'hip.L', 'knee.L', 'hipbone.L'), ('thigh.R', 'hip.R', 'knee.R', 'hipbone.R'),
    ('shin.L', 'knee.L', 'ankle.L', 'thigh.L'), ('shin.R', 'knee.R', 'ankle.R', 'thigh.R'),
    ('foot.L', 'ankle.L', 'toes.L', 'shin.L'), ('foot.R', 'ankle.R', 'toes.R', 'shin.R'),
]
BONE = {b[0]: b for b in BONES}
LEAVES = ('head', 'hand.L', 'hand.R', 'foot.L', 'foot.R')
RADIUS = {
    'pelvis': (0.14, 0.10), 'waist': (0.11, 0.09), 'chest': (0.15, 0.10),
    'neck': (0.05, 0.05), 'head': (0.09, 0.10), 'crown': (0.07, 0.08),
    'shoulder': (0.06, 0.06), 'elbow': (0.045, 0.045), 'wrist': (0.035, 0.035),
    'fingers': (0.03, 0.02), 'palm': (0.05, 0.035),
    'hip': (0.085, 0.085), 'knee': (0.06, 0.06), 'ankle': (0.045, 0.045),
    'toes': (0.04, 0.025), 'ball': (0.045, 0.03), 'heel': (0.038, 0.038),
}
SKIN_EXTRA = {
    'palm.L': ((0.23, 0, 0.865), 'wrist.L', 'fingers.L', 'hand.L'),
    'palm.R': ((-0.23, 0, 0.865), 'wrist.R', 'fingers.R', 'hand.R'),
    'ball.L': ((0.10, -0.11, 0.035), 'ankle.L', 'toes.L', 'foot.L'),
    'ball.R': ((-0.10, -0.11, 0.035), 'ankle.R', 'toes.R', 'foot.R'),
    'heel.L': ((0.10, 0.035, 0.045), 'ankle.L', None, 'foot.L'),
    'heel.R': ((-0.10, 0.035, 0.045), 'ankle.R', None, 'foot.R'),
}
VERTEX_BONE = {
    'pelvis': 'pelvis', 'waist': 'spine.lower', 'chest': 'spine.upper', 'neck': 'neck',
    'head': 'head', 'crown': 'head',
    'shoulder.L': 'upperarm.L', 'shoulder.R': 'upperarm.R', 'elbow.L': 'forearm.L', 'elbow.R': 'forearm.R',
    'wrist.L': 'hand.L', 'wrist.R': 'hand.R', 'fingers.L': 'hand.L', 'fingers.R': 'hand.R',
    'hip.L': 'thigh.L', 'hip.R': 'thigh.R', 'knee.L': 'shin.L', 'knee.R': 'shin.R',
    'ankle.L': 'foot.L', 'ankle.R': 'foot.R', 'toes.L': 'foot.L', 'toes.R': 'foot.R',
}
# the subdivided skin's measured half-widths at each joint stem (src/rig/body.ts SKIN_FIT)
SKIN_FIT = {
    'pelvis': (0.155, 0.083), 'waist': (0.119, 0.086), 'chest': (0.129, 0.092), 'neck': (0.125, 0.094),
    'head': (0.084, 0.091), 'crown': (0.07, 0.079), 'shoulder': (0.047, 0.052), 'elbow': (0.042, 0.041),
    'wrist': (0.032, 0.035), 'fingers': (0.019, 0.028), 'palm': (0.03, 0.04), 'hip': (0.077, 0.074),
    'knee': (0.055, 0.055), 'ankle': (0.045, 0.047), 'toes': (0.036, 0.024), 'ball': (0.04, 0.028),
    'heel': (0.035, 0.035),
}
SUBSURF_SHRINK = 0.92
FLT_EPSILON = 1.1920929e-7


# --- vectors and quaternions ([w, x, y, z], mathutils' semantics) -------------------------
def v_add(a, b):
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def v_sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def v_scale(a, s):
    return (a[0] * s, a[1] * s, a[2] * s)


def v_dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def v_cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def v_len(a):
    return math.sqrt(v_dot(a, a))


def v_norm(a):
    m = v_len(a)
    return (a[0] / m, a[1] / m, a[2] / m) if m > 0 else (0.0, 0.0, 0.0)


IDENTITY = (1.0, 0.0, 0.0, 0.0)


def q_mul(a, b):
    aw, ax, ay, az = a
    bw, bx, by, bz = b
    return (aw * bw - ax * bx - ay * by - az * bz,
            aw * bx + ax * bw + ay * bz - az * by,
            aw * by - ax * bz + ay * bw + az * bx,
            aw * bz + ax * by - ay * bx + az * bw)


def q_conj(q):
    return (q[0], -q[1], -q[2], -q[3])


def q_rot(q, v):
    w, x, y, z = q
    tx = 2 * (y * v[2] - z * v[1])
    ty = 2 * (z * v[0] - x * v[2])
    tz = 2 * (x * v[1] - y * v[0])
    return (v[0] + w * tx + (y * tz - z * ty), v[1] + w * ty + (z * tx - x * tz), v[2] + w * tz + (x * ty - y * tx))


def axis_angle(axis, rad):
    n = v_norm(axis)
    if n == (0.0, 0.0, 0.0):
        return IDENTITY
    s = math.sin(rad / 2)
    return (math.cos(rad / 2), n[0] * s, n[1] * s, n[2] * s)


def _ortho(v):
    x, y, z = abs(v[0]), abs(v[1]), abs(v[2])
    axis = (0 if x > z else 2) if x > y else (1 if y > z else 2)
    if axis == 0:
        return (-v[1] - v[2], v[0], v[0])
    if axis == 1:
        return (v[1], -v[0] - v[2], v[1])
    return (v[2], v[2], -v[0] - v[1])


def _angle_normalized(a, b):
    if v_dot(a, b) >= 0:
        return 2 * math.asin(min(1.0, v_len(v_sub(a, b)) / 2))
    return math.pi - 2 * math.asin(min(1.0, v_len(v_add(a, b)) / 2))


def rotation_difference(a, b):
    na, nb = v_norm(a), v_norm(b)
    c = v_cross(na, nb)
    cl = v_len(c)
    if cl > FLT_EPSILON:
        ang = _angle_normalized(na, nb)
        s = math.sin(ang / 2) / cl
        return (math.cos(ang / 2), c[0] * s, c[1] * s, c[2] * s)
    if v_dot(na, nb) > 0:
        return IDENTITY
    return axis_angle(_ortho(na), math.pi)


def slerp(a, b, t):
    cosom = sum(x * y for x, y in zip(a, b))
    frm = a
    if cosom < 0:
        cosom, frm = -cosom, tuple(-x for x in a)
    if 1 - cosom > 0.0001:
        omega = math.acos(min(1.0, cosom))
        sinom = math.sin(omega)
        s1, s2 = math.sin((1 - t) * omega) / sinom, math.sin(t * omega) / sinom
    else:
        s1, s2 = 1 - t, t
    q = tuple(s1 * x + s2 * y for x, y in zip(frm, b))
    m = math.sqrt(sum(x * x for x in q))
    return tuple(x / m for x in q)


# --- posing (src/rig/pose.ts) ---------------------------------------------------------
REST = {b: v_norm(v_sub(J[t], J[h])) for b, h, t, _ in BONES}


def entry_of(e):
    """(direction, roll degrees) of a stage entry: a tuple, or {'dir', 'roll'}."""
    if isinstance(e, dict):
        return tuple(e['dir']), float(e.get('roll', 0.0))
    return tuple(e), 0.0


def apply_stage(stage):
    """Every bone's WORLD rotation from rest, parents first (applyStage)."""
    q = {}
    riding = set()
    for name, _, _, parent in BONES:
        q0 = q[parent] if parent else IDENTITY
        e = stage.get(name)
        if e is None and parent in riding:
            riding.add(name)
            q[name] = q0
            continue
        d, roll = entry_of(e) if e is not None else (REST[name], 0.0)
        t = v_norm(d)
        cur = v_norm(q_rot(q0, REST[name]))
        r = rotation_difference(cur, t)
        if roll:
            r = q_mul(axis_angle(t, math.radians(roll)), r)
        q[name] = q_mul(r, q0)
        if roll:
            riding.add(name)
    return q, tuple(stage.get('pelvis.location', (0, 0, 0)))


def solve(stage):
    """{bone: (head, tail, q)} — the renderer's forward kinematics."""
    q, loc = apply_stage(stage)
    out = {}
    for name, h, t, parent in BONES:
        if parent:
            ph, _, pq = out[parent]
            head = v_add(ph, q_rot(pq, v_sub(J[h], J[BONE[parent][1]])))
        else:
            head = v_add(J[h], loc)
        out[name] = (head, v_add(head, q_rot(q[name], v_sub(J[t], J[h]))), q[name])
    return out


# --- the body recipe (src/rig/body.ts) ------------------------------------------------
def _edges():
    edges = [(h, t, name) for name, h, t, _ in BONES]
    for name, (_, a, b, bone) in SKIN_EXTRA.items():
        if b is not None:
            i = next(k for k, e in enumerate(edges) if e[0] == a and e[1] == b)
            edges[i:i + 1] = [(a, name, bone), (name, b, bone)]
        else:
            edges.append((a, name, bone))
    return edges


EDGES = _edges()
EDGES_AT = {}
for _e in EDGES:
    for _v in _e[:2]:
        EDGES_AT.setdefault(_v, []).append(_e)
BONE_TAIL = {name: t for name, _, t, _ in BONES}


def rest_of(v):
    return SKIN_EXTRA[v][0] if v in SKIN_EXTRA else J[v]


def bone_of(v):
    return SKIN_EXTRA[v][3] if v in SKIN_EXTRA else VERTEX_BONE[v]


def _is_foot(v):
    return v.split('.')[0] in ('toes', 'ball', 'heel')


def _stem(v):
    return v.split('.')[0]


def is_leaf(v):
    return len(EDGES_AT.get(v, ())) == 1


def _is_side_end(e, v):
    return e[2] != bone_of(v) and BONE_TAIL[e[2]] != v and e[0] == v


def _skin_radii(v):
    rx, ry = RADIUS[_stem(v)]
    s = SUBSURF_SHRINK
    return (rx * s, rx * s, ry * s) if _is_foot(v) else (rx * s, ry * s, ry * s)


def radius_along(r, w):
    return 1 / math.sqrt((w[0] / r[0]) ** 2 + (w[1] / r[1]) ** 2 + (w[2] / r[2]) ** 2)


def _cross_axes(frm, to):
    d = v_norm(v_sub(to, frm))
    ref = (0, 1, 0) if abs(d[0]) > 0.9 else (1, 0, 0)
    u = v_norm(v_sub(ref, v_scale(d, v_dot(ref, d))))
    return d, u, v_cross(d, u)


def _cross_radii(v):
    a, b = SKIN_FIT[_stem(v)]
    m = min(a, b)
    return [a, m, b] if _is_foot(v) else [a, b, m]


def _ring_at(e, v, u, w):
    r = _skin_radii(v) if _is_side_end(e, v) else _cross_radii(v)
    return radius_along(r, u), radius_along(r, w)


def vertex_radii(v):
    r = _cross_radii(v)
    along = 1 if _is_foot(v) else 2
    a, b = SKIN_FIT[_stem(v)]
    need = r[along]
    for e in EDGES_AT.get(v, ()):
        if e[2] == bone_of(v):
            continue
        _, u, w = _cross_axes(rest_of(e[0]), rest_of(e[1]))
        need = max(need, *_ring_at(e, v, u, w))
    r[along] = min(max(a, b), max(r[along], need))
    return tuple(r)


def joint_center(v):
    at = rest_of(v)
    if not is_leaf(v):
        return at
    e = EDGES_AT[v][0]
    other = e[1] if e[0] == v else e[0]
    w = v_norm(v_sub(at, rest_of(other)))
    return v_sub(at, v_scale(w, radius_along(vertex_radii(v), w)))


def body_recipe():
    tubes = []
    for e in EDGES:
        frm, to = joint_center(e[0]), joint_center(e[1])
        _, u, w = _cross_axes(frm, to)
        ra, rb = _ring_at(e, e[0], u, w), _ring_at(e, e[1], u, w)
        tubes.append({'key': f'{e[0]}>{e[1]}', 'verts': (e[0], e[1]), 'bone': e[2], 'from': frm, 'to': to,
                      'u': u, 'v': w, 'ru': (ra[0], rb[0]), 'rv': (ra[1], rb[1])})
    joints, seen = [], set()
    for e in EDGES:
        for v in e[:2]:
            if v in seen:
                continue
            seen.add(v)
            rims = []
            for t, te in zip(tubes, EDGES):
                if (te[0] != v and te[1] != v) or _is_side_end(te, v):
                    continue
                end = 0 if te[0] == v else 1
                rims.append({'bone': t['bone'], 'centre': t['from'] if end == 0 else t['to'],
                             'U': v_scale(t['u'], t['ru'][end]), 'V': v_scale(t['v'], t['rv'][end])})
            joints.append({'vertex': v, 'bone': bone_of(v), 'at': joint_center(v), 'radii': vertex_radii(v), 'rims': rims})
    return tubes, joints


def place_bone(s, bone):
    head, _, q = s[bone]
    return v_sub(head, q_rot(q, J[BONE[bone][1]])), q


def hinge_bone(v):
    own = bone_of(v)
    for e in EDGES_AT.get(v, ()):
        if e[2] != own and BONE_TAIL[e[2]] == v:
            return e[2]
    return None


def place_joint(s, joint):
    pos, q = place_bone(s, joint['bone'])
    h = hinge_bone(joint['vertex'])
    if not h:
        return pos, q
    centre = v_add(pos, q_rot(q, joint['at']))
    qh = slerp(s[h][2], q, 0.5)
    return v_sub(centre, q_rot(qh, joint['at'])), qh


def joint_radii(s, joint):
    pos, q = place_joint(s, joint)
    qi = q_conj(q)
    rims = []
    for rim in joint['rims']:
        bp, bq = place_bone(s, rim['bone'])

        def to_joint(w, bq=bq):
            return q_rot(qi, q_rot(bq, w))
        c = v_sub(q_rot(qi, v_sub(v_add(bp, q_rot(bq, rim['centre'])), pos)), joint['at'])
        rims.append((c, to_joint(rim['U']), to_joint(rim['V'])))

    def excess(r):
        worst = 1.0
        for c, U, V in rims:
            U = (U[0] / r[0], U[1] / r[1], U[2] / r[2])
            V = (V[0] / r[0], V[1] / r[1], V[2] / r[2])
            C = (c[0] / r[0], c[1] / r[1], c[2] / r[2])
            if v_len(C) < 1e-9:
                a, e, f = v_dot(U, U), v_dot(V, V), v_dot(U, V)
                n2 = (a + e) / 2 + math.sqrt(((a - e) / 2) ** 2 + f * f)
            else:
                n2 = 0.0
                for k in range(96):
                    t = k / 96 * math.pi * 2
                    p = v_add(C, v_add(v_scale(U, math.cos(t)), v_scale(V, math.sin(t))))
                    n2 = max(n2, v_dot(p, p))
            worst = max(worst, math.sqrt(n2))
        return worst
    fit = joint['radii']
    reach = list(fit)
    for c, U, V in rims:
        for k in range(3):
            reach[k] = max(reach[k], abs(c[k]) + math.hypot(U[k], V[k]))
    ua, ub = excess(fit), excess(reach)
    a = tuple(x * ua for x in fit)
    b = tuple(x * ub for x in reach)

    def growth(r):
        return max(r[k] / fit[k] for k in range(3))
    return a if growth(a) <= growth(b) else b


# --- clearance (src/rig/clearance.ts) -------------------------------------------------
CLEARANCE_TOL = 0.01
TRUNK_BONES = {'pelvis', 'spine.lower', 'spine.upper', 'neck', 'head', 'clavicle.L', 'clavicle.R', 'hipbone.L', 'hipbone.R'}
SOCKET_R = 0.13     # a socket pair counts only sample points further than this from the thigh's own hip joint
TRUNK_HOPS = 2      # trunk pieces this many trunk skin edges apart (or fewer) are one skin
TUBES, JOINTS = body_recipe()

PIECES = ([{'name': t['key'], 'verts': t['verts'], 'bone': t['bone'], 'tube': t} for t in TUBES]
          + [{'name': j['vertex'], 'verts': (j['vertex'],), 'bone': j['bone'], 'joint': j} for j in JOINTS])
_EDGE_SET = {f'{t["verts"][0]}>{t["verts"][1]}' for t in TUBES} | {f'{t["verts"][1]}>{t["verts"][0]}' for t in TUBES}
_TRUNK_NB = {}
for _t in TUBES:
    if _t['bone'] in TRUNK_BONES:
        _x, _y = _t['verts']
        _TRUNK_NB.setdefault(_x, []).append(_y)
        _TRUNK_NB.setdefault(_y, []).append(_x)


def _trunk_hops(a, b):
    """Skin-graph distance between two vertices along the trunk's own tubes (inf off it)."""
    seen, queue = {a: 0}, [a]
    while queue:
        v = queue.pop(0)
        if v == b:
            return seen[v]
        for w in _TRUNK_NB.get(v, ()):
            if w not in seen:
                seen[w] = seen[v] + 1
                queue.append(w)
    return math.inf


def _canon(v):
    return SKIN_EXTRA[v][1] if v in SKIN_EXTRA else v


def _side(name):
    return name[-1] if name[-2:] in ('.L', '.R') else None


def _thigh_side(p):
    return p['bone'][-1] if p['bone'] in ('thigh.L', 'thigh.R') else None


def _own_pelvis(p, side):
    return p['bone'] in ('pelvis', f'hipbone.{side}') or ('joint' in p and p['name'] == 'waist')


def _finger(p):
    return p['name'] in ('palm.L>fingers.L', 'palm.R>fingers.R', 'fingers.L', 'fingers.R')


def rule(a, b):
    """The named rule governing a pair of hull pieces, or None (clearance.ts `ruleOf`)."""
    ca, cb = {_canon(v) for v in a['verts']}, {_canon(v) for v in b['verts']}
    if ca & cb:
        return 'shared joint'
    if 'joint' in a and 'joint' in b and f"{a['name']}>{b['name']}" in _EDGE_SET:
        return 'shared joint'
    if (a['bone'] in TRUNK_BONES and b['bone'] in TRUNK_BONES
            and any(_trunk_hops(v, w) <= TRUNK_HOPS for v in a['verts'] for w in b['verts'])):
        return 'trunk neighbours'
    ta, tb = _thigh_side(a), _thigh_side(b)
    if (ta and _own_pelvis(b, ta)) or (tb and _own_pelvis(a, tb)):
        return 'hip socket'
    if _finger(a) and _finger(b) and _side(a['name']) != _side(b['name']):
        return 'laced hands'
    return None


PAIRS = []
for _i in range(len(PIECES)):
    for _k in range(_i + 1, len(PIECES)):
        _m = rule(PIECES[_i], PIECES[_k])
        if _m in ('shared joint', 'trunk neighbours'):
            continue
        _s = _thigh_side(PIECES[_i]) or _thigh_side(PIECES[_k])
        PAIRS.append((_i, _k, _m, f'thigh.{_s}' if _m == 'hip socket' else None))
ANGLES = 16
STEP = 0.015
_SPHERE = [(0, 0, 1), (0, 0, -1)] + [
    (math.sin(i / 8 * math.pi) * math.cos(k / ANGLES * 2 * math.pi),
     math.sin(i / 8 * math.pi) * math.sin(k / ANGLES * 2 * math.pi), math.cos(i / 8 * math.pi))
    for i in range(1, 8) for k in range(ANGLES)]


def _place(s, p):
    if 'tube' in p:
        t = p['tube']
        pos, q = place_bone(s, t['bone'])
        mid = v_scale(v_add(t['from'], t['to']), 0.5)
        return {'pos': pos, 'q': q, 'qi': q_conj(q), 'centre': v_add(pos, q_rot(q, mid)),
                'bound': v_len(v_sub(t['to'], t['from'])) / 2 + max(*t['ru'], *t['rv'])}
    j = p['joint']
    pos, q = place_joint(s, j)
    radii = joint_radii(s, j)
    return {'pos': pos, 'q': q, 'qi': q_conj(q), 'radii': radii, 'centre': v_add(pos, q_rot(q, j['at'])),
            'bound': max(radii)}


def _depth(p, pl, w):
    r = q_rot(pl['qi'], v_sub(w, pl['pos']))
    if 'tube' in p:
        t = p['tube']
        axis = v_sub(t['to'], t['from'])
        L = v_len(axis)
        d = v_scale(axis, 1 / L)
        k = v_dot(v_sub(r, t['from']), d) / L
        if k < 0 or k > 1:
            return 0.0
        ru = t['ru'][0] + (t['ru'][1] - t['ru'][0]) * k
        rv = t['rv'][0] + (t['rv'][1] - t['rv'][0]) * k
        off = v_sub(r, v_add(t['from'], v_scale(d, k * L)))
        rho = math.hypot(v_dot(off, t['u']) / ru, v_dot(off, t['v']) / rv)
        if rho >= 1:
            return 0.0
        return min(ru, rv) if rho < 1e-9 else v_len(off) * (1 / rho - 1)
    j = p['joint']
    rx, ry, rz = pl['radii']
    off = v_sub(r, j['at'])
    rho = math.sqrt((off[0] / rx) ** 2 + (off[1] / ry) ** 2 + (off[2] / rz) ** 2)
    if rho >= 1:
        return 0.0
    return min(rx, ry, rz) if rho < 1e-9 else v_len(off) * (1 / rho - 1)


def _samples(p, pl):
    out = []
    if 'tube' in p:
        t = p['tube']
        axis = v_sub(t['to'], t['from'])
        n = max(2, math.ceil(v_len(axis) / STEP))
        for i in range(n + 1):
            k = i / n
            c = v_add(t['from'], v_scale(axis, k))
            ru = t['ru'][0] + (t['ru'][1] - t['ru'][0]) * k
            rv = t['rv'][0] + (t['rv'][1] - t['rv'][0]) * k
            for a in range(ANGLES):
                th = a / ANGLES * 2 * math.pi
                r = v_add(c, v_add(v_scale(t['u'], ru * math.cos(th)), v_scale(t['v'], rv * math.sin(th))))
                out.append(v_add(pl['pos'], q_rot(pl['q'], r)))
        return out
    j = p['joint']
    rx, ry, rz = pl['radii']
    for e in _SPHERE:
        out.append(v_add(pl['pos'], q_rot(pl['q'], v_add(j['at'], (e[0] * rx, e[1] * ry, e[2] * rz)))))
    return out


def clashes(stage, tol=CLEARANCE_TOL, only=None, laced=False):
    """[(piece, piece, depth m)] for every compared pair deeper than `tol`,
    deepest first; `only` (piece names) keeps the pairs that involve one;
    `laced` (the stage's `hands: 'laced'`) exempts the finger regions."""
    s = solve(stage)
    placed = {}
    pts = {}
    out = []
    for i, k, mode, thigh in PAIRS:
        if mode == 'laced hands' and laced:
            continue
        if only is not None and PIECES[i]['name'] not in only and PIECES[k]['name'] not in only:
            continue
        for x in (i, k):
            if x not in placed:
                placed[x] = _place(s, PIECES[x])
        A, B = placed[i], placed[k]
        if v_len(v_sub(A['centre'], B['centre'])) > A['bound'] + B['bound']:
            continue
        if i not in pts:
            pts[i] = _samples(PIECES[i], A)
        if k not in pts:
            pts[k] = _samples(PIECES[k], B)
        hip = s[thigh][0] if thigh else None

        def counts(w):
            return hip is None or v_len(v_sub(w, hip)) > SOCKET_R
        depth = 0.0
        for w in pts[i]:
            if counts(w):
                depth = max(depth, _depth(PIECES[k], B, w))
        for w in pts[k]:
            if counts(w):
                depth = max(depth, _depth(PIECES[i], A, w))
        if depth > tol:
            out.append((PIECES[i]['name'], PIECES[k]['name'], depth))
    return sorted(out, key=lambda c: -c[2])


_BASE_J, _BASE_EXTRA = J, SKIN_EXTRA


def select_skeleton(name=None):
    """Configure this private hull instance; each sheet loads its own helper."""
    global J, SKIN_EXTRA, REST, TUBES, JOINTS, PIECES
    if name not in (None, 'library'):
        raise ValueError(f'unknown skeleton: {name}')
    J, SKIN_EXTRA = _BASE_J, _BASE_EXTRA
    if name:
        import importlib.util
        from pathlib import Path
        spec = importlib.util.spec_from_file_location('_library_skeleton', Path(__file__).with_name('_skeleton.py'))
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        J, SKIN_EXTRA = mod.library_tables(J, SKIN_EXTRA)
    REST = {b: v_norm(v_sub(J[t], J[h])) for b, h, t, _ in BONES}
    # Cross-sections retain the measured fit; only tube length and palm position change.
    TUBES, JOINTS = body_recipe()
    PIECES = ([{'name': t['key'], 'verts': t['verts'], 'bone': t['bone'], 'tube': t} for t in TUBES]
              + [{'name': j['vertex'], 'verts': [j['vertex']], 'bone': j['bone'], 'joint': j} for j in JOINTS])
