"""
Setu Bandha Sarvangasana (bridge from the shoulderstand) — library sheet,
live figure only.

From the shoulderstand, the palms firm on the back, the knees bend and the
feet drop over behind to the mat; the spine arches, carried on the hands
at the waist, and the legs walk out straight. The back of the head, the
neck, the shoulders, the elbows and the feet are what touch the mat.
Shape from the book's photographs; the stages are ours. Down by lowering
the back onto the mat (the reverse lift back to the shoulderstand is for
those who can already do it; it is not drawn).
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('setu_bandha_sarvangasana')

# the trunk arched back from the shoulders: neck → chest, chest → waist,
# waist → pelvis, each leaning further toward +Y (the feet's side)
ARCH = ((0, 0.1, 1), (0, 0.5, 0.87), (0, 0.85, 0.53))
HALF_ARCH = ((0, 0.15, 1), (0, 0.3, 1), (0, 0.5, 0.87))


def knees_bend():
    """Still up on the shoulders, the back starting to arch, the knees
    bending so the feet hang over behind toward the mat."""
    pose = L.on_shoulders(spine=HALF_ARCH)
    L.hands_on_back(pose)   # still up on the shoulders: the shoulderstand's hands
    for side, sx in (('L', 1), ('R', -1)):
        pose[f'thigh.{side}'] = L.n((-sx * 0.03, 0.45, 0.89))
        pose[f'shin.{side}'] = L.n((0, 0.8, -0.6))
        pose[f'foot.{side}'] = L.n((0, 0.8, -0.6))
    return pose


def bridge(straight=True):
    """The arch on the hands, feet flat on the mat, legs long (or knees bent)."""
    pose = L.on_shoulders(spine=ARCH)
    L.hands_under_waist(pose)
    at = L.fk(pose)
    for side, sx in (('L', 1), ('R', -1)):
        hip = at[f'hip.{side}']
        if straight:
            ankle = L.on_floor(hip, L.THIGH + L.SHIN - 0.004, 0.10, (0, 1, 0))
            ankle = (sx * 0.1, ankle[1], ankle[2])
        else:
            ankle = (sx * 0.1, hip[1] + 0.62, 0.10)   # a gentle knee bend: the straightening never dips a heel
        L.leg(pose, side, ankle, (0, 0, 1), L.n((sx * 0.2, 1, -0.5)))
    return pose


BEND = knees_bend()
FEET = bridge(straight=False)
BRIDGE = bridge()
# on the way down the hands come out from under the back first, the elbows
# staying put and the forearms lifting up and a little out, over the upper
# arms: lowered straight from the bridge to lying flat, each thigh came down
# through its wrist, and a forearm swept out low along the mat passed through
# its upper arm (the clearance check, over the in-betweens)
HANDS_OUT = {**BRIDGE}
for _s, _sx in (('L', 1), ('R', -1)):
    HANDS_OUT[f'forearm.{_s}'] = L.n((_sx * 0.5, 0.0, 0.85))
    HANDS_OUT[f'hand.{_s}'] = L.n((_sx * 0.5, 0.0, 0.85))

# the common mistake: the arch collapses onto the hands and the hips sag,
# pressing the weight into the wrists and the neck
_SAG = L.on_shoulders(spine=((0, 0.45, 1), (0, 0.9, 0.44), (0, 1, 0.02)))
L.hands_under_waist(_SAG)
_at = L.fk(_SAG)
for _s, _sx in (('L', 1), ('R', -1)):
    _hip = _at[f'hip.{_s}']
    _ankle = L.on_floor(_hip, L.THIGH + L.SHIN - 0.004, 0.10, (0, 1, 0))
    L.leg(_SAG, _s, (_sx * 0.08, _ankle[1], _ankle[2]), (0, 0, 1), L.n((0, 1, -0.5)))
GHOST = L.diff(_SAG, BRIDGE)

GUIDES = [
    {'from': (0, -1.0, 0.0), 'to': (0, 1.25, 0.0)},   # the mat
]

POSTURE = L.check({
    'id': 'library:setu-bandha-sarvangasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'notice': ['breath']},
        {'label': 'Legs up', 'pose': L.legs_up(), 'hold': 4, 'notice': ['core']},
        {'label': 'Shoulderstand', 'pose': L.shoulderstand(), 'hold': 6, 'palms': 'back', 'notice': ['neck', 'shoulders']},
        {'label': 'Knees bend', 'pose': BEND, 'hold': 5, 'palms': 'back', 'notice': ['wrists', 'lower-back']},
        {'label': 'Feet down', 'pose': FEET, 'hold': 5, 'palms': 'back', 'notice': ['wrists', 'lower-back', 'quads']},
        {'label': 'Bridge', 'pose': BRIDGE, 'hold': 12, 'palms': 'back', 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['wrists', 'upper-back', 'lower-back', 'breath']},
        {'label': 'Hands out', 'pose': HANDS_OUT, 'hold': 3, 'notice': ['lower-back']},
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 5, 'notice': ['lower-back', 'breath']},
    ],
})
