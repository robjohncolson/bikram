"""
Parsva Pindasana in Sarvangasana (the folded lotus to the side, in the
shoulderstand) — library sheet, live figure only.

From the supported shoulderstand the legs cross into the lotus upside
down, right foot first, and fold down over the face (pindasana); the hips
turn and the folded legs go down to the right side; back through the
centre to the lotus, and uncrossed, left foot first, to the shoulderstand
the sheet began in. Both lateral sides are shown in the first crossing. Reversing the
crossing needs a separate safe entry and exit beyond the twelve-stage cap.

The hips turn a little past a quarter turn and the folded legs go down
to the right (`_lotus.PARSVA`): the LEFT knee comes round beside the head
on the right, the right knee lies back by the right shoulder, as the book
has them (its left knee by the right ear). On the right both knees stop about 34 cm off
the mat; the left fold is shallower so its foot clears the supporting hand — the book itself says the knee by the ear reaches the floor only
after long practice. Shape from the book's photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lotus', Path(__file__).resolve().parent / '_lotus.py')
LT = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LT)
L = LT.L
L.begin('parsva-pindasana-in-sarvangasana', skeleton='library')

_ispec = importlib.util.spec_from_file_location('_library_inversion', Path(__file__).resolve().parent / '_inversion.py')
I = importlib.util.module_from_spec(_ispec)
_ispec.loader.exec_module(I)
I.configure(L)

UP = L.shoulderstand()
HALF = LT.half_up()
LOTUS = LT.lotus_up()
PINDA = LT.pinda()
RIGHT = LT.parsva_pinda('R')
LEFT = LT.pinda(up=L.n((0.15, -0.1, 1)), hips=(110, 0), flex=100.0)
# Turn the supporting fingers away from the crossed foot while the palm stays on the back.
L.palms_to_back(LEFT, (0, 1, 0), f=1.0, theta=20.0, fingers=-0.3)

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
        {'label': 'Knees to the left', 'pose': LEFT, 'hold': 12, 'palms': 'back', 'view': 'front', 'frame': FOLD_FRAME},
        {'label': 'Centre', 'pose': PINDA, 'hold': 3, 'palms': 'back', 'frame': FOLD_FRAME},
        {'label': 'Lotus up', 'pose': LOTUS, 'hold': 3, 'palms': 'back', 'view': 'quarter',
         'frame': L.INVERTED_LOTUS_FRAME, 'notice': ['hips']},
        {'label': 'Left foot out', 'pose': HALF, 'hold': 3, 'palms': 'back', 'view': 'quarter',
         'frame': HALF_FRAME, 'notice': ['hips']},
    ],
})
