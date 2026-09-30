"""
Supta Padangusthasana, with both legs on the library skeleton.

Raise one straight leg, hold the shin, lift the head and trunk toward the
knee, then lower the trunk and release the hand before lowering the leg.
Repeat on the other side. Each release has its own stage, and the loop
returns the right leg to the shared lying position.

The longer fingers run beside the shin rather than into its hull. The
remaining fingertip-to-toe gaps are about 28 cm lying down and 17 cm with
the trunk lifted. The copy distinguishes the book's toe grip from the
figure's shin hold; no toe contact is claimed.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_twist', Path(__file__).resolve().parent / '_twist.py')
T = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(T)
L = T.L
L.begin('supta_padangusthasana', skeleton='library')

REST_ON = 0.003


def lying():
    """Flat on the back, legs long and together, the palms on the thighs."""
    pose = {**L.LIE}
    for side in 'LR':
        L.hand_on_thigh(pose, side, t=0.45)
    return pose


def leg_raised(pose, lean=0.0, out=0.0):
    """The left leg straight up from the hip, tipped `lean` degrees past the
    vertical toward the head and `out` degrees out to its own side (so the
    thigh passes beside the belly, not through it); the foot flexed."""
    t, a = math.radians(lean), math.radians(out)
    d = L.n((math.sin(a), -math.sin(t) * math.cos(a), math.cos(t) * math.cos(a)))
    pose['thigh.L'] = d
    pose['shin.L'] = d
    pose['foot.L'] = L.n(L.add(d, (0, -0.6, 0)))
    return pose


def grip(pose, side='L'):
    """The hand round the raised leg as far up it as the arm reaches (the
    foot, when it can): the palm just outside the leg's hull."""
    at = L.fk(pose)
    sh = at[f'shoulder.{side}']
    knee, ankle = at[f'knee.{side}'], at[f'ankle.{side}']
    span = L.UPPER + L.FORE - 0.004
    sx = 1 if side == 'L' else -1
    out = (sx, 0, 0)
    for k in range(51):
        on = L.add(ankle, L.sub(knee, ankle), k / 50)
        r = L.R_ANKLE + (L.R_KNEE - L.R_ANKLE) * (k / 50)
        wrist = L.add(on, out, r + L.PALM_R + 0.012)
        if L.dist(sh, wrist) <= span:
            break
    leg = L.n(L.sub(ankle, knee))
    L.arm(pose, side, wrist, (sx, 0.3, -0.5), L.n(L.add(leg, out, -0.05)))
    return pose, k / 50


def rest_on_mat(pose, keep='neck'):
    """Lift the body (whole) until the hull's lowest point just clears the mat."""
    for _ in range(3):
        low = T.hull_low(pose)
        loc = pose['pelvis.location']
        pose['pelvis.location'] = (loc[0], loc[1], loc[2] + REST_ON - low)
    return pose


def lifted(phi, lean, out, curl):
    """Head and trunk lifted `phi` degrees off the mat (the lower back
    rising `curl` as much, the upper back the rest), the left leg drawn
    `lean` degrees past the vertical toward them (`out` to its side), the
    neck and head bent straight at the knee; the left hand round the lower
    leg, the right hand on the right thigh. The body is lifted to rest on
    the mat."""
    pose = {**L.LIE}
    leg_raised(pose, lean, out)

    def up(deg):
        t = math.radians(deg)
        return (0.0, -math.cos(t), math.sin(t))
    pose['pelvis'] = up(phi * curl * 0.5)
    pose['spine.lower'] = up(phi * curl)
    pose['spine.upper'] = up(phi)
    at = L.fk(pose)
    pose['neck'] = pose['head'] = L.n(L.sub(at['knee.L'], at['neck']))
    grip(pose, 'L')
    L.hand_on_thigh(pose, 'R', t=0.35)
    return rest_on_mat(pose)


# the library's LIE sits back along the mat for the inversions over the
# head; this sheet's legs lie the other way, so the whole figure moves
# toward the feet's end, centring the long lying body in the frame
BACK = -0.26


def centred(pose):
    loc = pose['pelvis.location']
    return {**pose, 'pelvis.location': (loc[0], loc[1] + BACK, loc[2])}


FLAT = centred(L.LIE)
UP = centred(leg_raised({**L.LIE}))
_catch, CATCH_AT = grip(leg_raised({**L.LIE}, lean=25, out=8))
CATCH = centred(_catch)
CHIN = centred(lifted(45, 15, 16, 0.5))

POSTURE = T.check({
    'id': 'library:supta-padangusthasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': {'center_z': 0.45, 'scale': 2.0},
    'transition': 10,
    'stages': [
        {'label': 'Lie flat', 'pose': FLAT, 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Left leg up', 'pose': UP, 'hold': 3, 'notice': ['hamstrings', 'quads', 'breath']},
        {'label': 'Take left leg', 'pose': CATCH, 'hold': 3, 'notice': ['hamstrings', 'quads', 'breath']},
        {'label': 'Chin to left knee', 'pose': CHIN, 'hold': 8, 'notice': ['hamstrings', 'core', 'neck', 'breath']},
        {'label': 'Back down', 'pose': CATCH, 'hold': 3, 'notice': ['hamstrings', 'quads', 'breath']},
        {'label': 'Release left leg', 'pose': UP, 'hold': 3, 'notice': ['hamstrings', 'quads', 'breath']},
        {'label': 'Legs down', 'pose': FLAT, 'hold': 3, 'notice': ['hips', 'breath']},
        {'label': 'Right leg up', 'pose': T.mirror(UP), 'hold': 3, 'notice': ['hamstrings', 'quads', 'breath']},
        {'label': 'Take right leg', 'pose': T.mirror(CATCH), 'hold': 3, 'notice': ['hamstrings', 'quads', 'breath']},
        {'label': 'Chin to right knee', 'pose': T.mirror(CHIN), 'hold': 8, 'notice': ['hamstrings', 'core', 'neck', 'breath']},
        {'label': 'Back down again', 'pose': T.mirror(CATCH), 'hold': 3, 'notice': ['hamstrings', 'quads', 'breath']},
        {'label': 'Release right leg', 'pose': T.mirror(UP), 'hold': 3, 'notice': ['hamstrings', 'quads', 'breath']},
    ],
})
