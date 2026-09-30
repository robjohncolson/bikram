"""
Prasarita Padottanasana (the wide-legged forward fold) ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â library sheet,
live figure only.

From Tadasana, hands on the waist, the legs spread very wide; the palms go
down to the floor between the feet in line with the shoulders, the head up
and the back concave; the elbows bend and the crown of the head comes down
to the floor, feet, palms and head in one line, the weight kept on the
legs; up to the concave back, up to the hands on the waist, back to
Tadasana. From the front-quarter. Shape from the book's photographs; the
stages are ours.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_standing', Path(__file__).resolve().parent / '_standing.py')
S = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(S)
L = S.L
L.begin('prasarita_padottanasana', skeleton='library')

CROWN_Z = 0.008      # the crown's skin ends at its vertex: on the mat (as the headstand's)
# the trunk hanging down between the legs, each bone's angle from upright
# toward the front: the pelvis tipped well forward and the chest carried a
# little back, so the crown lands on the feet's line and the waist clears
# the thighs' roots (hanging plumb, it passed 1.7 cm into them; searched)
HANG = {'pelvis': 160.0, 'spine.lower': 170.0, 'spine.upper': 188.0, 'neck': 188.0, 'head': 188.0}


def fwd(deg):
    """A direction `deg` from upright toward the front (-Y)."""
    a = math.radians(deg)
    return (0.0, -math.sin(a), math.cos(a))


def down(deg):
    """A direction `deg` below the horizontal, toward the front (-Y)."""
    return fwd(90.0 + deg)


def hands_on_waist(pose):
    """The hands on the waist, thumbs back, elbows out to the sides."""
    at = L.fk(pose)
    side, up, front = L.trunk_frame(at)
    for s, sx in (('L', 1), ('R', -1)):
        palm = L.add(L.add(at['waist'], side, sx * (L.SKIN['waist'][0] + L.PALM_R + 0.012)), up, -0.02)
        hand = L.n(L.add(L.add(front, up, -0.6), side, -sx * 0.2))
        wrist = L.add(palm, hand, -L.PALM_AT)
        L.arm(pose, s, wrist, L.add(L.scale(side, sx), front, -0.3), hand)
    return pose


def crown_down(half):
    """Legs `half` apart each side, straight; the trunk hanging straight down
    from the hips; how high the crown ends (the stance sets it)."""
    pose = {'pelvis.location': (0, 0, 0), **{b: fwd(a) for b, a in HANG.items()}}
    S.wide(pose, half)
    return pose, L.fk(pose)['crown'][2]


# the stance: as wide as it takes for the crown to reach the mat with the
# trunk hanging straight down (the book's four and a half to five feet)
lo, hi = 0.6, 0.9
for _ in range(40):
    mid = (lo + hi) / 2
    lo, hi = (mid, hi) if crown_down(mid)[1] > CROWN_Z else (lo, mid)
HALF = (lo + hi) / 2

STAND = S.together({})
S.arms_by_thighs(STAND)

WAIST = hands_on_waist(S.wide({}, HALF))
WIDE = S.arms_out(S.wide({}, HALF))
# a first step apart, arms still down: straight legs spread from together to
# the full width in one blend dip the drawn figure 6 cm through the mat, and
# the hands rising to the waist while the thighs swing out pass through them
STEP = S.arms_out(S.wide({}, 0.3))


# the palms stay on one spot of the mat from the concave back to the crown
# down (only the elbows bend): moved between the two, the drawn hands swept
# 8 cm through the mat on the way
PALM_Y = -0.22
TILT_MIN = 55     # the concave back no flatter than this: the less the trunk turns on the way down, the less the blended arms sweep


def palms_down(pose):
    """Palms flat on the mat between the feet, level with the shoulders,
    fingers forward; the elbows bending back."""
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        L.arm(pose, s, _palm_wrist(at[f'shoulder.{s}']), (sx * 0.3, 1, 0.2), _FLAT)
    return pose


def concave(tilt, arms=True):
    """The back concave, the head up, the arms straight down to the mat."""
    pose = {'pelvis.location': (0, 0, 0), 'pelvis': down(tilt), 'spine.lower': down(tilt - 6),
            'spine.upper': down(tilt - 14), 'neck': down(-10), 'head': down(-25)}
    S.wide(pose, HALF)
    if not arms:
        return pose
    at = L.fk(pose)
    for s, sx in (('L', 1), ('R', -1)):
        # the arm straight down from the shoulder, the palm flat on the mat
        L.arm(pose, s, _palm_wrist(at[f'shoulder.{s}']), (sx * 0.3, 1, 0.2), _FLAT)
    return pose


_FLAT = L.flat_hand((0, -1, 0))


def _palm_wrist(sh):
    palm = (sh[0], PALM_Y, L.WRIST_Z + _FLAT[2] * L.PALM_AT)
    return L.add(palm, _FLAT, -L.PALM_AT)


def lowest_concave():
    """The flattest concave back whose straight arms still reach the mat."""
    for tilt in range(TILT_MIN, 85):
        at = L.fk(concave(float(tilt), arms=False))
        if all(L.dist(at[f'shoulder.{s}'], _palm_wrist(at[f'shoulder.{s}'])) <= L.UPPER + L.FORE for s in 'LR'):
            return concave(float(tilt)), tilt
    raise ValueError('no concave back reaches the mat')


CONCAVE, CONCAVE_TILT = lowest_concave()
# Reach toward the mat with the trunk halfway down, before planting the
# palms. This keeps the longer hands above the floor on the way in.
LOWER = S.fold({'pelvis': 70, 'spine.lower': 66, 'spine.upper': 62, 'neck': 20, 'head': 10}, HALF)
_at = L.fk(LOWER)
for _s, _sx in (('L', 1), ('R', -1)):
    S.reach_toward(LOWER, _s, _palm_wrist(_at[f'shoulder.{_s}']), (_sx * 0.3, 1, 0.2), _FLAT)


CROWN = crown_down(HALF)[0]
palms_down(CROWN)

# the common mistake: the weight thrown forward onto the head ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â the hips
# drift forward of the feet and the trunk slopes back from the crown
_HEAVY = {'pelvis.location': (0, -0.10, 0), **{b: fwd(a + 12) for b, a in HANG.items()}}
S.fit_pelvis(_HEAVY, {f'hip.{s}': ((sx * HALF, 0.0, S.ankle_z()), S.leg_length()) for s, sx in (('L', 1), ('R', -1))}, y=-0.10)
for _s, _sx in (('L', 1), ('R', -1)):
    S.straight_leg(_HEAVY, _s, (_sx * HALF, 0.0), (0, -1))
palms_down(_HEAVY)
GHOST = L.diff(_HEAVY, CROWN)

GUIDES = [
    {'from': (-HALF - 0.1, 0, 0.0), 'to': (HALF + 0.1, 0, 0.0)},   # feet, palms and crown on one line
    {'from': (0, 0, 0.0), 'to': (0, 0, 0.95)},                     # the weight straight down through the legs' line
]

FRAME = {'center_z': 0.85, 'scale': 2.1}
FOLD = {'center_z': 0.62, 'scale': 1.9}

POSTURE = L.check({
    'id': 'library:prasarita-padottanasana',
    'position': {'start': 'standing', 'end': 'standing'},
    'view': 'quarter',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
        {'label': 'Step apart', 'pose': STEP, 'hold': 2, 'notice': ['feet']},
        {'label': 'Hands on waist', 'pose': WAIST, 'hold': 3, 'notice': ['feet', 'quads']},
        {'label': 'Release waist', 'pose': WIDE, 'hold': 2, 'notice': ['shoulders']},
        {'label': 'Reach down', 'pose': LOWER, 'hold': 2, 'notice': ['shoulders']},
        {'label': 'Palms down', 'pose': CONCAVE, 'hold': 4, 'frame': FOLD, 'notice': ['hamstrings', 'lower-back']},
        {'label': 'Crown down', 'pose': CROWN, 'hold': 10, 'frame': FOLD, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['hamstrings', 'neck', 'breath']},
        {'label': 'Head up', 'pose': CONCAVE, 'hold': 3, 'frame': FOLD, 'notice': ['lower-back']},
        {'label': 'Step in', 'pose': STEP, 'hold': 3, 'notice': ['quads']},
        {'label': 'Stand', 'pose': STAND, 'hold': 3, 'notice': ['feet']},
    ],
})
