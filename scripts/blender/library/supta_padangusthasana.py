"""
Supta Padangusthasana (the reclining big-toe hold) — library sheet, live
figure only.

Lying on the back, legs long, the right hand on the right thigh; the left
leg raised to the vertical, the left hand taking hold of it; then the head
and trunk lift and the straight leg is drawn down toward them until the
chin comes to the knee, the right leg long on the mat throughout; back
down, the leg to the vertical, and down beside the other. The book works
the left leg first; the sheet shows that side (the other side is the same,
mirrored, and its step is left unbound).

This rig's arms are short of its feet: lying flat, the hand takes the leg
as high up the shin as it reaches (about halfway, the fingertips ~24 cm
short of the toe; the step says so), and with the trunk lifted it holds
the lower shin (~13 cm short). The leg tips a little past the vertical
and out to its side, so the thigh folds beside the belly rather than
through it, and the head bends straight at the knee. Shape from the
book's photographs; the stages are ours. Seen from the side, where the
fold reads.
"""
import importlib.util
import math
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_twist', Path(__file__).resolve().parent / '_twist.py')
T = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(T)
L = T.L
L.begin('supta_padangusthasana')

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
    L.arm(pose, side, wrist, (sx, 0.3, -0.5), L.n(L.add(leg, out, -0.3)))
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
        {'label': 'Lie flat', 'pose': FLAT, 'hold': 3, 'notice': ['quads', 'breath']},
        {'label': 'Left leg up', 'pose': UP, 'hold': 3, 'notice': ['hamstrings', 'quads']},
        {'label': 'Take the leg', 'pose': CATCH, 'hold': 4, 'notice': ['hamstrings', 'breath']},
        {'label': 'Chin to knee', 'pose': CHIN, 'hold': 8, 'notice': ['hamstrings', 'core', 'neck']},
        {'label': 'Back down', 'pose': CATCH, 'hold': 3, 'notice': ['breath']},
        {'label': 'Leg down', 'pose': FLAT, 'hold': 3, 'notice': ['breath']},
    ],
})
