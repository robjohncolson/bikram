"""
Bhujangasana I (cobra) — library sheet, live figure only.

Face down, legs long and together, toes pointed; the palms go down beside
the pelvis; the arms straighten and lift the trunk until only the pubis
and the legs stay on the mat, the head thrown back; and down with bent
elbows. Iyengar's cobra is the full one — straight arms, the hands back by
the hips — not the half cobra of the 26 & 2. Shape from the book's
photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_backbend', Path(__file__).resolve().parent / '_backbend.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)
L = B.L
L.begin('bhujangasana-i', skeleton='library')

OUT = 0.25
# the fingers forward and a little out: lying, the rig's arms reach the hips only
# nearly straight, and a hand turned straight forward folds back into the forearm
FINGERS = (0.6, -1, 0)

# the trunk up on straight arms, the pubis still on the mat, the head back
COBRA = B.prone()
B.trunk(COBRA, B.up(30), B.up(38), B.up(54), (0, 0.25, 0.97), (0, 0.55, 0.83))
SPOTS = B.straight_arms_down(COBRA, OUT, toward=(0, 1, 0), fingers=FINGERS)

# lying, the palms beside the pelvis where the arms will press (the rig's
# arms reach there only nearly straight, so the stage reads as lying)
HANDS = B.palms_at(B.prone(), SPOTS, hint=(0.3, 0.3, 1), fingers=FINGERS)

# on the way up and down: the chest half raised, the elbows still bent
RISE = B.prone()
B.trunk(RISE, B.up(12), B.up(24), B.up(36), (0, -0.6, 0.8), (0, -0.4, 0.92))
B.palms_at(RISE, SPOTS, hint=(0.5, 0.4, 1), fingers=FINGERS)

# the common mistake: the hips come off the mat and the arms do all the lifting
_HIPS = {**COBRA}
for _s, _sx in (('L', 1), ('R', -1)):
    _HIPS[f'thigh.{_s}'] = L.n((_sx * 0.02, 1, -0.14))
    _HIPS[f'shin.{_s}'] = L.n((0, 1, -0.02))
# the hips up off the mat and drawn back toward the hands
_HIPS['pelvis.location'] = L.add(COBRA['pelvis.location'], (0, 0.05, 0.06))
B.palms_at(_HIPS, SPOTS, hint=(1, 0, 0), fingers=FINGERS)
GHOST = L.diff(_HIPS, COBRA)

GUIDES = [
    {'from': (0, -1.0, 0.0), 'to': (0, 1.0, 0.0)},   # the mat: the pubis stays on it
]

POSTURE = L.check({
    'id': 'library:bhujangasana-i',
    'position': {'start': 'prone', 'end': 'prone'},
    'view': 'side',
    'frame': B.PRONE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie face down', 'pose': HANDS, 'hold': 4, 'notice': ['feet', 'wrists']},
        {'label': 'Rise', 'pose': RISE, 'hold': 3, 'notice': ['lower-back']},
        {'label': 'Cobra', 'pose': COBRA, 'hold': 10, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['lower-back', 'upper-back', 'neck', 'breath']},
        {'label': 'Lower', 'pose': RISE, 'hold': 3, 'notice': ['breath']},
        {'label': 'Rest', 'pose': HANDS, 'hold': 4, 'notice': ['breath']},
    ],
})
