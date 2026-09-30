"""
Parsva Pindasana in Sarvangasana (the folded lotus to the side, in the
shoulderstand) — library sheet, live figure only.

From the supported shoulderstand the legs cross into the lotus upside
down, right foot first, and fold down over the face (pindasana); the hips
turn and the folded legs go down to the right side; back through the
centre to the lotus, and uncrossed, left foot first, to the shoulderstand
the sheet began in. Eight stages hold one side: the left side is the step
left unbound on the page.

The knees come down only part way (`_lotus.PARSVA`): the knee nearer the
floor stops about 27 cm above it, the other stays up over the head —
the book itself says the knee by the ear reaches the floor only after
long practice. Shape from the book's photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lotus', Path(__file__).resolve().parent / '_lotus.py')
LT = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LT)
L = LT.L
L.begin('parsva_pindasana_in_sarvangasana')

UP = L.shoulderstand()
HALF = LT.half_up()
LOTUS = LT.lotus_up()
PINDA = LT.pinda()
RIGHT = LT.parsva_pinda('R')

HALF_FRAME = {'center_z': 0.8, 'scale': 1.9}   # one leg still straight up (urdhva_padmasana_in_sarvangasana.py's)
FOLD_FRAME = {'center_z': 0.5, 'scale': 1.5}

POSTURE = L.check({
    'id': 'library:parsva-pindasana-in-sarvangasana',
    'position': {'start': 'supine', 'end': 'supine'},
    'view': 'side',
    'frame': L.SUPINE_FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Shoulderstand', 'pose': UP, 'hold': 4, 'palms': 'back', 'notice': ['neck', 'shoulders']},
        {'label': 'Right foot in', 'pose': HALF, 'hold': 3, 'palms': 'back', 'view': 'quarter',
         'frame': HALF_FRAME, 'notice': ['hips']},
        {'label': 'Lotus up', 'pose': LOTUS, 'hold': 3, 'palms': 'back', 'view': 'quarter',
         'frame': L.INVERTED_LOTUS_FRAME, 'notice': ['hips', 'neck']},
        {'label': 'Fold down', 'pose': PINDA, 'hold': 4, 'palms': 'back', 'frame': FOLD_FRAME,
         'notice': ['neck', 'upper-back']},
        {'label': 'Knees to the right', 'pose': RIGHT, 'hold': 12, 'palms': 'back', 'view': 'front',
         'frame': FOLD_FRAME, 'notice': ['lower-back', 'shoulders', 'neck', 'breath']},
        {'label': 'Centre', 'pose': PINDA, 'hold': 3, 'palms': 'back', 'frame': FOLD_FRAME, 'notice': ['neck']},
        {'label': 'Lotus up', 'pose': LOTUS, 'hold': 3, 'palms': 'back', 'view': 'quarter',
         'frame': L.INVERTED_LOTUS_FRAME, 'notice': ['hips']},
        {'label': 'Left foot out', 'pose': HALF, 'hold': 3, 'palms': 'back', 'view': 'quarter',
         'frame': HALF_FRAME, 'notice': ['hips']},
    ],
})
