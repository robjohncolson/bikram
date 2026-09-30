"""
The twist family's own helpers (a `_` file: never exported or previewed as a
sheet). Loads `_lib.py` and `_hull.py` and adds what a TURNED TRUNK needs.

A ROLLED SPINE, SAFELY. `_lib` refuses rolls on non-leaf bones: its
direction chain cannot follow the renderer's riding-children rule (an
OMITTED child of a rolled bone rides the roll instead of snapping to rest).
This file side-steps the rule rather than re-implementing it: `roll()`
(and `twist()`, built on it) rolls `pelvis`, `spine.lower`, `spine.upper`
or `neck` only when every child of a rolled bone is LISTED in the stage
(the hip bones and lower spine, the upper spine, the clavicles and neck,
the head). A listed child is aimed in world space, so nothing rides, a
roll moves no joint, and `_lib`'s own solvers — run on the pose before the
rolls are added — stay exact. What the roll does change is the frame the
rendered hull hangs on: the trunk's elliptical sections (waist, chest and
the wide neck section at the shoulders) turn with the shoulder line
instead of staying square to the hips.

`fk()` solves with `_hull.solve` (the port of `src/rig/pose.ts`, rolls and
riding included) and asserts it matches `_lib.fk` of the unrolled pose;
`check()` is `_lib.check` for poses that carry such rolls, plus the
rendered hull's lowest point (`hull_low`, the library test's 1 cm into the
mat) and the library test's TRUNK-ACROSS rule (`library.test.ts`: the pelvis and both
spine bones keep their width across the body, |x of the turned X axis|
> 0.9). That rule caps the spine's own roll at about 25 degrees, so the
rest of a deep twist is carried by the neck's roll (not in that rule) and
by the clavicles, aimed in world space round the trunk's axis.
"""
import importlib.util
import math
import sys
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
H = L.H

# every bone's children in the rig (from the hull port's own table)
CHILDREN = {}
for _name, _h, _t, _parent in H.BONES:
    if _parent:
        CHILDREN.setdefault(_parent, []).append(_name)
ROLLABLE = ('pelvis', 'spine.lower', 'spine.upper', 'neck')
# library.test.ts 'keeps the hips and chest across the body': |x| of each
# trunk bone's turned X axis above 0.9 — the spine's roll stays under this
ACROSS = 0.9
SPINE_ROLL_CAP = 24.0      # degrees of roll the two spine bones may carry between them
TRUNK = ('pelvis', 'spine.lower', 'spine.upper')


def plain(pose):
    """The pose with every non-leaf roll dropped (direction kept): what
    `_lib`'s direction chain can solve. Leaf rolls stay (`_lib` allows them)."""
    out = {}
    for k, v in pose.items():
        if isinstance(v, dict) and k not in H.LEAVES:
            out[k] = tuple(v['dir'])
        else:
            out[k] = v
    return out


def _dir(v):
    return tuple(v['dir']) if isinstance(v, dict) else tuple(v)


def fk(pose):
    """Joint positions of a pose that may roll the spine, from the hull port's
    roll-aware solve, held to `_lib.fk` of the unrolled pose (the rolls
    move no joint when every child of a rolled bone is listed)."""
    s = H.solve(pose)
    at = {'pelvis': s['pelvis'][0]}
    for name, h, t, _ in H.BONES:
        at[t] = s[name][1]
    ref = L.fk(plain(pose))
    for j, p in ref.items():
        if L.dist(p, at[j]) > 1e-6:
            raise AssertionError(f'_twist.fk: {j} moved {L.dist(p, at[j]):.2e} m under the rolls')
    return at


def turn_about(v, axis, deg):
    """`v` turned `deg` degrees (right-handed) about `axis`."""
    return H.q_rot(H.axis_angle(axis, math.radians(deg)), v)


def shoulders(pose, deg):
    """Aim both clavicles `deg` degrees round the upper spine's axis from
    where they would sit on the unturned trunk (positive turns the chest
    toward the mannequin's left, as a roll does)."""
    q, _ = H.apply_stage(plain({k: v for k, v in pose.items() if not k.startswith('clavicle')}))
    axis = L.direction(plain(pose), 'spine.upper')
    for side in 'LR':
        rest = H.q_rot(q[f'clavicle.{side}'], H.REST[f'clavicle.{side}'])
        pose[f'clavicle.{side}'] = L.n(turn_about(rest, axis, deg))
    return pose


def twist(pose, deg, spine=None, gaze=0.0):
    """Roll the trunk's frame `deg` degrees in total at the shoulders: the
    two spine bones share `spine` (default: as much as the trunk-across
    rule allows, up to `deg`, split 40/60), the neck carries the rest, and
    the head turns `gaze` degrees further (a leaf roll). Call it LAST, on a
    pose whose clavicles already stand at `deg` (`shoulders`) and whose
    neck and head are listed. Refuses a roll whose children would ride."""
    total = spine if spine is not None else math.copysign(min(abs(deg), SPINE_ROLL_CAP), deg)
    roll(pose, {'spine.lower': 0.4 * total, 'spine.upper': 0.6 * total, 'neck': deg - total})
    if gaze:
        pose['head'] = {'dir': _dir(pose.get('head', H.REST['head'])), 'roll': round(gaze, 3)}
    return pose


def roll(pose, rolls):
    """Roll trunk bones about their own axes ({bone: degrees}), keeping each
    bone's direction. Refuses a roll whose children are not all listed:
    an omitted child would ride it and move, which `_lib` cannot follow."""
    for bone, r in rolls.items():
        if bone not in ROLLABLE:
            raise ValueError(f'_twist.roll: {bone} is not one of {ROLLABLE}')
        if not r:
            continue
        for child in CHILDREN.get(bone, ()):
            if child not in pose:
                raise ValueError(f'_twist.roll: {bone} rolls but its child {child} is not listed (it would ride)')
        pose[bone] = {'dir': _dir(pose.get(bone, H.REST[bone])), 'roll': round(r, 3)}
    return pose


def across_check(pose, where):
    """Warn when a trunk bone's width swings out of the body's side-to-side
    line (the library test's rule), so the sheet fails here, not in vitest."""
    q, _ = H.apply_stage(pose)
    for b in TRUNK:
        x = H.q_rot(q[b], (1, 0, 0))[0]
        if abs(x) <= ACROSS:
            print(f'across warning [library/{L._who[0]}]: {where} {b} turns its width to x = {x:.3f} '
                  f'(|x| must stay above {ACROSS})', file=sys.stderr)


def floor_check(pose, where):
    for joint, p in fk(pose).items():
        if p[2] < L.FLOOR:
            print(f'floor warning [library/{L._who[0]}]: {where} {joint} at z = {p[2]:.3f} m, '
                  f'below the floor', file=sys.stderr)


def check(posture):
    """`_lib.check` for sheets whose spine may roll: floor on the roll-aware
    joints, clearance on the rolled hull (`_hull.clashes` follows rolls),
    the palms' contact on the (identical) unrolled joints, the notice
    vocabulary, and the trunk-across rule."""
    for i, st in enumerate(posture['stages']):
        where = f"#{i} {st['label']!r}"
        laced = st.get('hands') == 'laced'
        if st.get('hands') not in (None, 'laced'):
            raise ValueError(f"{posture['id']} {where}: hands {st['hands']!r} is not 'laced'")
        for what, pose in (('', st['pose']), (' ghost', st.get('ghost') and {**st['pose'], **st['ghost']})):
            if not pose:
                continue
            floor_check(pose, where + what)
            low = hull_low(pose)
            if low < -0.01:
                print(f'floor warning [library/{L._who[0]}]: {where + what} the hull reaches '
                      f'{-low * 100:.1f} cm into the mat', file=sys.stderr)
            L.clearance_check(pose, where + what, laced)
            across_check(pose, where + what)
        for term in st.get('notice', ()):
            if term not in L.NOTICE:
                raise ValueError(f"{posture['id']} {where}: notice {term!r} is not one of {L.NOTICE}")
        if st.get('palms') == 'back':
            L.contact_check(plain(st['pose']), where)
    return posture


def mirror(pose):
    """The same shape on the other side: swap L/R, flip X, flip roll signs."""
    out = {}
    for k, v in pose.items():
        if k == 'pelvis.location':
            out[k] = (-v[0], v[1], v[2])
            continue
        name = k[:-2] + ('.R' if k.endswith('.L') else '.L') if k[-2:] in ('.L', '.R') else k
        if isinstance(v, dict):
            d = v['dir']
            out[name] = {'dir': (-d[0], d[1], d[2]), 'roll': -v['roll']}
        else:
            out[name] = (-v[0], v[1], v[2])
    return out


def hull_low(pose):
    """The rendered hull's lowest point (every tube and joint sample of the
    hull port): `library.test.ts` wants it no more than 1 cm under the mat."""
    s = H.solve(pose)
    low = math.inf
    for p in H.PIECES:
        for w in H._samples(p, H._place(s, p)):
            low = min(low, w[2])
    return low


def reach_short(pose, side, target):
    """How far (m) the fingertips of `side` fall short of `target` from the
    shoulder (negative = within reach): the report's arm-reach number."""
    sh = L.fk(plain(pose))[f'shoulder.{side}']
    return L.dist(sh, target) - (L.UPPER + L.FORE + L.HAND)
