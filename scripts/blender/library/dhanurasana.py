"""
Dhanurasana (bow) — library sheet, live figure only.

Face down; the knees bend and each hand takes its own ankle from outside;
then the legs pull up and back while the chest lifts, the straight arms the
bowstring, the belly alone on the mat; and down by letting the ankles go.
Shape from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_backbend', Path(__file__).resolve().parent / '_backbend.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)
L = B.L
L.begin('dhanurasana')

LIE = B.prone()


def legs(pose, thigh, shin, foot, apart=0.0):
    for s, sx in (('L', 1), ('R', -1)):
        pose[f'thigh.{s}'] = L.n((sx * apart + thigh[0], thigh[1], thigh[2]))
        pose[f'shin.{s}'] = L.n(shin)
        pose[f'foot.{s}'] = L.n(foot)
    return pose


# knees bent, the heels toward the buttocks, the hands round the ankles;
# the chest still low
HOLD = B.prone()
B.trunk(HOLD, (0, -1, 0.02), (0, -0.97, 0.22), (0, -0.92, 0.38), (0, -0.85, 0.5), (0, -0.95, 0.3))
legs(HOLD, (0, 1, 0.0), (0, -0.86, 0.5), (0, 0.2, 1), apart=0.06)
B.grip_ankles(HOLD)

# the bow: legs drawn up and back, the chest lifted, the belly on the mat
BOW = B.prone()
B.trunk(BOW, (0, -1, 0.1), (0, -0.83, 0.56), (0, -0.6, 0.8), (0, -0.4, 0.92), (0, -0.2, 0.98))
legs(BOW, (0, 0.76, 0.65), (0, -0.6, 0.8), (0, 0.45, 0.9), apart=0.05)
B.grip_ankles(BOW)

# the common mistake: the chest stays down on the ribs, so the legs cannot rise far
_FLAT = {**BOW}
B.trunk(_FLAT, (0, -1, 0.06), (0, -0.97, 0.22), (0, -0.9, 0.42), (0, -0.7, 0.72), (0, -0.5, 0.87))
legs(_FLAT, (0, 0.94, 0.35), (0, -0.8, 0.6), (0, 0.45, 0.9), apart=0.05)
B.grip_ankles(_FLAT)
GHOST = L.diff(_FLAT, BOW)

GUIDES = [
    {'from': (0, -1.0, 0.0), 'to': (0, 1.0, 0.0)},   # the mat: only the belly on it
]

POSTURE = L.check({
    'id': 'library:dhanurasana',
    'position': {'start': 'prone', 'end': 'prone'},
    'view': 'side',
    'frame': B.PRONE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie face down', 'pose': LIE, 'hold': 4, 'notice': ['breath']},
        {'label': 'Hold the ankles', 'pose': HOLD, 'hold': 5, 'notice': ['shoulders', 'breath']},
        {'label': 'Bow', 'pose': BOW, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['quads', 'lower-back', 'shoulders', 'breath']},
        {'label': 'Release', 'pose': HOLD, 'hold': 3, 'notice': ['breath']},
        {'label': 'Rest', 'pose': LIE, 'hold': 4, 'notice': ['breath']},
    ],
})
