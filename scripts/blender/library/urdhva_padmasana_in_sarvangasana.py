"""
Urdhva Padmasana in Sarvangasana (the lotus upside down in the
shoulderstand) — library sheet, live figure only.

Up into the supported shoulderstand; the right foot set on the left thigh,
then the left on the right, the crossed legs stretched up with the knees
drawn back from the pelvis; then uncrossed, left foot first, back to the
shoulderstand and down. The crossing is `_lib.lotus` itself, in the
pelvis's own frame: the thighs in line with the trunk (`flex` -10, a little
behind it), the soles turned to the chest's side. The shoulderstand's poses
are mirror-labelled, so the chest's direction is given (`front`). Shape
from the book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
L.begin('urdhva_padmasana_in_sarvangasana')

CHEST = (0, -1, 0)   # the shoulderstand's chest faces the chin
FLEX = -10.0         # the thighs in line with the trunk, drawn a little back from the pelvis
HALF_FRAME = {'center_z': 0.8, 'scale': 1.9}   # one leg still straight up (the whole hull, with room for the disc's corners)

UP = L.shoulderstand()


def crossed(half=False):
    """The shoulderstand's trunk and hands, the legs crossed (or only the
    right foot in, the left leg still straight up)."""
    pose = L.on_shoulders(up=(0, 0.05, 1))
    L.hands_on_back(pose)
    if half:
        L.legs_vertical(pose, lean=(0, -0.03, 1))
        return L.half_lotus(pose, 'R', flex=FLEX, front=CHEST)
    return L.lotus(pose, first='R', flex=FLEX, front=CHEST)


HALF = crossed(half=True)
LOTUS = crossed()

# the common mistake: the hips sag back and the crossed knees tip over the
# face, instead of the knees reaching up and back
_SAG = L.on_shoulders(up=(0, 0.3, 1))
L.hands_on_back(_SAG)
L.lotus(_SAG, first='R', flex=40.0, front=CHEST)
GHOST = L.diff(_SAG, LOTUS)

GUIDES = [
    {'from': (0, L.NECK_AT[1], 0.0), 'to': (0, L.NECK_AT[1], 1.2)},   # shoulders, hips and knees on one line
]

POSTURE = L.check({
    'id': 'library:urdhva-padmasana-in-sarvangasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'notice': ['breath']},
        {'label': 'Shoulderstand', 'pose': UP, 'hold': 5, 'palms': 'back', 'notice': ['neck', 'shoulders']},
        {'label': 'Right foot in', 'pose': HALF, 'hold': 4, 'palms': 'back', 'view': 'quarter',
         'frame': HALF_FRAME, 'notice': ['hips']},
        {'label': 'Lotus up', 'pose': LOTUS, 'hold': 12, 'palms': 'back', 'view': 'front',
         'frame': L.INVERTED_LOTUS_FRAME, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['hips', 'neck', 'shoulders', 'breath']},
        {'label': 'Left foot out', 'pose': HALF, 'hold': 3, 'palms': 'back', 'view': 'quarter',
         'frame': HALF_FRAME, 'notice': ['hips']},
        {'label': 'Shoulderstand', 'pose': UP, 'hold': 3, 'palms': 'back', 'notice': ['neck', 'shoulders']},
        {'label': 'Slide down', 'pose': L.rolling_down(), 'hold': 5, 'notice': ['core', 'lower-back']},
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 5, 'notice': ['neck', 'breath']},
    ],
})
