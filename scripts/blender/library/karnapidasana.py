"""
Karnapidasana (ear pressure) — library sheet, live figure only.

From the plough the knees bend and come down to the mat either side of the
head, beside the ears; the shins and pointed feet lie long on the mat
beyond it and the arms stay long behind. Shape from the book's
photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('karnapidasana')


def knees_to_ears():
    """The hips further over the face, each knee put down on the mat just
    outside the ear, shins long beyond the head, arms long behind."""
    pose = L.on_shoulders(up=(0, -0.3, 0.95))
    L.arms_long(pose)
    at = L.fk(pose)
    for side, sx in (('L', 1), ('R', -1)):
        hip = at[f'hip.{side}']
        knee = L.on_floor(hip, L.THIGH, 0.065, (sx * 0.36, -1, 0))
        pose[f'thigh.{side}'] = L.n(L.sub(knee, hip))
        # the shins rise a touch to the ankles, the feet pointed: the tucked
        # plough foot then turns to pointed without dipping through the mat
        pose[f'shin.{side}'] = L.n((sx * 0.02, -1, 0.14))
        pose[f'foot.{side}'] = L.n((0, -1, -0.05))
    return pose


EARS = knees_to_ears()

# the common mistake: the knees are pulled down with the back collapsed,
# the hips sinking back behind the shoulders so the neck takes the load
_SINK = L.on_shoulders(up=(0, 0.05, 1))
L.arms_long(_SINK)
_at = L.fk(_SINK)
for _s, _sx in (('L', 1), ('R', -1)):
    _hip = _at[f'hip.{_s}']
    _knee = L.on_floor(_hip, L.THIGH, 0.09, (_sx * 0.3, -1, 0))
    _SINK[f'thigh.{_s}'] = L.n(L.sub(_knee, _hip))
    _SINK[f'shin.{_s}'] = L.n((_sx * 0.02, -1, 0.1))
    _SINK[f'foot.{_s}'] = L.n((0, -1, -0.1))
GHOST = L.diff(_SINK, EARS)

POSTURE = L.check({
    'id': 'library:karnapidasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'notice': ['breath']},
        {'label': 'Shoulderstand', 'pose': L.shoulderstand(), 'hold': 5, 'palms': 'back', 'notice': ['neck', 'shoulders']},
        {'label': 'Plough', 'pose': L.plough(arms='long'), 'hold': 6, 'notice': ['hamstrings']},
        {'label': 'Knees to the ears', 'pose': EARS, 'hold': 12, 'ghost': GHOST,
         'notice': ['neck', 'upper-back', 'lower-back', 'breath']},
        {'label': 'Legs straight', 'pose': L.plough(arms='long'), 'hold': 4, 'notice': ['hamstrings']},
        {'label': 'Slide down', 'pose': L.rolling_down(), 'hold': 5, 'notice': ['core']},
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 5, 'notice': ['neck', 'breath']},
    ],
})
