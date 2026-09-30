"""
Salabhasana (locust) — library sheet, live figure only.

Face down, the arms stretched back; the head, chest and straight legs rise
together while the belly alone stays on the mat, the arms reaching back
off it. Then the book's variation for the low back: knees bent, the thighs
apart and the shins upright, the thighs lifting and drawing together until
the knees meet. Shape from the book's photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_backbend', Path(__file__).resolve().parent / '_backbend.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)
L = B.L
L.begin('salabhasana')

LIE = B.prone()

# the head, chest and legs up at once: the belly on the mat, the ribs and the
# pelvis off it, the arms reaching back clear of the floor
LOCUST = B.prone()
B.trunk(LOCUST, (0, -1, 0.1), (0, -0.92, 0.4), (0, -0.8, 0.6), (0, -0.7, 0.72), (0, -0.85, 0.52))
for _s, _sx in (('L', 1), ('R', -1)):
    LOCUST[f'thigh.{_s}'] = L.n((_sx * 0.01, 1, 0.42))
    LOCUST[f'shin.{_s}'] = L.n((0, 1, 0.42))
    LOCUST[f'foot.{_s}'] = L.n((0, 1, 0.25))
B.arms_back(LOCUST, tip=0.2)

# the common mistake: the legs part and the knees bend to throw the feet up
_BENT = {**LOCUST}
for _s, _sx in (('L', 1), ('R', -1)):
    _BENT[f'thigh.{_s}'] = L.n((_sx * 0.18, 1, 0.3))
    _BENT[f'shin.{_s}'] = L.n((_sx * 0.1, 0.7, 0.72))
    _BENT[f'foot.{_s}'] = L.n((0, 0.5, 0.86))
GHOST = L.diff(_BENT, LOCUST)

# the variation: knees bent, thighs apart on the mat, shins upright
SHINS = B.prone()
B.trunk(SHINS, (0, -1, 0.04), (0, -0.96, 0.28), (0, -0.9, 0.44), (0, -0.8, 0.6), (0, -0.9, 0.44))
for _s, _sx in (('L', 1), ('R', -1)):
    SHINS[f'thigh.{_s}'] = L.n((_sx * 0.2, 1, 0))
    SHINS[f'shin.{_s}'] = (0, 0, 1)
    SHINS[f'foot.{_s}'] = L.n((0, 0.3, 1))
B.arms_back(SHINS, out=0.16)

# and the thighs lifted and drawn together until the knees touch, shins still upright
THIGHS = {**SHINS}
for _s, _sx in (('L', 1), ('R', -1)):
    THIGHS[f'thigh.{_s}'] = L.n((_sx * 0.02, 1, 0.35))
    THIGHS[f'shin.{_s}'] = (0, 0, 1)
    THIGHS[f'foot.{_s}'] = L.n((0, 0.3, 1))
B.arms_back(THIGHS, out=0.16)

GUIDES = [
    {'from': (0, -1.0, 0.0), 'to': (0, 1.0, 0.0)},   # the mat: only the belly on it
]

POSTURE = L.check({
    'id': 'library:salabhasana',
    'position': {'start': 'prone', 'end': 'prone'},
    'view': 'side',
    'frame': B.PRONE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie face down', 'pose': LIE, 'hold': 4, 'notice': ['breath']},
        {'label': 'Locust', 'pose': LOCUST, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['lower-back', 'upper-back', 'hamstrings', 'breath']},
        {'label': 'Down', 'pose': LIE, 'hold': 3, 'notice': ['breath']},
        {'label': 'Shins up', 'pose': SHINS, 'hold': 4, 'notice': ['lower-back']},
        {'label': 'Thighs up', 'pose': THIGHS, 'hold': 8, 'notice': ['lower-back', 'hips']},
        {'label': 'Rest', 'pose': LIE, 'hold': 3, 'notice': ['breath']},
    ],
})
