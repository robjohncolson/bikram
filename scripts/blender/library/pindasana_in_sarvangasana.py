"""
Pindasana in Sarvangasana (the folded lotus in the shoulderstand) —
library sheet, live figure only.

Up into the supported shoulderstand; the legs crossed, right foot first,
into the lotus upside down (urdhva padmasana); on an exhalation the
crossed legs fold down from the hips toward the head; back up to the
lotus; uncrossed, left foot first, to the shoulderstand; and down.

The fold stops short of the book's: the crossed feet meet the belly, so
the knees stay about 44 cm from the head rather than resting on it
(`_lotus.PINDA_FLEX`). Shape from the book's photograph; the stages are
ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lotus', Path(__file__).resolve().parent / '_lotus.py')
LT = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LT)
L = LT.L
L.begin('pindasana_in_sarvangasana')

UP = L.shoulderstand()
HALF = LT.half_up()
LOTUS = LT.lotus_up()
PINDA = LT.pinda()

HALF_FRAME = {'center_z': 0.8, 'scale': 1.9}   # one leg still straight up (urdhva_padmasana_in_sarvangasana.py's)
FOLD_FRAME = {'center_z': 0.5, 'scale': 1.5}   # the folded legs reach out over the face

POSTURE = L.check({
    'id': 'library:pindasana-in-sarvangasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Lie down', 'pose': L.LIE, 'hold': 4, 'notice': ['breath']},
        {'label': 'Shoulderstand', 'pose': UP, 'hold': 4, 'palms': 'back', 'notice': ['neck', 'shoulders']},
        {'label': 'Right foot in', 'pose': HALF, 'hold': 3, 'palms': 'back', 'view': 'quarter',
         'frame': HALF_FRAME, 'notice': ['hips']},
        {'label': 'Lotus up', 'pose': LOTUS, 'hold': 4, 'palms': 'back', 'view': 'quarter',
         'frame': L.INVERTED_LOTUS_FRAME, 'notice': ['hips', 'neck']},
        {'label': 'Fold down', 'pose': PINDA, 'hold': 12, 'palms': 'back', 'frame': FOLD_FRAME,
         'notice': ['neck', 'upper-back', 'lower-back', 'breath']},
        {'label': 'Lotus up', 'pose': LOTUS, 'hold': 3, 'palms': 'back', 'view': 'quarter',
         'frame': L.INVERTED_LOTUS_FRAME, 'notice': ['hips']},
        {'label': 'Left foot out', 'pose': HALF, 'hold': 3, 'palms': 'back', 'view': 'quarter',
         'frame': HALF_FRAME, 'notice': ['hips']},
        {'label': 'Slide down', 'pose': L.rolling_down(), 'hold': 5, 'notice': ['core', 'lower-back', 'breath']},
    ],
})
